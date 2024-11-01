
export const Account = () => {
  return (
      <div className="flex-col h-fit w-full p-4 overflow-scroll">
        <div className="flex justify-between py-4 cursor-pointer">
          <p className="text-lg font-semibold text-gray-800">Name</p>
          <span className="hover:text-gray-600">Nobita Nobi</span>
        </div>
        <div className="flex justify-between py-4 cursor-pointer">
          <p className="text-lg font-semibold text-gray-800">Username</p>
          <span className="hover:text-gray-600">@nobita_nobi</span>
        </div>
        <div className="flex flex-wrap justify-between py-4 cursor-pointer">
          <p className="text-lg font-semibold text-gray-800">Email</p>
          <span className="hover:text-gray-600">nobitanobi@gmail.com</span>
        </div>
        <div className="flex-col  py-4 cursor-pointer">
          <p className="text-lg font-semibold text-gray-800">About</p>
          <span className="hover:text-gray-600">Hello, I'm Nobita dedicated, creative individual, committed to supporting my friends with loyalty and care.</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between py-4">
          <p className="text-lg font-semibold text-gray-800">Change Password</p>
          <button className="py-2 px-3 mt-2 sm:mt-0 rounded-md font-semibold bg-blue-500 text-white cursor-pointer">
            New Password
          </button>
        </div>
      </div>
  )
}