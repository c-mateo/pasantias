import { useNavigate } from "react-router";
import type { Route } from "./+types/Skill";
import { useState } from "react";
import { Input, Form } from "@heroui/react";
import { toast as toastHelper } from "~/util/toast";
import { Button } from "@heroui/button";
import { Modal } from "~/components/Modal";
import { api } from "~/api/api";
import { formatDateTimeLocal } from "~/util/helpers";
import type { AdminSkillDetailsResponse, ApiError } from "~/api/types";
import type { WretchError } from "wretch";
import { omit } from "./Carrera";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.skillId === "nuevo") {
    return { id: 0, name: "", createdAt: new Date().toISOString() } as any;
  }
  const res = await api
    .get(`/skills/${params.skillId}`)
    .json<AdminSkillDetailsResponse>();
  return res.data ?? { id: 0, name: "", createdAt: new Date().toISOString() };
}

export default function Skill({ loaderData }: Route.ComponentProps) {
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
          const opPromise = isExisting
            ? api.patch(item, `/admin/skills/${item.id}`).res()
            : api.post(item, "/admin/skills").res();

          toastHelper.info({
            title: isExisting ? "Actualizando skill" : "Creando skill",
            description: isExisting
              ? "Actualizando la skill en el servidor..."
              : "Creando la skill en el servidor...",
            promise: opPromise.then(),
          });

          try {
            await opPromise;
            toastHelper.success({
              title: isExisting ? "Skill actualizada" : "Skill creada",
            });
            setModal({ ...modal, isOpen: false });
            navigate("/admin/skills");
          } catch (err) {
            // Match Carrera.tsx: parse API error body and handle known validation types
            const body = await (err as WretchError).response
              .json()
              .catch(() => null);
            const apiError = body as ApiError | null;
            if (apiError?.type === "already-exists") {
              setErrors({ name: "Ya existe una skill con ese nombre" });
              toastHelper.error({
                title: "Conflicto",
                description: "Ya existe una skill con ese nombre",
              });
              return;
            }

            console.error(err);
            toastHelper.error({
              title: "Error",
              description: "No se pudieron guardar los cambios.",
            });
            return;
          }
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
      message: "¿Está seguro de que desea eliminar esta skill?",
      action: async () => {
        try {
          await api.delete(`/admin/skills/${item.id}`).res();
          toastHelper.success({ title: "Skill eliminada" });
          navigate("/admin/skills");
        } catch (err) {
          console.error(err);
          toastHelper.error({
            title: "Error",
            description: "No se pudo eliminar la skill.",
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
                    <a href="/admin/skills" className="text-sm text-blue-600">
                      ← Volver a Skills
                    </a>
                  </div>
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      save();
                    }}
                    validationErrors={errors as any}
                  >
                    <h1 className="text-2xl font-bold">Detalles de la Skill</h1>
                    <div className="mt-4 flex flex-col gap-4 w-full">
                      <Input
                        value={item.name ?? ""}
                        onValueChange={(v) => {
                          setItem((p: any) => ({ ...p, name: v }));
                          setErrors(omit(errors, ["name"]));
                        }}
                        isRequired
                        label="Nombre"
                        placeholder="Nombre de la skill"
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
                      <span className="font-medium">Fecha de Creación:</span>{" "}
                      {metadata.createdAt}
                    </p>
                    <p>
                      <span className="font-medium">Última Actualización:</span>{" "}
                      {metadata.updatedAt}
                    </p>
                  </div>
                )}

                <h2 className="text-xl font-bold">Acciones</h2>
                <div className="flex flex-col gap-3">
                  <Button
                    color="primary"
                    className="w-full"
                    radius="md"
                    onPress={save}
                  >
                    {item.id ? "Guardar Cambios" : "Crear Skill"}
                  </Button>
                  {item.id !== 0 && (
                    <Button
                      color="danger"
                      className="w-full"
                      radius="md"
                      onPress={del}
                    >
                      Eliminar Skill
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
