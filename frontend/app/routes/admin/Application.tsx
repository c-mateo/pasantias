import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Aplicaciones";
import { useState } from "react";
import { Modal } from "~/components/Modal";
import { Button } from "@heroui/button";
import { api } from "~/api/api";
import toast from "~/util/toast";
import { formatDateTimeLocal } from "~/util/helpers";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";
import type { AdminApplicationDetailsResponse } from "~/api/types";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await api.get(`/applications/${(params as any).applicationId}`).json<AdminApplicationDetailsResponse>();
  return res.data ?? {};
}

export default function AdminApplication({ loaderData }: Route.ComponentProps) {
  const data = loaderData as any;
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'ACCEPTED' | 'REJECTED' | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');

  const doUpdate = async (status: 'ACCEPTED' | 'REJECTED') => {
    // Open modal to collect feedback instead of using prompt
    setPendingStatus(status);
    setFeedbackInput("");
    setShowFeedbackModal(true);
  };

  const confirmUpdate = async () => {
    if (!pendingStatus) return setShowFeedbackModal(false);
    try {
      setIsSaving(true);
      await api.patch({ status: pendingStatus, feedback: feedbackInput }, `/applications/${data.id}/status`).res();
      toast.success({ title: "Estado actualizado" });
      navigate('/admin/aplicaciones');
    } catch (err) {
      console.error(err);
      toast.error({ title: 'Error', message: 'No se pudo actualizar el estado' });
    } finally {
      setIsSaving(false);
      setShowFeedbackModal(false);
      setPendingStatus(null);
      setFeedbackInput("");
    }
  };

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-4">
            <article className="bg-white rounded shadow">
              <div className="p-4">
                <div className="mb-4">
                  <a href="/admin/aplicaciones" className="text-sm text-blue-600">← Volver a Aplicaciones</a>
                </div>
                <h1 className="text-2xl font-bold">Detalle de Postulación #{data.id}</h1>
                <div className="mt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-medium">{data.offer?.position}</h2>
                      <div className="text-sm text-gray-600">{data.offer?.company?.name}</div>
                    </div>
                    <ApplicationStatusBadge status={data.status} />
                  </div>

                  <div className="mt-4">
                    <p><strong>Creada:</strong> {formatDateTimeLocal(data.createdAt)}</p>
                    {data.finalizedAt && <p><strong>Finalizada:</strong> {formatDateTimeLocal(data.finalizedAt)}</p>}
                    {data.feedback && <p className="mt-2"><strong>Feedback:</strong> {data.feedback}</p>}
                  </div>
                </div>
              </div>
            </article>
          </div>

          <aside className="lg:col-span-2">
            <div className="bg-white rounded shadow p-4 space-y-4">
              <h2 className="text-xl font-bold">Acciones</h2>
              <div className="flex flex-col gap-3">
                <Button color="primary" onPress={() => doUpdate('ACCEPTED')} disabled={isSaving}>Aceptar</Button>
                <Button color="danger" onPress={() => doUpdate('REJECTED')} disabled={isSaving}>Rechazar</Button>

              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
