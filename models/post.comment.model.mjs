
import mongoose from "mongoose";
import { nanoid } from "nanoid";

const PostCommentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    post: { type: String, ref: "Post" },
    comment: { type: String },                                          
  },
  {
    timestamps: true,
  }
);

const PostCommentModel = mongoose.model("PostComment", PostCommentSchema);
export { PostCommentModel };