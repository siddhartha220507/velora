import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import TopNav from "../../components/layout/TopNav";
import PageWrapper from "../../components/layout/PageWrapper";
import GlassButton from "../../components/ui/GlassButton";
import { PageShell, PageHeader, Card, CardHeader, CardBody, TableHead, Badge, AlertBanner } from "../../components/layout/PageLayout";
import { Users, Mail, ShieldAlert, ShieldCheck, TerminalSquare, UserPlus, Trash2, ArrowRight, HardDrive, Plug, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/api";

export default function Members() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("DEVELOPER");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (activeWorkspace) {
      fetchMembers();
    }
  }, [activeWorkspace]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workspaces/members');
      setMembers(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    try {
      await api.post('/workspaces/members/invite', { email: inviteEmail, role: inviteRole });
      setMessage({ text: `Invitation sent to ${inviteEmail}`, type: "success" });
      setInviteEmail("");
      fetchMembers();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to send invite", type: "error" });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`/workspaces/members/${memberId}`);
      setMessage({ text: "Member removed", type: "success" });
      fetchMembers();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to remove member", type: "error" });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case "OWNER": return { icon: ShieldAlert,    color: "text-[#ef4444]", bg: "bg-[#ef4444]/10 border-[#ef4444]/20" };
      case "ADMIN": return { icon: ShieldCheck,    color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10 border-[#3b82f6]/20" };
      default:      return { icon: TerminalSquare, color: "text-[#71717a]", bg: "bg-white/[0.04] border-white/[0.06]" };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":  return { dot: "bg-[#22c55e]", text: "text-[#22c55e]", bg: "bg-[#22c55e]/10", label: "Active" };
      case "PENDING": return { dot: "bg-[#eab308]", text: "text-[#eab308]", bg: "bg-[#eab308]/10", label: "Pending" };
      default:        return { dot: "bg-[#3f3f46]", text: "text-[#71717a]", bg: "bg-white/[0.04]",  label: "Offline" };
    }
  };

  const isViewer = activeWorkspace?.role === 'VIEWER';
  const isMember = activeWorkspace?.role === 'DEVELOPER' || activeWorkspace?.role === 'MEMBER';
  const canInvite = !isViewer && !isMember; // Only Admins & Owners

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-white font-sans">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.04]">
              <div>
                <h1 className="text-[22px] font-black tracking-tighter text-[#e4e4e7] mb-2 uppercase leading-none">Workspace Members</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* ── Invite card ── */}
              {canInvite && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[32px] shadow-elevation-1 overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/[0.04] flex items-center gap-5 bg-[#161618]">
                    <div className="w-8 h-8 rounded-lg bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#22c55e] shadow-elevation-1">
                      <UserPlus size={16} />
                    </div>
                    <h2 className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.3em]">Invite New Member</h2>
                  </div>
                  <div className="p-6">
                    <AnimatePresence>
                      {message && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-10">
                          <div className={`px-8 py-5 rounded-2xl border backdrop-blur-3xl flex items-center gap-5 ${
                            message.type === "error" 
                              ? "bg-[#ef4444]/5 border-[#ef4444]/10 text-[#ef4444]" 
                              : "bg-[#22c55e]/5 border-[#22c55e]/10 text-[#22c55e]"
                          }`}>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{message.text}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-8 items-end">
                      <div className="flex-1 w-full">
                        <label className="block text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.35em] mb-3">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="operator@velora.io"
                          className="w-full h-12 px-5 bg-[#0d0d0f] border border-white/[0.04] focus:border-white/10 rounded-xl text-[11px] font-mono text-white placeholder:text-[#2d2d33] transition-all focus:outline-none shadow-inner"
                        />
                      </div>
                      <div className="w-full md:w-56">
                        <label className="block text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.35em] mb-3">
                          Role
                        </label>
                        <div className="relative group">
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="w-full h-12 px-5 pr-10 bg-[#0d0d0f] border border-white/[0.04] focus:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white appearance-none focus:outline-none transition-all cursor-pointer shadow-inner"
                          >
                            <option value="DEVELOPER" className="bg-[#111113]">Developer</option>
                            <option value="ADMIN" className="bg-[#111113]">Administrator</option>
                            <option value="VIEWER" className="bg-[#111113]">Auditor</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3f3f46] pointer-events-none" />
                        </div>
                      </div>
                      <GlassButton type="submit" variant="primary" className="h-12 px-8 shrink-0 w-full md:w-auto text-[9px] font-black uppercase tracking-[0.25em] shadow-elevation-2">
                        Send_Invite
                      </GlassButton>
                    </form>
                  </div>
                </div>
              </motion.div>
              )}

              {/* ── Members table ── */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[40px] shadow-elevation-1 overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/[0.04] flex items-center justify-between bg-[#161618]">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#52525b] shadow-elevation-1">
                        <Users size={18} />
                      </div>
                      <h2 className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.3em]">Member List</h2>
                    </div>
                    <span className="px-4 py-1.5 rounded-xl bg-[#0d0d0f] border border-white/[0.04] text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.2em] shadow-inner">{members.length} Members</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#0d0d0f]/20">
                          {["MEMBER", "EMAIL", "ROLE", "STATUS", "ACTIONS"].map(h => (
                            <th key={h} className="px-10 py-6 text-left text-[9px] font-black text-[#3f3f46] uppercase tracking-[0.35em] border-b border-white/[0.02]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {loading ? (
                          [1, 2].map(i => (
                            <tr key={i} className="animate-pulse">
                              <td colSpan="5" className="px-10 py-8 h-28 bg-white/[0.01]" />
                            </tr>
                          ))
                        ) : members.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-10 py-20 text-center text-[#3f3f46] text-[11px] font-black uppercase tracking-[0.4em]">No members found...</td>
                          </tr>
                        ) : members.map((member) => {
                          const roleConf = getRoleConfig(member.role);
                          const statusConf = getStatusConfig(member.status);
                          const RoleIcon = roleConf.icon;
                          const memberName = member.name || "PENDING";
                          const memberEmail = member.email;

                          return (
                            <tr key={member.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-5">
                                  {member.avatarUrl ? (
                                    <img src={member.avatarUrl} className="w-12 h-12 rounded-xl object-cover border border-white/[0.06] shadow-elevation-1" alt="" />
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[11px] font-black text-[#1e1e20] group-hover:text-white shrink-0 shadow-elevation-1 transition-colors">
                                      {memberName.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-[14px] font-black text-[#e4e4e7] uppercase tracking-tighter leading-tight group-hover:text-[#22c55e] transition-colors">{memberName}</p>
                                    <p className="text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.2em] mt-1.5">User_Active</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-10 py-8">
                                <div className="flex items-center gap-3 text-[11px] font-mono text-[#52525b] group-hover:text-white transition-colors">
                                  <Mail size={13} className="text-[#1e1e20] group-hover:text-[#3f3f46] transition-colors" />
                                  {memberEmail}
                                </div>
                              </td>
                              <td className="px-10 py-8">
                                <span className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-widest shadow-elevation-1 ${roleConf.bg} ${roleConf.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                  <RoleIcon size={14} /> {member.role}
                                </span>
                              </td>
                              <td className="px-10 py-8">
                                <span className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-elevation-1 ${statusConf.bg} ${statusConf.text} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusConf.dot}`} />
                                  {statusConf.label}
                                </span>
                              </td>
                              <td className="px-10 py-8">
                                {canInvite && (
                                <button 
                                  onClick={() => handleRemove(member.id)}
                                  disabled={member.role === 'OWNER'}
                                  className="w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#1e1e20] hover:text-[#ef4444] transition-all disabled:opacity-0 shadow-elevation-1 group-hover:text-[#3f3f46]"
                                >
                                  <Trash2 size={18} />
                                </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}