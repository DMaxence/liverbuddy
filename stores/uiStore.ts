import { AppLanguage } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getDeviceLanguage } from "@/constants/localization";

interface SettingsState {
  language: AppLanguage;
}

interface SettingsActions {
  setLanguage: (language: SettingsState["language"]) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      // Initial state
      language: getDeviceLanguage(),

      // Actions
      setLanguage: (language) => set({ language }),
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
