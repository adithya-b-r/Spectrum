import React from "react";
import { Link } from "react-router-dom";

interface AuthorCardProps {
  author?: {
    id?: string | number;
    _id?: string | number;
    fullName?: string;
    name?: string;
    username?: string;
    profilePic?: string;
    about?: string;
    headline?: string;
    followers?: any[];
    following?: any[];
    email?: string;
  } | null;
  isOwnPost?: boolean;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({
  author,
  isOwnPost = false,
  isFollowing = false,
  onToggleFollow,
}) => {
  if (!author) return null;

  const authorName = author.fullName || author.name || author.username || "Author";
  const authorAvatar = author.profilePic || "/avatar.jpg";
  const authorBio = author.about || author.headline || "Writer and thinker sharing perspectives on Spectrum.";
  const followersCount = author.followers?.length || 0;

  return (
    <div className="pt-6 pb-10 border-b border-slate-200/80 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <Link to={`/user/profile/${author.username || author.id || author._id || ''}`}>
          <img
            src={authorAvatar}
            alt={authorName}
            onError={(e) => {
              e.currentTarget.src = "/avatar.jpg";
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0 hover:ring-indigo-400 transition"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 block mb-1">
            Written by
          </span>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <Link
                to={`/user/profile/${author.username || author.id || author._id || ''}`}
                className="text-lg sm:text-xl font-bold text-[#242424] dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                {authorName}
              </Link>
              <span className="text-xs text-gray-500 dark:text-slate-400 block">
                {followersCount} {followersCount === 1 ? 'Follower' : 'Followers'}
              </span>
            </div>

            {!isOwnPost && onToggleFollow && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleFollow}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isFollowing
                      ? "border border-slate-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:border-slate-400 bg-white dark:bg-slate-800"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    title="Send Email"
                    className="w-8 h-8 rounded-full border border-slate-200/90 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <i className="bx bx-envelope text-base"></i>
                  </a>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed font-normal">
            {authorBio}
          </p>
        </div>
      </div>
    </div>
  );
};