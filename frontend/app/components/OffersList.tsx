import React, { useEffect, useState } from "react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router";
import { useAuthState } from "~/util/AuthContext";
import { api } from "~/api/api";
import toast from "~/util/toast";
import { formatDateTimeLocal } from "~/util/helpers";
import OfferCard from "./OfferCard";

export default function OffersList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuthState();

  const fetchOffers = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const qs: string[] = [`limit=10`];
      if (!reset && page) qs.push(`after=${page}`);
      const url = `/offers?${qs.join('&')}`;
      const res = await api.get(url).json<any>();
      const data = res?.data ?? [];
      setItems((prev) => (reset ? data : [...prev, ...data]));
      setPage(res?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
      toast.error({ title: "Error", message: "Error al cargar ofertas" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div>
        {items.length === 0 && !loading ? (
          <div className="text-gray-600">No se encontraron ofertas.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <OfferCard
                key={it.id}
                id={it.id}
                position={it.position}
                company={it.company?.name ?? 'N/A'}
                location={it.location}
                vacancies={it.vacancies}
                expiresAt={it.expiresAt}
                description={it.description}
                careers={(it.careers ?? it.courses) as any[]}
                skills={(it.skills ?? []).map((s: any) => s.name ?? s)}
                logo={it.company?.logo}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        {page ? (
          <Button onPress={() => fetchOffers(false)} disabled={loading}>{loading ? 'Cargando...' : 'Cargar más'}</Button>
        ) : null}
      </div>
    </div>
  );
}
