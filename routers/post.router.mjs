import express from "express";
import { PostModel } from "../models/post.model.mjs";
import { PostCommentModel } from "../models/post-comment.model.mjs";
import { PostLikeModel } from "../models/post-like.model.mjs";
import { PostShareModel } from "../models/post-share.model.mjs";
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

router.post("/:postId/like", authMiddleware, async (req, res) => {
  const postId = req.params.postId;

  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).send({ message: "Post not found!" });
  }
  console.log({ postId, userId: req.user._id });

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

    return res
      .status(200)
      .send({ message: "Амжилттай лайк дарлаа", isLiked: true });
  }

  await PostLikeModel.findOneAndDelete(existingLike._id);
  return res
    .status(200)
    .send({ message: "Амжилттай лайкаа буцаалаа", isLiked: false });
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

// Get posts of a specific user by username
router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    // find posts created by that user
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
      ])
      .sort({ createdAt: -1 });

    res.status(200).send(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to fetch user's posts" });
  }
});



export default router;
