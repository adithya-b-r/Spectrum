import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailModal = ({ isOpen, onClose }: ModalProps) => {
  const { user } = useAuth();
  const [errMsg, setErrMsg] = useState("spectrum.com/@");
  const [email, setEmail] = useState(user?.email || "");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (email.length > 0) {
      let isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
      if (!isValid) {
        setErrMsg("Please enter a valid email.");
        setIsError(true);
      } else {
        setErrMsg("You can sign into Spectrum with this email address.");
        setIsError(false);
      }
    } else {
      setErrMsg("Email can't be empty.");
      setIsError(true);
    }
  }, [email]);

  function displayStatus() {
    toast.success("Updated Email Address");
    onClose();
  }


  return (
    <div onClick={onClose} className={`${!isOpen ? 'hidden' : ''} fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-black/40 backdrop-blur-xs p-4`}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full relative border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition absolute right-4 top-4 cursor-pointer">
          <i className="bx bx-x text-2xl"></i>
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Update Email Address</h2>

        <div className="relative mb-2">
          <i className="bx bx-envelope absolute left-3.5 top-3 text-lg text-gray-400 dark:text-slate-500"></i>
          <input
            id="email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Enter new email"
            className="w-full text-base font-medium bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none py-2.5 pl-10 pr-4 rounded-xl transition"
          />
        </div>

        <div className="flex justify-between text-gray-400 dark:text-slate-500 text-xs mb-6">
          <p className={`${isError ? 'text-rose-500 font-medium' : ''}`}>{errMsg}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 transition cursor-pointer">Cancel</button>
          <button onClick={displayStatus} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold text-white transition shadow-xs cursor-pointer">Save</button>
        </div>
      </div>
    </div>
  );
};
