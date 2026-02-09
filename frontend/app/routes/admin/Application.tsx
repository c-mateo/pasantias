import { useNavigate, redirect } from "react-router";
import type { Route } from "./+types/Aplicaciones";
import { useState } from "react";
import { Modal } from "~/components/Modal";
import { Button } from "@heroui/button";
import { api } from "~/api/api";
import { requireUser } from "~/util/AuthContext";
import toast from "~/util/toast";
import { Tooltip } from "@heroui/react";
import { formatDateTimeLocal } from "~/util/helpers";
import ApplicationStatusBadge from "~/components/ApplicationStatusBadge";
import type { AdminApplicationDetailsResponse } from "~/api/types";
import { zipFiles, downloadBlob } from "~/util/zipClient";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await requireUser();
  if (!user) throw redirect("/");

  try {
    const res = await api.get(`/admin/applications/${(params as any).applicationId}`).json<AdminApplicationDetailsResponse>();
    if (!res || !res.data) {
      throw redirect("/");
    }
    return res.data ?? {};
  } catch (err) {
    console.error("clientLoader error", err);
    throw redirect("/");
  }
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
      await api.patch({ status: pendingStatus, feedback: feedbackInput }, `/admin/applications/${data.id}/status`).res();
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

  const downloadDocument = async (doc: { id: number; originalName?: string }) => {
    try {
      const blob = await api.url(`/admin/documents/${doc.id}`).get().blob();
      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.originalName ?? `document-${doc.id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error({ title: "Error", message: "No se pudo descargar el archivo." });
    }
  };

  const generatePdfBlob = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(14);
      doc.text('Ficha de Postulación', 14, y);
      y += 10;
      doc.setFontSize(11);
      doc.text(`ID Postulación: ${data.id}`, 14, y);
      y += 8;
      if (data.user) {
        doc.text(`Nombre y Apellido: ${data.user.firstName ?? 'No disponible'} ${data.user.lastName ?? ''}`.trim(), 14, y);
        y += 7;
        doc.text(`CUIL: ${data.user.cuil ?? 'No disponible'}`, 14, y);
        y += 7;
        doc.text(`Domicilio: ${data.user.address ?? 'No disponible'}`, 14, y);
        y += 7;
        const city = data.user.city ?? 'No disponible';
        const prov = data.user.province ?? 'No disponible';
        doc.text(`Localidad / Provincia: ${city} / ${prov}`, 14, y);
        y += 7;
        doc.text(`Teléfono: ${data.user.phone ?? 'No disponible'}`, 14, y);
        y += 7;
        doc.text(`Email: ${data.user.email ?? 'No disponible'}`, 14, y);
        y += 7;
      }
      if (data.offer) {
        doc.text(`Puesto: ${data.offer.position}`, 14, y);
        y += 7;
        doc.text(`Empresa: ${data.offer.company?.name ?? ''}`, 14, y);
        y += 7;
      }
      if (data.createdAt) {
        doc.text(`Aplicado: ${formatDateTimeLocal(data.createdAt)}`, 14, y);
        y += 7;
      }
      if (data.feedback) {
        doc.text('Feedback:', 14, y);
        y += 7;
        const feedbackLines = doc.splitTextToSize(String(data.feedback), 180);
        doc.text(feedbackLines, 14, y);
        y += feedbackLines.length * 6;
      }
      return doc.output('blob');
    } catch (err) {
      console.error('PDF generation failed', err);
      throw err;
    }
  };

  const exportPackage = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      // Generate PDF
      const pdfBlob = await generatePdfBlob();

      const files: Array<{ name: string; data: Blob | string }> = [];
      files.push({ name: `postulacion-${data.id}.pdf`, data: pdfBlob });

      // Add each document (fetch from API)
      const docs = data.documents || [];
      for (const doc of docs) {
        try {
          const blob = await api.url(`/admin/documents/${doc.id}`).get().blob();
          const name = doc.originalName ?? `document-${doc.id}`;
          files.push({ name, data: blob });
        } catch (err) {
          console.warn('Failed to fetch document', doc.id, err);
        }
      }

      const zipBlob = await zipFiles(files as any);
      downloadBlob(zipBlob, `postulacion-${data.id}-package.zip`);
      toast.success({ title: 'Descarga lista', message: 'Se ha generado el paquete con éxito.' });
    } catch (err) {
      console.error(err);
      toast.error({ title: 'Error', message: 'No se pudo generar el paquete.' });
    } finally {
      setIsSaving(false);
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
                <div className="mt-4 flex flex-col gap-4 w-full">
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
                    {data.documents && data.documents.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">Archivos adjuntos</h3>
                        <div className="flex flex-wrap gap-3">
                          {data.documents.map((doc: any) => (
                            <div key={doc.id} className="flex-shrink-0 w-full sm:w-[48%] p-3 border border-gray-200 rounded bg-gray-50 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="min-w-0">
                                    <Tooltip content={doc.originalName ?? `Documento ${doc.id}`}>
                                      <div className="font-medium truncate">{doc.originalName ?? `Documento ${doc.id}`}</div>
                                    </Tooltip>
                                    {doc.documentType && <div className="text-xs text-gray-500 truncate">{doc.documentType}</div>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                  <Button size="sm" color="default" onPress={() => downloadDocument(doc)} aria-label={`Descargar ${doc.originalName ?? `documento ${doc.id}`}`} title={`Descargar ${doc.originalName ?? `documento ${doc.id}`}`}>Descargar</Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>

          <aside className="lg:col-span-2">
            <div className="bg-white rounded shadow p-4 space-y-4">
              <h2 className="text-xl font-bold">Acciones</h2>
              <div className="flex flex-col gap-3">
                <Button color="primary" onPress={() => doUpdate('ACCEPTED')} disabled={isSaving || data.status === 'ACCEPTED' || data.status === 'REJECTED'} isDisabled={isSaving || data.status === 'ACCEPTED' || data.status === 'REJECTED'}>Aceptar</Button>
                <Button color="danger" onPress={() => doUpdate('REJECTED')} disabled={isSaving || data.status === 'ACCEPTED' || data.status === 'REJECTED'} isDisabled={isSaving || data.status === 'ACCEPTED' || data.status === 'REJECTED'}>Rechazar</Button>
                <Button color="default" onPress={() => exportPackage()} disabled={isSaving}>Exportar paquete (PDF + archivos)</Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Modal
        isOpen={showFeedbackModal}
        title={pendingStatus ? `Enviar feedback (${pendingStatus})` : "Enviar feedback"}
        body={
          <div className="space-y-2">
            <p>Opcional: escribe un feedback para el candidato.</p>
            <textarea
              className="w-full border rounded p-2 h-32"
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Feedback..."
            />
          </div>
        }
        onConfirm={confirmUpdate}
        onCancel={() => setShowFeedbackModal(false)}
      />
    </main>
  );
}
