import React, { useEffect, useState } from "react";
import { requireUser } from "~/util/AuthContext";
import { redirect } from "react-router";
import { api } from "~/api/api";
import { Link } from "@heroui/react";

export async function clientLoader() {
  const user = await requireUser();
  if (!user) throw redirect("/login");
}

export default function MyApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const a = await api.get("/my-applications").json();
        const d = await api.get("/my-drafts").json();
        const appsData = (a as any).data ?? [];
        const draftsData = (d as any).data ?? [];

        if (appsData.length === 0 && draftsData.length === 0) {
          const hidden = typeof window !== 'undefined' && localStorage.getItem('applications:demoHidden') === '1'
          if (!hidden) {
            const { demoApplications, demoDrafts } = await import("~/components/ApplicationsDemo");
            setApps(demoApplications);
            setDrafts(demoDrafts);
            setIsDemo(true);
          } else {
            setApps([]);
            setDrafts([]);
            setIsDemo(false);
          }
        } else {
          setApps(appsData);
          setDrafts(draftsData);
          setIsDemo(false);
        }
      } catch (err) {
        console.error(err);
        // Fall back to demo data when API is not available or empty
        const { demoApplications, demoDrafts } = await import("~/components/ApplicationsDemo");
        const hidden = typeof window !== 'undefined' && localStorage.getItem('applications:demoHidden') === '1'
        if (!hidden) {
          setApps(demoApplications);
          setDrafts(demoDrafts);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hidden = localStorage.getItem('applications:demoHidden') === '1'
    if (hidden) setApps([])
    setDemoHidden(hidden)
  }, [])

  const removeDraft = async (offerId: number) => {
    if (!confirm("Eliminar borrador?")) return;
    try {
      await api.delete(`/offers/${offerId}/draft`).res();
      setDrafts((prev) => prev.filter((p) => p.offer.id !== offerId));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el borrador");
    }
  };

  const [demoHidden, setDemoHidden] = React.useState(false)

  const clearDemo = () => {
    setApps([])
    setDrafts([])
    setDemoHidden(true)
    if (typeof window !== 'undefined') localStorage.setItem('applications:demoHidden', '1')
  }

  const restoreDemo = async () => {
    const { demoApplications, demoDrafts } = await import("~/components/ApplicationsDemo");
    setApps(demoApplications)
    setDrafts(demoDrafts)
    setDemoHidden(false)
    if (typeof window !== 'undefined') localStorage.removeItem('applications:demoHidden')
  }

  if (loading) return <div className="p-6">Cargando...</div>;

  // `isDemo` is managed by state when demo data is loaded or forced
  // derived: const isDemo = apps.length > 0 && String(apps[0].id).startsWith('1') && (apps[0].offer?.company?.name === 'Acme S.A.' || apps[0].offer?.company?.name === 'DataCorp');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Mis solicitudes</h1>
        {!isDemo && (
          <div>
            <button className="text-sm text-blue-600" onClick={restoreDemo}>Mostrar datos de ejemplo</button>
          </div>
        )}
      </div>

      {isDemo && !demoHidden && (
        <div className="mb-4 flex items-center justify-between gap-4 p-3 rounded bg-yellow-50 border-l-4 border-yellow-300 text-yellow-800">
          <div>Mostrando datos de ejemplo para previsualización.</div>
          <div>
            <button className="text-sm text-red-600" onClick={clearDemo}>Limpiar demo</button>
          </div>
        </div>
      )}

      {demoHidden && (
        <div className="mb-4 flex items-center justify-between gap-4 p-3 rounded bg-gray-50 border-l-4 border-gray-200 text-gray-700">
          <div>Datos de ejemplo ocultos.</div>
          <div>
            <button className="text-sm text-blue-600" onClick={restoreDemo}>Restaurar demo</button>
          </div>
        </div>
      )}

      <section className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Solicitudes enviadas</h2>
        {apps.length === 0 ? (
          <div className="text-sm text-gray-600">No hay solicitudes enviadas.</div>
        ) : (
          <ul className="space-y-3">
            {apps.map((a) => (
              <li key={a.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{a.offer.position}</div>
                  <div className="text-sm text-gray-600">{a.offer.company?.name}</div>
                </div>
                <div className="text-sm text-gray-600 text-right">
                  <div>{a.status}</div>
                  <div className="text-xs">{new Date(a.createdAt).toLocaleString()}</div>
                  <div className="mt-2">
                    <Link href={`/ofertas/${a.offer.id}`}>Ver oferta</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Solicitudes sin finalizar (Borradores)</h2>
        {drafts.length === 0 ? (
          <div className="text-sm text-gray-600">No hay borradores.</div>
        ) : (
          <ul className="space-y-3">
            {drafts.map((d) => (
              <li key={d.offer.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{d.offer.position}</div>
                  <div className="text-sm text-gray-600">{d.offer.company?.name}</div>
                  <div className="text-xs text-gray-500">Documentos cargados: {d.attachmentsCount}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/ofertas/${d.offer.id}`}>Continuar</Link>
                  <button className="text-red-600" onClick={() => removeDraft(d.offer.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
