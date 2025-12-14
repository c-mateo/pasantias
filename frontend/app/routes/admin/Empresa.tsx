import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Empresa";
import { useEffect, useState } from "react";
import { Input, Textarea } from "@heroui/react";
import { Button } from "@heroui/button";
import { Modal } from "../../components/Modal";
import type { AdminCompany } from "./Empresas";
import { useSettersForObject } from "~/util/createPropertySetter";

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  if (params.empresaId === "nuevo") {
    return {
        id: 0,
        name: "",
        description: "",
        website: "",
        email: "",
        phone: "",
        logo: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    } as AdminCompany;
  }

  const response = await fetch(
    `http://localhost:5173/api/v1/companies/${params.empresaId}`,
    {
      credentials: "include",
      headers: {
        Cookie: request.headers.get("Cookie") ?? "",
      },
    },
  );
  if (!response.ok) {
    throw new Response("Company not found", { status: 404 });
  }
  const company = await response.json();
  return company.data as AdminCompany;
}

/**
 * Crea una función anidada para actualizar una propiedad específica de un objeto de estado.
 * @template T El tipo del objeto de estado.
 * @template K Las claves de T.
 * @param setter La función setter de React.Dispatch<React.SetStateAction<T>>.
 * @returns Una función que acepta la clave (K) y devuelve otra función para el nuevo valor.
 */
export const setterBuilderObject = <T extends object, K extends keyof T>(
  setter: React.Dispatch<React.SetStateAction<T>>,
) => {
  // Retorna una función que espera la propiedad (K) a modificar
  return (prop: K) => {
    // Esta función espera el nuevo valor (T[K]) para esa propiedad
    return (newValue: T[K]) => {
      // Llama al setter de React
      setter((prev) => ({
        // Copia todas las propiedades anteriores
        ...prev,
        // Sobrescribe la propiedad específica
        [prop]: newValue,
      }));
    };
  };
};

// Ejemplo de uso:
// interface User { name: string; age: number; }
// const [user, setUser] = useState<User>({ name: 'Ana', age: 30 });
// const setUserProp = setterBuilderObject(setUser);
// const setUserName = setUserProp('name');
// setUserName('Beatriz'); // Actualiza solo el nombre

/**
 * Define un tipo base para asegurar que los elementos del array tienen un 'id: number'.
 */
type ItemWithId = { id: number; [key: string]: any };

/**
 * Crea una función anidada para actualizar una propiedad de un elemento
 * específico dentro de un array de estado, usando su ID.
 * @template T El tipo del elemento individual en el array (debe extender ItemWithId).
 * @template K Las claves de T.
 * @param setter La función setter de React.Dispatch<React.SetStateAction<T[]>>.
 * @returns Una función que acepta id y clave (K), y devuelve otra función para el nuevo valor.
 */
export const setterBuilderArray = <T extends ItemWithId, K extends keyof T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
) => {
  // Retorna una función que espera el ID y la propiedad (K) a modificar
  return (id: number, prop: K) => {
    // Esta función espera el nuevo valor (T[K])
    return (newValue: T[K]) => {
      // Llama al setter de React
      setter((prevArray) => {
        // Devolvemos el array mapeado (inmutabilidad)
        return prevArray.map((item) =>
          // Si el ID coincide, modificamos el elemento.
          item.id === id ? { ...item, [prop]: newValue } : item,
        );
      });
    };
  };
};

// Ejemplo de uso (asumiendo que T es { id: number, value: string }):
// const [items, setItems] = useState<Item[]>(/* ... */);
// const setItemProp = setterBuilderArray(setItems);
// const setItemValueId10 = setItemProp(10, 'value');
// setItemValueId10('Nuevo texto'); // Actualiza 'value' del ítem con id 10

const toDatetimeLocal = (dateString: string) => {
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

// const ask = (message: string, options: string[] = [], onConfirm?: () => void) => {
//     const confirmation = window.confirm(message);
//     if (confirmation && onConfirm) {
//         onConfirm();
//     }
// };

// Use shared Modal component from components/Modal

const formatDateTimeLocal = (dateString: string) => {
  const date = new Date(dateString);
  return Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
    dateStyle: "short",
    hour12: false,
  }).format(date);
};

const create = async (data: any) => {
  await fetch("/api/v1/admin/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export default function Empresa({ loaderData }: Route.ComponentProps) {
  const data = useLoaderData<typeof clientLoader>();

  const [company, setCompany] = useState(data);

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

  const { setName, setDescription, setWebsite, setEmail, setPhone, setLogo } =
    useSettersForObject(setCompany);

  const isExistingCompany = company.id !== 0;

  const save = () => {
    // Lógica para guardar los cambios de la empresa
    console.log("Guardando empresa:", company);
    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
      action: async () => {
        console.log("Cambios guardados.");
        if (isExistingCompany) {
          // Lógica para actualizar la empresa existente
        } else {
          // Lógica para crear una nueva empresa
          await create(company);
        }
        setModal({ ...modal, isOpen: false });
        goBack();
      },
    });
  };

  const del = () => {
    // Lógica para eliminar la empresa
    console.log("Eliminando empresa con ID:", company.id);
    setModal({
      isOpen: true,
      message:
        "¿Está seguro de que desea eliminar esta empresa? Esta acción no se puede deshacer.",
      action: () => {
        console.log("Empresa eliminada.");
        setModal({ ...modal, isOpen: false });
        goBack();
      },
    });
  };

  const goBack = () => {
    // Lógica para volver a la lista de empresas
    navigate("/admin/empresas");
  };

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
            <h1 className="text-2xl font-bold">Detalles de la Empresa</h1>
            <Input
              isRequired
              label="Nombre"
              labelPlacement="outside"
              placeholder="Ingrese el nombre de la empresa"
              value={company.name}
              onValueChange={setName}
            />
            <Input
              isRequired
              label="Email"
              labelPlacement="outside"
              type="email"
              placeholder="Ingrese el email de la empresa"
              value={company.email}
              onValueChange={setEmail}
            />
            <Input
              label="Teléfono"
              labelPlacement="outside"
              placeholder="Ingrese el teléfono"
              value={company.phone ?? ""}
              onValueChange={setPhone}
            />
            <Input
              label="Sitio Web"
              labelPlacement="outside"
              type="url"
              placeholder="https://example.com"
              value={company.website ?? ""}
              onValueChange={setWebsite}
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
        </div>
        <div className="grow-3 basis-sm">
          <div className="flex flex-col lg:max-w-sm mx-auto p-4 space-y-4">
            {isExistingCompany && (
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
                {isExistingCompany ? "Guardar Cambios" : "Crear Empresa"}
              </Button>
              {isExistingCompany && (
                <Button color="danger" className="px-4 py-2 rounded" onClick={del}>
                  Eliminar Empresa
                </Button>
              )}
              <Button color="default" className="px-4 py-2 rounded" onClick={goBack}>
                Volver a la Lista de Empresas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
