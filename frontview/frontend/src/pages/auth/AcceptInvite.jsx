import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import api from '../../api/api';
import GlassButton from '../../components/ui/GlassButton';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No invitation token provided.');
      return;
    }

    const acceptInvitation = async () => {
      try {
        const res = await api.post('/workspaces/members/accept-invite', { token });
        if (res.data.success) {
          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Failed to accept invitation.');
      }
    };

    acceptInvitation();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
          <Zap size={18} className="text-black" strokeWidth={2.5} fill="currentColor" />
        </div>
        <span className="text-xl font-semibold text-white tracking-tight">Velora</span>
      </div>

      <div className="w-full max-w-[400px] bg-[#111113] border border-white/[0.06] rounded-2xl p-8 shadow-elevation-2 flex flex-col items-center text-center">
        
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-[20px] font-semibold text-white mb-2 tracking-tight">Accepting Invitation...</h1>
            <p className="text-[13px] text-[#a1a1aa]">Please wait while we verify your invitation token.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-[20px] font-semibold text-white mb-2 tracking-tight">Invitation Accepted!</h1>
            <p className="text-[13px] text-[#a1a1aa] mb-6">You have successfully joined the team. Redirecting to your dashboard...</p>
            <GlassButton onClick={() => navigate('/dashboard')} variant="primary" className="w-full justify-center h-10 text-[13px] font-medium">
              Go to Dashboard
            </GlassButton>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-[20px] font-semibold text-white mb-2 tracking-tight">Invitation Failed</h1>
            <p className="text-[13px] text-[#ef4444] mb-6">{errorMsg}</p>
            <GlassButton onClick={() => navigate('/dashboard')} variant="secondary" className="w-full justify-center h-10 text-[13px] font-medium bg-[#18181b] hover:bg-[#27272a] border-white/[0.08] text-white">
              Return to Dashboard
            </GlassButton>
          </>
        )}

      </div>
    </div>
  );
};

export default AcceptInvite;
