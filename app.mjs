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

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running"); // <-- plain text, not JSX
});

// Routers
app.use("/posts", PostRouter);
app.use("/users", UserRouter);
app.use("/api/public-messages", publicMessagesRouter);
app.use(AuthRouter);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Your app is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
