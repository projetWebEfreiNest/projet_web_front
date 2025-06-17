"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { Button } from "@/components/ui/button";
import { Plus, Home, FileText, LogOut } from "lucide-react";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isLoading: isLogoutLoading } = useAuthViewModel();

  const handleLogout = () => {
    logout(router);
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold">FactureApp</h1>
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              onClick={() => router.push("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
            <Button
              variant={isActive("/invoices") ? "default" : "ghost"}
              onClick={() => router.push("/invoices")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Factures
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push("/invoices/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLogoutLoading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLogoutLoading ? "Déconnexion..." : "Se déconnecter"}
          </Button>
        </div>
      </div>
    </header>
  );
}
