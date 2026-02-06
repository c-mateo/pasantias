import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Form, Input } from "@heroui/react";
import { useNavigate } from "react-router";
import { api } from "~/api/api";
import toast from "~/util/toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post({ email }, "/auth/password/forgot").json();
      toast.success({ title: "Enviado", message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña." });
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      toast.error({ title: "Error", message: err?.response?.message || "No se pudo solicitar el restablecimiento." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-shadow duration-150 hover:shadow-md">
        <h2 className="text-2xl font-bold mb-4">Recuperar contraseña</h2>
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

          <div className="flex items-center justify-between w-full">
            <Button type="submit" color="primary" disabled={isLoading}>
              Enviar instrucciones
            </Button>
          </div>
        </Form>
      </main>
    </div>
  );
}
