import { useNavigate } from "react-router";
import type { Route } from "./+types/Carrera";
import { useState } from "react";
import { Input, Textarea, Form } from "@heroui/react";
import { toast as toastHelper } from "~/util/toast";
import { Button } from "@heroui/button";
import { useSettersForObject } from "~/util/createPropertySetter";
import { Modal } from "../../components/Modal";
import { formatDateTimeLocal } from "~/util/helpers";
import type { CourseDTO, AdminCourseDetailsResponse } from "~/api/types";
import { api } from "~/api/api";

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs) {
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

  const response = await api.get(`/courses/${params.carreraId}`).json<AdminCourseDetailsResponse>();

  return response.data ?? { id: 0, name: '', shortName: '', description: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as CourseDTO;
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
    useSettersForObject(setCourse);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = (c: typeof course) => {
    const e: Record<string, string> = {};
    if (!c.name || c.name.trim() === "") e.name = "El nombre es requerido";
    return e;
  };

  const save = () => {
    // Lógica para guardar los cambios del curso
    const e = validate(course);
    setErrors(e);
    if (Object.keys(e).length > 0) {
          toastHelper.warn({ title: "Corrige los errores del formulario" });
    }

    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
      action: async () => {
        try {
          const isExisting = course.id !== 0;
          const opPromise = isExisting
            ? api.patch(course, `/admin/courses/${course.id}`)
            : api.post(course, "/admin/courses");

          toastHelper.info({
            title: isExisting ? "Actualizando carrera" : "Creando carrera",
            description: isExisting
              ? "Actualizando la carrera en el servidor..."
              : "Creando la carrera en el servidor...",
            promise: opPromise,
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
          console.error(err);
          const apiErrors = (err as any)?.errors ?? (err as any)?.response?.data?.errors;
          if (Array.isArray(apiErrors)) {
            const map: Record<string, string> = {};
            apiErrors.forEach((it: any) => (map[it.field] = it.message));
            setErrors(map);
          }
          toastHelper.error({
            title: "Error al guardar",
            description: "Ocurrió un error al guardar la carrera. Intente nuevamente.",
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
          const opPromise = api.delete(`/admin/courses/${course.id}`);

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
          toastHelper.error({ title: "Error al eliminar", description: "No se pudo eliminar la carrera." });
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
        message={modal.message}
        onConfirm={modal.action}
        onCancel={() => {
          setModal({ ...modal, isOpen: false });
        }}
      />
      <div className="flex flex-wrap justify-between">
        <div className="grow-7 basis-md">
          <div className="flex flex-col mx-auto p-4 space-y-4">
            <Form onSubmit={(e) => { e.preventDefault(); save(); }} validationErrors={errors as any}>
            <h1 className="text-2xl font-bold">Detalles de la Carrera</h1>
            <Input
              isRequired
              label="Nombre"
              labelPlacement="outside"
              placeholder="Ingrese el nombre de la carrera"
              value={course.name}
              onValueChange={(v) => {
                setName(v);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              isInvalid={!!errors.name}
              errorMessage={({ validationDetails }) => {
                if (validationDetails?.valueMissing) return "El nombre es requerido";
                return errors.name ?? null;
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
            </Form>
          </div>
        </div>
        <div className="grow-3 basis-sm">
          <div className="flex flex-col lg:max-w-sm mx-auto p-4 space-y-4">
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
            <div className="flex flex-row flex-wrap gap-4">
              <Button color="primary" className="px-4 py-2 rounded" onClick={save}>
                {isExistingCourse ? "Guardar Cambios" : "Crear Carrera"}
              </Button>
              {isExistingCourse && (
                <Button color="danger" className="px-4 py-2 rounded" onClick={del}>
                  Eliminar Carrera
                </Button>
              )}
              <Button color="default" className="px-4 py-2 rounded" onClick={goBack}>
                Volver a la Lista de Carreras
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
