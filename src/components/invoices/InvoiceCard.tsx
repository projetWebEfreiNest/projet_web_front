"use client";

import { Invoice } from "@/lib/models/invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

interface InvoiceCardProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: number) => void;
  onDownload?: (invoice: Invoice) => void;
}

export function InvoiceCard({
  invoice,
  onView,
  onEdit,
  onDelete,
  onDownload,
}: InvoiceCardProps) {
  const totalAmount =
    invoice.invoiceData?.reduce((sum, data) => sum + data.amount, 0) || 0;

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR");
  };

  const getTypeColor = (type: string) => {
    return type === "EMIS"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };

  const getTypeLabel = (type: string) => {
    return type === "EMIS" ? "Émise" : "Reçue";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{invoice.name}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getTypeColor(invoice.type)}>
                {getTypeLabel(invoice.type)}
              </Badge>
              <InvoiceStatusBadge invoice={invoice} />
              {invoice.filePath && (
                <Badge variant="outline">Fichier joint</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">
              {totalAmount.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(invoice.date)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {invoice.invoiceData && invoice.invoiceData.length > 0 ? (
          <div className="space-y-1 mb-4">
            {invoice.invoiceData.slice(0, 2).map((data) => (
              <div key={data.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate">
                  {data.content}
                </span>
                <span className="font-medium">
                  {data.amount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            ))}
            {invoice.invoiceData.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{invoice.invoiceData.length - 2} autre(s) élément(s)
              </p>
            )}
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              📄 Traitement automatique en cours... Les données de facturation
              seront extraites par notre IA.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Créée{" "}
            {formatDistanceToNow(new Date(invoice.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </p>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onView(invoice)}>
              <Eye className="h-4 w-4" />
            </Button>

            {invoice.filePath && onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(invoice)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => onEdit(invoice)}>
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(invoice.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
