import React from "react";

const GlassButton = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  ...props
}) => {
  const base =
    "relative inline-flex items-center justify-center gap-2 px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-[#22c55e] text-black hover:opacity-90 active:scale-[0.98] font-semibold",
    secondary:
      "bg-transparent text-white border border-white/10 hover:bg-white/[0.06] hover:border-white/[0.16] active:scale-[0.98]",
    danger:
      "bg-transparent text-[#ef4444] border border-[#ef4444]/20 hover:bg-[#ef4444]/[0.06] hover:border-[#ef4444]/40 active:scale-[0.98]",
    ghost:
      "bg-transparent text-[#71717a] hover:text-white hover:bg-white/[0.04] active:scale-[0.98]",
    outline:
      "bg-transparent text-white border border-white/10 hover:bg-white/[0.06] active:scale-[0.98]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlassButton;