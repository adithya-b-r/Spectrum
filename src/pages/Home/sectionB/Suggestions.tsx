import { useState } from "react";

export const Suggestions = () => {
  const profiles = [
    { name: "Nobita", img: "nobita.jpg", about: "Hello, I'm Nobita dedicated, creative individual, committed to supporting my friends with loyalty and care." },
    { name: "Gian", img: "gian.jpg", about: "Hey, I'm Gian—confident and strong, valued for my loyalty and unique skills among friends." },
    { name: "Dekisugi", img: "dekisugi.jpg", about: "Greetings, I'm Dekisugi—calm, intelligent, and focused on learning, offering thoughtful support to my peers." },
  ]

  const [isFollowing, setIsFollowing] = useState(new Array(profiles.length).fill(false));

  const toggleFollow = (index: any) => {
    setIsFollowing(prev =>
      prev.map((followState, i) => (i === index ? !followState : followState))
    );
  };



  return (
    <div>
      <h1 className="text-2xl text-gray-800 font-bold tracking-wide inline-flex items-center gap-1">Suggestions <img src="suggestion.png" className="size-8" alt="Suggestions" /></h1>

      {profiles.map((profile, index) =>
        <div key={index} className="my-8 shadow-md p-3 rounded-xl">
          <div className=" head flex items-center gap-2 mb-4">
            <img src={profile.img} alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
            <p className="font-semibold text-sm text-gray-700 cursor-pointer">{profile.name}</p>
            <button
              onClick={() => toggleFollow(index)}
              className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${isFollowing[index] ? 'bg-gray-300 text-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isFollowing[index] ? 'Following' : 'Follow'}
            </button>
          </div>
          <div className="body">
            <h3 className="text-sm font-bold text-gray-600">{profile.about}</h3>
          </div>
        </div>
      )}
    </div>
  )
}