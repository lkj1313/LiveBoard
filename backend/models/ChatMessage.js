import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  user: {
    userId: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model("ChatMessage", ChatMessageSchema);
