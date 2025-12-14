import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";
import type { Route } from "./+types/NavbarLayout";
import { checkSessionOnce, useAuthState } from "~/util/AuthContext";
import { useEffect } from "react";
import { Link } from "@heroui/react";

const titles: Record<string, string> = {
  "/admin/usuarios": "Administrar Usuarios",
  "/admin/carreras": "Administrar Carreras",
  "/admin/ofertas": "Administrar Ofertas",
  "/admin/empresas": "Administrar Empresas",
  "/admin/aplicaciones": "Administrar Aplicaciones",
};

export default function NavbarLayout({}: Route.ComponentProps) {
  const location = useLocation();
  const title = titles[location.pathname] || "Panel de Control";

  useEffect(() => {
    checkSessionOnce();
  }, []);

  const auth = useAuthState();

  if (!auth.checked) return;
  if (auth.user?.role !== "ADMIN") return <Navigate to="/not-found" replace />;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Aplicación de Pasantías</h1>
          <nav className="flex space-x-4">
            <Link
              href="/admin/usuarios"
              className="text-gray-700 hover:text-blue-500"
            >
              Usuarios
            </Link>
            <Link
              href="/admin/carreras"
              className="text-gray-700 hover:text-blue-500"
            >
              Carreras
            </Link>
            <Link
              href="/admin/ofertas"
              className="text-gray-700 hover:text-blue-500"
            >
              Ofertas
            </Link>
            <Link
              href="/admin/empresas"
              className="text-gray-700 hover:text-blue-500"
            >
              Empresas
            </Link>
            <Link
              href="/admin/aplicaciones"
              className="text-gray-700 hover:text-blue-500"
            >
              Aplicaciones
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
