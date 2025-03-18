import mongoose from "mongoose";

const PointSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

const StrokeSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // ✅ 누가 그렸는지 저장
  points: [PointSchema], // ✅ 하나의 선(stroke)에 여러 좌표 저장
});

const DrawingSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // ✅ 유저 ID
  strokes: [StrokeSchema], // ✅ 여러 개의 선(stroke) 저장 가능
});

const Drawing = mongoose.model("Drawing", DrawingSchema);

export default Drawing;
