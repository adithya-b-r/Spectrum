import { useState } from "react";
import { Sidebar } from "./SectionA/Siderbar";
import { Posts } from "./SectionA/Posts";
import { Trending } from "./SectionB/Trending";
import { Suggestions } from "./SectionB/Suggestions";
import { useAuth } from "../../context/AuthContext";
import { BlogItem } from "../../services/api";

export const Home = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const [feedBlogs, setFeedBlogs] = useState<BlogItem[]>([]);

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            {!isLoading && isLoggedIn && (
              <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            )}
            <Posts activeTab={isLoggedIn ? activeTab : 'forYou'} onBlogsLoaded={setFeedBlogs} />
          </div>
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 sticky top-20">
            <Trending blogs={feedBlogs} />
            <Suggestions />
          </div>
        </div>
      </div>
    </main>
  );
};
