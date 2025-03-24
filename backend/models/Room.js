import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 방 이름
  image: {
    type: String,
    default:
      "https://firebasestorage.googleapis.com/v0/b/liveboard-24cba.firebasestorage.app/o/rooms%2Fwhiteboard.webp-1742811168081?alt=media&token=4f386f73-2bf8-421a-9df2-1fb9ebf92b80",
  }, // 기본 이미지 URL
  backgroundUrl: { type: String }, // PDF/이미지 배경 URL
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 방장 (User 모델 참조)
  createdAt: { type: Date, default: Date.now }, // 방 생성 날짜
});

const Room = mongoose.model("Room", RoomSchema);

export default Room;
