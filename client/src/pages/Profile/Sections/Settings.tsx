import { useState } from "react";
import { DeleteAccountModal } from "../../../components/Modals/DeleteAccountModal";

export const Settings = () => {
  const [settingsModalState, setSettingsModalState] = useState(-1)

  const toggleSettingsModalState = (index: number) => {
    setSettingsModalState(index);
  }
  
  return (
    <div className="flex-col h-fit w-full p-4 overflow-scroll">
      {settingsModalState == 1 && (<DeleteAccountModal isOpen={true} onClose={() => toggleSettingsModalState(-1)} />)}

      <div className="flex flex-col sm:flex-row justify-between py-4">
        <p className="text-lg font-semibold text-gray-800">Profile Visibility</p>
        <select className="py-3 px-3 mt-2 sm:mt-0 rounded-md font-semibold bg-gray-100 cursor-pointer outline-none">
          <option value="public">Public</option>
          <option value="followers">Followers Only</option>
          <option value="private">Private</option>
        </select>
      </div>
      <div className="flex flex-col sm:flex-row justify-between py-4">
        <p className="text-lg font-semibold text-gray-800">Color Mode</p>
        <select className="py-3 px-3 mt-2 sm:mt-0 rounded-md font-semibold bg-gray-100 cursor-pointer outline-none">
          <option value="light">Light Mode</option>
          <option value="dark">Dark Mode</option>
          <option value="system">System Default</option>
        </select>
      </div>
      <div className="flex flex-col sm:flex-row justify-between py-4">
        <p className="text-lg font-semibold text-gray-800">Download Data</p>
        <button className="py-2 px-3 mt-2 sm:mt-0 rounded-md font-semibold bg-blue-500 hover:bg-blue-600 text-white cursor-pointer">
          Download My Data
        </button>
      </div>
      <div className="flex flex-col sm:flex-row justify-between py-4">
        <p className="text-lg font-semibold text-gray-800">Delete Account</p>
        <button onClick={() => toggleSettingsModalState(1)} className="py-2 px-3 mt-2 sm:mt-0 rounded-md font-semibold bg-red-500 hover:bg-red-600 text-white cursor-pointer">
          Delete Permanently
        </button>
      </div>
    </div>
  );
}
