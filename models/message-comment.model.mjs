import mongoose from "mongoose";
import { nanoid } from "nanoid";

const MessageCommentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    text: { type: String },

    message: { type: String, ref: "Message" },
    createdBy: { type: String, ref: "User" },

    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export const MessageCommentModel = mongoose.model(
  "MessageComment",
  MessageCommentSchema
);
