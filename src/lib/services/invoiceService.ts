import { Client } from "urql";
import axios from "axios";
import {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  PaginatedInvoiceResponse,
} from "../models/invoice";
import {
  GET_INVOICES_QUERY,
  GET_INVOICE_QUERY,
  CREATE_INVOICE_MUTATION,
  UPDATE_INVOICE_MUTATION,
  REMOVE_INVOICE_MUTATION,
} from "../graphql/invoice";
import { API_CONFIG } from "../const";

class InvoiceService {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  private getTokenFromCookies(): string | null {
    if (typeof window === "undefined") return null;

    const cookies = document.cookie.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );

    return cookies[API_CONFIG.COOKIE_CONFIG.TOKEN_NAME] || null;
  }

  private getHeaders() {
    const token = this.getTokenFromCookies();
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  async getInvoices(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedInvoiceResponse> {
    try {
      const result = await this.client
        .query(GET_INVOICES_QUERY, {
          page,
          limit,
        })
        .toPromise();

      if (result.error) {
        throw new Error(
          result.error.message || "Erreur lors de la récupération des factures"
        );
      }

      return result.data.invoices;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  }

  async getInvoice(id: number): Promise<Invoice> {
    try {
      const result = await this.client
        .query(GET_INVOICE_QUERY, {
          id,
        })
        .toPromise();

      if (result.error) {
        throw new Error(
          result.error.message || "Erreur lors de la récupération de la facture"
        );
      }

      return result.data.invoice;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  }

  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    try {
      const result = await this.client
        .mutation(CREATE_INVOICE_MUTATION, {
          createInvoiceInput: input,
        })
        .toPromise();

      if (result.error) {
        throw new Error(
          result.error.message || "Erreur lors de la création de la facture"
        );
      }

      return result.data.createInvoice;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  }

  async createInvoiceWithFile(
    file: File,
    input: CreateInvoiceInput
  ): Promise<Invoice> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", input.name);
      formData.append("date", input.date.toISOString());
      formData.append("type", input.type);

      if (input.tagIds && input.tagIds.length > 0) {
        formData.append("tagIds", JSON.stringify(input.tagIds));
      }

      // Note: invoiceData n'est plus envoyé car généré automatiquement par OCR+LLM

      const response = await axios.post(
        `${API_CONFIG.REST_BASE_URL}/invoices`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message ||
            "Erreur lors de la création de la facture"
        );
      }
      throw new Error("Erreur de connexion au serveur");
    }
  }

  async updateInvoice(input: UpdateInvoiceInput): Promise<Invoice> {
    try {
      const result = await this.client
        .mutation(UPDATE_INVOICE_MUTATION, {
          updateInvoiceInput: input,
        })
        .toPromise();

      if (result.error) {
        throw new Error(
          result.error.message || "Erreur lors de la mise à jour de la facture"
        );
      }

      return result.data.updateInvoice;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  }

  async updateInvoiceWithFile(
    id: number,
    file: File,
    input: CreateInvoiceInput
  ): Promise<Invoice> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", input.name);
      formData.append("date", input.date.toISOString());
      formData.append("type", input.type);

      if (input.tagIds && input.tagIds.length > 0) {
        formData.append("tagIds", JSON.stringify(input.tagIds));
      }

      // Note: invoiceData n'est plus envoyé car généré automatiquement par OCR+LLM

      const response = await axios.put(
        `${API_CONFIG.REST_BASE_URL}/invoices/${id}`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message ||
            "Erreur lors de la mise à jour de la facture"
        );
      }
      throw new Error("Erreur de connexion au serveur");
    }
  }

  async deleteInvoice(id: number): Promise<boolean> {
    try {
      const result = await this.client
        .mutation(REMOVE_INVOICE_MUTATION, {
          id,
        })
        .toPromise();

      if (result.error) {
        throw new Error(
          result.error.message || "Erreur lors de la suppression de la facture"
        );
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erreur de connexion au serveur");
    }
  }
}

export const createInvoiceService = (client: Client) =>
  new InvoiceService(client);
