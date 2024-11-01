import { useState} from 'react';

export const Posts = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const toggleSaved = () => {
    setSaved(!saved);
  }

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const shareThis = async (url: any) => {
    if (navigator.share) {
      try {
        await navigator.clipboard.writeText(url);
        await navigator.share({
          title: 'Spectrum',
          text: 'Check out this awesome post!',
          url: url
        });
        console.log('Shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      console.log('Share not supported on this browser.');
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="flex flex-col w-full h-fit px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="post flex flex-col md:flex-row w-full h-fit bg-white rounded-lg shadow-md  mb-8">
        <div className="sec1 md:w-2/3 p-6">
          <div className="head flex items-center gap-2 mb-4">
            <img src="profile2.jpg" alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
            <p className="font-semibold text-sm text-gray-700 cursor-pointer">Adithya</p>
            <button
              onClick={toggleFollow}
              className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${isFollowing ? 'bg-gray-300 text-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="body mb-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Title of the Post</h3>
            <p className="text-gray-700 text-sm leading-6">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. In consequatur dolorem accusantium nostrum ut sequi quas ducimus iusto...
            </p>
          </div>

          <div className="footer flex items-center gap-6 mt-4 text-gray-500 text-sm">
            <p className="flex items-center gap-1">
              <i className="bx bx-heart"></i> 36
            </p>
            <p className="flex items-center gap-1">
              <i className="bx bx-chat"></i> 21
            </p>
            <p className="flex items-center gap-1">Oct 29</p>

            <div className="relative ml-auto">
              <p onClick={toggleDropdown} className="cursor-pointer">
                <i className="text-2xl bx bx-dots-horizontal-rounded"></i>
              </p>
              {dropdownOpen && (
                <div className={`absolute w-28 bg-white rounded-lg shadow-lg z-10 
                  ${window.innerWidth < 768 ? 'left-2 bottom-7 -translate-x-1/2 mb-2' : 'md:left-8 md:top-3 -translate-y-1/2'}`}>
                  <ul>
                    <li onClick={toggleSaved} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <i className={`bx ${saved ? `bxs-bookmark-minus` : `bx-bookmark-plus`} mr-2`}></i> {saved ? "Unsave" : "Save"}
                    </li>
                    <li onClick={() => shareThis("https://spectrum-blog.vercel.app")} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <i className='bx bx-share bx-flip-horizontal mr-2'></i> Share
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sec2 md:w-1/3 md:p-6 pt-0 p-6 flex justify-center items-center">
          <img src="blogImage.jpg" alt="Post" className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};
