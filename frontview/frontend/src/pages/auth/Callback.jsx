import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Callback() {
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      console.log("Token received, refreshing user...");
      localStorage.setItem("token", token);
      refreshUser()
        .then(() => {
          console.log("User refreshed successfully, navigating to dashboard");
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("Failed to refresh user after OAuth:", err);
          const msg = err.response?.data?.message || "session_sync_failed";
          navigate(`/login?error=${encodeURIComponent(msg)}`);
        });
    } else {
      navigate("/login?error=auth_failed");
    }
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center animate-pulse">
          <Zap size={20} className="text-black" strokeWidth={3} />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium text-white mb-1">Authenticating</p>
          <p className="text-[13px] text-[#71717a]">Please wait while we verify your session...</p>
        </div>
      </div>
    </div>
  );
}