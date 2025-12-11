import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "@heroui/button";
import { Input } from "@heroui/react";
import { api, defaultApi } from "~/api/api";

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
      await defaultApi.auth.register(data as any);
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Error al crear la cuenta");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Crear cuenta</h2>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Input
                id="firstName"
                label="Nombre"
                labelPlacement="outside"
                isRequired
                value={firstName}
                onValueChange={setFirstName}
                placeholder="Juan"
              />
            </div>
            <div className="mb-4">
              <Input
                id="lastName"
                label="Apellido"
                labelPlacement="outside"
                isRequired
                value={lastName}
                onValueChange={setLastName}
                placeholder="Pérez"
              />
            </div>

          <div className="mb-4">
            <Input
              id="email"
              label="Correo electrónico"
              labelPlacement="outside"
              isRequired
              value={email}
              onValueChange={setEmail}
              type="email"
              placeholder="ejemplo@dominio.com"
            />
          </div>

          <div className="mb-4">
            <Input
              id="password"
              label="Contraseña"
              labelPlacement="outside"
              isRequired
              value={password}
              onValueChange={setPassword}
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div className="mb-4">
            <Input
              id="confirm"
              label="Confirmar contraseña"
              labelPlacement="outside"
              isRequired
              value={confirm}
              onValueChange={setConfirm}
              type="password"
              placeholder="Reescriba la contraseña"
              autoComplete="new-password"
            />
          </div>

          <div className="mb-4">
            <Input
              id="dni"
              label="DNI"
              labelPlacement="outside"
              isRequired
              value={dni}
              onValueChange={setDni}
              placeholder="12345678"
            />
          </div>
          <div className="mb-4">
            <Input
              id="phone"
              label="Teléfono"
              labelPlacement="outside"
              value={phone}
              onValueChange={setPhone}
              placeholder="(11) 4XXX-XXXX"
            />
          </div>
          <div className="mb-4">
            <Input
              id="address"
              label="Dirección"
              labelPlacement="outside"
              value={address}
              onValueChange={setAddress}
              placeholder="Calle 123, Piso 4"
            />
          </div>
          <div className="mb-4">
            <Input
              id="province"
              label="Provincia"
              labelPlacement="outside"
              value={province}
              onValueChange={setProvince}
              placeholder="Buenos Aires"
            />
          </div>
          <div className="mb-4">
            <Input
              id="city"
              label="Ciudad"
              labelPlacement="outside"
              value={city}
              onValueChange={setCity}
              placeholder="La Plata"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Crear cuenta</Button>
            <Link to="/login" className="text-sm text-blue-600">¿Ya tienes cuenta?</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
