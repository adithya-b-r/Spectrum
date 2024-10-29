export const Navbar = () => {
  return (
    <nav className="font-serif border-b-2  border-b-gray-200">
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center text-2xl font-bold">
          <img src="/logo2.png" className="hidden md:flex w-12 h-12 rounded-full mr-2 cursor-pointer" />
          <h1 className='tracking-wider text-3xl text-center hover:scale-105 transition-transform duration-1000 cursor-pointer'>Spectrum</h1>

          <div className="relative hidden md:flex ml-4 items-center justify-center">
            <i className='bx bx-search absolute left-5 text-xl text-gray-500'></i>
            <input type="text" placeholder='Search' className='font-sans font-normal text-gray-500 outline-none ml-2 py-2 pl-10 rounded-full border-none text-lg bg-slate-100' />
          </div>
        </div>

        <div className="flex items-center text-3xl justify-center gap-4 sm:gap-8 md:gap-10">
          <i className="bx bx-edit font-thin cursor-pointer"></i>
          <i className="bx bx-bell cursor-pointer"></i>
          <img src="/profile.jpg" className="w-10 h-10 rounded-full cursor-pointer" />
        </div>
      </div>
    </nav>
  );
}