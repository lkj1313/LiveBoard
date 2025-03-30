import express from "express";

import Room from "../models/Room.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// 방 생성 API (파일 업로드 포함)
router.post("/create", verifyToken, async (req, res) => {
  const { name, image } = req.body;
  const owner = req.user.userId;

  try {
    const existing = await Room.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "이미 존재하는 방입니다." });
    }

    const room = new Room({
      name,
      image,
      owner,
    });

    await room.save();
    res.status(201).json({ message: "방 생성 성공", room });
  } catch (err) {
    res.status(500).json({ error: "서버 오류" });
  }
});
// 방 목록 조회 API (모든 방 정보 불러오기)
router.get("/rooms", verifyToken, async (req, res) => {
  try {
    // 모든 방 데이터를 조회
    const rooms = await Room.find();

    res.status(200).json({ rooms }); // 방 목록 반환
  } catch (error) {
    res.status(500).json({ error: "서버 오류" });
  }
});

//  배경 이미지/PDF 저장용
router.put("/:roomId/background", verifyToken, async (req, res) => {
  const { roomId } = req.params;
  const { backgroundUrl } = req.body;

  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { backgroundUrl },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to update background" });
  }
});
// canvasImage 저장용
router.post("/:roomId/canvasImage", verifyToken, async (req, res) => {
  const { roomId } = req.params;
  const { id, url, x, y } = req.body;

  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      {
        $push: {
          canvasImages: {
            id,
            url,
            x,
            y,
          },
        },
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ success: true, image: { id, url, x, y } });
  } catch (err) {
    console.error("이미지 저장 실패:", err);
    res.status(500).json({ error: "Failed to save image" });
  }
});

// 이미지 좌표 바꾸기
router.put("/:roomId/image/:imageId", verifyToken, async (req, res) => {
  const { roomId, imageId } = req.params;
  const { x, y } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // 이미지 찾고 위치 업데이트
    const image = room.canvasImages.find((img) => img.id === imageId);
    if (!image) return res.status(404).json({ message: "Image not found" });

    image.x = x;
    image.y = y;

    await room.save();

    res.status(200).json({ message: "Image position updated", image });
  } catch (error) {
    console.error("❌ 이미지 위치 업데이트 실패:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// 특정 방 정보 조회
router.get("/:roomId", verifyToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to load room" });
  }
});

// 이미지 삭제 API
router.delete("/:roomId/image/:imageId", verifyToken, async (req, res) => {
  const { roomId, imageId } = req.params;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.canvasImages = room.canvasImages.filter((img) => img.id !== imageId);
    await room.save();

    res.status(200).json({ message: "Image deleted" });
  } catch (error) {
    console.error("❌ 이미지 삭제 실패:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
