import { create } from "zustand";

interface BreadcrumbsState {
  overrides: Record<string, string>;
  setOverride: (segment: string, label: string) => void;
  clearOverride: (segment: string) => void;
}

export const useBreadcrumbStore = create<BreadcrumbsState>((set) => ({
  overrides: {},
  setOverride: (segment, label) =>
    set((state) => ({ overrides: { ...state.overrides, [segment]: label } })),
  clearOverride: (segment) =>
    set((state) => {
      const newOverrides = { ...state.overrides };
      delete newOverrides[segment];
      return { overrides: newOverrides };
    }),
}));
