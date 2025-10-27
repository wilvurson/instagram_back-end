import mongoose from "mongoose";
import { nanoid } from "nanoid";

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    username: { type: String, required: true },
    fullname: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    phone: { type: String },

    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);
UserSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "createdBy",
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

export const UserModel = mongoose.model("User", UserSchema);



the page
-
"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "./providers/UserProvider";
import { redirect } from "next/navigation";
import { Navbar } from "./components/Navbar";
import { Post } from "./types";
import { PostCard } from "./components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user, loading } = useContext(UserContext);

  useEffect(() => {
    fetch("https://instagram-be-seven.vercel.app/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
      });
  }, []);

  if (loading) {
    return <>Loading....</>;
  }

  if (!user) {
    return redirect("/signin");
  }

  return (
    <div>
      <Navbar />

      <div className="w-[600px] flex flex-col gap-4 mx-auto">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}

postcard
-
import { Post } from "../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Heart, Send, MessageCircle, Bookmark } from "lucide-react";
import { useAxios } from "../hooks/useAxios";
import { useUser } from "../providers/UserProvider";
import Link from "next/link";
dayjs.extend(relativeTime);

export const PostCard = ({ post }: { post: Post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [totalComments, setTotalComments] = useState(3);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [shareCount, setShareCount] = useState(post.shares.length);
  const [bookmarked, setBookmarked] = useState(false);

  const axios = useAxios();

  const [text, setText] = useState("");
  const [comments, setComments] = useState(post.comments);

  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const userId = user._id;
      setIsLiked(post.likes.some((like) => like.createdBy._id === userId));
      setIsShared(post.shares.some((share) => share.createdBy._id === userId))
    }
  }, [user]);

  const handleSubmitComment = async () => {
    const response = await axios.post(`/posts/${post._id}/comments`, { text });

    if (response.status === 200) {
      setText("");
      setComments([...comments, response.data]);
    } else {
      toast.error("Алдаа гарлаа");
    }
  };

  return (
    <div key={post._id} className="mb-8 text-white">

  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <Link href={`/${post.createdBy.username}`}>
        <div className="font-semibold hover:underline">{post.createdBy.username}</div>
      </Link>
      <div className="text-gray-500">•</div>
      <div className="text-gray-500">{dayjs(post.createdAt).fromNow()}</div>
    </div>
  </div>

  <div className="w-full bg-black flex justify-center">
    {post.imageUrl ? (
      <img
        src={post.imageUrl}
        alt="Post image"
        className="w-full max-h-[600px] object-contain bg-black"
      />
    ) : (
      <div className="text-gray-500 p-4">No image available</div>
    )}
  </div>


  <div className="flex items-center px-4 py-2">
    <div
      className="hover:opacity-70 cursor-pointer transition-transform active:scale-90"
      onClick={async () => {
        const response = await axios.post(`/posts/${post._id}/like`);
        setIsLiked(response.data.isLiked);
        setLikeCount(likeCount + (response.data.isLiked ? 1 : -1));
      }}
    >
      {isLiked ? <Heart fill="red" stroke="red" /> : <Heart stroke="white" />}
    </div>

    <div
      className="ml-4 hover:opacity-70 cursor-pointer transition-transform active:scale-90"
      onClick={() => setShowAllComments(true)}
    >
      <MessageCircle stroke="white" />
    </div>

    <div
      className="ml-4 hover:opacity-70 cursor-pointer transition-transform active:scale-90"
      onClick={async () => {
        const response = await axios.post(`/posts/${post._id}/share`);
        setIsShared(response.data.isShared);
        setShareCount(shareCount + (response.data.isShared ? 1 : -1));
      }}
    >
      {isShared ? <Send fill="yellow" stroke="yellow" /> : <Send stroke="white" />}
    </div>

    <div className="ml-auto hover:opacity-70 cursor-pointer transition-transform active:scale-90">
      <Bookmark
      stroke={bookmarked ? "none" : "white"}  
      fill={bookmarked ? "white" : "none"}  
      onClick={() => setBookmarked(!bookmarked)}
      style={{ cursor: "pointer" }}
      size={24}
    />
    </div>
  </div>

  <div className="px-4 text-sm text-gray-300">
    <div className="flex gap-4 font-medium">
      <span>{likeCount} likes</span>
      <span>{comments.length} comments</span>
      <span>{shareCount ?? 0} shares</span>
    </div>
  </div>

  <div className="px-4 text-sm mt-1 text-gray-300">
    <Link href={`/${post.createdBy.username}`}>
      <b>{post.createdBy.username}</b>
    </Link>{" "}
    {post.description || "No description"}
  </div>

<div className="px-4 mt-2 space-y-1 text-sm text-gray-300">
  {comments.slice(0, totalComments).map((comment) => (
    <div key={comment._id}>
      <b>{comment.createdBy.username}: </b>
      {comment.text}
    </div>
  ))}

  {comments.length > totalComments && !showAllComments && (
    <div
      onClick={() => setShowAllComments(true)}
      className="text-gray-500 text-sm hover:underline cursor-pointer"
    >
      View all {comments.length} comments
    </div>
  )}
</div>

{showAllComments && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
    <div className="bg-black w-11/12 max-w-lg max-h-[80vh] overflow-y-auto rounded-lg p-4 border border-gray-700">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-semibold">All Comments</h2>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setShowAllComments(false)}
        >
          Close
        </button>
      </div>

      <div className="space-y-3 text-gray-300 text-sm">
        {comments.map((comment) => (
          <div key={comment._id}>
            <b>{comment.createdBy.username}: </b>
            {comment.text}
          </div>
        ))}
      </div>
    </div>
  </div>
)}

  <div className="flex items-center border-t border-gray-800 mt-3 px-4 py-3">
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Add a comment..."
      className="flex-1 resize-none text-sm bg-black text-white placeholder-gray-500 focus:outline-none"
      rows={1}
    />
    {text.length > 0 && (
      <div
        onClick={handleSubmitComment}
        className="text-blue-500 font-semibold text-sm cursor-pointer hover:text-blue-600"
      >
        Post
      </div>
    )}
  </div>

  {showAllComments && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff04]">
      <div className="w-11/12 max-w-lg max-h-[80vh] overflow-y-auto rounded-lg p-4 border border-gray-700">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold">All Comments</h2>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setShowAllComments(false)}
          >
            Close
          </button>
        </div>

        <div className="space-y-3 text-gray-300 text-sm">
          {comments.map((comment) => (
            <div key={comment._id}>
              <b>{comment.createdBy.username}: </b>
              {comment.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )}
</div>

  );
};

userfollow
-
import mongoose from "mongoose";
import { nanoid } from "nanoid";

const UserFollowSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },

    user: { type: String, ref: "User" }, // WHOM
    createdBy: { type: String, ref: "User" }, // WHO

    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export const UserFollowModel = mongoose.model("UserFollow", UserFollowSchema);

postmodel
-
import mongoose from "mongoose";
import { nanoid } from "nanoid";

const PostSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    description: { type: String },
    imageUrl: { type: String },
    createdBy: { type: String, ref: "User" },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

PostSchema.virtual("comments", {
  ref: "PostComment",
  localField: "_id",
  foreignField: "post",
});

PostSchema.virtual("likes", {
  ref: "PostLike",
  localField: "_id",
  foreignField: "post",
});

PostSchema.virtual("shares", {
  ref: "PostShare",
  localField: "_id",
  foreignField: "post",
});

PostSchema.set("toObject", { virtuals: true });
PostSchema.set("toJSON", { virtuals: true });

export const PostModel = mongoose.model("Post", PostSchema);

usermodel
-
import mongoose from "mongoose";
import { nanoid } from "nanoid";

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: nanoid() },
    username: { type: String, required: true },
    fullname: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    phone: { type: String },

    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);
UserSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "createdBy",
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

export const UserModel = mongoose.model("User", UserSchema);


