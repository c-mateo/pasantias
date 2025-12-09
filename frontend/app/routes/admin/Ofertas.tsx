import React, { useCallback, useEffect, useRef, useState } from "react";
import ActionButtons from "~/components/ActionButtons";
import type { Route } from "./+types/Ofertas";
import type { HTMLInputTypeAttribute } from "react";
import { Modal } from "../../components/Modal";
import { useNavigate } from "react-router";
 
export type PublicOffer = {
  id: number;
  position: string;
  company: string;
  description: string | null;
  vacancies: number | null;
  applicationDeadline: string | null;
};

export type AdminOffer = {
  id: number;
  position: string;
  companyId?: number;
  company?: string;
  description: string | null;
  requirements: string | null;
  vacancies: number | null;
  applicationDeadline: string | null;
  createdAt: string;
  updatedAt: string;
};
// import { Autocomplete, Chip, TextField } from "@mui/material";

const offers = [
  { id: 1, position: "Desarrollador Frontend", company: "TechCorp", vacancies: 3, applicationDeadline: "2025-08-15", description: "Desarrollar interfaces de usuario modernas." },
  { id: 2, position: "Analista de Datos", company: "DataSolutions", vacancies: 1, applicationDeadline: "2025-08-20", description: "Analizar grandes volúmenes de datos para obtener insights." },
];

type Course = {
  id: number;
  name: string;
  visible?: boolean;
};

  
  
  

    export async function loader({ request }: Route.LoaderArgs) {
      const res = await fetch("http://localhost:5173/api/v1/offers?limit=10", {
        credentials: "include",
        headers: {
          Cookie: request.headers.get("Cookie") ?? "",
        },
      });

      if (!res.ok) {
        throw new Response("Failed to fetch offers", { status: res.status });
      }

      const data = await res.json();
      return {
        initialData: data.data as AdminOffer[],
        pagination: data.pagination,
      };
    }

    function useIntersectionObserver<T extends HTMLElement>(ref: React.RefObject<T | null>, onVisible: () => void, options: IntersectionObserverInit = {}) {
      useEffect(() => {
        if (!ref?.current) return;
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) onVisible();
        }, options);
        const el = ref.current;
        if (el) observer.observe(el);
        return () => el && observer.unobserve(el);
      }, [ref, options, onVisible]);
    }

    export default function Ofertas({ loaderData }: Route.ComponentProps) {
      const { initialData, pagination } = loaderData;
      const [offers, setOffers] = useState<AdminOffer[]>(initialData || []);
      const [page, setPage] = useState(pagination.next);
      const [loading, setLoading] = useState(false);
      const [selected, setSelected] = useState(() => new Set<number>());
      const [selectAllActive, setSelectAllActive] = useState(false);
      const [modal, setModal] = useState({ isOpen: false, message: <></>, action: () => {} });

      const headerRef = useRef<HTMLInputElement | null>(null);
      const sentinelRef = useRef<HTMLTableRowElement | null>(null);
      const navigate = useNavigate();

      useEffect(() => {
        if (!headerRef.current) return;
        const total = offers.length;
        headerRef.current.indeterminate = selected.size > 0 && selected.size < total;
      }, [selected, offers]);

      function toggleAll() {
        if (selected.size === offers.length) {
          setSelected(new Set());
          setSelectAllActive(false);
        } else {
          const all = new Set(offers.map((o) => o.id));
          setSelected(all);
          setSelectAllActive(true);
        }
      }

      function toggleOne(id: number, checked: boolean) {
        setSelected((prev) => {
          const next = new Set(prev);
          if (checked) next.add(id);
          else next.delete(id);
          if (!checked && selectAllActive) setSelectAllActive(false);
          return next;
        });
      }

      const loadMore = useCallback(async () => {
        if (!page || loading) return;
        setLoading(true);
        const res = await fetch(`/api/v1/offers?limit=10&after=${page}`, { credentials: "include" });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const body = await res.json();
        const nextOffers = [...offers, ...body.data];
        setOffers(nextOffers);

        if (selectAllActive && nextOffers.length) {
          const all = new Set(nextOffers.map((o) => o.id));
          setSelected(all);
        }

        setPage(body.pagination.next);
        setLoading(false);
      }, [page, loading, offers, selectAllActive]);

      useIntersectionObserver(sentinelRef, loadMore);

      useEffect(() => {
        if (!page) return;
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && !loading) loadMore();
        });
        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
      }, [page, loading, loadMore]);

      const onDelete = (offerId: number) => () => {
        const pos = offers.find((o) => o.id === offerId)?.position;
        setModal({ isOpen: true, message: (<>{"¿Estás seguro de que deseas eliminar la oferta "}<b>{pos}</b>{"? Esta acción no se puede deshacer."}</>), action: () => { setOffers((prev) => prev.filter((o) => o.id !== offerId)); setSelected((prev) => { const next = new Set(prev); next.delete(offerId); return next; }); setModal({ ...modal, isOpen: false }); } });
      };

      const onDeleteSelected = () => {
        setModal({ isOpen: true, message: (<>{"¿Estás seguro de que deseas eliminar las "}<b>{selected.size} ofertas seleccionadas</b>{"? Esta acción no se puede deshacer."}</>), action: () => { setOffers((prev) => prev.filter((o) => !selected.has(o.id))); setSelected(new Set()); setModal({ ...modal, isOpen: false }); } });
      };

      return (
        <div className="px-4 py-3 max-w-4xl mx-auto">
          <Modal isOpen={modal.isOpen} message={modal.message} onConfirm={modal.action} onCancel={() => setModal({ ...modal, isOpen: false })} />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Administrar Ofertas</h2>
            <div>
              {selected.size > 0 && (<button className="mr-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={onDeleteSelected}>Eliminar Seleccionados ({selected.size})</button>)}
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={() => navigate('/admin/ofertas/nuevo')}>Crear Oferta</button>
            </div>
          </div>
          <div className="flex rounded-xl border border-gray-300 bg-white shadow-md overflow-y-auto max-h-[550px] scrollbar-none">
            <table className="w-full h-20 border-separate border-spacing-0">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 pt-1 border-b border-gray-300"><input ref={headerRef} type="checkbox" checked={selected.size === offers.length && offers.length > 0} onChange={() => toggleAll()} className="w-4 h-4" aria-label="Seleccionar todo" /></th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">Puesto</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">Empresa</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">Vacantes</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">Fecha Límite</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id} className="border-t border-gray-300">
                    <td className="px-4 pt-1 border-b border-gray-300"><input type="checkbox" checked={selected.has(offer.id)} onChange={(e) => toggleOne(offer.id, e.target.checked)} className="w-4 h-4" aria-label={`Seleccionar oferta ${offer.position}`} /></td>
                    <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300">{offer.position}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{offer.company ?? 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{offer.vacancies ?? 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{offer.applicationDeadline ? new Date(offer.applicationDeadline).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-3 py-2 text-sm text-gray-500 border-b border-gray-300"><ActionButtons onDelete={onDelete(offer.id)} editHref={`/admin/ofertas/${offer.id}`} /></td>
                  </tr>
                ))}
                {loading && (<tr><td colSpan={6} className="border-t border-gray-300 text-center py-4">Cargando…</td></tr>)}
                <tr ref={sentinelRef}><td colSpan={6}></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

