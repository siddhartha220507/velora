import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Grid3X3, Zap, Layers,
  Settings, Users, Plug, Monitor
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * Dock — macOS style bottom navigation bar.
 * Visible only when navMode === "dock".
 */
const Dock = ({ navMode, toggleNavMode }) => {
  if (navMode !== "dock") return null;

  const queryParams = new URLSearchParams(window.location.search);
  const projectId = queryParams.get("projectId");

  const getPath = (base) => projectId ? `${base}?projectId=${projectId}` : base;

  const items = [
    { icon: LayoutDashboard, label: "Overview", to: getPath("/dashboard") },
    { icon: Grid3X3, label: "Apps", to: getPath("/applications") },
    { icon: Zap, label: "Deploys", to: getPath("/deploy") },
    { icon: Layers, label: "Env", to: getPath("/environments") },
    { icon: Users, label: "Members", to: getPath("/members") },
    { icon: Plug, label: "Plugins", to: getPath("/integrations") },
    { icon: Settings, label: "Settings", to: getPath("/settings") },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-end gap-1.5 p-2 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              group relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
              ${isActive ? "bg-white/[0.08] text-white" : "text-[#71717a] hover:bg-white/[0.05] hover:text-white hover:-translate-y-1.5"}
            `}
          >
            <item.icon size={20} strokeWidth={1.5} />
            
            {/* Tooltip — Dot Matrix Vibe */}
            <span className="absolute bottom-full mb-6 px-3 py-1.5 rounded-full bg-white text-black text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl translate-y-2 group-hover:translate-y-0">
              {item.label}
            </span>

            {/* Active Indicator — Nothing Red Dot */}
            <div className={`absolute -bottom-1.5 w-1 h-1 rounded-full bg-[#ff3b30] transition-all duration-300 ${items.find(i => i.to === item.to) && window.location.pathname === item.to ? "opacity-100 scale-100" : "opacity-0 scale-0"}`} />
          </NavLink>
        ))}

        <div className="w-[1px] h-6 bg-white/[0.1] mx-2 self-center" />

        <button
          onClick={toggleNavMode}
          className="flex items-center justify-center w-12 h-12 rounded-2xl text-[#52525b] hover:bg-white/[0.05] hover:text-white transition-all duration-300 hover:-translate-y-1.5"
          title="Switch to Sidebar"
        >
          <Monitor size={20} strokeWidth={1.5} />
        </button>
      </motion.div>
    </div>
  );
};

export default Dock;
