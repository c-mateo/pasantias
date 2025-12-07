import React from "react";
import { Outlet, useLocation } from "react-router";

const titles: Record<string, string> = {
  "/admin/usuarios": "Administrar Usuarios",
  "/admin/carreras": "Administrar Carreras",
  "/admin/ofertas": "Administrar Ofertas",
  "/admin/empresas": "Administrar Empresas",
  "/admin/aplicaciones": "Administrar Aplicaciones",
};

export default function NavbarLayout() {
  const location = useLocation();
  const title = titles[location.pathname] || "Panel de Control";

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Aplicación de Pasantías</h1>
          <nav className="flex space-x-4">
            <a href="/admin/usuarios" className="text-gray-700 hover:text-blue-500">Usuarios</a>
            <a href="/admin/carreras" className="text-gray-700 hover:text-blue-500">Carreras</a>
            <a href="/admin/ofertas" className="text-gray-700 hover:text-blue-500">Ofertas</a>
            <a href="/admin/empresas" className="text-gray-700 hover:text-blue-500">Empresas</a>
            <a href="/admin/aplicaciones" className="text-gray-700 hover:text-blue-500">Aplicaciones</a>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
