import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Aplicaciones";
import { useState } from "react";
import { Modal } from "~/components/Modal";
import { Button } from "@heroui/button";
import { api } from "~/api/api";
import toast from "~/util/toast";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await api.get(`/applications/${(params as any).applicationId}`).json<any>();
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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Detalle de Postulación #{data.id}</h1>
      <div className="mt-4 bg-white p-4 rounded shadow">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium">{data.offer?.position}</h2>
            <div className="text-sm text-gray-600">{data.offer?.company?.name}</div>
          </div>
          <ApplicationStatusBadge status={data.status} />
        </div>

        <div className="mt-4">
          <p><strong>Creada:</strong> {new Date(data.createdAt).toLocaleString()}</p>
          {data.finalizedAt && <p><strong>Finalizada:</strong> {new Date(data.finalizedAt).toLocaleString()}</p>}
          {data.feedback && <p className="mt-2"><strong>Feedback:</strong> {data.feedback}</p>}
        </div>

        <div className="mt-4 flex gap-3">
          <Button color="primary" onPress={() => doUpdate('ACCEPTED')} disabled={isSaving}>Aceptar</Button>
          <Button color="danger" onPress={() => doUpdate('REJECTED')} disabled={isSaving}>Rechazar</Button>
          <Button color="default" onPress={() => navigate('/admin/aplicaciones')}>Volver</Button>
        </div>
        {showFeedbackModal && (
          <Modal
            isOpen={showFeedbackModal}
            onCancel={() => setShowFeedbackModal(false)}
            onConfirm={confirmUpdate}
            message={
              <div>
                <div className="font-medium mb-2">Comentario para la decisión ({pendingStatus})</div>
                <textarea
                  className="w-full border rounded p-2"
                  rows={5}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                />
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
