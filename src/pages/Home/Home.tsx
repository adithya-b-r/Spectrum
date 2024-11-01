import { Sidebar } from "../Home/SectionA/Siderbar";
import { Posts } from "../Home/SectionA/Posts";
import { Trending } from "../Home/SectionB/Trending";
import { Suggestions } from "../Home/SectionB/Suggestions";
import { Recommends } from "../Home/SectionB/Recommends";

export const Home = () => {
  return (
    <>
      <div className="w-full h-screen flex overflow-hidden">
        <div className="w-full md:w-2/3 h-full p-4 md:p-12 overflow-y-scroll scroll-smooth select-none">
          <Sidebar />
          <Posts />
          <Posts />
          <Posts />
          <Posts />
          <div className="flex w-full align-center justify-center">
            <button className="bg-blue-500 py-2 px-4 text-white font-semibold rounded-lg">Load More</button>
          </div>
        </div>
        <div className="hidden md:flex w-1/3 h-full border-l-2 border-l-gray-200 p-12 flex-col overflow-y-scroll scroll-smooth select-none">
          <Trending />
          <Recommends />
          <Suggestions />
        </div>
      </div>
    </>
  );
};
