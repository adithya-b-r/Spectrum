import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { userApi } from "../../services/api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePassModal = ({ isOpen, onClose }: ModalProps) => {
  const { user } = useAuth();
  const [errMsg, setErrMsg] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isError, setIsError] = useState(false);
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [changePass, setChangePass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hasTyped, setHasTyped] = useState(false);

  useEffect(() => {
    if (!hasTyped) return;

    if (newPassword.length === 0) {
      setErrMsg("Password field can't be empty.");
      setIsError(true);
      setChangePass(false);
    } else if (newPassword.length < 8) {
      setErrMsg("Password must be at least 8 characters long.");
      setIsError(true);
      setChangePass(false);
    } else if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
      setErrMsg("Passwords don't match.");
      setIsError(true);
      setChangePass(false);
    } else if (newPassword === confirmPassword) {
      setErrMsg("");
      setIsError(false);
      setChangePass(true);
    } else {
      setErrMsg("");
      setIsError(false);
      setChangePass(false);
    }
  }, [newPassword, confirmPassword, hasTyped]);

  const toggleOldPassVisibility = () => {
    setIsOldPasswordVisible((prev) => !prev);
  };

  const toggleNewPassVisibility = () => {
    setIsNewPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPassVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev);
  };

  async function displayStatus() {
    if (!user?._id) {
      toast.error("Please sign in to change your password.");
      return;
    }
    if (!oldPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await userApi.updatePassword(user._id, { oldPassword, newPassword });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setHasTyped(false);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <div onClick={onClose} className={`${!isOpen ? 'hidden' : ''} fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-black/40 backdrop-blur-xs p-4`}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full relative border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition absolute right-4 top-4 cursor-pointer">
          <i className="bx bx-x text-2xl"></i>
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Change Password</h2>

        <div className="flex flex-col gap-4">
          {/* Old Password */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1.5">Old Password</label>
            <div className="relative flex items-center">
              <input
                id="old-pass"
                type={isOldPasswordVisible ? "text" : "password"}
                onChange={(e) => { setOldPassword(e.target.value); setHasTyped(true); }}
                value={oldPassword}
                placeholder="Enter current password"
                className="w-full text-base font-medium bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none py-2.5 pl-4 pr-10 rounded-xl transition"
              />
              <button
                type="button"
                onClick={toggleOldPassVisibility}
                className="absolute right-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer p-1"
              >
                <i className={`bx ${isOldPasswordVisible ? 'bxs-show' : 'bxs-hide'} text-xl`}></i>
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1.5">New Password</label>
            <div className="relative flex items-center">
              <input
                id="new-pass"
                type={isNewPasswordVisible ? "text" : "password"}
                onChange={(e) => { setNewPassword(e.target.value); setHasTyped(true); }}
                value={newPassword}
                placeholder="Enter new password"
                className="w-full text-base font-medium bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none py-2.5 pl-4 pr-10 rounded-xl transition"
              />
              <button
                type="button"
                onClick={toggleNewPassVisibility}
                className="absolute right-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer p-1"
              >
                <i className={`bx ${isNewPasswordVisible ? 'bxs-show' : 'bxs-hide'} text-xl`}></i>
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1.5">Confirm New Password</label>
            <div className="relative flex items-center">
              <input
                id="confirm-pass"
                type={isConfirmPasswordVisible ? "text" : "password"}
                onChange={(e) => { setConfirmPassword(e.target.value); setHasTyped(true); }}
                value={confirmPassword}
                placeholder="Confirm new password"
                className="w-full text-base font-medium bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none py-2.5 pl-4 pr-10 rounded-xl transition"
              />
              <button
                type="button"
                onClick={toggleConfirmPassVisibility}
                className="absolute right-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer p-1"
              >
                <i className={`bx ${isConfirmPasswordVisible ? 'bxs-show' : 'bxs-hide'} text-xl`}></i>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-gray-400 dark:text-slate-500 text-xs mt-2 mb-6">
          <p className={`${isError ? 'text-rose-500 font-medium' : ''}`}>{errMsg}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 transition cursor-pointer">Cancel</button>
          <button
            onClick={displayStatus}
            className={`px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold text-white transition shadow-xs cursor-pointer ${changePass && !isSubmitting ? '' : 'opacity-40 cursor-not-allowed'}`}
            disabled={!changePass || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
};