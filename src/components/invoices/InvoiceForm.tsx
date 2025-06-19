"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { CreateInvoiceInput, Invoice } from "@/lib/models/invoice";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
const invoiceSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  date: z.string().min(1, "La date est requise"),
  type: z.enum(["EMIS", "RECUS"], { required_error: "Le type est requis" }),
});
type InvoiceFormData = z.infer<typeof invoiceSchema>;
interface InvoiceFormProps {
  invoice?: Invoice;
  onSubmit: (data: CreateInvoiceInput, file?: File) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
export function InvoiceForm({
  invoice,
  onSubmit,
  onCancel,
  isLoading,
}: InvoiceFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      name: invoice?.name || "",
      date: invoice?.date
        ? new Date(invoice.date).toISOString().split("T")[0]
        : "",
      type: invoice?.type || "EMIS",
    },
  });
  useEffect(() => {
    if (invoice) {
      setValue("name", invoice.name);
      setValue("type", invoice.type);
      setValue("date", new Date(invoice.date).toISOString().split("T")[0]);
    }
  }, [invoice, setValue]);
  const handleFormSubmit = async (data: InvoiceFormData) => {
    const formattedData: CreateInvoiceInput = {
      name: data.name,
      date: new Date(data.date),
      type: data.type,
    };
    await onSubmit(formattedData, selectedFile || undefined);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <CardTitle>
            {" "}
            {invoice ? "Modifier la facture" : "Nouvelle facture"}{" "}
          </CardTitle>{" "}
          {invoice && (
            <div className="flex items-center gap-2">
              {" "}
              <span className="text-sm text-muted-foreground">
                Statut:
              </span>{" "}
              <InvoiceStatusBadge invoice={invoice} />{" "}
            </div>
          )}{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {" "}
            <div className="space-y-4">
              {" "}
              <div>
                {" "}
                <Label htmlFor="name">Nom de la facture</Label>{" "}
                <Input
                  id="name"
                  placeholder="Ex: Facture Client ABC"
                  {...register("name")}
                />{" "}
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {" "}
                    {errors.name.message}{" "}
                  </p>
                )}{" "}
              </div>{" "}
              <div>
                {" "}
                <Label htmlFor="date">Date de la facture</Label>{" "}
                <Input id="date" type="date" {...register("date")} />{" "}
                {errors.date && (
                  <p className="text-sm text-red-600 mt-1">
                    {" "}
                    {errors.date.message}{" "}
                  </p>
                )}{" "}
              </div>{" "}
              <div>
                {" "}
                <Label htmlFor="type">Type de facture</Label>{" "}
                <Select
                  value={watch("type")}
                  onValueChange={(value) =>
                    setValue("type", value as "EMIS" | "RECUS")
                  }
                >
                  {" "}
                  <SelectTrigger>
                    {" "}
                    <SelectValue placeholder="Sélectionnez le type" />{" "}
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    <SelectItem value="EMIS">Facture émise</SelectItem>{" "}
                    <SelectItem value="RECUS">Facture reçue</SelectItem>{" "}
                  </SelectContent>{" "}
                </Select>{" "}
                {errors.type && (
                  <p className="text-sm text-red-600 mt-1">
                    {" "}
                    {errors.type.message}{" "}
                  </p>
                )}{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <Label>Fichier de la facture</Label>{" "}
              <FileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />{" "}
              <p className="text-sm text-muted-foreground mt-2">
                {" "}
                📄 Uploadez votre facture pour extraction automatique des
                données par IA{" "}
              </p>{" "}
            </div>{" "}
            {invoice?.invoiceData && invoice.invoiceData.length > 0 && (
              <Card>
                {" "}
                <CardHeader>
                  {" "}
                  <CardTitle className="text-lg">
                    {" "}
                    Données extraites automatiquement{" "}
                  </CardTitle>{" "}
                  <p className="text-sm text-muted-foreground">
                    {" "}
                    Ces données ont été extraites de votre fichier par notre
                    IA{" "}
                  </p>{" "}
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  <div className="space-y-3">
                    {" "}
                    {invoice.invoiceData.map((data, index) => (
                      <div
                        key={data.id || index}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                      >
                        {" "}
                        <span className="font-medium">{data.content}</span>{" "}
                        <span className="text-lg font-semibold">
                          {" "}
                          {data.amount.toFixed(2)} €{" "}
                        </span>{" "}
                      </div>
                    ))}{" "}
                    <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
                      {" "}
                      <span>Total</span>{" "}
                      <span>
                        {" "}
                        {invoice.invoiceData
                          .reduce((sum, data) => sum + data.amount, 0)
                          .toFixed(2)}{" "}
                        €{" "}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                </CardContent>{" "}
              </Card>
            )}{" "}
            <div className="flex gap-4 pt-4">
              {" "}
              <Button type="submit" disabled={isLoading} className="flex-1">
                {" "}
                {isLoading
                  ? "Traitement en cours..."
                  : invoice
                    ? "Modifier"
                    : "Créer"}{" "}
              </Button>{" "}
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                {" "}
                Annuler{" "}
              </Button>{" "}
            </div>{" "}
          </form>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
