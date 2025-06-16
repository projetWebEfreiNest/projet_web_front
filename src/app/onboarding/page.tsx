"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthViewModel } from "@/lib/viewmodels/authViewModel";
import { LoginCredentials, RegisterCredentials } from "@/lib/models/auth";
import {
  validatePassword,
  validatePasswordMatch,
} from "@/lib/utils/passwordValidation";

export default function Page() {
  const router = useRouter();

  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [registerForm, setRegisterForm] = useState<RegisterCredentials>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    acceptTerms: false,
  });

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

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
          : id === "confirm-password-register"
            ? "confirmPassword"
            : id === "name"
              ? "name"
              : id === "terms"
                ? "acceptTerms"
                : "";

    const updatedForm = {
      ...registerForm,
      [fieldName]: type === "checkbox" ? checked : value,
    };

    setRegisterForm(updatedForm);

    if (fieldName === "password") {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
    }

    if (fieldName === "confirmPassword" || fieldName === "password") {
      const passwordToCheck =
        fieldName === "password" ? value : updatedForm.password;
      const confirmPasswordToCheck =
        fieldName === "confirmPassword" ? value : updatedForm.confirmPassword;

      if (
        confirmPasswordToCheck &&
        !validatePasswordMatch(passwordToCheck, confirmPasswordToCheck)
      ) {
        setConfirmPasswordError("Les mots de passe ne correspondent pas");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginForm, router);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const passwordValidation = validatePassword(registerForm.password);
    const passwordsMatch = validatePasswordMatch(
      registerForm.password,
      registerForm.confirmPassword
    );

    setPasswordErrors(passwordValidation.errors);

    if (!passwordsMatch) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
    } else {
      setConfirmPasswordError("");
    }

    if (passwordValidation.isValid && passwordsMatch) {
      register(registerForm, router);
    }
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
                      <PasswordInput
                        id="password-login"
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
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        placeholder="Jean Dupont"
                        value={registerForm.name}
                        onChange={handleRegisterChange}
                        required
                      />
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
                      <PasswordInput
                        id="password-register"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        required
                      />
                      {passwordErrors.length > 0 && (
                        <div className="text-sm text-red-600 space-y-1">
                          {passwordErrors.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password-register">
                        Confirmer le mot de passe
                      </Label>
                      <Input
                        id="confirm-password-register"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                      />
                      {confirmPasswordError && (
                        <div className="text-sm text-red-600">
                          {confirmPasswordError}
                        </div>
                      )}
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
                      disabled={
                        isLoading ||
                        !registerForm.acceptTerms ||
                        passwordErrors.length > 0 ||
                        confirmPasswordError !== ""
                      }
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
