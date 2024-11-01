import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [displayNav, setdisplayNav] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  }

  const toggleNav = () => {
    setdisplayNav((prev) => !prev);
  }

  return (
    <nav className="font-serif border-b-2 fixed w-full h-16 md:h-20 top-0 z-40 bg-white border-b-gray-200">
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center text-2xl font-bold">
          <img src="/logo2.png" onClick={() => navigate("/")} className="md:flex md:size-14 h-10 w-10 rounded-full mr-2 cursor-pointer" />
          <h1 onClick={() => navigate("/")} className='tracking-wider text-2xl md:text-3xl text-center hover:scale-105 transition-transform duration-1000 cursor-pointer'>Spectrum</h1>

          <div className="relative hidden md:flex ml-4 items-center justify-center">
            <i className='bx bx-search absolute left-5 text-xl text-gray-500'></i>
            <input type="text" placeholder='Search' className='font-sans font-normal text-gray-500 outline-none ml-2 py-2 pl-10 rounded-full border-none text-lg bg-slate-100' />
          </div>
        </div>

        <div className="flex items-center text-2xl md:text-3xl justify-center gap-4 sm:gap-8 md:gap-10">
          <i className="bx bx-edit font-thin cursor-pointer"></i>
          <i className={`bx ${darkMode ? 'bx-moon' : 'bx-sun'} cursor-pointer`} onClick={toggleDarkMode}></i>
          <img src="/profile2.jpg" onClick={toggleNav} className="size-8 md:size-10 rounded-full cursor-pointer" />

          {displayNav && (
            <div className="absolute flex flex-col top-16 md:top-20 right-3 bg-white w-56 rounded-md shadow-slate-200 border-2 border-slate-100 shadow-xl z-40 select-none">
              <div onClick={() => navigate("/profile")} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-user mr-2 text-xl"></i>
                <p className="text-xl">Profile</p>
              </div>
              <div onClick={() => navigate("/blogs")} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-book mr-2 text-xl"></i>
                <p className="text-xl">My Blogs</p>
              </div>
              <div onClick={() => navigate("/saved")} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-bookmark mr-2 text-xl"></i>
                <p className="text-xl">Saved Blogs</p>
              </div>
              <div className="divider bg-slate-200 h-0.5 mx-3"></div>
              <div onClick={() => navigate("/notifications")} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-bell mr-2 text-xl"></i>
                <p className="text-xl">Notifications</p>
              </div>
              <div onClick={() => navigate("/logout")} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-log-out mr-2 text-xl"></i>
                <p className="text-xl">Logout</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
