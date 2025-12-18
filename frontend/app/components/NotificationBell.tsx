import React, { useEffect, useRef, useState } from 'react';
import { api } from '~/api/api';
import type { NotificationsListResponse, NotificationDTO } from '~/api/types';
import { useNavigate } from 'react-router';
import toast from '~/util/toast';
import { useAuthState } from '~/util/AuthContext';
import { Button } from "@heroui/button";

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const auth = useAuthState();
  if (!auth.user) return null;

  useEffect(() => {

    const load = async () => {
      try {
        const res = await api.get('/notifications?limit=10').json<NotificationsListResponse>();
        setItems(res?.data ?? []);
        setUnread((res?.data ?? []).filter((n) => !n.readAt).length);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [auth.user]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [open]);

  const markAsRead = async (id: number) => {
    try {
      const res = await api.patch({}, `/notifications/${id}/mark-as-read`).json();
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, readAt: (res as any)?.data?.readAt ?? new Date().toISOString() } : it)));
      setUnread((u) => Math.max(0, u - 1));
    } catch (err) {
      console.error(err);
      toast.error({ title: 'Error', message: 'No se pudo marcar la notificación como leída' });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Button className="relative p-2 hover:bg-gray-100" onPress={() => setOpen((s) => !s)} aria-label="Notificaciones" color="default" size="sm" radius="full">
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{unread}</span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded z-50">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <strong>Notificaciones</strong>
              <Button className="text-sm text-blue-600" onPress={() => navigate('/notifications')} color="default" size="sm">Ver todas</Button>
            </div>
            <ul>
              {items.length === 0 && <li className="text-sm text-gray-500">No hay notificaciones</li>}
              {items.map((n) => (
                <li key={n.id} className={`p-2 rounded hover:bg-gray-50 flex justify-between items-start ${n.readAt ? 'opacity-60' : ''}`}>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-sm text-gray-600 truncate">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.readAt && (
                    <Button className="ml-2 text-sm text-blue-600" onPress={() => markAsRead(n.id)} color="default" size="sm">Marcar</Button>
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
