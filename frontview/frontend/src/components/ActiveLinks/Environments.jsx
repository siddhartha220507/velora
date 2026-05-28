import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNav from "../../components/layout/TopNav";
import {
  Search,
  MoreVertical,
  GitBranch,
  Layers,
  Plus,
  ExternalLink,
  Check,
  ChevronDown,
} from "lucide-react";

import heroBg from "../../assets/new-top.png";

const StatusDot = ({ status }) => {
  const map = {
    Active: { dot: "bg-green-400", text: "text-green-400" },
    Inactive: { dot: "bg-yellow-400", text: "text-yellow-400" },
    Archived: { dot: "bg-slate-500", text: "text-slate-400" },
  };
  const s = map[status] ?? { dot: "bg-slate-400", text: "text-slate-400" };
  return (
    <span className={`flex items-center gap-1.5 text-[9px] ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const EnvTag = ({ label, color }) => (
  <span className={`text-[7px] px-1.5 py-[2px] rounded border font-medium tracking-wide ${color}`}>
    {label}
  </span>
);

const tagColors = {
  PROD: "bg-green-500/10 text-green-400 border-green-500/25",
  STAGING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
  DEV: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  PREVIEW: "bg-purple-500/10 text-purple-400 border-purple-500/25",
};

const EnvIcon = ({ color }) => (
  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
    <Layers size={12} className="text-white/80" />
  </div>
);

const EnvRow = ({ env }) => (
  <tr className="border-b border-white/5 hover:bg-white/[0.025] transition-colors group">
    <td className="px-3 py-2">
      <div className="flex items-center gap-2">
        <EnvIcon color={env.iconColor} />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-100">{env.name}</span>
            <EnvTag label={env.tag} color={tagColors[env.tag]} />
          </div>
          <span className="text-[8px] text-slate-500">{env.slug}</span>
        </div>
      </div>
    </td>
    <td className="px-3 py-2">
      <p className="text-[9px] text-slate-300 truncate max-w-[100px]">{env.project}</p>
      <div className="flex items-center gap-1 text-[8px] text-slate-500 mt-0.5">
        <GitBranch size={7} /> {env.branch}
      </div>
    </td>
    <td className="px-3 py-2">
      <p className="text-[10px] text-slate-200 font-medium">{env.variables}</p>
      <p className="text-[8px] text-slate-500">variables</p>
    </td>
    <td className="px-3 py-2">
      <p className="text-[9px] text-slate-300">{env.timeAgo}</p>
      <p className="text-[8px] text-slate-500">{env.date}</p>
    </td>
    <td className="px-3 py-2">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center text-black text-[7px] font-bold shrink-0">
          {env.updatedBy.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-[9px] text-slate-300">{env.updatedBy}</span>
      </div>
    </td>
    <td className="px-3 py-2">
      <StatusDot status={env.status} />
    </td>
    <td className="px-3 py-2">
      <button className="text-slate-600 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100">
        <MoreVertical size={12} />
      </button>
    </td>
  </tr>
);

export default function Environments() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("All Projects");

  const environments = [
    { id: 1, name: "Production", tag: "PROD", slug: "production", project: "User Auth Service", branch: "main", variables: 12, timeAgo: "2m ago", date: "Apr 26, 2026", updatedBy: "Sheryian", status: "Active", iconColor: "bg-emerald-700/60 border border-emerald-600/30" },
    { id: 2, name: "Staging", tag: "STAGING", slug: "staging", project: "User Auth Service", branch: "develop", variables: 8, timeAgo: "15m ago", date: "Apr 26, 2026", updatedBy: "Sheryian", status: "Active", iconColor: "bg-yellow-700/50 border border-yellow-600/30" },
    { id: 3, name: "Development", tag: "DEV", slug: "development", project: "Frontend Web", branch: "main", variables: 10, timeAgo: "1h ago", date: "Apr 26, 2026", updatedBy: "Sheryian", status: "Active", iconColor: "bg-blue-700/50 border border-blue-600/30" },
    { id: 4, name: "Preview", tag: "PREVIEW", slug: "preview", project: "Payment Service", branch: "feature/checkout", variables: 6, timeAgo: "3h ago", date: "Apr 26, 2026", updatedBy: "Sheryian", status: "Inactive", iconColor: "bg-purple-700/50 border border-purple-600/30" },
  ];

  const filtered = environments.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProject = projectFilter === "All Projects" || e.project === projectFilter;
    const matchTab = activeTab === "all" || (activeTab === "archived" && e.status === "Archived");
    return matchSearch && matchProject && matchTab;
  });

  const totalVars = environments.reduce((s, e) => s + e.variables, 0);
  const uniqueProjects = [...new Set(environments.map((e) => e.project))];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f14] text-white" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif' }}>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? "ml-0 md:ml-[60px]" : "ml-0 md:ml-[240px]"}`}>

        {/* HERO */}
        <div className="relative shrink-0 min-h-[120px] md:min-h-[140px] bg-cover bg-center flex flex-col justify-between border-b border-white/10" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
          <TopNav />
          <div className="relative z-10 px-4 pb-3">
            <h1 className="text-xl md:text-2xl leading-relaxed" style={{ fontFamily: "'Press Start 2P', cursive" }}>Environments</h1>
            <p className="text-[7px] md:text-[9px] text-slate-300 mt-2 leading-loose" style={{ fontFamily: "'Press Start 2P', cursive", textTransform: 'lowercase' }}>
              Manage environment variables and configurations across all your projects.
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div data-lenis-prevent className="flex-1 flex flex-col p-2 md:p-3 overflow-y-auto bg-[#0b0f14]" style={{ scrollbarWidth: 'none' }}>
          <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-2">

            {/* LEFT */}
            <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
              <div className="bg-[#11151c] border border-white/10 rounded-xl flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-1">
                    {[{ id: "all", label: "All Environments" }, { id: "archived", label: "Archived" }].map((t) => (
                      <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-1.5 rounded text-xs transition-colors ${activeTab === t.id ? "bg-white/10 text-white border-b border-white/20" : "text-slate-500 hover:text-slate-300"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-white/5 border border-white/10 rounded text-[9px] text-slate-300 placeholder-slate-600 pl-6 pr-2 py-1 w-36 outline-none focus:border-white/20 transition-colors" />
                    </div>
                    <div className="relative">
                      <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded text-[9px] text-slate-300 pl-2 pr-6 py-1 outline-none cursor-pointer appearance-none">
                        <option value="All Projects" className="bg-[#11151c]">All Projects</option>
                        {uniqueProjects.map((p) => <option key={p} value={p} className="bg-[#11151c]">{p}</option>)}
                      </select>
                      <ChevronDown size={8} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div data-lenis-prevent className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  <table className="w-full">
                    <thead className="sticky top-0 bg-[#11151c] z-10">
                      <tr className="border-b border-white/10">
                        {["Environment", "Project", "Variables", "Last Updated", "Updated By", "Status", ""].map((h) => (
                          <th key={h} className="px-3 py-1.5 text-left text-[8px] text-slate-500 font-medium tracking-wide uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={7} className="py-10 text-center text-slate-600 text-[10px]">No environments found.</td></tr>
                      ) : (
                        filtered.map((env) => <EnvRow key={env.id} env={env} />)
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 py-2 border-t border-white/10 shrink-0">
                  <span className="text-[8px] text-slate-500">Showing 1 to {filtered.length} of {environments.length} environments</span>
                </div>
              </div>

              {/* BOTTOM INFO STRIP */}
              <div className="bg-[#11151c] border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-200">Secure &amp; Encrypted</p>
                    <p className="text-[8px] text-slate-500 mt-0.5 max-w-xs">All environment variables are encrypted using AES-256.</p>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/10" />
                <div className="text-center px-3">
                  <p className="text-[8px] text-slate-500 mb-0.5">Variables</p>
                  <p className="text-xl font-semibold text-white leading-none">{totalVars}</p>
                  <p className="text-[7px] text-slate-500">Across all projects</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/10" />
                <div className="text-center px-3">
                  <p className="text-[8px] text-slate-500 mb-0.5">Projects Using</p>
                  <p className="text-xl font-semibold text-white leading-none">{uniqueProjects.length}</p>
                  <p className="text-[7px] text-slate-500">Out of 5 total</p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex flex-col gap-2 min-h-0">
              <div className="bg-[#11151c] border border-white/10 rounded-xl p-3 shrink-0">
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="text-xl font-medium text-slate-200">About Environments</h3>
                  <Layers size={12} className="text-slate-500" />
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed mb-3">
                  Manage different sets of environment variables for your applications.
                </p>
                <ul className="space-y-1.5">
                  {["Securely store and encrypt variables", "Scope variables to specific projects", "Switch environments during deployment", "Use in build and runtime"].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check size={9} className="text-green-400 shrink-0" />
                      <span className="text-[9px] text-slate-400">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#e8e3d0] hover:bg-[#f0ece0] text-black text-sm font-medium py-2 rounded-lg transition-colors">
                  <Plus size={14} /> Create Environment
                </button>
              </div>

              <div className="bg-[#11151c] border border-white/10 rounded-xl p-3 shrink-0 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-medium text-slate-200 mb-1.5">Need Help?</h3>
                  <p className="text-[9px] text-slate-500 leading-relaxed mb-3">
                    Learn how environments work and best practices.
                  </p>
                </div>
                <button className="flex items-center justify-center gap-1.5 text-xs text-slate-300 border border-white/10 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  View Documentation
                  <ExternalLink size={12} className="text-slate-500" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
