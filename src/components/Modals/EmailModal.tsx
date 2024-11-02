import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailModal = ({ isOpen, onClose }: ModalProps) => {
  const [errMsg, setErrMsg] = useState("spectrum.com/@");
  const [countChar, setCountChar] = useState(0);
  const [email, setEmail] = useState("nobitanobi74@gmail.com");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setCountChar(email.length)
    if (email.length > 0) {
      let isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
      if (!isValid) {
        setErrMsg("Please enter a valid email.")
        setIsError(true)
      } else {
        setErrMsg("You can sign into Spectrum with this email address.")
        setIsError(false);
      }
    } else {
      setErrMsg("Email can't be empty.")
      setIsError(true)
    }
  })

  return (
    <div onClick={onClose} className={`${!isOpen ? 'hidden' : ''} fixed inset-0 z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50`}>

      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl p-6 md:w-2/4 w-full md:mx-0 mx-4 relative">
        <i onClick={onClose} className="bx bx-x text-4xl text-gray-600 m-1 cursor-pointer absolute right-0 top-0"></i>

        <h2 className="text-xl font-semibold text-gray-800 mb-8 text-center">Email Address</h2>

        <div className="relative md:flex items-center justify-center">
          <input id="email" type="text" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Enter new email" className="w-full text-lg border border-black outline-none py-2 px-3 rounded-md mb-1" />
        </div>

        <div className="flex justify-between text-gray-500 text-sm">
          <p className={`${isError ? 'text-rose-600' : ''}`}>{errMsg}</p>
          {/* <p><span className={`${email.length > 30 ? 'text-rose-600' : ''}`}>{countChar}</span>/30</p> */}
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-white border-2 border-blue-500 rounded-full text-blue-700">Cancel</button>
          <button className="px-5 py-2 bg-blue-500 transition-colors border-2 border-blue-500 rounded-full text-white hover:bg-blue-600">Save</button>
        </div>
      </div>

    </div>
  );
};
