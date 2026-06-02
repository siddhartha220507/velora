import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Path sahi kar lena apne mutabik

const Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    useEffect(() => {
  const token = searchParams.get("token");
  if (token) {
    console.log("Token received, refreshing user...");
    localStorage.setItem("token", token);
    
    refreshUser()
      .then((validUser) => {
        // í¼Ÿ Check karo ki user sahi me mila ya null/undefined hai
        if (validUser) {
          console.log("User refreshed successfully, navigating to dashboard");
          navigate("/dashboard");
        } else {
          console.error("Token processed but no user data returned");
          navigate("/login?error=invalid_user_data");
        }
      })
      .catch((err) => {
        // í¼Ÿ Ab ye catch block sahi se trigger hoga agar API fail hui toh
        console.error("Failed to refresh user after OAuth:", err);
        const msg = err.response?.data?.message || "session_sync_failed";
        navigate(`/login?error=${encodeURIComponent(msg)}`);
      });
  } else {
    navigate("/login?error=auth_failed");
  }
}, [searchParams, navigate, refreshUser]);
     
       

    return (
        <div className="h-screen w-screen bg-[#050505] flex items-center justify-center text-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#22c55e] mx-auto mb-4"></div>
                <p className="text-zinc-400">Completing secure authentication...</p>
            </div>
        </div>
    );
};

export default Callback;
