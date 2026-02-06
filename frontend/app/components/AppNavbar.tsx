import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
} from "@heroui/react";
import { Button } from "@heroui/button";
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
      const root = document.getElementById("app-navbar-menu");
      const el = root?.querySelector("a,button");
      (el as HTMLElement | null)?.focus?.();
    }
  }, [isMenuOpen]);

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      aria-label={`${title} navigation`}
      position="sticky"
      className="top-0 z-50 bg-white shadow border-b border-gray-200"
      maxWidth="full"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          aria-controls="app-navbar-menu"
          className="sm:hidden"
        />
        <NavbarBrand>
          {brand ?? <p className="font-bold text-inherit">{title}</p>}
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex gap-4 flex-1 justify-center"
        justify="center"
      >
        {centerItems.map((it) => (
          <NavbarItem key={it.href} isActive={it.isActive}>
            <Link color={it.color ?? "foreground"} href={it.href}>
              {it.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent className="sm:hidden px-0" justify="end">
        {showNotificationBell && (
          <div className="flex items-center">
            {/* @ts-ignore - client component */}
            <NotificationBell compact />
          </div>
        )}
      </NavbarContent>

      <NavbarContent justify="end" className="hidden sm:flex">
        <div className="flex items-center gap-3">
          {/* Links first */}
          {rightItems
            .filter((it) => !it.asButton)
            .map((it) => (
              <NavbarItem key={it.href ?? it.label}>
                <Link color={it.color ?? "foreground"} href={it.href}>
                  {it.label}
                </Link>
              </NavbarItem>
            ))}

          {/* Then action buttons */}
          {rightItems
            .filter((it) => it.asButton)
            .map((it) => {
              const btnColor =
                it.color === "foreground" ? "default" : (it.color ?? "primary");
              return (
                <NavbarItem key={it.href ?? it.label}>
                  {it.onPress ? (
                    <Button
                      color={btnColor as any}
                      onPress={it.onPress}
                      variant="flat"
                    >
                      {it.label}
                    </Button>
                  ) : (
                    <Button
                      as={Link}
                      color={btnColor as any}
                      href={it.href}
                      variant="flat"
                    >
                      {it.label}
                    </Button>
                  )}
                </NavbarItem>
              );
            })}

          {/* Notification bell at the end */}
          {showNotificationBell && (
            <NavbarItem>
              {/* @ts-ignore - client component */}
              <NotificationBell compact />
            </NavbarItem>
          )}
        </div>
      </NavbarContent>

      <NavbarContent className="hidden sm:visible" id="app-navbar-menu">
        <NavbarMenu>
          {[...centerItems, ...rightItems].map((it) => (
            <NavbarMenuItem key={it.href ?? it.label}>
              {it.asButton || it.onPress ? (
                <div className="w-full">
                  {it.onPress ? (
                    <Button
                      className="w-full"
                      onPress={() => {
                        it.onPress && it.onPress();
                        setIsMenuOpen(false);
                      }}
                      color={
                        (it.color === "foreground"
                          ? "default"
                          : (it.color ?? "primary")) as any
                      }
                      size="lg"
                      variant="flat"
                    >
                      {it.label}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      as={Link}
                      href={it.href}
                      onPress={() => setIsMenuOpen(false)}
                      color={
                        (it.color === "foreground"
                          ? "default"
                          : (it.color ?? "primary")) as any
                      }
                      size="lg"
                      variant="flat"
                    >
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
                  onPress={() => setIsMenuOpen(false)}
                >
                  {it.label}
                </Link>
              )}
            </NavbarMenuItem>
          ))}

          {/* Notification bell moved to the navbar for mobile visibility */}
        </NavbarMenu>
      </NavbarContent>
    </Navbar>
  );
}
