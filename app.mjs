import express from "express";

import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import PostRouter from "./routers/post.router.mjs";
import MessageRouter from "./routers/message.router.mjs";
import AuthRouter from "./routers/auth.router.mjs";
import UserRouter from "./routers/user.router.mjs";

dotenv.config();

const PORT = process.env.PORT || 5500;

mongoose.connect(process.env.MONGO_URL);

const app = express();

app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hi server");
});

app.use("/posts", PostRouter);
app.use("/messages", MessageRouter);
app.use("/users", UserRouter);

app.use(AuthRouter);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Your app is running on http://localhost:${PORT}`);
  });
}

export default app;
