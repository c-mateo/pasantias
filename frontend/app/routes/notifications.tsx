import { useEffect, useRef } from "react";
import type { Route } from "./+types/notifications";
import { api } from "~/api/api";
import type { NotificationDTO, NotificationsListResponse } from "~/api/types";
import { useIntersectionObserver } from "~/hooks/useIntersectionObserver";
import useNotifications from "~/util/notificationsStore";
import toast from "~/util/toast";
import { Button } from "@heroui/button";
import { formatDateTimeLocal } from "~/util/helpers";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const res = await api
    .get("/notifications?limit=20")
    .json<NotificationsListResponse>();
  return {
    initialData: res?.data ?? [],
    pagination: res?.pagination ?? { next: null, prev: null },
  };
}

export default function Notifications({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;
  const notifications = useNotifications();
  const items = notifications.items;
  const page = notifications.page;
  const loading = notifications.loading;

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    await notifications.loadMore();
  };

  useIntersectionObserver(sentinelRef, loadMore);

  useEffect(() => {
    // initial data from loader: seed store if not loaded
    if (!notifications.loadedOnce) {
      notifications.loadInitial().catch(() => {});
      // seed items from loader
      if (initialData && initialData.length > 0) {
        // replace items only if store empty
        if (!notifications.items || notifications.items.length === 0) {
          notifications.setItems(initialData);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await notifications.markAsRead(id);
      toast.success({ title: "Leído", message: "Notificación marcada como leída" });
    } catch (err) {
      const message = (err as any)?.response?.message || (err as any)?.message || "No se pudo marcar como leída";
      toast.error({ title: "Error al marcar como leída", message });
    }
  };

  const remove = async (id: number) => {
    try {
      await notifications.remove(id);
      toast.success({ title: "Eliminado", message: "Notificación eliminada" });
    } catch (err) {
      const message = (err as any)?.response?.message || (err as any)?.message || "No se pudo eliminar";
      toast.error({ title: "Error al eliminar notificación", message });
    }
  };

  const markAll = async () => {
    try {
      await notifications.markAllAsRead();
      toast.success({ title: "Leído", message: "Todas las notificaciones marcadas como leídas" });
    } catch (err) {
      toast.error({ title: "Error", message: "No se pudieron marcar todas como leídas" });
    }
  };

  const deleteAll = async () => {
    if (!confirm('¿Eliminar todas las notificaciones? Esta acción no se puede deshacer.')) return;
    try {
      await notifications.removeAll();
      toast.success({ title: "Eliminadas", message: "Todas las notificaciones fueron eliminadas" });
    } catch (err) {
      toast.error({ title: "Error", message: "No se pudieron eliminar todas las notificaciones" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        <div className="flex gap-2">
          <Button onPress={markAll} size="sm" disabled={items.length === 0 || loading}>Marcar todas como leídas</Button>
          <Button onPress={deleteAll} color="danger" size="sm" disabled={items.length === 0 || loading}>Eliminar todas</Button>
        </div>
      </div>
      <div className="bg-white border rounded">
        <ul>
          {items.map((n) => (
            <li
              key={n.id}
              className={`p-4 border-b flex justify-between ${n.readAt ? "opacity-60" : ""}`}
            >
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDateTimeLocal(n.createdAt)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!n.readAt && (
                  <Button className="text-sm text-blue-600" onPress={() => markAsRead(n.id)} color="default" size="sm">Marcar leída</Button>
                )}
                <Button className="text-sm" onPress={() => remove(n.id)} color="danger" size="sm">Eliminar</Button>
              </div>
            </li>
          ))}
        </ul>
        <div
          ref={sentinelRef}
          className="p-4 text-center text-sm text-gray-500"
        >
          {loading
            ? "Cargando..."
            : page
              ? "Desplazate para cargar más"
              : "No hay más"}
        </div>
      </div>
    </div>
  );
}
