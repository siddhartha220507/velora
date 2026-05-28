import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-3xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center animate-pulse">
                            <Zap size={32} className="text-[#22c55e]" strokeWidth={2.5} />
                        </div>
                        {/* Orbiting ring */}
                        <div className="absolute inset-0 border-2 border-white/5 rounded-full animate-spin duration-[3s]" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-white font-black text-lg tracking-tight mb-2">Initializing Session</h2>
                        <p className="text-[#52525b] text-[13px] font-medium">Verifying your secure connection to Velora...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
