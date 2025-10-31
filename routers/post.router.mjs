import express from "express";
import { PostModel } from "../models/post.model.mjs";
import { PostCommentModel } from "../models/post-comment.model.mjs";
import { PostLikeModel } from "../models/post-like.model.mjs";
import { PostShareModel } from "../models/post-share.model.mjs";
import { PostSaveModel } from "../models/post-save.model.mjs";
import { nanoid } from "nanoid";
import { authMiddleware } from "../middlewares/auth.middleware.mjs";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await PostModel.find().populate([
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
  const postId = req.params.id;
  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).send({ message: "Post not found!" });
  }
  return res.send(post);
});

router.post("/", authMiddleware, async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Body required!" });
  }
  const { description, imageUrl } = req.body;

  if (!description) {
    return res.status(400).send({ message: "description required!" });
  }
  if (!imageUrl) {
    return res.status(400).send({ message: "imageUrl required!" });
  }
  const post = await PostModel.create({
    _id: nanoid(),
    description,
    imageUrl,
    createdBy: req.user._id,
  });
  return res.send({ message: "Post created successfully", body: post });
});

router.delete("/:id", async (req, res) => {
  const postId = req.params.id;
  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).send({ message: "Post not found!" });
  }
  await PostModel.deleteOne({ _id: postId });
  return res.send({ message: "Successfully deleted post" });
});

router.put("/:id", async (req, res) => {
  const postId = req.params.id;
  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).send({ message: "Post not found!" });
  }
  if (!req.body) {
    return res.status(400).send({ message: "Body required!" });
  }
  const { description, imageUrl } = req.body;

  await PostModel.updateOne({ _id: postId }, { description, imageUrl });

  return res.send({
    message: "Successfully updated post",
    body: { ...post, description, imageUrl },
  });
});

router.post("/:postId/comments", authMiddleware, async (req, res) => {
  const postId = req.params.postId;

  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).send({ message: "Post not found!" });
  }

  if (!req.body) {
    return res.status(400).send({ message: "Body required!" });
  }

  const { text } = req.body;

  if (text === "") {
    return res.status(400).send({ message: "Text can't be empty!" });
  }

  let newComment = await PostCommentModel.create({
    _id: nanoid(),
    createdBy: req.user._id,
    post: post._id,
    text,
  });

  newComment = await newComment.populate("createdBy");

  return res.status(200).send(newComment);
});

router.delete("/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params;

  const comment = await PostCommentModel.findById(commentId);
  if (!comment) return res.status(404).send({ message: "Comment not found!" });

  if (comment.createdBy.toString() !== req.user._id) {
    return res.status(403).send({ message: "You can only delete your own comment!" });
  }

  await PostCommentModel.findByIdAndDelete(commentId);
  return res.status(200).send({ message: "Comment deleted successfully", commentId });
});

router.post("/:postId/like", authMiddleware, async (req, res) => {
  const postId = req.params.postId;

  const post = await PostModel.findById(postId);
  if (!post) return res.status(404).send({ message: "Post not found!" });

  const existingLike = await PostLikeModel.findOne({
    post: postId,
    createdBy: req.user._id,
  });

  if (!existingLike) {
    await PostLikeModel.create({
      _id: nanoid(),
      post: postId,
      createdBy: req.user._id,
    });
    return res.status(200).send({ message: "Liked successfully", isLiked: true });
  }

  await PostLikeModel.findByIdAndDelete(existingLike._id);
  return res.status(200).send({ message: "Like removed", isLiked: false });
});

router.post("/:postId/share", authMiddleware, async (req, res) => {
  const postId = req.params.postId;

  const post = await PostModel.findById(postId);
  if (!post) return res.status(404).send({ message: "Post not found!" });

  const existingShare = await PostShareModel.findOne({
    post: postId,
    createdBy: req.user._id,
  });

  if (!existingShare) {
    await PostShareModel.create({
      _id: nanoid(),
      post: postId,
      createdBy: req.user._id,
    });
    return res.status(200).send({ message: "Shared successfully", isShared: true });
  }

  await PostShareModel.findByIdAndDelete(existingShare._id);
  return res.status(200).send({ message: "Share removed", isShared: false });
});

router.post("/:postId/save", authMiddleware, async (req, res) => {
  const postId = req.params.postId;

  const post = await PostModel.findById(postId);
  if (!post) return res.status(404).send({ message: "Post not found!" });

  const existingSave = await PostSaveModel.findOne({
    post: postId,
    createdBy: req.user._id,
  });

  if (!existingSave) {
    await PostSaveModel.create({
      _id: nanoid(),
      post: postId,
      createdBy: req.user._id,
    });
    return res.status(200).send({ message: "Saved successfully", isSaved: true });
  }

  await PostSaveModel.findByIdAndDelete(existingSave._id);
  return res.status(200).send({ message: "Save removed", isSaved: false });
});

router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    const posts = await PostModel.find({ createdBy: user._id })
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

    res.status(200).send(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to fetch user's posts" });
  }
});



export default router;
