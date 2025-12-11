import React from "react";
import { Link } from "react-router";
import { Button } from "@heroui/button";

export default function Login() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      // Intentamos realizar un POST a /api/login (ajustar según backend)
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log(await response.json());
      // Redirigir o mostrar mensaje (simple ejemplo)
    //   window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Entrar</Button>
            <Link to="/register" className="text-sm text-blue-600">Crear cuenta</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
