import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { shareThis } from '../../utils/shareURL';
import { AudioPlayer } from '../Blog/Sections/AudioPlayer';
import { useAuth } from '../../context/AuthContext';
import { blogApi, BlogContentItem, s3Api } from '../../services/api';


const DRAFT_KEY = 'spectrum_story_draft';

const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const editId = paramId || searchParams.get('id') || searchParams.get('edit') || null;

  const { user, isLoggedIn, refreshUser } = useAuth();

  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(Boolean(editId));

  const [title, setTitle] = useState<string>(() => {
    if (editId) return '';
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).title || '' : '';
    } catch {
      return '';
    }
  });

  const [subtitle, setSubtitle] = useState<string>(() => {
    if (editId) return '';
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).subtitle || '' : '';
    } catch {
      return '';
    }
  });

  const [coverImage, setCoverImage] = useState<string | null>(() => {
    if (editId) return null;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).coverImage || null : null;
    } catch {
      return null;
    }
  });

  const [coverCaption, setCoverCaption] = useState<string>(() => {
    if (editId) return '';
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).coverCaption || '' : '';
    } catch {
      return '';
    }
  });

  const [sections, setSections] = useState<{ type: string; content: string | null; caption?: string }[]>(() => {
    if (editId) return [{ type: 'text', content: '', caption: '' }];
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
          return parsed.sections;
        }
      }
    } catch {
      // ignore
    }
    return [{ type: 'text', content: '', caption: '' }];
  });

  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Fetch story data when editing
  useEffect(() => {
    if (!editId) {
      setIsLoadingStory(false);
      return;
    }

    const loadStory = async () => {
      try {
        setIsLoadingStory(true);
        const res = await blogApi.getById(editId);
        if (res.data) {
          const post = res.data;
          setTitle(post.title || '');

          let loadedSubtitle = post.subtitle || '';
          let loadedCoverImage: string | null = null;
          let loadedCoverCaption = '';
          const loadedSections: { type: string; content: string | null; caption?: string }[] = [];

          const rawSections = Array.isArray(post.content) ? [...post.content] : [];
          let startIndex = 0;

          if (rawSections.length > 0 && rawSections[0].type === 'subtitle') {
            if (!loadedSubtitle) loadedSubtitle = rawSections[0].content || '';
            startIndex = 1;
          }

          if (startIndex < rawSections.length && rawSections[startIndex].type === 'image') {
            loadedCoverImage = rawSections[startIndex].content || null;
            loadedCoverCaption = rawSections[startIndex].caption || '';
            startIndex += 1;
          }

          for (let i = startIndex; i < rawSections.length; i++) {
            const s = rawSections[i];
            if (s.type !== 'subtitle') {
              loadedSections.push({
                type: s.type || 'text',
                content: s.content || '',
                caption: s.caption || '',
              });
            }
          }

          if (loadedSections.length === 0) {
            loadedSections.push({ type: 'text', content: '', caption: '' });
          }

          setSubtitle(loadedSubtitle);
          setCoverImage(loadedCoverImage);
          setCoverCaption(loadedCoverCaption);
          setSections(loadedSections);
        }
      } catch (err: any) {
        console.error('Failed to load story for editing:', err);
        toast.error('Failed to load story for editing');
      } finally {
        setIsLoadingStory(false);
      }
    };

    loadStory();
  }, [editId]);

  // Auto-save to localStorage only for new drafts
  useEffect(() => {
    if (editId) return;
    try {
      const draft = {
        title,
        subtitle,
        coverImage,
        coverCaption,
        sections,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Could not save draft locally', e);
    }
  }, [title, subtitle, coverImage, coverCaption, sections, editId]);

  // Preview interactive state
  const [liked, setLiked] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(42);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);


  const addSection = (type: string) => {
    setSections([...sections, { type, content: type === 'image' ? null : '', caption: '' }]);
  };

  const handleTextChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].content = value;
    setSections(newSections);
  };

  const handleCaptionChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].caption = value;
    setSections(newSections);
  };

  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [uploadingSectionIndex, setUploadingSectionIndex] = useState<number | null>(null);

  const validateImageFile = (file: File): boolean => {
    if (!file) return false;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return false;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type.toLowerCase())) {
      toast.error('Unsupported image format. Allowed formats: JPEG, PNG, WEBP, GIF');
      return false;
    }
    return true;
  };

  const handleImageChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      event.target.value = '';
      return;
    }

    setUploadingSectionIndex(index);
    const toastId = toast.loading('Uploading image to storage...');
    try {
      const res = await s3Api.upload(file, editId || undefined);
      const cloudFrontUrl = res.data;
      const newSections = [...sections];
      newSections[index].content = cloudFrontUrl;
      setSections(newSections);
      toast.dismiss(toastId);
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || err.message || 'Failed to upload image');
    } finally {
      setUploadingSectionIndex(null);
      event.target.value = '';
    }
  };

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      event.target.value = '';
      return;
    }

    setIsUploadingCover(true);
    const toastId = toast.loading('Uploading cover image to storage...');
    try {
      const res = await s3Api.upload(file, editId || undefined);
      const cloudFrontUrl = res.data;
      setCoverImage(cloudFrontUrl);
      toast.dismiss(toastId);
      toast.success('Cover image uploaded successfully!');
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || err.message || 'Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
      event.target.value = '';
    }
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    setSections(newSections);
  };

  const handleShare = async () => {
    const url = window.location.href;
    await shareThis(url, title, subtitle || 'Check out this story on Spectrum');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const toggleLiked = () => {
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const scrollToPreviewSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const publishPost = async () => {
    if (!isLoggedIn || !user) {
      toast.error('Please sign in to publish or edit a story.');
      return;
    }

    const validSections: BlogContentItem[] = sections
      .filter((s): s is { type: string; content: string; caption?: string } => typeof s.content === 'string' && s.content.trim() !== '')
      .map((s) => ({ type: s.type, content: s.content.trim(), caption: s.caption }));

    if (!title.trim() || validSections.length === 0) {
      toast.error('Please add a title and some content.');
      return;
    }

    setIsPublishing(true);

    try {
      const allSections: BlogContentItem[] = [];
      if (subtitle.trim()) {
        allSections.push({ type: 'subtitle', content: subtitle.trim() });
      }
      if (coverImage) {
        allSections.push({ type: 'image', content: coverImage, caption: coverCaption });
      }
      allSections.push(...validSections);

      for (const section of allSections) {
        if (section.type === 'image' && section.content && section.content.startsWith('data:image/')) {
          const file = dataUrlToFile(section.content, `image-${Date.now()}.jpg`);
          const res = await s3Api.upload(file, editId || undefined);
          section.content = res.data;
        }
      }


      if (editId) {
        await blogApi.update(editId, {
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: allSections,
          tags: [],
        });

        await refreshUser();
        toast.success('Story updated successfully!');
        navigate(`/blog/${editId}`);
      } else {
        const response = await blogApi.create({
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: allSections,
          tags: [],
          author: user.id,
        });

        await refreshUser();
        toast.success('Post published successfully!');

        localStorage.removeItem(DRAFT_KEY);
        setTitle('');
        setSubtitle('');
        setCoverImage(null);
        setCoverCaption('');
        setSections([{ type: 'text', content: '', caption: '' }]);

        const newId = response.data?.blog?.id;
        if (newId) {
          navigate(`/blog/${newId}`);
        } else {
          navigate('/my-blogs');
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save post';
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const totalWords = sections
    .filter((s) => s.type === 'text' && s.content)
    .reduce((acc, s) => acc + (s.content?.trim().split(/\s+/).filter(Boolean).length || 0), 0);
  const readTime = Math.max(1, Math.ceil(totalWords / 200));

  const headingsList = sections
    .map((s, idx) => ({ ...s, originalIdx: idx }))
    .filter((s) => s.type === 'heading' && s.content?.trim());

  const fullStoryText = `${title}. ${subtitle}. ` + sections
    .filter((s) => s.content && s.type !== 'image')
    .map((s) => s.content)
    .join('. ');

  if (isLoadingStory) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 flex flex-col items-center justify-center py-24 text-gray-500 dark:text-slate-400">
        <i className="bx bx-loader-alt animate-spin text-4xl text-indigo-600 mb-3"></i>
        <p className="text-sm font-semibold">Loading story for editing...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 py-6 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <i className="bx bx-check-circle text-emerald-400 text-base"></i>
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* Audio Player in Preview */}
      {isPlayingAudio && isPreview && (
        <AudioPlayer
          textToRead={fullStoryText}
          title={title || 'Untitled Story'}
          onClose={() => setIsPlayingAudio(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (isPreview ? setIsPreview(false) : navigate(-1))}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              aria-label={isPreview ? "Back to edit" : "Go back"}
            >
              <i className="bx bx-arrow-back text-lg"></i>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {editId ? 'Editing Story' : (isPreview ? 'Previewing Post' : 'Draft in Stories')}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <i className="bx bx-cloud-check text-xs"></i>
                  <span>{editId ? 'Loaded' : 'Saved'}</span>
                </span>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                {totalWords} words · ~{readTime} min read
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer shadow-2xs ${
                isPreview
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  : 'bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-200'
              }`}
            >
              <i className={`bx ${isPreview ? 'bx-edit-alt' : 'bx-show'} text-sm`}></i>
              <span>{isPreview ? 'Edit' : 'Preview'}</span>
            </button>

            {!coverImage && !isPreview && (
              <label className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer shadow-2xs ${isUploadingCover ? 'opacity-50 pointer-events-none' : ''}`}>
                <i className={`bx ${isUploadingCover ? 'bx-loader-alt animate-spin' : 'bx-image-add'} text-sm text-gray-600 dark:text-slate-400`}></i>
                <span className="hidden sm:inline">{isUploadingCover ? 'Uploading...' : 'Add Cover'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingCover}
                  className="hidden"
                  onChange={handleCoverImageChange}
                />
              </label>
            )}

            <button
              onClick={publishPost}
              disabled={isPublishing}
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold px-5 py-2 rounded-full transition duration-150 shadow-2xs hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isPublishing ? (
                <>
                  <i className="bx bx-loader-alt animate-spin text-base"></i>
                  <span>{editId ? 'Saving...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <i className={`bx ${editId ? 'bx-save' : 'bx-send'} text-base`}></i>
                  <span>{editId ? 'Save Changes' : 'Publish'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===================== PREVIEW MODE (MATCHES BLOGPOST.TSX TEMPLATE) ===================== */}
        {isPreview ? (
          <div className="relative">
            {/* Floating Desktop Action Dock */}
            <div className="hidden xl:flex fixed left-[max(1.5rem,calc(50%-430px))] top-52 flex-col items-center gap-5 text-gray-400 dark:text-slate-500 z-10">
              <button
                onClick={toggleLiked}
                title="Like story"
                className={`flex flex-col items-center gap-1 transition cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  liked ? 'text-red-500 font-semibold' : 'hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <i className={`bx ${liked ? 'bxs-heart text-red-500' : 'bx-heart'} text-2xl`}></i>
                <span className="text-xs">{likesCount}</span>
              </button>

              <button
                title="Responses"
                className="flex flex-col items-center gap-1 hover:text-gray-900 dark:hover:text-white transition cursor-pointer p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <i className="bx bx-message-rounded text-2xl"></i>
                <span className="text-xs">0</span>
              </button>

              <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800 my-1"></div>

              <button
                title={isPlayingAudio ? 'Pause Audio' : 'Listen to Story'}
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                  isPlayingAudio ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <i className={`bx ${isPlayingAudio ? 'bx-pause-circle' : 'bx-play-circle'} text-2xl`}></i>
              </button>

              <button
                title={saved ? 'Saved' : 'Save Story'}
                onClick={() => setSaved(!saved)}
                className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${
                  saved ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <i className={`bx ${saved ? 'bxs-bookmark' : 'bx-bookmark'} text-2xl`}></i>
              </button>

              <button
                title="Share"
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
              >
                <i className="bx bx-share-alt text-2xl"></i>
              </button>
            </div>

            <article className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-12 border border-gray-200 dark:border-slate-800 shadow-sm max-w-[760px] mx-auto">
              {/* Title */}
              <h1 className="text-3xl sm:text-[44px] font-black text-[#242424] dark:text-white leading-[1.18] tracking-tight mb-3 font-sans">
                {title || <span className="text-gray-400 dark:text-slate-500 italic font-normal">Untitled Story</span>}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                <p className="text-lg sm:text-xl text-gray-500 dark:text-slate-400 font-normal leading-relaxed mb-6 font-sans">
                  {subtitle}
                </p>
              )}

              {/* Author Bar */}
              <div className="flex items-center justify-between gap-4 mt-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.profilePic || "/avatar.jpg"}
                    alt={user?.fullName || "Author"}
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.jpg";
                    }}
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#242424] dark:text-slate-100">{user?.fullName || "Author"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      <span>{readTime} min read</span>
                      <span>·</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Action Bar */}
              <div className="flex items-center justify-between py-3 my-6 border-y border-slate-200/80 dark:border-slate-800 text-gray-500 dark:text-slate-400">
                <div className="flex items-center gap-6 text-sm">
                  <button
                    onClick={toggleLiked}
                    className={`flex items-center gap-1.5 transition cursor-pointer ${
                      liked ? 'text-red-500 font-semibold' : 'hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <i className={`bx ${liked ? 'bxs-heart text-red-500' : 'bx-heart'} text-xl`}></i>
                    <span>{likesCount}</span>
                  </button>

                  <button className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-slate-200 transition cursor-pointer">
                    <i className="bx bx-message-rounded text-xl"></i>
                    <span>0</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xl">
                  <button
                    title={isPlayingAudio ? 'Pause Audio' : 'Listen to Story'}
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className={`p-1 transition cursor-pointer ${
                      isPlayingAudio ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <i className={`bx ${isPlayingAudio ? 'bx-pause-circle' : 'bx-play-circle'} text-2xl`}></i>
                  </button>
                  <button
                    title={saved ? 'Saved' : 'Save'}
                    onClick={() => setSaved(!saved)}
                    className={`p-1 transition cursor-pointer ${
                      saved ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <i className={`bx ${saved ? 'bxs-bookmark' : 'bx-bookmark'}`}></i>
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
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex-shrink-0 mr-1">
                    Sections:
                  </span>
                  {headingsList.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToPreviewSection(`preview-sec-${h.originalIdx}`)}
                      className="text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer"
                    >
                      {h.content}
                    </button>
                  ))}
                </div>
              )}

              {/* Cover Image */}
              {coverImage && (
                <figure className="my-8 sm:my-10">
                  <div className="overflow-hidden rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center justify-center p-2 sm:p-4">
                    <img
                      src={coverImage}
                      alt="Story Cover"
                      className="w-auto max-w-full max-h-[600px] h-auto rounded-xl object-contain mx-auto"
                    />
                  </div>
                  {coverCaption && (
                    <figcaption className="text-center text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-2.5 font-normal tracking-wide">
                      {coverCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Rendered Sections */}
              <div className="text-[19px] sm:text-[20px] text-[#242424] dark:text-slate-200 leading-[1.75] space-y-7 font-normal">
                {sections.filter((s) => s.content && s.content.trim() !== '').length === 0 ? (
                  <div className="text-center py-16 text-gray-400 dark:text-slate-500">
                    <i className="bx bx-file-blank text-4xl mb-2 text-gray-300 dark:text-slate-600"></i>
                    <p className="italic text-sm">No content added yet. Switch to edit mode to start writing.</p>
                  </div>
                ) : (
                  sections.map((section, idx) => {
                    if (!section.content || !section.content.trim()) return null;

                    if (section.type === 'heading') {
                      return (
                        <h2
                          key={idx}
                          id={`preview-sec-${idx}`}
                          className="text-2xl sm:text-[28px] font-bold text-[#242424] dark:text-white tracking-tight pt-4 scroll-mt-20"
                        >
                          {section.content}
                        </h2>
                      );
                    }

                    if (section.type === 'quote') {
                      return (
                        <blockquote
                          key={idx}
                          className="border-l-2 border-[#242424] dark:border-slate-400 pl-6 my-8 italic text-xl sm:text-2xl text-[#242424] dark:text-slate-200 leading-relaxed"
                        >
                          "{section.content}"
                        </blockquote>
                      );
                    }

                    if (section.type === 'callout') {
                      const points = section.content.split('\n').filter(Boolean);
                      return (
                        <div key={idx} className="my-8 p-6 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl">
                          <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
                            <i className="bx bx-bulb text-lg"></i>
                            <span>Core Takeaways</span>
                          </div>
                          <ul className="space-y-2 text-sm sm:text-base text-gray-700 dark:text-slate-300 list-disc list-inside">
                            {points.map((p, pIdx) => (
                              <li key={pIdx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    }

                    if (section.type === 'image') {
                      return (
                        <figure key={idx} className="my-8 sm:my-10">
                          <div className="overflow-hidden rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center justify-center p-2 sm:p-4">
                            <img
                              src={section.content}
                              alt="Illustration"
                              className="w-auto max-w-full max-h-[650px] h-auto rounded-xl object-contain mx-auto"
                            />
                          </div>
                          {section.caption && (
                            <figcaption className="text-center text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-2.5 font-normal tracking-wide">
                              {section.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }

                    // Standard Paragraph with Drop Cap for the first paragraph
                    const isFirstParagraph =
                      sections.findIndex((s) => s.type === 'text' && s.content?.trim()) === idx;

                    if (isFirstParagraph && section.content.length > 2) {
                      const firstLetter = section.content.charAt(0);
                      const rest = section.content.slice(1);
                      return (
                        <p key={idx} className="whitespace-pre-line">
                          <span className="float-left text-5xl font-black text-gray-900 dark:text-white leading-none pr-3 pt-0.5 font-serif">
                            {firstLetter}
                          </span>
                          {rest}
                        </p>
                      );
                    }

                    return (
                      <p key={idx} className="whitespace-pre-line">
                        {section.content}
                      </p>
                    );
                  })
                )}
              </div>


              {/* Preview Footer Actions */}
              <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer border border-gray-300 dark:border-slate-700"
                >
                  <i className="bx bx-edit-alt text-sm"></i>
                  <span>Continue Editing</span>
                </button>

                <button
                  onClick={publishPost}
                  disabled={isPublishing}
                  className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-full transition duration-150 shadow-2xs hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isPublishing ? (
                    <>
                      <i className="bx bx-loader-alt animate-spin text-base"></i>
                      <span>{editId ? 'Saving...' : 'Publishing...'}</span>
                    </>
                  ) : (
                    <>
                      <i className={`bx ${editId ? 'bx-save' : 'bx-send'} text-base`}></i>
                      <span>{editId ? 'Save Changes' : 'Publish Story'}</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          </div>
        ) : (
          /* ===================== EDIT MODE WITH RICH BLOCK CREATOR ===================== */
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
            {isUploadingCover ? (
              <div className="rounded-xl mb-6 border-2 border-dashed border-indigo-400 py-12 flex flex-col items-center justify-center bg-indigo-50/20 dark:bg-indigo-950/20">
                <i className="bx bx-loader-alt animate-spin text-3xl text-indigo-600 mb-2"></i>
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Uploading cover image to storage...</span>
              </div>
            ) : coverImage ? (
              <div className="relative rounded-2xl overflow-hidden mb-6 border border-gray-200 dark:border-slate-700 group bg-slate-50/70 dark:bg-slate-800/50 flex flex-col items-center justify-center p-3">
                <img
                  src={coverImage}
                  alt="Story cover"
                  className="w-auto max-w-full max-h-[460px] h-auto rounded-xl object-contain mx-auto"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition">
                  <label className="bg-black/75 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition shadow-2xs">
                    <i className="bx bx-refresh text-sm"></i>
                    <span>Replace</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverImageChange}
                    />
                  </label>
                  <button
                    onClick={() => {
                      setCoverImage(null);
                      setCoverCaption('');
                    }}
                    className="bg-black/75 hover:bg-rose-600 text-white w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-xs transition cursor-pointer shadow-2xs"
                    aria-label="Remove cover"
                  >
                    <i className="bx bx-trash text-sm"></i>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Add a caption for the cover photo (optional)..."
                  value={coverCaption}
                  onChange={(e) => setCoverCaption(e.target.value)}
                  className="w-full text-xs text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-4 py-2 outline-none"
                />
              </div>
            ) : null}

            {/* Story Title */}
            <input
              type="text"
              placeholder="Title of your story..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 placeholder:font-bold focus:outline-none border-b border-gray-200 dark:border-slate-800 pb-2 mb-3 transition bg-transparent"
            />

            {/* Story Subtitle */}
            <input
              type="text"
              placeholder="Add an optional subtitle or summary..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-base sm:text-lg text-gray-600 dark:text-slate-300 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none pb-3 mb-6 transition bg-transparent"
            />

            {/* Blocks List */}
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="group relative bg-gray-50/80 dark:bg-slate-800/40 hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-gray-300 dark:border-slate-700 focus-within:border-indigo-600 focus-within:bg-white dark:focus-within:bg-slate-900/90 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-950 rounded-xl p-4 sm:p-5 transition-all duration-150"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                      <i
                        className={`bx ${
                          section.type === 'text'
                            ? 'bx-text text-indigo-600'
                            : section.type === 'heading'
                            ? 'bx-heading text-indigo-600'
                            : section.type === 'quote'
                            ? 'bxs-quote-left text-indigo-600'
                            : section.type === 'callout'
                            ? 'bx-bulb text-amber-500'
                            : 'bx-image text-indigo-600'
                        } text-base`}
                      ></i>
                      <span>
                        {section.type === 'text'
                          ? `Paragraph ${index + 1}`
                          : section.type === 'heading'
                          ? `Subheading`
                          : section.type === 'quote'
                          ? `Blockquote`
                          : section.type === 'callout'
                          ? `Key Takeaways Box`
                          : `Image Block`}
                      </span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {index > 0 && (
                        <button
                          onClick={() => moveSection(index, 'up')}
                          aria-label="Move up"
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                        >
                          <i className="bx bx-chevron-up text-lg"></i>
                        </button>
                      )}
                      {index < sections.length - 1 && (
                        <button
                          onClick={() => moveSection(index, 'down')}
                          aria-label="Move down"
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                        >
                          <i className="bx bx-chevron-down text-lg"></i>
                        </button>
                      )}
                      {sections.length > 1 && (
                        <button
                          onClick={() => removeSection(index)}
                          aria-label="Delete block"
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition cursor-pointer shadow-2xs"
                        >
                          <i className="bx bx-trash text-base"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {section.type === 'text' && (
                    <textarea
                      rows={4}
                      placeholder="Tell your story..."
                      value={section.content || ''}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      className="w-full text-sm sm:text-base text-gray-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-slate-500 bg-transparent focus:outline-none resize-y leading-relaxed"
                    />
                  )}

                  {section.type === 'heading' && (
                    <input
                      type="text"
                      placeholder="Subheading..."
                      value={section.content || ''}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      className="w-full text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none"
                    />
                  )}

                  {section.type === 'quote' && (
                    <textarea
                      rows={2}
                      placeholder="Write a quote..."
                      value={section.content || ''}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      className="w-full text-base sm:text-lg italic text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none border-l-2 border-indigo-500 pl-3 resize-y"
                    />
                  )}

                  {section.type === 'callout' && (
                    <div className="flex flex-col gap-2">
                      <textarea
                        rows={3}
                        placeholder="Key takeaway bullet points (one per line)..."
                        value={section.content || ''}
                        onChange={(e) => handleTextChange(index, e.target.value)}
                        className="w-full text-sm sm:text-base text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none resize-y leading-relaxed"
                      />
                    </div>
                  )}

                  {section.type === 'image' && (
                    <div>
                      {uploadingSectionIndex === index ? (
                        <div className="w-full py-12 border-2 border-dashed border-indigo-400 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/20 flex flex-col items-center justify-center">
                          <i className="bx bx-loader-alt animate-spin text-3xl text-indigo-600 mb-2"></i>
                          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Uploading image to storage...</span>
                        </div>
                      ) : section.content ? (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col items-center justify-center p-3">
                          <img
                            src={section.content}
                            alt="Post illustration"
                            className="w-auto max-w-full max-h-[480px] h-auto rounded-xl object-contain mx-auto"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <label className="bg-black/75 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition shadow-2xs">
                              <i className="bx bx-camera text-sm"></i>
                              <span>Replace</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageChange(index, e)}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            placeholder="Add an image caption / credit (optional)..."
                            value={section.caption || ''}
                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                            className="w-full text-xs text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-4 py-2 outline-none"
                          />
                        </div>
                      ) : (
                        <label className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl bg-white dark:bg-slate-800/50 hover:bg-indigo-50/20 dark:hover:bg-slate-800/80 flex flex-col items-center justify-center cursor-pointer transition">
                          <i className="bx bx-cloud-upload text-3xl text-gray-500 dark:text-slate-400 mb-2"></i>
                          <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">Click to upload an image</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">PNG, JPG, WEBP, or GIF up to 10MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(index, e)}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Block Inserter Bar */}
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => addSection('text')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer border border-gray-300 dark:border-slate-700"
                >
                  <i className="bx bx-plus text-sm text-gray-600 dark:text-slate-400"></i>
                  <span>Paragraph</span>
                </button>
                <button
                  type="button"
                  onClick={() => addSection('heading')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer border border-gray-300 dark:border-slate-700"
                >
                  <i className="bx bx-heading text-sm text-gray-600 dark:text-slate-400"></i>
                  <span>Subheading</span>
                </button>
                <button
                  type="button"
                  onClick={() => addSection('quote')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer border border-gray-300 dark:border-slate-700"
                >
                  <i className="bx bxs-quote-left text-sm text-gray-600 dark:text-slate-400"></i>
                  <span>Quote</span>
                </button>
                <button
                  type="button"
                  onClick={() => addSection('callout')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer border border-gray-300 dark:border-slate-700"
                >
                  <i className="bx bx-bulb text-sm text-amber-500"></i>
                  <span>Takeaways</span>
                </button>
                <button
                  type="button"
                  onClick={() => addSection('image')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer border border-gray-300 dark:border-slate-700"
                >
                  <i className="bx bx-image-add text-sm text-gray-600 dark:text-slate-400"></i>
                  <span>Image</span>
                </button>
              </div>
            </div>


            {/* Bottom Publish Bar */}
            <div className="mt-8 pt-5 border-t border-gray-200 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={publishPost}
                disabled={isPublishing}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold px-7 py-2.5 rounded-full transition duration-150 shadow-2xs hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isPublishing ? (
                  <>
                    <i className="bx bx-loader-alt animate-spin text-base"></i>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-send text-base"></i>
                    <span>Publish Story</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};