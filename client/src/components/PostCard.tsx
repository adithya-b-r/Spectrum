import React from "react";
import { useState } from "react";
import { shareThis } from "../utils/shareURL";

interface PostCardProps {
  isFollowing: boolean;
  isSaved: boolean;
  isLiked: boolean;
  name: string;
  profileImg: string;

  postImg: string;
  title: string;
  description: string;
  url: string;
}

export const PostCard: React.FC<PostCardProps> = ({ isFollowing, isSaved, isLiked, name, profileImg, postImg, title, description, url }) => {
  const [Following, setFollowing] = useState(isFollowing);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [liked, setLiked] = useState(isLiked);
  const [likedCount, setLikedCount] = useState(39);

  const toggleFollow = () => {
    setFollowing(!Following);
  };

  const toggleLiked = () => {
    setLiked(!liked);
    liked ? setLikedCount(likedCount - 1) : setLikedCount(likedCount + 1);
  };

  const toggleSaved = () => {
    setSaved(!saved);
  }

  const toggleDropdown = () => {
    setDropdownOpen((prev) => {
      const newState = !prev;

      if (newState) {
        window.addEventListener('mousedown', closeDropdownOnOutsideClick);
      } else {
        window.removeEventListener('mousedown', closeDropdownOnOutsideClick);
      }

      return newState;
    });
  };

  const closeDropdownOnOutsideClick = (e: any) => {
    const dropdownElement = document.querySelector('.dropRef');

    if (dropdownElement && !dropdownElement.contains(e.target)) {
      setDropdownOpen(false);
      window.removeEventListener('mousedown', closeDropdownOnOutsideClick);
    }
  };

  const handleShare = async () => {
    // const url = window.location.href;
    await shareThis(url, title, description);
  };

  return (
    <div className="flex flex-col w-full h-fit px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="post flex flex-col md:flex-row w-full h-fit border-2  rounded-lg shadow-lg mb-8">
        <div className="sec1 md:w-2/3 p-6">
          <div className="head flex items-center gap-2 mb-4">
            <img src={`${profileImg}`} alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
            <p className="font-extrabold text-sm text-gray-700 cursor-pointer">{name}</p>
            <button
              onClick={toggleFollow}
              className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${Following ? 'bg-gray-300 text-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {Following ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="body mb-4">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-700 font-semibold leading-6">
              {description}
            </p>
          </div>

          <div className="footer flex items-center gap-6 mt-4 text-gray-500 text-sm">
            <p className="flex items-center gap-1 cursor-pointer" onClick={toggleLiked}>
              <i className={`bx ${liked ? 'bxs-heart' : 'bx-heart'} text-red-500`}></i> {likedCount}
            </p>

            <p className="flex items-center gap-1 cursor-pointer">
              <i className="bx bx-chat text-blue-500"></i> 21
            </p>

            <p className="flex items-center gap-1">Oct 29</p>

            <div className="relative ml-auto">
              <p onClick={toggleDropdown} className="cursor-pointer">
                <i className="text-2xl bx bx-dots-horizontal-rounded"></i>
              </p>
              {dropdownOpen && (
                <div className={`dropRef absolute w-28 bg-white rounded-lg shadow-lg z-10 
                  ${window.innerWidth < 768 ? 'left-2 bottom-7 -translate-x-1/2 mb-2' : 'md:left-8 md:top-3 -translate-y-1/2'}`}>
                  <ul>
                    <li onClick={toggleSaved} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <i className={`bx ${saved ? `bxs-bookmark-minus` : `bx-bookmark-plus`} mr-2`}></i> {saved ? "Unsave" : "Save"}
                    </li>
                    <li onClick={handleShare} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <i className='bx bx-share bx-flip-horizontal mr-2'></i> Share
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sec2 md:w-1/3 md:p-6 pt-0 p-6 flex justify-center items-center">
          <img src={`${postImg}`} alt="Post" className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}