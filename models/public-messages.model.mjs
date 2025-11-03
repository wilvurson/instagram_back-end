import mongoose from "mongoose";
import { nanoid } from "nanoid";

const PublicMessageSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    content: { type: String, required: true },
    user: { type: String, ref: "User", required: true }, // the profile owner
    author: { type: String, ref: "User", required: true }, // who posted the message
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

PublicMessageSchema.set("toObject", { virtuals: true });
PublicMessageSchema.set("toJSON", { virtuals: true });

export const PublicMessageModel = mongoose.model("PublicMessage", PublicMessageSchema);
