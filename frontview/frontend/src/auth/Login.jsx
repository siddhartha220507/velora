import  { useState } from "react";
import { Link, useNavigate } from "react-router";
import loginImg from "../assets/login.png";
import { login, githubAuthUrl } from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        // User login theek se ho gaya! Redirecting to dashboard or main
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* h-screen + overflow-hidden prevents global page scrolling */
    <div className="h-screen overflow-hidden bg-[#050505] text-[#d1d1d1] font-['Minecraftia',monospace] flex flex-col lg:flex-row">
      {/* LEFT SIDE: Image only */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#050505]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${loginImg})`,
          }}
        ></div>

        {/* Secure Badge */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#0a0a0a]/90 backdrop-blur-sm border border-white/5 p-4 pr-12 rounded-2xl flex items-center gap-4 w-fit whitespace-nowrap">
          <div className="text-[#558760]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div className="flex flex-col">
            <p className="text-[12px] text-gray-200">Secure. Encrypted. Reliable.</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Built for developers, by developers.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center p-4 md:p-8 relative bg-[#0a0a0a]">
        {/* Mobile Background Hint */}
        <div
          className="lg:hidden absolute inset-0 z-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginImg})` }}
        ></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#0f0f0f] border border-white/5 p-8 md:p-10 shadow-2xl rounded-[24px]">
            <header className="text-center mb-8">
              <h2 className="text-2xl font-normal text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-400 text-xs">
                Login to your Velora account
              </p>
            </header>

            {/* Social Login */}
            <button
              type="button"
              onClick={() => {
                window.location.href = githubAuthUrl;
              }}
              className="w-full bg-[#e5deb8] hover:bg-[#d4cd9e] text-black py-3 rounded-xl flex items-center justify-center gap-3 font-medium transition-all mb-8"
            >
              <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              <span className="text-sm">Continue with GitHub</span>
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-[1px] bg-white/5"></div>
              <span className="text-xs text-[#3d5c43]">or</span>
              <div className="flex-1 h-[1px] bg-white/5"></div>
            </div>

            {error ? (
              <p className="text-red-400 text-xs text-center mb-4" role="alert">
                {error}
              </p>
            ) : null}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#558760]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border border-white/10 rounded-xl p-3 pl-11 text-sm focus:outline-none focus:border-[#558760] transition-colors placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#558760]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent border border-white/10 rounded-xl p-3 pl-11 pr-11 text-sm focus:outline-none focus:border-[#558760] transition-colors placeholder:text-gray-600"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </span>
                </div>
                <div className="text-right mt-3">
                  <a
                    href="#"
                    className="text-[11px] text-[#558760] hover:text-[#76b583] transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4a7051] hover:bg-[#3d5c43] disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-normal transition-all mt-6"
              >
                {loading ? "Logging in…" : "Login"}
              </button>
            </form>

            <footer className="mt-8 text-center">
              <p className="text-[11px] text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#558760] hover:text-[#76b583] transition-colors ml-1"
                >
                  Sign up
                </Link>
              </p>
            </footer>
          </div>

          {/* Bottom links */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-500 mb-3">
              © 2026 Velora. All rights reserved.
            </p>
            <div className="flex justify-center gap-4 text-[10px] text-[#558760]">
              <a href="#" className="hover:text-[#76b583] transition-colors">
                Privacy Policy
              </a>
              <span className="text-gray-600">•</span>
              <a href="#" className="hover:text-[#76b583] transition-colors">
                Terms of Service
              </a>
              <span className="text-gray-600">•</span>
              <a href="#" className="hover:text-[#76b583] transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
