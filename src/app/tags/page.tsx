"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Tag, ArrowLeft } from "lucide-react";

export default function TagsPage() {
  const router = useRouter();
  const { token } = useAuthViewModel();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/onboarding");
    }
  }, [token, router]);

  const handleBack = () => {
    router.push("/");
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Gestion des tags</h1>
          <p className="text-muted-foreground">
            Organisez vos factures avec des tags personnalisés
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau tag
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Aucun tag disponible</p>
            <p className="text-sm">
              Créez votre premier tag pour organiser vos factures
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
