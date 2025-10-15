import mongoose from "mongoose";
import { nanoid } from "nanoid";

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    username: { type: String, required: true },
    fullname: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    phone: { type: String },

    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);
UserSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "createdBy",
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

export const UserModel = mongoose.model("User", UserSchema);