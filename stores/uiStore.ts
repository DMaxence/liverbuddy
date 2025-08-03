import { AppLanguage } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getDeviceLanguage } from "@/constants/localization";

interface SettingsState {
  language: AppLanguage;
  accurate: boolean; // For calculation method (test setting, not stored in DB)
}

interface SettingsActions {
  setLanguage: (language: SettingsState["language"]) => void;
  setAccurate: (accurate: boolean) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      // Initial state
      language: getDeviceLanguage(),
      accurate: false, // Default to simple calculations

      // Actions
      setLanguage: (language) => set({ language }),
      setAccurate: (accurate) => set({ accurate }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Computed selectors
export const useLanguage = () => useSettingsStore((state) => state.language);
export const useSetLanguage = () =>
  useSettingsStore((state) => state.setLanguage);
export const useAccurate = () => useSettingsStore((state) => state.accurate);
export const useSetAccurate = () =>
  useSettingsStore((state) => state.setAccurate);
