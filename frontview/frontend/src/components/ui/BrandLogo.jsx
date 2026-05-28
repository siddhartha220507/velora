import React from "react";
import { Link } from "react-router-dom";

export default function BrandLogo({
  to = "/dashboard",
  compact = false,
  className = "",
  textClassName = "",
  iconClassName = "",
}) {
  return (
    <Link to={to} className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`w-8 h-8 flex items-center justify-center ${iconClassName}`}>
        <svg viewBox="0 0 40 40" className="w-full h-full fill-[#a3e635]">
          <path d="M20 5L5 15V25L20 35L35 25V15L20 5ZM18 28L10 20L12 18L18 24L28 14L30 16L18 28Z" />
        </svg>
      </div>
      {!compact && (
        <span
          className={`text-white font-bold tracking-widest uppercase ${textClassName}`}
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "14px" }}
        >
          Velora
        </span>
      )}
    </Link>
  );
}
