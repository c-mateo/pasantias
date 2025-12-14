import { useEffect, useRef, useState } from "react";
import AdminList from "~/components/AdminList";
import type { Route } from "./+types/Empresas";
import { api } from "~/api/api";
import type { AdminCompanyListResponse } from "~/api/types";
import { useIntersectionObserver } from "~/hooks/useIntersectionObserver";


export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const res = await api.get("/companies?limit=10").json<AdminCompanyListResponse>();

  return {
    initialData: res?.data ?? [],
    pagination: res?.pagination ?? { next: null, prev: null },
  };
}

export default function Empresas({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;

  const [companies, setCompanies] = useState(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef<HTMLTableRowElement>(null);

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);

    const res = await api.get(`/companies?limit=10&after=${page}`).json<AdminCompanyListResponse>();

    // Calcular la nueva lista de empresas a partir del estado actual y aplicar
    // la extensión de selección inmediatamente para minimizar parpadeos.
    const next = res?.data ?? [];
    setCompanies((prev) => [...prev, ...next]);

    // AdminList handles selection state; we only update companies on loadMore

    setPage(res?.pagination?.next ?? null); // null si no hay más

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

  const deleteCompany = (companyId: number) => {
    setCompanies((prev) => prev.filter((company) => company.id !== companyId));
  };

  const deleteCompanies = (ids: number[]) => {
    setCompanies((prev) => prev.filter((company) => !ids.includes(company.id)));
  };

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* Modal handled internally by AdminList */}
      {/* AdminList handles title, create and delete selected actions */}
      <AdminList
        headers={[
          { label: "Nombre" },
          { label: "Email", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
          { label: "Teléfono", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
          { label: "Sitio Web", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
          { label: "Creado", className: "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300" },
        ]}
        items={companies}
        loading={loading}
        sentinelRef={sentinelRef}
        title="Administrar Empresas"
        createHref="/admin/empresas/nuevo"
        getId={(c) => c.id}
        getName={(c) => c.name}
        onDeleteItem={(id) => deleteCompany(id)}
        onDeleteSelected={(ids) => deleteCompanies(ids)}
        renderCells={(company) => (
          <>
            <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300">{company.name}</td>
            <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{company.email}</td>
            <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{company.phone || "N/A"}</td>
            <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{
              company.website ? (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{company.website}</a>
              ) : (
                "N/A"
              )
            }</td>
            <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">{new Date(company.createdAt).toLocaleDateString()}</td>
          </>
        )}
      />
    </div>
  );
}
