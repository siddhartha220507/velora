import React from 'react';

export default function CyberButton({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon: Icon,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-5 py-3 text-[10px] md:text-xs font-bold uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2";
  
  const variants = {
    primary: "bg-valora-yellow text-black border-black shadow-[4px_4px_0px_0px_#CC9900] hover:bg-yellow-400",
    secondary: "bg-valora-cyan text-black border-black shadow-[4px_4px_0px_0px_#009999] hover:bg-[#33ffcc]",
    outline: "bg-black/40 backdrop-blur-sm text-gray-300 border-gray-700 hover:bg-gray-800 shadow-[4px_4px_0px_0px_#222222]",
    danger: "bg-valora-red text-white border-black shadow-[4px_4px_0px_0px_#990000] hover:bg-red-500",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={14} strokeWidth={3} />}
      {children}
    </button>
  );
}
