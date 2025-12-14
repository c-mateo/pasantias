import React, { useEffect } from "react";
import { Link } from "@heroui/react";
import { Outlet } from "react-router";
import { checkSessionOnce, useAuthState } from "~/util/AuthContext";

export default function PublicLayout() {
  const auth = useAuthState();

  useEffect(() => {
    checkSessionOnce();
  }, []);

  if (!auth.checked) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Aplicación de Pasantías</h1>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-blue-500">Inicio</Link>
            <Link href="/ofertas" className="text-gray-700 hover:text-blue-500">Ofertas</Link>
            {auth.user ? (
              <>
                <Link href="/applications" className="text-gray-700 hover:text-blue-500">Mis solicitudes</Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-500">Mi cuenta</Link>
              </>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-blue-500">Entrar</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
