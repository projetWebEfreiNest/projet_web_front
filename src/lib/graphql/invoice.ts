import { gql } from "urql";

export const GET_INVOICES_QUERY = gql`
  query GetInvoices($page: Int = 1, $limit: Int = 10) {
    invoices(page: $page, limit: $limit) {
      invoices {
        id
        name
        filePath
        createdAt
        date
        type
        invoiceData {
          id
          content
          amount
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_INVOICE_QUERY = gql`
  query GetInvoice($id: Int!) {
    invoice(id: $id) {
      id
      name
      filePath
      createdAt
      date
      type
      invoiceData {
        id
        content
        amount
      }
    }
  }
`;

export const CREATE_INVOICE_MUTATION = gql`
  mutation CreateInvoice($createInvoiceInput: CreateInvoiceInput!) {
    createInvoice(createInvoiceInput: $createInvoiceInput) {
      id
      name
      filePath
      createdAt
      date
      type
    }
  }
`;

export const UPDATE_INVOICE_MUTATION = gql`
  mutation UpdateInvoice($updateInvoiceInput: UpdateInvoiceInput!) {
    updateInvoice(updateInvoiceInput: $updateInvoiceInput) {
      id
      name
      filePath
      createdAt
      date
      type
    }
  }
`;

export const REMOVE_INVOICE_MUTATION = gql`
  mutation RemoveInvoice($id: Int!) {
    removeInvoice(id: $id)
  }
`;
