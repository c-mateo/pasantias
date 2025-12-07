import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Empresa";
import { act, useEffect, useRef, useState } from "react";
import type { AdminCompany } from "./Empresas";
import { useSettersForObject } from "~/util/createPropertySetter";

export async function loader({ params, request }: Route.LoaderArgs) {
  if (params.empresaId === "nuevo") {
    return {
      data: {
        id: 0,
        name: "",
        description: "",
        website: "",
        email: "",
        phone: "",
        logo: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as AdminCompany,
    };
  }

  const response = await fetch(
    `http://localhost:5173/api/v1/companies/${params.empresaId}`,
    {
      credentials: "include",
      headers: {
        Cookie: request.headers.get("Cookie") ?? "",
      },
    }
  );
  if (!response.ok) {
    throw new Response("Company not found", { status: 404 });
  }
  const company = await response.json();
  return { data: company.data as AdminCompany };
}

/**
 * Crea una función anidada para actualizar una propiedad específica de un objeto de estado.
 * @template T El tipo del objeto de estado.
 * @template K Las claves de T.
 * @param setter La función setter de React.Dispatch<React.SetStateAction<T>>.
 * @returns Una función que acepta la clave (K) y devuelve otra función para el nuevo valor.
 */
export const setterBuilderObject = <T extends object, K extends keyof T>(
  setter: React.Dispatch<React.SetStateAction<T>>
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
  setter: React.Dispatch<React.SetStateAction<T[]>>
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
          item.id === id ? { ...item, [prop]: newValue } : item
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

export function Modal({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.focus();
    }
  }, [isOpen]);

  const onClickOutside = (e: React.MouseEvent) => {
    if (ref.current === e.target) {
      onCancel();
    }
  };

  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      ref={ref}
      onClick={onClickOutside}
      className="fixed z-10 inset-0 bg-black/25 backdrop-blur-xs flex items-center justify-center"
      onKeyUp={onKeyUp}
      tabIndex={-1}
    >
      <div className="max-w-xl bg-white p-6 rounded shadow-md">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

const formatDateTimeLocal = (dateString: string) => {
  const date = new Date(dateString);
  return Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
    dateStyle: "short",
    hour12: false,
  }).format(date);
};

export default function Empresa({ loaderData }: Route.ComponentProps) {
  const { data } = useLoaderData<typeof loader>();

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

  const save = () => {
    // Lógica para guardar los cambios de la empresa
    console.log("Guardando empresa:", company);
    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
      action: () => {
        console.log("Cambios guardados.");
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
      message: "¿Está seguro de que desea eliminar esta empresa? Esta acción no se puede deshacer.",
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

  const isExistingCompany = company.id !== 0;
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
            <label htmlFor="name" className="font-medium">
              Nombre:
            </label>
            <input
              name="name"
              className="border p-2 rounded bg-white"
              value={company.name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="email" className="font-medium">
              Email:
            </label>
            <input
              name="email"
              type="email"
              className="border p-2 rounded bg-white"
              value={company.email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="phone" className="font-medium">
              Teléfono:
            </label>
            <input
              name="phone"
              className="border p-2 rounded bg-white"
              value={company.phone ?? ""}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label htmlFor="website" className="font-medium">
              Sitio Web:
            </label>
            <input
              name="website"
              type="url"
              className="border p-2 rounded bg-white"
              value={company.website ?? ""}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <label htmlFor="description" className="font-medium">
              Descripción:
            </label>
            <textarea
              name="description"
              className="border p-2 rounded bg-white max-h-40"
              value={company.description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label htmlFor="logo" className="font-medium">
              Logo URL:
            </label>
            <input
              name="logo"
              type="url"
              className="border p-2 rounded bg-white"
              value={company.logo ?? ""}
              onChange={(e) => setLogo(e.target.value)}
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
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-max"
                onClick={save}
              >
                {isExistingCompany ? "Guardar Cambios" : "Crear Empresa"}
              </button>
              {isExistingCompany && (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-max"
                  onClick={del}
                >
                  Eliminar Empresa
                </button>
              )}
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-max"
                onClick={goBack}
              >
                Volver a la Lista de Empresas
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}