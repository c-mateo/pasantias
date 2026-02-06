import React, { useEffect, useState, useMemo } from "react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router";
import { useAuthState } from "~/util/AuthContext";
import { api } from "~/api/api";
import toast from "~/util/toast";
import { formatDateTimeLocal } from "~/util/helpers";
import OfferCard from "./OfferCard";
import { Input } from "@heroui/react";

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

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "expiring" | "company">("newest");
  const [careerFilter, setCareerFilter] = useState<string>("");

  const careersOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      const cs = (it.careers ?? it.courses) as any[] | undefined;
      (cs || []).forEach((c) => set.add(typeof c === 'string' ? c : c.name));
    });
    return Array.from(set).sort();
  }, [items]);

  const displayed = useMemo(() => {
    let list = [...items];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((it) => (
        String(it.position ?? "").toLowerCase().includes(s) ||
        String(it.company?.name ?? "").toLowerCase().includes(s) ||
        String(it.description ?? "").toLowerCase().includes(s)
      ));
    }
    if (careerFilter) {
      list = list.filter((it) => {
        const cs = (it.careers ?? it.courses) as any[] | undefined;
        return (cs || []).some((c) => (typeof c === 'string' ? c : c.name) === careerFilter);
      });
    }
    if (sort === "expiring") {
      list.sort((a, b) => {
        const aa = a.expiresAt || '';
        const bb = b.expiresAt || '';
        return aa.localeCompare(bb);
      });
    } else if (sort === "company") {
      list.sort((a, b) => String(a.company?.name ?? '').localeCompare(String(b.company?.name ?? '')));
    } else {
      list.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
    }
    return list;
  }, [items, search, careerFilter, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 w-full max-w-2xl">
          <Input
            placeholder="Buscar ofertas..."
            isClearable
            value={search}
            onValueChange={(v) => setSearch(String(v))}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border border-gray-200 rounded" value={careerFilter} onChange={(e) => setCareerFilter(e.target.value)}>
            <option value="">Todas las carreras</option>
            {careersOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded" value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="newest">Más recientes</option>
            <option value="expiring">Por expirar</option>
            <option value="company">Empresa A-Z</option>
          </select>
        </div>
      </div>

      <div>
        {displayed.length === 0 && !loading ? (
          <div className="text-gray-600">No se encontraron ofertas.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((it) => (
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
