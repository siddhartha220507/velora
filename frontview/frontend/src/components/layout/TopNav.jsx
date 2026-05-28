import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Settings, FileText, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getFrameworkIcon } from "../../utils/frameworkIcons";

const routeLabels = {
  "/dashboard":    "Overview",
  "/applications": "Applications",
  "/deploy":       "Deployments",
  "/environments": "Environments",
  "/metrics":      "Metrics",
  "/members":      "Members",
  "/integrations": "Integrations",
  "/settings":     "Settings",
  "/documentation":"Documentation",
  "/account":      "Account",
  "/projects/new": "New Project",
};

const TopNav = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const { user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");
  const [project, setProject] = useState(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const projectDropdownRef = useRef(null);

  const pageLabel = routeLabels[location.pathname] ?? "";

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const { getProjectById, getUserProjects } = await import("../../api/api");
          const pRes = await getProjectById(projectId);
          setProject(pRes.data.data);
          
          const psRes = await getUserProjects();
          setProjects(psRes.data.data || []);
        } catch (e) { console.error(e); }
      };
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    const handleClick = (e) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target))
        setIsProjectDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-8 shrink-0 relative z-50 w-full border-b border-white/[0.05] bg-[#050505]/40 backdrop-blur-2xl">

      {/* Left — breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <Link to="/dashboard" className="flex items-center gap-2.5 group mr-2">
          <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center p-1 group-hover:border-white/20 transition-all overflow-hidden shadow-elevation-1">
            <img src="/src/assets/logo-close.png" alt="Velora Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-[14px] font-black text-[#3f3f46] group-hover:text-white transition-colors select-none tracking-tighter uppercase">VELORA</span>
        </Link>
        
        {projectId && project && (
          <>
            <span className="text-[#1a1a1a] text-[12px] select-none mx-1">/</span>
            <div className="relative" ref={projectDropdownRef}>
              <button 
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all group"
              >
                {project.framework && (
                  <div style={{ color: getFrameworkIcon(project.framework).color }}>
                    {React.createElement(getFrameworkIcon(project.framework).Icon, { size: 14, strokeWidth: 2 })}
                  </div>
                )}
                <span className="text-[13px] font-bold text-white/90 select-none tracking-tight">{project.name}</span>
                <ChevronDown size={12} className={`text-[#3f3f46] transition-transform duration-300 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProjectDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-[#111113] border border-white/[0.1] rounded-xl shadow-2xl p-1.5 z-[60]">
                    <div className="px-3 py-2 text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.2em]">Switch Project</div>
                    <div className="space-y-0.5 max-h-60 overflow-y-auto scrollbar-hide">
                      {projects.map(p => (
                        <button
                          key={p._id}
                          onClick={() => {
                            setIsProjectDropdownOpen(false);
                            window.location.href = `${location.pathname}?projectId=${p._id}`;
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${p._id === projectId ? 'bg-white text-black font-bold' : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'}`}
                        >
                          <span className="text-[12.5px] truncate">{p.name}</span>
                          {p._id === projectId && <div className="w-1 h-1 rounded-full bg-black" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {pageLabel && (
          <>
            <span className="text-[#1a1a1a] text-[12px] select-none mx-1">/</span>
            <span className="text-[13px] font-bold text-[#52525b] select-none tracking-tight">{pageLabel}</span>
          </>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">

        {/* Expandable search */}
        <div
          ref={searchRef}
          className={`relative flex items-center rounded-lg overflow-hidden transition-all duration-200 ${
            isSearchOpen
              ? "w-52 bg-[#111113] border border-white/[0.08] ring-1 ring-[#22c55e]/20"
              : "w-8 h-8"
          }`}
        >
          <button
            onClick={() => { setIsSearchOpen(true); }}
            className={`flex items-center justify-center shrink-0 transition-colors w-8 h-8 ${
              isSearchOpen ? "text-[#52525b] pointer-events-none" : "text-[#52525b] hover:text-white hover:bg-white/[0.05] rounded-lg"
            }`}
          >
            <Search size={14} />
          </button>
          <input
            type="text"
            placeholder="Search…"
            autoFocus={isSearchOpen}
            className={`bg-transparent text-[12px] text-white placeholder:text-[#3f3f46] pr-3 focus:outline-none transition-all duration-200 ${
              isSearchOpen ? "w-full opacity-100" : "w-0 opacity-0 pointer-events-none"
            }`}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.08] mx-1.5" />

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            {user?.avatar || user?.githubAvatarUrl || user?.googleAvatarUrl ? (
              <img 
                src={user.avatar || user.githubAvatarUrl || user.googleAvatarUrl} 
                className="w-8 h-8 rounded-full object-cover border border-white/10" 
                alt="Avatar"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black text-white shadow-inner"
                style={{ 
                  backgroundColor: (() => {
                    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
                    const name = user?.name || "User";
                    let hash = 0;
                    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
                    return colors[Math.abs(hash) % colors.length];
                  })()
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <span className="hidden md:block text-[13px] font-bold text-white/70 leading-none ml-1">{user?.name || "User"}</span>
            <ChevronDown size={12} className={`hidden md:block text-[#3f3f46] transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown menu */}
          <div
            className={`absolute right-0 top-[calc(100%+8px)] w-48 bg-[#111113] border border-white/[0.10] rounded-xl shadow-elevation-3 overflow-hidden origin-top-right transition-all duration-150 ${
              isDropdownOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="py-1.5 flex flex-col gap-0.5 px-1.5">
              <Link
                to="/account"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-[#a1a1aa] hover:bg-white/[0.05] hover:text-white rounded-lg transition-colors"
              >
                <User size={13} /> Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-[#a1a1aa] hover:bg-white/[0.05] hover:text-white rounded-lg transition-colors"
              >
                <Settings size={13} /> Settings
              </Link>
              <div className="h-px bg-white/[0.06] mx-1 my-1" />
              <Link
                to="/documentation"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-[#a1a1aa] hover:bg-white/[0.05] hover:text-white rounded-lg transition-colors"
              >
                <FileText size={13} /> Documentation
              </Link>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopNav;
