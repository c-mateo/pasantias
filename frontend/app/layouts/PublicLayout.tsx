import React, { useEffect } from "react";
import { Link } from "@heroui/react";
import { Outlet } from "react-router";
import { checkSessionOnce, useAuthState } from "~/util/AuthContext";
import NotificationBell from "~/components/NotificationBell";
import AppNavbar from "~/components/AppNavbar";

export default function PublicLayout() {
  const auth = useAuthState();

  useEffect(() => {
    checkSessionOnce();
  }, []);

  if (!auth.checked) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="w-full px-4 py-4 flex justify-between items-center">
          <AppNavbar
            title={"Aplicación de Pasantías"}
            centerItems={[
              { label: 'Inicio', href: '/' },
              { label: 'Ofertas', href: '/ofertas' },
              ...(auth.user ? (auth.user.role === 'ADMIN' ? [{ label: 'Panel Admin', href: '/admin' }] : []) : []),
              ...(auth.user ? [{ label: 'Mis solicitudes', href: '/applications' }] : []),
            ]}
            rightItems={auth.user ? [
              { label: 'Mi cuenta', href: '/profile' },
              { label: 'Cerrar sesión', asButton: true, color: 'primary', onPress: async () => { await import('~/util/AuthContext').then(m => m.logout()); window.location.href = '/'; } }
            ] : [
              { label: 'Entrar', href: '/login', asButton: true, color: 'primary' }
            ]}
            showNotificationBell={!!auth.user}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
