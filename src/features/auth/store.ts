// src/stores/auth.store.ts
import type { UserRole } from "@/shared/types";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export interface AuthState {
  accessToken: string | null;
  role: UserRole | null; //lưu access & refresh token vào store để các component khác có thể truy cập dễ dàng
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
        // Actions
        setAuth: ({ accessToken, role }) => set({ accessToken, role }),
        clearAuth: () => set({ accessToken: null, role: null }),
      }),
      {
        name: "VNZ_Challenge", // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      },
    ),
  ),
);
