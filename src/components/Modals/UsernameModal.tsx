import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsernameModal = ({ isOpen, onClose }: ModalProps) => {
  const [errMsg, setErrMsg] = useState("spectrum.com/@");
  const [countChar, setCountChar] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    setCountChar(username.length)
    if (username.length >= 0) {
      if (/^[a-zA-Z0-9._]+$/.test(username)) {
        setErrMsg("spectrum.com/@" + username)
      } else {
        setErrMsg('username may contain only letters, numbers, ".", and "_".')
      }
    }
  })

  return (
    <div onClick={onClose} className={`${!isOpen ? 'hidden' : ''} fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50`}>

      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-lg p-6 w-2/4 relative">
        <i className="bx bx-x text-4xl text-gray-600 m-1 cursor-pointer absolute right-0 top-0"></i>

        <h2 className="text-xl font-semibold text-gray-800 mb-8 text-center">Username</h2>

        <div className="relative hidden md:flex items-center justify-center">
          <i className='bx bx-at absolute left-2 mt-1 text-xl text-gray-500'></i>
          <input id="username" type="text" onChange={(e) => setUsername(e.target.value)} value={username} placeholder="Enter new username" className="w-full text-lg border border-black outline-none py-2 pl-8 rounded-md mb-0" />
        </div>

        <div className="flex justify-between text-gray-500">
          <p>{errMsg}</p>
          <p><span>{countChar}</span>/30</p>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-white border-2 border-green-500 rounded-full text-green-700">Cancel</button>
          <button className="px-5 py-2 bg-green-500 transition-colors border-2 border-green-500 rounded-full text-white hover:bg-green-600">Save</button>
        </div>
      </div>

    </div>
  );
};
