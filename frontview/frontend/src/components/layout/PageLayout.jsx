import React from "react";

export const PageShell = ({ children }) => (
  <div data-lenis-prevent className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
    <div className="p-8 max-w-[1280px] mx-auto pb-20">
      {children}
    </div>
  </div>
);

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex items-start justify-between mb-8 pb-5 border-b border-white/[0.04]">
    <div>
      <h1 className="text-[22px] font-black tracking-tighter text-[#e4e4e7] leading-tight uppercase">{title}</h1>
      {subtitle && <p className="text-[11px] text-[#52525b] font-black uppercase tracking-[0.2em] mt-1.5">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-3 mt-1">{children}</div>}
  </div>
);

/* The Magic Smooth Card */
export const Card = ({ children, className = "", noPad = false, onClick }) => (
  <div
    onClick={onClick}
    className={`
      bg-[#0a0a0c]/60 backdrop-blur-3xl border border-white/[0.03] rounded-[28px]
      transition-all duration-500 ease-out shadow-[0_8px_32px_rgba(0,0,0,0.4)]
      ${onClick ? "cursor-pointer hover:border-white/[0.08] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:bg-[#0f0f13]/80" : ""}
      ${className}
    `}
  >
    {children}
  </div>
);

export const CardHeader = ({ icon: Icon, title, children }) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.03] bg-[#161618]">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-7 h-7 rounded-lg bg-[#0d0d0f] border border-white/[0.04] flex items-center justify-center shrink-0">
          <Icon size={14} className="text-[#52525b]" />
        </div>
      )}
      <p className="text-[11px] font-black tracking-[0.1em] text-[#a1a1aa] uppercase">{title}</p>
    </div>
    {children && <div className="flex items-center gap-2.5">{children}</div>}
  </div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={`px-6 py-5 ${className}`}>{children}</div>
);

export const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-medium text-[#71717a] uppercase tracking-widest select-none mb-4">
    {children}
  </p>
);

export const TableHead = ({ cols }) => (
  <thead>
    <tr className="border-b border-white/[0.03] bg-[#161618]">
      {cols.map((c) => (
        <th key={c} className="px-6 py-3 text-left text-[10px] font-black text-[#52525b] uppercase tracking-[0.2em]">
          {c}
        </th>
      ))}
    </tr>
  </thead>
);

export const EmptyState = ({ icon: Icon, title, subtitle, children }) => (
  <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-[20px] bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-6 shadow-sm">
        <Icon size={24} className="text-[#a1a1aa]" />
      </div>
    )}
    <p className="text-[16px] font-semibold text-white mb-2 tracking-tight">{title}</p>
    {subtitle && <p className="text-[14px] text-[#8a8f98] mb-8 max-w-sm leading-relaxed">{subtitle}</p>}
    {children}
  </div>
);

export const AlertBanner = ({ type = "success", children }) => {
  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    info: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  };
  return (
    <div className={`px-5 py-4 rounded-[16px] border text-[13px] font-medium flex items-center gap-3 mb-6 transition-all ${styles[type]}`}>
      {children}
    </div>
  );
};

export const Badge = ({ children, className = "" }) => (
  <span className={`px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[11px] font-medium text-[#a1a1aa] ${className}`}>
    {children}
  </span>
);