import express from "express";
import { UserModel } from "../models/user.model.mjs";
import { UserFollowModel } from "../models/user-follow.model.mjs";
import { authMiddleware } from "../middlewares/auth.middleware.mjs";
import { nanoid } from "nanoid";

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await UserModel.find().select("_id username fullname createdAt");
  return res.status(200).send(users);
});

router.get("/:username", async (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res.status(400).send({ message: "Username must be present" });
  }

  const user = await UserModel.findOne({ username })
    .select("_id username fullname createdAt bio")
    .populate({
      path: "followers",
      populate: { path: "createdBy", select: "_id username fullname" },
    })
    .populate({
      path: "followings",
      populate: { path: "user", select: "_id username fullname" },
    });

  if (!user) {
    return res.status(404).send({ message: `User with ${username} not found!` });
  }

  return res.status(200).send(user);
});

router.post("/:username/follow", authMiddleware, async (req, res) => {
  const username = req.params.username;

  const targetUser = await UserModel.findOne({ username });
  if (!targetUser) {
    return res.status(404).send({ message: "User not found!" });
  }

  const existingFollow = await UserFollowModel.findOne({
    user: targetUser._id,
    createdBy: req.user._id,
  });

  if (!existingFollow) {
    await UserFollowModel.create({
      _id: nanoid(),
      user: targetUser._id,
      createdBy: req.user._id,
    });

    return res
      .status(200)
      .send({ message: "Followed successfully", isFollowing: true });
  }

  await UserFollowModel.findByIdAndDelete(existingFollow._id);
  return res
    .status(200)
    .send({ message: "Unfollowed successfully", isFollowing: false });
});

export default router;
