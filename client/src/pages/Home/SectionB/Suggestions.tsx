import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { blogApi, userApi } from "../../../services/api";

interface SuggestedProfile {
  id: string | number;
  name: string;
  handle: string;
  followersCount: number;
  followers: string;
  img: string;
  slug: string;
  isFollowing: boolean;
}

const formatFollowers = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M followers`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K followers`;
  return `${count} ${count === 1 ? "follower" : "followers"}`;
};

export const Suggestions = () => {
  const { user, isLoggedIn, refreshUser } = useAuth();
  const [profiles, setProfiles] = useState<SuggestedProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchSuggestions = async () => {
      try {
        setLoading(true);

        const res = await blogApi.getAll(1, 20);
        const blogs = res.data?.blogs || [];

        const currentUserId = user ? String(user.id ?? user._id ?? "") : null;
        const followingIds = new Set(
          (user?.following || []).map((f: any) =>
            String(typeof f === "object" && f != null ? (f.id ?? f._id ?? f) : f)
          )
        );

        const authorMap = new Map<string, any>();
        blogs.forEach((blog) => {
          const author: any = typeof blog.author === "object" && blog.author ? blog.author : null;
          if (!author) return;
          const authorId = String(author.id ?? author._id ?? "");
          if (!authorId || authorId === currentUserId) return;
          if (!authorMap.has(authorId)) {
            authorMap.set(authorId, author);
          }
        });

        if (authorMap.size < 3) {
          try {
            const searchRes = await blogApi.search("a", undefined, 1, 10);
            const searchUsers = searchRes.data?.users || [];
            searchUsers.forEach((u: any) => {
              const uId = String(u.id ?? u._id ?? "");
              if (!uId || uId === currentUserId) return;
              if (!authorMap.has(uId)) {
                authorMap.set(uId, u);
              }
            });
          } catch {
            // search fallback ignored
          }
        }

        const candidates = Array.from(authorMap.values());

        candidates.sort((a, b) => {
          const aId = String(a.id ?? a._id ?? "");
          const bId = String(b.id ?? b._id ?? "");
          const aFollowing = followingIds.has(aId);
          const bFollowing = followingIds.has(bId);
          if (aFollowing === bFollowing) return 0;
          return aFollowing ? 1 : -1;
        });

        const topCandidates = candidates.slice(0, 3);

        const detailed = await Promise.all(
          topCandidates.map(async (author) => {
            const authorId = author.id ?? author._id;
            const uname = author.username || String(authorId);
            try {
              const pRes = await userApi.getProfile(uname, 1, 1);
              const pUser = pRes.data?.user || author;
              const followersCount = Array.isArray(pUser.followers) ? pUser.followers.length : 0;
              const isUserFollowing =
                followingIds.has(String(pUser.id ?? pUser._id)) ||
                (currentUserId != null &&
                  Array.isArray(pUser.followers) &&
                  pUser.followers.some(
                    (f: any) => String(typeof f === "object" && f != null ? (f.id ?? f._id ?? f) : f) === currentUserId
                  ));

              return {
                id: pUser.id ?? pUser._id ?? authorId,
                name: pUser.fullName || (pUser as any).name || pUser.username || "Author",
                handle: `@${pUser.username || "user"}`,
                followersCount,
                followers: formatFollowers(followersCount),
                img: pUser.profilePic || author.profilePic || "/avatar.jpg",
                slug: pUser.username || String(authorId),
                isFollowing: isUserFollowing,
              };
            } catch {
              const followersCount = Array.isArray(author.followers) ? author.followers.length : 0;
              return {
                id: authorId,
                name: author.fullName || (author as any).name || author.username || "Author",
                handle: `@${author.username || "user"}`,
                followersCount,
                followers: formatFollowers(followersCount),
                img: author.profilePic || "/avatar.jpg",
                slug: author.username || String(authorId),
                isFollowing: followingIds.has(String(authorId)),
              };
            }
          })
        );

        if (isMounted) {
          setProfiles(detailed);
        }
      } catch (err) {
        console.error("Failed to load user suggestions:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.following]);

  const toggleFollow = async (index: number) => {
    if (!isLoggedIn || !user) {
      toast.info("Please sign in to follow authors.");
      return;
    }

    const currentUserId = user.id ?? user._id;
    const target = profiles[index];
    if (!target || target.id == null || currentUserId == null) return;

    const targetKey = String(target.id);
    if (followLoading[targetKey]) return;

    setFollowLoading((prev) => ({ ...prev, [targetKey]: true }));
    try {
      const res = await userApi.toggleFollow(target.id, currentUserId);
      const nowFollowing = res.data.following;
      const newCount =
        typeof res.data.followersCount === "number"
          ? res.data.followersCount
          : nowFollowing
          ? target.followersCount + 1
          : Math.max(0, target.followersCount - 1);

      setProfiles((prev) =>
        prev.map((p, i) =>
          i === index
            ? {
                ...p,
                isFollowing: nowFollowing,
                followersCount: newCount,
                followers: formatFollowers(newCount),
              }
            : p
        )
      );

      await refreshUser();
      toast.success(nowFollowing ? `Following ${target.name}` : `Unfollowed ${target.name}`);
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetKey]: false }));
    }
  };

  if (!loading && profiles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:shadow-none select-none">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Who to follow</h2>
        <Link to="/search" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
          View all
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="w-24 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="w-16 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
              </div>
            ))
          : profiles.map((profile, index) => (
              <div key={profile.id} className="flex items-center justify-between gap-3">
                <Link to={`/user/profile/${profile.slug}`} className="flex items-center gap-3 min-w-0 group">
                  <img
                    src={profile.img}
                    alt={profile.name}
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.jpg";
                    }}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-100 dark:ring-slate-700 flex-shrink-0 group-hover:ring-indigo-400 transition"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                      {profile.name}
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-400 truncate">
                      {profile.handle} · {profile.followers}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => toggleFollow(index)}
                  disabled={Boolean(followLoading[String(profile.id)])}
                  className={`px-4 py-1 text-xs font-semibold rounded-full border transition-all duration-150 flex-shrink-0 cursor-pointer ${
                    profile.isFollowing
                      ? "bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700"
                      : "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40"
                  }`}
                >
                  {profile.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">Personalize your feed</h4>
          <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-snug">
            Follow authors to see more of what you love.
          </p>
        </div>

        <Link
          to="/search"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer shadow-xs flex-shrink-0"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};