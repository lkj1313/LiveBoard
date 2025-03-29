import Drawing from "../models/Drawing.js";
import Room from "../models/Room.js";

// ✅ 닉네임 목록 추적용 (roomId → [{ socketId, nickname }])
const roomUsers = new Map();

export const canvasSocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ 클라이언트 연결됨:", socket.id);

    // ✅ join 이벤트 (roomId + nickname 전달받기)
    socket.on("join", async ({ roomId, nickname }) => {
      socket.join(roomId);
      console.log(`🚪 ${socket.id} joined room ${roomId}`);

      // 💾 닉네임 저장
      const users = roomUsers.get(roomId) || [];
      roomUsers.set(roomId, [...users, { socketId: socket.id, nickname }]);

      // 다른 사람에게 입장 알림
      socket.to(roomId).emit("userJoin", nickname);

      // 모든 유저에게 현재 유저 리스트 전송
      io.to(roomId).emit(
        "userList",
        roomUsers.get(roomId).map((u) => u.nickname)
      );

      // 기존 선 불러오기
      try {
        // 🔹 1. strokes (from Drawing)
        const drawing = await Drawing.findOne({ roomId });
        if (drawing) {
          socket.emit("loadDrawings", drawing.strokes);
        }

        // 🔹 2. canvasImages (from Room)
        const room = await Room.findById(roomId);
        if (room?.canvasImages?.length > 0) {
          socket.emit("loadCanvasImages", room.canvasImages);
        }
      } catch (error) {
        console.error("❌ 그림 불러오기 실패:", error);
      }
    });

    // ✅ 그리기
    socket.on("draw", async ({ roomId, stroke }) => {
      try {
        await Drawing.findOneAndUpdate(
          { roomId },
          { $push: { strokes: stroke } },
          { upsert: true }
        );
        socket.to(roomId).emit("draw", stroke);
      } catch (error) {
        console.error("❌ 그림 저장 실패:", error);
      }
    });
    // 해당 방의 다른 유저들에게 이미지 위치 이동 알림
    socket.on("moveImage", ({ roomId, imageId, x, y }) => {
      socket.to(roomId).emit("moveImage", { imageId, x, y });
    });
    // ✅ 지우기
    socket.on("erase", async ({ roomId, userId, x, y }) => {
      try {
        await Drawing.updateOne(
          { roomId },
          {
            $pull: {
              strokes: {
                userId,
                points: {
                  $elemMatch: {
                    x: { $gte: x - 10, $lte: x + 10 },
                    y: { $gte: y - 10, $lte: y + 10 },
                  },
                },
              },
            },
          }
        );
        socket.to(roomId).emit("erase", { userId, x, y });
      } catch (error) {
        console.error("❌ 지우기 실패:", error);
      }
    });

    // ✅ 전체 지우기
    socket.on("clear", async ({ roomId, userId }) => {
      try {
        await Drawing.updateOne({ roomId }, { $pull: { strokes: { userId } } });
        socket.to(roomId).emit("clear", { userId });
      } catch (error) {
        console.error("❌ 전체 삭제 실패:", error);
      }
    });

    // ✅ 되돌리기(교체)
    socket.on("replaceStrokes", async ({ roomId, strokes }) => {
      try {
        const drawing = await Drawing.findOne({ roomId });
        if (!drawing) return;

        const userId = strokes[0]?.userId;
        if (!userId) return;

        // 기존 strokes 중에서 해당 유저가 그린 것만 교체
        const updatedStrokes = [
          ...drawing.strokes.filter((s) => s.userId !== userId), // 다른 사람 것 유지
          ...strokes, // 내 것만 교체
        ];

        await Drawing.updateOne(
          { roomId },
          { $set: { strokes: updatedStrokes } }
        );

        // 모든 유저에게 동기화
        io.to(roomId).emit("loadDrawings", updatedStrokes);
      } catch (error) {
        console.error("replaceStrokes error:", error);
      }
    });
    // ✅ 이미지 삽입 (실시간 공유)
    socket.on("addImage", ({ roomId, id, url, x, y }) => {
      socket.to(roomId).emit("newImage", { id, url, x, y });
      console.log("삽입완료");
    });
    // ✅ 연결 종료 시 유저 목록에서 제거
    socket.on("disconnect", () => {
      for (const [roomId, users] of roomUsers.entries()) {
        const leavingUser = users.find((u) => u.socketId === socket.id); // 🟡 누가 나갔는지 찾음
        const updated = users.filter((u) => u.socketId !== socket.id);

        if (updated.length === 0) {
          roomUsers.delete(roomId);
        } else {
          roomUsers.set(roomId, updated);
        }

        // ✅ 퇴장 알림 보내기
        if (leavingUser) {
          io.to(roomId).emit("userLeave", leavingUser.nickname);
          io.to(roomId).emit(
            "userList",
            updated.map((u) => u.nickname)
          );
        }
      }
    });
  });
};
