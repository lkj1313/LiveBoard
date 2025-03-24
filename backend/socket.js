import { Server } from "socket.io";
import Drawing from "./models/Drawing.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ 클라이언트 연결됨:", socket.id);

    socket.on("join", async (roomId) => {
      socket.join(roomId);
      console.log(`🚪 ${socket.id} joined room ${roomId}`);

      try {
        const existing = await Drawing.findOne({ roomId });
        if (existing) {
          socket.emit("loadDrawings", existing.strokes);
        }
      } catch (error) {
        console.error("❌ 그림 불러오기 실패:", error);
      }
    });

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

        socket.to(roomId).emit("erase", { userId, x, y }); // 🔥 broadcast
      } catch (error) {
        console.error("❌ 지우기 실패:", error);
      }
    });
    socket.on("clear", async ({ roomId, userId }) => {
      try {
        await Drawing.updateOne({ roomId }, { $pull: { strokes: { userId } } });

        socket.to(roomId).emit("clear", { userId });
      } catch (error) {
        console.error("❌ 전체 삭제 실패:", error);
      }
    });
    socket.on("replaceStrokes", async ({ roomId, strokes }) => {
      await Drawing.updateOne({ roomId }, { $set: { strokes } });

      socket.to(roomId).emit("loadDrawings", strokes);
    });
  });
};
