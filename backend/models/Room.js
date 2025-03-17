import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 방 이름
  image: { type: String, default: "/uploads/default-room.jpg" }, // 기본 이미지 URL
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 방장 (User 모델 참조)
  createdAt: { type: Date, default: Date.now }, // 방 생성 날짜
});

const Room = mongoose.model("Room", RoomSchema);

export default Room;
