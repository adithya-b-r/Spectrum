import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogApi, BlogItem } from "../../../services/api";

interface RecommendedBlogsProps {
  currentBlogId?: string;
  authorId?: string;
  authorName?: string;
}

export const RecommendedBlogs: React.FC<RecommendedBlogsProps> = ({
  currentBlogId,
  authorId,
  authorName = "Author",
}) => {
  const navigate = useNavigate();
  const [allBlogs, setAllBlogs] = useState<BlogItem[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await blogApi.getAll(1, 10);
        const list = res.data?.blogs || (Array.isArray(res.data) ? res.data : []);
        if (list.length > 0) {
          setAllBlogs(list);
        }
      } catch (err) {
        console.error("Failed to load recommended stories:", err);
      }

    };

    fetchBlogs();
  }, []);

  const otherBlogs = allBlogs.filter((b) => (b.id || b._id)?.toString() !== currentBlogId?.toString());
  const moreFromAuthor = otherBlogs.filter((b) => {
    const aId = typeof b.author === "object" ? (b.author?.id || b.author?._id)?.toString() : b.author?.toString();
    return authorId && aId === authorId.toString();
  });

  const generalRecommended = otherBlogs.slice(0, 4);

  if (generalRecommended.length === 0 && moreFromAuthor.length === 0) {
    return null;
  }

  const handleArticleClick = (blogId: string) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/blog/${blogId}`);
  };

  const renderBlogCard = (item: BlogItem) => {
    const author: any = typeof item.author === "object" && item.author ? item.author : {};
    const name = author.fullName || author.username || "Author";
    const avatar = author.profilePic || "/avatar.jpg";

    const cover = item.content?.find((c) => c.type === "image")?.content || "/blog/blog1.jpg";
    const summary =
      item.subtitle ||
      item.content?.find((c) => c.type === "text")?.content?.slice(0, 110) ||
      "Read this story on Spectrum...";
    const date = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Recently";

    const itemId = (item.id || item._id || '').toString();
    return (
      <div
        key={itemId || item.title}
        onClick={() => handleArticleClick(itemId)}
        className="group cursor-pointer flex flex-col justify-between bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all duration-200"
      >
        <div className="w-full h-40 rounded-xl overflow-hidden mb-3.5 ring-1 ring-slate-100 dark:ring-slate-800 bg-gray-100 dark:bg-slate-800">
          <img
            src={cover}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <img
            src={avatar}
            alt={name}
            onError={(e) => {
              e.currentTarget.src = "/avatar.jpg";
            }}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{name}</span>
        </div>

        <h4 className="text-sm font-bold text-[#242424] dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2 mb-1.5">
          {item.title}
        </h4>

        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {summary}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 mt-auto pt-2 border-t border-slate-200/50 dark:border-slate-800">
          <span>{date}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-red-500">
              <i className="bx bx-heart text-sm"></i>
              {item.likes?.length || 0}
            </span>
            <span className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400">
              <i className="bx bx-message-rounded text-sm"></i>
              {item.comments?.length || 0}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 select-none">
      {/* 1. More from Author */}
      {moreFromAuthor.length > 0 && (
        <section className="pt-10 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#242424] dark:text-white tracking-tight">
              More from {authorName}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {moreFromAuthor.slice(0, 2).map(renderBlogCard)}
          </div>
        </section>
      )}

      {/* 2. Recommended from Spectrum */}
      {generalRecommended.length > 0 && (
        <section className="pt-10 pb-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#242424] dark:text-white tracking-tight">
              Recommended from Spectrum
            </h3>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate("/");
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Explore all stories
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {generalRecommended.map(renderBlogCard)}
          </div>
        </section>
      )}
    </div>
  );
};
