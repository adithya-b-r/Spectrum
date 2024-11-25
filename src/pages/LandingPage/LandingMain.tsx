export const LandingMain = () => {
  return (
    <div className="w-full h-[calc(100vh-5rem)] flex justify-between p-12 select-none">
      <div className="w-1/2 -mt-5 h-full flex flex-col justify-around items-start">
        <h1 className="text-8xl font-semibold leading-tight">A <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-blue-500">Spectrum</span> of Ideas</h1>
        <p className="text-2xl font-bold italic capitalize">A place to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-blue-500">read</span>, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-blue-500">learn</span>, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-blue-500">discover</span> tech ideas</p>
        <button className="bg-black rounded-full text-xl px-6 py-3 text-white font-semibold tracking-wider hover:scale-105 duration-500 transition-all">Start Exploring</button>
      </div> 
      <div className="w-1/2">
        <img className="w-full -mt-2 h-full rounded-xl shadow-lg cursor-pointer hover:scale-105 duration-500 transition-all" src="/spectrum_bg.jpeg"/>
      </div>
    </div>
  )
}