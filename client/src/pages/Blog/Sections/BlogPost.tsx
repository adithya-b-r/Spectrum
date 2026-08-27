import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { shareThis } from "../../../utils/shareURL";
import { AudioPlayer } from "./AudioPlayer";
import { PostFeedbackBar } from "./PostFeedbackBar";
import { AuthorCard } from "./AuthorCard";
import { CommentsSection, CommentItem } from "./CommentsSection";
import { RecommendedBlogs } from "./RecommendedBlogs";
import { blogApi, userApi, BlogItem } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

export const BlogPost = () => {
  const { id } = useParams<{ id?: string }>();
  const { user: currentUser, refreshUser } = useAuth();

  const [blogData, setBlogData] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsPage, setCommentsPage] = useState<number>(1);
  const [hasMoreComments, setHasMoreComments] = useState<boolean>(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<{ src: string; caption?: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImg(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await blogApi.getById(id);
        if (res.data) {
          const blog: any = (res.data as any).blog || res.data;
          setBlogData(blog);

          // Likes
          const likesArray = blog.likes || [];
          setLikesCount(likesArray.length);
          if (currentUser?._id || (currentUser as any)?.id) {
            const currentUserId = (currentUser?._id || (currentUser as any)?.id)?.toString();
            setLiked(likesArray.some((lId: any) => (lId.id || lId._id || lId).toString() === currentUserId));
            setSaved(Boolean(currentUser?.savedPosts?.some((sId: any) => (sId.id || sId._id || sId).toString() === (blog.id || blog._id)?.toString())));
          }

          // Author follow status
          const author = typeof blog.author === 'object' ? blog.author : null;
          if (author && (currentUser?._id || (currentUser as any)?.id)) {
            const currentUserId = (currentUser?._id || (currentUser as any)?.id)?.toString();
            const authorFollowers = (author as any).followers || [];
            const authorIdStr = (author.id || author._id || '').toString();
            const isUserFollowing = authorFollowers.some(
              (fId: any) => (fId.id || fId._id || fId).toString() === currentUserId
            ) || (currentUser?.following || []).some(
              (fId: any) => (fId.id || fId._id || fId).toString() === authorIdStr
            );
            setIsFollowing(Boolean(isUserFollowing));
          }

          // Comments pagination fetch
          try {
            const commentsRes = await blogApi.getComments(id, 1, 10);
            if (commentsRes.data && commentsRes.data.comments) {
              setComments(commentsRes.data.comments);
              setHasMoreComments(Boolean(commentsRes.data.pagination?.hasNextPage));
              setCommentsPage(1);
            } else if (Array.isArray(blog.comments)) {
              setComments(blog.comments);
            }
          } catch {
            if (Array.isArray(blog.comments)) {
              setComments(blog.comments);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load blog by id:", err);
      } finally {
        setLoading(false);
      }
    };


    fetchBlog();
  }, [id, currentUser?._id]);

  const [activeHighlight, setActiveHighlight] = useState<{
    blockId: string;
    start: number;
    end: number;
  } | null>(null);

  const story = blogData;
  const title = story?.title || "Untitled Story";
  const rawSections = Array.isArray(story?.content) ? story.content : [];
  const subtitle =
    story?.subtitle?.trim() ||
    rawSections.find((s: any) => s?.type === "subtitle")?.content?.trim() ||
    "";
  const sections = rawSections.filter(
    (s: any) => s && s.type !== "subtitle" && (!subtitle || s.content?.trim() !== subtitle)
  );

  const { storyText, speechBlocks } = useMemo(() => {
    const blocks: { id: string; text: string; startIndex: number; endIndex: number }[] = [];
    let fullText = "";

    const addBlock = (id: string, text: string) => {
      if (!text || !text.trim()) return;
      if (fullText.length > 0) {
        fullText += ". ";
      }
      const startIndex = fullText.length;
      fullText += text;
      const endIndex = fullText.length;
      blocks.push({ id, text, startIndex, endIndex });
    };

    if (title && title.trim()) {
      addBlock("title", title);
    }
    if (subtitle && subtitle.trim()) {
      addBlock("subtitle", subtitle);
    }

    sections.forEach((section: any, idx: number) => {
      if (section.type !== "image" && section.content && section.content.trim()) {
        addBlock(`sec-${idx}`, section.content);
      }
    });

    return { storyText: fullText, speechBlocks: blocks };
  }, [title, subtitle, sections]);

  const handleSpeechBoundary = useCallback(
    (charIndex: number, charLength: number) => {
      const block = speechBlocks.find(
        (b) => charIndex >= b.startIndex && charIndex < b.endIndex
      );

      if (block) {
        let s = charIndex - block.startIndex;
        while (s < block.text.length && /\s/.test(block.text[s])) {
          s++;
        }
        let e = s + charLength;
        if (!charLength || charLength <= 0 || e <= s) {
          const match = block.text.slice(s).match(/^[\w\u00C0-\u024F\u1E00-\u1EFF'-]+/);
          e = s + (match ? match[0].length : 1);
        }
        e = Math.min(block.text.length, Math.max(s + 1, e));

        setActiveHighlight({
          blockId: block.id,
          start: s,
          end: e,
        });
      }
    },
    [speechBlocks]
  );

  useEffect(() => {
    if (!isPlayingAudio) {
      setActiveHighlight(null);
    }
  }, [isPlayingAudio]);

  useEffect(() => {
    if (!activeHighlight) return;
    const activeEl = document.querySelector('[data-speech-active="true"]');
    if (activeEl) {
      const rect = activeEl.getBoundingClientRect();
      const isOutOfView = rect.top < 90 || rect.bottom > window.innerHeight - 110;
      if (isOutOfView) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeHighlight]);

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-500">
        <i className="bx bx-loader-alt animate-spin text-4xl text-indigo-600 mb-3"></i>
        <p className="text-sm font-semibold">Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="py-24 text-center text-gray-500 space-y-3">
        <i className="bx bx-error-circle text-4xl text-gray-400"></i>
        <h2 className="text-lg font-bold text-gray-800">Story Not Found</h2>
        <p className="text-xs text-gray-500">The story you are looking for does not exist or has been removed.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  const author = typeof story.author === 'object' ? story.author : ({} as any);
  const authorName = author.fullName || author.name || author.username || "Author";
  const authorAvatar = author.profilePic || "/avatar.jpg";
  const authorId = (author.id || author._id || story.author || '').toString();
  const storyId = (story.id || story._id || id || '').toString();
  const currentUserId = (currentUser?._id || (currentUser as any)?.id || '').toString();

  const isOwnPost = Boolean(
    currentUser && (
      (authorId && (currentUserId === authorId || currentUserId === authorId.toString())) ||
      (author.username && currentUser.username === author.username)
    )
  );

  const totalWords = sections
    .filter((s: any) => s.type !== 'image' && s.content)
    .reduce((acc: number, s: any) => acc + (s.content?.trim().split(/\s+/).filter(Boolean).length || 0), 0);
  const readTime = `${Math.max(1, Math.ceil(totalWords / 200))} min read`;

  const dateString = story.createdAt
    ? new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';



  const renderHighlightedText = (
    text: string,
    highlight?: { start: number; end: number } | null
  ) => {
    if (!highlight || highlight.start >= highlight.end || highlight.start >= text.length) {
      return text;
    }

    const s = Math.max(0, highlight.start);
    const e = Math.min(text.length, highlight.end);

    const before = text.slice(0, s);
    const word = text.slice(s, e);
    const after = text.slice(e);

    return (
      <>
        {before}
        <mark
          data-speech-active="true"
          className="bg-amber-200 text-gray-900 dark:bg-amber-400/35 dark:text-amber-100 rounded px-1 py-0.5 font-medium transition-all duration-150 shadow-xs"
        >
          {word}
        </mark>
        {after}
      </>
    );
  };

  const headingsList = sections
    .map((s: any, idx: number) => ({ ...s, originalIdx: idx }))
    .filter((s: any) => s.type === 'heading' && s.content?.trim());

  const handleShare = async () => {
    const url = window.location.href;
    await shareThis(url, title, subtitle || 'Check out this story on Spectrum');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const toggleLiked = async () => {
    if (!currentUser) {
      toast.info("Please sign in to like this story.");
      return;
    }

    try {
      const res = await blogApi.toggleLike(storyId, currentUserId);
      setLiked(res.data.liked);
      setLikesCount(typeof res.data.likesCount === 'number' ? res.data.likesCount : likesCount);
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const toggleSaved = async () => {
    if (!currentUser) {
      toast.info("Please sign in to save stories.");
      return;
    }

    try {
      const res = await blogApi.toggleSave(storyId, currentUserId);
      const newSavedState = res.data.saved;
      setSaved(newSavedState);
      await refreshUser();
      toast.success(newSavedState ? "Story saved to bookmarks!" : "Story removed from bookmarks");
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser) {
      toast.info("Please sign in to follow authors.");
      return;
    }

    if (!authorId || isOwnPost) return;

    try {
      const res = await userApi.toggleFollow(authorId, currentUserId);
      setIsFollowing(res.data.following);
      await refreshUser();
      toast.success(res.data.following ? `Following ${authorName}` : `Unfollowed ${authorName}`);
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!currentUser) {
      toast.info("Please sign in to post a comment.");
      return;
    }

    try {
      const res = await blogApi.addComment(storyId, { content, userId: currentUserId });
      if (res.data && res.data.comment) {
        setComments([res.data.comment, ...comments]);
        toast.success("Response added!");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
      toast.error("Failed to post response");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await blogApi.deleteComment(storyId, commentId);
      setComments(comments.filter((c) => c._id !== commentId && (c as any).id?.toString() !== commentId));
      toast.success("Comment deleted");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment");
    }
  };

  const handleLoadMoreComments = async () => {
    if (!id || loadingMoreComments || !hasMoreComments) return;
    try {
      setLoadingMoreComments(true);
      const nextPage = commentsPage + 1;
      const res = await blogApi.getComments(id, nextPage, 10);
      if (res.data && res.data.comments) {
        setComments((prev) => [...prev, ...(res.data.comments || [])]);
        setCommentsPage(nextPage);
        setHasMoreComments(Boolean(res.data.pagination?.hasNextPage));
      }
    } catch (err) {
      console.error("Failed to load more comments:", err);
    } finally {
      setLoadingMoreComments(false);
    }
  };


  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="select-none relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <i className="bx bx-check-circle text-emerald-400 text-base"></i>
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* Real Web Speech Audio Player */}
      {isPlayingAudio && (
        <AudioPlayer
          textToRead={storyText}
          title={title}
          onClose={() => {
            setIsPlayingAudio(false);
            setActiveHighlight(null);
          }}
          onBoundary={handleSpeechBoundary}
          onEnd={() => setActiveHighlight(null)}
        />
      )}

      {/* Floating Desktop Action Dock */}
      <div className="hidden xl:flex fixed left-[max(1.5rem,calc(50%-430px))] top-52 flex-col items-center gap-5 text-gray-400 dark:text-slate-500 z-10">
        <button
          onClick={toggleLiked}
          title="Like story"
          className={`flex flex-col items-center gap-1 transition cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 ${
            liked ? "text-red-500 font-semibold" : "hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <i className={`bx ${liked ? "bxs-heart text-red-500" : "bx-heart"} text-2xl`}></i>
          <span className="text-xs">{likesCount}</span>
        </button>

        <button
          title="Responses"
          onClick={() => scrollToSection("responses-section")}
          className="flex flex-col items-center gap-1 hover:text-gray-900 dark:hover:text-white transition cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <i className="bx bx-message-rounded text-2xl"></i>
          <span className="text-xs">{comments.length}</span>
        </button>

        <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800 my-1"></div>

        <button
          title={isPlayingAudio ? "Pause Audio" : "Listen to Story"}
          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
          className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
            isPlayingAudio ? "text-indigo-600 dark:text-indigo-400" : "hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <i className={`bx ${isPlayingAudio ? "bx-pause-circle" : "bx-play-circle"} text-2xl`}></i>
        </button>

        <button
          title={saved ? "Saved" : "Save Story"}
          onClick={toggleSaved}
          className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
            saved ? "text-indigo-600 dark:text-indigo-400 font-semibold" : "hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <i className={`bx ${saved ? "bxs-bookmark text-indigo-600 dark:text-indigo-400" : "bx-bookmark"} text-2xl`}></i>
        </button>

        <button
          title="Share"
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
        >
          <i className="bx bx-share-alt text-2xl"></i>
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-[44px] font-black text-[#242424] dark:text-white leading-[1.18] tracking-tight mb-3 font-sans">
        {renderHighlightedText(title, activeHighlight?.blockId === "title" ? activeHighlight : null)}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-lg sm:text-xl text-gray-500 dark:text-slate-400 font-normal leading-relaxed mb-6 font-sans">
          {renderHighlightedText(subtitle, activeHighlight?.blockId === "subtitle" ? activeHighlight : null)}
        </p>
      )}

      {/* Author Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/user/profile/${author.username || author.id || author._id || authorId || ''}`}
            className="flex items-center gap-3 group"
          >
            <img
              src={authorAvatar}
              alt={authorName}
              onError={(e) => {
                e.currentTarget.src = "/avatar.jpg";
              }}
              className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-indigo-400 transition"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#242424] dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 hover:underline">
                {authorName}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                <span>{readTime}</span>
                <span>·</span>
                <span>{dateString}</span>
              </div>
            </div>
          </Link>

          {isOwnPost ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 dark:text-slate-500">·</span>
              <Link
                to={`/edit-post/${story.id || story._id || id}`}
                className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
              >
                <i className="bx bx-edit text-xs"></i>
                <span>Edit Story</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 dark:text-slate-500">·</span>
              <button
                type="button"
                onClick={toggleFollow}
                className={`font-semibold cursor-pointer transition ${
                  isFollowing ? "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between py-3 my-6 border-y border-slate-200/80 dark:border-slate-800 text-gray-500 dark:text-slate-400">
        <div className="flex items-center gap-6 text-sm">
          <button
            onClick={toggleLiked}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              liked ? "text-red-500 font-semibold" : "hover:text-gray-800 dark:hover:text-slate-200"
            }`}
          >
            <i className={`bx ${liked ? "bxs-heart text-red-500" : "bx-heart"} text-xl`}></i>
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => scrollToSection("responses-section")}
            className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <i className="bx bx-message-rounded text-xl"></i>
            <span>{comments.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xl">
          <button
            title={isPlayingAudio ? "Pause Audio" : "Listen to Story"}
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`p-1 transition cursor-pointer ${
              isPlayingAudio ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <i className={`bx ${isPlayingAudio ? "bx-pause-circle" : "bx-play-circle"} text-2xl`}></i>
          </button>
          <button
            title={saved ? "Saved" : "Save"}
            onClick={toggleSaved}
            className={`p-1 transition cursor-pointer ${
              saved ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <i className={`bx ${saved ? "bxs-bookmark text-indigo-600 dark:text-indigo-400" : "bx-bookmark"}`}></i>
          </button>
          <button
            title="Share"
            onClick={handleShare}
            className="p-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
          >
            <i className="bx bx-share-alt"></i>
          </button>
        </div>
      </div>

      {/* Quick Outline Jump Pills */}
      {headingsList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-6">
          <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0 mr-1">
            Sections:
          </span>
          {headingsList.map((h: any, i: number) => (
            <button
              key={i}
              onClick={() => scrollToSection(`sec-${h.originalIdx}`)}
              className="text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer"
            >
              {h.content}
            </button>
          ))}
        </div>
      )}

      {/* Article Content */}
      <div className="text-[19px] sm:text-[20px] text-[#242424] dark:text-slate-200 leading-[1.75] space-y-7 font-normal">
        {sections.map((section: any, idx: number) => {
          if (!section.content || !section.content.trim()) return null;
          const isCurrentBlock = activeHighlight?.blockId === `sec-${idx}`;

          if (section.type === "heading") {
            return (
              <h2
                key={idx}
                id={`sec-${idx}`}
                className="text-2xl sm:text-[28px] font-bold text-[#242424] dark:text-white tracking-tight pt-4 scroll-mt-20"
              >
                {renderHighlightedText(section.content, isCurrentBlock ? activeHighlight : null)}
              </h2>
            );
          }

          if (section.type === "quote") {
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-[#242424] dark:border-slate-500 pl-6 my-8 italic text-xl sm:text-2xl text-[#242424] dark:text-slate-200 leading-relaxed"
              >
                "{renderHighlightedText(section.content, isCurrentBlock ? activeHighlight : null)}"
              </blockquote>
            );
          }

          if (section.type === "callout") {
            const points = section.content.split("\n").filter(Boolean);
            return (
              <div key={idx} className="my-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
                  <i className="bx bx-bulb text-lg"></i>
                  <span>Core Takeaways</span>
                </div>
                <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-slate-300 list-disc list-inside">
                  {points.map((p: string, pIdx: number) => {
                    let pointHighlight = null;
                    if (isCurrentBlock && activeHighlight) {
                      const pStart = section.content.indexOf(p);
                      const pEnd = pStart + p.length;
                      if (activeHighlight.start >= pStart && activeHighlight.start < pEnd) {
                        pointHighlight = {
                          start: activeHighlight.start - pStart,
                          end: activeHighlight.end - pStart,
                        };
                      }
                    }
                    return (
                      <li key={pIdx}>
                        {renderHighlightedText(p, pointHighlight)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }

          if (section.type === "image") {
            return (
              <figure key={idx} className="my-8 sm:my-10">
                <div
                  onClick={() => setLightboxImg({ src: section.content, caption: section.caption })}
                  className="group relative overflow-hidden rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 cursor-zoom-in flex items-center justify-center p-2 sm:p-4"
                  title="Click to expand"
                >
                  <img
                    src={section.content}
                    alt={section.caption || "Story illustration"}
                    loading="lazy"
                    className="w-auto max-w-full max-h-[700px] h-auto rounded-xl object-contain mx-auto transition-transform duration-200 group-hover:scale-[1.005]"
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/60 text-white rounded-full p-1.5 backdrop-blur-xs flex items-center justify-center shadow-xs pointer-events-none">
                    <i className="bx bx-fullscreen text-sm"></i>
                  </div>
                </div>
                {section.caption && (
                  <figcaption className="text-center text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-2.5 font-normal tracking-wide">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          const isFirstParagraph =
            sections.findIndex((s: any) => s.type === "text" && s.content?.trim()) === idx;

          if (isFirstParagraph && section.content.length > 2) {
            const firstLetter = section.content.charAt(0);
            const rest = section.content.slice(1);

            let firstLetterNode = <>{firstLetter}</>;
            let restHighlight = null;

            if (isCurrentBlock && activeHighlight) {
              if (activeHighlight.start === 0) {
                firstLetterNode = (
                  <mark
                    data-speech-active="true"
                    className="bg-amber-200 text-gray-900 dark:bg-amber-400/35 dark:text-amber-100 rounded px-1 py-0.5"
                  >
                    {firstLetter}
                  </mark>
                );
                if (activeHighlight.end > 1) {
                  restHighlight = {
                    start: 0,
                    end: activeHighlight.end - 1,
                  };
                }
              } else if (activeHighlight.start > 0) {
                restHighlight = {
                  start: activeHighlight.start - 1,
                  end: activeHighlight.end - 1,
                };
              }
            }

            return (
              <p key={idx} className="whitespace-pre-line">
                <span className="float-left text-5xl font-black text-gray-900 dark:text-white leading-none pr-3 pt-0.5 font-serif">
                  {firstLetterNode}
                </span>
                {renderHighlightedText(rest, restHighlight)}
              </p>
            );
          }

          return (
            <p key={idx} className="whitespace-pre-line">
              {renderHighlightedText(section.content, isCurrentBlock ? activeHighlight : null)}
            </p>
          );
        })}
      </div>


      {/* Post Feedback Bar */}
      <PostFeedbackBar
        liked={liked}
        likesCount={likesCount}
        commentsCount={comments.length}
        saved={saved}
        onToggleLike={toggleLiked}
        onToggleSave={toggleSaved}
        onShare={handleShare}
        onScrollToComments={() => scrollToSection("responses-section")}
      />

      {/* Author Card */}
      <AuthorCard
        author={author}
        isOwnPost={isOwnPost}
        isFollowing={isFollowing}
        onToggleFollow={toggleFollow}
      />

      {/* Comments Section */}
      <CommentsSection
        comments={comments}
        currentUser={currentUser}
        postAuthorId={authorId}
        postAuthorUsername={author.username}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        hasMoreComments={hasMoreComments}
        loadingMoreComments={loadingMoreComments}
        onLoadMoreComments={handleLoadMoreComments}
      />


      {/* Recommended Blogs */}
      <RecommendedBlogs
        currentBlogId={storyId}
        authorId={authorId}
        authorName={authorName}
      />

      {/* Fullscreen Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-fade-in select-none"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition cursor-pointer z-10"
            aria-label="Close full view"
          >
            <i className="bx bx-x"></i>
          </button>
          <div
            className="max-w-6xl max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImg.src}
              alt={lightboxImg.caption || "Expanded view"}
              className="max-w-full max-h-[84vh] object-contain rounded-xl shadow-2xl bg-white"
            />
            {lightboxImg.caption && (
              <p className="text-center text-xs sm:text-sm text-gray-300 mt-3 px-4 font-medium">
                {lightboxImg.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};