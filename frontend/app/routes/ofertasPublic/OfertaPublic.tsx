import { useLoaderData, Link as RouterLink, useNavigate } from "react-router";
import { api } from "~/api/api";
import { Button } from "@heroui/button";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Chip,
  Kbd,
  Spinner,
} from "@heroui/react";
import type {
  ApplicationUserListResponse,
  OfferDetailsResponse,
} from "~/api/types";
import { formatDateTimeLocal } from "~/util/helpers";
import type { Route } from "./+types/OfertaPublic";
import { useState, useEffect, useRef } from "react";
import { useAuthState } from "~/util/AuthContext";
import toast from "~/util/toast";
import type { WretchError } from "wretch";

export async function clientLoader({ params }: any) {
  const offer = await api
    .get(`/offers/${params.ofertaId}`)
    .json<OfferDetailsResponse>();

  // Check if the user already applied to this offer
  const apps = await api
    .get(`/my-applications?filter=offerId==${params.ofertaId}`)
    .json<ApplicationUserListResponse>()
    .catch(() => null);
  const hasApplied = (apps?.data.length ?? 0) > 0;
  return { offer: offer.data ?? null, hasApplied };
}

export function meta({ data }: any) {
  if (!data) return [{ title: "Oferta" }];
  return [
    {
      title: `${data.offer.position} - ${data.offer.company?.name ?? "Oferta"}`,
    },
  ];
}

export default function OfertaPublic({ loaderData }: Route.ComponentProps) {
  const { offer, hasApplied: loaderHasApplied } = loaderData as any;
  const o = offer as any;
  const navigate = useNavigate();
  const careers = o.careers as any[] | undefined;
  const skills = o.skills as any[] | undefined;
  const companyName =
    typeof o.company === "string" ? o.company : (o.company?.name ?? "");
  const companyLogo =
    typeof o.company === "object" ? (o.company?.logo ?? undefined) : undefined;
  const companyWebsite =
    typeof o.company === "object"
      ? (o.company?.website ?? undefined)
      : undefined;
  const companyDescription =
    typeof o.company === "object"
      ? (o.company?.description ?? undefined)
      : undefined;
  const auth = useAuthState();

  const renderTextWithParagraphs = (
    text?: string | null,
    pClass = "text-sm text-gray-700"
  ) => {
    if (!text) return null;
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, idx) => (
        <p key={idx} className={pClass}>
          {line}
        </p>
      ));
  };

  function ApplySection({
    requiredDocs,
    offerId,
    initialHasApplied,
  }: {
    requiredDocs: any[];
    offerId: number;
    initialHasApplied?: boolean;
  }) {
    const auth = useAuthState();

    // local attachments: docTypeId -> { file?, uploading?, uploaded?, id?, originalName? }
    const [attachments, setAttachments] = useState<
      Record<
        number,
        {
          error?: any;
          file?: File | null;
          uploading?: boolean;
          uploaded?: boolean;
          id?: number;
          documentId?: number;
          originalName?: string;
          documentTypeName?: string;
        }
      >
    >({});
    const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
    const [dragOverFor, setDragOverFor] = useState<number | null>(null);

    // Reload draft attachments and linked documents
    const reloadDraftAttachments = async () => {
      try {
        // Get draft (may be 204)
        const draftRes = await api.get(`/offers/${offerId}/draft`).res();
        if (draftRes.status === 204) {
          // No draft yet
          return;
        }
        const draftJson = await draftRes.json().catch(() => null);
        const draft = draftJson ?? null;

        const attachmentsArr = draft?.attachments ?? [];
        console.debug(
          "[ApplySection] reloadDraftAttachments: attachmentsArr=",
          attachmentsArr
        );

        const mapping: Record<number, any> = {};
        attachmentsArr.forEach((att: any) => {
          const doc = att.document;
          if (doc) {
            mapping[doc.documentTypeId] = {
              uploaded: true,
              id: att.id,
              documentId: doc.id,
              originalName: doc.originalName,
              documentTypeName: doc.documentType?.name,
            };
          }
        });
        console.debug(
          "[ApplySection] reloadDraftAttachments: mapping=",
          mapping
        );

        // Overwrite attachments state with server mapping to avoid stale/merged keys causing wrong UI states
        setAttachments(mapping);
      } catch (err) {
        // ignore
      }
    };

    // Load current draft attachments once
    useEffect(() => {
      if (!auth.user) return;
      reloadDraftAttachments();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.user, offerId]);

    const onFileChange = async (docId: number, f?: File | null) => {
      // Prevent uploads if user already applied
      if (hasApplied) {
        toast.info({
          title: "Ya aplicaste",
          description: "No puedes subir nuevos documentos.",
        });
        return;
      }

      // If user cleared the input
      if (!f) {
        setAttachments((prev) => ({
          ...prev,
          [docId]: { ...(prev[docId] ?? {}), file: null },
        }));
        return;
      }

      if (!auth.user) {
        navigate("/login");
        return;
      }

      // Only PDFs allowed by backend
      if (f.type !== "application/pdf") {
        toast.error({
          title: "Formato no soportado",
          description: "Solo se permiten archivos PDF.",
        });
        return;
      }

      setAttachments((prev) => ({
        ...prev,
        [docId]: {
          ...(prev[docId] ?? {}),
          file: f,
          uploading: true,
          uploaded: false,
        },
      }));

      try {
        // Route expects reqDocId in path — include docId in URL
        const res = await api
          .url(`/offers/${offerId}/draft/documents/${docId}`)
          .headers({
            "content-type": "application/pdf",
            "content-length": String(f.size),
            "x-original-filename": f.name,
          })
          .put(f)
          .res();

        await res.json().catch(() => null);

        // Re-read draft attachments to obtain attachment id mapping
        await reloadDraftAttachments();

        // Mark as uploaded (originalName will be filled from reload)
        setAttachments((prev) => ({
          ...prev,
          [docId]: {
            ...(prev[docId] ?? {}),
            file: null,
            uploading: false,
            uploaded: true,
          },
        }));
        console.debug(
          "[ApplySection] onFileChange: marked uploaded docId=",
          docId,
          "fileName=",
          f.name
        );

        toast.success({
          title: "Documento subido",
          description: `${f.name} cargado correctamente.`,
        });
      } catch (err: any) {
        // Try to detect Wretch error with JSON body
        let specificMessage: string | undefined = undefined;
        try {
          const status = err?.response?.status;
          const body = await (err as WretchError).response
            ?.json()
            .catch(() => null);
          if (
            status === 400 &&
            body?.type === "invalid-file" &&
            body?.errors?.length > 0 &&
            body.errors[0]?.field === "document-type"
          ) {
            specificMessage =
              "El archivo ya fue utilizado para otro documento requerido.";
            toast.error({
              title: "Archivo inválido",
              description: specificMessage,
            });
          } else {
            toast.error({
              title: "Error",
              description: "No se pudo subir el archivo.",
            });
          }
        } catch (e) {
          toast.error({
            title: "Error",
            description: "No se pudo subir el archivo.",
          });
        }

        // Clear the selected file so the UI does not show "Archivo listo" on error
        setAttachments((prev) => ({
          ...prev,
          [docId]: {
            ...(prev[docId] ?? {}),
            file: null,
            uploading: false,
            uploaded: false,
            error: specificMessage,
          },
        }));
      }
    };

    const unlink = async (docId: number) => {
      const attachmentId = attachments[docId]?.id;
      if (!attachmentId) return;
      try {
        await api
          .delete(`/offers/${offerId}/draft/documents/${attachmentId}`)
          .res();
        // reload mapping
        await reloadDraftAttachments();
        setAttachments((prev) => {
          const next = { ...prev };
          delete next[docId];
          return next;
        });
        toast.success({
          title: "Documento desvinculado",
          description: "Se eliminó el documento del borrador.",
        });
      } catch (err) {
        toast.error({
          title: "Error",
          description: "No se pudo desvincular el documento.",
        });
      }
    };

    const anyUploading = Object.values(attachments).some((a) => a?.uploading);
    const allRequiredUploaded = (requiredDocs || []).every(
      (d) => !!(attachments[d.id]?.uploaded || attachments[d.id]?.id)
    );

    const [hasApplied, setHasApplied] = useState<boolean>(!!initialHasApplied);
    useEffect(() => {
      setHasApplied(!!initialHasApplied);
    }, [initialHasApplied]);

    const canApply = allRequiredUploaded && !anyUploading && !hasApplied;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async () => {
      if (!auth.user) {
        navigate("/login");
        return;
      }
      if (!canApply || hasApplied) return;

      setIsSubmitting(true);
      try {
        // Submit draft (server will create Application and remove draft)
        const res = await api.post({}, `/offers/${offerId}/draft/submit`).res();
        const json = await res.json().catch(() => null);
        toast.success({
          title: "Solicitud enviada",
          description: "Tu postulación fue enviada correctamente.",
        });
        // Redirect to applications list
        navigate("/applications");
      } catch (err: any) {
        console.error("Failed to submit draft", err);
        const message =
          err?.response?.data?.detail ?? "No se pudo enviar la solicitud.";
        toast.error({ title: "Error", description: message });
      } finally {
        setIsSubmitting(false);
      }
    };

    const deleteDraft = async () => {
      if (!auth.user) {
        navigate("/login");
        return;
      }
      if (hasApplied) {
        toast.info({
          title: "No permitido",
          description: "No puedes eliminar el borrador después de aplicar.",
        });
        return;
      }

      const ok = window.confirm(
        "¿Eliminar borrador? Esta acción no se puede deshacer."
      );
      if (!ok) return;

      setIsSubmitting(true);
      try {
        await api.delete(`/offers/${offerId}/draft`).res();
        // Clear attachments locally and reload
        setAttachments({});
        await reloadDraftAttachments();
        toast.success({
          title: "Borrador eliminado",
          description: "El borrador ha sido eliminado.",
        });
      } catch (err: any) {
        console.error("Failed to delete draft", err);
        const message =
          err?.response?.data?.detail ?? "No se pudo eliminar el borrador.";
        toast.error({ title: "Error", description: message });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="border border-gray-200 rounded p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Aplicar a la oferta</h3>
          <div className="text-sm text-gray-500">
            {requiredDocs?.length ?? 0} documento(s) requeridos
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {requiredDocs?.length === 0 && (
            <div className="text-sm text-gray-600">
              No se requieren documentos para esta oferta. Presione Aplicar para
              continuar.
            </div>
          )}

          {(requiredDocs || []).map((d) => (
            <div
              key={d.id}
              className="p-3 border border-gray-200 rounded flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-gray-500">
                  Seleccione o suba un documento
                </div>
                <div className="mt-2">
                  {/* Hidden file input triggered by clicking the drop area */}
                  <input
                    ref={(el) => {
                      inputRefs.current[d.id] = el;
                    }}
                    id={`file-${d.id}`}
                    className="hidden"
                    accept="application/pdf"
                    type="file"
                    onChange={(e) =>
                      onFileChange(d.id, e.currentTarget.files?.[0] ?? null)
                    }
                    disabled={attachments[d.id]?.uploading || hasApplied}
                  />

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (hasApplied) {
                        toast.info({
                          title: "Ya aplicaste",
                          description: "No puedes subir nuevos documentos.",
                        });
                        return;
                      }
                      inputRefs.current[d.id]?.click();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        if (hasApplied) {
                          toast.info({
                            title: "Ya aplicaste",
                            description: "No puedes subir nuevos documentos.",
                          });
                          return;
                        }
                        inputRefs.current[d.id]?.click();
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (hasApplied) {
                        setDragOverFor(null);
                        toast.info({
                          title: "Ya aplicaste",
                          description: "No puedes subir nuevos documentos.",
                        });
                        return;
                      }
                      const f = e.dataTransfer?.files?.[0];
                      if (f) onFileChange(d.id, f);
                      setDragOverFor(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!hasApplied) setDragOverFor(d.id);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      if (!hasApplied) setDragOverFor(d.id);
                    }}
                    onDragLeave={() => setDragOverFor(null)}
                    className={`p-3 rounded border-dashed ${hasApplied ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} flex items-center justify-center text-sm ${dragOverFor === d.id ? "border-blue-500 bg-blue-50 border" : "border-gray-300 border"}`}
                  >
                    {hasApplied ? (
                      <div className="text-sm text-yellow-700">
                        Ya aplicaste a esta oferta — carga deshabilitada
                      </div>
                    ) : attachments[d.id]?.uploading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" />
                        Subiendo...
                      </div>
                    ) : attachments[d.id]?.uploaded ? (
                      <div className="text-green-600">Subido ✓</div>
                    ) : (
                      <div>
                        Arrastra y suelta un PDF aquí o haz clic para
                        seleccionar
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  {attachments[d.id]?.uploaded && (
                    <div className="flex items-center gap-2 text-sm">
                      Usado: <strong>{attachments[d.id].originalName}</strong>
                      {attachments[d.id]?.documentTypeName ? (
                        <span className="text-xs text-gray-500 ml-2">
                          ({attachments[d.id].documentTypeName})
                        </span>
                      ) : null}{" "}
                      <Button
                        size="sm"
                        color="default"
                        onPress={async () => {
                          try {
                            const blob = await api
                              .url(
                                `/my-documents/${attachments[d.id].documentId}/download`
                              )
                              .post()
                              .blob();
                            const url = window.URL.createObjectURL(blob as any);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download =
                              attachments[d.id].originalName ??
                              `document-${attachments[d.id].documentId}`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            toast.error({
                              title: "Error",
                              description: "No se pudo descargar el archivo.",
                            });
                          }
                        }}
                      >
                        Descargar
                      </Button>{" "}
                      <Button
                        size="sm"
                        color="default"
                        onPress={() => unlink(d.id)}
                      >
                        Desvincular
                      </Button>
                    </div>
                  )}
                  {attachments[d.id]?.error ? (
                    <div className="text-sm text-red-600">
                      Error: {attachments[d.id].error}
                    </div>
                  ) : attachments[d.id]?.file &&
                    !attachments[d.id]?.uploading ? (
                    <div className="text-sm">
                      Archivo listo:{" "}
                      <strong>{(attachments[d.id].file as File).name}</strong>
                    </div>
                  ) : null}
                </div>
              </div>
              <div>
                <Kbd>Requerido</Kbd>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            {hasApplied && (
              <div className="text-sm text-yellow-600">
                Ya aplicaste a esta oferta
              </div>
            )}
            <div className="flex gap-3">
              <Button
                color="primary"
                onPress={onSubmit}
                isDisabled={!canApply || isSubmitting || hasApplied}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    &nbsp;Enviando...
                  </>
                ) : anyUploading ? (
                  "Subiendo..."
                ) : (
                  "Aplicar"
                )}
              </Button>
              <Button
                color="danger"
                onPress={deleteDraft}
                isDisabled={isSubmitting || hasApplied}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    &nbsp;Eliminando...
                  </>
                ) : (
                  "Eliminar borrador"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-4">
          <RouterLink to="/ofertas" className="text-sm text-blue-600">
            ← Volver a Ofertas
          </RouterLink>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="lg:col-span-3">
            <article className="bg-white rounded shadow">
              <header className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                  {companyLogo && (
                    <Image
                      src={companyLogo}
                      alt={companyName}
                      width={48}
                      height={48}
                      radius="sm"
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">{o.position}</h1>
                    <div className="text-sm text-default-500">
                      {companyName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-700">
                      {o.location ?? "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {o.vacancies ?? 1} vacante
                      {(o.vacancies ?? 1) !== 1 ? "s" : ""}
                    </div>
                    {o.createdAt && (
                      <div className="text-xs text-gray-400">
                        Publicado: {formatDateTimeLocal(o.createdAt)}
                      </div>
                    )}
                  </div>
                  {companyWebsite && (
                    <a href={companyWebsite} className="text-sm text-blue-600">
                      {companyWebsite}
                    </a>
                  )}
                </div>
              </header>
              <Divider />
              <div className="p-4 flex flex-col gap-3">
                <div className="leading-relaxed">
                  {renderTextWithParagraphs(
                    o.description,
                    "text-sm text-gray-700"
                  )}
                </div>
                {o.requirements && (
                  <div>
                    <h3 className="text-sm font-semibold">Requisitos</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {o.requirements}
                    </p>
                  </div>
                )}
                {careers && careers.length > 0 ? (
                  <div>
                    <div className="text-sm font-semibold">Carreras</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {careers.map((c: any, i: number) => (
                        <Chip
                          key={c?.id ?? c?.shortName ?? i}
                          size="sm"
                          title={c?.name ?? String(c)}
                        >
                          {c?.shortName ?? c?.name ?? String(c)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ) : skills && skills.length > 0 ? (
                  <div>
                    <div className="text-sm font-semibold">Skills</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skills.map((s: any) => (
                        <Chip key={s?.id ?? s?.name ?? s} size="sm">
                          {s?.name ?? s}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Company Details moved into main flow */}
                {companyDescription && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold">Sobre la empresa</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {companyDescription}
                    </p>
                  </div>
                )}

                {o.requiredDocuments && o.requiredDocuments.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold">
                      Documentos requeridos
                    </div>
                    <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                      {(o.requiredDocuments as any[]).map((d: any) => (
                        <li key={d.id}>{d.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Apply section will be inserted below */}
              </div>

              {/* Apply section */}
              <div className="p-4">
                {auth.user ? (
                  <ApplySection
                    requiredDocs={(o.requiredDocuments as any[]) ?? []}
                    offerId={o.id}
                    initialHasApplied={loaderHasApplied}
                  />
                ) : (
                  <div className="border rounded p-4 text-center">
                    <div className="text-sm text-gray-700 mb-3">Inicia sesión para aplicar a esta oferta.</div>
                    <div className="flex justify-center">
                      <RouterLink to={`/login?next=/ofertas/${o.id}`} className="no-underline">
                        <Button color="primary">Iniciar sesión</Button>
                      </RouterLink>
                    </div>
                  </div>
                )}
              </div>

              <Divider />
              <footer className="flex items-center justify-between p-4">
                <div className="text-sm text-gray-500">
                  {o.expiresAt
                    ? `Cierra: ${formatDateTimeLocal(o.expiresAt)}`
                    : "Abierta"}
                </div>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
