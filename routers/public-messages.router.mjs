import express from "express";
import { PublicMessageModel } from "../models/public-message.model.mjs";
import { UserModel } from "../models/user.model.mjs";
import { authMiddleware } from "../middlewares/auth.middleware.mjs";
import { nanoid } from "nanoid";

const router = express.Router();

// Get all public messages for a user
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  const user = await UserModel.findOne({ username });
  if (!user) return res.status(404).send({ message: "User not found!" });

  const messages = await PublicMessageModel.find({ user: user._id })
    .populate({ path: "author", select: "_id username fullname profilePicture" })
    .sort({ createdAt: -1 });

  return res.status(200).send(messages);
});

// Post a new public message
router.post("/:username", authMiddleware, async (req, res) => {
  const { username } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "")
    return res.status(400).send({ message: "Message content required!" });

  const user = await UserModel.findOne({ username });
  if (!user) return res.status(404).send({ message: "User not found!" });

  const newMessage = await PublicMessageModel.create({
    _id: nanoid(),
    content,
    user: user._id,
    author: req.user._id,
  });

  await newMessage.populate({ path: "author", select: "_id username fullname profilePicture" });

  return res.status(201).send(newMessage);
});

// Optional: Delete a message (only author)
router.delete("/:messageId", authMiddleware, async (req, res) => {
  const { messageId } = req.params;

  const message = await PublicMessageModel.findById(messageId);
  if (!message) return res.status(404).send({ message: "Message not found!" });

  if (message.author.toString() !== req.user._id)
    return res.status(403).send({ message: "You can only delete your own messages!" });

  await PublicMessageModel.findByIdAndDelete(messageId);
  return res.status(200).send({ message: "Message deleted successfully", messageId });
});

export default router;
