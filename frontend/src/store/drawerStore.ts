import { create } from 'zustand';

interface DrawerState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
  close: () => set({ open: false }),
}));
