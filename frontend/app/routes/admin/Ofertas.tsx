import React, { useCallback, useEffect, useRef, useState } from "react";
import AdminList from "~/components/AdminList"; 
import { Button } from "@heroui/button";
import type { Route } from "./+types/Ofertas";
import type { HTMLInputTypeAttribute } from "react";
// Modal handled by AdminList now
import { useNavigate } from "react-router";
import { api } from "~/api/api";
import type { OffersListResponse, OfferDTO } from "~/api/types";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const res = await api.get("/offers?limit=10").json<OffersListResponse>();
  return {
    initialData: res?.data ?? [],
    pagination: res?.pagination ?? { next: null, prev: null },
  };
}

function useIntersectionObserver<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onVisible: () => void,
  options: IntersectionObserverInit = {},
) {
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
  const [offers, setOffers] = useState(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);
  // selection & modal handled by AdminList now
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);
  const navigate = useNavigate();

  // AdminList manages header checkbox state and selection

  // selection handled by AdminList

  const loadMore = useCallback(async () => {
    if (!page || loading) return;
    setLoading(true);
    try {
      const res = await api.get(`/offers?limit=10&after=${page}`).json<OffersListResponse>();
      const next = res?.data ?? [];
      setOffers((prev) => [...prev, ...next]);
      setPage(res?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  useIntersectionObserver(sentinelRef, loadMore);

  useEffect(() => {
    if (!page) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading) loadMore();
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, loading, loadMore]);

  const deleteOffer = (id: number) => setOffers((prev) => prev.filter((o) => o.id !== id));
  const deleteOffers = (ids: number[]) => setOffers((prev) => prev.filter((o) => !ids.includes(o.id)));

  // AdminList will show delete confirmation modals

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* AdminList handles its confirmation modals */}
      {/* AdminList shows title and create button */}
      <AdminList<OfferDTO>
        headers={[
          { label: 'Puesto' },
          { label: "Puesto" },
          { label: "Empresa", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
          { label: "Vacantes", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
          { label: "Fecha Límite", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
        ]}
          items={offers}
        loading={loading}
        sentinelRef={sentinelRef}
          getId={(o) => o.id}
          getName={(o) => o.position}
            renderCells={(offer) => (
            <>
              <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300">{offer.position}</td>
              <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{offer.company?.name ?? "N/A"}</td>
              <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{offer.vacancies ?? "N/A"}</td>
              <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : "N/A"}</td>
            </>
          )}
          onDeleteItem={(id) => deleteOffer(id)}
          onDeleteSelected={(ids) => deleteOffers(ids)}
          title="Administrar Ofertas"
          createHref="/admin/ofertas/nuevo"
      />
    </div>
  );
}
