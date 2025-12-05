import mongoose from "mongoose";
import { nanoid } from "nanoid";

const MessageLikeSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    message: { type: String, ref: "Message" },
    createdBy: { type: String, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MessageLikeModel = mongoose.model(
  "MessageLike",
  MessageLikeSchema
);
