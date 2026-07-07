// src/stores/auth.store.ts
import type { UserRole } from "@/shared/types";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export interface AuthState {
  accessToken: string | null;
  role: UserRole | null;
}
export interface AuthActions {
  setAuth: (payload: { accessToken: string; role: UserRole | null }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        role: null,
        setAuth: ({ accessToken, role }) => set({ accessToken, role }),
        clearAuth: () => set({ accessToken: null, role: null }),
      }),
      {
        name: "VNZ_Challenge",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);
