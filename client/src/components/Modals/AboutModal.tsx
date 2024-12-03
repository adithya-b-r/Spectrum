import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal = ({ isOpen, onClose }: ModalProps) => {
  const [errMsg, setErrMsg] = useState("");
  const [countChar, setCountChar] = useState(0);
  const [about, setAbout] = useState("nobita_nobi");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setCountChar(about.length)
    if (about.length > 150) {
      setErrMsg("About may only contain a maximum of 150 characters.");
      setIsError(true);
    }else{
      setErrMsg("");
      setIsError(false);
    }
  })

  function displayStatus() {
    toast.success("Updated About.");
    onClose();
  }

  return (
    <div onClick={onClose} className={`${!isOpen ? 'hidden' : ''} fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50`}>

      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl p-6 md:w-2/4 w-full md:mx-0 mx-4 relative">
        <i onClick={onClose} className="bx bx-x text-4xl text-gray-600 m-1 cursor-pointer absolute right-0 top-0"></i>

        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">About</h2>

        <div className="relative md:flex items-center justify-center">
          <textarea id="about" rows={3} onChange={(e) => setAbout(e.target.value)} value={about} placeholder="Enter new about" className="w-full resize-none text-lg border border-black outline-none py-2 px-3 rounded-md mb-1" />
        </div>

        <div className="flex justify-between text-gray-500 text-sm">
          <p className={`${isError ? 'text-rose-600' : ''}`}>{errMsg}</p>
          <p><span className={`${about.length > 150 ? 'text-rose-600' : ''}`}>{countChar}</span>/150</p>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-white border-2 border-blue-500 rounded-full text-blue-700">Cancel</button>
          <button disabled={isError} onClick={displayStatus} className={`px-5 py-2 bg-blue-500 transition-colors border-2 border-blue-500 rounded-full text-white hover:bg-blue-600 ${isError ? 'opacity-30' : ''}`}>Save</button>
        </div>
      </div>

    </div>
  );
};
