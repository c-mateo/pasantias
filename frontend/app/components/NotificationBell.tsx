import React, { useEffect, useRef, useState } from "react";
import { api } from "~/api/api";
import type { NotificationsListResponse, NotificationDTO } from "~/api/types";
import { useNavigate } from "react-router";
import toast from "~/util/toast";
import { useAuthState } from "~/util/AuthContext";
import { useTransmit } from "~/utils/transmit";
import { Button } from "@heroui/button";
import { formatDateTimeLocal } from "~/util/helpers";
import { Tooltip } from "@heroui/react";
import Icon from "app/assets/envelope-dot.svg?react";
import BellIcon from "app/assets/bell.svg?react";

export default function NotificationBell({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const auth = useAuthState();
  const transmit = useTransmit();

  if (!auth.user) return null;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api
          .get("/notifications?limit=10")
          .json<NotificationsListResponse>();
        setItems(res?.data ?? []);
        setUnread((res?.data ?? []).filter((n) => !n.readAt).length);
      } catch (err) {
        console.error(err);
      }
    };

    load();

    // subscribe to realtime notifications for the user
    if (transmit && auth.user) {
      transmit.subscribe(`user:${auth.user.id}`, (notification) => {
        setItems((prev) => [notification, ...prev].slice(0, 10));
        setUnread((u) => u + (notification.readAt ? 0 : 1));
      });
    }
  }, [auth.user]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  const markAsRead = async (id: number) => {
    try {
      const res = await api
        .patch({}, `/notifications/${id}/mark-as-read`)
        .json();
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                readAt: (res as any)?.data?.readAt ?? new Date().toISOString(),
              }
            : it,
        ),
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch (err) {
      console.error(err);
      toast.error({
        title: "Error",
        message: "No se pudo marcar la notificación como leída",
      });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        isIconOnly
        className={`relative ${compact ? "p-1" : "p-2"} hover:bg-gray-100`}
        onPress={() => setOpen((s) => !s)}
        aria-label="Notificaciones"
        color="default"
        size="sm"
        radius="full"
      >
        <BellIcon className={`${compact ? "w-5 h-5" : "w-6 h-6"} text-gray-700`} />
      </Button>
      {unread > 0 && (
        <span
          className={
            "absolute text-xs -top-1 -right-1 w-4 h-4 z-10 bg-red-500 text-white rounded-full flex items-center justify-center"
          }
        >
          {unread}
        </span>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded z-50">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <strong>Notificaciones</strong>
              <Button
                className="text-sm text-blue-600"
                onPress={() => navigate("/notifications")}
                color="default"
                size="sm"
              >
                Ver todas
              </Button>
            </div>
            <ul>
              {items.length === 0 && (
                <li className="text-sm text-gray-500">No hay notificaciones</li>
              )}
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`p-2 rounded hover:bg-gray-50 flex justify-between items-start ${n.readAt ? "opacity-60" : ""}`}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {n.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDateTimeLocal(n.createdAt)}
                    </div>
                  </div>
                  {!n.readAt && (
                    <Tooltip content="Marcar como leído">
                      <Button
                        isIconOnly
                        className="inline-flex items-center justify-center w-8 h-8"
                        onPress={() => markAsRead(n.id)}
                        color="default"
                        radius="full"
                      >
                        <Icon className="h-full p-2 fill-black" />
                      </Button>
                    </Tooltip>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
