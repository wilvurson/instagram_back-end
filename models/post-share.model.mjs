import mongoose from "mongoose";
import { nanoid } from "nanoid";

const PostShareSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },

    post: { type: String, ref: "Post" },
    createdBy: { type: String, ref: "User" },

    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export const PostShareModel = mongoose.model("PostShare", PostShareSchema);