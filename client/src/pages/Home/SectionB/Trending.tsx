export const Trending = () => {
  return (
    <div>
      <h1 className="text-2xl text-gray-800 font-bold tracking-wide inline-flex items-center justify-center gap-1">Trending <img src="fire.png" className="size-7" alt="Trending" /></h1>
      
      <div className="my-8 shadow-md p-2 rounded-md">
        <div className=" head flex items-center gap-2 mb-4">
          <img src="profile2.jpg" alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
          <p className="font-bold text-sm text-gray-700 cursor-pointer">Adithya</p>
          <img src="open.png" alt="" className="size-6 ml-auto cursor-pointer hover:scale-105 duration-200 transition-all"/>
        </div>
        <div className="body">
          <h3 className="text-sm font-bold text-gray-600">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta, officiis!</h3>
        </div>
      </div>

      <div className="my-8 shadow-md p-2 rounded-md">
        <div className=" head flex items-center gap-2 mb-4">
          <img src="profile2.jpg" alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
          <p className="font-bold text-sm text-gray-700 cursor-pointer">Adithya</p>
          <img src="open.png" alt="" className="size-6 ml-auto cursor-pointer hover:scale-105 duration-200 transition-all"/>
        </div>
        <div className="body">
          <h3 className="font-semibold text-gray-800">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam rem asperiores enim, nemo voluptas illum.</h3>
        </div>
      </div>

      <div className="my-8 shadow-md p-2 rounded-md">
        <div className=" head flex items-center gap-2 mb-4">
          <img src="profile2.jpg" alt="User" className="w-10 h-10 rounded-full cursor-pointer" />
          <p className="font-bold text-sm text-gray-700 cursor-pointer">Adithya</p>
          <img src="open.png" alt="" className="size-6 ml-auto cursor-pointer hover:scale-105 duration-200 transition-all"/>
        </div>
        <div className="body">
          <h3 className="font-semibold text-gray-800">Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem, eligendi.</h3>
        </div>
      </div>
    </div>
  )
}