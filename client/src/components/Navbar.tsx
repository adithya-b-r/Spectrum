import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { SignInForm } from "./AuthForms/SignInForm";
import { LoginForm } from "./AuthForms/LoginForm";
import { toast } from "react-toastify";
import { blogApi, BlogItem, User, notificationApi } from "../services/api";

export const Navbar: React.FC = () => {
  const [displayNav, setdisplayNav] = useState(false);
  const { user, isLoggedIn, logout, isLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [toggleRegister, setToggleRegister] = useState(false);
  const [toggleLogin, setToggleLogin] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ blogs: BlogItem[]; users: User[] }>({
    blogs: [],
    users: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);


  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setdisplayNav(false);
  }, [location.pathname]);

  const toggleNav = () => {
    setdisplayNav((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setdisplayNav(false);
      toast.success("Successfully logged out");
      navigate("/");
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setShowSearchDropdown(true);
        } else {
          setShowMobileSearch(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
        }
      }
      if (e.key === "Escape") {
        setShowSearchDropdown(false);
        setShowMobileSearch(false);
        setdisplayNav(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search dropdown and profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setdisplayNav(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ blogs: [], users: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await blogApi.search(searchQuery.trim());
        if (res.data) {
          setSearchResults({
            blogs: res.data.blogs || [],
            users: res.data.users || [],
          });
        }
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch unread notification count
  const authUserId = user?.id ?? user?._id;

  useEffect(() => {
    if (!authUserId) {
      setUnreadCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const res = await notificationApi.getUnreadCount(authUserId);
        if (res.data && typeof res.data.unreadCount === "number") {
          setUnreadCount(res.data.unreadCount);
        }
      } catch (err) {
        console.error("Failed to fetch notification count:", err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [authUserId]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setShowSearchDropdown(false);
    setShowMobileSearch(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSelectStory = (blogId: string) => {
    setShowSearchDropdown(false);
    setShowMobileSearch(false);
    navigate(`/blog/${blogId}`);
  };

  const handleSelectAuthor = (username?: string, id?: string | number) => {
    setShowSearchDropdown(false);
    setShowMobileSearch(false);
    navigate(`/user/profile/${username || id || ""}`);
  };

  const hasResults =
    searchResults.blogs.length > 0 ||
    searchResults.users.length > 0;

  return (
    <>
      {toggleLogin && (
        <LoginForm
          onClose={() => setToggleLogin(false)}
          onSwitch={() => {
            setToggleLogin(false);
            setToggleRegister(true);
          }}
        />
      )}
      {toggleRegister && (
        <SignInForm
          onClose={() => setToggleRegister(false)}
          onSwitch={() => {
            setToggleRegister(false);
            setToggleLogin(true);
          }}
        />
      )}

      <nav className="fixed w-full h-16 top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          {/* Logo & Desktop Search */}
          <div className="flex items-center">
            <div onClick={() => navigate("/")} className="flex items-center gap-2.5 cursor-pointer">
              <img src="/logo2.png" alt="Spectrum" className="h-8 w-8 object-contain rounded-lg" />
              <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Spectrum</span>
            </div>

            {/* Desktop Search Bar with Live Dropdown */}
            <div ref={searchContainerRef} className="relative hidden md:flex items-center ml-8 w-72 lg:w-96">
              <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
                <i className="bx bx-search absolute left-3.5 text-lg text-gray-400 pointer-events-none"></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search articles and authors..."
                  className="w-full text-sm font-medium text-gray-700 dark:text-slate-100 bg-gray-50/80 dark:bg-slate-800/90 hover:bg-gray-100/70 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 pl-10 pr-10 py-2 rounded-full border border-gray-200/90 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-slate-400 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults({ blogs: [], users: [] });
                    }}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <i className="bx bx-x text-base"></i>
                  </button>
                )}
              </form>

              {/* Live Search Autocomplete Dropdown */}
              {showSearchDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-gray-100 dark:divide-slate-800">
                  {isSearching ? (
                    <div className="p-6 text-center text-gray-400 flex items-center justify-center gap-2 text-xs font-medium">
                      <i className="bx bx-loader-alt animate-spin text-base text-indigo-600"></i>
                      <span>Searching Spectrum...</span>
                    </div>
                  ) : !hasResults ? (
                    <div className="p-6 text-center">
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">No instant results found</p>
                      <p className="text-[11px] text-gray-400 mb-3">Press Enter to search all content and descriptions</p>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                      >
                        Search for "{searchQuery}"
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto no-scrollbar p-2 space-y-3">

                      {/* Authors Section */}
                      {searchResults.users.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Authors
                          </div>
                          <div className="space-y-1">
                            {searchResults.users.slice(0, 3).map((u) => (
                              <div
                                key={u._id}
                                onClick={() => handleSelectAuthor(u.username, u._id)}
                                className="flex items-center gap-3 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/80 transition cursor-pointer group"
                              >
                                <img
                                  src={u.profilePic || "/avatar.jpg"}
                                  alt={u.fullName}
                                  onError={(e) => {
                                    e.currentTarget.src = "/avatar.jpg";
                                  }}
                                  className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-slate-700 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                                    {u.fullName}
                                  </h4>
                                  <p className="text-[11px] text-gray-400 truncate">@{u.username || "author"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stories Section */}
                      {searchResults.blogs.length > 0 && (
                        <div>
                          <div className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Stories
                          </div>
                          <div className="space-y-1">
                            {searchResults.blogs.slice(0, 4).map((b) => {
                              const author = typeof b.author === "object" ? b.author : ({} as any);
                              const authorName = author.fullName || author.username || "Author";
                              const cover =
                                b.content?.find((c) => c.type === "image")?.content || "/blog/blog1.jpg";

                              const blogId = (b.id || b._id || '').toString();
                              return (
                                <div
                                  key={blogId || b.title}
                                  onClick={() => handleSelectStory(blogId)}
                                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/80 transition cursor-pointer group"
                                >
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex-shrink-0">
                                    <img src={cover} alt={b.title} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                                      {b.title}
                                    </h4>
                                    <p className="text-[11px] text-gray-400 truncate">by {authorName}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* View All Results Button */}
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full text-center py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-xl transition cursor-pointer mt-1"
                      >
                        View all results for "{searchQuery}" →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Icons & Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Icon Button */}
            <button
              type="button"
              onClick={() => {
                setShowMobileSearch(!showMobileSearch);
                setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
              }}
              aria-label="Search"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            >
              <i className="bx bx-search text-xl"></i>
            </button>

            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
              </div>
            ) : isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/create-post")}
                  aria-label="Write post"
                  className="w-9 h-9 sm:w-auto sm:h-9 sm:px-4 flex items-center justify-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/60 text-sm font-semibold transition duration-200 cursor-pointer flex-shrink-0"
                >
                  <i className="bx bx-edit text-lg sm:text-base"></i>
                  <span className="hidden sm:inline">Write</span>
                </button>

                <div
                  onClick={() => {
                    setdisplayNav(false);
                    navigate("/profile/notifications");
                  }}
                  className="w-9 h-9 flex items-center justify-center relative text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer flex-shrink-0"
                  title="Notifications"
                >
                  <i className="bx bx-bell text-xl"></i>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center animate-in zoom-in-75 duration-150">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>

                <div ref={profileMenuRef} className="relative">
                  <div
                    onClick={toggleNav}
                    className="flex items-center gap-1.5 cursor-pointer pl-1 py-1 pr-2 rounded-full hover:bg-gray-100/80 dark:hover:bg-slate-800 transition"
                  >
                    <img
                      src={user?.profilePic || "/avatar.jpg"}
                      alt={user?.fullName || "User profile"}
                      onError={(e) => {
                        e.currentTarget.src = "/avatar.jpg";
                      }}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-slate-700"
                    />
                    <i className={`bx bx-chevron-down text-gray-500 dark:text-slate-400 text-base transition-transform duration-200 ${displayNav ? 'rotate-180' : ''}`}></i>
                  </div>

                  {/* Profile Dropdown Menu */}
                  {displayNav && (
                    <div className="absolute flex flex-col top-full right-0 mt-2 bg-white dark:bg-slate-900 w-56 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div
                        onClick={() => {
                          setdisplayNav(false);
                          navigate("/profile");
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white text-sm font-medium cursor-pointer"
                      >
                        <i className="bx bx-user text-lg text-gray-500 dark:text-slate-400"></i>
                        <span>Profile</span>
                      </div>
                      <div
                        onClick={() => {
                          setdisplayNav(false);
                          navigate("/blogs");
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white text-sm font-medium cursor-pointer"
                      >
                        <i className="bx bx-book-open text-lg text-gray-500 dark:text-slate-400"></i>
                        <span>My Blogs</span>
                      </div>
                      <div
                        onClick={() => {
                          setdisplayNav(false);
                          navigate("/favorites");
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white text-sm font-medium cursor-pointer"
                      >
                        <i className="bx bx-bookmark-heart text-lg text-gray-500 dark:text-slate-400"></i>
                        <span>Favorites</span>
                      </div>
                      <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-2"></div>
                      <div
                        onClick={() => {
                          setdisplayNav(false);
                          navigate("/profile/notifications");
                        }}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white text-sm font-medium cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <i className="bx bx-bell text-lg text-gray-500 dark:text-slate-400"></i>
                          <span>Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>

                      <div
                        onClick={() => {
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium cursor-pointer"
                      >
                        <i className="bx bx-log-out text-lg text-red-500"></i>
                        <span>Logout</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setToggleLogin(true)}
                  className="text-sm font-semibold text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setToggleRegister(true)}
                  className="text-sm font-semibold bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 px-4 py-1.5 rounded-full transition duration-200 shadow-sm cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        {showMobileSearch && (
          <div className="md:hidden px-4 pb-3 pt-1 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <i className="bx bx-search absolute left-3.5 text-lg text-gray-400 pointer-events-none"></i>
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles and authors..."
                className="w-full text-xs font-medium text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-800 pl-10 pr-10 py-2 rounded-full border border-gray-200 dark:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <i className="bx bx-x text-lg"></i>
              </button>
            </form>
          </div>
        )}
      </nav>
    </>
  );
};
