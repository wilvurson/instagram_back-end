import express from "express";
import { PostModel } from "../models/post.model.mjs";
import { UserModel } from "../models/user.model.mjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await PostModel.find()
  .populate("createdBy", "fullname username email") 
  .sort({ createdAt: -1 });
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

router.post("/", async (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "You are not authenticated" });
  }
  const token = authorization.split(" ")[1];

  let user = null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload.id;
    user = await UserModel.findById(id);

    if (!user) {
      return res.status(403).send({ message: "Session user not found!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .send({ message: "Unsuccess", body: JSON.stringify(error, null, 2) });
  }

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
    createdBy: user._id,
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

export default router;
