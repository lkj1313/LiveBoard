import { Server } from "socket.io";
import Drawing from "./models/Drawing.js"; // ✅ MongoDB 모델 가져오기

const socketSetup = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log(`✅ 사용자 연결됨: ${socket.id}`);

    try {
      // ✅ 기존 저장된 그림 불러오기 (null 값 제거)
      const savedDrawings = await Drawing.find();

      if (savedDrawings.length > 0) {
        console.log("✅ 서버에서 기존 그림 전송:", savedDrawings);

        // 🔥 `null` 값이 포함된 `strokes` 필터링 후 전송
        const filteredDrawings = savedDrawings.map((doc) => ({
          userId: doc.userId,
          strokes: doc.strokes.filter((stroke) => stroke !== null), // ✅ `null` 제거
        }));

        socket.emit(
          "loadDrawings",
          filteredDrawings.flatMap((doc) => doc.strokes)
        );
      }
    } catch (error) {
      console.error("❌ 그림 불러오기 실패:", error);
    }

    // ✅ 클라이언트가 그림을 그릴 때
    socket.on("draw", async (data) => {
      console.log("🎨 Received draw data:", JSON.stringify(data, null, 2));

      if (
        !data ||
        !data.userId ||
        !Array.isArray(data.strokes) ||
        data.strokes.length === 0
      ) {
        console.error("❌ 잘못된 데이터:", data);
        return;
      }

      try {
        // ✅ `null` 값을 포함하지 않는 strokes만 저장
        const validStrokes = data.strokes.filter((stroke) => stroke !== null);

        const updatedDrawing = await Drawing.findOneAndUpdate(
          { userId: data.userId },
          { $push: { strokes: { $each: validStrokes } } },
          { new: true, upsert: true }
        );

        if (updatedDrawing) {
          console.log("✅ 그림이 데이터베이스에 저장됨.");
          socket.broadcast.emit("draw", {
            userId: data.userId,
            strokes: validStrokes,
          });
        }
      } catch (error) {
        console.error("❌ 그림 저장 실패:", error);
      }
    });

    // ✅ 특정 좌표에 해당하는 `stroke` 제거 (null 데이터 포함 시 제거)
    socket.on("erase", async (data) => {
      const { userId, x, y } = data;
      console.log("🧹 서버에서 지우기 요청 수신:", x, y);

      try {
        const updatedDrawing = await Drawing.findOneAndUpdate(
          { userId },
          {
            $pull: {
              strokes: {
                $or: [
                  {
                    points: {
                      $elemMatch: {
                        x: { $gte: x - 10, $lte: x + 10 },
                        y: { $gte: y - 10, $lte: y + 10 },
                      },
                    },
                  },
                  { points: null }, // ✅ `null` 값이 포함된 stroke 제거
                ],
              },
            },
          },
          { new: true }
        );

        io.emit("erase", { userId, x, y });
      } catch (error) {
        console.error("❌ 지우기 실패:", error);
      }
    });

    // ✅ 특정 유저의 전체 그림 삭제 (null 제거)
    socket.on("clear", async (data) => {
      const { userId } = data;

      try {
        if (!userId) {
          console.error("❌ 잘못된 요청: userId 없음");
          return;
        }

        await Drawing.findOneAndUpdate(
          { userId },
          { $set: { strokes: [] } }, // ✅ 해당 유저의 모든 stroke 삭제
          { new: true }
        );

        io.emit("clear", { userId });
        console.log(`🧹 ${userId}의 모든 그림 삭제 완료`);
      } catch (error) {
        console.error("❌ 전체 지우기 실패:", error);
      }
    });

    // ✅ 사용자 연결 해제
    socket.on("disconnect", () => {
      console.log(`❌ 사용자 연결 해제: ${socket.id}`);
    });
  });

  return io;
};

export default socketSetup;
