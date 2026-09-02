import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { shareThis } from '../../utils/shareURL';
import { userApi } from '../../services/api';

import { useAuth } from '../../context/AuthContext';
// import { FollowersModal } from '../../components/Modals/FollowersModal';

interface ArticleItem {
  id: string;
  title: string;
  description: string;
  coverImg: string;
  date: string;
  readTime: string;
  likes: number;
  comments: number;
  views: number;
}

export const UserProfile: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { user: currentUser, refreshUser } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [activeTab, setActiveTab] = useState<'stories' | 'about'>('stories');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'followers' | 'following'>('followers');
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState<boolean>(false);
  const [isFollowBusy, setIsFollowBusy] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const openFollowersModal = (tab: 'followers' | 'following') => {
    setModalTab(tab);
    setIsFollowersModalOpen(true);
  };

  const lookupKey = username?.trim() || currentUser?.username || (currentUser?.id != null ? String(currentUser.id) : undefined);

  const mapBlogToArticle = (b: any): ArticleItem => {
    const firstImg =
      b.content?.find((c: any) => c.type === 'image')?.content || '/blog/blog1.jpg';
    const firstText =
      b.subtitle ||
      b.content?.find((c: any) => c.type === 'text')?.content?.slice(0, 140) ||
      'Read story on Spectrum...';
    const wordCount =
      b.content?.reduce(
        (acc: number, c: any) => (c.type !== 'image' && c.content ? acc + c.content.split(' ').length : acc),
        0
      ) || 80;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    const formattedDate = b.createdAt
      ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recently';

    return {
      id: (b.id || b._id || '').toString(),
      title: b.title,
      description: firstText,
      coverImg: firstImg,
      date: formattedDate,
      readTime,
      likes: b.likes?.length || 0,
      comments: b.comments?.length || 0,
      views: b.views || 0,
    };
  };

  useEffect(() => {
    if (!lookupKey) {
      setLoading(false);
      setProfileUser(null);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setProfileUser(null);
        setArticles([]);
        const res = await userApi.getProfile(lookupKey, 1, 10);
        if (res.data && res.data.user) {
          const rawUser = res.data.user;
          const u = { ...rawUser, id: rawUser.id ?? rawUser._id, _id: rawUser._id ?? rawUser.id };
          const blogs = res.data.blogs || [];

          setProfileUser(u);
          setFollowersCount(u.followers?.length || 0);

          if (currentUser?.id != null) {
            const currentIdStr = String(currentUser.id);
            const hasFollowed =
              u.followers?.some((f: any) => String(f.id ?? f._id ?? f) === currentIdStr) ||
              (currentUser.following || []).some((f: any) => String(f.id ?? f._id ?? f) === String(u.id));
            setIsFollowing(Boolean(hasFollowed));
          } else {
            setIsFollowing(false);
          }

          setArticles(blogs.map(mapBlogToArticle));
          setHasNextPage(Boolean(res.data.pagination?.hasNextPage));
          setPage(1);
        } else {
          setProfileUser(null);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [lookupKey, currentUser?.id]);

  const handleLoadMoreArticles = async () => {
    if (!lookupKey || loadingMore || !hasNextPage) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await userApi.getProfile(lookupKey, nextPage, 10);
      if (res.data && res.data.blogs) {
        setArticles((prev) => [...prev, ...res.data.blogs.map(mapBlogToArticle)]);
        setPage(nextPage);
        setHasNextPage(Boolean(res.data.pagination?.hasNextPage));
      }
    } catch (err) {
      console.error('Failed to load more author articles:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const isOwnProfile = Boolean(
    currentUser?.id != null &&
      profileUser?.id != null &&
      String(currentUser.id) === String(profileUser.id)
  );

  const handleFollowClick = () => {
    if (!currentUser) {
      toast.info("Please sign in to follow authors.");
      return;
    }
    if (profileUser?.id == null || isOwnProfile) return;

    if (isFollowing) {
      setShowUnfollowConfirm(true);
    } else {
      executeToggleFollow();
    }
  };

  const executeToggleFollow = async () => {
    if (profileUser?.id == null || currentUser?.id == null) return;
    setIsFollowBusy(true);
    try {
      const res = await userApi.toggleFollow(profileUser.id, currentUser.id);
      setIsFollowing(res.data.following);
      setFollowersCount(res.data.followersCount);
      await refreshUser();
      toast.success(res.data.following ? `Following ${profileUser.fullName}` : `Unfollowed ${profileUser.fullName}`);
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setIsFollowBusy(false);
      setShowUnfollowConfirm(false);
    }
  };


  const handleShareProfile = async () => {
    const url = window.location.href;
    await shareThis(url, `${profileUser?.fullName || 'Author'} on Spectrum`, profileUser?.about || 'View author profile on Spectrum');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 py-6 pb-16 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="h-36 sm:h-48 bg-slate-200 dark:bg-slate-800"></div>
            <div className="px-6 sm:px-10 pb-8 relative">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-300 dark:bg-slate-700 -mt-16 sm:-mt-20 mb-6 ring-4 ring-white dark:ring-slate-900"></div>
              <div className="space-y-3">
                <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="flex gap-2 pt-2">
                  <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profileUser) {
    return (
      <main className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 py-24 text-center select-none px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
          <i className="bx bx-user-x text-5xl text-gray-400 dark:text-slate-500"></i>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Author Not Found</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">The user profile you are looking for does not exist on Spectrum.</p>
          <Link to="/" className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const name = profileUser.fullName || profileUser.username || "Author";
  const handle = profileUser.username ? (profileUser.username.startsWith('@') ? profileUser.username : `@${profileUser.username}`) : "@author";
  const avatar = profileUser.profilePic || "/avatar.jpg";
  const banner = profileUser.bannerPic || "";
  const bio = profileUser.about || profileUser.headline || "Writer and thinker on Spectrum.";
  const location = profileUser.location || "Global";
  const joined = profileUser.createdAt
    ? `Joined ${new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : "Joined recently";
  const followingCount = profileUser.following?.length || 0;
  const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);

  return (
    <main className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 py-6 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <i className="bx bx-check-circle text-emerald-400 text-base"></i>
          <span>Profile link copied to clipboard!</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 px-3.5 py-1.5 rounded-full transition shadow-2xs cursor-pointer"
          >
            <i className="bx bx-arrow-back text-sm"></i>
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 px-3.5 py-1.5 rounded-full transition shadow-2xs cursor-pointer"
            >
              <i className="bx bx-share-alt text-sm text-gray-600 dark:text-slate-400"></i>
              <span>Share Profile</span>
            </button>
          </div>
        </div>

        {/* Hero Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
          {/* Cover Banner */}
          <div className="h-36 sm:h-48 relative overflow-hidden bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900">
            {banner ? (
              <img
                src={banner}
                alt="Author profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-black/15"></div>
          </div>

          {/* Profile Header Information */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={avatar}
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.src = "/avatar.jpg";
                  }}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-md bg-white dark:bg-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
                {isOwnProfile ? (
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 border border-gray-300 dark:border-slate-700 transition"
                  >
                    <i className="bx bx-edit text-base"></i>
                    <span>Edit Profile</span>
                  </Link>
                ) : (
                  <button
                    disabled={isFollowBusy}
                    onClick={handleFollowClick}
                    className={`group/btn flex items-center justify-center gap-1.5 min-w-[120px] px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 shadow-2xs cursor-pointer ${
                      isFollowing
                        ? 'bg-gray-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-gray-800 dark:text-slate-200 border border-gray-300 dark:border-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'
                    } ${isFollowBusy ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {isFollowBusy ? (
                      <i className="bx bx-loader-alt animate-spin text-base"></i>
                    ) : isFollowing ? (
                      <>
                        <span className="group-hover/btn:hidden flex items-center gap-1.5">
                          <i className="bx bx-check text-base"></i>
                          <span>Following</span>
                        </span>
                        <span className="hidden group-hover/btn:flex items-center gap-1.5">
                          <i className="bx bx-user-x text-base"></i>
                          <span>Unfollow</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="bx bx-user-plus text-base"></i>
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}


                {profileUser.email && (
                  <a
                    href={`mailto:${profileUser.email}`}
                    className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition shadow-2xs"
                    title="Send message"
                  >
                    <i className="bx bx-envelope text-lg"></i>
                  </a>
                )}

                <button
                  onClick={handleShareProfile}
                  className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                  title="Share profile"
                >
                  <i className="bx bx-share-alt text-lg"></i>
                </button>
              </div>
            </div>

            {/* Author Identity & Bio */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {name}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Author
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">
                {handle}
              </p>

              <p className="text-sm sm:text-base text-gray-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                {bio}
              </p>

              {/* Meta details & socials */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-gray-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <i className="bx bx-map text-sm text-gray-400 dark:text-slate-500"></i>
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="bx bx-calendar text-sm text-gray-400 dark:text-slate-500"></i>
                  <span>{joined}</span>
                </div>
                {profileUser.website && (
                  <div className="flex items-center gap-1.5">
                    <i className="bx bx-link text-sm text-gray-400 dark:text-slate-500"></i>
                    <a
                      href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      {profileUser.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Stats Counters */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('stories')}
                  className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center"
                >
                  <span className="font-extrabold text-gray-900 dark:text-white mr-1">{articles.length}</span>
                  <span className="text-gray-500 dark:text-slate-400">Stories</span>
                </button>
                <button
                  type="button"
                  onClick={() => openFollowersModal('followers')}
                  className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center"
                >
                  <span className="font-extrabold text-gray-900 dark:text-white mr-1">{followersCount.toLocaleString()}</span>
                  <span className="text-gray-500 dark:text-slate-400">Followers</span>
                </button>
                <button
                  type="button"
                  onClick={() => openFollowersModal('following')}
                  className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center"
                >
                  <span className="font-extrabold text-gray-900 dark:text-white mr-1">{followingCount}</span>
                  <span className="text-gray-500 dark:text-slate-400">Following</span>
                </button>
                <div>
                  <span className="font-extrabold text-gray-900 dark:text-white mr-1">{totalViews.toLocaleString()}</span>
                  <span className="text-gray-500 dark:text-slate-400">Views</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Profile Content Body: Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm px-6 flex items-center gap-6">
              <button
                onClick={() => setActiveTab('stories')}
                className={`py-4 text-sm font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'stories'
                    ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <i className="bx bx-book-open text-base"></i>
                <span>Stories ({articles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 text-sm font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'about'
                    ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <i className="bx bx-user text-base"></i>
                <span>About</span>
              </button>
            </div>

            {/* Stories Tab */}
            {activeTab === 'stories' && (
              <div className="space-y-4">
                {articles.length > 0 ? (
                  <>
                    {articles.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow transition-all duration-150 group"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                          <div className="flex-1 min-w-0">
                            {/* Date & Read Time */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-500 dark:text-slate-400">{post.date}</span>
                              <span className="text-xs text-gray-400 dark:text-slate-500">·</span>
                              <span className="text-xs text-gray-500 dark:text-slate-400">{post.readTime}</span>
                            </div>

                            {/* Title */}
                            <Link to={`/blog/${post.id}`}>
                              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug mb-2 cursor-pointer">
                                {post.title}
                              </h2>
                            </Link>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-4">
                              {post.description}
                            </p>

                            {/* Post Card Footer Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 hover:text-red-500">
                                  <i className="bx bx-heart text-base"></i>
                                  <span>{post.likes}</span>
                                </span>

                                <Link to={`/blog/${post.id}`} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition">
                                  <i className="bx bx-message-rounded text-base"></i>
                                  <span>{post.comments}</span>
                                </Link>

                                <span className="flex items-center gap-1 text-gray-400 dark:text-slate-500" title="Views">
                                  <i className="bx bx-show text-base"></i>
                                  <span>{post.views}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Thumbnail */}
                          {post.coverImg && (
                            <Link to={`/blog/${post.id}`} className="flex-shrink-0 w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                              <img
                                src={post.coverImg}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Load More Stories Button */}
                    {hasNextPage && (
                      <div className="pt-2 pb-2 text-center">
                        <button
                          type="button"
                          disabled={loadingMore}
                          onClick={handleLoadMoreArticles}
                          className="px-6 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 text-gray-800 dark:text-slate-200 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loadingMore ? (
                            <>
                              <i className="bx bx-loader-alt animate-spin text-sm text-indigo-600 dark:text-indigo-400"></i>
                              <span>Loading more stories...</span>
                            </>
                          ) : (
                            <>
                              <span>Load More Stories</span>
                              <i className="bx bx-chevron-down text-base"></i>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 text-sm">
                    No stories published yet.
                  </div>
                )}

              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Biography</h3>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Connect</h3>
                  <div className="flex flex-wrap gap-3">
                    {profileUser.twitter && (
                      <a
                        href={profileUser.twitter.startsWith('http') ? profileUser.twitter : `https://x.com/${profileUser.twitter}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
                      >
                        <i className="bx bxl-twitter text-base text-sky-500"></i>
                        <span>Twitter / X</span>
                      </a>
                    )}
                    {profileUser.github && (
                      <a
                        href={profileUser.github.startsWith('http') ? profileUser.github : `https://github.com/${profileUser.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
                      >
                        <i className="bx bxl-github text-base text-gray-900 dark:text-white"></i>
                        <span>GitHub</span>
                      </a>
                    )}
                    {profileUser.linkedin && (
                      <a
                        href={profileUser.linkedin.startsWith('http') ? profileUser.linkedin : `https://linkedin.com/in/${profileUser.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
                      >
                        <i className="bx bxl-linkedin text-base text-blue-600"></i>
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {profileUser.website && (
                      <a
                        href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
                      >
                        <i className="bx bx-globe text-base text-indigo-600 dark:text-indigo-400"></i>
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Author Summary Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <i className="bx bx-user text-indigo-600 dark:text-indigo-400 text-base"></i>
                <span>About Author</span>
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
                {bio}
              </p>
              <div className="text-xs text-gray-500 dark:text-slate-400 space-y-1.5 pt-3 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Member Since</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{joined.replace('Joined ', '')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Reads</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{totalViews.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        initialTab={modalTab}
        userId={profileUser?.id ?? profileUser?._id}
        username={profileUser?.username}
        onCountChange={refreshUser}
      />

      {/* Unfollow Confirmation Modal */}
      {showUnfollowConfirm && profileUser && (
        <div
          onClick={() => setShowUnfollowConfirm(false)}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150 relative z-[101]"
          >

            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <i className="bx bx-user-minus text-2xl"></i>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Unfollow @{profileUser.username || "author"}?
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Their stories will no longer appear in your feed. You can follow them back at any time.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowUnfollowConfirm(false)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isFollowBusy}
                onClick={executeToggleFollow}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isFollowBusy ? (
                  <i className="bx bx-loader-alt animate-spin text-sm"></i>
                ) : (
                  <span>Unfollow</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};


