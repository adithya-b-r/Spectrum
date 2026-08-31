import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { shareThis } from "../../../utils/shareURL";
import { blogApi, BlogItem } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

interface SavedProps {
  onCountChange?: (count: number) => void;
}

export const Saved: React.FC<SavedProps> = ({ onCountChange }) => {
  const navigate = useNavigate();
  const { user: currentUser, refreshUser } = useAuth();

  const [savedArticles, setSavedArticles] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSaved = async () => {
    if (!currentUser?._id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await blogApi.getSaved(currentUser._id, 1, 50);
      const list = res.data?.blogs || (Array.isArray(res.data) ? res.data : []);
      setSavedArticles(list);
      const total = res.data?.pagination?.total ?? list.length;
      if (onCountChange) onCountChange(total);

    } catch (err) {
      console.error("Failed to load saved stories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [currentUser?._id]);

  const handleUnsave = async (e: React.MouseEvent, blogId: string) => {
    e.stopPropagation();
    if (!currentUser?._id) return;

    try {
      await blogApi.toggleSave(blogId, currentUser._id);
      const updated = savedArticles.filter((b) => (b.id || b._id)?.toString() !== blogId.toString());
      setSavedArticles(updated);
      if (onCountChange) onCountChange(updated.length);
      await refreshUser();
      toast.success("Story removed from bookmarks");
    } catch (err) {
      console.error("Failed to unsave story:", err);
      toast.error("Failed to remove story");
    }
  };

  const handleShare = async (e: React.MouseEvent, post: BlogItem) => {
    e.stopPropagation();
    const postId = (post.id || post._id || '').toString();
    const url = `${window.location.origin}/blog/${postId}`;
    await shareThis(url, post.title, post.subtitle || "Check out this story on Spectrum");
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500 dark:text-slate-400">
        <i className="bx bx-loader-alt animate-spin text-3xl text-indigo-600 mb-2"></i>
        <p className="text-xs font-semibold">Loading saved stories...</p>
      </div>
    );
  }

  if (savedArticles.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <i className="bx bx-bookmark text-5xl text-gray-300 dark:text-slate-600"></i>
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">No saved stories yet</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
          Bookmark stories while exploring Spectrum to read them later in your library.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold transition cursor-pointer"
        >
          Explore Stories
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {savedArticles.map((post) => {
        const author: any = typeof post.author === "object" && post.author ? post.author : {};
        const authorName = author.fullName || author.username || "Author";
        const authorAvatar = author.profilePic || "/avatar.jpg";
        const authorUrl = `/user/profile/${author.username || author.id || author._id || ''}`;
        const postId = (post.id || post._id || '').toString();

        const firstImg =
          post.content?.find((c: any) => c.type === "image")?.content || "/blog/blog1.jpg";
        const firstText =
          post.subtitle ||
          post.content?.find((c: any) => c.type === "text")?.content?.slice(0, 140) ||
          "Read full story on Spectrum...";
        const wordCount =
          post.content?.reduce(
            (acc: number, c: any) => (c.type !== "image" && c.content ? acc + c.content.split(" ").length : acc),
            0
          ) || 60;
        const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
        const formattedDate = post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "Recently";

        return (
          <article
            key={postId || post.title}
            onClick={() => navigate(`/blog/${postId}`)}
            className="group bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-5 sm:gap-6">
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                <div>
                  {/* Author & Meta Row */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <Link
                      to={authorUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 group/author"
                    >
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        onError={(e) => {
                          e.currentTarget.src = "/avatar.jpg";
                        }}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover/author:ring-indigo-400 transition"
                      />
                      <span className="text-xs font-bold text-gray-900 dark:text-slate-100 group-hover/author:text-indigo-600 dark:group-hover/author:text-indigo-400 transition">
                        {authorName}
                      </span>
                    </Link>
                    <span className="text-xs text-gray-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">{formattedDate}</span>
                  </div>

                  {/* Title & Excerpt */}
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-1.5 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {firstText}
                  </p>
                </div>

                {/* Mobile Cover Image */}
                <div className="sm:hidden w-full h-44 rounded-xl overflow-hidden mb-4 ring-1 ring-slate-100 dark:ring-slate-800 bg-gray-100 dark:bg-slate-800">
                  <img src={firstImg} alt={post.title} className="w-full h-full object-cover" />
                </div>

                {/* Actions & Engagement Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 font-medium">
                    <span className="text-gray-400 dark:text-slate-500">{readTime}</span>
                    <span className="flex items-center gap-1">
                      <i className="bx bx-heart text-sm"></i>
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="bx bx-message-rounded text-sm"></i>
                      {post.comments?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      title="Remove from saved"
                      onClick={(e) => handleUnsave(e, postId)}
                      className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    >
                      <i className="bx bxs-bookmark text-lg"></i>
                    </button>
                    <button
                      title="Share article"
                      onClick={(e) => handleShare(e, post)}
                      className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <i className="bx bx-share-alt text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Thumbnail Image */}
              <div className="hidden sm:block flex-shrink-0 w-32 h-28 lg:w-36 lg:h-32 rounded-xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 shadow-2xs bg-gray-100 dark:bg-slate-800">
                <img
                  src={firstImg}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};