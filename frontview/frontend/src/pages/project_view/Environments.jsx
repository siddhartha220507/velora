import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import { Search, Plus, GitBranch, Shield, Eye, EyeOff, Trash2, Key, Download, ChevronDown, Lock } from "lucide-react";
import GlassButton from "../../components/ui/GlassButton";
import { PageShell, PageHeader, Card, CardHeader, Badge, TableHead } from "../../components/layout/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { getProjects, getEnvVars, addEnvVar, deleteEnvVar } from "../../api/api";

export default function Environments() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projectId, setProjectId] = useState(searchParams.get("projectId") || "");
  const [projects, setProjects] = useState([]);
  const [envVars, setEnvVars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchEnvVars();
      setSearchParams({ projectId });
    }
  }, [projectId]);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      const projectData = res.data.data || [];
      setProjects(projectData);
      if (!projectId && projectData.length > 0) {
        setProjectId(projectData[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  const fetchEnvVars = async () => {
    setLoading(true);
    try {
      const res = await getEnvVars(projectId);
      setEnvVars(res.data.data || []);
    } catch (err) {
      console.error("Failed to load environment variables", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVar = async () => {
    if (!newKey || !newValue) return;
    setIsSaving(true);
    try {
      await addEnvVar(projectId, newKey, newValue);
      setNewKey("");
      setNewValue("");
      setShowAddModal(false);
      fetchEnvVars();
    } catch (err) {
      console.error("Failed to add variable", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVar = async (key) => {
    if (!window.confirm(`Delete ${key}? This will take effect on next deployment.`)) return;
    try {
      await deleteEnvVar(projectId, key);
      fetchEnvVars();
    } catch (err) {
      console.error("Failed to delete variable", err);
    }
  };

  const activeProject = projects.find(p => p._id === projectId);

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-white font-sans">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/[0.04]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#1e1e20] border border-white/[0.04] text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.3em]">SECURE_STORAGE</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] opacity-80" />
                </div>
                <h1 className="text-[20px] font-black tracking-tighter uppercase text-[#e4e4e7] leading-none">Global_Configurations</h1>
                <p className="text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.3em] mt-2">Encrypted_Registry_for_Infrastructure_Secrets_&_Runtime_Parameters</p>
             </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="relative group">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="appearance-none h-9 pl-4 pr-9 bg-[#0d0d0f] border border-white/[0.04] rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-[#e4e4e7] focus:outline-none focus:border-white/[0.1] transition-all cursor-pointer shadow-inner max-w-[160px] truncate"
                  >
                    {projects.map(p => (
                      <option key={p._id} value={p._id} className="bg-[#1e1e20]">{p.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3f3f46] pointer-events-none" />
                </div>

                <GlassButton
                  variant="primary"
                  className="h-9 px-5 gap-2 text-[9px] font-black uppercase tracking-[0.2em] shadow-elevation-2 shrink-0"
                  onClick={() => setShowAddModal(true)}
                  disabled={!projectId}
                >
                  <Plus size={13} /> ADD_VAR
                </GlassButton>
              </div>
            </div>

            <motion.div
              className="space-y-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* AES Banner */}
              <div className="flex items-center gap-5 p-5 bg-[#0d0d0f] border border-white/[0.04] rounded-2xl shadow-elevation-1">
                <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/5 border border-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-[#e4e4e7] uppercase tracking-widest">AES-256_ENCRYPTION_UPLINK</p>
                  <p className="text-[8px] text-[#3f3f46] mt-1.5 font-black uppercase tracking-[0.2em] leading-relaxed max-w-2xl">Infrastructure secrets are strictly isolated and only available to the build runtime. Values are hashed and masked for security compliance.</p>
                </div>
              </div>

              {/* Secrets Vault */}
              <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[32px] overflow-hidden shadow-elevation-2">
                <div className="bg-[#0d0d0f]/40 px-8 py-6 border-b border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#52525b] shadow-elevation-1">
                      <Shield size={18} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-black text-[#e4e4e7] uppercase tracking-tighter mb-0.5">REGISTRY_ARTIFACTS</h3>
                      <p className="text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.3em]">{activeProject?.name || 'GLOBAL'}</p>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 rounded-xl bg-[#22c55e]/5 border border-[#22c55e]/10 text-[8px] font-black text-[#22c55e] tracking-[0.3em] uppercase">
                    ACTIVE_VERIFICATION
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.02]">
                        <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.4em] text-[#3f3f46]">KEY_REGISTRY</th>
                        <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.4em] text-[#3f3f46]">MASKED_PAYLOAD</th>
                        <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-[0.4em] text-[#3f3f46]">STATE</th>
                        <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-[0.4em] text-[#3f3f46]">CONTROL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02] bg-[#0d0d0f]/10">
                      {loading ? (
                        [1, 2, 3].map(i => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={4} className="px-12 py-10"><div className="h-6 bg-white/[0.02] rounded-xl w-1/2" /></td>
                          </tr>
                        ))
                      ) : envVars.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-12 py-32 text-center">
                            <div className="flex flex-col items-center gap-10 opacity-[0.03]">
                              <Key size={80} />
                              <p className="text-[14px] font-black uppercase tracking-[0.6em]">NULL_REGISTRY_RECORDS</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        envVars.map((env, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02] group transition-all">
                            <td className="px-8 py-5">
                              <code className="text-[12px] font-black text-[#22c55e] uppercase tracking-tighter">{env.key}</code>
                            </td>
                            <td className="px-8 py-5 text-[10px] font-black text-[#2d2d33] tracking-[0.5em] group-hover:text-[#52525b] transition-colors">
                              ••••••••••••••••
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[8px] font-black text-[#22c55e] px-3 py-1 bg-[#22c55e]/5 rounded-xl border border-[#22c55e]/10 uppercase tracking-[0.2em]">PROTECTED</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button
                                onClick={() => handleDeleteVar(env.key)}
                                className="w-9 h-9 rounded-xl text-[#3f3f46] hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center ml-auto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </PageWrapper>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0d0d0f]/90 backdrop-blur-xl px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#1e1e20] border border-white/[0.04] rounded-[32px] p-10 shadow-elevation-2"
            >
              <div className="flex items-center gap-6 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/5 border border-[#22c55e]/10 flex items-center justify-center text-[#22c55e] shadow-elevation-1">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-[20px] font-black text-[#e4e4e7] uppercase tracking-tighter">Initialize_Artifact</h2>
                  <p className="text-[9px] text-[#3f3f46] font-black uppercase tracking-[0.3em] mt-1">New_Variable_Encryption_Protocol</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.4em] mb-3 ml-1">Registry_Identity</label>
                  <input
                    type="text"
                    placeholder="E.G._API_ACCESS_KEY"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    className="w-full h-12 bg-[#0d0d0f] border border-white/[0.04] rounded-xl px-6 text-[11px] font-black text-[#e4e4e7] focus:outline-none focus:border-white/[0.1] transition-all uppercase tracking-[0.2em] shadow-inner placeholder:text-[#2d2d33]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.4em] mb-3 ml-1">Secure_Payload</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="PROTECTED_ENCRYPTION_FIELD"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full h-12 bg-[#0d0d0f] border border-white/[0.04] rounded-xl px-6 text-[11px] font-black text-[#e4e4e7] focus:outline-none focus:border-white/[0.1] transition-all uppercase tracking-[0.2em] shadow-inner placeholder:text-[#2d2d33]"
                    />
                    <Lock size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#3f3f46]" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  className="flex-1 h-11 rounded-xl bg-[#0d0d0f] border border-white/[0.04] text-[9px] font-black uppercase tracking-[0.3em] text-[#3f3f46] hover:text-white transition-all"
                  onClick={() => setShowAddModal(false)}
                >
                  ABORT_COMMAND
                </button>
                <GlassButton
                  variant="primary"
                  className="flex-1 h-11 text-[9px] font-black uppercase tracking-[0.3em]"
                  disabled={isSaving || !newKey || !newValue}
                  onClick={handleAddVar}
                >
                  {isSaving ? "SYNCING..." : "COMMIT_REGISTRY"}
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}