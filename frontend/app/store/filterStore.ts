import { create } from "zustand";

interface FilterStore {
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  selectedCategories: [],
  toggleCategory: (category) =>
    set((state) => {
      const exists = state.selectedCategories.includes(category);
      return {
        selectedCategories: exists
          ? state.selectedCategories.filter((c) => c !== category)
          : [...state.selectedCategories, category],
      };
    }),
  clearFilters: () => set({ selectedCategories: [] }),
}));
