import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Aplicaciones";
import { useState } from "react";
import { Button } from "@heroui/button";
import { api } from "~/api/api";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await api.get(`/applications/${params.applicationId}`).json();
  return res.data ?? {};
}

export default function AdminApplication({ loaderData }: Route.ComponentProps) {
  const data = loaderData as any;
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const doUpdate = async (status: 'ACCEPTED' | 'REJECTED') => {
    const feedback = prompt(`Comentario para la decisión (${status}):`, "");
    if (feedback === null) return;
    try {
      setIsSaving(true);
      await api.patch({ status, feedback }, `/applications/${data.id}/status`).res();
      alert("Estado actualizado");
      navigate('/admin/aplicaciones');
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado');
    } finally {
      setIsSaving(false);
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
          <Button color="primary" onClick={() => doUpdate('ACCEPTED')} disabled={isSaving}>Aceptar</Button>
          <Button color="danger" onClick={() => doUpdate('REJECTED')} disabled={isSaving}>Rechazar</Button>
          <Button color="default" onClick={() => navigate('/admin/aplicaciones')}>Volver</Button>
        </div>
      </div>
    </div>
  );
}
