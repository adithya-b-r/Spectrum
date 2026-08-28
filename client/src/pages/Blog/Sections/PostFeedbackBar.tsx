import React from "react";

interface PostFeedbackBarProps {
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  saved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onShare: () => void;
  onScrollToComments: () => void;
}

export const PostFeedbackBar: React.FC<PostFeedbackBarProps> = ({
  liked,
  likesCount,
  commentsCount,
  saved,
  onToggleLike,
  onToggleSave,
  onShare,
  onScrollToComments,
}) => {
  return (
    <div className="py-4 my-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-gray-500 dark:text-slate-400">
      {/* Left Reactions */}
      <div className="flex items-center gap-6 text-sm">
        <button
          onClick={onToggleLike}
          className={`flex items-center gap-1.5 transition cursor-pointer ${
            liked ? "text-red-500 font-semibold" : "hover:text-gray-800 dark:hover:text-slate-200"
          }`}
        >
          <i className={`bx ${liked ? "bxs-heart text-red-500" : "bx-heart"} text-xl`}></i>
          <span>{likesCount}</span>
        </button>

        <button
          onClick={onScrollToComments}
          className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <i className="bx bx-message-rounded text-xl"></i>
          <span>{commentsCount}</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 text-xl">
        <button
          title={saved ? "Saved" : "Save"}
          onClick={onToggleSave}
          className={`p-1 transition cursor-pointer ${
            saved ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <i className={`bx ${saved ? "bxs-bookmark text-indigo-600 dark:text-indigo-400" : "bx-bookmark"}`}></i>
        </button>

        <button
          title="Share"
          onClick={onShare}
          className="p-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
        >
          <i className="bx bx-share-alt"></i>
        </button>
      </div>
    </div>
  );
};