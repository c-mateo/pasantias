import { useState } from "react";
import type { Route } from "./+types/Empresas";
import { api } from "~/api/api";
import type { AdminCompanyListResponse, CompanyDTO } from "~/api/types";
import AdminList2 from "~/components/AdminList2";


export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const res = await api.get("/companies?limit=10").res();
  const json = await res.json();
  return {
    initialData: json?.data ?? [],
    pagination: json?.pagination ?? { next: null, prev: null },
  };
}

export default function Empresas({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;

  const [companies, setCompanies] = useState<CompanyDTO[]>(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<string | undefined>(undefined);

  /*
  // Search & sort helpers (commented out — kept for future use)
  const searchCompanies = async () => {
    setLoading(true);
    try {
      const qs = [`limit=10`];
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);
      const res = await api.get(`/companies?${qs.join('&')}`).res();
      const json = await res.json();
      setCompanies(json?.data ?? []);
      setPage(json?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cycleSort = (field: string) => {
    if (sort === field) setSort(`-${field}`);
    else if (sort === `-${field}`) setSort(undefined);
    else setSort(field);
    // searchCompanies();
  };
  */

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);

    const qs = [`limit=10`, `after=${page}`];
    if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);

    const res = await api.get(`/companies?${qs.join('&')}`).res();
    const json = await res.json();
    const next = json?.data ?? [];
    setCompanies((prev) => [...prev, ...next]);
    setPage(json?.pagination?.next ?? null); // null si no hay más
    setLoading(false);
  };

  // AdminList2 handles infinite scroll via loadMore/hasMore

  const deleteCompany = (companyId: number) => {
    setCompanies((prev) => prev.filter((company) => company.id !== companyId));
  };
  const deleteCompanies = (ids: number[]) => {
    setCompanies((prev) => prev.filter((company) => !ids.includes(company.id)));
  };

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* Table for companies (controlled selection + modals), removed 'Creado' column */}
      <AdminList2
        title="Administrar Empresas"
        columns={[
          { name: "name", label: "Nombre", sortable: true },
          { name: "email", label: "Email", alignment: "center", sortable: true },
          { name: "phone", label: "Teléfono", alignment: "center", renderer: (v) => v || 'N/A' },
          { name: "website", label: "Sitio Web", alignment: "center", renderer: (v) => (v ? <a href={v} target="_blank" rel="noopener noreferrer" className="hover:underline">{v}</a> : 'N/A') },
        ]}
        items={companies}
        loading={loading}
        hasMore={page !== null}
        loadMore={loadMore}
        getId={(c) => c.id}
        getName={(c) => c.name}
        onDeleteItem={(id) => deleteCompany(id)}
        onDeleteSelected={(ids) => deleteCompanies(ids)}
        createHref="/admin/empresas/nuevo"
      />
    </div>
  );
}
