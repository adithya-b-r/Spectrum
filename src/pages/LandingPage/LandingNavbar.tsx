export const LandingNavbar = () => {
  return (
    <nav className="font-serif border-b-2 fixed w-full h-16 md:h-20 top-0 z-40 bg-white border-b-gray-200">
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center text-2xl font-bold">
          <img src="/logo2.png"  className="md:flex md:size-14 h-10 w-10 rounded-full mr-2 cursor-pointer" />
          <h1 className='tracking-wider text-2xl md:text-3xl text-center hover:scale-105 transition-transform duration-1000 cursor-pointer'>Spectrum</h1>
        </div>

        <div className="flex items-center text-2xl md:text-3xl justify-center gap-4 sm:gap-8 md:gap-4 tracking-wider">
          <p style={{fontSize: "1rem"}} className="md:block hidden cursor-pointer font-semibold py-1 px-4 rounded-full hover:scale-110 duration-500 transition-transform">About Us</p>
          <p style={{fontSize: "1rem"}} className="md:block hidden cursor-pointer font-semibold py-1 px-4 rounded-full hover:scale-110 duration-500 transition-transform">Write</p>
          <p style={{fontSize: "1rem"}} className="md:block hidden cursor-pointer font-semibold py-1 px-4 rounded-full hover:scale-110 duration-500 transition-transform">Sign In</p>
          <p style={{fontSize: "1rem"}} className="cursor-pointer bg-black text-white py-1 px-4 rounded-full hover:scale-105 duration-500 transition-transform">Get Started</p>
        </div>
      </div>
    </nav>
  )
}