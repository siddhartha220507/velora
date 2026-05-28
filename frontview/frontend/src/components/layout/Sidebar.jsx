import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Grid3X3, Zap, Layers, BarChart2,
  Settings, ChevronDown, LogOut, User, Users,
  FileText, PanelLeft, Plug, Monitor, History as HistoryIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const MenuItem = ({ icon: Icon, label, to, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300
        ${isActive
          ? "bg-white text-black font-bold shadow-lg"
          : "text-[#71717a] hover:text-white hover:bg-white/[0.03] hover:translate-x-1"
        }
        ${isCollapsed ? "justify-center px-0 w-[44px] h-[44px] mx-auto" : ""}
      `}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.5} />
          {!isCollapsed && <span className="text-[13.5px] tracking-tight">{label}</span>}

          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

import WorkspaceSwitcher from "./WorkspaceSwitcher";

const Sidebar = ({ isCollapsed, toggleSidebar, navMode, toggleNavMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setHasMore(scrollHeight > scrollTop + clientHeight + 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      // Initial check after a short delay for content rendering
      const timer = setTimeout(checkScroll, 100);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        clearTimeout(timer);
      };
    }
  }, [isCollapsed]); // Re-check when collapse state changes

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (navMode === "dock") return null;

  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");

  const getPath = (base) => projectId ? `${base}?projectId=${projectId}` : base;

  const topItems = [
    { icon: LayoutDashboard, label: "Overview", to: getPath("/dashboard") },
    { icon: Grid3X3, label: "Projects", to: getPath("/projects") },
    { icon: Zap, label: "Deployments", to: getPath("/deploy") },
    { icon: Layers, label: "Environments", to: getPath("/environments") },
    { icon: Monitor, label: "Logs", to: getPath("/logs") },
    { icon: HistoryIcon, label: "History", to: getPath("/history") },
  ];

  const bottomItems = [
    { icon: Users, label: "Members", to: getPath("/members") },
    { icon: Plug, label: "Integrations", to: getPath("/integrations") },
    { icon: Settings, label: "Settings", to: getPath("/settings") },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 92 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen z-50 bg-[#161618] border-r border-white/[0.04] flex flex-col"
    >
      {/* Brand Header */}
      <div className={`h-20 flex items-center px-6 ${isCollapsed ? "justify-center" : ""}`}>
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center p-1.5 group-hover:border-white/20 transition-all shadow-elevation-1 overflow-hidden">
            <img src="/src/assets/logo-close.png" alt="Velora Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && <span className="text-[17px] font-black tracking-tighter text-white/90 group-hover:text-white transition-colors uppercase">Velora</span>}
        </NavLink>
      </div>

      {!isCollapsed && (
          <div className="mb-4">
              <WorkspaceSwitcher />
          </div>
      )}

      {/* Navigation */}
      <div className="flex-1 relative min-h-0">
        <div 
          ref={scrollRef}
          data-lenis-prevent
          className="h-full overflow-y-auto overflow-x-hidden px-4 py-2 space-y-8 scrollbar-hide"
        >
          <div>
            {!isCollapsed && <h3 className="px-4 text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.25em] mb-4">Workspace</h3>}
            <div className="space-y-1">
              {topItems.map((item) => (
                <MenuItem key={item.to} {...item} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>

          <div>
            {!isCollapsed && <h3 className="px-4 text-[10px] font-black text-[#3f3f46] uppercase tracking-[0.25em] mb-4">Account</h3>}
            <div className="space-y-1">
              {bottomItems.map((item) => (
                <MenuItem key={item.to} {...item} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator Overlay */}
        <AnimatePresence>
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#161618] to-transparent pointer-events-none flex items-end justify-center pb-2 z-10"
            >
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white/20"
              >
                <ChevronDown size={14} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 space-y-2 border-t border-white/[0.05]">
        <button
          onClick={toggleNavMode}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-[#71717a] hover:text-white hover:bg-white/[0.03]
            ${isCollapsed ? "justify-center px-0 w-[48px] h-[48px] mx-auto" : ""}
          `}
          title="Switch to Dock"
        >
          <Monitor size={18} strokeWidth={1.5} />
          {!isCollapsed && <span className="text-[13px] font-medium">Switch to Dock</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-[#71717a] hover:text-white hover:bg-white/[0.03]
            ${isCollapsed ? "justify-center px-0 w-[48px] h-[48px] mx-auto" : ""}
          `}
        >
          <PanelLeft size={18} strokeWidth={1.5} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          {!isCollapsed && <span className="text-[13px] font-medium">Collapse Sidebar</span>}
        </button>

        {/* Profile Card */}
        <div className="relative pt-2" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all rounded-2xl
              ${isCollapsed ? "justify-center p-0 w-[48px] h-[48px] mx-auto" : "p-2.5"}
            `}
          >
            {user?.avatar || user?.githubAvatarUrl || user?.googleAvatarUrl ? (
              <img
                src={user.avatar || user.githubAvatarUrl || user.googleAvatarUrl}
                className="w-8 h-8 rounded-full object-cover shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10"
                alt="Avatar"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black text-white shrink-0 relative shadow-inner"
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
            {!isCollapsed && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-bold text-white truncate">{user?.name || "User"}</p>
                <p className="text-[11px] text-[#52525b] truncate">{user?.email || "No email"}</p>
              </div>
            )}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute bottom-full mb-3 z-50 bg-[#111113] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden
                  ${isCollapsed ? "left-14 w-48" : "left-0 right-0"}`}
              >
                <div className="p-1.5 space-y-0.5">
                  <button onClick={() => { setDropdownOpen(false); navigate("/account"); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-[#a1a1aa] hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors">
                    <User size={16} /> Profile
                  </button>
                  <button onClick={() => { setDropdownOpen(false); logout(); navigate("/login"); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl transition-colors">
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;