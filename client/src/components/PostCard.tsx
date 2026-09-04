import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../services/api";
import { shareThis } from "../utils/shareURL";


interface PostCardProps {
  id?: string;
  isFollowing?: boolean;
  isSaved?: boolean;
  isLiked?: boolean;
  name: string;
  profileImg: string;
  authorUsername?: string;
  authorId?: string;
  date?: string;
  readTime?: string;
  postImg: string;
  title: string;
  description: string;
  url?: string;
  likes?: number;
  comments?: number;
}

const formatImageSrc = (src?: string, fallback: string = "/avatar.jpg") => {
  if (!src) return fallback;
  if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  return `/${src}`;
};

export const PostCard: React.FC<PostCardProps> = ({
  id,
  isFollowing = false,
  isSaved = false,
  isLiked = false,
  name,
  profileImg,
  authorUsername,
  authorId,
  date = "Oct 29",
  readTime = "5 min read",
  postImg,
  title,
  description,
  url = "https://spectrum-blog.vercel.app/",
  likes = 39,
  comments = 21,
}) => {
  const { user, isLoggedIn, refreshUser } = useAuth();
  const blogUrl = id ? `/blog/${id}` : '/blog';
  const authorProfileUrl = authorUsername
    ? `/user/profile/${authorUsername}`
    : authorId
    ? `/user/profile/${authorId}`
    : '/user/profile';

  const [following, setFollowing] = useState(isFollowing);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setFollowing(isFollowing);
  }, [isFollowing]);

  const isSelf = Boolean(user && authorId && String(user.id ?? user._id) === String(authorId));

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [liked, setLiked] = useState(isLiked);
  const [likedCount, setLikedCount] = useState(likes);

  const toggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Please sign in to follow authors.");
      return;
    }
    const currentUserId = user?.id ?? user?._id;
    if (!authorId || !currentUserId || isSelf || followLoading) return;
    try {
      setFollowLoading(true);
      const res = await userApi.toggleFollow(authorId, currentUserId);
      setFollowing(res.data.following);
      await refreshUser();
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const toggleLiked = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikedCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const toggleSaved = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((prev) => {
      const newState = !prev;
      if (newState) {
        window.addEventListener("mousedown", closeDropdownOnOutsideClick);
      } else {
        window.removeEventListener("mousedown", closeDropdownOnOutsideClick);
      }
      return newState;
    });
  };

  const closeDropdownOnOutsideClick = (e: any) => {
    const dropdownElement = document.querySelector(".dropRef");
    if (dropdownElement && !dropdownElement.contains(e.target)) {
      setDropdownOpen(false);
      window.removeEventListener("mousedown", closeDropdownOnOutsideClick);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await shareThis(url, title, description);
  };

  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between mb-5">
        <Link to={authorProfileUrl} className="flex items-center gap-3 group/author">
          <img
            src={formatImageSrc(profileImg, "/avatar.jpg")}
            alt={name}
            onError={(e) => {
              e.currentTarget.src = "/avatar.jpg";
            }}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-100 dark:ring-slate-700 group-hover/author:ring-indigo-400 transition"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-gray-900 dark:text-slate-100 group-hover/author:text-indigo-600 dark:group-hover/author:text-indigo-400 transition">{name}</span>
              <i className="bx bxs-badge-check text-indigo-600 text-base"></i>
            </div>
            <span className="text-xs text-gray-400">
              {date} · {readTime}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {!isSelf && (
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`px-4 py-1 text-xs font-semibold rounded-full border transition-all duration-150 cursor-pointer ${
                following
                  ? "bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300"
              } ${followLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {following ? "Following" : "Follow"}
            </button>
          )}

          <div className="relative">
            <button
              onClick={toggleDropdown}
              aria-label="More options"
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <i className="bx bx-dots-horizontal-rounded text-xl"></i>
            </button>
            {dropdownOpen && (
              <div className="dropRef absolute right-0 top-8 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-1.5 z-20">
                <button
                  onClick={toggleSaved}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition text-left cursor-pointer"
                >
                  <i className={`bx ${saved ? "bxs-bookmark" : "bx-bookmark"} text-sm`}></i>
                  {saved ? "Unsave" : "Save"}
                </button>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition text-left cursor-pointer"
                >
                  <i className="bx bx-share-alt text-sm"></i>
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-start justify-between">
        <div className="flex-1 flex flex-col justify-between h-full min-w-0 w-full">
          <div>
            <Link to={blogUrl}>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer">
                {title}
              </h2>
            </Link>
            <Link to={blogUrl}>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-normal leading-relaxed line-clamp-3 mb-4 md:mb-6 cursor-pointer hover:text-gray-700 dark:hover:text-slate-200 transition">
                {description}
              </p>
            </Link>
          </div>

          <Link to={blogUrl} className="md:hidden block w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 mb-4 cursor-pointer">
            <img
              src={formatImageSrc(postImg, "/blog/blog1.jpg")}
              alt={title}
              onError={(e) => {
                e.currentTarget.src = "/blog/blog1.jpg";
              }}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <div className="flex items-center gap-5 text-gray-500 dark:text-slate-400 text-xs font-medium mt-auto pt-1 md:pt-0">
            <button
              onClick={toggleLiked}
              className="flex items-center gap-1.5 hover:text-red-500 transition cursor-pointer"
            >
              <i className={`bx ${liked ? "bxs-heart text-red-500" : "bx-heart text-red-500"} text-base`}></i>
              <span className={liked ? "text-red-500" : ""}>{likedCount}</span>
            </button>

            <Link to={blogUrl} className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700 dark:hover:text-slate-200 transition">
              <i className="bx bx-message-rounded text-base"></i>
              <span>{comments}</span>
            </Link>

            <button
              onClick={toggleSaved}
              className="hover:text-gray-700 dark:hover:text-slate-200 transition cursor-pointer"
              aria-label="Bookmark"
            >
              <i className={`bx ${saved ? "bxs-bookmark text-gray-700 dark:text-slate-200" : "bx-bookmark"} text-base`}></i>
            </button>

            <button
              onClick={handleShare}
              className="hover:text-gray-700 dark:hover:text-slate-200 transition cursor-pointer flex items-center"
              aria-label="Share"
            >
              <i className="bx bx-share-alt text-base"></i>
            </button>
          </div>
        </div>

        <Link to={blogUrl} className="hidden md:block w-60 lg:w-72 flex-shrink-0 cursor-pointer">
          <div className="w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-100 dark:border-slate-800">
            <img
              src={formatImageSrc(postImg, "/blog/blog1.jpg")}
              alt={title}
              onError={(e) => {
                e.currentTarget.src = "/blog/blog1.jpg";
              }}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      </div>
    </article>
  );
};