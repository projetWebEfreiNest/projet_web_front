"use client";

import { Badge } from "@/components/ui/badge";
import { Invoice, InvoiceStatus, getInvoiceStatus } from "@/lib/models/invoice";
import { Loader2, CheckCircle, Upload, XCircle } from "lucide-react";

interface InvoiceStatusBadgeProps {
  invoice: Invoice;
  showIcon?: boolean;
  className?: string;
}

export function InvoiceStatusBadge({
  invoice,
  showIcon = true,
  className = "",
}: InvoiceStatusBadgeProps) {
  const status = getInvoiceStatus(invoice);

  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.UPLOADED:
        return {
          label: "Uploadé",
          variant: "secondary" as const,
          icon: Upload,
          className: "bg-gray-100 text-gray-800",
        };
      case InvoiceStatus.PROCESSING:
        return {
          label: "En cours de traitement...",
          variant: "secondary" as const,
          icon: Loader2,
          className: "bg-yellow-100 text-yellow-800",
        };
      case InvoiceStatus.COMPLETED:
        return {
          label: "Traité",
          variant: "default" as const,
          icon: CheckCircle,
          className: "bg-green-100 text-green-800",
        };
      case InvoiceStatus.ERROR:
        return {
          label: "Erreur",
          variant: "destructive" as const,
          icon: XCircle,
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          label: "Inconnu",
          variant: "secondary" as const,
          icon: XCircle,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {showIcon && (
        <Icon
          className={`h-3 w-3 mr-1 ${
            status === InvoiceStatus.PROCESSING ? "animate-spin" : ""
          }`}
        />
      )}
      {config.label}
    </Badge>
  );
}
