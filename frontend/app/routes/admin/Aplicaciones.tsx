import React, { useEffect, useRef, useState } from "react";
import ActionButtons from "../../components/ActionButtons";

const applications = [
  { candidate: "Luis Martínez", offer: "Desarrollador Frontend", status: "Pendiente" },
  { candidate: "Sofía Ramírez", offer: "Analista de Datos", status: "Aceptado" },
];

export default function Aplicaciones() {
  const [selected, setSelected] = useState(() => new Set<number>());
  const headerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    headerRef.current.indeterminate = selected.size > 0 && selected.size < applications.length;
  }, [selected]);

  function toggleAll() {
    if (selected.size === applications.length) setSelected(new Set());
    else setSelected(new Set(applications.map((_, i) => i)));
  }

  function toggleOne(i: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(i);
      else next.delete(i);
      return next;
    });
  }

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Administrar Aplicaciones</h2>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                <input
                  ref={headerRef}
                  type="checkbox"
                  checked={selected.size === applications.length && applications.length > 0}
                  onChange={() => toggleAll()}
                  className="w-4 h-4"
                  aria-label="Seleccionar todo"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Candidato
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Oferta
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application, i) => (
              <tr key={i} className="border-t border-gray-300">
                <td className="px-4 py-2 text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={(e) => toggleOne(i, e.target.checked)}
                    className="w-4 h-4"
                    aria-label={`Seleccionar aplicacion ${application.candidate}`}
                  />
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {application.candidate}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {application.offer}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-block rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium">
                    {application.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <ActionButtons
                    onEdit={() => console.log("Edit application", application.candidate)}
                    onDelete={() => console.log("Delete application", application.candidate)}
                    editHref={`#/aplicaciones/edit/${i}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
