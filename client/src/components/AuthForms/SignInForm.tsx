import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

interface SignInFormProps {
  onClose: () => void;
  onSwitch: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onClose, onSwitch }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("The password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    const result = await register({
      fullName,
      email,
      password,
      confirmPassword,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success("Account created successfully!");
      onClose();
    } else {
      toast.error(result.message || "Something went wrong. Please try again.");
    }
  };


  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 select-none"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <i className="bx bx-x text-2xl"></i>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Create an account</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 mb-4">
          Join Spectrum to read, write, and connect
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative flex items-center">
              <i className="bx bx-user absolute left-3.5 text-gray-400 dark:text-slate-500 text-lg pointer-events-none"></i>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full text-sm text-gray-800 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none transition duration-150 placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
              Email address
            </label>
            <div className="relative flex items-center">
              <i className="bx bx-envelope absolute left-3.5 text-gray-400 dark:text-slate-500 text-lg pointer-events-none"></i>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-sm text-gray-800 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none transition duration-150 placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <i className="bx bx-lock-alt absolute left-3.5 text-gray-400 dark:text-slate-500 text-lg pointer-events-none"></i>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full text-sm text-gray-800 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none transition duration-150 placeholder-gray-400 dark:placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition cursor-pointer p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bx ${showPassword ? "bx-hide" : "bx-show"} text-lg`}></i>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <i className="bx bx-check-shield absolute left-3.5 text-gray-400 dark:text-slate-500 text-lg pointer-events-none"></i>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full text-sm text-gray-800 dark:text-slate-100 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 outline-none transition duration-150 placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition duration-150 shadow-xs hover:shadow cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <i className="bx bx-loader-alt animate-spin text-lg"></i>
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="relative my-3.5 flex items-center justify-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          <span className="bg-white dark:bg-slate-900 px-3 text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider absolute">
            or
          </span>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 text-gray-700 dark:text-slate-200 text-sm font-semibold transition duration-150 cursor-pointer shadow-2xs"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 256 262"
          >
            <path
              fill="#4285F4"
              d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
            ></path>
            <path
              fill="#34A853"
              d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
            ></path>
            <path
              fill="#FBBC05"
              d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
            ></path>
            <path
              fill="#EB4335"
              d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
            ></path>
          </svg>
          <span>Sign up with Google</span>
        </button>

        <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

