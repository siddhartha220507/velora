import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "../../components/layout/Sidebar";
import Dock from "../../components/layout/Dock";
import PageWrapper from "../../components/layout/PageWrapper";
import TopNav from "../../components/layout/TopNav";
import InputField from "../../components/ui/InputField";
import GlassButton from "../../components/ui/GlassButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  FolderGit2,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Search,
  Settings2,
  Globe,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Trash2,
  Plus,
  Zap,
  AlertCircle,
  Link2
} from "lucide-react";
import { addEnvVar, createProject, getGithubRepos } from "../../api/api";
import { parseGithubRepoInput } from "../../utils/githubRepo";
import { useAuth } from "../../context/AuthContext";
import { detectFrameworkFromFiles } from "../../utils/frameworkDetector";
// Removed react-hot-toast import as it's missing in package.json

const GitHubIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const Frameworks = [
  { id: "react", name: "React", icon: Globe, install: "npm install", start: "npm start" },
  { id: "nextjs", name: "Next.js", icon: Rocket, install: "npm install", start: "npm run dev" },
  { id: "vite", name: "Vite", icon: Zap, install: "npm install", start: "npm run dev" },
  { id: "nodejs", name: "Node.js", icon: Cpu, install: "npm install", start: "node index.js" },
  { id: "other", name: "Other", icon: Settings2, install: "npm install", start: "npm start" },
];

export default function NewProjectPage() {
  const { isCollapsed, toggleSidebar, navMode, toggleNavMode } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stepper State: 1 = Import, 2 = Configure
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [repoInput, setRepoInput] = useState("");
  const [repoName, setRepoName] = useState("");
  const [branch, setBranch] = useState("main");
  const [installCommand, setInstallCommand] = useState("npm install");
  const [startCommand, setStartCommand] = useState("npm start");
  const [framework, setFramework] = useState("react");
  const [envVars, setEnvVars] = useState([{ key: "", value: "" }]);

  // UI State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFrameworkList, setShowFrameworkList] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileRead = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Base64 encoding for binary safety
        const base64 = reader.result.split(',')[1];
        resolve({
          path: file.webkitRelativePath || file.name,
          content: base64,
          encoding: 'base64'
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files) => {
    setLoading(true);
    try {
      const processed = await Promise.all(Array.from(files).map(handleFileRead));
      setUploadedFiles(processed);

      // Auto-Detect Framework
      const detected = detectFrameworkFromFiles(processed);
      if (detected) {
        setFramework(detected.id);
        setInstallCommand(detected.install);
        setStartCommand(detected.start);
      }

      // Set project name from root folder
      if (files[0]?.webkitRelativePath) {
        const rootFolder = files[0].webkitRelativePath.split('/')[0];
        setName(rootFolder.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase());
      }
      setStep(2);
    } catch (err) {
      setError("Failed to read project files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFolderSelect = (e) => {
    if (e.target.files.length > 0) processFiles(e.target.files);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const items = e.dataTransfer.items;
    // Note: Recursive directory drop is complex with standard DataTransfer
    // For now we handle standard file selection via the input
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    setReposLoading(true);
    try {
      const { data } = await getGithubRepos(repoSearch || undefined);
      setRepos(Array.isArray(data?.repos) ? data.repos : []);
    } catch (e) {
      setRepos([]);
    } finally {
      setReposLoading(false);
    }
  };

  const handleImport = async (repo) => {
    setLoading(true);
    setError("");
    try {
      const cloneUrl = `https://github.com/${repo.owner}/${repo.name}.git`;
      setRepoInput(cloneUrl);
      setRepoName(repo.name);
      setBranch((repo.defaultBranch || "main").trim());
      setName(repo.name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase());

      // 🔍 AUTO-DETECT FRAMEWORK FROM GITHUB
      const token = localStorage.getItem('github_token') || user?.githubAccessToken;
      if (token) {
        try {
          const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/contents/package.json`, {
            headers: { Authorization: `token ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const content = atob(data.content.replace(/\n/g, ''));
            const detected = detectFrameworkFromFiles([{ path: 'package.json', content }]);
            if (detected) {
              setFramework(detected.id);
              setInstallCommand(detected.install);
              setStartCommand(detected.start);
            }
          }
        } catch (e) { console.warn("Framework detection failed:", e); }
      }

      setStep(2);
    } catch (err) {
      setError("Failed to initialize import.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomImport = () => {
    const parsed = parseGithubRepoInput(repoInput);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError("");
    setRepoName(parsed.repoName);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate based on type
    if (!uploadedFiles && (!name || !repoInput || !repoName)) {
      setError("Project configuration is incomplete. Please select a repository.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let result;

      if (uploadedFiles) {
        // Handle Folder Upload
        const { createProjectFromFolder } = await import("../../api/api");
        result = await createProjectFromFolder({
          name: name.trim(),
          files: uploadedFiles,
          framework: framework,
          installCommand: installCommand.trim(),
          startCommand: startCommand.trim()
        });
      } else {
        // Handle GitHub Import
        const { createProject } = await import("../../api/api");
        result = await createProject({
          name: name.trim(),
          repoUrl: repoInput.trim(),
          repoName: repoName.trim(),
          branch: branch.trim() || "main",
          installCommand: installCommand.trim(),
          startCommand: startCommand.trim(),
          framework: framework
        });
      }

      const id = result.data?.deploymentId; // createProjectFromFolder returns deploymentId directly
      const projectId = result.data?.data?._id;

      if (projectId) {
        const pairs = envVars
          .map((p) => ({ key: p.key.trim(), value: p.value }))
          .filter((p) => p.key && p.value);

        await Promise.all(
          pairs.map((p) => addEnvVar(projectId, p.key, p.value).catch(() => null))
        );

        // Always navigate to Project ID, as the progress page handles finding the deployment
        navigate(`/deployment-progress/${projectId}`);
      } else {
        setError("Failed to create project. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Deployment failed to initiate");
    } finally {
      setLoading(false);
    }
  };

  const selectedFramework = Frameworks.find(f => f.id === framework) || Frameworks[0];

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-white font-sans">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} navMode={navMode} toggleNavMode={toggleNavMode} />
      <Dock navMode={navMode} toggleNavMode={toggleNavMode} />
      <PageWrapper navMode={navMode} isCollapsed={isCollapsed}>
        <TopNav />
        <div className="flex-1 p-6 lg:p-8">

          <div className="max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.04]">
              <div>
                <h1 className="text-[18px] font-black tracking-tighter text-[#e4e4e7] mb-1 uppercase leading-none">Create New Project</h1>
                <p className="text-[8px] text-[#52525b] font-black uppercase tracking-[0.3em] mt-1">
                  {step === 1 ? "Select a project to deploy" : "Configure settings"}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full transition-all shadow-elevation-1 ${step >= 1 ? "bg-[#22c55e]" : "bg-[#1e1e20] border border-white/5"}`} />
                  <div className="w-10 h-px bg-white/[0.04]" />
                  <div className={`w-2.5 h-2.5 rounded-full transition-all shadow-elevation-1 ${step >= 2 ? "bg-[#22c55e]" : "bg-[#1e1e20] border border-white/5"}`} />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Repository List (Main Account Import) */}
                    <div className="lg:col-span-3 bg-[#1e1e20] border border-white/[0.04] rounded-[32px] overflow-hidden flex flex-col h-[440px] shadow-elevation-1 transition-all">
                      <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between bg-[#161618]">
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-xl bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center shadow-elevation-1 text-[#e4e4e7]">
                            <GitHubIcon size={20} />
                          </div>
                          <div>
                            <span className="font-black text-[13px] block uppercase tracking-tighter text-[#e4e4e7]">GitHub Projects</span>
                            <span className="text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.25em] mt-1 block">Connected Account Repositories</span>
                          </div>
                        </div>
                        {user?.githubConnected && (
                          <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1e1e20]" />
                            <input
                              type="text"
                              placeholder="SEARCH_PROJECTS..."
                              value={repoSearch}
                              onChange={(e) => setRepoSearch(e.target.value)}
                              className="bg-[#0d0d0f] border border-white/[0.04] rounded-xl h-12 pl-12 pr-5 text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-white/10 transition-all w-64 shadow-inner placeholder:text-[#2d2d33]"
                            />
                          </div>
                        )}
                      </div>

                      <div 
                        data-lenis-prevent
                        className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide"
                      >
                        {!user?.githubConnected ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="w-28 h-28 rounded-[48px] bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center mb-10 shadow-elevation-2">
                              <GitHubIcon size={56} className="text-[#1e1e20]" />
                            </div>
                            <h4 className="text-[20px] font-black mb-4 uppercase tracking-tighter text-white">Connection Required</h4>
                            <p className="text-[11px] text-[#52525b] mb-12 max-w-[320px] mx-auto font-black uppercase tracking-[0.3em] leading-relaxed">
                              Link your GitHub account to see your repositories and deploy them instantly.
                            </p>
                            <div className="flex flex-col items-center gap-8">
                              <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/github`}
                                className="h-16 px-12 rounded-[32px] bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-5 hover:bg-white/90 transition-all shadow-elevation-2"
                              >
                                <GitHubIcon size={20} /> Connect GitHub
                              </a>
                              <button
                                onClick={() => document.getElementById('folder-upload').click()}
                                className="text-[9px] text-[#3f3f46] hover:text-white transition-colors font-black uppercase tracking-[0.4em] border-b border-white/5 pb-2"
                              >
                                Upload_From_Local
                              </button>
                            </div>
                          </div>
                        ) : reposLoading ? (
                          [1, 2, 3, 4, 5, 6].map(i => (
                            <div key={`skeleton-${i}`} className="flex items-center justify-between p-6 rounded-3xl border border-white/[0.02] bg-[#0d0d0f]/20 animate-pulse">
                              <div className="flex items-center gap-6">
                                <div className="w-6 h-6 bg-white/5 rounded-lg" />
                                <div className="w-48 h-4 bg-white/5 rounded-md" />
                              </div>
                              <div className="w-20 h-4 bg-white/5 rounded-md" />
                            </div>
                          ))
                        ) : repos.length > 0 ? (
                          repos.filter(r => r.name.toLowerCase().includes(repoSearch.toLowerCase())).map((repo, idx) => (
                            <button
                              key={repo._id || repo.id || `repo-${idx}`}
                              onClick={() => handleImport(repo)}
                              className="w-full flex items-center justify-between p-6 rounded-3xl border border-white/[0.03] hover:border-white/10 bg-[#0d0d0f]/20 hover:bg-[#0d0d0f]/50 transition-all group shadow-elevation-1"
                            >
                              <div className="flex items-center gap-6">
                                <div className="w-8 h-8 rounded-xl bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center text-[#1e1e20] group-hover:text-white transition-all shadow-inner text-[10px]">
                                  {repo.isPrivate ? <Lock size={16} /> : <Globe size={16} />}
                                </div>
                                <div className="text-left">
                                  <span className="text-[13px] font-black text-[#e4e4e7] uppercase tracking-tighter group-hover:text-[#22c55e] transition-colors leading-none block">{repo.name}</span>
                                  <span className="text-[8px] text-[#3f3f46] font-black uppercase tracking-[0.2em] mt-1.5 block">Repository_Ready</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <span className="text-[10px] text-[#3f3f46] font-mono font-black uppercase tracking-widest">{repo.defaultBranch}</span>
                                <div className="w-10 h-10 rounded-xl bg-[#0d0d0f] border border-white/[0.04] group-hover:text-white flex items-center justify-center transition-all shadow-elevation-1">
                                  <ArrowRight size={18} className="text-[#1e1e20] group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-20">
                            <GitHubIcon size={64} className="mb-8" />
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] max-w-[240px]">No active assets detected in registry.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: URL Import & Folder Upload */}
                    <div className="lg:col-span-2 flex flex-col gap-4">

                      {/* URL Import Card */}
                      <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[24px] p-4 shadow-elevation-1 relative overflow-hidden flex flex-col group transition-all hover:border-white/10 h-fit">
                        <div className="mb-3 flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-[#0d0d0f] border border-white/[0.06] flex items-center justify-center text-[#3f3f46] group-hover:text-white transition-colors shadow-elevation-1">
                            <Link2 size={14} />
                          </div>
                          <div>
                            <h3 className="text-[13px] font-black uppercase tracking-tighter text-[#e4e4e7]">Import via URL</h3>
                            <p className="text-[7px] text-[#52525b] font-black uppercase tracking-[0.2em]">Quick Git Import.</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                           <div className="relative">
                            <Link2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1e1e20]" />
                            <input
                              placeholder="HTTPS://GITHUB.COM/OPERATOR/NODE"
                              value={repoInput}
                              onChange={(e) => setRepoInput(e.target.value)}
                              className="w-full h-11 bg-[#0d0d0f] border border-white/[0.04] rounded-xl pl-12 pr-4 text-[10px] font-black uppercase tracking-tight text-white focus:outline-none focus:border-white/10 transition-all font-mono placeholder:text-[#2d2d33] shadow-inner"
                            />
                          </div>
                          <GlassButton
                            variant="primary"
                            className="w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-elevation-2"
                            onClick={handleCustomImport}
                            disabled={!repoInput}
                          >
                            Initialize_Import
                          </GlassButton>
                        </div>
                      </div>

                        {/* Folder Upload Card */}
                      <div
                        className={`bg-[#1e1e20] border ${isDragActive ? 'border-[#22c55e]/20 bg-[#22c55e]/[0.01]' : 'border-white/[0.04]'} rounded-[24px] p-4 shadow-elevation-1 relative overflow-hidden flex-1 group transition-all hover:border-[#22c55e]/10 cursor-pointer`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                        onDragLeave={() => setIsDragActive(false)}
                        onDrop={onDrop}
                        onClick={() => document.getElementById('folder-upload').click()}
                      >
                        <input
                          type="file"
                          id="folder-upload"
                          webkitdirectory=""
                          directory=""
                          className="hidden"
                          onChange={onFolderSelect}
                        />

                        <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
                          <div className="w-8 h-8 rounded-lg bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center mb-3 group-hover:bg-[#22c55e]/5 group-hover:border-[#22c55e]/10 transition-all shadow-elevation-1 text-[#3f3f46]">
                            <Rocket size={16} />
                          </div>
                          <h3 className="text-[13px] font-black mb-1 uppercase tracking-tighter text-[#e4e4e7]">Upload Folder</h3>
                          <p className="text-[7px] text-[#52525b] font-black uppercase tracking-[0.2em] max-w-[180px] leading-relaxed mb-3">
                            {uploadedFiles ? `SCANNING: ${uploadedFiles.length} FILES` : "Direct upload from local."}
                          </p>
                          <div className="px-5 py-2 rounded-xl bg-[#22c55e]/5 border border-[#22c55e]/10 text-[8px] font-black uppercase tracking-[0.25em] text-[#22c55e] shadow-elevation-1 group-hover:bg-[#22c55e] group-hover:text-black transition-all">
                            {loading ? "SCANNING..." : "CHOOSE_FOLDER"}
                          </div>
                        </div>

                        {/* Drop Overlay */}
                        <div className="absolute inset-4 border border-dashed border-white/[0.02] rounded-[32px] pointer-events-none group-hover:border-[#22c55e]/10 transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="max-w-4xl mx-auto pb-10"
                >
                  <div className="space-y-4">
                    <div className="bg-[#1e1e20] border border-white/[0.04] rounded-[40px] p-6 shadow-elevation-1">
                       <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/[0.02]">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-[#0d0d0f] border border-white/[0.08] flex items-center justify-center text-[#22c55e] shadow-elevation-1">
                            <Rocket size={20} />
                          </div>
                          <div>
                            <h3 className="font-black text-[16px] text-[#e4e4e7] leading-tight uppercase tracking-tighter">{name || "NODE_CONFIGURATION"}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <GitBranch size={10} className="text-[#3f3f46]" />
                              <span className="text-[8px] text-[#3f3f46] font-mono font-black uppercase tracking-[0.3em]">{branch}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setStep(1)} className="px-5 py-2 rounded-lg bg-[#0d0d0f] border border-white/[0.04] text-[8px] font-black uppercase tracking-[0.3em] text-[#3f3f46] hover:text-white transition-all shadow-elevation-1">CANCEL</button>
                      </div>

                      <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.4em] ml-1">Project Name</label>
                            <input
                              value={name}
                              onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                              placeholder="project-identifier"
                              className="w-full h-11 bg-[#0d0d0f] border border-white/[0.04] rounded-xl px-5 text-[11px] font-black uppercase tracking-tight text-[#e4e4e7] focus:outline-none focus:border-white/10 transition-all shadow-inner placeholder:text-[#2d2d33]"
                            />
                          </div>

                          <div className="space-y-3 relative">
                            <label className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.4em] ml-1">Framework Preset</label>
                            <button
                              onClick={() => setShowFrameworkList(!showFrameworkList)}
                              className="w-full h-11 bg-[#0d0d0f] border border-white/[0.04] rounded-xl px-5 flex items-center justify-between group hover:border-white/10 transition-all shadow-inner"
                            >
                              <div className="flex items-center gap-3">
                                <selectedFramework.icon size={14} className="text-[#3f3f46]" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#e4e4e7]">{selectedFramework.name}</span>
                                {uploadedFiles && (
                                  <span className="px-2 py-0.5 rounded-md bg-[#22c55e]/5 border border-[#22c55e]/10 text-[#22c55e] text-[6px] font-black uppercase tracking-[0.3em] ml-2 animate-pulse">DETECTED</span>
                                )}
                              </div>
                              <ChevronDown size={12} className={`text-[#3f3f46] transition-transform ${showFrameworkList ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {showFrameworkList && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setShowFrameworkList(false)} />
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 right-0 top-full mt-4 bg-[#161618] border border-white/[0.04] rounded-[32px] shadow-elevation-2 p-4 z-50 overflow-hidden"
                                  >
                                    {Frameworks.map((fw, idx) => (
                                      <button
                                        key={`fw-${fw.id}-${idx}`}
                                        onClick={() => {
                                          setFramework(fw.id);
                                          setInstallCommand(fw.install);
                                          setStartCommand(fw.start);
                                          setShowFrameworkList(false);
                                        }}
                                        className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all ${framework === fw.id ? 'bg-white text-black shadow-elevation-1' : 'hover:bg-white/[0.02] text-[#3f3f46] hover:text-white'}`}
                                      >
                                        <fw.icon size={16} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.25em]">{fw.name}</span>
                                      </button>
                                    ))}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Build Settings Accordion */}
                        <div className="bg-[#0d0d0f]/20 border border-white/[0.04] rounded-2xl p-6 shadow-inner">
                          <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em] text-[#3f3f46] hover:text-[#e4e4e7] transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <Settings2 size={16} />
                              ADVANCED_SETTINGS
                            </div>
                            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>

                          <AnimatePresence>
                            {showAdvanced && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 mt-6 border-t border-white/[0.04]">
                                  <div className="space-y-4">
                                    <label className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.4em] ml-1">Install Command</label>
                                    <input
                                      value={installCommand}
                                      onChange={(e) => setInstallCommand(e.target.value)}
                                      className="w-full h-11 bg-[#0d0d0f] border border-white/[0.04] rounded-xl px-5 text-[11px] font-mono text-[#e4e4e7] focus:outline-none focus:border-white/10 transition-all shadow-inner"
                                    />
                                  </div>
                                  <div className="space-y-4">
                                    <label className="text-[8px] font-black text-[#3f3f46] uppercase tracking-[0.4em] ml-1">Start Command</label>
                                    <input
                                      value={startCommand}
                                      onChange={(e) => setStartCommand(e.target.value)}
                                      className="w-full h-11 bg-[#0d0d0f] border border-white/[0.04] rounded-xl px-5 text-[11px] font-mono text-[#e4e4e7] focus:outline-none focus:border-white/10 transition-all shadow-inner"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                         {/* Environment Variables */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#3f3f46]">Authority Parameters</h4>
                            <button
                              onClick={() => setEnvVars([...envVars, { key: "", value: "" }])}
                              className="px-4 py-2 rounded-lg bg-[#0d0d0f] border border-white/[0.04] text-[8px] font-black uppercase tracking-[0.3em] text-white hover:bg-white/[0.04] transition-all flex items-center gap-2 shadow-elevation-1"
                            >
                              <Plus size={12} /> ADD_VAR
                            </button>
                          </div>

                          <div className="space-y-3 max-h-[120px] overflow-y-auto scrollbar-hide pr-2">
                            {envVars.map((env, i) => (
                              <div key={`env-${i}`} className="flex gap-4">
                                <input
                                  placeholder="ENV_KEY"
                                  value={env.key}
                                  onChange={(e) => {
                                    const next = [...envVars];
                                    next[i].key = e.target.value;
                                    setEnvVars(next);
                                  }}
                                  className="flex-1 h-9 bg-[#0d0d0f] border border-white/[0.04] rounded-lg px-4 text-[9px] font-mono font-black uppercase tracking-widest text-[#e4e4e7] focus:outline-none focus:border-white/10 transition-all shadow-inner placeholder:text-[#2d2d33]"
                                />
                                <input
                                  type="password"
                                  placeholder="••••••••••••"
                                  value={env.value}
                                  onChange={(e) => {
                                    const next = [...envVars];
                                    next[i].value = e.target.value;
                                    setEnvVars(next);
                                  }}
                                  className="flex-1 h-9 bg-[#0d0d0f] border border-white/[0.04] rounded-lg px-4 text-[9px] font-mono text-[#e4e4e7] focus:outline-none focus:border-white/10 transition-all shadow-inner placeholder:text-[#2d2d33]"
                                />
                                <button
                                  onClick={() => setEnvVars(envVars.filter((_, idx) => idx !== i))}
                                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#0d0d0f] border border-white/[0.04] text-[#1e1e20] hover:text-[#ef4444] transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 bg-[#ef4444]/5 border border-[#ef4444]/10 rounded-[32px] flex items-center gap-6 shadow-elevation-1"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444] shrink-0">
                              <AlertCircle size={22} />
                            </div>
                            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#ef4444]">{error}</p>
                          </motion.div>
                        )}

                        <div className="pt-10">
                          <button
                            className="w-full h-14 rounded-2xl bg-[#22c55e] text-black font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.002] hover:shadow-elevation-2 active:scale-[0.998] transition-all disabled:opacity-50 disabled:pointer-events-none"
                            onClick={handleSubmit}
                            disabled={loading || !name}
                          >
                            {loading ? (
                              <>
                                <div className="w-4 h-4 border-[2px] border-black/20 border-t-black rounded-full animate-spin" />
                                DEPLOYING...
                              </>
                            ) : (
                              <>
                                DEPLOY_PROJECT <ArrowRight size={18} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
