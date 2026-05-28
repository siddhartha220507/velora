import React from "react";

export default function InputField({
  label,
  icon: Icon,
  error,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-[12px] font-medium text-[#a1a1aa]">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]">
            <Icon size={14} />
          </span>
        )}
        <input
          className={`input-premium w-full h-9 text-[13px] px-3 ${Icon ? "pl-9" : ""} ${error ? "border-[#ef4444]/40 focus:border-[#ef4444]" : ""
            } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-[#ef4444]">{error}</p>}
    </div>
  );
}