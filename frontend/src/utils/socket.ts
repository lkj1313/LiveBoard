import { io } from "socket.io-client";

// 현재 브라우저가 로컬환경인지 체크
const isLocalhost = window.location.hostname === "localhost";

// 로컬이면 localhost로, 아니면 .env에서 설정한 서버 URL 사용
const serverUrl = isLocalhost
  ? "http://localhost:4000"
  : import.meta.env.VITE_SERVER_URL;

/// 소켓 인스턴스 생성 (자동 연결은 꺼둠)
export const socket = io(serverUrl, {
  autoConnect: false, // 명시적으로 연결할 때만 연결되도록 설정
});

// 소켓 연결 함수
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect(); // 소켓 연결 시도
  }
};
