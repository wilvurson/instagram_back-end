import bcrypt from "bcrypt";
import express from "express";
import { UserModel } from "../models/user.model.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

router.post("/signup", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Body required" });
  }
  const body = req.body;
  if (!body.credential) {
    return res.status(400).send({ message: "Credential required" });
  }
  if (!body.password) {
    return res.status(400).send({ message: "Password required" });
  }
  if (!body.fullname) {
    return res.status(400).send({ message: "Fullname required" });
  }
  if (!body.username) {
    return res.status(400).send({ message: "Username required" });
  }

  let email = null;
  let phone = null;

  if (emailRegex.test(body.credential)) {
    email = body.credential;
  }
  if (!isNaN(Number(body.credential))) {
    phone = body.credential;
  }

  if (!email && !phone) {
    return res
      .status(400)
      .send({ message: "Credential must be Email or Phone number!" });
  }

  if (email) {
    const existingUserByEmail = await UserModel.findOne({ email: email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .send({ message: "User with this email already exists" });
    }
  }

  if (phone) {
    const existingUserByPhone = await UserModel.findOne({ phone: phone });
    if (existingUserByPhone) {
      return res
        .status(400)
        .send({ message: "User with this phone already exists" });
    }
  }

  if (body.password.length < 8) {
    return res
      .status(400)
      .send({ message: "Password must be greater than 8 characters" });
  }

  if (passwordRegex.test(body.password)) {
    return res.status(400).send({
      message:
        "Password must include Upper and Lowercase letters and digit with special characters",
    });
  }

  const existingUser = await UserModel.findOne({ username: body.username });

  if (existingUser) {
    return res.status(400).send({
      message: `User with username "${body.username}" already exists`,
    });
  }

  const hashedPassword = bcrypt.hashSync(body.password, 10);

  const newUser = {
    fullname: body.fullname,
    username: body.username,
    email,
    phone,
    password: hashedPassword,
  };

  const user = new UserModel(newUser);
  await user.save();

  return res.send({ message: "Welcome to instagram", body: user });
});

router.post("/signin", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Body required" });
  }
  const body = req.body;
  if (!body.credential) {
    return res.status(400).send({ message: "Credential required" });
  }
  if (!body.password) {
    return res.status(400).send({ message: "Password required" });
  }

  const user = await UserModel.findOne({
    $or: [
      { email: body.credential },
      { phone: body.credential },
      { username: body.credential },
    ],
  });

  if (!user) {
    return res.status(400).send({ message: "Wrong credentials!" });
  }

  const isCorrectPassword = bcrypt.compareSync(body.password, user.password);

  if (!isCorrectPassword) {
    return res.status(400).send({ message: "Wrong password!" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return res.send({ message: "You are signed in", body: token });
});

router.get("/me", async (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "You are not authenticated" });
  }
  const token = authorization.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload.id;
    const user = await UserModel.findById(id).populate("posts");
    if (!user) {
      return res.status(403).send({ message: "Session user not found!" });
    }

    return res.status(200).send({ message: "Success", body: user });
  } catch (error) {
    console.log("HI");
    return res
      .status(401)
      .send({ message: "Unsuccess", body: JSON.stringify(error, null, 2) });
  }
});

export default router;
