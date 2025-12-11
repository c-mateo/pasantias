import React, { useEffect, useRef, useState } from "react";
import ActionButtons from "~/components/ActionButtons";
import { Button } from "@heroui/button";
import type { Route } from "./+types/Usuarios";
import { Modal } from "../../components/Modal";

// Admin view of a user
export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  deletedAt: string | null;
  createdAt: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: No existe el endpoint aún
  const res = await fetch("http://localhost:5173/api/v1/admin/users?limit=10", {
    credentials: "include",
    headers: {
      Cookie: request.headers.get("Cookie") ?? "",
    },
  });
  
  if (!res.ok) {
    console.log("Failed to fetch users");
    throw new Response("Failed to fetch users", { status: res.status });
  }

  const data = await res.json();
  return {
    initialData: data.data as AdminUser[],
    pagination: data.pagination,
  };
}

function useIntersectionObserver<T extends HTMLElement>(ref: React.RefObject<T|null>, onVisible: () => void, options: IntersectionObserverInit = {}): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref?.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onVisible();
      }
      setIsVisible(entry.isIntersecting);
    }, options);

    const el = ref.current;
    if (el) observer.observe(el);
    return () => el && observer.unobserve(el);
  }, [ref, options, onVisible]);

  return isVisible;
}

export default function Usuarios({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;

  const [users, setUsers] = useState<AdminUser[]>(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(() => new Set<number>());
  const [selectAllActive, setSelectAllActive] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: <></>,
    action: () => {},
  });

  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

  const sentinelRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const total = users.length;
    headerCheckboxRef.current.indeterminate =
      selected.size > 0 && selected.size < total;
  }, [selected, users]);

  function toggleAll() {
    if (selected.size === users.length) {
      setSelected(new Set());
      setSelectAllActive(false);
    } else {
      const all = new Set(users.map((user) => user.id));
      setSelected(all);
      setSelectAllActive(true);
    }
  }

  function toggleOne(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      // If user manually deselects one while select-all-mode was active, disable selectAllActive
      if (!checked && selectAllActive) setSelectAllActive(false);
      return next;
    });
  }

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);

    const res = await fetch(`/api/v1/users?limit=10&after=${page}`, {
      credentials: "include",
    });
    const body = await res.json();

    // Calcular la nueva lista de usuarios a partir del estado actual y aplicar
    // la extensión de selección inmediatamente para minimizar parpadeos.
    const nextUsers = [...users, ...body.data];
    setUsers(nextUsers);

    // Si el modo "seleccionar todo" estaba activo, extender la selección
    if (selectAllActive && nextUsers.length) {
      const all = new Set(nextUsers.map((user) => user.id));
      setSelected(all);
    }

    setPage(body.pagination.next); // null si no hay más

    setLoading(false);
  };

  useIntersectionObserver(sentinelRef, loadMore);
  
  useEffect(() => {
    if (!page) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading) {
        loadMore();
      }
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [page, loading, loadMore]);

  const onDelete = (userId: number) => () => {
    const userName = users.find((user) => user.id === userId)?.firstName + " " + users.find((user) => user.id === userId)?.lastName;
    setModal({
      isOpen: true,
      message: (
        <>
          {"¿Estás seguro de que deseas eliminar al usuario "}
          <b>{userName}</b>
          {"? Esta acción no se puede deshacer."}
        </>
      ),
      action: () => {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        setModal({ ...modal, isOpen: false });
      },
    });
  };

  const onDeleteSelected = () => {
    setModal({
      isOpen: true,
      message: (<>
        {"¿Estás seguro de que deseas eliminar a los "}
        <b>{selected.size} usuarios seleccionados</b>
        {"? Esta acción no se puede deshacer."}
      </>),
      action: () => {
        setUsers((prev) => prev.filter((user) => !selected.has(user.id)));
        setSelected(new Set());
        setModal({ ...modal, isOpen: false });
      },
    });
  };
  
  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        onConfirm={modal.action}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Administrar Usuarios</h2>
        <div>
          {selected.size > 0 && (
            <Button className="mr-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={onDeleteSelected}>
              Eliminar Seleccionados ({selected.size})
            </Button>
          )}
        </div>
      </div>
      <div className="flex rounded-xl border border-gray-300 bg-white shadow-md overflow-y-auto max-h-[550px] scrollbar-none">
        <table className="w-full h-20 border-separate border-spacing-0">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 pt-1 border-b border-gray-300">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={
                    selected.size === users.length && users.length > 0
                  }
                  onChange={() => toggleAll()}
                  className="w-4 h-4"
                  aria-label="Seleccionar todo"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                Nombre
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Email
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Rol
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Estado
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-300">
                <td className="px-4 pt-1 border-b border-gray-300">
                  <input
                    type="checkbox"
                    checked={selected.has(user.id)}
                    onChange={(e) => toggleOne(user.id, e.target.checked)}
                    className="w-4 h-4"
                    aria-label={`Seleccionar usuario ${user.firstName} ${user.lastName}`}
                  />
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {user.email}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {user.role}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {user.deletedAt ? "Inactivo" : "Activo"}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500 border-b border-gray-300">
                  <ActionButtons
                    onDelete={onDelete(user.id)}
                  />
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={6} className="border-t border-gray-300 text-center py-4">Cargando…</td>
              </tr>
            )}
            <tr ref={sentinelRef}>
              <td colSpan={6}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
