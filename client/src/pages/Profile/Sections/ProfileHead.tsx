import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Account } from "../Sections/Account";
import { SocialMedia } from "../Sections/SocialMedia";
import { Notifications } from "../Sections/Notifications";
import { Settings } from "../Sections/Settings";
import { useAuth } from "../../../context/AuthContext";
import { userApi } from "../../../services/api";
import { toast } from "react-toastify";
import { FollowersModal } from "../../../components/Modals/FollowersModal";

export const ProfileHead = () => {
  const { user, refreshUser, isLoading } = useAuth();
  const [currentSel, setCurrentSel] = useState(0);
  const { section } = useParams();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"followers" | "following">("followers");

  const openFollowersModal = (tab: "followers" | "following") => {
    setModalTab(tab);
    setIsFollowersModalOpen(true);
  };


  const tabs = ["Account", "Social Media", "Notifications", "Settings"];

  useEffect(() => {
    if (section === "notifications") {
      setCurrentSel(2);
    } else if (section === "social" || section === "social-media") {
      setCurrentSel(1);
    } else if (section === "settings") {
      setCurrentSel(3);
    } else if (section === "account") {
      setCurrentSel(0);
    }
  }, [section]);


  const displayName = user?.fullName || user?.username || "User";
  const displayUsername = user?.username ? (user.username.startsWith("@") ? user.username : `@${user.username}`) : "";
  const displayAvatar = user?.profilePic || "/avatar.jpg";
  const displayBanner = user?.bannerPic || "";

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden select-none animate-pulse">
        {/* Cover Banner Skeleton */}
        <div className="h-32 sm:h-44 bg-slate-200 dark:bg-slate-800 relative">
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-28 h-7 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            <div className="w-32 h-7 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          </div>
        </div>

        {/* Header Info Area Skeleton */}
        <div className="px-6 sm:px-8 pb-6 relative">
          {/* Avatar Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900 shadow-md"></div>
          </div>

          {/* Identity & Stats Skeleton */}
          <div className="space-y-3 mb-6">
            <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1">
              <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-7 w-24 rounded-full bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-7 w-24 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            </div>
          </div>

          {/* Tabs Bar Skeleton */}
          <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 mt-6 mb-6 pb-2">
            <div className="h-5 w-18 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-5 w-18 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4 pt-2">
            <div className="h-16 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800"></div>
            <div className="h-16 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800"></div>
            <div className="h-24 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !user) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto text-3xl">
          <i className="bx bx-lock-alt"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign in to view your profile</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          You need to be signed in to manage your account details, preferences, and social links.
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
    );
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Profile photo size must be less than 10MB");
      event.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await userApi.updateProfilePic(formData);
      await refreshUser();
      toast.success("Profile photo updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update profile photo");
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Banner size must be less than 10MB");
      event.target.value = "";
      return;
    }

    setIsUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await userApi.updateBannerPic(formData);
      await refreshUser();
      toast.success("Banner updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update banner");
    } finally {
      setIsUploadingBanner(false);
      event.target.value = "";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden select-none">
      {/* Cover Banner */}
      <div className="h-32 sm:h-44 relative overflow-hidden bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 group/banner">
        {displayBanner ? (
          <img
            src={displayBanner}
            alt="Profile cover banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover/banner:bg-black/35 transition pointer-events-none"></div>

        {/* Banner Action Buttons */}
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center gap-1.5 sm:gap-2 z-10">
          <label className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs transition shadow-xs cursor-pointer">
            {isUploadingBanner ? (
              <>
                <i className="bx bx-loader-alt animate-spin text-sm"></i>
                <span className="hidden sm:inline">Updating...</span>
              </>
            ) : (
              <>
                <i className="bx bx-camera text-sm"></i>
                <span className="hidden sm:inline">Change Banner</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
              disabled={isUploadingBanner}
            />
          </label>

          <Link
            to={`/user/profile/${user?.username || ''}`}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-gray-900 dark:text-slate-100 text-xs font-semibold backdrop-blur-xs transition shadow-xs cursor-pointer whitespace-nowrap"
          >
            <i className="bx bx-show text-sm text-indigo-600 dark:text-indigo-400"></i>
            <span className="hidden sm:inline">View Public Profile</span>
            <span className="sm:hidden">Public</span>
          </Link>
        </div>
      </div>

      {/* Header Info Area */}
      <div className="px-4 sm:px-8 pb-4 relative">
        {/* Avatar Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
          <div className="relative group/avatar w-24 h-24 sm:w-28 sm:h-28 rounded-full flex-shrink-0">
            <img
              src={displayAvatar}
              alt={displayName}
              onError={(e) => {
                e.currentTarget.src = "/avatar.jpg";
              }}
              className="w-full h-full rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-md bg-white dark:bg-slate-900"
            />

            {/* Avatar Edit Overlay */}
            <label
              title="Change profile photo"
              className={`absolute inset-0 rounded-full bg-black/50 text-white flex flex-col items-center justify-center transition duration-200 cursor-pointer backdrop-blur-[1px] ${
                isUploadingAvatar ? "opacity-100" : "opacity-0 group-hover/avatar:opacity-100"
              }`}
            >
              {isUploadingAvatar ? (
                <>
                  <i className="bx bx-loader-alt animate-spin text-2xl"></i>
                  <span className="text-[9px] font-bold mt-0.5">Updating</span>
                </>
              ) : (
                <>
                  <i className="bx bx-camera text-2xl"></i>
                  <span className="text-[10px] font-bold mt-0.5">Edit</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
              />
            </label>

            {Boolean((user as any)?.isVerified || (user as any)?.role === "ADMIN") ? (
              <span
                className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600 text-white rounded-full shadow-sm flex items-center justify-center ring-2 ring-white dark:ring-slate-900 pointer-events-none"
                title="Verified Author"
              >
                <i className="bx bxs-badge-check text-base"></i>
              </span>
            ) : (
              <span
                className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-slate-900/90 dark:bg-slate-800 text-white rounded-full shadow-sm flex items-center justify-center ring-2 ring-white dark:ring-slate-900 pointer-events-none transition"
                title="Change Photo"
              >
                <i className="bx bx-camera text-sm"></i>
              </span>
            )}
          </div>
        </div>


        {/* Author Identity & Stats */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {displayName}
            </h1>
            {user?.headline && (
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                {user.headline}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">{displayUsername}</p>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              to="/my-blogs"
              className="bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center cursor-pointer shadow-2xs group"
              title="View my stories"
            >
              <span className="text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold mr-1">{user?.blogs?.length || 0}</span> Stories
            </Link>
            <button
              type="button"
              onClick={() => openFollowersModal("followers")}
              className="bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center cursor-pointer shadow-2xs group"
              title="View followers"
            >
              <span className="text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold mr-1">{user?.followers?.length || 0}</span> Followers
            </button>
            <button
              type="button"
              onClick={() => openFollowersModal("following")}
              className="bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center cursor-pointer shadow-2xs group"
              title="View following"
            >
              <span className="text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold mr-1">{user?.following?.length || 0}</span> Following
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mt-6 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setCurrentSel(idx)}
              className={`px-4 py-2.5 text-sm font-bold transition-all -mb-[1px] whitespace-nowrap cursor-pointer ${
                currentSel === idx
                  ? "border-b-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="pt-2 pb-4">
          {currentSel === 0 && <Account />}
          {currentSel === 1 && <SocialMedia />}
          {currentSel === 2 && <Notifications />}
          {currentSel === 3 && <Settings />}
        </div>
      </div>

      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        initialTab={modalTab}
        userId={user?.id ?? user?._id}
        username={user?.username}
        onCountChange={refreshUser}
      />
    </div>
  );
};