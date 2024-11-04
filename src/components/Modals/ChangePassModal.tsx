import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePassModal = ({ isOpen, onClose }: ModalProps) => {
  const [errMsg, setErrMsg] = useState("");
  const [oldPassword, setOldPassword] = useState("nobitaNobi@7834");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isError, setIsError] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);

  const [changePass, setChangePass] = useState(false);

  const [hasTyped, setHasTyped] = useState(false);

  useEffect(() => {
    if (!hasTyped) return;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (newPassword.length === 0) {
      setErrMsg("Password field can't be empty.");
      setIsError(true);
      setChangePass(false);
    } else if (!passwordPattern.test(newPassword)) {
      setErrMsg("Password must be at least 8 characters long and include an uppercase and lowercase letter, a number, and a symbol.");
      setIsError(true);
      setChangePass(false);
    } else if (newPassword !== confirmPassword) {
      setErrMsg("Passwords don't match.");
      setIsError(true);
      setChangePass(false);
    } else {
      setErrMsg("");
      setIsError(false);
      setChangePass(true);
    }
  }, [newPassword, confirmPassword])

  const togglePassVisibility = () => {
    setIsPasswordVisible((prev) => !prev)
  }

  const toggleNewPassVisibility = () => {
    setIsNewPasswordVisible((prev) => !prev)
  }

  function displayStatus() {
    toast.success("Updated Password");
    onClose();
  }

  return (
    <div onClick={onClose} className={`${!isOpen ? 'hidden' : ''} fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50`}>

      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl p-6 md:w-2/4 w-full md:mx-0 mx-4 relative">
        <i onClick={onClose} className="bx bx-x text-4xl text-gray-600 m-1 cursor-pointer absolute right-0 top-0"></i>

        <h2 className="text-xl font-semibold text-gray-800 mb-8 text-center">Change Password</h2>

        <div className="flex justify-between text-gray-800 text-sm mb-1">
          <p className="text-lg font-semibold">Old Password</p>
        </div>
        <div className="relative md:flex items-center justify-center mb-4">
          <i onClick={togglePassVisibility} className={`bx ${isPasswordVisible ? 'bxs-show' : 'bxs-hide'} absolute right-3 md:top-0 top-2 md:mt-2 text-2xl text-gray-500 cursor-pointer`}></i>
          <input id="name" type={isPasswordVisible ? "text" : "password"} onChange={(e) => { setOldPassword(e.target.value); setHasTyped(true) }} value={oldPassword} placeholder="Old Password" className="w-full text-lg border border-black outline-none py-2 px-3 rounded-md mb-1" />
        </div>

        <div className="flex justify-between text-gray-800 text-sm mb-1">
          <p className="text-lg font-semibold">New Password</p>
        </div>
        <div className="relative md:flex items-center justify-center mb-4">
          {/* <i onClick={togglePassVisibility} className={`bx ${isPasswordVisible ? 'bxs-show' : 'bxs-hide'} absolute right-3 md:top-0 top-2 md:mt-2 text-2xl text-gray-500 cursor-pointer`}></i> */}
          <input id="name" type={isNewPasswordVisible ? "text" : "password"} onChange={(e) => { setNewPassword(e.target.value); setHasTyped(true) }} value={newPassword} placeholder="New password" className="w-full text-lg border border-black outline-none py-2 px-3 rounded-md mb-1" />
        </div>

        <div className="flex justify-between text-gray-800 text-sm mb-1">
          <p className="text-lg font-semibold">Confirm Password</p>
        </div>
        <div className="relative md:flex items-center justify-center">
          {/* <i onClick={togglePassVisibility} className={`bx ${isPasswordVisible ? 'bxs-show' : 'bxs-hide'} absolute right-3 md:top-0 top-2 md:mt-2 text-2xl text-gray-500 cursor-pointer`}></i> */}
          <input id="name" type={isNewPasswordVisible ? "text" : "password"} onChange={(e) => { setConfirmPassword(e.target.value); setHasTyped(true) }} value={confirmPassword} placeholder="Confirm password" className="w-full text-lg border border-black outline-none py-2 px-3 rounded-md mb-1" />
        </div>

        <div className="flex justify-between text-gray-500 text-sm">
          <p className={`${isError ? 'text-rose-600' : ''}`}>{errMsg}</p>
        </div>

        <div className="flex gap-2 items-center my-4">
          <input type="checkbox" className="size-5" onChange={toggleNewPassVisibility} />
          <p>Show Password</p>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-white border-2 border-blue-500 rounded-full text-blue-700">Cancel</button>
          <button onClick={displayStatus} className={`px-5 py-2 bg-blue-500 transition-colors border-2 border-blue-500 rounded-full text-white hover:bg-blue-600 ${changePass ? '' : 'opacity-50'}`} disabled={!changePass}>Change Password</button>
        </div>
      </div>

    </div>
  );
};