import React, { useState } from "react";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import TopNav from "../../components/layout/TopNav";
import PageWrapper from "../../components/layout/PageWrapper";
import { useAuth } from "../../context/AuthContext";
import GlassButton from "../../components/ui/GlassButton";
import InputField from "../../components/ui/InputField";
import { PageShell, PageHeader, Card, CardHeader, CardBody, AlertBanner } from "../../components/layout/PageLayout";
import { Shield, Key, User, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GithubIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Account() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const { user, refreshUser } = useAuth();
  const [alias, setAlias] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (user) {
      setAlias(user.name || "");
      setAvatarUrl(user.avatar || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ text: "", type: "" });
    
    try {
      await updateCurrentUser({ username: alias, avatarUrl });
      await refreshUser();
      setMessage({ text: "Profile updated successfully.", type: "success" });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to update profile", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) { setMessage({ text: "Please enter both passwords.", type: "error" }); return; }
    setIsUpdating(true);
    setTimeout(() => {
      setMessage({ text: "Password updated successfully.", type: "success" });
      setCurrentPassword(""); setNewPassword(""); setIsUpdating(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-white font-sans">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/[0.04]">
              <div>
                <h1 className="text-[22px] font-black tracking-tighter text-[#e4e4e7] mb-1.5 uppercase">Operator Registry</h1>
                <p className="text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.3em]">Manage your profile, security, and connected authority services</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 rounded-xl bg-[#0d0d0f] border border-white/[0.04] text-[9px] font-black text-[#22c55e] uppercase tracking-widest shadow-inner flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" /> NOMINAL_AUTHORITY
                </span>
              </div>
            </div>

            {/* Alert */}
            <AnimatePresence>
              {message.text && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mb-10">
                   <div className={`px-8 py-5 rounded-2xl border backdrop-blur-3xl flex items-center gap-5 ${
                    message.type === "error" 
                      ? "bg-[#ef4444]/5 border-[#ef4444]/10 text-[#ef4444]" 
                      : "bg-[#22c55e]/5 border-[#22c55e]/10 text-[#22c55e]"
                  }`}>
                    {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{message.text}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* ── Profile card ── */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[32px] shadow-elevation-1 overflow-hidden">
                  <div className="px-8 py-5 border-b border-white/[0.04] flex items-center gap-5 bg-[#161618]">
                    <div className="w-9 h-9 rounded-xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#52525b] shadow-elevation-1">
                      <User size={16} />
                    </div>
                    <h2 className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.3em]">Authority Profile</h2>
                  </div>
                  <div className="p-8">
                    {/* Avatar row */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/[0.04]">
                      <div className="w-18 h-18 rounded-2xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden shadow-elevation-1" style={{width:'72px',height:'72px'}}>
                        {user?.avatar || user?.githubAvatarUrl || user?.googleAvatarUrl ? (
                          <img
                            src={user.avatar || user.githubAvatarUrl || user.googleAvatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1e1e20] flex items-center justify-center text-2xl font-black text-white uppercase tracking-tighter">
                            {user?.name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[18px] font-black text-[#e4e4e7] uppercase tracking-tighter mb-1 leading-none">{user?.name || "Operator Unit"}</p>
                        <div className="flex items-center gap-2.5 text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.25em]">
                          <Mail size={11} className="opacity-50" />
                          {user?.email || "NOT_ASSIGNED@VELORA.IO"}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.35em]">Operational Alias</label>
                         <InputField
                           value={alias}
                           onChange={(e) => setAlias(e.target.value)}
                           className="h-11 bg-[#0d0d0f] border-white/[0.04] focus:border-white/10 rounded-xl text-[13px] font-black uppercase tracking-tight text-[#e4e4e7] placeholder:text-[#2d2d33] shadow-inner"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.35em]">Identifier Asset (URL)</label>
                         <InputField
                           value={avatarUrl}
                           onChange={(e) => setAvatarUrl(e.target.value)}
                           placeholder="https://registry.io/avatar.png"
                           className="h-11 bg-[#0d0d0f] border-white/[0.04] focus:border-white/10 rounded-xl text-[12px] font-mono text-[#e4e4e7] placeholder:text-[#2d2d33] shadow-inner"
                         />
                      </div>
                      <GlassButton type="submit" variant="primary" className="w-full h-11 text-[9px] font-black uppercase tracking-[0.25em] shadow-elevation-2">
                        {isUpdating ? "SYNCHRONIZING..." : "SYNCHRONIZE_PROFILE"}
                      </GlassButton>
                    </form>
                  </div>
                </div>
              </motion.div>

              {/* ── Right column ── */}
              <div className="flex flex-col gap-10">

                {/* Connected accounts */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                  <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[32px] shadow-elevation-1 overflow-hidden">
                    <div className="px-8 py-5 border-b border-white/[0.04] flex items-center gap-5 bg-[#161618]">
                      <div className="w-9 h-9 rounded-xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#52525b] shadow-elevation-1">
                        <Shield size={16} />
                      </div>
                      <h2 className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.3em]">Uplink Registry</h2>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between p-5 bg-[#0d0d0f]/40 border border-white/[0.04] rounded-2xl shadow-inner group transition-all hover:bg-[#0d0d0f]/60">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center shrink-0 shadow-elevation-1 text-white group-hover:scale-105 transition-transform">
                            <GithubIcon size={20} />
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-[#e4e4e7] uppercase tracking-tighter leading-tight group-hover:text-[#22c55e] transition-colors">GitHub Infrastructure</p>
                            <p className="text-[8px] text-[#3f3f46] font-black uppercase tracking-widest mt-1">Authority Level: REPOSITORY_SCOPE</p>
                          </div>
                        </div>
                        {user?.githubAccessToken ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[8px] font-black text-[#22c55e] bg-[#22c55e]/5 border border-[#22c55e]/10 uppercase tracking-widest">
                            <div className="w-1 h-1 rounded-full bg-[#22c55e]" /> LINKED
                          </span>
                        ) : (
                          <GlassButton variant="secondary" className="h-9 px-5 text-[9px] font-black uppercase tracking-[0.2em] border-white/5">ESTABLISH_UPLINK</GlassButton>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Change password */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                  <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[32px] shadow-elevation-1 overflow-hidden">
                    <div className="px-8 py-5 border-b border-white/[0.04] flex items-center gap-5 bg-[#161618]">
                      <div className="w-9 h-9 rounded-xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#ef4444] shadow-elevation-1">
                        <Key size={16} />
                      </div>
                      <h2 className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.3em]">Cryptographic Override</h2>
                    </div>
                    <div className="p-8">
                      <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.35em]">Current Keyphrase</label>
                          <InputField
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="h-11 bg-[#0d0d0f] border-white/[0.04] focus:border-white/10 rounded-xl text-[12px] font-mono text-[#e4e4e7] placeholder:text-[#2d2d33] shadow-inner"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.35em]">New Master Key</label>
                          <InputField
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="h-11 bg-[#0d0d0f] border-white/[0.04] focus:border-white/10 rounded-xl text-[12px] font-mono text-[#e4e4e7] placeholder:text-[#2d2d33] shadow-inner"
                          />
                        </div>
                        <GlassButton type="submit" variant="danger" className="w-full h-11 text-[9px] font-black uppercase tracking-[0.25em] border-[#ef4444]/10 shadow-elevation-2">
                          {isUpdating ? "OVERRIDING..." : "OVERRIDE_MASTER_KEY"}
                        </GlassButton>
                      </form>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}