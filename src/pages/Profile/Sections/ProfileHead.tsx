import { useState } from "react"

export const ProfileHead = () => {
  const [currentSel, setCurrentSel] = useState(0);

  const toggleSel = (index:number) => {
    setCurrentSel(index);
  }

  return (
    <div className="w-full h-1/4 select-none">
      <div className="w-full m-8 flex items-center justify-center gap-20">
        <div className="bg-green-200 rounded-full border-2 border-gray-300 overflow-hidden cursor-pointer">
          <img src="nobita.jpg" className="size-36 rounded-full hover:scale-105 transition-all duration-300" alt="profile Image" />
        </div>

        <div className="p-5">
          <p className="text-3xl font-bold">Nobita Nobi</p>
          <div className="w-full flex mt-4 gap-5">
            <p className="text-lg text-gray-600 cursor-pointer"><span className="mr-1 text-gray-800 font-semibold text-xl">24</span>Posts</p>
            <p className="text-lg text-gray-600 cursor-pointer"><span className="mr-1 text-gray-800 font-semibold text-xl">512</span>Followers</p>
            <p className="text-lg text-gray-600 cursor-pointer"><span className="mr-1 text-gray-800 font-semibold text-xl">200</span>Following</p>
          </div>
        </div>
      </div>
      <div className="w-full flex border-b-2 border-b-gray-100">
        <p onClick={() => toggleSel(0)} className={`${currentSel == 0 ? 'border-b-2 border-slate-600 text-gray-800' : 'text-gray-500'} py-2 px-8 text-lg font-semibold cursor-pointer`}>Account</p>
        <p onClick={() => toggleSel(1)} className={`${currentSel == 1 ? 'border-b-2 border-slate-600 text-gray-800' : 'text-gray-500'} py-2 px-8 text-lg font-semibold cursor-pointer`}>Notifications</p>
        <p onClick={() => toggleSel(2)} className={`${currentSel == 2 ? 'border-b-2 border-slate-600 text-gray-800' : 'text-gray-500'} py-2 px-8 text-lg font-semibold cursor-pointer`}>Settings</p>
      </div>
    </div>
  )
}