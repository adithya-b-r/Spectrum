import { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal = ({ isOpen, onClose }: ModalProps) => {
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePassVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleDelete = () => {
    if (!password) {
      setErrMsg("Password field can't be empty.");
      return;
    }
  };

  return (
    <div onClick={onClose} className={`${!isOpen ? 'hidden' : ''} fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50`}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl p-6 md:w-2/4 w-full md:mx-0 mx-4 relative">
        <i onClick={onClose} className="bx bx-x text-4xl text-gray-600 m-1 cursor-pointer absolute right-0 top-0"></i>

        <h2 className="text-xl font-semibold text-gray-800 mb-8 text-center">Delete Your Account</h2>

        <p className="text-gray-700 mb-6">We're sorry to see you go. Deleting your Spectrum account will
          permanently remove your profile, posts, and all associated content.
          This action cannot be undone.
        </p>

        <p className="text-gray-700 mb-6">To confirm deletion, enter your password:</p>

        <div className="relative mb-4">
          <i onClick={togglePassVisibility} className={`bx ${isPasswordVisible ? 'bxs-show' : 'bxs-hide'} absolute right-3 top-2 text-2xl text-gray-500 cursor-pointer`}></i>
          <input type={isPasswordVisible ? "text" : "password"} onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Enter your password" className="w-full text-lg border border-black outline-none py-2 px-3 rounded-md mb-1" />
        </div>

        {errMsg && <p className="text-rose-600 mb-4">{errMsg}</p>}

        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-white border-2 border-blue-500 rounded-full text-blue-700">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2 bg-rose-500 transition-colors border-2 border-rose-500 rounded-full text-white hover:bg-rose-600">Confirm Delete</button>
        </div>
      </div>
    </div>
  );
};
