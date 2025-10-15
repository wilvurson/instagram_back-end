import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import PostRouter from "./routers/post.router.mjs";
import AuthRouter from "./routers/auth.router.mjs";

dotenv.config();

const PORT = 5500;

const app = express();

app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {

  res.send("Hi server");
  });
  app.use("/posts", PostRouter);
  app.use(AuthRouter);

app.listen(PORT, () => {
  mongoose.connect(process.env.MONGO_URL);
  console.log(`Your app is running on http://localhost:${PORT}`);
});