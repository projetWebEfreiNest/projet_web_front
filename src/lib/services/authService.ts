import axios from "axios";
import { LoginCredentials, RegisterCredentials, User } from "../models/auth";
import { API_URL } from "../const";

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Échec de la connexion");
      }
      throw new Error("Erreur de connexion au serveur");
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/register`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Échec de l'inscription"
        );
      }
      throw new Error("Erreur de connexion au serveur");
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/logout`);
      return;
    } catch (error) {
      throw new Error("Erreur lors de la déconnexion");
    }
  },
};
