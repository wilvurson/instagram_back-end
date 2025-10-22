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

PostSchema.virtual("comments", {
  ref: "PostComment",
  localField: "_id",
  foreignField: "post",
});

PostSchema.virtual("likes", {
  ref: "PostLike",
  localField: "_id",
  foreignField: "post",
});

PostSchema.set("toObject", { virtuals: true });
PostSchema.set("toJSON", { virtuals: true });

export const PostModel = mongoose.model("Post", PostSchema);