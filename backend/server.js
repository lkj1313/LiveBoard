import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/room.js";
import path from "path";
import { socketHandler } from "./socket.js";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app); // ✅ HTTP 서버 생성
// 현재 파일 경로를 import.meta.url로 얻기
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://lkj-live-board.vercel.app"],
    methods: ["GET", "POST"],
  },
});
// 미들웨어 설정
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://lkj-live-board.vercel.app"],
  })
);
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("✅ MongoDB Atlas 연결 성공"))
  .catch((err) => console.error("❌ MongoDB Atlas 연결 실패", err));

// ✅ Auth 라우트 추가
app.use("/auth", authRoutes);
app.use("/room", roomRoutes);
// 소켓 서버 설정
socketHandler(io);
// 서버 실행
const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`)
);
