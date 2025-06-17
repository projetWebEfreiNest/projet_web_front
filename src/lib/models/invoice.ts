export interface Invoice {
  id: number;
  name: string;
  filePath?: string;
  createdAt: Date;
  date: Date;
  type: "EMIS" | "RECUS";
  userId: number;
  invoiceData?: InvoiceData[]; // Ajoutées de manière asynchrone par LLM
}

export interface InvoiceData {
  id: number;
  content: string; // Description générée par LLM
  amount: number; // Montant extrait par LLM
  invoiceId: number;
}

export interface CreateInvoiceInput {
  name: string;
  date: Date;
  type: "EMIS" | "RECUS";
  tagIds?: number[]; // Tags optionnels
  // Note: invoiceData n'est plus fourni à la création, généré par OCR+LLM
}

export interface UpdateInvoiceInput extends CreateInvoiceInput {
  id: number;
}

export interface PaginatedInvoiceResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// États de traitement des factures
export enum InvoiceStatus {
  UPLOADED = "UPLOADED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR", // Erreur dans le workflow
}

// Helper pour déterminer le statut d'une facture
export const getInvoiceStatus = (invoice: Invoice): InvoiceStatus => {
  if (!invoice.filePath) return InvoiceStatus.UPLOADED;
  if (!invoice.invoiceData || invoice.invoiceData.length === 0) {
    return InvoiceStatus.PROCESSING;
  }
  return InvoiceStatus.COMPLETED;
};
