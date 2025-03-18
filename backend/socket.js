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
      // ✅ 기존 저장된 그림 불러오기
      const savedDrawings = await Drawing.find();
      if (savedDrawings.length > 0) {
        console.log("✅ 서버에서 기존 그림 전송:", savedDrawings);
        socket.emit(
          "loadDrawings",
          savedDrawings.flatMap((doc) => doc.strokes) // ✅ `strokes`만 전송
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
        // ✅ 새로운 선을 추가하는 방식 (각 선을 `strokes` 배열에 추가)
        const updatedDrawing = await Drawing.findOneAndUpdate(
          { userId: data.userId },
          { $push: { strokes: { $each: data.strokes } } }, // ✅ 새로운 선(Stroke) 추가
          { new: true, upsert: true }
        );

        if (updatedDrawing) {
          console.log("✅ 그림이 데이터베이스에 저장됨.");
          socket.broadcast.emit("draw", {
            userId: data.userId,
            strokes: data.strokes,
          });
        }
      } catch (error) {
        console.error("❌ 그림 저장 실패:", error);
      }
    });

    socket.on("erase", async (data) => {
      const { userId, x, y } = data;
      console.log("🧹 서버에서 지우기 요청 수신:", x, y);

      try {
        // 해당 좌표를 포함하는 stroke 전체 삭제
        const updatedDrawing = await Drawing.findOneAndUpdate(
          { userId },
          {
            $pull: {
              strokes: {
                points: {
                  $elemMatch: {
                    x: { $gte: x - 10, $lte: x + 10 },
                    y: { $gte: y - 10, $lte: y + 10 },
                  },
                },
              },
            },
          },
          { new: true }
        );

        io.emit("erase", { userId, x, y }); // ✅ 클라이언트에 지우기 반영
      } catch (error) {
        console.error("❌ 지우기 실패:", error);
      }
    });

    // ✅ 특정 유저의 전체 그림 삭제
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

        io.emit("clear", { userId }); // ✅ 클라이언트에 해당 유저의 그림 삭제 알림
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
