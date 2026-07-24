import { create } from 'zustand';

interface DashboardState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  closeSidebar: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));
