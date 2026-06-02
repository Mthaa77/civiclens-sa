// CivicLens SA — TenderLens Filter Store (Zustand)

import { create } from 'zustand';
import type { TenderFilters } from '@/types';

interface TenderFilterState {
  filters: TenderFilters;
  setFilters: (filters: Partial<TenderFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: TenderFilters = {
  search: '',
  province: '',
  category: '',
  status: '',
  valueRange: [0, 10_000_000_000],
  closingWindow: '',
  bbbeeLevel: '',
};

export const useTenderFilterStore = create<TenderFilterState>((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
