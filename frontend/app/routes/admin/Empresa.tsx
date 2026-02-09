import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Empresa";
import { useState } from "react";
import { Input, Textarea, Form } from "@heroui/react";
import { toast as toastHelper } from "~/util/toast";
import { Button } from "@heroui/button";
import { Modal } from "../../components/Modal";
import { createSetters } from "~/util/createSetters";
import { api } from "~/api/api";
import { toDatetimeLocal, formatDateTimeLocal } from "~/util/helpers";
import type { CompanyUpdateResponse, AdminCompanyDetailsResponse, CompanyCreateBody, CompanyUpdateBody } from "~/api/types";
import { omit } from "./Carrera";

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  if (params.empresaId === "nuevo") {
    return { id: 0 } as AdminCompanyDetailsResponse["data"];
  }

  const response = await api
    .get(`/companies/${params.empresaId}`)
    .json<AdminCompanyDetailsResponse>();

  return response.data ?? {};
}



const create = (data: CompanyCreateBody) => {
  return api.post(data, "/admin/companies").json<CompanyUpdateResponse>();
};

const edit = (companyId: number, data: CompanyUpdateBody) => {
  return api.patch(data, `/admin/companies/${companyId}`).json<CompanyUpdateResponse>();
};

export default function Empresa({ loaderData }: Route.ComponentProps) {
  const data = loaderData;

  const [company, setCompany] = useState(data);

  const isExistingCompany = company.id !== 0;

  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    action: () => {},
  });

  const navigate = useNavigate();

  const { setName, setDescription, setWebsite, setEmail, setPhone, setLogo } =
    createSetters(setCompany);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = (c: typeof company) => {
    const e: Record<string, string> = {};
    if (!c.name || c.name.trim() === "") e.name = "El nombre es requerido";
    if (!c.email || c.email.trim() === "") e.email = "El email es requerido";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) e.email = "Formato de email inválido";
    if (c.website && c.website.trim() !== "") {
      try {
        new URL(c.website);
      } catch {
        e.website = "URL inválida";
      }
    }
    return e;
  };

  const save = () => {
    // Lógica para guardar los cambios de la em
    const e = validate(company);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toastHelper.warn({ title: "Corrige los errores del formulario" });
      return;
    }
    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
        action: async () => {
          try {
            const opPromise = isExistingCompany
              ? edit(company.id, company)
              : create(company);

            toastHelper.info({
              title: isExistingCompany ? "Actualizando empresa" : "Creando empresa",
              description: isExistingCompany
                ? "Actualizando la empresa en el servidor..."
                : "Creando la empresa en el servidor...",
              promise: opPromise,
            });

            const res = await opPromise;

            toastHelper.success({
              title: isExistingCompany ? "Empresa actualizada" : "Empresa creada",
              description: isExistingCompany
                ? "La empresa se actualizó correctamente."
                : "La empresa se creó correctamente.",
            });

            setModal({ ...modal, isOpen: false });
            goBack();
          } catch (err) {
            console.error(err);
            // Try to surface validation errors from the API
            const apiErrors = (err as any)?.errors ?? (err as any)?.response?.data?.errors;
            if (Array.isArray(apiErrors)) {
              const map: Record<string, string> = {};
              apiErrors.forEach((it: any) => (map[it.field] = it.message));
              setErrors(map);
            }
            toastHelper.error({
              title: "Error al guardar",
              description: "Ocurrió un error al guardar la empresa. Intente nuevamente.",
            });
          }
        },
    });
  };

  const del = () => {
    // Lógica para eliminar la empresa
    setModal({
      isOpen: true,
      message:
        "¿Está seguro de que desea eliminar esta empresa? Esta acción no se puede deshacer.",
      action: () => {
        setModal({ ...modal, isOpen: false });
        goBack();
      },
    });
  };

  const goBack = () => {
    // Lógica para volver a la lista de empresas
    navigate("/admin/empresas");
  };

  const metadata = isExistingCompany ? (
    <div>
      <h2 className="text-xl font-bold">Información Adicional</h2>
      <p>
        <span className="font-medium">Fecha de Creación:</span>{" "}
        {formatDateTimeLocal(data.createdAt)}
      </p>
      <p>
        <span className="font-medium">Última Actualización:</span>{" "}
        {formatDateTimeLocal(data.updatedAt)}
      </p>
    </div>
  ) : null;

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
                    <a href="/admin/empresas" className="text-sm text-blue-600">← Volver a Empresas</a>
                  </div>
                  <Form onSubmit={(e) => { e.preventDefault(); save(); }} validationErrors={errors as any}>
                    <h1 className="text-2xl font-bold">Detalles de la Empresa</h1>

                    <div className="mt-4 flex flex-col gap-4 w-full">
                      <Input
                        isRequired
                        label="Nombre"
                        labelPlacement="outside"
                        placeholder="Ingrese el nombre de la empresa"
                        value={company.name}
                        onValueChange={(v) => {
                          setName(v);
                          setErrors((prev) => (omit(prev, ['name'])));
                        }}
                        isInvalid={!!errors.name}
                        errorMessage={({ validationDetails }) => {
                          if (validationDetails?.valueMissing) return "El nombre es requerido";
                          return errors.name ?? null;
                        }}
                      />

                      <Input
                        isRequired
                        label="Email"
                        labelPlacement="outside"
                        type="email"
                        placeholder="Ingrese el email de la empresa"
                        value={company.email}
                        onValueChange={(v) => {
                          setEmail(v);
                          setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        isInvalid={!!errors.email}
                        errorMessage={({ validationDetails }) => {
                          if (validationDetails?.valueMissing) return "El email es requerido";
                          if (validationDetails?.typeMismatch) return "Formato de email inválido";
                          return errors.email ?? null;
                        }}
                      />

                      <Input
                        label="Teléfono"
                        labelPlacement="outside"
                        placeholder="Ingrese el teléfono"
                        value={company.phone ?? ""}
                        onValueChange={(v) => {
                          setPhone(v);
                          setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                      />

                      <Input
                        label="Sitio Web"
                        labelPlacement="outside"
                        type="url"
                        placeholder="https://example.com"
                        value={company.website ?? ""}
                        onValueChange={(v) => {
                          setWebsite(v);
                          setErrors((prev) => ({ ...prev, website: undefined }));
                        }}
                        isInvalid={!!errors.website}
                        errorMessage={() => errors.website ?? null}
                      />

                      <Textarea
                        label="Descripción"
                        labelPlacement="outside"
                        placeholder="Describir la empresa"
                        value={company.description ?? ""}
                        onValueChange={setDescription}
                      />

                      <Input
                        label="Logo URL"
                        labelPlacement="outside"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={company.logo ?? ""}
                        onValueChange={setLogo}
                      />
                    </div>
                  </Form>
                </div>
              </article>
            </div>

            <aside className="lg:col-span-2">
              <div className="bg-white rounded shadow p-4 space-y-4">
                {metadata}
                <h2 className="text-xl font-bold">Acciones</h2>
                <div className="flex flex-col gap-3">
                  <Button
                    color="primary"
                    className="w-full"
                    radius="md"
                    onPress={save}
                  >
                    {isExistingCompany ? "Guardar Cambios" : "Crear Empresa"}
                  </Button>
                  {isExistingCompany && (
                    <Button
                      color="danger"
                      className="w-full"
                      radius="md"
                      onPress={del}
                    >
                      Eliminar Empresa
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
