import React, { useCallback, useEffect, useRef, useState } from "react";
import AdminList from "~/components/AdminList";
import { Button } from "@heroui/button";
import type { Route } from "./+types/Empresas";
import type { HTMLInputTypeAttribute } from "react";
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

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
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

function useIntersectionObserver<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onVisible: () => void,
  options: IntersectionObserverInit = {},
): boolean {
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
  // modal and selection state are handled by AdminList now

  const sentinelRef = useRef<HTMLTableRowElement>(null);

  // selection handled by AdminList

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

    // AdminList handles selection state; we only update companies on loadMore

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

  const deleteCompany = (companyId: number) => {
    setCompanies((prev) => prev.filter((company) => company.id !== companyId));
  };

  const deleteCompanies = (ids: number[]) => {
    setCompanies((prev) => prev.filter((company) => !ids.includes(company.id)));
  };

  const navigate = useNavigate();

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* Modal handled internally by AdminList */}
      {/* AdminList handles title, create and delete selected actions */}
      <AdminList<AdminCompany>
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
