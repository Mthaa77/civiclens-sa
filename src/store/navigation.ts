// CivicLens SA — Navigation Store (Zustand)
// Manages client-side module navigation since we only have / route

import { create } from 'zustand';
import type { ModuleId } from '@/types';

interface NavigationState {
  activeModule: ModuleId;
  activeSubModule: string | null;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isAuthenticated: boolean;
  setActiveModule: (module: ModuleId) => void;
  setActiveSubModule: (sub: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setAuthenticated: (auth: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeModule: 'dashboard',
  activeSubModule: null,
  sidebarOpen: true,
  sidebarCollapsed: false,
  isAuthenticated: false,
  setActiveModule: (module) => set({ activeModule: module, activeSubModule: null }),
  setActiveSubModule: (sub) => set({ activeSubModule: sub }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
}));
