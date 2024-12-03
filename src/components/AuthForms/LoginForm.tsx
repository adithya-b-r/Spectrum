import { useState } from "react";

export const LoginForm = () => {
  const [isDisplay/*, setIsDisplay*/] = useState(!false);

  return (
    isDisplay && (
      <div className=" fixed py-10 inset-0 z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50">
        <div className="bg-white w-1/3 h-fit rounded-lg flex flex-col items-center justify-center px-4 py-10">

          <h3 className="font-semibold text-3xl tracking-wider mb-10">Login</h3>

          <input type="text" placeholder="Email" className="w-full text-lg border border-gray-300 outline-none py-2 px-3 rounded-md mb-2" />
          <input type="password" placeholder="Password" className="w-full text-lg border border-gray-300 outline-none py-2 px-3 rounded-md mb-2" />
          <p className="text-blue-600 mt-1 mb-2 cursor-pointer inline-flex justify-end w-full">Forgot Password?</p>

          <input type="submit" value={"Login"} placeholder="Confirm password" className="tracking-wider bg-blue-600 hover:bg-blue-700 duration-200 w-full text-lg text-white cursor-pointer border border-gray-300 outline-none py-2 px-3 rounded-md mt-4" />
          <p className="text-gray-600 mt-1 mb-4 cursor-default">Don't have an account? <span className="text-blue-600 cursor-pointer">Signup</span></p>

          <div className="w-full flex items-center justify-center space-x-4">
            <div style={{ height: "1px" }} className="w-1/2 bg-slate-200"></div>
            <div className="flex items-center justify-center text-slate-500">Or</div>
            <div style={{ height: "1px" }} className="w-1/2 bg-slate-200"></div>
          </div>

          <div className="hover:bg-slate-100 duration-200 w-full border border-gray-300 flex items-center mt-4 rounded-md">
            <svg className="w-1/12 bx bxl-google text-2xl ml-3 h-6" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" id="google">
              <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
              <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
              <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path>
              <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
            </svg>
            <input type="submit" value={"Login with Google"} placeholder="Confirm password" className="bg-transparent w-11/12 text-lg text-gray-600 cursor-pointer outline-none py-2 px-3 rounded-md" />
          </div>
        </div>
      </div>
    )
  )
}

