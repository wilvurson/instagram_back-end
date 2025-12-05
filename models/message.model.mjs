import mongoose from "mongoose";
import { nanoid } from "nanoid";

const MessageSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    text: { type: String, required: true },
    createdBy: { type: String, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model("Message", MessageSchema);
