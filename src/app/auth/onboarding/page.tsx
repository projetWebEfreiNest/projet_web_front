"use client";
import Image from "next/image";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { LoginCredentials, RegisterCredentials } from "@/lib/models/auth";

export default function Page() {
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [registerForm, setRegisterForm] = useState<RegisterCredentials>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    acceptTerms: false,
  });

  const { login, register, isLoading, error } = useAuthViewModel();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    const fieldName =
      id === "email-login"
        ? "email"
        : id === "password-login"
          ? "password"
          : id === "remember"
            ? "rememberMe"
            : "";

    setLoginForm({
      ...loginForm,
      [fieldName]: type === "checkbox" ? checked : value,
    });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    const fieldName =
      id === "email-register"
        ? "email"
        : id === "password-register"
          ? "password"
          : id === "prenom"
            ? "firstName"
            : id === "nom"
              ? "lastName"
              : id === "terms"
                ? "acceptTerms"
                : "";

    setRegisterForm({
      ...registerForm,
      [fieldName]: type === "checkbox" ? checked : value,
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginForm);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(registerForm);
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-900/30 z-10" />
        <Image
          src="/onboarding.jpg"
          alt="Illustration de facturation"
          fill
          className="object-cover opacity-85"
          priority
        />
        <div className="relative z-20 p-10 text-white flex flex-col justify-end h-full">
          <h1 className="text-4xl font-bold mb-2">
            Simplifiez la gestion de vos factures
          </h1>
          <p className="text-lg opacity-90">
            Une solution simple et élégante pour gérer toutes vos factures en un
            seul endroit.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bienvenue</CardTitle>
            <CardDescription className="text-center">
              Commencez à gérer vos factures efficacement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="connexion" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger className="cursor-pointer" value="connexion">
                  Connexion
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="inscription">
                  Inscription
                </TabsTrigger>
              </TabsList>

              <div className="tabs-transition">
                <TabsContent
                  value="connexion"
                  className="transition-all duration-300 animate-in fade-in-0"
                >
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">Email</Label>
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="votre@email.com"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="password-login">Mot de passe</Label>
                        <a
                          href="#"
                          className="text-sm text-primary hover:underline"
                        >
                          Mot de passe oublié?
                        </a>
                      </div>
                      <Input
                        id="password-login"
                        type="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) =>
                          setLoginForm({ ...loginForm, rememberMe: !!checked })
                        }
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Se souvenir de moi
                      </label>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent
                  value="inscription"
                  className="transition-all duration-300 animate-in fade-in-0"
                >
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prenom">Prénom</Label>
                        <Input
                          id="prenom"
                          placeholder="Jean"
                          value={registerForm.firstName}
                          onChange={handleRegisterChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nom">Nom</Label>
                        <Input
                          id="nom"
                          placeholder="Dupont"
                          value={registerForm.lastName}
                          onChange={handleRegisterChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register">Email</Label>
                      <Input
                        id="email-register"
                        type="email"
                        placeholder="votre@email.com"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register">Mot de passe</Label>
                      <Input
                        id="password-register"
                        type="password"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={registerForm.acceptTerms}
                        onCheckedChange={(checked) =>
                          setRegisterForm({
                            ...registerForm,
                            acceptTerms: !!checked,
                          })
                        }
                        required
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        J'accepte les{" "}
                        <a href="#" className="text-primary hover:underline">
                          conditions d'utilisation
                        </a>
                      </label>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !registerForm.acceptTerms}
                    >
                      {isLoading ? "Inscription en cours..." : "S'inscrire"}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              En continuant, vous acceptez nos conditions d'utilisation et notre
              politique de confidentialité.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
