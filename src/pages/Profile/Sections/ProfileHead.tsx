import { useState, useContext, useEffect } from "react"
import { Account } from "../Sections/Account";
import { Notifications } from "../Sections/Notifications";
import { Settings } from "../Sections/Settings";
import { AppContext } from '../../../App';

export const ProfileHead = () => {
  const { notificationPage, setNotificationPage } = useContext(AppContext);
  const [currentSel, setCurrentSel] = useState(0);

  const toggleSel = (index: number) => {
    setCurrentSel(index);
  }

  useEffect(() => {
    if (notificationPage === 1) {
      setCurrentSel(1);
      setNotificationPage(-1);
    }else if(notificationPage === 0){
      setCurrentSel(0);
    }
  }, [notificationPage, setNotificationPage]);

  return (
    <div className="w-full select-none md:mx-12 mx-1 overflow-hidden">
      <div className="w-full md:m-8 my-4 flex flex-col md:flex-row items-center justify-center md:gap-20">
        <div className="h-24 w-24 md:h-36 md:w-36 rounded-full border-2 border-gray-300 overflow-hidden cursor-pointer flex items-center justify-center">
          <img src="nobita.jpg" className="h-24 w-24 md:h-36 md:w-36 rounded-full hover:scale-105 transition-all duration-300" alt="profile Image" />
        </div>

        <div className="md:p-5 py-2 flex flex-col items-center md:items-start">
          <p className="text-2xl md:text-3xl font-bold text-gray-800">Nobita Nobi</p>
          <div className="w-full flex mt-4 gap-5 justify-center md:justify-start">
            <div className="flex items-center justify-center flex-wrap cursor-pointer">
              <span className="mr-1 text-gray-800 font-semibold md:text-xl text-lg">24</span>
              <p className="md:text-lg text-gray-600">Posts</p>
            </div>
            <div className="flex items-center justify-center flex-wrap cursor-pointer">
              <span className="mr-1 text-gray-800 font-semibold md:text-xl text-lg">512</span>
              <p className="md:text-lg text-gray-600">Followers</p>
            </div>
            <div className="flex items-center justify-center flex-wrap cursor-pointer">
              <span className="mr-1 text-gray-800 font-semibold md:text-xl text-lg">200</span>
              <p className="md:text-lg text-gray-600">Following</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-around md:justify-normal border-b-2 border-b-gray-100">
        <p onClick={() => toggleSel(0)} className={`${currentSel == 0 ? 'border-b-2 border-slate-600 text-gray-800' : 'text-gray-500'} py-2 px-3 md:px-8 text-lg font-semibold cursor-pointer`}>Account</p>
        <p onClick={() => toggleSel(1)} className={`${currentSel == 1 ? 'border-b-2 border-slate-600 text-gray-800' : 'text-gray-500'} py-2 px-3 md:px-8 text-lg font-semibold cursor-pointer`}>Notifications</p>
        <p onClick={() => toggleSel(2)} className={`${currentSel == 2 ? 'border-b-2 border-slate-600 text-gray-800' : 'text-gray-500'} py-2 px-3 md:px-8 text-lg font-semibold cursor-pointer`}>Settings</p>
      </div>
      {currentSel == 0 && <Account />}
      {currentSel == 1 && <Notifications />}
      {currentSel == 2 && <Settings />}
    </div>
  )
}