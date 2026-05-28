export default function PageWrapper({ navMode, isCollapsed, children }) {
  const sidebarClass =
    navMode === "dock"
      ? "md:ml-0 pb-20 md:pb-24"
      : isCollapsed
        ? "md:ml-[92px] pb-20 md:pb-0"
        : "md:ml-[260px] pb-20 md:pb-0";

  return (
    <div
      className={`flex flex-col flex-1 min-w-0 relative z-10 transition-[margin] duration-200 ${sidebarClass}`}
    >
      {children}
    </div>
  );
}
