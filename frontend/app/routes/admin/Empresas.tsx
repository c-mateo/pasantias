import React, { useCallback, useEffect, useRef, useState } from "react";
import ActionButtons from "~/components/ActionButtons";
import type { Route } from "./+types/Empresas";
import type { HTMLInputTypeAttribute } from "react";
import { Modal } from "../../components/Modal";
import { useNavigate, useNavigation } from "react-router";

// Public view of a company
export type PublicCompany = {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  email: string;
  phone: string | null;
  logo: string | null;
};

// Admin are supposed to see this data
export type AdminCompany = {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  email: string;
  phone: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loader({ request }: Route.LoaderArgs) {
  const res = await fetch("http://localhost:5173/api/v1/companies?limit=10", {
    credentials: "include",
    headers: {
      Cookie: request.headers.get("Cookie") ?? "",
    },
  });

  // console.log("Companies fetch response:", res);
  if (!res.ok) {
    throw new Response("Failed to fetch companies", { status: res.status });
  }

  // console.log("Companies fetch JSON:", await res.clone().json());

  const data = await res.json();
  return {
    initialData: data.data as AdminCompany[],
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

export default function Empresas({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;

  const [companies, setCompanies] = useState<AdminCompany[]>(initialData || []);
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
    const total = companies.length;
    headerCheckboxRef.current.indeterminate =
      selected.size > 0 && selected.size < total;
  }, [selected, companies]);

  function toggleAll() {
    if (selected.size === companies.length) {
      setSelected(new Set());
      setSelectAllActive(false);
    } else {
      const all = new Set(companies.map((c) => c.id));
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

    const res = await fetch(`/api/v1/companies?limit=10&after=${page}`, {
      credentials: "include",
    });
    const body = await res.json();

    // Calcular la nueva lista de empresas a partir del estado actual y aplicar
    // la extensión de selección inmediatamente para minimizar parpadeos.
    const nextCompanies = [...companies, ...body.data];
    setCompanies(nextCompanies);

    // Si el modo "seleccionar todo" estaba activo, extender la selección
    if (selectAllActive && nextCompanies.length) {
      const all = new Set(nextCompanies.map((c) => c.id));
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

  const onDelete = (companyId: number) => () => {
    const companyName = companies.find((company) => company.id === companyId)?.name;
    setModal({
      isOpen: true,
      message: (
        <>
          {"¿Estás seguro de que deseas eliminar la empresa "}
          <b>{companyName}</b>
          {"? Esta acción no se puede deshacer."}
        </>
      ),
      action: () => {
        setCompanies((prev) => prev.filter((company) => company.id !== companyId));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(companyId);
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
        {"¿Estás seguro de que deseas eliminar las "}
        <b>{selected.size} empresas seleccionadas</b>
        {"? Esta acción no se puede deshacer."}
      </>),
      action: () => {
        setCompanies((prev) => prev.filter((company) => !selected.has(company.id)));
        setSelected(new Set());
        setModal({ ...modal, isOpen: false });
      },
    });
  };
  
  const navigate = useNavigate();

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        onConfirm={modal.action}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Administrar Empresas</h2>
        <div>
          {selected.size > 0 && (
            <button className="mr-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={onDeleteSelected}>
              Eliminar Seleccionados ({selected.size})
            </button>
          )}
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={() => navigate("/admin/empresas/nuevo")}>
            Crear Empresa
          </button>
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
                    selected.size === companies.length && companies.length > 0
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
                Teléfono
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Sitio Web
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Creado
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-t border-gray-300">
                <td className="px-4 pt-1 border-b border-gray-300">
                  <input
                    type="checkbox"
                    checked={selected.has(company.id)}
                    onChange={(e) => toggleOne(company.id, e.target.checked)}
                    className="w-4 h-4"
                    aria-label={`Seleccionar empresa ${company.name}`}
                  />
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300">
                  {company.name}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {company.email}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {company.phone || "N/A"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a> : "N/A"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {new Date(company.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500 border-b border-gray-300">
                  <ActionButtons
                    onEdit={() => console.log("Edit company", company.name)}
                    onDelete={onDelete(company.id)}
                    editHref={`/admin/empresas/${company.id}`}
                  />
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={7} className="border-t border-gray-300 text-center py-4">Cargando…</td>
              </tr>
            )}
            <tr ref={sentinelRef}>
              <td colSpan={7}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
