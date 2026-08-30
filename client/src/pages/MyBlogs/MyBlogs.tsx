import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { shareThis } from '../../utils/shareURL';
import { blogApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Story {
  id: string;
  title: string;
  subtitle: string;
  coverImg: string;
  date: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
  status: 'published' | 'draft' | 'archived';
  lastEdited?: string;
}

export const MyBlogs: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'published' | 'archived'>('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const fetchUserBlogs = async () => {
      const currentUserId = user?._id || user?.id || user?.username;
      if (!currentUserId) {
        setStories([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let userBlogs: any[] = [];

        // 1. Try dedicated user blogs endpoint
        try {
          const res = await blogApi.getByUser(currentUserId, 1, 50);
          const list = res.data?.blogs || (Array.isArray(res.data) ? res.data : []);
          if (list.length > 0) {
            userBlogs = list;
          }
        } catch {
          // fallback to all blogs
        }

        // 2. Fallback to getAll and filter client-side
        if (userBlogs.length === 0) {
          try {
            const allRes = await blogApi.getAll(1, 50);
            const allList = allRes.data?.blogs || (Array.isArray(allRes.data) ? allRes.data : []);
            if (allList.length > 0) {
              userBlogs = allList.filter((b) => {
                const authorId = typeof b.author === 'object' ? (b.author?._id ?? b.author?.id) : b.author;
                const authorUsername = typeof b.author === 'object' ? b.author?.username : null;
                const uid = (user._id ?? user.id)?.toString();
                return (
                  (uid && authorId && authorId.toString() === uid) ||
                  (user.username && authorUsername === user.username) ||
                  (user.blogs && user.blogs.some((blogId: any) => blogId?.toString() === (b.id || b._id || '').toString()))
                );
              });
            }
          } catch (err) {
            console.error('Fallback getAll error:', err);
          }
        }


        if (userBlogs.length > 0) {
          const mappedStories: Story[] = userBlogs.map((b) => {
            const firstImg =
              b.content?.find((c: any) => c.type === 'image')?.content || '/blog/blog1.jpg';
            const firstText =
              b.subtitle ||
              b.content?.find((c: any) => c.type === 'text')?.content?.slice(0, 120) ||
              '';
            const wordCount =
              b.content?.reduce(
                (acc: number, c: any) => (c.type !== 'image' && c.content ? acc + c.content.split(' ').length : acc),
                0
              ) || 50;
            const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
            const formattedDate = b.createdAt
              ? new Date(b.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recently';

            return {
              id: (b.id || b._id || '').toString(),
              title: b.title,
              subtitle: firstText,
              coverImg: firstImg,
              date: formattedDate,
              readTime,
              views: b.views || 0,
              likes: b.likes?.length || 0,
              comments: b.comments?.length || 0,
              status: 'published',
            };
          });

          setStories(mappedStories);
        } else {
          setStories([]);
        }
      } catch (err) {
        console.error('Error fetching user blogs:', err);
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBlogs();
  }, [user, isAuthLoading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDeleteStory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await blogApi.delete(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
      showToast('Story deleted successfully');
    } catch {
      showToast('Failed to delete story');
    }
  };

  const handleShareStory = async (story: Story, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${story.id}`;
    await shareThis(url, story.title, story.subtitle);
    showToast('Story link copied to clipboard');
  };

  const filteredStories = stories.filter((story) => {
    const matchesTab = story.status === activeTab;
    const matchesQuery =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const publishedCount = stories.filter((s) => s.status === 'published').length;
  const archivedCount = stories.filter((s) => s.status === 'archived').length;

  const totalViews = stories
    .filter((s) => s.status === 'published')
    .reduce((acc, s) => acc + s.views, 0);

  const totalLikes = stories
    .filter((s) => s.status === 'published')
    .reduce((acc, s) => acc + s.likes, 0);


  if (isLoading || isAuthLoading) {
    return (
      <main className="min-h-[80vh] bg-[#f4f5f7] dark:bg-slate-950 flex items-center justify-center py-16 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xs p-8 text-center max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mx-auto">
            <i className="bx bx-loader-alt animate-spin text-2xl text-indigo-600"></i>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">Loading your stories...</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Please wait a moment</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[80vh] bg-[#f4f5f7] dark:bg-slate-950 flex items-center justify-center py-16 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xs p-8 sm:p-12 text-center max-w-md w-full space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto text-3xl">
            <i className="bx bx-lock-alt"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign in to view your stories</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            You need to be signed in to manage, edit, and track metrics for your stories on Spectrum.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 py-8 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <i className="bx bx-check-circle text-emerald-400 text-base"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header & New Story Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              My Stories & Blogs
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
              Manage, publish, track metrics, and edit your writing on Spectrum
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/user/profile"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold border border-gray-300 dark:border-slate-700 transition shadow-2xs"
            >
              <i className="bx bx-show text-sm text-indigo-600 dark:text-indigo-400"></i>
              <span>Public Author View</span>
            </Link>

            <Link
              to="/create-post"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold transition shadow-2xs"
            >
              <i className="bx bx-plus text-base"></i>
              <span>Write Story</span>
            </Link>
          </div>
        </div>

        {/* Analytics Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Stories</span>
              <i className="bx bx-book-open text-lg text-indigo-600 dark:text-indigo-400"></i>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{publishedCount}</div>
            <span className="text-[11px] text-gray-400 dark:text-slate-500">Published stories</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Views</span>
              <i className="bx bx-show text-lg text-emerald-600 dark:text-emerald-400"></i>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{totalViews.toLocaleString()}</div>
            <span className="text-[11px] text-gray-400 dark:text-slate-500">Lifetime reads</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Likes</span>
              <i className="bx bxs-heart text-lg text-rose-500"></i>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{totalLikes.toLocaleString()}</div>
            <span className="text-[11px] text-gray-400 dark:text-slate-500">Total reader likes</span>
          </div>
        </div>

        {/* Stories Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Tabs & Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('published')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeTab === 'published'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Published</span>
                <span className="text-[11px] bg-white dark:bg-slate-800 px-2 py-0.2 rounded-full border border-gray-200 dark:border-slate-700">
                  {publishedCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('archived')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeTab === 'archived'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Archived</span>
                <span className="text-[11px] bg-white dark:bg-slate-800 px-2 py-0.2 rounded-full border border-gray-200 dark:border-slate-700">
                  {archivedCount}
                </span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm"></i>
              <input
                type="text"
                placeholder="Search your stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 rounded-full focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Stories List */}
          {filteredStories.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => navigate(story.status === 'published' ? `/blog/${story.id}` : `/edit-post/${story.id}`)}
                  className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-5 group cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-2xl sm:p-4 -mx-2 transition"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    {story.coverImg && (
                      <div className="w-20 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex-shrink-0">
                        <img
                          src={story.coverImg}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {story.status === 'published' ? story.date : `Saved ${story.lastEdited}`}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">·</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{story.readTime}</span>
                      </div>

                      <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate leading-snug">
                        {story.title}
                      </h2>

                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate leading-relaxed">
                        {story.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Metrics Column */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                    {story.status === 'published' ? (
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-1" title="Views">
                          <i className="bx bx-show text-sm text-gray-400 dark:text-slate-500"></i>
                          <span>{story.views.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1" title="Likes">
                          <i className="bx bx-heart text-sm text-gray-400 dark:text-slate-500"></i>
                          <span>{story.likes}</span>
                        </span>
                        <span className="flex items-center gap-1" title="Responses">
                          <i className="bx bx-message-rounded text-sm text-gray-400 dark:text-slate-500"></i>
                          <span>{story.comments}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full">
                        Draft
                      </span>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-post/${story.id}`);
                        }}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 flex items-center justify-center transition border border-gray-200 dark:border-slate-700 cursor-pointer"
                        title="Edit story"
                      >
                        <i className="bx bx-edit text-sm"></i>
                      </button>

                      {story.status === 'published' && (
                        <button
                          onClick={(e) => handleShareStory(story, e)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 flex items-center justify-center transition border border-gray-200 dark:border-slate-700 cursor-pointer"
                          title="Share link"
                        >
                          <i className="bx bx-share-alt text-sm"></i>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDeleteStory(story.id, e)}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-gray-500 dark:text-slate-400 flex items-center justify-center transition border border-gray-200 dark:border-slate-700 cursor-pointer"
                        title="Delete story"
                      >
                        <i className="bx bx-trash text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl border border-indigo-100 dark:border-indigo-900">
                <i className="bx bx-book-content"></i>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {searchQuery ? "No matching stories found" : `No ${activeTab} stories`}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search query or clear the filter."
                    : activeTab === 'archived'
                    ? "You have no archived stories."
                    : "You haven't published any stories yet. Start writing today!"}
                </p>
              </div>
              <Link
                to="/create-post"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-2xs"
              >
                <i className="bx bx-plus text-base"></i>
                <span>Write Story</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
