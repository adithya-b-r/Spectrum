export const Notifications = () => {
  return (
    <div className="flex-col h-3/4 w-full p-4 overflow-scroll">
      <div className="my-8 md:p-5 shadow-md p-2 rounded-md shadow-slate-100 border-2 border-slate-200 hover:bg-gray-100 cursor-pointer">
        <div className=" head flex items-center gap-2 mb-4">
          <img src="profile2.jpg" alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
          <p className="font-semibold text-sm text-gray-700 cursor-pointer">Adithya</p>
          <img src="open.png" alt="" className="size-6 ml-auto cursor-pointer hover:scale-105 duration-200 transition-all" />
        </div>
        <div className="body">
          <h3 className="font-bold text-gray-800">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta, officiis!</h3>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <button className="bg-blue-500 py-2 px-4 text-white font-semibold rounded-lg hover:bg-blue-600">Load More</button>
      </div>
    </div>
  )
}