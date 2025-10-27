import mongoose from "mongoose";
import { nanoid } from "nanoid";

const UserFollowSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },

    user: { type: String, ref: "User" }, // WHOM
    createdBy: { type: String, ref: "User" }, // WHO

    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export const UserFollowModel = mongoose.model("UserFollow", UserFollowSchema);