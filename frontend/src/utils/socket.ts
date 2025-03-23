import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
  autoConnect: false, // 🔥 자동 연결 해제
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect(); // ✅ 명시적으로 연결 호출
  }
};
