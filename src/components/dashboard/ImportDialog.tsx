"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDashboardViewModel } from "@/lib/viewmodels/dashboardViewModel";
import { toast } from "sonner";

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const { importInvoices, isLoading } = useDashboardViewModel();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Veuillez sélectionner au moins un fichier");
      return;
    }

    try {
      await importInvoices(selectedFiles);
      toast.success(`${selectedFiles.length} factures importées avec succès`);
      setSelectedFiles([]);
      setOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'importation des factures");
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Importer des factures</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Importer des factures</DialogTitle>
            <DialogDescription>
              Sélectionnez les fichiers de factures à importer dans le système.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label className="text-sm font-medium leading-none">
                Fichiers de factures
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.csv,.xlsx"
                onChange={handleFileChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {selectedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedFiles.length} fichier(s) sélectionné(s)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading || selectedFiles.length === 0}
            >
              {isLoading ? "Importation..." : "Importer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
