import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: localStorage.getItem("authorization"),
      user: null,
      isAuthenticated: !!localStorage.getItem("authorization"),
      isLoading: false,
      error: null,

      // Actions
      setToken: (token) => {
        localStorage.setItem("authorization", token);
        set({ token, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      login: (token, user) => {
        localStorage.setItem("authorization", token);
        set({
          token,
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        localStorage.removeItem("authorization");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: "auth-storage",
    }
  )
);
