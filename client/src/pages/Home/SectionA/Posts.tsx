import React, { useEffect, useState, useMemo, useRef } from 'react';
import { PostCard } from '../../../components/PostCard';
import { blogApi, BlogItem } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';


interface PostsProps {
  activeTab?: 'forYou' | 'following';
  onBlogsLoaded?: (blogs: BlogItem[]) => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const Posts: React.FC<PostsProps> = ({ activeTab = 'forYou', onBlogsLoaded }) => {
  const { user, isLoggedIn } = useAuth();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const followingIds = useMemo(() => {
    return new Set(
      (user?.following || []).map((f: any) =>
        String(typeof f === 'object' && f != null ? (f.id ?? f._id ?? f) : f)
      )
    );
  }, [user?.following]);

  const displayedBlogs = useMemo(() => {
    if (!isLoggedIn || activeTab === 'forYou') {
      return blogs;
    }
    return blogs.filter((blog) => {
      const authorId =
        typeof blog.author === 'object' && blog.author != null
          ? (blog.author.id ?? blog.author._id)
          : blog.author;
      return authorId != null && followingIds.has(String(authorId));
    });
  }, [blogs, activeTab, isLoggedIn, followingIds]);

  const isFetchedRef = useRef(false);

  useEffect(() => {
    if (isFetchedRef.current) return;
    isFetchedRef.current = true;

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await blogApi.getAll(1, 10);
        const fetchedBlogs = res.data?.blogs || (Array.isArray(res.data) ? res.data : []);
        if (fetchedBlogs.length > 0) {
          const shuffledBlogs = shuffleArray(fetchedBlogs);
          setBlogs(shuffledBlogs);
          setHasNextPage(Boolean(res.data?.pagination?.hasNextPage));
          setPage(1);
          onBlogsLoaded?.(shuffledBlogs);
        }
      } catch (err) {
        isFetchedRef.current = false;
        console.error("Failed to load posts from API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await blogApi.getAll(nextPage, 10);
      const newBlogs = res.data?.blogs || [];
      const shuffledNew = shuffleArray(newBlogs);
      setBlogs((prev) => [...prev, ...shuffledNew]);
      setPage(nextPage);
      setHasNextPage(Boolean(res.data?.pagination?.hasNextPage));
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-gray-500 dark:text-slate-400">
          <i className="bx bx-loader-alt animate-spin text-3xl text-indigo-600 mb-2"></i>
          <p className="text-sm font-medium">Loading stories...</p>
        </div>
      ) : activeTab === 'following' ? (
        displayedBlogs.length > 0 ? (
          displayedBlogs.map((blog) => {
            const authorName =
              typeof blog.author === 'object' && blog.author != null
                ? blog.author.fullName || blog.author.name || blog.author.username || 'Author'
                : 'Author';
            const authorAvatar =
              typeof blog.author === 'object' && blog.author != null && blog.author.profilePic
                ? blog.author.profilePic
                : '/avatar.jpg';
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
              ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Recently';

            const blogId = (blog.id || blog._id || '').toString();
            const authorId =
              typeof blog.author === 'object' && blog.author != null
                ? (blog.author.id ?? blog.author._id)?.toString()
                : blog.author?.toString();
            const isFollowingAuthor = authorId ? followingIds.has(authorId) : false;

            return (
              <PostCard
                key={blogId || blog.title}
                id={blogId}
                isFollowing={isFollowingAuthor}
                name={authorName}
                profileImg={authorAvatar}
                authorUsername={typeof blog.author === 'object' && blog.author != null ? blog.author.username : undefined}
                authorId={authorId}
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
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl">
              <i className="bx bx-user-plus"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No stories from followed authors yet</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto">
              {followingIds.size === 0
                ? "You haven't followed any authors yet. Explore trending and suggested authors to personalize your feed."
                : "The authors you follow haven't posted any stories yet."}
            </p>
          </div>
        )
      ) : displayedBlogs.length > 0 ? (
        displayedBlogs.map((blog) => {
          const authorName =
            typeof blog.author === 'object' && blog.author != null
              ? blog.author.fullName || blog.author.name || blog.author.username || 'Author'
              : 'Author';
          const authorAvatar =
            typeof blog.author === 'object' && blog.author != null && blog.author.profilePic
              ? blog.author.profilePic
              : '/avatar.jpg';
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
            ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Recently';

          const blogId = (blog.id || blog._id || '').toString();
          const authorId =
            typeof blog.author === 'object' && blog.author != null
              ? (blog.author.id ?? blog.author._id)?.toString()
              : blog.author?.toString();
          const isFollowingAuthor = authorId ? followingIds.has(authorId) : false;

          return (
            <PostCard
              key={blogId || blog.title}
              id={blogId}
              isFollowing={isFollowingAuthor}
              name={authorName}
              profileImg={authorAvatar}
              authorUsername={typeof blog.author === 'object' && blog.author != null ? blog.author.username : undefined}
              authorId={authorId}
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
        })
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl">
            <i className="bx bx-book-open"></i>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No stories yet</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto">
            Be the first to share an idea or story with the community.
          </p>
        </div>
      )}

      {/* Load More Button */}
      {activeTab === 'forYou' && hasNextPage && (
        <div className="pt-2 pb-4 text-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={handleLoadMore}
            className="px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-800/80 text-gray-800 dark:text-slate-200 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <i className="bx bx-loader-alt animate-spin text-base text-indigo-600"></i>
                <span>Loading more stories...</span>
              </>
            ) : (
              <>
                <span>Load More Stories</span>
                <i className="bx bx-chevron-down text-lg"></i>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};

