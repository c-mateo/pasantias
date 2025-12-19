import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/applications";
import { api } from "~/api/api";
import { useState } from "react";
import toast from "~/util/toast";
import { formatDateTimeLocal } from "~/util/helpers";
import { Modal } from "~/components/Modal";
import { Button } from "@heroui/button";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";
import type { ApplicationDetailsResponse } from "~/api/types";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await api.get(`/my-applications/${params.applicationId}`).json<ApplicationDetailsResponse>();
  return res.data ?? {};
}

export default function MyApplication({ loaderData }: Route.ComponentProps) {
  const data = loaderData as any;
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancel = async () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await api.delete(`/my-applications/${data.id}`).res();
      toast.success({ title: 'Postulación cancelada' });
      navigate('/applications');
    } catch (err) {
      console.error(err);
      toast.error({ title: 'Error', message: 'No se pudo cancelar la postulación' });
    } finally {
      setShowCancelModal(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Detalle de mi postulación #{data.id}</h1>
      <div className="mt-4 bg-white p-4 rounded shadow">
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

        <div className="mt-4 flex gap-3">
          {(data.status === 'PENDING' || data.status === 'BLOCKED') && (
            <Button color="danger" onPress={handleCancel}>Cancelar</Button>
          )}

          {data.status === 'CANCELLED' && (
            <Button color="primary" onPress={() => navigate(`/ofertas/${data.offer.id}`)}>Reaplicar</Button>
          )}

          <Button color="default" onPress={() => navigate('/applications')}>Volver</Button>
        </div>
        {showCancelModal && (
          <Modal
            isOpen={showCancelModal}
            onCancel={() => setShowCancelModal(false)}
            onConfirm={confirmCancel}
            body={<div>¿Cancelar esta postulación?</div>}
          />
        )}
      </div>
    </div>
  );
}
