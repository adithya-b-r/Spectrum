import { Sidebar } from "./sectionA/Siderbar";
import { Posts } from "./sectionA/Posts";
import { Trending } from "./sectionB/Trending"
import { Suggestions } from "./sectionB/Suggestions";
import { Recommends } from "./sectionB/Recommends";

export const Home = () => {
  return (
    <>
      <div className="w-full h-screen flex">
        <div className="w-full md:w-2/3 h-screen p-4 md:p-12 overflow-scroll scroll-smooth select-none">
          <Sidebar />
          <Posts />
          <Posts />
          <Posts />
          <Posts />
          <div className="flex w-full align-center justify-center">
            <button className="bg-blue-500 py-2 px-4 text-white font-semibold rounded-lg">Load More</button>
          </div>
        </div>
        <div className="hidden md:flex w-1/3 h-screen border-l-2 border-l-gray-200 p-12 flex-col overflow-scroll scroll-smooth select-none">
          <Trending />
          <Recommends />
          <Suggestions />
        </div>
      </div>
    </>
  )
}