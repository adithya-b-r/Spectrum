import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { BlogItem } from "../../../services/api";

interface TrendingProps {
  blogs?: BlogItem[];
}

export const Trending: React.FC<TrendingProps> = ({ blogs: propBlogs = [] }) => {
  const blogs = useMemo(() => {
    if (!propBlogs || propBlogs.length === 0) return [];
    return [...propBlogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  }, [propBlogs]);

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:shadow-none select-none">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
          Trending <i className="bx bxs-hot text-amber-500 text-lg"></i>
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {blogs.map((post: any) => {
          const author: any = typeof post.author === 'object' && post.author ? post.author : {};
          const authorName = author.fullName || author.username || "Author";
          const authorAvatar = author.profilePic || "/avatar.jpg";
          const authorUrl = `/user/profile/${author.username || author.id || author._id || ''}`;
          const postId = (post.id || post._id || '').toString();
          const blogUrl = `/blog/${postId}`;

          return (
            <div key={postId || post.title} className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 min-w-0">
                <Link to={authorUrl} className="flex-shrink-0">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.jpg";
                    }}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-100 dark:ring-slate-700 group-hover:ring-indigo-400 transition"
                  />
                </Link>
                <div className="flex flex-col min-w-0">
                  <Link to={blogUrl}>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-[11px] sm:text-xs">
                    <Link to={authorUrl} className="font-semibold text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      {authorName}
                    </Link>
                    <span className="text-gray-400 ml-1.5">{(post.views || 0).toLocaleString()} views</span>
                  </p>
                </div>
              </div>

              <Link
                to={blogUrl}
                aria-label="View post"
                className="text-gray-400 hover:text-indigo-600 transition flex-shrink-0 p-1 cursor-pointer"
              >
                <i className="bx bx-show text-lg"></i>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};