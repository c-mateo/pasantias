import React, { useEffect, useState } from "react";
import { api } from "~/api/api";
import { Link, TableCell } from "@heroui/react";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";
import AdminList2 from "~/components/AdminList2";
import type { ApplicationUserListResponse } from "~/api/types";

export default function Aplicaciones() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // TODO: use right type
        const res = await api.get("/admin/applications?limit=20").json();
        
        setApplications(res?.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /*
  // Search/sort (commented out — kept for future use)
  const [sort, setSort] = useState<string | undefined>(undefined);
  */
  const deleteApplication = (id: number) => setApplications((prev) => prev.filter((a) => a.id !== id));
  const deleteApplications = (ids: number[]) => setApplications((prev) => prev.filter((a) => !ids.includes(a.id)));
  /*
  // Search & sort helpers (commented out — kept for future use)
  const searchApplications = async () => {
    setLoading(true);
    try {
      const qs = [`limit=20`];
      if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);
      const res = await api.get(`/admin/applications?${qs.join('&')}`).res();
      const json = await res.json();
      setApplications(json?.data ?? []);
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
    // searchApplications();
  };
  */
  // AdminList2 will handle selection/confirmations

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
        title="Administrar Aplicaciones"
        columns={[
          { name: "candidate", label: "Candidato" },
          { name: "offer", label: "Oferta", renderer: (v) => v?.position ?? 'N/A' },
          { name: "status", label: "Estado", alignment: "center", renderer: (v) => (
            <div className="flex items-center gap-2 justify-center">
              <ApplicationStatusBadge status={v} />
            </div>
          )},
        ]}
        items={applications}
        loading={loading}
        hasMore={false}
        getId={(r) => r.id}
        getName={(r) => r.candidate?.name ?? r.user?.name ?? 'N/A'}
        onDeleteItem={(id) => deleteApplication(id)}
        onDeleteSelected={(ids) => deleteApplications(ids)}
        createHref="/admin/aplicaciones/nuevo"
      />
    </div>
  );
}
