import React from "react";

const STATUS_MAP = {
  SUCCESS: { cls: "badge-green", dot: "bg-[#22c55e]", label: "Ready" },
  READY: { cls: "badge-green", dot: "bg-[#22c55e]", label: "Ready" },
  RUNNING: { cls: "badge-green", dot: "bg-[#22c55e] animate-pulse", label: "Running" },
  BUILDING: { cls: "badge-yellow", dot: "bg-[#eab308] animate-pulse", label: "Building" },
  FAILED: { cls: "badge-red", dot: "bg-[#ef4444]", label: "Failed" },
  ERROR: { cls: "badge-red", dot: "bg-[#ef4444]", label: "Error" },
  QUEUED: { cls: "badge-muted", dot: "bg-[#71717a]", label: "Queued" },
  PENDING: { cls: "badge-muted", dot: "bg-[#71717a]", label: "Pending" },
  ACTIVE: { cls: "badge-green", dot: "bg-[#22c55e]", label: "Active" },
  INACTIVE: { cls: "badge-muted", dot: "bg-[#71717a]", label: "Inactive" },
  OFFLINE: { cls: "badge-muted", dot: "bg-[#71717a]", label: "Offline" },
  ONLINE: { cls: "badge-green", dot: "bg-[#22c55e]", label: "Online" },
};

export default function StatusBadge({ status = "QUEUED", label }) {
  const key = (status || "").toUpperCase();
  const cfg = STATUS_MAP[key] || STATUS_MAP.QUEUED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {label || cfg.label}
    </span>
  );
}