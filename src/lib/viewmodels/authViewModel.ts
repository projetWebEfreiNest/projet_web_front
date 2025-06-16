import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from "../models/auth";
import { createAuthService } from "../services/authService";
import { toast } from "sonner";
import { getUrqlClient } from "../urql/client";
import { API_CONFIG } from "../const";

const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const useAuthViewModel = create<
  AuthState & {
    login: (credentials: LoginCredentials, router?: any) => Promise<void>;
    register: (credentials: RegisterCredentials, router?: any) => Promise<void>;
    logout: (router?: any) => Promise<void>;
    clearError: () => void;
    initializeAuth: () => void;
  }
>()(
  persist(
    (set, _get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,

      login: async (credentials, router) => {
        set({ isLoading: true, error: null });
        try {
          const client = getUrqlClient();
          const authService = createAuthService(client);
          const token = await authService.login(credentials);

          setCookie(
            API_CONFIG.COOKIE_CONFIG.TOKEN_NAME,
            token,
            credentials.rememberMe
              ? API_CONFIG.COOKIE_CONFIG.REMEMBER_ME_EXPIRY_DAYS
              : API_CONFIG.COOKIE_CONFIG.DEFAULT_EXPIRY_DAYS
          );
          set({
            token,
            isAuthenticated: true,
            isLoading: false,
            user: null,
          });

          toast.success("Connexion réussie");

          if (router) {
            router.push("/");
          } else {
            window.location.href = "/";
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Échec de la connexion";
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },

      register: async (credentials, router) => {
        set({ isLoading: true, error: null });
        try {
          const client = getUrqlClient();
          const authService = createAuthService(client);
          const token = await authService.register(credentials);

          setCookie(
            API_CONFIG.COOKIE_CONFIG.TOKEN_NAME,
            token,
            API_CONFIG.COOKIE_CONFIG.DEFAULT_EXPIRY_DAYS
          );
          set({
            token,
            isAuthenticated: true,
            isLoading: false,
            user: null,
          });

          toast.success("Inscription réussie");

          if (router) {
            router.push("/");
          } else {
            window.location.href = "/";
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Échec de l'inscription";
          set({ isLoading: false, error: errorMessage });
          toast.error(errorMessage);
        }
      },

      logout: async (router) => {
        set({ isLoading: true });
        try {
          const client = getUrqlClient();
          const authService = createAuthService(client);
          await authService.logout();

          deleteCookie(API_CONFIG.COOKIE_CONFIG.TOKEN_NAME);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null,
          });

          toast.success("Déconnexion réussie");

          if (router) {
            router.push("/onboarding");
          } else {
            window.location.href = "/onboarding";
          }
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

      initializeAuth: () => {
        if (typeof window !== "undefined") {
          const cookies = document.cookie.split(";").reduce(
            (acc, cookie) => {
              const [key, value] = cookie.trim().split("=");
              acc[key] = value;
              return acc;
            },
            {} as Record<string, string>
          );

          const token = cookies[API_CONFIG.COOKIE_CONFIG.TOKEN_NAME];
          if (token) {
            set({
              token,
              isAuthenticated: true,
              user: null,
            });
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
