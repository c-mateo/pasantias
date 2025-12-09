import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/Carrera";
import { act, useState } from "react";
import type { AdminCourse } from "./Carreras";
import { useSettersForObject } from "~/util/createPropertySetter";
import { Modal } from "../../components/Modal";

export async function loader({ params, request }: Route.LoaderArgs) {
  if (params.carreraId === "nuevo") {
    return {
      data: {
        id: 0,
        name: "",
        shortName: "",
        description: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as AdminCourse,
    };
  }

  const response = await fetch(
    `http://localhost:5173/api/v1/courses/${params.carreraId}`,
    {
      credentials: "include",
      headers: {
        Cookie: request.headers.get("Cookie") ?? "",
      },
    }
  );
  if (!response.ok) {
    throw new Response("Course not found", { status: 404 });
  }
  const course = await response.json();
  return { data: course.data as AdminCourse };
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

export const formatDateTimeLocal = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
    dateStyle: "short",
    hour12: false,
  }).format(date);
};

// function diff<T extends Record<string, any>>(newValue: T, oldValue: T) {
//   const result: any = {}
//   for (const key in newValue) {
//     if (newValue[key] != oldValue[key]) result[key] = newValue[key];    
//   }
//   Object.entries(newValue).filter(([k, v]) => oldValue[k] != v)
//   return result;
// };

export default function Curso({ loaderData }: Route.ComponentProps) {
  const { data } = useLoaderData<typeof loader>();

  const [course, setCourse] = useState(data);

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

  const save = () => {
    // Lógica para guardar los cambios del curso
    console.log("Guardando curso:", course);
    setModal({
      isOpen: true,
      message: "¿Desea guardar los cambios?",
      action: async () => {
        console.log("Cambios guardados.");
        await fetch(`/api/v1/admin/courses/${course.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(course),
        });
        setModal({ ...modal, isOpen: false });
        goBack();
      },
    });
  };

  const del = () => {
    // Lógica para eliminar el curso
    console.log("Eliminando curso con ID:", course.id);
    setModal({
      isOpen: true,
      message: "¿Está seguro de que desea eliminar este curso?",
      action: () => {
        console.log("Curso eliminado.");
        setModal({ ...modal, isOpen: false });
        goBack();
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
            <h1 className="text-2xl font-bold">Detalles de la Carrera</h1>
            <label htmlFor="name" className="font-medium">
              Nombre:
            </label>
            <input
              name="name"
              className="border p-2 rounded bg-white"
              value={course.name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="shortName" className="font-medium">
              Nombre Corto:
            </label>
            <input
              name="shortName"
              className="border p-2 rounded bg-white"
              value={course.shortName ?? ""}
              onChange={(e) => setShortName(e.target.value)}
            />
            <label htmlFor="description" className="font-medium">
              Descripción:
            </label>
            <textarea
              name="description"
              className="border p-2 rounded bg-white max-h-40"
              value={course.description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
            />
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
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-max"
                onClick={save}
              >
                {isExistingCourse ? "Guardar Cambios" : "Crear Carrera"}
              </button>
              {isExistingCourse && (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-max"
                  onClick={del}
                >
                  Eliminar Carrera
                </button>
              )}
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-max"
                onClick={goBack}
              >
                Volver a la Lista de Carreras
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
