import React from "react";

const FloatingCard = ({ children, className = "", ...props }) => (
  <div
    className={`bg-[#111113] border border-white/[0.06] rounded-xl transition-all duration-150 hover:border-white/[0.10] ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default FloatingCard;