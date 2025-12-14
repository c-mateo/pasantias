import React, { useEffect, useRef, useState } from "react";
import AdminList from "~/components/AdminList";
import { Button } from "@heroui/button";

const initialApplications = [
  { candidate: "Luis Martínez", offer: "Desarrollador Frontend", status: "Pendiente" },
  { candidate: "Sofía Ramírez", offer: "Analista de Datos", status: "Aceptado" },
];

export default function Aplicaciones() {
  const [applications, setApplications] = useState(initialApplications);
  // selection & modal handled by AdminList now

  const deleteApplication = (i:number) => setApplications((prev)=> prev.filter((_, idx) => idx !== i));
  const deleteApplications = (ids:number[]) => setApplications((prev)=> prev.filter((_, idx) => !ids.includes(idx)));

  // selection & modal handled by AdminList now

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* AdminList shows title and actions */}
      <AdminList<{ candidate: string; offer: string; status: string }>
        headers={[{ label: 'Candidato' }, { label: 'Oferta' }, { label: 'Estado' }]}
        items={applications}
        loading={false}
        sentinelRef={undefined}
        title="Administrar Aplicaciones"
        getId={(a) => applications.indexOf(a)}
        getName={(a) => a.candidate}
        onDeleteItem={(id) => deleteApplication(id)}
        onDeleteSelected={(ids) => deleteApplications(ids)}
        renderCells={(application) => (
          <>
            <td className="px-4 py-2 text-sm text-gray-900 border-b border-gray-300 align-middle">{application.candidate}</td>
            <td className="px-4 py-2 text-sm text-gray-500 border-b border-gray-300 align-middle">{application.offer}</td>
            <td className="px-4 py-2 border-b border-gray-300 text-center align-middle"><span className="inline-block rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium">{application.status}</span></td>
          </>
        )}
      />

      {/* AdminList handles confirmation Modals */}
    </div>
  );
}
