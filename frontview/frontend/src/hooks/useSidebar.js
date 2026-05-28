import { useSidebar as useSidebarContext } from "../context/SidebarContext";

/**
 * Re-exporting useSidebar from the context provider to maintain 
 * compatibility with all existing page imports.
 */
export function useSidebar() {
  return useSidebarContext();
}
