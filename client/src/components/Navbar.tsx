import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';
import { AppContext } from '../App';
import { useAuth } from "../controllers/authController";
import { SignInForm } from "./AuthForms/SignInForm";
import { LoginForm } from "./AuthForms/LoginForm";
import axios from "axios";

export const Navbar = () => {
  const [displayNav, setdisplayNav] = useState(false);
  const { setNotificationPage } = useContext(AppContext);
  const isLoggedIn = useAuth();
  // const isLoggedIn = true

  const [toggleRegister, setToggleRegister] = useState(false);
  const [toggleLogin, setToggleLogin] = useState(false);

  const navigate = useNavigate();

  const toggleNav = () => {
    setdisplayNav((prev) => !prev);
  }

  const handleLogout = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users/logout', {
        withCredentials: true,
      });

      setdisplayNav(false);
      alert(response.data);

      window.location.reload();
    } catch (err) {
      console.error("Error during logout:", err);
      alert("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    setdisplayNav(false);
  }, []);

  return (
    <>
      {toggleLogin && (<LoginForm onClose={() => setToggleLogin(false)} onSwitch={() => { setToggleLogin(false); setToggleRegister(true) }} />)}
      {toggleRegister && (<SignInForm onClose={() => setToggleRegister(false)} onSwitch={() => { setToggleRegister(false); setToggleLogin(true) }} />)}

      <nav className="font-quicksand border-b-2 fixed w-full h-16 md:h-18 top-0 z-40 bg-white border-b-gray-200">
        <div className="py-2 px-3 flex justify-between items-center">
          <div className="flex items-center text-2xl font-bold">
            <img src="/logo2.png" onClick={() => navigate("/")} className="md:flex md:size-12 h-10 w-10 rounded-full mr-2 cursor-pointer" />
            <h1 onClick={() => navigate("/")} className='tracking-wider text-2xl md:text-2xl text-center hover:scale-105 transition-transform duration-1000 cursor-pointer'>Spectrum</h1>

            <div className="relative hidden md:flex ml-5 items-center justify-center">
              <i className='bx bx-search absolute left-5 top-[0.4rem] text-xl text-gray-500'></i>
              <input type="text" placeholder='Search' className='font-sans font-normal text-gray-700 ml-2 py-1 pl-10 rounded-full text-lg bg-slate-100 border-2 border-gray-400 focus-within:border-slate-600 outline-none' />
            </div>
          </div>

          <div className="flex items-center text-2xl md:text-3xl justify-center gap-4 sm:gap-8 md:gap-10">
            {isLoggedIn &&
              <>
                <i onClick={() => navigate("/create-post")} className="bx bx-edit font-thin cursor-pointer"></i>
                <i onClick={() => { setNotificationPage(1); setdisplayNav(false); navigate("/profile"); }} className={`bx bx-bell cursor-pointer hover:bg-gray-200 transition-ease duration-500 p-1 rounded-full`}></i>
                <img src="/profile2.jpg" onClick={toggleNav} className="size-8 md:size-10 rounded-full cursor-pointer" />
              </>
            }

            {!isLoggedIn &&
              <>
                <button onClick={() => setToggleLogin(true)} className="text-lg font-semibold tracking-wide max-lg:hidden">Sign In</button>
                <button onClick={() => setToggleRegister(true)} className="text-lg text-nowrap tracking-wide font-semibold bg-black text-white px-2 py-1 md:px-4 md:py-1 rounded-full duration-300 hover:border-black border-2 border-transparent hover:text-black hover:bg-white">Get Started</button>
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
                <div onClick={() => { handleLogout(); }} className="flex items-center py-4 px-4 hover:bg-gray-100 cursor-pointer">
                  <i className="bx bx-log-out mr-2 text-xl"></i>
                  <p className="text-xl">Logout</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
