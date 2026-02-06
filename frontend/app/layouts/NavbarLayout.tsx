import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";
import type { Route } from "./+types/NavbarLayout";
import { checkSessionOnce, useAuthState } from "~/util/AuthContext";
import { useEffect } from "react";
import { Link } from "@heroui/react";
import NotificationBell from "~/components/NotificationBell";
import AppNavbar from "~/components/AppNavbar";

const titles: Record<string, string> = {
  "/admin/usuarios": "Administrar Usuarios",
  "/admin/carreras": "Administrar Carreras",
  "/admin/ofertas": "Administrar Ofertas",
  "/admin/empresas": "Administrar Empresas",
  "/admin/aplicaciones": "Administrar Aplicaciones",
  "/admin/skills": "Administrar Skills",
  "/admin/document-types": "Administrar Tipos de Documentos",
};

export default function NavbarLayout({}: Route.ComponentProps) {
  const location = useLocation();
  const title = titles[location.pathname] || "Panel de Control";

  const auth = useAuthState();

  if (!auth.checked) return;
  if (auth.user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen">
      <AppNavbar
        title={"Aplicación de Pasantías"}
        centerItems={[
          { label: 'Usuarios', href: '/admin/usuarios', isActive: location.pathname === '/admin/usuarios' },
          { label: 'Carreras', href: '/admin/carreras', isActive: location.pathname === '/admin/carreras' },
          { label: 'Ofertas', href: '/admin/ofertas', isActive: location.pathname === '/admin/ofertas' },
          { label: 'Empresas', href: '/admin/empresas', isActive: location.pathname === '/admin/empresas' },
          { label: 'Aplicaciones', href: '/admin/aplicaciones', isActive: location.pathname === '/admin/aplicaciones' },
          { label: 'Skills', href: '/admin/skills', isActive: location.pathname === '/admin/skills' },
          { label: 'Tipos de Docs', href: '/admin/document-types', isActive: location.pathname === '/admin/document-types' },
        ]}
        rightItems={[{ label: 'Mi cuenta', href: '/profile' }, { label: 'Cerrar sesión', asButton: true, color: 'primary', onPress: async () => { await import('~/util/AuthContext').then(m => m.logout()); window.location.href = '/'; } }]}
        showNotificationBell
      />

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
