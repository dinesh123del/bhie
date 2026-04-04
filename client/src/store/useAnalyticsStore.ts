import { create } from 'zustand';

export interface AnalyticsFilters {
  range: 7 | 30 | 90;
  category?: string;
  businessId?: string;
}

interface AnalyticsState {
  filters: AnalyticsFilters;
  setRange: (range: 7 | 30 | 90) => void;
  setCategory: (category: string | undefined) => void;
  isDashboardRealtime: boolean;
  toggleRealtime: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  filters: { range: 30 },
  setRange: (range) => set((state) => ({ filters: { ...state.filters, range } })),
  setCategory: (category) => set((state) => ({ filters: { ...state.filters, category } })),
  isDashboardRealtime: true,
  toggleRealtime: () => set((state) => ({ isDashboardRealtime: !state.isDashboardRealtime })),
}));
