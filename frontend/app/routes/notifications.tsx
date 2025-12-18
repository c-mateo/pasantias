import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/notifications";
import { api } from "~/api/api";
import type { NotificationsListResponse, NotificationDTO } from "~/api/types";
import { useIntersectionObserver } from "~/hooks/useIntersectionObserver";
import toast from "~/util/toast";
import { Button } from "@heroui/button";

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

  const [items, setItems] = useState<NotificationDTO[]>(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);
    try {
      const res = await api
        .get(`/notifications?limit=20&after=${page}`)
        .json<NotificationsListResponse>();
      const next = res?.data ?? [];
      setItems((prev) => [...prev, ...next]);
      setPage(res?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
      toast.error({
        title: "Error",
        message: "Error al cargar más notificaciones",
      });
    } finally {
      setLoading(false);
    }
  };

  useIntersectionObserver(sentinelRef, loadMore);

  useEffect(() => {
    // nothing
  }, []);

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
            : it
        )
      );
      toast.success({
        title: "Leído",
        message: "Notificación marcada como leída",
      });
    } catch (err) {
      console.error(err);
      toast.error({ title: "Error", message: "No se pudo marcar como leída" });
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`).res();
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success({ title: "Eliminado", message: "Notificación eliminada" });
    } catch (err) {
      console.error(err);
      toast.error({ title: "Error", message: "No se pudo eliminar" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notificaciones</h1>
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
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!n.readAt && (
                  <Button className="text-sm text-blue-600" onPress={() => markAsRead(n.id)} color="default" size="sm">Marcar leída</Button>
                )}
                <Button className="text-sm text-red-600" onPress={() => remove(n.id)} color="default" size="sm">Eliminar</Button>
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
