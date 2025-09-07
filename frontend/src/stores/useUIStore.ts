// src/stores/useUIStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  rightDockOpen: boolean;
  openDock: () => void;
  closeDock: () => void;
  toggleDock: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      rightDockOpen: false,
      openDock: () => set({ rightDockOpen: true }),
      closeDock: () => set({ rightDockOpen: false }),
      toggleDock: () => set((s) => ({ rightDockOpen: !s.rightDockOpen })),
    }),
    { name: "ui-store" } // 로컬스토리지에 유지
  )
);
