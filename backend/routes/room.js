import express from "express";
import multer from "multer";
import path from "path";
import Room from "../models/Room.js";
import verifyToken from "../middleware/verifyToken.js";

// multer 설정: 파일 저장 위치와 파일 이름 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 파일 저장 폴더
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
  },
});

const upload = multer({ storage });

const router = express.Router();

// 방 생성 API (파일 업로드 포함)
router.post(
  "/create",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    const { name } = req.body;
    const owner = req.user.userId;

    // 파일이 없으면 기본값 설정
    const image = req.file
      ? `/uploads/${req.file.filename}`
      : "/uploads/default-room.jpg";

    try {
      // 방 이름 중복 체크
      const existingRoom = await Room.findOne({ name });
      if (existingRoom) {
        return res.status(400).json({ error: "이미 존재하는 방입니다." });
      }

      // 새 방 생성
      const newRoom = new Room({ name, image, owner });
      await newRoom.save();

      res.status(201).json({ message: "방 생성 성공", room: newRoom });
    } catch (error) {
      res.status(500).json({ error: "서버 오류" });
    }
  }
);
// 방 목록 조회 API (모든 방 정보 불러오기)
router.get("/rooms", async (req, res) => {
  try {
    // 모든 방 데이터를 조회
    const rooms = await Room.find();

    res.status(200).json({ rooms }); // 방 목록 반환
  } catch (error) {
    res.status(500).json({ error: "서버 오류" });
  }
});
export default router;
