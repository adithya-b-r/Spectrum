import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';
import { AppContext } from '../App';
import axios from "axios";

export const Navbar = () => {
  const [displayNav, setdisplayNav] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { setNotificationPage } = useContext(AppContext);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  }

  const toggleNav = () => {
    setdisplayNav((prev) => !prev);
  }

  const handleLogout = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users/logout', {
        withCredentials: true,
      });
      alert(response.data);
    } catch (err) {
      console.error("Error during logout:", err);
      alert("Logout failed. Please try again.");
    }
  };


  useEffect(() => {
    setdisplayNav(false)
  }, [])

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
          {isLoggedIn &&
            <>
              <i onClick={() => navigate("/create-post")} className="bx bx-edit font-thin cursor-pointer"></i>
              <i className={`bx ${darkMode ? 'bx-moon' : 'bx-sun'} cursor-pointer hover:bg-gray-200 transition-ease duration-500 p-1 rounded-full hidden`} onClick={toggleDarkMode}></i>
              <i onClick={() => { setNotificationPage(1); setdisplayNav(false); navigate("/profile"); }} className={`bx bx-bell cursor-pointer hover:bg-gray-200 transition-ease duration-500 p-1 rounded-full`}></i>
              <img src="/profile2.jpg" onClick={toggleNav} className="size-8 md:size-10 rounded-full cursor-pointer" />
            </>
          }

          {!isLoggedIn &&
            <>
              <button className="text-lg">Sign In</button>
              <button className="text-lg bg-black text-white px-4 py-2 rounded-full duration-300 hover:border-black border-2 border-transparent hover:text-black hover:bg-white">Get Started</button>
            </>
          }

          {displayNav && (
            <div className="absolute flex flex-col top-16 md:top-20 right-3 bg-white w-56 rounded-md shadow-slate-200 border-2 border-slate-100 shadow-xl z-40 select-none">
              <div onClick={() => { setNotificationPage(0); setdisplayNav(false); navigate("/profile"); }} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-user mr-2 text-xl"></i>
                <p className="text-xl">Profile</p>
              </div>
              <div onClick={() => { setdisplayNav(false); navigate("/blogs"); }} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-book mr-2 text-xl"></i>
                <p className="text-xl">My Blogs</p>
              </div>
              <div onClick={() => { setdisplayNav(false); navigate("/favorites"); }} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-heart mr-2 text-xl"></i>
                <p className="text-xl">Favorites</p>
              </div>
              <div className="divider bg-slate-200 h-0.5 mx-3"></div>
              <div onClick={() => { setNotificationPage(1); setdisplayNav(false); navigate("/profile"); }} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-bell mr-2 text-xl"></i>
                <p className="text-xl">Notifications</p>
              </div>
              <div onClick={() => { handleLogout(); setdisplayNav(false) }} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                <i className="bx bx-log-out mr-2 text-xl"></i>
                <p className="text-xl" onClick={() => setIsLoggedIn(false)}>Logout</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
