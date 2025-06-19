import { Client } from "urql";
import { LoginCredentials, RegisterCredentials } from "../models/auth";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "../graphql/auth";

class AuthService {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const result = await this.client
        .mutation(LOGIN_MUTATION, {
          email: credentials.email,
          password: credentials.password,
        })
        .toPromise();

      if (result.error) {
        throw new Error(result.error.message || "Échec de la connexion");
      }

      if (!result.data?.login) {
        throw new Error("Aucun token reçu du serveur");
      }

      return result.data.login;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  }

  async register(credentials: RegisterCredentials): Promise<string> {
    try {
      const createUserInput = {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      };

      const result = await this.client
        .mutation(REGISTER_MUTATION, {
          createUserInput,
        })
        .toPromise();

      if (result.error) {
        throw new Error(result.error.message || "Échec de l'inscription");
      }

      if (!result.data?.createUser?.access_token) {
        throw new Error("Aucun token reçu du serveur");
      }

      return result.data.createUser.access_token;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  }

  async logout(): Promise<void> {
    try {
      return Promise.resolve();
    } catch {
      throw new Error("Erreur lors de la déconnexion");
    }
  }
}

export const createAuthService = (client: Client) => new AuthService(client);
