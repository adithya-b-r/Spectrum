import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NameModal = ({ isOpen, onClose }: ModalProps) => {
  const [errMsg, setErrMsg] = useState("");
  const [countChar, setCountChar] = useState(0);
  const [name, setName] = useState("nobita nobi");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setCountChar(name.length)
    if (name.length > 0) {
      let isValid = /^[a-zA-Z_ ]+$/.test(name)
      if (!isValid) {
        setErrMsg('Username may contain only letters, numbers, ".", and "_".')
        setIsError(true)
      } else {
        setErrMsg("spectrum.com/@" + name)
        setIsError(false);
      }
    } else {
      setErrMsg("Username can't be empty.")
      setIsError(true)
    }
  })

  return (
    <div onClick={onClose} className={`${!isOpen ? 'hidden' : ''} fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50`}>

      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl p-6 md:w-2/4 w-full md:mx-0 mx-4 relative">
        <i onClick={onClose} className="bx bx-x text-4xl text-gray-600 m-1 cursor-pointer absolute right-0 top-0"></i>

        <h2 className="text-xl font-semibold text-gray-800 mb-8 text-center">Name</h2>

        <div className="relative md:flex items-center justify-center">
          <i className='bx bx-at absolute left-3 md:top-0 top-2 md:mt-1 text-xl text-gray-500'></i>
          <input id="name" type="text" onChange={(e) => setName(e.target.value)} value={name} placeholder="Enter new name" className="w-full text-lg border border-black outline-none py-2 pl-8 rounded-md mb-1" />
        </div>

        <div className="flex justify-between text-gray-500 text-sm">
          <p className={`${isError ? 'text-rose-600' : ''}`}>{errMsg}</p>
          <p><span className={`${name.length > 30 ? 'text-rose-600' : ''}`}>{countChar}</span>/30</p>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-white border-2 border-green-500 rounded-full text-green-700">Cancel</button>
          <button className="px-5 py-2 bg-green-500 transition-colors border-2 border-green-500 rounded-full text-white hover:bg-green-600">Save</button>
        </div>
      </div>

    </div>
  );
};
