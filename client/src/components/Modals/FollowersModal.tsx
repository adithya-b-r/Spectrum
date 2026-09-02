import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { userApi, User } from "../../services/api";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "followers" | "following";
  userId?: string | number;
  username?: string;
  onCountChange?: () => void;
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  initialTab = "followers",
  userId,
  onCountChange,
}) => {

  const navigate = useNavigate();
  const { user: currentUser, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followersPage, setFollowersPage] = useState<number>(1);
  const [followingPage, setFollowingPage] = useState<number>(1);
  const [followersHasNext, setFollowersHasNext] = useState<boolean>(false);
  const [followingHasNext, setFollowingHasNext] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [userToUnfollow, setUserToUnfollow] = useState<User | null>(null);

  const targetId = userId ?? currentUser?.id ?? currentUser?._id;

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
      setUserToUnfollow(null);
      setFollowersPage(1);
      setFollowingPage(1);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen || !targetId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [followersRes, followingRes] = await Promise.all([
          userApi.getFollowers(targetId, 1, 20),
          userApi.getFollowing(targetId, 1, 20),
        ]);

        setFollowers(followersRes.data.followers || []);
        setFollowing(followingRes.data.following || []);
        setFollowersHasNext(Boolean(followersRes.data.pagination?.hasNextPage));
        setFollowingHasNext(Boolean(followingRes.data.pagination?.hasNextPage));
        setFollowersPage(1);
        setFollowingPage(1);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, targetId]);

  const handleLoadMore = async () => {
    if (!targetId || loadingMore) return;
    try {
      setLoadingMore(true);
      if (activeTab === "followers" && followersHasNext) {
        const nextPage = followersPage + 1;
        const res = await userApi.getFollowers(targetId, nextPage, 20);
        const newItems = res.data.followers || [];
        setFollowers((prev) => [...prev, ...newItems]);
        setFollowersPage(nextPage);
        setFollowersHasNext(Boolean(res.data.pagination?.hasNextPage));
      } else if (activeTab === "following" && followingHasNext) {
        const nextPage = followingPage + 1;
        const res = await userApi.getFollowing(targetId, nextPage, 20);
        const newItems = res.data.following || [];
        setFollowing((prev) => [...prev, ...newItems]);
        setFollowingPage(nextPage);
        setFollowingHasNext(Boolean(res.data.pagination?.hasNextPage));
      }
    } catch (err: any) {
      toast.error("Failed to load more users");
    } finally {
      setLoadingMore(false);
    }
  };


  const displayedList = useMemo(() => {
    const list = activeTab === "followers" ? followers : following;
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((u) => {
      const nameMatch = u.fullName?.toLowerCase().includes(q);
      const userMatch = u.username?.toLowerCase().includes(q);
      const headlineMatch = u.headline?.toLowerCase().includes(q);
      const aboutMatch = u.about?.toLowerCase().includes(q);
      return Boolean(nameMatch || userMatch || headlineMatch || aboutMatch);
    });
  }, [activeTab, followers, following, searchQuery]);

  const handleUserClick = (u: User) => {
    onClose();
    const handle = u.username || u.id || u._id;
    navigate(`/user/profile/${handle}`);
  };

  const isUserFollowed = (targetUserId: string | number) => {
    if (!currentUser) return false;
    return (currentUser.following || []).some(
      (f: any) => String(f.id ?? f._id ?? f) === String(targetUserId)
    );
  };

  const handleFollowAction = (e: React.MouseEvent, targetUser: User) => {
    e.stopPropagation();

    if (!currentUser) {
      toast.info("Please sign in to follow authors.");
      return;
    }

    const tId = targetUser.id ?? targetUser._id;
    const currentId = currentUser.id ?? currentUser._id;
    if (tId != null && currentId != null && String(tId) === String(currentId)) return;

    if (tId != null && isUserFollowed(tId)) {
      setUserToUnfollow(targetUser);
    } else {
      executeFollowToggle(targetUser);
    }
  };

  const executeFollowToggle = async (targetUser: User) => {
    const tId = targetUser.id ?? targetUser._id;
    const currentId = currentUser?.id ?? currentUser?._id;
    if (tId == null || currentId == null) return;
    setActionLoading((prev) => ({ ...prev, [String(tId)]: true }));
    try {
      const res = await userApi.toggleFollow(tId, currentId);
      await refreshUser();

      if (targetId != null && String(targetId) === String(currentId)) {
        if (res.data.following) {
          if (!following.some((f) => String(f.id ?? f._id) === String(tId))) {
            setFollowing((prev) => [...prev, targetUser]);
          }
        } else {
          setFollowing((prev) => prev.filter((f) => String(f.id ?? f._id) !== String(tId)));
        }
      }

      toast.success(
        res.data.following
          ? `Following ${targetUser.fullName}`
          : `Unfollowed ${targetUser.fullName}`
      );

      if (onCountChange) {
        onCountChange();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update follow status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [String(tId)]: false }));
      setUserToUnfollow(null);
    }
  };

  if (!isOpen) return null;

  return (

    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-black/40 backdrop-blur-xs p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full relative border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh] min-h-[360px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header Tabs */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab("followers")}
                className={`text-sm font-bold pb-2 transition border-b-2 cursor-pointer ${
                  activeTab === "followers"
                    ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Followers ({followers.length})
              </button>
              <button
                onClick={() => setActiveTab("following")}
                className={`text-sm font-bold pb-2 transition border-b-2 cursor-pointer ${
                  activeTab === "following"
                    ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Following ({following.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 -mr-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="relative flex items-center">
              <i className="bx bx-search absolute left-3.5 text-gray-400 dark:text-slate-500 text-lg pointer-events-none"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-9 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-0.5 cursor-pointer"
                >
                  <i className="bx bx-x text-base"></i>
                </button>
              )}
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto px-6 py-3 divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="py-16 text-center text-gray-400 dark:text-slate-500">
                <i className="bx bx-loader-alt animate-spin text-3xl text-indigo-600 mb-2"></i>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Loading {activeTab}...</p>
              </div>
            ) : displayedList.length > 0 ? (
              <>
                {displayedList.map((u) => {

                const uId = u.id ?? u._id;
                const currentId = currentUser?.id ?? currentUser?._id;
                const isSelf = Boolean(currentId != null && uId != null && String(currentId) === String(uId));
                const followingUser = uId != null ? isUserFollowed(uId) : false;
                const isActionBusy = uId != null ? Boolean(actionLoading[String(uId)]) : false;

                return (
                  <div
                    key={u.id || u._id || u.username}
                    onClick={() => handleUserClick(u)}
                    className="flex items-center justify-between gap-3 py-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 -mx-3 px-3 rounded-2xl transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.profilePic || "/avatar.jpg"}
                        alt={u.fullName || u.username}
                        onError={(e) => {
                          e.currentTarget.src = "/avatar.jpg";
                        }}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 flex-shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {u.fullName || "User"}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">
                          {u.username ? (u.username.startsWith("@") ? u.username : `@${u.username}`) : "@user"}
                        </p>
                        {(u.headline || u.about) && (
                          <p className="text-xs text-gray-600 dark:text-slate-300 truncate max-w-xs mt-0.5">
                            {u.headline || u.about}
                          </p>
                        )}
                      </div>
                    </div>

                    {currentUser && !isSelf && (
                      <button
                        disabled={isActionBusy}
                        onClick={(e) => handleFollowAction(e, u)}
                        className={`group/btn flex items-center justify-center min-w-[96px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition shadow-2xs flex-shrink-0 cursor-pointer ${
                          followingUser
                            ? "bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-gray-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                            : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white"
                        } ${isActionBusy ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {isActionBusy ? (
                          <i className="bx bx-loader-alt animate-spin text-sm"></i>
                        ) : followingUser ? (
                          <>
                            <span className="group-hover/btn:hidden flex items-center gap-1">
                              <i className="bx bx-check text-sm"></i>
                              <span>Following</span>
                            </span>
                            <span className="hidden group-hover/btn:flex items-center gap-1">
                              <i className="bx bx-user-x text-sm"></i>
                              <span>Unfollow</span>
                            </span>
                          </>
                        ) : (
                          <span className="flex items-center gap-1">
                            <i className="bx bx-user-plus text-sm"></i>
                            <span>Follow</span>
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Load More Button */}
              {!searchQuery &&
                ((activeTab === "followers" && followersHasNext) ||
                  (activeTab === "following" && followingHasNext)) && (
                  <div className="pt-2 pb-1 text-center">
                    <button
                      type="button"
                      disabled={loadingMore}
                      onClick={handleLoadMore}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {loadingMore ? (
                        <>
                          <i className="bx bx-loader-alt animate-spin text-sm"></i>
                          <span>Loading more...</span>
                        </>
                      ) : (
                        <>
                          <i className="bx bx-chevron-down text-sm"></i>
                          <span>Load more</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
            </>
            ) : (
              <div className="py-14 text-center text-gray-400 dark:text-slate-500 space-y-2">
                <i className="bx bx-user-x text-4xl text-gray-300 dark:text-slate-600"></i>
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-400">
                  {searchQuery
                    ? `No ${activeTab} matching "${searchQuery}"`
                    : activeTab === "followers"
                    ? "No followers yet"
                    : "Not following anyone yet"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Unfollow Confirmation Modal Overlay at top level (z-[100]) */}
      {userToUnfollow && (
        <div
          onClick={() => setUserToUnfollow(null)}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150 relative z-[101]"
          >

            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <i className="bx bx-user-minus text-2xl"></i>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Unfollow @{userToUnfollow.username || "user"}?
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Their stories will no longer appear in your feed. You can follow them back at any time.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToUnfollow(null)}
                className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(actionLoading[String(userToUnfollow.id ?? userToUnfollow._id)])}
                onClick={() => executeFollowToggle(userToUnfollow)}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {actionLoading[String(userToUnfollow.id ?? userToUnfollow._id)] ? (
                  <i className="bx bx-loader-alt animate-spin text-sm"></i>
                ) : (
                  <span>Unfollow</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


