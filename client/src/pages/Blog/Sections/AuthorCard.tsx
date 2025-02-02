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
        <div className="md:w-[10%] w-[20%] flex justify-center">
          <img src="/dekisugi.jpg" alt="author" className="w-20 h-20 rounded-full cursor-pointer" />
        </div>

        <div className="w-[80%] mx-5">

          <div className="md:flex md:mb-2 md:items-center">
            <h3 className="font-bold text-lg mb-2 md:mb-0">Hidetoshi Dekisugi</h3>
            <button
              onClick={() => toggleFollow()}
              className={`block md:inline-block md:ml-4 px-3 py-1 mb-2 md:mb-0 text-sm font-semibold rounded-full transition-colors duration-300 ${isFollowing ? 'bg-gray-300 text-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>


          <p className="tracking-wide font-semibold text-gray-600">I'm a passionate writer and lifelong learner who loves exploring personal growth, productivity,
            and success strategies. I believe in continuous improvement and sharing insights to inspire others.
          </p>
        </div>
      </div>
    </div>
  )
}