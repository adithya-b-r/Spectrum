import { useState, useEffect } from "react";
import { UsernameModal } from "../../../components/Modals/UsernameModal";
import { NameModal } from "../../../components/Modals/NameModal";
import { EmailModal } from "../../../components/Modals/EmailModal";
import { AboutModal } from "../../../components/Modals/AboutModal";
import { ChangePassModal } from "../../../components/Modals/ChangePassModal";
import { useAuth } from "../../../context/AuthContext";
import { userApi } from "../../../services/api";
import { toast } from "react-toastify";

export const Account = () => {
  const { user, refreshUser } = useAuth();
  const [accountModalState, setAccountModalState] = useState(-1);

  // Profile fields state
  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    email: "",
    badge: "",
    bio: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        username: user.username ? (user.username.startsWith("@") ? user.username : `@${user.username}`) : "",
        email: user.email || "",
        badge: user.headline || "",
        bio: user.about || "",
        location: user.location || "",
        website: user.website || "",
      });
    }
  }, [user]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  const toggleAccountModalState = (index: number) => {
    setAccountModalState(index);
  };

  const startInlineEdit = (fieldKey: string, currentVal: string) => {
    setEditingField(fieldKey);
    setTempValue(currentVal);
  };

  const saveInlineEdit = async (fieldKey: string) => {
    const trimmedVal = tempValue.trim();
    setProfileData((prev) => ({ ...prev, [fieldKey]: trimmedVal }));
    setEditingField(null);

    if (user?._id) {
      try {
        if (fieldKey === "fullName") {
          await userApi.updateName(user._id, trimmedVal);
          toast.success("Name updated successfully!");
        } else if (fieldKey === "username") {
          const cleanUsername = trimmedVal.replace(/^@/, '');
          await userApi.updateUsername(user._id, cleanUsername);
          toast.success("Username updated successfully!");
        } else if (fieldKey === "bio") {
          await userApi.updateAbout(user._id, trimmedVal);
          toast.success("Bio updated successfully!");
        } else if (fieldKey === "badge") {
          await userApi.updateProfile(user._id, { headline: trimmedVal });
          toast.success("Headline updated successfully!");
        } else if (fieldKey === "location") {
          await userApi.updateProfile(user._id, { location: trimmedVal });
          toast.success("Location updated successfully!");
        } else if (fieldKey === "website") {
          let webVal = trimmedVal;
          if (webVal && !/^https?:\/\//i.test(webVal)) {
            if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(webVal)) {
              webVal = `https://${webVal}`;
            } else {
              toast.error("Please enter a valid website URL (starting with http:// or https://)");
              return;
            }
          }
          await userApi.updateProfile(user._id, { website: webVal });
          toast.success("Website updated successfully!");
        }
        await refreshUser();
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to update profile";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="flex flex-col w-full space-y-8 select-none">
      {/* Existing Modals */}
      {accountModalState === 0 && (
        <NameModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />
      )}
      {accountModalState === 1 && (
        <UsernameModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />
      )}
      {accountModalState === 2 && (
        <EmailModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />
      )}
      {accountModalState === 3 && (
        <AboutModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />
      )}
      {accountModalState === 4 && (
        <ChangePassModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />
      )}

      {/* 1. Public Identity & Bio */}
      <div>
        <div className="mb-3.5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <i className="bx bx-user-circle text-indigo-600 dark:text-indigo-400 text-base"></i>
            <span>Public Identity & Biography</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">Information displayed on your public author page and articles</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
          {/* Full Name */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Full Name</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5 leading-snug">Visible on your public author card</span>
            </div>
            <div className="flex-1 w-full min-w-0">
              {editingField === "fullName" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempValue}
                    placeholder="Enter your full name"
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950"
                  />
                  <button
                    onClick={() => saveInlineEdit("fullName")}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startInlineEdit("fullName", profileData.fullName)}
                  className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words">
                    {profileData.fullName || <span className="text-gray-400 dark:text-slate-500 italic">Not set</span>}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Username</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5 leading-snug">Unique URL handle for your profile</span>
            </div>
            <div className="flex-1 w-full min-w-0">
              {editingField === "username" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempValue}
                    placeholder="e.g. adithya"
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950"
                  />
                  <button
                    onClick={() => saveInlineEdit("username")}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startInlineEdit("username", profileData.username)}
                  className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words">
                    {profileData.username || <span className="text-gray-400 dark:text-slate-500 italic">Not set</span>}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Author Headline / Badge */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Headline / Badge</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5 leading-snug">Displayed next to your author name</span>
            </div>
            <div className="flex-1 w-full min-w-0">
              {editingField === "badge" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempValue}
                    placeholder="e.g. Writer, Software Architect"
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950"
                  />
                  <button
                    onClick={() => saveInlineEdit("badge")}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startInlineEdit("badge", profileData.badge)}
                  className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words">
                    {profileData.badge || <span className="text-gray-400 dark:text-slate-500 italic">Add headline badge...</span>}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio / About */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Biography / About</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5 leading-snug">Detailed intro on your profile</span>
            </div>
            <div className="flex-1 w-full min-w-0">
              {editingField === "bio" ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={3}
                    value={tempValue}
                    placeholder="Write a brief introduction about yourself..."
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl p-3 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950 leading-relaxed"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setEditingField(null)}
                      className="px-3.5 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveInlineEdit("bio")}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Save Bio
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => startInlineEdit("bio", profileData.bio)}
                  className="w-full flex items-start justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl p-3.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 leading-relaxed">
                    {profileData.bio || <span className="text-gray-400 dark:text-slate-500 italic">Add a short biography...</span>}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Location</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5 leading-snug">Your primary city or country</span>
            </div>
            <div className="flex-1 w-full min-w-0">
              {editingField === "location" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempValue}
                    placeholder="e.g. Bangalore, India"
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950"
                  />
                  <button
                    onClick={() => saveInlineEdit("location")}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startInlineEdit("location", profileData.location)}
                  className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words">
                    {profileData.location || <span className="text-gray-400 dark:text-slate-500 italic">Add location...</span>}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Personal Website */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Personal Website</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5 leading-snug">Link to your blog, portfolio, or site</span>
            </div>
            <div className="flex-1 w-full min-w-0">
              {editingField === "website" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempValue}
                    placeholder="https://yourwebsite.com"
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950"
                  />
                  <button
                    onClick={() => saveInlineEdit("website")}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startInlineEdit("website", profileData.website)}
                  className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words">
                    {profileData.website || <span className="text-gray-400 dark:text-slate-500 italic">Add website...</span>}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Authentication */}
      <div>
        <div className="mb-3.5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <i className="bx bx-shield-quarter text-indigo-600 dark:text-indigo-400 text-base"></i>
            <span>Security & Authentication</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">Manage your sign-in email and credentials</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
          {/* Email */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Email Address</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5 leading-snug">Used for account sign-in & alerts</span>
            </div>
            <div className="flex-1 w-full min-w-0">
              <div className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl px-4 py-2.5 gap-3">
                <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words">
                  {profileData.email || <span className="text-gray-400 dark:text-slate-500 italic">Not set</span>}
                </span>
                <span className="flex-shrink-0 text-xs font-medium text-gray-400 dark:text-slate-500">Primary</span>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Password</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5 leading-snug">Secure account authentication</span>
            </div>
            <div className="flex-1 w-full min-w-0">
              <div
                onClick={() => toggleAccountModalState(4)}
                className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400">••••••••••••</span>
                <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                  <span>Change</span>
                  <i className="bx bx-lock-alt text-xs text-gray-400 dark:text-slate-500"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};