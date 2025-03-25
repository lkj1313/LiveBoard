import ChatMessage from "../models/ChatMessage.js";

export const chatSocketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("chatMessage", async ({ roomId, user, message }) => {
      console.log("💬 채팅 데이터:", roomId, user, message);
      const chat = await ChatMessage.create({ roomId, user, message });
      io.to(roomId).emit("chatMessage", {
        user,
        message,
        timestamp: chat.timestamp,
      });
    });
  });
};
