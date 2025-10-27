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




"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import { useAxios } from "../hooks/useAxios";
import { UserContext } from "../providers/UserProvider";
import { Navbar } from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Grid, UserSquare2 } from "lucide-react";
import Link from "next/link";

export default function UserPage() {
  const { username } = useParams();
  const axios = useAxios();
  const { user: currentUser } = useContext(UserContext);

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/users/${username}`);
        setUser(res.data);
        setPosts(res.data.posts || []);

        // check if currentUser already follows them
        if (res.data.followers?.some((f: any) => f.createdBy === currentUser?._id)) {
          setIsFollowing(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handleFollow = async () => {
    try {
      const res = await axios.post(`/users/${user._id}/follow`);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center text-white mt-20">Loading...</div>;
  if (!user) return <div className="text-center text-white mt-20">User not found</div>;

  const isOwnProfile = currentUser?.username === user?.username;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-8 px-4">
        {/* PROFILE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center gap-10 mb-10">
          {/* Avatar */}
          <div className="flex justify-center md:block">
            <img
              src={user?.profilePic || "/default-avatar.png"}
              className="w-32 h-32 rounded-full object-cover border border-gray-700"
              alt="Profile"
            />
          </div>

          {/* INFO */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <h1 className="text-2xl font-semibold">{user?.username}</h1>
              <button className="p-2 hover:bg-[#262626] rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-8 mb-4 text-sm">
              <span><strong>{posts.length}</strong> posts</span>
              <span><strong>{user.followersCount || 0}</strong> followers</span>
              <span><strong>{user.followingCount || 0}</strong> following</span>
            </div>

            {/* Full name + bio */}
            <div className="text-sm leading-snug mb-4">
              <span className="font-semibold block">{user?.fullname}</span>
              <p className="text-gray-300">{user?.bio || "No bio yet."}</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center md:justify-start gap-2">
              {isOwnProfile ? (
                <>
                  <Button className="bg-[#262626] text-white text-sm font-semibold px-6 hover:bg-[#363636]">
                    Edit Profile
                  </Button>
                  <Button className="bg-[#262626] text-white text-sm font-semibold px-6 hover:bg-[#363636]">
                    View Archive
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleFollow}
                    className={`text-sm font-semibold px-6 ${
                      isFollowing
                        ? "bg-[#262626] text-white hover:bg-[#363636]"
                        : "bg-[#0095F6] text-white hover:bg-[#1877F2]"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>

                  <Button className="bg-[#262626] text-white text-sm font-semibold px-6 hover:bg-[#363636]">
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="border-t border-gray-800 flex justify-center gap-16 text-gray-400 text-xs tracking-widest uppercase mb-6">
          <div className="flex items-center gap-2 border-t border-white pt-3">
            <Grid className="w-4 h-4" />
            Posts
          </div>
          <div className="flex items-center gap-2 pt-3 opacity-60 hover:opacity-100 cursor-pointer">
            <UserSquare2 className="w-4 h-4" />
            Tagged
          </div>
        </div>

        {/* POSTS GRID */}
        <div className="grid grid-cols-3 gap-1">
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <Link key={post._id} href={`/p/${post._id}`}>
                <div className="aspect-square bg-gray-900 relative group">
                  <img
                    src={post.imageUrl}
                    alt="post"
                    className="w-full h-full object-cover group-hover:opacity-90 transition"
                  />
                </div>
              </Link>
            ))
          ) : (
            <div className="text-gray-400 text-center col-span-3 py-20">
              No posts yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





