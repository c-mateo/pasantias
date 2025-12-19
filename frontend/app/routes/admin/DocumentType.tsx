import { useNavigate } from "react-router";
import type { Route } from "./+types/DocumentType";
import { useState } from "react";
import { Input, Form } from "@heroui/react";
import { toast as toastHelper } from "~/util/toast";
import { Button } from "@heroui/button";
import { Modal } from "~/components/Modal";
import { api } from "~/api/api";
import { formatDateTimeLocal } from "~/util/helpers";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.documentTypeId === "nuevo")
    return { id: 0, name: "", createdAt: new Date().toISOString() } as any;
  const res = await api
    .get(`/document-types/${params.documentTypeId}`)
    .json<any>();
  return res.data ?? { id: 0, name: "", createdAt: new Date().toISOString() };
}

export default function DocumentType({ loaderData }: Route.ComponentProps) {
  const data = loaderData as any;
  const [item, setItem] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    action: () => {},
  });
  const navigate = useNavigate();

  const isExisting = item.id !== 0;
  const metadata = {
    createdAt: formatDateTimeLocal(item.createdAt),
    updatedAt: formatDateTimeLocal(item.updatedAt),
  };

  const save = () => {
    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
      action: async () => {
        try {
          const isExisting = item.id !== 0;
          const res = isExisting
            ? await api.patch(item, `/admin/document-types/${item.id}`).res()
            : await api.post(item, "/admin/document-types").res();
          if (res.status >= 400) {
            const body = await res.json().catch(() => null);
            if (body?.type === "already-exists") {
              setErrors({
                name: "Ya existe un tipo de documento con ese nombre",
              });
              toastHelper.error({
                title: "Conflicto",
                description: "Ya existe un tipo de documento con ese nombre",
              });
              return;
            }
            toastHelper.error({
              title: "Error",
              description: "No se pudieron guardar los cambios.",
            });
            return;
          }
          toastHelper.success({
            title: isExisting ? "Tipo actualizado" : "Tipo creado",
          });
          setModal({ ...modal, isOpen: false });
          navigate("/admin/document-types");
        } catch (err) {
          console.error(err);
          toastHelper.error({
            title: "Error",
            description: "No se pudieron guardar los cambios.",
          });
        }
      },
    });
  };

  const del = () => {
    setModal({
      isOpen: true,
      message: "¿Eliminar este tipo de documento?",
      action: async () => {
        try {
          await api.delete(`/admin/document-types/${item.id}`).res();
          toastHelper.success({ title: "Tipo eliminado" });
          navigate("/admin/document-types");
        } catch (err) {
          console.error(err);
          toastHelper.error({
            title: "Error",
            description: "No se pudo eliminar el tipo de documento.",
          });
        }
      },
    });
  };

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        title="Confirmar acción"
        body={modal.message}
        onConfirm={modal.action}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />
      <main className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <div className="lg:col-span-4">
              <article className="bg-white rounded shadow">
                <div className="p-4">
                  <div className="mb-4">
                    <a
                      href="/admin/document-types"
                      className="text-sm text-blue-600"
                    >
                      ← Volver a Tipos de Documentos
                    </a>
                  </div>
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      save();
                    }}
                    validationErrors={errors as any}
                  >
                    <h1 className="text-2xl font-bold">
                      Detalles del Tipo de Documento
                    </h1>
                    <div className="mt-4">
                      <Input
                        value={item.name ?? ""}
                        onValueChange={(v) =>
                          setItem((p: any) => ({ ...p, name: v }))
                        }
                        isRequired
                        label="Nombre"
                        labelPlacement="outside"
                        placeholder="Nombre del tipo"
                      />
                    </div>
                  </Form>
                </div>
              </article>
            </div>

            <aside className="lg:col-span-2">
              <div className="bg-white rounded shadow p-4 space-y-4">
                {isExisting && (
                  <div>
                    <h2 className="text-xl font-bold">Información Adicional</h2>
                    <p>
                      <span className="font-medium">Fecha de Creación:</span> {metadata.createdAt}
                    </p>
                    <p>
                      <span className="font-medium">Última Actualización:</span> {metadata.updatedAt}
                    </p>
                  </div>
                )}

                <h2 className="text-2xl font-bold">Acciones</h2>
                <div className="flex flex-col gap-3">
                  <Button color="primary" onPress={save} className="w-full">
                    {item.id ? "Guardar Cambios" : "Crear Tipo"}
                  </Button>
                  {item.id !== 0 && (
                    <Button color="danger" className="w-full" onPress={del}>
                      Eliminar Tipo
                    </Button>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
