import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Form, Input, Link, addToast } from "@heroui/react";
import { toast as toastHelper } from "~/util/toast";
import { api } from "~/api/api";
import { requireUser } from "~/util/AuthContext";
import { redirect } from "react-router";

export async function clientLoader() {
  const user = await requireUser();
  if (user) throw redirect("/");
}

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eObj: Record<string, string> = {};
    if (!firstName.trim()) eObj.firstName = "Nombre requerido";
    if (!lastName.trim()) eObj.lastName = "Apellido requerido";
    if (!email.trim()) eObj.email = "Email requerido";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) eObj.email = "Formato de email inválido";
    if (!password || password.length < 8) eObj.password = "La contraseña debe tener al menos 8 caracteres";
    if (password !== confirm) eObj.confirm = "Las contraseñas no coinciden";

    setErrors(eObj);
    if (Object.keys(eObj).length > 0) {
      toastHelper.warn({ title: "Corrige los errores del formulario" });
      return;
    }

    const data = {
      email,
      password,
      firstName,
      lastName,
    };
    try {
      const result = await api.post(data, "/auth/register").json();
      console.log(result);
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      const apiErrors = (err as any)?.errors ?? (err as any)?.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        const map: Record<string, string> = {};
        apiErrors.forEach((it: any) => (map[it.field] = it.message));
        setErrors(map);
      }
      toastHelper.error({ title: "Error al crear la cuenta", description: "Revise los datos e intente nuevamente." });
    }
  };

  return (
    <div className="min-h-screen py-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-shadow duration-150 hover:shadow-md">
        <h2 className="text-2xl font-bold mb-4">Crear cuenta</h2>
        <Form onSubmit={handleSubmit} validationErrors={errors as any}>
          <Input
            id="firstName"
            label="Nombre"
            labelPlacement="outside"
            className="mb-4"
            isRequired
            value={firstName}
              onValueChange={(v) => {
                setFirstName(v);
                setErrors((prev) => ({ ...prev, firstName: undefined }));
              }}
              isInvalid={!!errors.firstName}
              errorMessage={({ validationDetails }) => {
                if (validationDetails?.valueMissing) return "Nombre requerido";
                return errors.firstName ?? null;
              }}
            placeholder="Juan"
          />
          

          <Input
            id="lastName"
            label="Apellido"
            labelPlacement="outside"
            className="mb-4"
            isRequired
            value={lastName}
            onValueChange={(v) => {
              setLastName(v);
              setErrors((prev) => ({ ...prev, lastName: undefined }));
            }}
            isInvalid={!!errors.lastName}
            errorMessage={({ validationDetails }) => {
              if (validationDetails?.valueMissing) return "Apellido requerido";
              return errors.lastName ?? null;
            }}
            placeholder="Pérez"
          />
          

          <Input
            id="email"
            label="Correo electrónico"
            labelPlacement="outside"
            className="mb-4"
            isRequired
            value={email}
            onValueChange={(v) => {
              setEmail(v);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            isInvalid={!!errors.email}
            errorMessage={({ validationDetails }) => {
              if (validationDetails?.valueMissing) return "Email requerido";
              if (validationDetails?.typeMismatch) return "Formato de email inválido";
              return errors.email ?? null;
            }}
            type="email"
            placeholder="ejemplo@dominio.com"
          />
          

          <Input
            id="password"
            label="Contraseña"
            labelPlacement="outside"
            className="mb-4"
            isRequired
            value={password}
            onValueChange={(v) => {
              setPassword(v);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            isInvalid={!!errors.password}
            errorMessage={() => errors.password ?? null}
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
          />
          

          <Input
            id="confirm"
            label="Confirmar contraseña"
            labelPlacement="outside"
            className="mb-4"
            isRequired
            value={confirm}
            onValueChange={(v) => {
              setConfirm(v);
              setErrors((prev) => ({ ...prev, confirm: undefined }));
            }}
            isInvalid={!!errors.confirm}
            errorMessage={() => errors.confirm ?? null}
            type="password"
            placeholder="Reescriba la contraseña"
            autoComplete="new-password"
          />
          
          {/* Removed personal identification fields: DNI, phone, address, province, city */}

          <div className="flex items-center justify-between w-full">
            <Button type="submit" color="primary">
              Crear cuenta
            </Button>
            <Link href="/login">¿Ya tienes cuenta?</Link>
          </div>
        </Form>
      </main>
    </div>
  );
}
