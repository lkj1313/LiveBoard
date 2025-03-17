import { Server } from "socket.io";

// 소켓 서버 설정
const socketSetup = (server) => {
  const io = new Server(server);

  // 클라이언트가 연결되었을 때
  io.on("connection", (socket) => {
    console.log("A user connected");

    // 클라이언트에서 그림을 그리면, 해당 데이터를 다른 모든 클라이언트에게 전송
    socket.on("draw", (data) => {
      socket.broadcast.emit("draw", data); // 다른 모든 클라이언트에게 그림 데이터를 전송
    });

    // 연결 해제 시
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

export default socketSetup;
