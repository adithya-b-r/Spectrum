import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { userApi } from "../../../services/api";
import { toast } from "react-toastify";

export const SocialMedia: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [socials, setSocials] = useState({
    twitter: "",
    github: "",
    website: "",
    linkedin: "",
  });

  useEffect(() => {
    if (user) {
      setSocials({
        twitter: user.twitter || "",
        github: user.github || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
      });
    }
  }, [user]);

  const [editingSocial, setEditingSocial] = useState<string | null>(null);
  const [tempSocialVal, setTempSocialVal] = useState<string>("");

  const startEdit = (key: string, val: string) => {
    setEditingSocial(key);
    setTempSocialVal(val);
  };

  const saveEdit = async (key: string) => {
    let trimmed = tempSocialVal.trim();

    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(trimmed)) {
        trimmed = "https://" + trimmed;
      } else {
        const exampleDomain = key === "twitter" ? "x.com" : key + ".com";
        toast.error("Please enter a valid URL (e.g. https://" + exampleDomain + "/username)");
        return;
      }
    }

    setSocials((prev) => ({ ...prev, [key]: trimmed }));
    setEditingSocial(null);

    if (user?._id) {
      try {
        await userApi.updateProfile(user._id, { [key]: trimmed });
        await refreshUser();
        toast.success(key.charAt(0).toUpperCase() + key.slice(1) + " link updated!");
      } catch (err: any) {
        toast.error(err.response?.data?.message || ("Failed to update " + key));
      }
    }
  };

  return (
    <div className="flex flex-col w-full space-y-8 select-none">
      {/* Social Media & Connect Links */}
      <div>
        <div className="mb-3.5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <i className="bx bx-share-alt text-indigo-600 dark:text-indigo-400 text-base"></i>
            <span>Connect & Social Networks</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Links and handles displayed on your public profile</p>
        </div>

        {/* Live Preview Button Row */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 mb-4 shadow-2xs">
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
            Public Card Preview
          </span>
          {socials.twitter || socials.github || socials.website || socials.linkedin ? (
            <div className="flex flex-wrap items-center gap-3">
              {socials.twitter && (
                <a
                  href={socials.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 dark:border-slate-700 shadow-2xs transition"
                >
                  <i className="bx bxl-twitter text-sky-500 text-base"></i>
                  <span>Twitter / X</span>
                </a>
              )}

              {socials.github && (
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 dark:border-slate-700 shadow-2xs transition"
                >
                  <i className="bx bxl-github text-gray-900 dark:text-white text-base"></i>
                  <span>GitHub</span>
                </a>
              )}

              {socials.website && (
                <a
                  href={socials.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 dark:border-slate-700 shadow-2xs transition"
                >
                  <i className="bx bx-globe text-indigo-600 dark:text-indigo-400 text-base"></i>
                  <span>Personal Site</span>
                </a>
              )}

              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 dark:border-slate-700 shadow-2xs transition"
                >
                  <i className="bx bxl-linkedin text-blue-600 text-base"></i>
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-400 dark:text-slate-500 italic">
              No social links configured yet. Add your profiles below to preview your public buttons.
            </p>
          )}
        </div>

        {/* Social URL Configuration Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
          {/* Twitter / X */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0 flex items-center gap-2.5">
              <i className="bx bxl-twitter text-sky-500 text-xl"></i>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Twitter / X</span>
                <span className="text-xs text-gray-400 dark:text-slate-500 block">Your X profile URL</span>
              </div>
            </div>

            <div className="flex-1 w-full min-w-0">
              {editingSocial === "twitter" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempSocialVal}
                    onChange={(e) => setTempSocialVal(e.target.value)}
                    placeholder="https://x.com/username"
                    className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950"
                  />
                  <button
                    onClick={() => saveEdit("twitter")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingSocial(null)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit("twitter", socials.twitter)}
                  className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words truncate">
                    {socials.twitter || "Not connected"}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* GitHub */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0 flex items-center gap-2.5">
              <i className="bx bxl-github text-gray-900 dark:text-white text-xl"></i>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">GitHub</span>
                <span className="text-xs text-gray-400 dark:text-slate-500 block">Your GitHub profile URL</span>
              </div>
            </div>

            <div className="flex-1 w-full min-w-0">
              {editingSocial === "github" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempSocialVal}
                    onChange={(e) => setTempSocialVal(e.target.value)}
                    placeholder="https://github.com/username"
                    className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950"
                  />
                  <button
                    onClick={() => saveEdit("github")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingSocial(null)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit("github", socials.github)}
                  className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words truncate">
                    {socials.github || "Not connected"}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Personal Website */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0 flex items-center gap-2.5">
              <i className="bx bx-globe text-indigo-600 dark:text-indigo-400 text-xl"></i>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Personal Site</span>
                <span className="text-xs text-gray-400 dark:text-slate-500 block">Blog or portfolio link</span>
              </div>
            </div>

            <div className="flex-1 w-full min-w-0">
              {editingSocial === "website" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempSocialVal}
                    onChange={(e) => setTempSocialVal(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950"
                  />
                  <button
                    onClick={() => saveEdit("website")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingSocial(null)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit("website", socials.website)}
                  className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words truncate">
                    {socials.website || "Not connected"}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* LinkedIn */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 lg:gap-8">
            <div className="w-full lg:w-48 flex-shrink-0 flex items-center gap-2.5">
              <i className="bx bxl-linkedin text-blue-600 text-xl"></i>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">LinkedIn</span>
                <span className="text-xs text-gray-400 dark:text-slate-500 block">Professional profile link</span>
              </div>
            </div>

            <div className="flex-1 w-full min-w-0">
              {editingSocial === "linkedin" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempSocialVal}
                    onChange={(e) => setTempSocialVal(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 dark:text-slate-100 outline-none ring-2 ring-indigo-100 dark:ring-indigo-950"
                  />
                  <button
                    onClick={() => saveEdit("linkedin")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingSocial(null)}
                    className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit("linkedin", socials.linkedin)}
                  className="w-full flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition duration-150 gap-3 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 break-words truncate">
                    {socials.linkedin || "Not connected"}
                  </span>
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg shadow-2xs">
                    <span>Edit</span>
                    <i className="bx bx-edit-alt text-xs text-gray-400 dark:text-slate-500"></i>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
