import { useState } from "react"
import { Saved } from "./Saved";
import { Liked } from "./Liked";

export const FavoritesHead = () => {
  const [currentSel, setCurrentSel] = useState(0);

  const toggleSel = (index: number) => {
    setCurrentSel(index);
  }

  return (
      <div className="w-full select-none md:mx-12 mx-1 overflow-hidden">
        <div className="my-8 mx-4">
          <h1 className="font-bold md:text-5xl text-3xl tracking-wide">Favorites</h1>
        </div>
        <div className="w-full flex justify-around md:justify-normal border-b-2 border-b-gray-100">
          <p onClick={() => toggleSel(0)} className={`${currentSel == 0 ? 'border-b-2 border-slate-600 text-gray-800' : 'text-gray-500'} py-2 md:w-auto w-1/2 text-center md:px-12 text-lg font-semibold cursor-pointer`}>Saved</p>
          <p onClick={() => toggleSel(1)} className={`${currentSel == 1 ? 'border-b-2 border-slate-600 text-gray-800' : 'text-gray-500'} py-2 md:w-auto w-1/2 text-center md:px-12 text-lg font-semibold cursor-pointer`}>Liked</p>
        </div>
        {currentSel == 0 && <Saved />}
        {currentSel == 1 && <Liked />}
      </div>
  )
}