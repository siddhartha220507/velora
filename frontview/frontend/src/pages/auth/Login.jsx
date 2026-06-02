import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";
import api, { githubAuthUrl, googleAuthUrl } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import GlassButton from "../../components/ui/GlassButton";
import InputField from "../../components/ui/InputField";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(urlError.replace(/_/g, " "));
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data && response.data.token) {
        const userData = response.data.user;
        if (userData && userData.username) userData.name = userData.username;
        login(userData, response.data.token);
        
        const from = location.state?.from || "/dashboard";
        navigate(from);
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

  const handleGithubLogin = () => {
   window.location.href = "http://51.20.250.181.nip.io:4000/api/auth/github";
  };

  const handleGoogleLogin = () => {
   window.location.href = "http://51.20.250.181.nip.io:4000/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 font-sans select-none">
      
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
          <Zap size={18} className="text-black" strokeWidth={2.5} fill="currentColor" />
        </div>
        <span className="text-xl font-semibold text-white tracking-tight">Velora</span>
      </div>

      <div className="w-full max-w-[380px] bg-[#111113] border border-white/[0.06] rounded-2xl p-8 shadow-elevation-2">
        <div className="mb-6 text-center">
          <h1 className="text-[20px] font-semibold text-white mb-1 tracking-tight">Log in to Velora</h1>
          <p className="text-[13px] text-[#a1a1aa]">Enter your details to access your account</p>
        </div>

        {/* Social Login */}
        <div className="flex flex-col gap-3 mb-6">
          <GlassButton onClick={handleGithubLogin} variant="secondary" className="w-full justify-center h-10 text-[13px] font-medium bg-[#18181b] hover:bg-[#27272a] border-white/[0.08] text-white">
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" className="mr-2">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            Continue with GitHub
          </GlassButton>
          <GlassButton onClick={handleGoogleLogin} variant="secondary" className="w-full justify-center h-10 text-[13px] font-medium bg-[#18181b] hover:bg-[#27272a] border-white/[0.08] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" className="mr-2">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Continue with Google
          </GlassButton>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-[1px] bg-white/[0.06]"></div>
          <span className="text-[12px] text-[#71717a] font-medium">OR</span>
          <div className="flex-1 h-[1px] bg-white/[0.06]"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <InputField 
            label="Email address" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="operator@valora.io" 
            required 
          />

          <InputField 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
            required 
          />

          {error && (
            <div className="text-[#ef4444] text-[13px] p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 font-medium">
              {error}
            </div>
          )}

          <GlassButton type="submit" disabled={loading} variant="primary" className="w-full !mt-6 h-10 text-[13px] font-medium">
            {loading ? "Authenticating..." : "Log In"}
          </GlassButton>
        </form>
      </div>

      <div className="mt-6 text-center text-[13px] text-[#71717a]">
        Don't have an account?{' '}
        <Link to="/register" state={{ from: location.state?.from }} className="text-white hover:underline transition-all">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
