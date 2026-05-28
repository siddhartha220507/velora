import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import {
    Settings as SettingsIcon,
    Key,
    Globe,
    Shield,
    AlertTriangle,
    Cpu,
    Loader2,
    LayoutGrid,
    User,
    ChevronRight,
    Folder
} from "lucide-react";
import GlassButton from "../../components/ui/GlassButton";
import InputField from "../../components/ui/InputField";
import EnvTable from "../../components/project/EnvTable";
import { motion } from "framer-motion";
import { getProject, updateProject, deleteProject, getProjects } from "../../api/api";
import { AlertBanner, Card, PageHeader } from "../../components/layout/PageLayout";

export default function Settings() {
    const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectId = searchParams.get("projectId") || "";

    const [activeTab, setActiveTab] = useState("GENERAL");
    const [project, setProject] = useState(null);
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Form states
    const [projectName, setProjectName] = useState("");
    const [installCommand, setInstallCommand] = useState("");
    const [startCommand, setStartCommand] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (projectId) {
                    const { data } = await getProject(projectId);
                    setProject(data.data);
                    setProjectName(data.data.name);
                    setInstallCommand(data.data.installCommand || "npm install");
                    setStartCommand(data.data.startCommand || "npm start");
                    setActiveTab("GENERAL");
                } else {
                    const { data } = await getProjects();
                    setAllProjects(data.data || []);
                    setActiveTab("WORKSPACE");
                }
            } catch (err) {
                setError("Failed to load details.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [projectId]);

    const handleUpdate = async (fields) => {
        setSaving(true);
        setError("");
        setSuccessMsg("");
        try {
            const { data } = await updateProject(projectId, fields);
            setProject(data.data);
            setSuccessMsg("Settings updated successfully!");
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update project.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
        
        setSaving(true);
        try {
            await deleteProject(projectId);
            navigate("/dashboard");
        } catch (err) {
            setError("Failed to delete project.");
            setSaving(false);
        }
    };

    const projectTabs = [
        { id: "GENERAL", label: "General", icon: SettingsIcon },
        { id: "VARIABLES", label: "Environment Variables", icon: Key },
        { id: "ADVANCED", label: "Advanced", icon: Cpu },
        { id: "DANGER", label: "Danger Zone", icon: AlertTriangle },
    ];

    const globalTabs = [
        { id: "WORKSPACE", label: "Workspace", icon: LayoutGrid },
        { id: "PROFILE", label: "Profile", icon: User },
        { id: "SECURITY", label: "Security", icon: Shield },
    ];

    const currentTabs = projectId ? projectTabs : globalTabs;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[var(--bg-main)] text-white font-sans items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[var(--accent-primary)]" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[var(--bg-main)] text-white font-sans">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
            <Dock navMode={navMode} toggleNavMode={toggleNavMode} />

            <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
                <TopNav />

                {/* Page header */}
                <div className="px-8 py-6 border-b border-white/[0.04] shrink-0 bg-[#0d0d0f]/20">
                    <div className="max-w-[1000px] mx-auto flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-5 mb-3">
                                <h1 className="text-[20px] font-black tracking-tighter text-[#e4e4e7] uppercase leading-none">
                                    {projectId ? "Project Settings" : "Workspace Settings"}
                                </h1>
                                {projectId && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e1e20]" />
                                        <span className="text-[9px] font-black text-[#22c55e] bg-[#22c55e]/5 px-3 py-1 rounded-lg border border-[#22c55e]/10 uppercase tracking-[0.3em] shadow-elevation-1">
                                            {project?.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-[#52525b] font-black uppercase tracking-[0.4em]">
                                {projectId 
                                    ? "Configure your project infrastructure and settings" 
                                    : "Manage your workspace and security settings"}
                            </p>
                        </div>
                        {projectId && (
                            <button 
                                onClick={() => navigate("/settings")}
                                className="h-12 px-8 rounded-2xl bg-[#1e1e20] border border-white/[0.04] text-[9px] font-black uppercase tracking-[0.3em] text-[#3f3f46] hover:text-white transition-all shadow-elevation-1 flex items-center gap-3"
                            >
                                <ChevronRight size={14} className="rotate-180" /> Return
                            </button>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 max-w-[1000px] mx-auto w-full flex">

                    {/* Tab sidebar */}
                    <div data-lenis-prevent className="w-56 shrink-0 py-8 pr-8 border-r border-white/[0.04] flex flex-col gap-1.5 overflow-y-auto scrollbar-hide">
                        <p className="text-[8px] font-black text-[#1e1e20] uppercase tracking-[0.5em] mb-4 px-4">Settings Menu</p>
                        {currentTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-4 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all ${activeTab === tab.id
                                        ? "bg-[#1e1e20] text-white shadow-elevation-1 border border-white/[0.04]"
                                        : "text-[#3f3f46] hover:text-[#52525b] hover:bg-white/[0.01]"
                                    } ${tab.id === "DANGER" ? "text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef4444]/5 mt-auto border border-transparent hover:border-[#ef4444]/10" : ""}`}
                            >
                                <tab.icon size={14} className={tab.id === "DANGER" && activeTab !== "DANGER" ? "text-[#ef4444]" : ""} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 py-10 pl-10">
                        <div className="max-w-[640px]">
                            {error && <AlertBanner type="error" className="mb-10">{error}</AlertBanner>}
                            {successMsg && <AlertBanner type="success" className="mb-10">{successMsg}</AlertBanner>}

                            {/* ── PROJECT SETTINGS ── */}
                            {projectId ? (
                                <div className="space-y-10">
                                    {activeTab === "GENERAL" && (
                                        <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                            <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[32px] overflow-hidden shadow-elevation-1">
                                                <div className="px-8 py-6 border-b border-white/[0.04] bg-[#161618]">
                                                    <h2 className="text-[11px] font-black text-[#e4e4e7] uppercase tracking-widest mb-1">Project Name</h2>
                                                    <p className="text-[9px] font-black text-[#3f3f46] uppercase tracking-widest">The name of your project.</p>
                                                </div>
                                                <div className="px-8 py-8">
                                                    <InputField 
                                                        value={projectName} 
                                                        onChange={(e) => setProjectName(e.target.value)}
                                                        className="bg-[#0d0d0f] border-white/[0.04] h-14 text-[13px] font-black uppercase tracking-tight"
                                                    />
                                                </div>
                                                <div className="px-10 py-6 bg-[#0d0d0f]/50 border-t border-white/[0.04] flex justify-end">
                                                    <GlassButton 
                                                        variant="primary" 
                                                        className="h-10 px-8 text-[10px] font-black uppercase tracking-widest"
                                                        onClick={() => handleUpdate({ name: projectName })}
                                                        disabled={saving}
                                                    >
                                                        {saving ? "SAVING..." : "SAVE CHANGES"}
                                                    </GlassButton>
                                                </div>
                                            </div>

                                            <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[40px] overflow-hidden shadow-elevation-1">
                                                <div className="px-10 py-8 border-b border-white/[0.04] bg-[#161618] flex items-center justify-between">
                                                    <div>
                                                        <h2 className="text-[13px] font-black text-white uppercase tracking-widest mb-1 flex items-center gap-3">
                                                            <Globe size={16} className="text-[#3f3f46]" /> DOMAINS
                                                        </h2>
                                                        <p className="text-[10px] font-black text-[#3f3f46] uppercase tracking-widest">Configure custom domains and SSL.</p>
                                                    </div>
                                                </div>
                                                <div className="px-10 py-10">
                                                    <div className="flex items-center justify-between px-6 py-5 bg-[#0d0d0f] border border-white/[0.04] rounded-2xl">
                                                        <div>
                                                            <span className="text-[14px] font-black text-white block tracking-tight">
                                                                {project?.name?.toLowerCase().replace(/\s+/g, '-')}.velora.app
                                                            </span>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                                                                <span className="text-[9px] font-black text-[#22c55e] uppercase tracking-[0.2em]">ACTIVE</span>
                                                            </div>
                                                        </div>
                                                        <GlassButton variant="outline" className="h-10 px-6 text-[10px] font-black uppercase tracking-widest opacity-20" disabled>OVERRIDE</GlassButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === "VARIABLES" && (
                                        <motion.div key="vars" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <EnvTable projectId={projectId} />
                                        </motion.div>
                                    )}

                                    {activeTab === "ADVANCED" && (
                                        <motion.div key="advanced" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                            <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[40px] overflow-hidden shadow-elevation-1">
                                                <div className="px-10 py-8 border-b border-white/[0.04] bg-[#161618]">
                                                    <h2 className="text-[13px] font-black text-white uppercase tracking-widest mb-1">BUILD SETTINGS</h2>
                                                    <p className="text-[10px] font-black text-[#3f3f46] uppercase tracking-widest">Configure build sequence and commands.</p>
                                                </div>
                                                <div className="px-10 py-10 space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <InputField label="FRAMEWORK" value="AUTO_DETECT" disabled className="bg-[#0d0d0f]/50 border-white/[0.02] text-[#3f3f46] opacity-50" />
                                                        <InputField 
                                                            label="INSTALL COMMAND" 
                                                            value={installCommand} 
                                                            onChange={(e) => setInstallCommand(e.target.value)}
                                                            className="bg-[#0d0d0f] border-white/[0.04] h-12 text-[12px] font-black uppercase"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <InputField label="OUTPUT DIRECTORY" defaultValue="dist" disabled className="bg-[#0d0d0f]/50 border-white/[0.02] text-[#3f3f46] opacity-50" />
                                                        <InputField 
                                                            label="START COMMAND" 
                                                            value={startCommand} 
                                                            onChange={(e) => setStartCommand(e.target.value)}
                                                            className="bg-[#0d0d0f] border-white/[0.04] h-12 text-[12px] font-black uppercase"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="px-10 py-6 bg-[#0d0d0f]/50 border-t border-white/[0.04] flex justify-end">
                                                    <GlassButton 
                                                        variant="primary" 
                                                        className="h-10 px-8 text-[10px] font-black uppercase tracking-widest"
                                                        onClick={() => handleUpdate({ installCommand, startCommand })}
                                                        disabled={saving}
                                                    >
                                                        {saving ? "SAVING..." : "SAVE BUILD SETTINGS"}
                                                    </GlassButton>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === "DANGER" && (
                                        <motion.div key="danger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <div className="bg-[#1e1e20] border border-[#ef4444]/20 rounded-[40px] overflow-hidden shadow-elevation-1">
                                                <div className="px-10 py-8 border-b border-[#ef4444]/10 bg-[#ef4444]/[0.02] flex items-start gap-5">
                                                    <AlertTriangle size={20} className="text-[#ef4444] mt-1 shrink-0" />
                                                    <div>
                                                        <h2 className="text-[13px] font-black text-[#ef4444] uppercase tracking-widest mb-1">DELETE PROJECT</h2>
                                                        <p className="text-[10px] font-black text-[#ef4444]/60 uppercase tracking-widest leading-relaxed">
                                                            This will permanently delete your project and all its data. This action is irreversible.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="px-10 py-10 flex items-center justify-between">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[11px] font-black text-[#3f3f46] uppercase tracking-widest">Confirm Project Name</span>
                                                        <span className="text-[16px] font-black font-mono text-white tracking-tight">{project?.name}</span>
                                                    </div>
                                                    <GlassButton 
                                                        variant="danger" 
                                                        className="h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em]"
                                                        onClick={handleDelete}
                                                        disabled={saving}
                                                    >
                                                        {saving ? "DELETING..." : "DELETE PROJECT"}
                                                    </GlassButton>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                /* ── GLOBAL / WORKSPACE SETTINGS ── */
                                <motion.div key="global" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                    
                                    {activeTab === "WORKSPACE" && (
                                        <>
                                            <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[48px] overflow-hidden shadow-elevation-1">
                                                <div className="px-10 py-8 border-b border-white/[0.04] bg-[#161618]">
                                                    <h2 className="text-[13px] font-black text-white uppercase tracking-widest mb-1">WORKSPACE PROJECTS</h2>
                                                    <p className="text-[10px] font-black text-[#3f3f46] uppercase tracking-widest">All projects in your workspace.</p>
                                                </div>
                                                <div className="px-4 py-4">
                                                    {allProjects.length === 0 ? (
                                                        <div className="py-20 text-center text-[#1e1e20] font-black uppercase text-[12px] tracking-[0.5em]">NO PROJECTS FOUND</div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {allProjects.map((p) => (
                                                                <div 
                                                                    key={p._id}
                                                                    onClick={() => navigate(`/settings?projectId=${p._id}`)}
                                                                    className="flex items-center justify-between px-8 py-6 rounded-[32px] hover:bg-white/[0.02] transition-all cursor-pointer group border border-transparent hover:border-white/[0.04]"
                                                                >
                                                                    <div className="flex items-center gap-6">
                                                                        <div className="w-12 h-12 rounded-2xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center group-hover:border-[#22c55e]/30 transition-colors">
                                                                            <Folder size={18} className="text-[#3f3f46] group-hover:text-[#22c55e] transition-colors" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[15px] font-black text-white uppercase tracking-tight group-hover:text-[#22c55e] transition-colors">{p.name}</p>
                                                                            <p className="text-[10px] text-[#3f3f46] font-mono mt-1 group-hover:text-[#52525b] transition-colors">{p.repoName}</p>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight size={18} className="text-[#1e1e20] group-hover:text-[#3f3f46] group-hover:translate-x-2 transition-all" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[48px] overflow-hidden shadow-elevation-1">
                                                <div className="px-10 py-8 border-b border-white/[0.04] bg-[#161618]">
                                                    <h2 className="text-[13px] font-black text-white uppercase tracking-widest mb-1">WORKSPACE USAGE</h2>
                                                    <p className="text-[10px] font-black text-[#3f3f46] uppercase tracking-widest">Monitor your build minutes and usage.</p>
                                                </div>
                                                <div className="px-10 py-10">
                                                    <div className="flex justify-between items-center mb-5">
                                                        <span className="text-[11px] font-black text-[#52525b] uppercase tracking-widest">BUILD MINUTES</span>
                                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">124 / 500 MIN</span>
                                                    </div>
                                                    <div className="w-full h-2.5 bg-[#0d0d0f] rounded-full overflow-hidden border border-white/[0.04]">
                                                        <div className="h-full bg-[#22c55e] w-[25%] shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {(activeTab === "PROFILE" || activeTab === "SECURITY") && (
                                        <div className="py-20 text-center">
                                            <div className="w-16 h-16 rounded-3xl bg-[#1e1e20] border border-white/[0.04] flex items-center justify-center mx-auto mb-8 shadow-elevation-1">
                                                <User size={28} className="text-[#3f3f46]" />
                                            </div>
                                            <p className="text-[18px] font-black text-white uppercase tracking-tighter mb-2">ACCOUNT SETTINGS</p>
                                            <p className="text-[11px] font-black text-[#3f3f46] uppercase tracking-[0.2em] mb-10 max-w-[320px] mx-auto leading-relaxed">Manage your profile and security in account settings.</p>
                                            <GlassButton variant="primary" className="h-12 px-10 text-[10px] font-black uppercase tracking-widest" onClick={() => navigate("/account")}>
                                                GO TO ACCOUNT
                                            </GlassButton>
                                        </div>
                                    )}

                                </motion.div>
                            )}

                        </div>
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
}
