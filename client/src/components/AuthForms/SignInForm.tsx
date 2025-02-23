import axios from "axios";
import { useState } from "react";

interface SignInFormProps {
  onClose: () => void;
  onSwitch: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onClose, onSwitch }) => {
  const [isDisplay, setIsDisplay] = useState(true);
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const closeModal = () => {
    setIsDisplay(false);
    onClose();
  };

  const switchModal = () => {
    closeModal;
    onSwitch();
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      alert("The password must be at least 8 characters long.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/users/register', {
        fullname,
        email,
        password,
        confirmPassword
      });

      const token = response.data.token;

      if (token) {
        console.log(token);
      }

      console.log(response.status)

      alert('Sign-in Successfull: ' + response.data);
    } catch (err: any) {
      if (err.response) {
        alert(`Sign-in Failed: ${err.response.data.message || 'Unknown error from server.'}`);
      } else if (err.request) {
        alert('Unable to reach the server. Please try again later.');
      } else {
        alert(`Sign-in Failed: ${err.message}`);
      }
    } finally {
      closeModal;
    }
  }

  return (
    isDisplay && (
      <div onClick={closeModal} className="fixed py-10 inset-0 z-50 flex items-center justify-center w-full h-screen bg-gray-600 bg-opacity-50">
        <div onClick={(e) => e.stopPropagation()} className="relative bg-white w-10/12 md:w-1/3 h-fit rounded-lg flex flex-col items-center justify-center p-4 py-6 md:py-8">
          <i onClick={closeModal} className="bx bx-x text-4xl absolute cursor-pointer text-gray-600 m-2 top-0 right-0"></i>

          <h3 className="font-semibold text-3xl tracking-wider md:mb-8 mb-6">Sign Up</h3>

          <form onSubmit={handleFormSubmit} method="post">

            <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Fullname" className="w-full text-lg border border-gray-300 outline-none py-2 px-3 rounded-md mb-2 focus:bg-slate-50" required />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full text-lg border border-gray-300 outline-none py-2 px-3 rounded-md mb-2 focus:bg-slate-50" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full text-lg border border-gray-300 outline-none py-2 px-3 rounded-md mb-2 focus:bg-slate-50" required />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full text-lg border border-gray-300 outline-none py-2 px-3 rounded-md mb-2 focus:bg-slate-50" required />

            <input type="submit" value={"Sign Up"} placeholder="Confirm password" className="tracking-wider bg-blue-600 hover:bg-blue-700 duration-200 w-full text-lg text-white cursor-pointer border border-gray-300 outline-none py-2 px-3 rounded-md mt-4" />
            <p className="text-gray-600 w-full text-center mt-1 mb-4 cursor-default">Already have an account? <span className="text-blue-600 cursor-pointer" onClick={switchModal}>Login</span></p>
          </form>

          <div className="w-full flex items-center justify-center space-x-4">
            <div style={{ height: "1px" }} className="w-1/2 bg-slate-200"></div>
            <div className="flex items-center justify-center text-slate-500">Or</div>
            <div style={{ height: "1px" }} className="w-1/2 bg-slate-200"></div>
          </div>

          <div className="w-full border border-gray-300 flex items-center mt-4 rounded-md">
            <svg className="w-1/12 bx bxl-google text-2xl ml-3 h-6" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" id="google">
              <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
              <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
              <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path>
              <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
            </svg>
            <input type="submit" value={"Login with Google"} placeholder="Confirm password" className="bg-white w-11/12 text-lg text-gray-600 cursor-pointer outline-none py-2 px-3 rounded-md" />
          </div>
        </div>
      </div>
    )
  )
}

