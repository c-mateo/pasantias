import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Form, Input } from "@heroui/react";
import { useNavigate } from "react-router";
import { api } from "~/api/api";
import toast from "~/util/toast";
import { login } from "~/util/AuthContext";

/**
 * Página para restablecer la contraseña a partir de un `token` en la URL.
 */

export default function ResetPassword() {
  const token = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Falta el token para restablecer la contraseña.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post({ token, password }, "/auth/password/reset").json();
      const email: string | undefined = (res as any)?.email;

      // Try to auto-login if backend returned the email
      if (email) {
        try {
          await login(email, password);
          toast.success({ title: "Contraseña restablecida", message: "La contraseña fue restablecida y se inició sesión automáticamente." });
          navigate('/profile');
          return;
        } catch (loginErr) {
          // If login fails, fall back to redirecting to login page with a success toast
          console.warn('Auto-login failed after password reset', loginErr);
          toast.success({ title: "Contraseña restablecida", message: "La contraseña fue restablecida. Inicia sesión con tu nueva contraseña." });
          navigate('/login');
          return;
        }
      }

      toast.success({ title: "Contraseña restablecida", message: "La contraseña fue restablecida correctamente. Inicia sesión con tu nueva contraseña." });
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      toast.error({ title: "Error", message: err?.response?.message || "No se pudo restablecer la contraseña" });
    } finally {
      setIsLoading(false);
    }
  };

  if (error && !token) {
    return (
      <div className="min-h-screen py-20">
        <main className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Restablecer contraseña</h2>
          <p className="text-sm text-red-600">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-shadow duration-150 hover:shadow-md">
        <h2 className="text-2xl font-bold mb-4">Restablecer contraseña</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            id="password"
            label="Nueva contraseña"
            labelPlacement="outside"
            isRequired
            value={password}
            onValueChange={setPassword}
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            label="Confirmar contraseña"
            labelPlacement="outside"
            isRequired
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            type="password"
            placeholder="Reingresa la contraseña"
            autoComplete="new-password"
          />

          <div className="flex items-center justify-between w-full">
            <Button type="submit" color="primary" disabled={isLoading}>
              Guardar nueva contraseña
            </Button>
          </div>
        </Form>
      </main>
    </div>
  );
}
