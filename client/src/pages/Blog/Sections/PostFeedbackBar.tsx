import { useState } from "react";
import { shareThis } from "../../../utils/shareURL";

export const PostFeedbackBar = () => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likedCount, setLikedCount] = useState(39);

  const title = "Unlocking the Secrets to Success: Practical Tips for Everyday Life"
  const description = "Success is often perceived as an elusive concept, reserved for the lucky or the exceptionally talented..."

  const handleShare = async () => {
    const url = window.location.href;
    await shareThis(url, title, description);
  };

  const toggleLiked = () => {
    setLiked(!liked);
    liked ? setLikedCount(likedCount - 1) : setLikedCount(likedCount + 1);
  };

  const toggleSaved = () => {
    setSaved(!saved);
  }

  return (
    <div className="w-[100%] px-5 h-12 my-2 flex justify-between">
      <div className="flex w-[15%] gap-5 md:gap-0 justify-between">
        <p className="flex font-semibold items-center gap-1 cursor-pointer" onClick={toggleLiked}>
          <i className={`bx ${liked ? 'bxs-heart' : 'bx-heart'} text-red-500 text-2xl`}></i> {likedCount}
        </p>

        <p className="flex items-center gap-1 cursor-pointer font-semibold">
          <i className="bx bx-chat text-blue-500 text-2xl"></i> 21
        </p>
      </div>

      <div className="flex md:w-[15%] justify-between">
        <p onClick={toggleSaved} className="px-4 py-2 cursor-pointer">
          <i className={`bx ${saved ? `bxs-bookmark-minus` : `bx-bookmark-plus`} mr-2 text-2xl`}></i>
        </p>

        <p className="md:px-4 py-2 cursor-pointer" onClick={handleShare}>
          <i className="bx bx-flip-horizontal bx-share md:mr-2 text-2xl"></i>
        </p>
      </div>
    </div>
  )
}