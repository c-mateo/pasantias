import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Form, Input, Link } from "@heroui/react";
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
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Las contraseñas no coinciden");
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
      alert("Error al crear la cuenta");
    }
  };

  return (
    <div className="min-h-screen py-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-shadow duration-150 hover:shadow-md">
        <h2 className="text-2xl font-bold mb-4">Crear cuenta</h2>
        <Form onSubmit={handleSubmit}>
          <Input
            id="firstName"
            label="Nombre"
            labelPlacement="outside"
            className="mb-4"
            isRequired
            value={firstName}
            onValueChange={setFirstName}
            placeholder="Juan"
          />

          <Input
            id="lastName"
            label="Apellido"
            labelPlacement="outside"
            className="mb-4"
            isRequired
            value={lastName}
            onValueChange={setLastName}
            placeholder="Pérez"
          />

          <Input
            id="email"
            label="Correo electrónico"
            labelPlacement="outside"
            className="mb-4"
            isRequired
            value={email}
            onValueChange={setEmail}
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
            onValueChange={setPassword}
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
            onValueChange={setConfirm}
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
