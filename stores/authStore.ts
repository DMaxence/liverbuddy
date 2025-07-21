import { User } from "@/types";
import { Database } from "@/types/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  updateUser: (userUpdates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // State
      user: null,
      session: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      updateUser: (userUpdates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } as User : null,
        })),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearAuth: () => set({ user: null, session: null, error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Computed selectors
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useUser = () => useAuthStore((state) => state.user);
export const useUpdateUser = () => useAuthStore((state) => state.updateUser);
