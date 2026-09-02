import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userApi } from "../../services/api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal = ({ isOpen, onClose }: ModalProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const togglePassVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleClose = () => {
    setPassword("");
    setErrMsg("");
    setIsPasswordVisible(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!password) {
      setErrMsg("Please enter your password to confirm.");
      return;
    }

    const userId = user?._id ?? user?.id;
    if (!userId) {
      toast.error("User not found.");
      return;
    }

    try {
      setIsDeleting(true);
      setErrMsg("");
      await userApi.deleteAccount(userId, password);
      toast.success("Your account has been deleted.");
      handleClose();
      await logout();
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete account.";
      setErrMsg(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 sm:p-7 max-w-md w-full relative border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition absolute right-4 top-4 cursor-pointer"
        >
          <i className="bx bx-x text-xl"></i>
        </button>

        <div className="flex items-start gap-3.5 mb-5 pr-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
            <i className="bx bx-trash"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Account</h2>
            <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Deleting your account will permanently remove your profile, published stories, and all personal data. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-bold text-gray-700 dark:text-slate-200 block mb-1.5">Confirm with Password</label>
          <div className="relative flex items-center">
            <i className="bx bx-lock-alt absolute left-3.5 text-gray-400 dark:text-slate-500 text-base pointer-events-none"></i>
            <input
              type={isPasswordVisible ? "text" : "password"}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrMsg("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDelete();
              }}
              value={password}
              placeholder="Enter your password"
              className="w-full text-sm font-medium border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none py-2.5 pl-10 pr-10 rounded-xl transition text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={togglePassVisibility}
              className="absolute right-2.5 w-7 h-7 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg transition cursor-pointer"
            >
              <i className={`bx ${isPasswordVisible ? "bx-show" : "bx-hide"} text-lg`}></i>
            </button>
          </div>
          {errMsg && (
            <p className="flex items-center gap-1.5 text-rose-600 text-xs font-medium mt-2">
              <i className="bx bx-error-circle text-sm"></i>
              <span>{errMsg}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full py-2.5 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 active:bg-gray-300 text-gray-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
              isDeleting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? (
              <>
                <i className="bx bx-loader-alt animate-spin text-base"></i>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Account</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

