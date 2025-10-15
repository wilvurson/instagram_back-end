import mongoose from "mongoose";
import { nanoid } from "nanoid";

const PostSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    description: { type: String },
    imageUrl: { type: String },
    createdBy: { type: String, ref: "User" },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export const PostModel = mongoose.model("Post", PostSchema);