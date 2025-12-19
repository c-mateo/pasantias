import React, { useEffect, useRef, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@heroui/react";
import NotificationBell from "~/components/NotificationBell";

export type NavItem = {
  label: string;
  href?: string;
  isActive?: boolean;
  color?: "primary" | "danger" | "foreground";
  asButton?: boolean;
  onPress?: () => void;
};

type Props = {
  title?: string;
  brand?: React.ReactNode;
  centerItems?: NavItem[];
  rightItems?: NavItem[];
  showNotificationBell?: boolean;
};

export default function AppNavbar({
  title = "Aplicación de Pasantías",
  brand,
  centerItems = [],
  rightItems = [],
  showNotificationBell = false,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      const root = document.getElementById('app-navbar-menu');
      const el = root?.querySelector('a,button');
      (el as HTMLElement | null)?.focus?.();
    }
  }, [isMenuOpen]);

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} aria-label={`${title} navigation`} maxWidth="full">
      <NavbarContent>
        <NavbarMenuToggle aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={isMenuOpen} aria-controls="app-navbar-menu" className="sm:hidden" />
        <NavbarBrand>
          {brand ?? <p className="font-bold text-inherit">{title}</p>}
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4 flex-1 justify-center" justify="center">
        {centerItems.map((it) => (
          <NavbarItem key={it.href} isActive={it.isActive}>
            <Link color={it.color ?? "foreground"} href={it.href}>
              {it.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <div className="hidden sm:flex items-center gap-3">
          {rightItems.map((it) => {
            const btnColor = it.color === 'foreground' ? 'default' : (it.color ?? 'primary');
            return (
              <NavbarItem key={it.href ?? it.label}>
                {it.asButton ? (
                  it.onPress ? (
                    <Button color={btnColor as any} onPress={it.onPress} variant="flat">
                      {it.label}
                    </Button>
                  ) : (
                    <Button as={Link} color={btnColor as any} href={it.href} variant="flat">
                      {it.label}
                    </Button>
                  )
                ) : (
                  <Link color={it.color ?? "foreground"} href={it.href}>
                    {it.label}
                  </Link>
                )}
              </NavbarItem>
            );
          })}

          {showNotificationBell && (
            <NavbarItem>
              {/* @ts-ignore - client component */}
              <NotificationBell compact />
            </NavbarItem>
          )}
        </div>
      </NavbarContent>

      <div id="app-navbar-menu" aria-label={`${title} menu`}>
        <NavbarMenu>
        {[...centerItems, ...rightItems].map((it) => (
          <NavbarMenuItem key={it.href ?? it.label}>
            {it.asButton || it.onPress ? (
              <div className="w-full">
                {it.onPress ? (
                  <Button className="w-full" onPress={it.onPress} color={(it.color === 'foreground' ? 'default' : (it.color ?? 'primary')) as any} size="lg" variant="flat">
                    {it.label}
                  </Button>
                ) : (
                  <Button className="w-full" as={Link} href={it.href} color={(it.color === 'foreground' ? 'default' : (it.color ?? 'primary')) as any} size="lg" variant="flat">
                    {it.label}
                  </Button>
                )}
              </div>
            ) : (
              <Link
                className="w-full"
                color={it.color ?? "foreground"}
                href={it.href}
                size="lg"
              >
                {it.label}
              </Link>
            )}
          </NavbarMenuItem>
        ))}

        {showNotificationBell && (
          <NavbarMenuItem>
            {/* @ts-ignore - client component */}
            <NotificationBell compact />
          </NavbarMenuItem>
        )}
      </NavbarMenu>
      </div>
    </Navbar>
  );
}
