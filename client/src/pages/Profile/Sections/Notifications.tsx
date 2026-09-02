import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { notificationApi, NotificationItem } from "../../../services/api";

type FilterType = "all" | "unread" | "LIKE" | "COMMENT" | "FOLLOW" | "STORY";


export const Notifications: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const authUserId = user?.id ?? user?._id;

  const fetchNotifications = async () => {
    if (!authUserId) {
      if (!isAuthLoading) {
        setLoading(false);
      }
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await notificationApi.getAll(authUserId);
      const data = res.data as any;
      const list = Array.isArray(data) ? data : (data?.notifications || []);
      setNotifications(list);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to load notifications";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchNotifications();
    }
  }, [authUserId, isAuthLoading]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.read === false || n.isRead === false).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "all") return true;
      if (filter === "unread") return n.read === false || n.isRead === false;
      const t = (n.type || "").toUpperCase();
      return t === filter.toUpperCase();
    });
  }, [notifications, filter]);

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSec < 60) return "Just now";
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) return `${diffInMin}m ago`;
    const diffInHours = Math.floor(diffInMin / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    const notifId = (item.id ?? item._id ?? '').toString();
    const isUnread = item.read === false || item.isRead === false;
    if (isUnread && notifId) {
      try {
        await notificationApi.markAsRead(notifId);
        setNotifications((prev) =>
          prev.map((n) => ((n.id ?? n._id)?.toString() === notifId ? { ...n, read: true, isRead: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }

    const blogId = item.blog?.id ?? item.blog?._id;
    const typeUpper = (item.type || "").toUpperCase();
    if ((typeUpper === "LIKE" || typeUpper === "COMMENT" || typeUpper === "STORY") && blogId) {
      navigate(`/blog/${blogId}`);
    } else if (typeUpper === "FOLLOW" && item.sender?.username) {
      navigate(`/user/profile/${item.sender.username}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!authUserId || unreadCount === 0) return;
    try {
      await notificationApi.markAllAsRead(authUserId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    id: string | number
  ) => {
    e.stopPropagation();
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => (n.id ?? n._id)?.toString() !== id.toString()));
      toast.success("Notification removed");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    if (!authUserId || notifications.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;

    try {
      setIsClearing(true);
      await notificationApi.clearAll(authUserId);
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (err) {
      toast.error("Failed to clear notifications");
    } finally {
      setIsClearing(false);
    }
  };

  const filterTabs: Array<{ key: FilterType; label: string; count?: number }> = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "STORY", label: "Stories" },
    { key: "LIKE", label: "Likes" },
    { key: "COMMENT", label: "Comments" },
    { key: "FOLLOW", label: "Follows" },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-2.5 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                title="Mark all as read"
              >
                <i className="bx bx-check-double text-base"></i>
                <span>Mark all read</span>
              </button>
            )}
            <button
              type="button"
              disabled={isClearing}
              onClick={handleClearAll}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer disabled:opacity-50"
              title="Clear all notifications"
            >
              <i className="bx bx-trash text-sm"></i>
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="py-20 text-center text-gray-400 dark:text-slate-500">
            <i className="bx bx-loader-alt animate-spin text-3xl text-indigo-600 mb-2"></i>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-500 dark:text-rose-400 text-2xl">
              <i className="bx bx-error-circle"></i>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">{error}</p>
            <button
              type="button"
              onClick={fetchNotifications}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item) => {
            const notifId = (item.id ?? item._id ?? '').toString();
            const senderName = item.sender?.fullName || "Someone";
            const senderAvatar = item.sender?.profilePic || "/avatar.jpg";
            const timeAgo = formatRelativeTime(item.createdAt);
            const isRead = item.read !== false && item.isRead !== false;
            const typeUpper = (item.type || "").toUpperCase();

            return (
              <div
                key={notifId}
                onClick={() => handleNotificationClick(item)}
                className={`group flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-2xl transition duration-150 cursor-pointer ${
                  isRead
                    ? "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    : "bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border border-indigo-100/60 dark:border-indigo-900/50"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Sender Avatar with Type Badge Overlay */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={senderAvatar}
                      alt={senderName}
                      onError={(e) => {
                        e.currentTarget.src = "/avatar.jpg";
                      }}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-900 text-xs ${
                        typeUpper === "LIKE"
                          ? "bg-rose-500"
                          : typeUpper === "COMMENT"
                          ? "bg-indigo-600"
                          : typeUpper === "STORY"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    >
                      {typeUpper === "LIKE" && <i className="bx bxs-heart text-[10px]"></i>}
                      {typeUpper === "COMMENT" && <i className="bx bxs-comment-detail text-[10px]"></i>}
                      {typeUpper === "STORY" && <i className="bx bxs-book-open text-[10px]"></i>}
                      {typeUpper === "FOLLOW" && <i className="bx bxs-user-plus text-[10px]"></i>}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-slate-200 leading-snug">
                      <span className="font-bold text-gray-900 dark:text-white mr-1 hover:underline">
                        {senderName}
                      </span>
                      {typeUpper === "STORY" && (
                        <span>
                          published a new story{" "}
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                            "{item.blog?.title || "Story"}"
                          </span>
                        </span>
                      )}
                      {typeUpper === "LIKE" && (
                        <span>
                          liked your story{" "}
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                            "{item.blog?.title || "Story"}"
                          </span>
                        </span>
                      )}
                      {typeUpper === "COMMENT" && (
                        <span>
                          commented on{" "}
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                            "{item.blog?.title || "Story"}"
                          </span>
                          {(item.message || (typeof item.comment === 'object' && item.comment?.content) || (typeof item.comment === 'string' && item.comment)) && (
                            <span className="block text-gray-600 dark:text-slate-300 font-medium italic mt-0.5 line-clamp-1 bg-white/60 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700">
                              "{item.message || (typeof item.comment === 'object' ? item.comment?.content : item.comment)}"
                            </span>
                          )}
                        </span>
                      )}
                      {typeUpper === "FOLLOW" && <span>started following you.</span>}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 dark:text-slate-500 font-medium">
                      <span>{timeAgo}</span>
                      {!isRead && (
                        <span className="inline-flex items-center px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-1 flex-shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteNotification(e, notifId)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                    title="Delete notification"
                  >
                    <i className="bx bx-trash text-base"></i>
                  </button>
                  <i className="bx bx-chevron-right text-lg text-gray-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition"></i>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-gray-400 dark:text-slate-500 space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 text-2xl">
              <i
                className={`bx ${
                  filter === "LIKE"
                    ? "bx-heart"
                    : filter === "COMMENT"
                    ? "bx-comment-detail"
                    : filter === "STORY"
                    ? "bx-book-open"
                    : filter === "FOLLOW"
                    ? "bx-user-plus"
                    : "bx-bell-off"
                }`}
              ></i>
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">
              {filter === "unread"
                ? "You're all caught up! No unread notifications"
                : filter === "STORY"
                ? "No new stories from followed authors yet"
                : filter === "LIKE"
                ? "No story likes yet"
                : filter === "COMMENT"
                ? "No comments on your stories yet"
                : filter === "FOLLOW"
                ? "No new followers yet"
                : "No notifications yet"}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-sm mx-auto">
              Interactions on your stories, new stories from authors you follow, and comments will show up here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};