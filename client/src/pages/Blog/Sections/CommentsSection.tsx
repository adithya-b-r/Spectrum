import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User } from "../../../services/api";

export interface CommentItem {
  id?: string | number;
  _id?: string | number;
  content: string;
  user?: {
    id?: string | number;
    _id?: string | number;
    fullName?: string;
    username?: string;
    profilePic?: string;
  } | null;
  createdAt?: string;
  likes?: string[] | number[];
}

interface CommentsSectionProps {
  comments: CommentItem[];
  currentUser: User | null;
  postAuthorId?: string;
  postAuthorUsername?: string;
  onAddComment: (text: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  hasMoreComments?: boolean;
  loadingMoreComments?: boolean;
  onLoadMoreComments?: () => Promise<void>;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments = [],
  currentUser,
  postAuthorId,
  postAuthorUsername,
  onAddComment,
  onDeleteComment,
  hasMoreComments = false,
  loadingMoreComments = false,
  onLoadMoreComments,
}) => {

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(commentText.trim());
      setCommentText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUserName = currentUser?.fullName || "You";
  const currentUserAvatar = currentUser?.profilePic || "/avatar.jpg";

  return (
    <section id="responses-section" className="pt-8 pb-10 select-none scroll-mt-20">
      <h3 className="text-xl font-bold text-[#242424] dark:text-white mb-6">
        Responses ({comments.length})
      </h3>

      {/* Write Response Box */}
      <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={currentUserAvatar}
            alt={currentUserName}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            {currentUser ? currentUserName : "Sign in to join discussion"}
          </span>
        </div>

        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={currentUser ? "What are your thoughts?" : "Please sign in to write a response..."}
          disabled={!currentUser || isSubmitting}
          rows={3}
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
        />

        <div className="flex justify-end mt-2.5">
          <button
            type="submit"
            disabled={!commentText.trim() || !currentUser || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-2 rounded-full transition cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <i className="bx bx-loader-alt animate-spin text-sm"></i>
                <span>Posting...</span>
              </>
            ) : (
              <span>Respond</span>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
          {comments.map((comment) => {
            const author = comment.user || {};
            const authorName = author.fullName || author.username || "Reader";
            const authorAvatar = author.profilePic || "/avatar.jpg";
            const authorIdStr = (author.id || author._id || '').toString();
            const currentUserIdStr = (currentUser?.id || currentUser?._id || '').toString();
            const postAuthorIdStr = (postAuthorId || '').toString();

            const isOwnComment = Boolean(
              currentUser &&
                ((authorIdStr && currentUserIdStr === authorIdStr) ||
                  (author.username && currentUser.username === author.username))
            );

            const isCurrentUserPostAuthor = Boolean(
              currentUser &&
                postAuthorIdStr &&
                currentUserIdStr === postAuthorIdStr
            );

            const isPostAuthor = Boolean(
              (postAuthorIdStr && (authorIdStr === postAuthorIdStr || (typeof author === 'string' && author === postAuthorIdStr))) ||
              (postAuthorUsername && author.username === postAuthorUsername)
            );

            const formattedDate = comment.createdAt
              ? new Date(comment.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recently';

            const commentId = (comment.id || comment._id || '').toString();

            return (
              <div key={commentId || comment.content} className="pt-6 first:pt-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <Link to={`/user/profile/${author.username || author.id || author._id || ''}`}>
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        onError={(e) => {
                          e.currentTarget.src = "/avatar.jpg";
                        }}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-indigo-400 transition"
                      />
                    </Link>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          to={`/user/profile/${author.username || author.id || author._id || ''}`}
                          className="text-sm font-bold text-gray-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 leading-tight"
                        >
                          {authorName}
                        </Link>

                        {isPostAuthor && (
                          <span className="text-[10px] font-extrabold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800 px-1.5 py-0.2 rounded-md tracking-wider">
                            Author
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5">{formattedDate}</span>
                    </div>
                  </div>

                  {(isOwnComment || isCurrentUserPostAuthor) && onDeleteComment && (
                    <button
                      onClick={() => onDeleteComment(commentId)}
                      className="text-gray-400 dark:text-slate-500 hover:text-rose-600 transition p-1 cursor-pointer"
                      title="Delete comment"
                    >
                      <i className="bx bx-trash text-sm"></i>
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mt-2 pl-10.5 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            );
          })}

          {/* Load More Responses Button */}
          {hasMoreComments && (
            <div className="pt-4 text-center">
              <button
                type="button"
                disabled={loadingMoreComments}
                onClick={onLoadMoreComments}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {loadingMoreComments ? (
                  <>
                    <i className="bx bx-loader-alt animate-spin text-sm"></i>
                    <span>Loading responses...</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-chevron-down text-sm"></i>
                    <span>Load more responses</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-sm italic">
          No responses yet. Be the first to share your thoughts!
        </div>
      )}

    </section>
  );
};
