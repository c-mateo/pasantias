import React from "react";
import { Link } from "react-router";

export default function Register() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
            <label className="block text-sm font-medium mb-1" htmlFor="name">Nombre</label>
            <input id="name" name="name" type="text" required className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="confirm">Confirmar contraseña</label>
            <input id="confirm" name="confirm" type="password" required className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Crear cuenta</button>
            <Link to="/login" className="text-sm text-blue-600">¿Ya tienes cuenta?</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
