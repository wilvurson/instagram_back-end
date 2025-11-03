import express from "express";

import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import PostRouter from "./routers/post.router.mjs";
import AuthRouter from "./routers/auth.router.mjs";
import UserRouter from "./routers/user.router.mjs";
import publicMessagesRouter from "./routes/public-messages.routes.mjs";

dotenv.config();

const PORT = 5500;

const app = express();

app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hi server");
  return (
    <div className="w-full h-full flex">
      <div>
        SERVER IS ON
      </div>
    </div>
  )
});

app.use("/posts", PostRouter);
app.use("/users", UserRouter);
app.use("/api/public-messages", publicMessagesRouter);

app.use(AuthRouter);

app.listen(PORT, () => {
  mongoose.connect(process.env.MONGO_URL);
  console.log(`Your app is running on http://localhost:${PORT}`);
});