import { Sidebar } from "./SectionA/Siderbar";
import { Posts } from "./SectionA/Posts";
import { Trending } from "./SectionB/Trending";
import { Suggestions } from "./SectionB/Suggestions";
import { Recommends } from "./SectionB/Recommends";

export const Home = () => {
  return (
    <>
      <div className="w-full h-screen flex overflow-hidden">
        <div className="w-full md:w-2/3 h-full p-4 md:p-12 overflow-y-scroll scroll-smooth select-none">
          <Sidebar />
          <Posts />
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
