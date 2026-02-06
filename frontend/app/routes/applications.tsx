import React, { useEffect, useState } from "react";
import { requireUser } from "~/util/AuthContext";
import { redirect } from "react-router";
import { api } from "~/api/api";
import { formatDateTimeLocal } from "~/util/helpers";
import toast from "~/util/toast";
import { Modal } from "~/components/Modal";
import { Link } from "@heroui/react";
import { Button } from "@heroui/button";

export async function clientLoader() {
  const user = await requireUser();
  if (!user) throw redirect("/login");
}

export default function MyApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    (async () => {
      try {
        const a = await api.get("/my-applications").json();
        const d = await api.get("/my-drafts").json();
        const appsData = (a as any).data ?? [];
        const draftsData = (d as any).data ?? [];
        setApps(appsData);
        setDrafts(draftsData);
      } catch (err) {
        console.error(err);
        // If API call fails, show empty lists
        setApps([]);
        setDrafts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const removeDraft = async (offerId: number) => {
    setPendingDraftId(offerId);
    setShowDeleteDraftModal(true);
  };

  const [showDeleteDraftModal, setShowDeleteDraftModal] = useState(false);
  const [pendingDraftId, setPendingDraftId] = useState<number | null>(null);

  const confirmDeleteDraft = async () => {
    if (!pendingDraftId) return setShowDeleteDraftModal(false);
    try {
      await api.delete(`/offers/${pendingDraftId}/draft`).res();
      setDrafts((prev) => prev.filter((p) => p.offer.id !== pendingDraftId));
      toast.success({ title: 'Eliminado', message: 'Borrador eliminado' });
    } catch (err) {
      console.error(err);
      toast.error({ title: 'Error', message: 'No se pudo eliminar el borrador' });
    } finally {
      setShowDeleteDraftModal(false);
      setPendingDraftId(null);
    }
  };


  if (loading) return <div className="p-6">Cargando...</div>;

  // `isDemo` can ser detectado a partir de los datos; actualmente se maneja desde estado.

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Mis solicitudes</h1>
        <div />
      </div>
      

      <section className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Solicitudes enviadas</h2>
        {apps.length === 0 ? (
          <div className="text-sm text-gray-600">No hay solicitudes enviadas.</div>
        ) : (
          <ul className="space-y-3">
            {apps.map((a) => (
              <li key={a.id} className="p-3 border border-gray-200 rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{a.offer.position}</div>
                  <div className="text-sm text-gray-600">{a.offer.company?.name}</div>
                </div>
                <div className="text-sm text-gray-600 text-right">
                  <div>{a.status}</div>
                  <div className="text-xs">{formatDateTimeLocal(a.createdAt)}</div>
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
              <li key={d.offer.id} className="p-3 border border-gray-200 rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{d.offer.position}</div>
                  <div className="text-sm text-gray-600">{d.offer.company?.name}</div>
                  <div className="text-xs text-gray-500">Documentos cargados: {d.attachmentsCount}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/ofertas/${d.offer.id}`}>Continuar</Link>
                  <Button className="text-red-600" onPress={() => removeDraft(d.offer.id)} color="default" size="sm">Eliminar</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {showDeleteDraftModal && (
        <Modal
          isOpen={showDeleteDraftModal}
          onCancel={() => setShowDeleteDraftModal(false)}
          onConfirm={confirmDeleteDraft}
          body={<div>Eliminar borrador?</div>}
        />
      )}
    </div>
  );
}
