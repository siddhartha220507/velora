/**
 * Returns the margin-left style for .page-content based on sidebar state.
 * No CSS required — applied as inline style so index.css is not needed.
 *
 * Widths must match Sidebar.jsx floating container + margins:
 * expanded = 260px (228 width + 16 left + 16 right)
 * collapsed = 92px (68 width + 12 left + 12 right)
 */
export function useSidebarAttr(navMode, isCollapsed) {
  if (navMode === "dock") return "dock";
  if (isCollapsed)        return "collapsed";
  return "expanded";
}

/**
 * Returns an inline style object { marginLeft } for the page-content wrapper.
 * Use this instead of the CSS data-attribute approach.
 */
export function useSidebarStyle(navMode, isCollapsed) {
  if (navMode === "dock") return { marginLeft: 0, paddingBottom: "80px" };
  if (isCollapsed)        return { marginLeft: "92px" };
  return                         { marginLeft: "260px" };
}
