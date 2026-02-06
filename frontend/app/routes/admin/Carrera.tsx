import { useNavigate } from "react-router";
import type { Route } from "./+types/Carrera";
import { useState } from "react";
import { Input, Textarea, Form } from "@heroui/react";
import { toast as toastHelper } from "~/util/toast";
import { Button } from "@heroui/button";
import { createSetters } from "~/util/createSetters";
import { Modal } from "../../components/Modal";
import { formatDateTimeLocal } from "~/util/helpers";
import type { CourseDTO, AdminCourseDetailsResponse, ApiError } from "~/api/types";
import { api } from "~/api/api";
import type { WretchError } from "wretch";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.carreraId === "nuevo") {
    return {
      id: 0,
      name: "",
      shortName: "",
      description: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as CourseDTO;
  }

  const response = await api
    .get(`/courses/${params.carreraId}`)
    .json<AdminCourseDetailsResponse>();

  return (
    response.data ??
    ({
      id: 0,
      name: "",
      shortName: "",
      description: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as CourseDTO)
  );
}

export function omit<T, K extends readonly (keyof T)[]>(
  obj: T,
  keys: K
): Omit<T, K[number]> {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}

export default function Curso({ loaderData }: Route.ComponentProps) {
  const data = loaderData as CourseDTO;

  const [course, setCourse] = useState<CourseDTO>(data);
  
  const metadata = {
    createdAt: formatDateTimeLocal(data.createdAt),
    updatedAt: formatDateTimeLocal(data.updatedAt),
  };

  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    action: () => {},
  });

  const navigate = useNavigate();

  const { setName, setShortName, setDescription } =
    createSetters(setCourse);

  const [errors, setErrors] = useState<Record<string, string>>({});
  console.log(errors)
  
  const save = () => {
    // Lógica para guardar los cambios del curso
    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
      action: async () => {
        try {
          const isExisting = course.id !== 0;
          const opPromise = isExisting
            ? api.patch(course, `/admin/courses/${course.id}`).res()
            : api.post(course, "/admin/courses").res()

          //             console.log("Error", err as WretchError)
          // const error = err as ApiError

          // const title = error.type === "already-exists" ? "La carrera ya existe" : "Error al guardar"
          // const description = error.detail ?? "No se pudieron guardar los cambios."

          // const apiErrors = {}
          // error.meta?.conflicts.forEach(c => apiErrors[c.field] = c.message);
          // setErrors(apiErrors)
          toastHelper.info({
            title: isExisting ? "Actualizando carrera" : "Creando carrera",
            description: isExisting
              ? "Actualizando la carrera en el servidor..."
              : "Creando la carrera en el servidor...",
            promise: opPromise.then(),
          });

          await opPromise;

          toastHelper.success({
            title: isExisting ? "Carrera actualizada" : "Carrera creada",
            description: isExisting
              ? "La carrera se actualizó correctamente."
              : "La carrera se creó correctamente.",
          });

          setModal({ ...modal, isOpen: false });
          goBack();
        } catch (err) {
          const errors = await (err as WretchError).response.json()
          const apiError = errors as ApiError

          if (apiError.type === "already-exists") {
            setErrors({
              name: "La carrera ya existe",
            })

            toastHelper.error({
              title: "Conflicto al guardar",
              description: "La carrera ya existe.",
            });
            return
          }

          toastHelper.error({
            title: "Error al guardar",
            description: "No se pudieron guardar los cambios.",
          });
        }
      },
    });
  };

  const del = () => {
    // Lógica para eliminar el curso
    setModal({
      isOpen: true,
      message: "¿Está seguro de que desea eliminar este curso?",
      action: async () => {
        try {
          const opPromise = api.delete(`/admin/courses/${course.id}`).res();

          toastHelper.info({
            title: "Eliminando carrera",
            description: "Eliminando la carrera...",
            promise: opPromise,
          });

          await opPromise;

          toastHelper.success({ title: "Carrera eliminada" });
          setModal({ ...modal, isOpen: false });
          goBack();
        } catch (err) {
          console.error(err);
          toastHelper.error({
            title: "Error al eliminar",
            description: "No se pudo eliminar la carrera.",
          });
        }
      },
    });
  };

  const goBack = () => {
    // Lógica para volver a la lista de cursos
    navigate("/admin/carreras");
  };

  const isExistingCourse = course.id !== 0;
  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        body={modal.message}
        onConfirm={modal.action}
        onCancel={() => {
          setModal({ ...modal, isOpen: false });
        }}
      />
      <main className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <div className="lg:col-span-4">
              <article className="bg-white rounded shadow">
                <div className="p-4">
                  <div className="mb-4">
                    <a href="/admin/carreras" className="text-sm text-blue-600">← Volver a Carreras</a>
                  </div>
                  <Form
                    id="main-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      save();
                    }}
                    validationErrors={errors as any}
                  >
                    <h1 className="text-2xl font-bold">Detalles de la Carrera</h1>
                    <div className="mt-4 flex flex-col gap-4 w-full">
                      <Input
                        isRequired
                        label="Nombre"
                        labelPlacement="outside"
                        placeholder="Ingrese el nombre de la carrera"
                        value={course.name}
                        name="name"
                        onValueChange={(v) => {
                          setName(v);
                          setErrors((prev) => (omit(prev, ["name"])));
                        }}
                      />
                      <Input
                        label="Nombre Corto"
                        labelPlacement="outside"
                        placeholder="Ingrese nombre corto (sigla)"
                        value={course.shortName ?? ""}
                        onValueChange={setShortName}
                      />
                      <Textarea
                        label="Descripción"
                        labelPlacement="outside"
                        placeholder="Describir la carrera"
                        value={course.description ?? ""}
                        onValueChange={setDescription}
                      />
                    </div>
                  </Form>
                </div>
              </article>
            </div>

            <aside className="lg:col-span-2">
              <div className="bg-white rounded shadow p-4 space-y-4">
                {isExistingCourse && (
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
                    form="main-form"
                    type="submit"
                  >
                    {isExistingCourse ? "Guardar Cambios" : "Crear Carrera"}
                  </Button>
                  {isExistingCourse && (
                    <Button
                      color="danger"
                      className="w-full"
                      radius="md"
                      onPress={del}
                    >
                      Eliminar Carrera
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
