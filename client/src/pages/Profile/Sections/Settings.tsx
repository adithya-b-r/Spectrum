import { useState, useEffect } from "react";
import { DeleteAccountModal } from "../../../components/Modals/DeleteAccountModal";
import { useAuth } from "../../../context/AuthContext";
import { userApi } from "../../../services/api";
import { toast } from "react-toastify";
import { applyTheme } from "../../../utils/theme";

export const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [settingsModalState, setSettingsModalState] = useState(-1);
  const [visibility, setVisibility] = useState(user?.visibility || "PUBLIC");
  const [theme, setTheme] = useState(user?.theme || "LIGHT");

  useEffect(() => {
    if (user?.visibility) {
      setVisibility(user.visibility);
    }
    if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user]);

  const toggleSettingsModalState = (index: number) => {
    setSettingsModalState(index);
  };

  const handleVisibilityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVisibility = e.target.value as 'PUBLIC' | 'PRIVATE';
    setVisibility(newVisibility);

    if (user?._id) {
      try {
        await userApi.updateSettings(user._id, { visibility: newVisibility });
        await refreshUser();
        toast.success(`Profile visibility updated to ${newVisibility === 'PUBLIC' ? 'Public' : 'Private'}.`);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to update visibility.");
      }
    }
  };

  const handleThemeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as 'LIGHT' | 'DARK' | 'SYSTEM';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (user?._id) {
      try {
        await userApi.updateSettings(user._id, { theme: newTheme });
        await refreshUser();
        toast.success(`Appearance mode set to ${newTheme === 'LIGHT' ? 'Light' : newTheme === 'DARK' ? 'Dark' : 'System'}.`);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to update appearance mode.");
      }
    }
  };


  return (
    <div className="flex flex-col w-full space-y-6">
      {settingsModalState === 1 && (
        <DeleteAccountModal isOpen={true} onClose={() => toggleSettingsModalState(-1)} />
      )}

      {/* Preferences Group */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Preferences & Display</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400">Configure how your profile is displayed and customize your reading experience</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 sm:gap-6">
            <div className="w-full sm:w-1/2 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Profile Visibility</span>
              <span className="text-xs text-gray-400 dark:text-slate-400 block mt-0.5 leading-snug">Control who can discover and view your profile</span>
            </div>

            <div className="flex-1 flex sm:justify-end">
              <select
                value={visibility}
                onChange={handleVisibilityChange}
                className="w-full sm:w-auto py-2 px-3.5 rounded-xl text-xs font-semibold bg-slate-50/80 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer outline-none shadow-2xs focus:border-indigo-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors gap-3 sm:gap-6">
            <div className="w-full sm:w-1/2 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">Appearance Mode</span>
              <span className="text-xs text-gray-400 dark:text-slate-400 block mt-0.5 leading-snug">Theme and visual interface preference</span>
            </div>

            <div className="flex-1 flex sm:justify-end">
              <select
                value={theme}
                onChange={handleThemeChange}
                className="w-full sm:w-auto py-2 px-3.5 rounded-xl text-xs font-semibold bg-slate-50/80 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer outline-none shadow-2xs focus:border-indigo-500"
              >
                <option value="LIGHT">Light Mode</option>
                <option value="DARK">Dark Mode</option>
                <option value="SYSTEM">System Default</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone Group */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-red-700 dark:text-red-400 tracking-tight">Danger Zone</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400">Irreversible actions regarding your account</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200/80 dark:border-red-950/60 divide-y divide-red-100 dark:divide-red-950/40 overflow-hidden shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-red-50/20 dark:bg-red-950/20 hover:bg-red-50/40 dark:hover:bg-red-950/30 transition-colors gap-3 sm:gap-6">
            <div className="w-full sm:w-1/2 flex-shrink-0">
              <span className="text-sm font-semibold text-red-900 dark:text-red-300 block">Delete Account</span>
              <span className="text-xs text-red-500 dark:text-red-400 block mt-0.5 leading-snug">Permanently remove your account, articles, and all data</span>
            </div>

            <div className="flex-1 flex sm:justify-end">
              <button
                onClick={() => toggleSettingsModalState(1)}
                className="w-full sm:w-auto py-2 px-4 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-2xs transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

