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
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");

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
      dni,
      phone,
      address,
      province,
      city,
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
    <div className="min-h-screen bg-gray-100 py-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded shadow">
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

          <Input
            id="dni"
            label="DNI"
            labelPlacement="outside"
            className="mb-4"
            isRequired
            value={dni}
            onValueChange={setDni}
            placeholder="12345678"
          />

          <Input
            id="phone"
            label="Teléfono"
            labelPlacement="outside"
            className="mb-4"
            value={phone}
            onValueChange={setPhone}
            placeholder="(11) 4XXX-XXXX"
          />

          <Input
            id="address"
            label="Dirección"
            labelPlacement="outside"
            className="mb-4"
            value={address}
            onValueChange={setAddress}
            placeholder="Calle 123, Piso 4"
          />

          <Input
            id="province"
            label="Provincia"
            labelPlacement="outside"
            className="mb-4"
            value={province}
            onValueChange={setProvince}
            placeholder="Buenos Aires"
          />

          <Input
            id="city"
            label="Ciudad"
            labelPlacement="outside"
            className="mb-4"
            value={city}
            onValueChange={setCity}
            placeholder="La Plata"
          />

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
