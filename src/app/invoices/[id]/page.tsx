"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useInvoiceViewModel } from "@/lib/viewmodels/invoiceViewModel";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Download, Trash2, ArrowLeft } from "lucide-react";
export default function InvoiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  const { token } = useAuthViewModel();
  const { currentInvoice, loading, error, fetchInvoice, deleteInvoice } =
    useInvoiceViewModel();
  useEffect(() => {
    if (token && id) {
      fetchInvoice(id);
    }
  }, [token, id, fetchInvoice]);
  const handleEdit = () => {
    router.push(`/invoices/${id}/edit`);
  };
  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      await deleteInvoice(id);
      router.push("/invoices");
    }
  };
  const handleDownload = () => {
    if (currentInvoice?.filePath) {
      window.open(currentInvoice.filePath, "_blank");
    }
  };
  const handleBack = () => {
    router.push("/invoices");
  };
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const getTypeColor = (type: string) => {
    return type === "EMIS"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };
  const getTypeLabel = (type: string) => {
    return type === "EMIS" ? "Facture émise" : "Facture reçue";
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        {" "}
        <p className="text-lg">Chargement de la facture...</p>{" "}
      </div>
    );
  }
  if (error || !currentInvoice) {
    return (
      <div className="container mx-auto py-6">
        {" "}
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          {" "}
          <p className="text-red-800">{error || "Facture non trouvée"}</p>{" "}
          <Button onClick={handleBack} className="mt-4">
            {" "}
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux factures{" "}
          </Button>{" "}
        </div>{" "}
      </div>
    );
  }
  const totalAmount =
    currentInvoice.invoiceData?.reduce((sum, data) => sum + data.amount, 0) ||
    0;
  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <div className="flex items-center gap-4">
          {" "}
          <Button variant="ghost" onClick={handleBack}>
            {" "}
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour{" "}
          </Button>{" "}
          <div>
            {" "}
            <h1 className="text-3xl font-bold">{currentInvoice.name}</h1>{" "}
            <p className="text-muted-foreground">
              {" "}
              Créée le {formatDate(currentInvoice.createdAt)}{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex items-center gap-2">
          {" "}
          {currentInvoice.filePath && (
            <Button variant="outline" onClick={handleDownload}>
              {" "}
              <Download className="h-4 w-4 mr-2" /> Télécharger{" "}
            </Button>
          )}{" "}
          <Button variant="outline" onClick={handleEdit}>
            {" "}
            <Edit className="h-4 w-4 mr-2" /> Modifier{" "}
          </Button>{" "}
          <Button variant="destructive" onClick={handleDelete}>
            {" "}
            <Trash2 className="h-4 w-4 mr-2" /> Supprimer{" "}
          </Button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle>Informations générales</CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent className="space-y-4">
            {" "}
            <div>
              {" "}
              <p className="text-sm text-muted-foreground">Type</p>{" "}
              <Badge className={getTypeColor(currentInvoice.type)}>
                {" "}
                {getTypeLabel(currentInvoice.type)}{" "}
              </Badge>{" "}
            </div>{" "}
            <div>
              {" "}
              <p className="text-sm text-muted-foreground">
                Date de la facture
              </p>{" "}
              <p className="font-medium">
                {formatDate(currentInvoice.date)}
              </p>{" "}
            </div>{" "}
            {currentInvoice.filePath && (
              <div>
                {" "}
                <p className="text-sm text-muted-foreground">
                  Fichier joint
                </p>{" "}
                <Button
                  variant="link"
                  onClick={handleDownload}
                  className="p-0 h-auto"
                >
                  {" "}
                  Voir le fichier{" "}
                </Button>{" "}
              </div>
            )}{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle>Résumé financier</CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="space-y-2">
              {" "}
              <div className="flex justify-between">
                {" "}
                <span className="text-muted-foreground">
                  Nombre d'éléments
                </span>{" "}
                <span>{currentInvoice.invoiceData?.length || 0}</span>{" "}
              </div>{" "}
              <div className="flex justify-between text-lg font-semibold">
                {" "}
                <span>Total</span>{" "}
                <span>
                  {" "}
                  {totalAmount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
      {currentInvoice.invoiceData && currentInvoice.invoiceData.length > 0 && (
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle>Détails de facturation</CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="space-y-4">
              {" "}
              {currentInvoice.invoiceData.map((data, index) => (
                <div
                  key={data.id}
                  className="flex justify-between items-center p-4 bg-muted/50 rounded-lg"
                >
                  {" "}
                  <div>
                    {" "}
                    <p className="font-medium">{data.content}</p>{" "}
                    <p className="text-sm text-muted-foreground">
                      Élément #{index + 1}
                    </p>{" "}
                  </div>{" "}
                  <p className="text-lg font-semibold">
                    {" "}
                    {data.amount.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}{" "}
                  </p>{" "}
                </div>
              ))}{" "}
              <div className="flex justify-between items-center pt-4 border-t font-semibold text-lg">
                {" "}
                <span>Total</span>{" "}
                <span>
                  {" "}
                  {totalAmount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>
      )}{" "}
    </div>
  );
}
