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
  const user = await UserModel.findOne({ username: username }).select("_id username fullname createdAt").populate("followers followings");
  if (!user) {
    return res.status(404).send({ message: `User with ${username} not found!` });
  }
  return res.status(200).send(user);
});

router.post("/:username/follow", authMiddleware, async (req, res) => {
  // WHOM
  const username = req.params.username;

  const user = await UserModel.findOne({ username: username });
  if (!user) {
    return res.status(404).send({ message: "User not found!" });
  }

  const existingFollow = await UserFollowModel.findOne({ user: user._id, createdBy: req.user._id });

  if (!existingFollow) {
    await UserFollowModel.create({
      _id: nanoid(),
      user: user._id,
      createdBy: req.user._id,
    });

    return res.status(200).send({ message: "Амжилттай фоллов хийлээ", isLiked: true });
  }

  await UserFollowModel.findOneAndDelete(existingFollow._id);
  return res.status(200).send({ message: "Амжилттай фоллов буцаалаа", isLiked: false });
});

export default router;