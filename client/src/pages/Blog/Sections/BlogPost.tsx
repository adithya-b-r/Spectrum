import { useState } from "react";

export const BlogPost = () => {
  const [Following, setFollowing] = useState(false);

  const toggleFollow = () => {
    setFollowing(!Following);
  };

  return (
    <div className="mx-[20%] w-50 h-screen flex flex-col border-x-2">
      <div className="m-5">
        <h1 className="text-4xl font-extrabold leading-snug text-gray-700">Unlocking the Secrets to Success: Practical Tips for Everyday Life</h1>
      </div>

      <div className="mx-5">
        <p className="font-semibold text-gray-600"><span className="font-bold">By Dekisugi</span> <span className="text-blue-600 font-extrabold">|</span> Published on Jan 12th, 2025</p>
      </div>

    </div>
  )
}

// https://afaeducation.org/blog/how-to-be-happy-10-tips-and-strategies-for-a-fulfilling-life/