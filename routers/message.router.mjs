import express from "express";
import { MessageModel } from "../models/message.model.mjs";
import { MessageCommentModel } from "../models/message-comment.model.mjs";
import { MessageLikeModel } from "../models/message-like.model.mjs";
import { MessageShareModel } from "../models/message-share.model.mjs";
import { MessageSaveModel } from "../models/message-save.model.mjs";
import { nanoid } from "nanoid";
import { authMiddleware } from "../middlewares/auth.middleware.mjs";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await MessageModel.find().populate([
    {
      path: "createdBy",
    },
    {
      path: "comments",
      options: { strictPopulate: false },
      populate: {
        path: "createdBy",
        model: "User",
      },
    },
    {
      path: "likes",
      options: { strictPopulate: false },
      populate: {
        path: "createdBy",
        model: "User",
      },
    },
    {
      path: "shares",
      options: { strictPopulate: false },
      populate: {
        path: "createdBy",
        model: "User",
      },
    },
    {
      path: "saves",
      options: { strictPopulate: false },
      populate: {
        path: "createdBy",
        model: "User",
      },
    },
  ]);
  return res.send(result);
});

router.get("/:id", async (req, res) => {
  const messageId = req.params.id;
  const message = await MessageModel.findById(messageId);
  if (!message) {
    return res.status(404).send({ message: "Message not found!" });
  }
  return res.send(message);
});

router.post("/", authMiddleware, async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Body required!" });
  }
  const { text } = req.body;

  if (!text) {
    return res.status(400).send({ message: "text required!" });
  }
  const message = await MessageModel.create({
    _id: nanoid(),
    text,
    createdBy: req.user._id,
  });
  return res.send({ message: "Message created successfully", body: message });
});

router.delete("/:id", async (req, res) => {
  const messageId = req.params.id;
  const message = await MessageModel.findById(messageId);
  if (!message) {
    return res.status(404).send({ message: "Message not found!" });
  }
  await MessageModel.deleteOne({ _id: messageId });
  return res.send({ message: "Successfully deleted message" });
});

router.put("/:id", async (req, res) => {
  const messageId = req.params.id;
  const message = await MessageModel.findById(messageId);
  if (!message) {
    return res.status(404).send({ message: "Message not found!" });
  }
  if (!req.body) {
    return res.status(400).send({ message: "Body required!" });
  }
  const { text } = req.body;

  await MessageModel.updateOne({ _id: messageId }, { text });

  return res.send({
    message: "Successfully updated message",
    body: { ...message, text },
  });
});

router.post("/:messageId/comments", authMiddleware, async (req, res) => {
  const messageId = req.params.messageId;

  const message = await MessageModel.findById(messageId);
  if (!message) {
    return res.status(404).send({ message: "Message not found!" });
  }

  if (!req.body) {
    return res.status(400).send({ message: "Body required!" });
  }

  const { text } = req.body;

  if (text === "") {
    return res.status(400).send({ message: "Text can't be empty!" });
  }

  let newComment = await MessageCommentModel.create({
    _id: nanoid(),
    createdBy: req.user._id,
    message: message._id,
    text,
  });

  newComment = await newComment.populate("createdBy");

  return res.status(200).send(newComment);
});

router.delete(
  "/:messageId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { messageId, commentId } = req.params;

    const comment = await MessageCommentModel.findById(commentId);
    if (!comment)
      return res.status(404).send({ message: "Comment not found!" });

    if (comment.createdBy.toString() !== req.user._id) {
      return res
        .status(403)
        .send({ message: "You can only delete your own comment!" });
    }

    await MessageCommentModel.findByIdAndDelete(commentId);
    return res
      .status(200)
      .send({ message: "Comment deleted successfully", commentId });
  }
);

router.post("/:messageId/like", authMiddleware, async (req, res) => {
  const messageId = req.params.messageId;

  const message = await MessageModel.findById(messageId);
  if (!message) return res.status(404).send({ message: "Message not found!" });

  const existingLike = await MessageLikeModel.findOne({
    message: messageId,
    createdBy: req.user._id,
  });

  if (!existingLike) {
    await MessageLikeModel.create({
      _id: nanoid(),
      message: messageId,
      createdBy: req.user._id,
    });
    return res
      .status(200)
      .send({ message: "Liked successfully", isLiked: true });
  }

  await MessageLikeModel.findByIdAndDelete(existingLike._id);
  return res.status(200).send({ message: "Like removed", isLiked: false });
});

router.post("/:messageId/share", authMiddleware, async (req, res) => {
  const messageId = req.params.messageId;

  const message = await MessageModel.findById(messageId);
  if (!message) return res.status(404).send({ message: "Message not found!" });

  const existingShare = await MessageShareModel.findOne({
    message: messageId,
    createdBy: req.user._id,
  });

  if (!existingShare) {
    await MessageShareModel.create({
      _id: nanoid(),
      message: messageId,
      createdBy: req.user._id,
    });
    return res
      .status(200)
      .send({ message: "Shared successfully", isShared: true });
  }

  await MessageShareModel.findByIdAndDelete(existingShare._id);
  return res.status(200).send({ message: "Share removed", isShared: false });
});

router.post("/:messageId/save", authMiddleware, async (req, res) => {
  const messageId = req.params.messageId;

  const message = await MessageModel.findById(messageId);
  if (!message) return res.status(404).send({ message: "Message not found!" });

  const existingSave = await MessageSaveModel.findOne({
    message: messageId,
    createdBy: req.user._id,
  });

  if (!existingSave) {
    await MessageSaveModel.create({
      _id: nanoid(),
      message: messageId,
      createdBy: req.user._id,
    });
    return res
      .status(200)
      .send({ message: "Saved successfully", isSaved: true });
  }

  await MessageSaveModel.findByIdAndDelete(existingSave._id);
  return res.status(200).send({ message: "Save removed", isSaved: false });
});

router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    const messages = await MessageModel.find({ createdBy: user._id })
      .populate([
        {
          path: "createdBy",
          model: "User",
        },
        {
          path: "comments",
          options: { strictPopulate: false },
          populate: { path: "createdBy", model: "User" },
        },
        {
          path: "likes",
          options: { strictPopulate: false },
          populate: { path: "createdBy", model: "User" },
        },
        {
          path: "shares",
          options: { strictPopulate: false },
          populate: { path: "createdBy", model: "User" },
        },
        {
          path: "saves",
          options: { strictPopulate: false },
          populate: { path: "createdBy", model: "User" },
        },
      ])
      .sort({ createdAt: -1 });

    res.status(200).send(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to fetch user's messages" });
  }
});

export default router;
