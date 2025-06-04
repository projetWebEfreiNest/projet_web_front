import { create } from "zustand";
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from "../models/auth";
import { authService } from "../services/authService";
import { toast } from "sonner";

export const useAuthViewModel = create<
  AuthState & {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
  }
>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success("Connexion réussie");

      window.location.href = "/dashboard";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Échec de la connexion";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success("Inscription réussie");

      window.location.href = "/dashboard";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Échec de l'inscription";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
      toast.success("Déconnexion réussie");

      window.location.href = "/auth/onboarding";
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la déconnexion";
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));
