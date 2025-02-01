import { useState } from "react";

export const AuthorCard = () => {
  const [isFollowing, setIsFollowing] = useState(false);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="mx-5 my-5">
      <h1 className="font-extrabold text-3xl mb-8">About the Author</h1>

      <div className="flex">
        <div className="w-[10%] flex justify-center">
          <img src="/dekisugi.jpg" alt="author" className="w-20 h-20 rounded-full cursor-pointer" />
        </div>

        <div className="w-[90%] mx-5">
          <h3 className="font-semibold mb-2 text-lg">Hidetoshi Dekisugi
            <button
              onClick={() => toggleFollow()}
              className={`ml-4 px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${isFollowing ? 'bg-gray-300 text-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >{isFollowing ? 'Following' : 'Follow'}
            </button>
          </h3>

          <p>I'm a passionate writer and lifelong learner who loves exploring personal growth, productivity,
            and success strategies. I believe in continuous improvement and sharing insights to inspire others.
          </p>
        </div>
      </div>
    </div>
  )
}