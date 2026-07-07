// src/stores/auth.store.ts
import type { UserRole } from "@/shared/types";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export interface AuthState {
  accessToken: string | null;
  role: UserRole | null;
  _hydrated?: boolean; // Track hydrate status
}
export interface AuthActions {
  setAuth: (payload: { accessToken: string; role: UserRole | null }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set, get) => ({
        accessToken: null,
        role: null,
        _hydrated: false,
        setAuth: ({ accessToken, role }) => {
          // console.log(
          //   "[Auth Store] Setting token:",
          //   accessToken?.substring(0, 20) + "...",
          // );
          set({ accessToken, role, _hydrated: true });
        },
        clearAuth: () => {
          // console.log("[Auth Store] Clearing auth");
          set({ accessToken: null, role: null, _hydrated: true });
        },
      }),
      {
        name: "VNZ_Challenge",
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          // console.log("[Auth Store] Rehydration completed");
          // if (state) {
          //   state._hydrated = true;
          //   console.log(
          //     "[Auth Store] Hydrated with token:",
          //     !!state.accessToken,
          //     "role:",
          //     state.role,
          //   );
          // }
        },
      },
    ),
  ),
);
