import React, { useState, useEffect } from "react";
import { Saved } from "./Saved";
import { Liked } from "./Liked";
import { useAuth } from "../../../context/AuthContext";
import { blogApi } from "../../../services/api";

export const FavoritesHead: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [currentSel, setCurrentSel] = useState(0);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [likedCount, setLikedCount] = useState<number>(0);

  useEffect(() => {
    const userId = currentUser?._id ?? currentUser?.id;
    if (!userId) return;

    const fetchCounts = async () => {
      try {
        const [savedRes, likedRes] = await Promise.allSettled([
          blogApi.getSaved(userId, 1, 1),
          blogApi.getLiked(userId, 1, 1),
        ]);

        if (savedRes.status === "fulfilled") {
          const total = savedRes.value.data?.pagination?.total ?? (Array.isArray(savedRes.value.data) ? savedRes.value.data.length : 0);
          setSavedCount(total);
        }
        if (likedRes.status === "fulfilled") {
          const total = likedRes.value.data?.pagination?.total ?? (Array.isArray(likedRes.value.data) ? likedRes.value.data.length : 0);
          setLikedCount(total);
        }

      } catch (err) {
        console.error("Failed to load favorites counts:", err);
      }
    };

    fetchCounts();
  }, [currentUser?._id, currentUser?.id]);

  const tabs = [
    { label: "Saved Stories", count: savedCount },
    { label: "Liked Articles", count: likedCount },
  ];

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Favorites
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Your personal library of bookmarked and liked stories on Spectrum
        </p>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mt-6">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setCurrentSel(idx)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all -mb-[1px] cursor-pointer ${
                currentSel === idx
                  ? "border-b-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  currentSel === idx
                    ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-200/70 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      <div>
        {currentSel === 0 && <Saved onCountChange={(c) => setSavedCount(c)} />}
        {currentSel === 1 && <Liked onCountChange={(c) => setLikedCount(c)} />}
      </div>
    </div>
  );
};