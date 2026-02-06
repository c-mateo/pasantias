import { useState } from "react";
import { useList } from "../../util/useList";
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
  const {
    items: companies,
    hasMore,
    loading,
    loadMore,
    deleteItems,
    sortDescriptor,
    setSortDescriptor,
  } = useList<CompanyDTO>({
    endpoint: "/companies",
    deleteEndpoint: "/admin/companies",
    chunk: 10,
    initialData: loaderData.initialData ?? [],
    initialPage: loaderData.pagination?.next ?? null,
  });

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

  // useList handles loading & pagination

  // AdminList2 handles infinite scroll via loadMore/hasMore

  const deleteCompany = (companyId: number) => deleteItems([companyId]);
  const deleteCompanies = (ids: number[]) => deleteItems(ids);

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* Table for companies (controlled selection + modals), removed 'Creado' column */}
      <AdminList2
        canCreate
        canDelete
        title="Administrar Empresas"
        columns={[
          { name: "name", label: "Nombre", sortable: true },
          { name: "email", label: "Email", alignment: "center", sortable: true },
          { name: "phone", label: "Teléfono", alignment: "center", renderer: (v) => v || 'N/A' },
          { name: "website", label: "Sitio Web", alignment: "center", renderer: (v) => (v ? <a href={v} target="_blank" rel="noopener noreferrer" className="hover:underline">{v}</a> : 'N/A') },
        ]}
        items={companies}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        getId={(c) => c.id}
        getName={(c) => c.name}
        onDeleteItem={(id) => deleteCompany(id)}
        onDeleteSelected={(ids) => deleteCompanies(ids)}
        createHref="/admin/empresas/nuevo"
      />
    </div>
  );
}
