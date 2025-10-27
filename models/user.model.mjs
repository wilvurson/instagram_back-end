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
import { useEffect, useState } from "react";
import { useAxios } from "../hooks/useAxios";
import { User } from "../types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useUser } from "../providers/UserProvider";

const ProfilePage = () => {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const axios = useAxios();
  const { user: currentUser } = useUser();

  useEffect(() => {
    axios
      .get(`/users/${username}`)
      .then((res) => {
        setUser(res.data);

        // check if current user follows this user
        const follows = res.data.followers?.some(
          (f: any) => f.createdBy === currentUser?._id
        );
        setIsFollowing(follows);
      })
      .catch((err) => {
        if (err.response?.status === 404) setIsNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [username]);

  const handleFollow = async () => {
    if (!user) return;
    try {
      const res = await axios.post(`/users/${user._id}/follow`);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <div className="text-center text-2xl mt-8 text-white">Loading...</div>;

  if (isNotFound)
    return (
      <div className="text-center text-2xl mt-8 text-white">
        404 user not found
      </div>
    );

  const isOwnProfile = currentUser?.username === user?.username;

  return (
    <div className="min-h-screen bg-black text-white w-full">
      <Navbar />

      <div className="w-full flex justify-center pt-10 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-10 mb-8">
          {/* Profile Picture */}
          <div className="flex justify-center md:block mb-6 md:mb-0">
            <img
              src={user?.profilePic || "/default-avatar.png"}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border border-gray-700"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <h1 className="text-2xl font-semibold">{user?.username}</h1>
              <Check />
              <button className="p-2 hover:bg-[#262626] rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center md:justify-start gap-8 mb-4 text-sm">
              <span>0 posts</span>
              <span>{user?.followers?.length || 0} followers</span>
              <span>{user?.following?.length || 0} following</span>
            </div>

            <div className="text-sm leading-snug mb-4">
              <span className="font-semibold block">{user?.fullname}</span>
              <p className="text-gray-300">{user?.bio || "No bio yet."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-2 mb-6">
        {isOwnProfile ? (
          <Button className="bg-[#262626] text-white text-sm font-semibold w-40 h-10 hover:bg-[#363636]">
            Edit Profile
          </Button>
        ) : (
          <>
            <Button
              onClick={handleFollow}
              className={`text-sm font-semibold w-40 h-10 px-6 ${
                isFollowing
                  ? "bg-[#262626] text-white hover:bg-[#363636]"
                  : "bg-[#0051ff] text-white hover:bg-[#1839f2]"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>

            <Button className="bg-[#262626] text-white text-sm font-semibold w-40 h-10 hover:bg-[#363636]">
              Message
            </Button>

            <Button className="bg-[#262626] text-white text-sm font-semibold px-4 h-10 hover:bg-[#363636]">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;





