import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { blogApi, BlogItem, User } from '../../services/api';
import { PostCard } from '../../components/PostCard';

type SearchTab = 'all' | 'stories' | 'authors';

export const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [authors, setAuthors] = useState<User[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setInputQuery(q);

    const fetchResults = async () => {
      if (!q) {
        setBlogs([]);
        setAuthors([]);
        setHasNextPage(false);
        return;
      }

      try {
        setLoading(true);
        const res = await blogApi.search(q, undefined, 1, 12);
        if (res.data) {
          setBlogs(res.data.blogs || []);
          setAuthors(res.data.users || []);
          setHasNextPage(Boolean(res.data.pagination?.hasNextPage));
          setPage(1);
        }
      } catch (err) {
        console.error('Search error:', err);
        setBlogs([]);
        setAuthors([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await blogApi.search(queryParam, undefined, nextPage, 12);
      if (res.data && res.data.blogs) {
        setBlogs((prev) => [...prev, ...(res.data.blogs || [])]);
        setPage(nextPage);
        setHasNextPage(Boolean(res.data.pagination?.hasNextPage));
      }
    } catch (err) {
      console.error('Failed to load more search results:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputQuery.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const totalResults = blogs.length + authors.length;
  const currentSearchTerm = queryParam;

  return (
    <main className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 py-8 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search Header Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              {currentSearchTerm ? `Search results for "${currentSearchTerm}"` : 'Explore & Search Spectrum'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
              Discover stories, perspectives, and inspiring writers.
            </p>
          </div>

          {/* Large Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 dark:text-slate-500"></i>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Search by story title, content, or author..."
              className="w-full pl-12 pr-28 py-3.5 bg-gray-50/80 dark:bg-slate-800/80 hover:bg-gray-100/60 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition shadow-2xs"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-2xs"
            >
              Search
            </button>
          </form>

          {/* Filter Tabs */}
          {currentSearchTerm && (
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('stories')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'stories'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                Stories ({blogs.length})
              </button>
              <button
                onClick={() => setActiveTab('authors')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'authors'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                Authors ({authors.length})
              </button>
            </div>
          )}
        </div>

        {/* Results Area */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 border border-gray-200 dark:border-slate-800 text-center space-y-3">
            <i className="bx bx-loader-alt animate-spin text-4xl text-indigo-600"></i>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Searching Spectrum...</p>
          </div>
        ) : !currentSearchTerm ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 sm:p-16 border border-gray-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-3xl border border-indigo-100 dark:border-indigo-900">
              <i className="bx bx-compass"></i>
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Explore Stories & Writers</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                Type a keyword above to find stories by title or content, or search writer names.
              </p>
            </div>
          </div>
        ) : totalResults === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 border border-gray-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 flex items-center justify-center mx-auto text-3xl border border-gray-200 dark:border-slate-700">
              <i className="bx bx-search-alt"></i>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No results found for "{currentSearchTerm}"</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                Try checking for spelling errors, using more general keywords, or searching by author name.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Matching Authors Section (in All or Authors tab) */}
            {(activeTab === 'all' || activeTab === 'authors') && authors.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="bx bx-user text-indigo-600 dark:text-indigo-400 text-base"></i>
                    <span>Authors</span>
                  </h2>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{authors.length} writers</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {authors.map((author) => (
                    <Link
                      key={(author.id || author._id || author.username)}
                      to={`/user/profile/${author.username || author.id || author._id}`}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/60 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 hover:border-indigo-200 dark:hover:border-indigo-800 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={author.profilePic || '/avatar.jpg'}
                          alt={author.fullName}
                          onError={(e) => {
                            e.currentTarget.src = '/avatar.jpg';
                          }}
                          className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-200 dark:ring-slate-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                            {author.fullName}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">@{author.username || 'author'}</p>
                          {author.headline && (
                            <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5">{author.headline}</p>
                          )}
                        </div>
                      </div>
                      <i className="bx bx-chevron-right text-lg text-gray-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex-shrink-0 ml-2"></i>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Stories Section (in All or Stories tab) */}
            {(activeTab === 'all' || activeTab === 'stories') && blogs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="bx bx-book-open text-indigo-600 dark:text-indigo-400 text-base"></i>
                    <span>Stories ({blogs.length})</span>
                  </h2>
                </div>

                <div className="flex flex-col gap-5">
                  {blogs.map((blog) => {
                    const author = typeof blog.author === 'object' ? blog.author : ({} as any);
                    const authorName = author.fullName || author.name || author.username || 'Author';
                    const authorAvatar = author.profilePic || '/avatar.jpg';
                    const firstImage =
                      blog.content?.find((c) => c.type === 'image')?.content || '/blog/blog1.jpg';
                    const firstText =
                      blog.subtitle ||
                      blog.content?.find((c) => c.type === 'text')?.content?.slice(0, 160) ||
                      'Read full story on Spectrum...';
                    const wordCount =
                      blog.content?.reduce(
                        (acc, c) => (c.type !== 'image' && c.content ? acc + c.content.split(' ').length : acc),
                        0
                      ) || 120;
                    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
                    const formattedDate = blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recently';

                    const blogId = (blog.id || blog._id || '').toString();
                    return (
                      <PostCard
                        key={blogId || blog.title}
                        id={blogId}
                        name={authorName}
                        profileImg={authorAvatar}
                        authorUsername={author.username}
                        authorId={author.id || author._id}
                        date={formattedDate}
                        readTime={readTime}
                        title={blog.title}
                        description={firstText}
                        postImg={firstImage}
                        likes={blog.likes?.length || 0}
                        comments={blog.comments?.length || 0}
                        url={window.location.origin + `/blog/${blogId}`}
                      />
                    );
                  })}
                </div>

                {/* Load More Stories Button */}
                {hasNextPage && (
                  <div className="pt-2 pb-4 text-center">
                    <button
                      type="button"
                      disabled={loadingMore}
                      onClick={handleLoadMore}
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
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
};
