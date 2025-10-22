
import express from "express";
import { UserModel } from "../models/user.model.mjs";

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
  const user = await UserModel.findOne({ username: username }).select("_id username fullname createdAt");
  if (!user) {
    return res.status(404).send({ message: `User with ${username} not found!` });
  }
  return res.status(200).send(user);
});

export default router;
