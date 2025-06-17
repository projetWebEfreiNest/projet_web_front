"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";
import { CreateInvoiceInput, Invoice } from "@/lib/models/invoice";

const invoiceSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  date: z.string().min(1, "La date est requise"),
  type: z.enum(["EMIS", "RECUS"], {
    required_error: "Le type est requis",
  }),
  tagIds: z.array(z.number()).optional(),
  // Note: invoiceData supprimé car généré automatiquement par OCR+LLM
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
  isLoading = false,
}: InvoiceFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      name: invoice?.name || "",
      date: invoice?.date
        ? new Date(invoice.date).toISOString().split("T")[0]
        : "",
      type: invoice?.type || "EMIS",
      invoiceData: invoice?.invoiceData || [{ content: "", amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoiceData",
  });

  const watchedType = watch("type");

  useEffect(() => {
    if (invoice) {
      setValue("name", invoice.name);
      setValue("date", new Date(invoice.date).toISOString().split("T")[0]);
      setValue("type", invoice.type);
      setValue("invoiceData", invoice.invoiceData || []);
    }
  }, [invoice, setValue]);

  const handleFormSubmit = async (data: InvoiceFormData) => {
    const submitData: CreateInvoiceInput = {
      name: data.name,
      date: new Date(data.date),
      type: data.type,
      invoiceData: data.invoiceData?.filter(
        (item) => item.content && item.amount > 0
      ),
    };

    await onSubmit(submitData, selectedFile || undefined);
  };

  const addInvoiceItem = () => {
    append({ content: "", amount: 0 });
  };

  const removeInvoiceItem = (index: number) => {
    remove(index);
  };

  const totalAmount = fields.reduce((sum, _, index) => {
    const amount = watch(`invoiceData.${index}.amount`);
    return sum + (amount || 0);
  }, 0);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {invoice ? "Modifier la facture" : "Nouvelle facture"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la facture</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nom de la facture"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de facture</Label>
            <Select
              value={watchedType}
              onValueChange={(value) =>
                setValue("type", value as "EMIS" | "RECUS")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMIS">Facture émise</SelectItem>
                <SelectItem value="RECUS">Facture reçue</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Fichier (optionnel)</Label>
            <FileUpload
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Détails de facturation</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInvoiceItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un élément
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`content-${index}`}>Description</Label>
                  <Input
                    id={`content-${index}`}
                    {...register(`invoiceData.${index}.content`)}
                    placeholder="Description de l'élément"
                  />
                  {errors.invoiceData?.[index]?.content && (
                    <p className="text-sm text-red-600">
                      {errors.invoiceData[index]?.content?.message}
                    </p>
                  )}
                </div>

                <div className="w-32 space-y-2">
                  <Label htmlFor={`amount-${index}`}>Montant (€)</Label>
                  <Input
                    id={`amount-${index}`}
                    type="number"
                    step="0.01"
                    {...register(`invoiceData.${index}.amount`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                  {errors.invoiceData?.[index]?.amount && (
                    <p className="text-sm text-red-600">
                      {errors.invoiceData[index]?.amount?.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInvoiceItem(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {fields.length > 0 && (
              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">
                    {totalAmount.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? invoice
              ? "Modification..."
              : "Création..."
            : invoice
              ? "Modifier"
              : "Créer"}
        </Button>
      </div>
    </form>
  );
}
