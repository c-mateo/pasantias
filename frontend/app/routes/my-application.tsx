import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/applications";
import { api } from "~/api/api";
import { Button } from "@heroui/button";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await api.get(`/my-applications/${params.applicationId}`).json();
  return res.data ?? {};
}

export default function MyApplication({ loaderData }: Route.ComponentProps) {
  const data = loaderData as any;
  const navigate = useNavigate();

  const handleCancel = async () => {
    if (!confirm('Cancelar esta postulación?')) return;
    try {
      await api.delete(`/my-applications/${data.id}`).res();
      alert('Postulación cancelada');
      navigate('/applications');
    } catch (err) {
      console.error(err);
      alert('No se pudo cancelar la postulación');
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
          <p><strong>Creada:</strong> {new Date(data.createdAt).toLocaleString()}</p>
          {data.finalizedAt && <p><strong>Finalizada:</strong> {new Date(data.finalizedAt).toLocaleString()}</p>}
          {data.feedback && <p className="mt-2"><strong>Feedback:</strong> {data.feedback}</p>}
        </div>

        <div className="mt-4 flex gap-3">
          {(data.status === 'PENDING' || data.status === 'BLOCKED') && (
            <Button color="danger" onClick={handleCancel}>Cancelar</Button>
          )}

          {data.status === 'CANCELLED' && (
            <Button color="primary" onClick={() => navigate(`/ofertas/${data.offer.id}`)}>Reaplicar</Button>
          )}

          <Button color="default" onClick={() => navigate('/applications')}>Volver</Button>
        </div>
      </div>
    </div>
  );
}
