import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  unreadMessages: number;
  setUnreadMessages: (n: number) => void;
  currentUser: { name: string; role: string; avatar: string };
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  unreadMessages: 3,
  setUnreadMessages: (n) => set({ unreadMessages: n }),
  currentUser: { name: '李明', role: '值班调度员', avatar: 'LM' },
}));
