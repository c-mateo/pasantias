import React, { useCallback, useEffect, useState } from "react";
import OffersFilters from "~/components/OffersFilters";
import AdminList2 from "~/components/AdminList2";
import type { Route } from "./+types/Ofertas";
import type { HTMLInputTypeAttribute } from "react";
// Modal handled by AdminList now
import { useNavigate } from "react-router";
import { api } from "~/api/api";
import type { OfferListResponse, OfferListDTO } from "~/api/types";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const res = await api.get("/offers?limit=10").res();
  const json = await res.json();
  return {
    initialData: json?.data ?? [],
    pagination: json?.pagination ?? { next: null, prev: null },
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
  const [offers, setOffers] = useState<OfferListDTO[]>(initialData || []);
  /*
  // Search/filter state (commented out — kept for future use)
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<string | undefined>(undefined);
  */
  const [companies, setCompanies] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  /*
  // toggle sort cycle: undefined -> asc -> desc -> undefined (commented out)
  const cycleSort = (field: string) => {
    if (sort === field) {
      setSort(`-${field}`);
      searchOffers();
    } else if (sort === `-${field}`) {
      setSort(undefined);
      searchOffers();
    } else {
      setSort(field);
      searchOffers();
    }
  };
  */
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);
  // AdminList2 handles selection & modal internally
  const navigate = useNavigate();

  // AdminList manages header checkbox state and selection

  // selection handled by AdminList

  const loadMore = useCallback(async () => {
    if (!page || loading) return;
    setLoading(true);
    try {
      // Load more (no filters applied by default in admin list)
      const qs: string[] = [`limit=10`, `after=${page}`];
      const res = await api.get(`/offers?${qs.join('&')}`).res();
      const json = await res.json();
      const next = json?.data ?? [];
      setOffers((prev: OfferListDTO[]) => [...prev, ...next]);
      setPage(json?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  // AdminList2 handles infinite scroll internally via loadMore/hasMore

  useEffect(() => {
    (async () => {
      try {
        const compsRes = await api.get('/companies?limit=200').res();
        const compsJson = await compsRes.json();
        setCompanies(compsJson?.data ?? []);
      } catch (err) {}
      try {
        const csRes = await api.get('/courses?limit=200').res();
        const csJson = await csRes.json();
        setCourses(csJson?.data ?? []);
      } catch (err) {}
    })();
  }, []);

  /*
  // Search helper (commented out — kept for future use)
  const searchOffers = async () => {
    setLoading(true);
    try {
      const qs: string[] = [`limit=10`];
      if (q) qs.push(`q=${encodeURIComponent(q)}`);
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);
      if (selectedCompany) qs.push(`companyId=${selectedCompany}`);
      if (selectedCourses?.length) qs.push(`courses=${selectedCourses.join(',')}`);
      const res = await api.get(`/offers?${qs.join('&')}`).res();
      const json = await res.json();
      setOffers(json?.data ?? []);
      setPage(json?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  */

  const deleteOffer = (id: number) => setOffers((prev: OfferListDTO[]) => prev.filter((o) => o.id !== id));
  const deleteOffers = (ids: number[]) => setOffers((prev) => prev.filter((o) => !ids.includes(o.id)));



  // AdminList will show delete confirmation modals

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* Search & filters (commented out) */}
      {/**
      <OffersFilters
        q={q}
        setQ={setQ}
        sort={sort ?? "-publishedAt"}
        setSort={(s) => setSort(s)}
        companies={companies}
        courses={courses}
        selectedCompany={selectedCompany}
        setSelectedCompany={(id) => setSelectedCompany(id ?? null)}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
        remoteOnly={false}
        setRemoteOnly={() => {}}
        onSearch={searchOffers}
        className="w-full"
      />
      */}

      <AdminList2
        title="Administrar Ofertas"
        columns={[
          { name: "position", label: "Puesto" },
          { name: "company", label: "Empresa", alignment: "center", renderer: (v) => v?.name ?? "N/A" },
          { name: "vacancies", label: "Vacantes", alignment: "center" },
          { name: "expiresAt", label: "Fecha Límite", alignment: "center", renderer: (v) => (v ? new Date(v).toLocaleDateString() : "N/A") },
        ]}
        items={offers}
        loading={loading}
        hasMore={page !== null}
        loadMore={loadMore}
        getId={(o) => o.id}
        getName={(o) => o.position}
        onDeleteItem={(id) => deleteOffer(id)}
        onDeleteSelected={(ids) => deleteOffers(ids)}
        createHref="/admin/ofertas/nuevo"
      />

    </div>
  );
}
