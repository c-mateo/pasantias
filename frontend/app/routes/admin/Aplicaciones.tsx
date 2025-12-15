import React, { useEffect, useRef, useState } from "react";
import AdminList from "~/components/AdminList";
import { api } from "~/api/api";
import { Link } from "@heroui/react";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";

export default function Aplicaciones() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/applications?limit=20").json();
        const data = (res as any)?.data ?? [];
        setApplications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const deleteApplication = (id: number) => setApplications((prev) => prev.filter((a) => a.id !== id));
  const deleteApplications = (ids: number[]) => setApplications((prev) => prev.filter((a) => !ids.includes(a.id)));

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList<any>
        headers={[{ label: 'Candidato' }, { label: 'Oferta' }, { label: 'Estado' }]}
        items={applications}
        loading={loading}
        sentinelRef={undefined}
        title="Administrar Aplicaciones"
        getId={(a) => a.id}
        getName={(a) => `${a.offer?.position} - ${a.offer?.company?.name}`}
        onDeleteItem={(id) => deleteApplication(id)}
        onDeleteSelected={(ids) => deleteApplications(ids)}
        renderCells={(application) => (
          <>
            <td className="px-4 py-2 text-sm text-gray-900 border-b border-gray-300 align-middle">{application.offer?.position}</td>
            <td className="px-4 py-2 text-sm text-gray-500 border-b border-gray-300 align-middle">{application.offer?.company?.name}</td>
            <td className="px-4 py-2 border-b border-gray-300 text-center align-middle">
              <div className="flex items-center gap-2 justify-center">
                <ApplicationStatusBadge status={application.status} />
                <Link href={`/admin/aplicaciones/${application.id}`} className="text-sm text-blue-600">Ver</Link>
              </div>
            </td>
          </>
        )}
      />
    </div>
  );
}
