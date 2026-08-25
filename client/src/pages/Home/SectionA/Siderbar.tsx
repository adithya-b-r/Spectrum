import React from 'react';

interface SidebarProps {
  activeTab?: 'forYou' | 'following';
  onTabChange?: (tab: 'forYou' | 'following') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'forYou', onTabChange }) => {
  const tabs: Array<{ id: 'forYou' | 'following'; name: string }> = [
    { id: 'forYou', name: 'For You' },
    { id: 'following', name: 'Following' },
  ];

  return (
    <div className="flex items-center gap-3 w-full overflow-x-auto no-scrollbar py-1 select-none">
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar flex-nowrap">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-2xs'
              }`}
            >
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
