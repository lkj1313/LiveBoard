// models/Drawing.ts
import mongoose from "mongoose";

const PointSchema = new mongoose.Schema({
  x: Number,
  y: Number,
});

const StrokeSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 누가 그렸는지
  nickname: String,
  points: [PointSchema], // 그 선의 점들
});

const DrawingSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // 방 구분
  strokes: [StrokeSchema], // 여러 선들
});

export default mongoose.model("Drawing", DrawingSchema);
