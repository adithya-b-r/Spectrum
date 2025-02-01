import { useState } from "react";

export const PostFeedbackBar = () => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likedCount, setLikedCount] = useState(39);

  const toggleLiked = () => {
    setLiked(!liked);
    liked ? setLikedCount(likedCount - 1) : setLikedCount(likedCount + 1);
  };

  const toggleSaved = () => {
    setSaved(!saved);
  }

  return (
    <div className="w-[100%] px-5 h-12 my-2 flex justify-between">
      <div className="flex w-[15%] justify-between">
        <p className="flex font-semibold items-center gap-1 cursor-pointer" onClick={toggleLiked}>
          <i className={`bx ${liked ? 'bxs-heart' : 'bx-heart'} text-red-500 text-2xl`}></i> {likedCount}
        </p>

        <p className="flex items-center gap-1 cursor-pointer font-semibold">
          <i className="bx bx-chat text-blue-500 text-2xl"></i> 21
        </p>
      </div>

      <div className="flex w-[15%] justify-between">
        <p onClick={toggleSaved} className="px-4 py-2 cursor-pointer">
          <i className={`bx ${saved ? `bxs-bookmark-minus` : `bx-bookmark-plus`} mr-2 text-2xl`}></i>
        </p>

        <p className="px-4 py-2 cursor-pointer">
          <i className="bx bx-flip-horizontal bx-share mr-2 text-2xl"></i>
        </p>
      </div>
    </div>
  )
}