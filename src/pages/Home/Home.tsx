import { Sidebar } from "./Siderbar";
import { Posts } from "./Posts";

export const Home = () => {
  return (
    <>
      <div className="w-full h-screen flex ">
        <div className="w-full md:w-2/3 h-screen p-4 md:p-12 overflow-scroll scroll-smooth select-none">
          <Sidebar />
          <Posts />
          <Posts />
          <Posts />
          <Posts />
        </div>
        <div className="hidden md:flex w-1/3 h-screen border-l-2 border-l-gray-200 p-12">
          Section 2
        </div>
      </div>
    </>
  )
}