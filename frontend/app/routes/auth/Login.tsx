import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Form, Input, Link } from "@heroui/react";

import { login, requireUser } from "~/util/AuthContext";
import toast from "~/util/toast";
import type { LoginResponse } from "~/api/types";
import { redirect, useNavigate, useLocation } from "react-router";

export async function clientLoader() {
  const user = await requireUser();
  if (user) throw redirect("/");
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setIsLoading(true);

    try {
      await login(email, password);
      const params = new URLSearchParams(location.search);
      const next = params.get("next");
      if (next) {
        navigate(next);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      const message = err?.response?.message || err?.message || "Error al iniciar sesión";
      toast.error({ title: "Error al iniciar sesión", message });
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-shadow duration-150 hover:shadow-md">
        <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Correo electrónico"
           labelPlacement="outside"
            isRequired
            value={email}
            onValueChange={setEmail}
            type="email"
            placeholder="ejemplo@dominio.com"
            autoComplete="email"
          />
          <Input
            name="password"
            label="Contraseña"
            labelPlacement="outside"
            isRequired
            value={password}
            onValueChange={setPassword}
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between w-full">
            <Button type="submit" color="primary" disabled={isLoading}>
              Entrar
            </Button>
            <div className="flex flex-col items-end">
              <Link href="/forgot-password">Olvidé mi contraseña</Link>
              <Link href="/register">Crear cuenta</Link>
            </div>
          </div>
        </Form>
      </main>
    </div>
  );
}
