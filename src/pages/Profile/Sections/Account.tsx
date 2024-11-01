import { useState } from "react"
import { UsernameModal } from "../../../components/Modals/UsernameModal"
import { NameModal } from "../../../components/Modals/NameModal"
import { EmailModal } from "../../../components/Modals/EmailModal"
import { AboutModal } from "../../../components/Modals/AboutModal"
import { ChangePassModal } from "../../../components/Modals/ChangePassModal"

export const Account = () => {
  const [accountModalState, setAccountModalState] = useState(0)

  const toggleAccountModalState = (index: number) => {
    setAccountModalState(index);
  }

  return (
    <div className="flex-col h-fit w-full p-4 overflow-scroll">
      {accountModalState == 0 && (<NameModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />)}
      {accountModalState == 1 && (<UsernameModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />)}
      {accountModalState == 2 && (<EmailModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />)}
      {accountModalState == 3 && (<AboutModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />)}
      {accountModalState == 4 && (<ChangePassModal isOpen={true} onClose={() => toggleAccountModalState(-1)} />)}

      <div className="flex justify-between py-4 cursor-pointer" onClick={() => toggleAccountModalState(0)}>
        <p className="text-lg font-semibold text-gray-800">Name</p>
        <span className="hover:text-gray-600">Nobita Nobi</span>
      </div>
      <div className="flex justify-between py-4 cursor-pointer" onClick={() => toggleAccountModalState(1)}>
        <p className="text-lg font-semibold text-gray-800">Username</p>
        <span className="hover:text-gray-600">@nobita_nobi</span>
      </div>
      <div className="flex flex-wrap justify-between py-4 cursor-pointer" onClick={() => toggleAccountModalState(2)}>
        <p className="text-lg font-semibold text-gray-800">Email</p>
        <span className="hover:text-gray-600">nobitanobi@gmail.com</span>
      </div>
      <div className="flex-col py-4 cursor-pointer" onClick={() => toggleAccountModalState(3)}>
        <p className="text-lg font-semibold text-gray-800">About</p>
        <span className="hover:text-gray-600">Hello, I'm Nobita dedicated, creative individual, committed to supporting my friends with loyalty and care.</span>
      </div>
      <div className="flex flex-col sm:flex-row justify-between py-4">
        <p className="text-lg font-semibold text-gray-800">Change Password</p>
        <button onClick={() => toggleAccountModalState(4)} className="py-2 px-3 mt-2 sm:mt-0 rounded-md font-semibold bg-blue-500 text-white cursor-pointer">
          New Password
        </button>
      </div>
    </div>
  )
}