import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import ActionButtons from "~/components/ActionButtons";
import { Modal } from "../../components/Modal";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import type { Route } from "./+types/Carreras";
import { formatDateTimeLocal } from "./Carrera";

// Public view of a course
export type PublicCourse = {
  id: number;
  name: string;
  description: string | null;
  shortName: string | null;
};

// Admin are supposed to see this data
export type AdminCourse = {
  id: number;
  name: string;
  description: string | null;
  shortName: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const res = await fetch("http://localhost:5173/api/v1/courses?limit=10", {
    credentials: "include",
    headers: {
      Cookie: request.headers.get("Cookie") ?? "",
    },
  });

  // console.log("Courses fetch response:", res);
  if (!res.ok) {
    throw new Response("Failed to fetch courses", { status: res.status });
  }

  // console.log("Courses fetch JSON:", await res.clone().json());

  const data = await res.json();
  return {
    initialData: data.data as AdminCourse[],
    pagination: data.pagination,
  };
}

export default function Cursos({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;

  const [courses, setCourses] = useState<AdminCourse[]>(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(() => new Set<number>());
  const [selectAllActive, setSelectAllActive] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    message: <></>,
    action: () => {},
  });

  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

  const sentinelRef = useRef<HTMLTableRowElement>(null);

  // Needed to access latest selectAllActive value inside loadMore
  // const observerData = useRef({
  //   selectAllActive,
  //   courses
  // });

  // useEffect(() => {
  //   observerData.current = { selectAllActive, courses };
  // }, [selectAllActive, courses]);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const total = courses.length;
    headerCheckboxRef.current.indeterminate =
      selected.size > 0 && selected.size < total;
  }, [selected, courses]);

  function toggleAll() {
    if (selected.size === courses.length) {
      setSelected(new Set());
      setSelectAllActive(false);
    } else {
      const all = new Set(courses.map((c) => c.id));
      setSelected(all);
      setSelectAllActive(true);
    }
  }

  function toggleOne(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      // If user manually deselects one while select-all-mode was active, disable selectAllActive
      if (!checked && selectAllActive) setSelectAllActive(false);
      return next;
    });
  }

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);

    const res = await fetch(`/api/v1/courses?limit=10&after=${page}`, {
      credentials: "include",
    });
    const body = await res.json();

    // Calcular la nueva lista de cursos a partir del estado actual y aplicar
    // la extensión de selección inmediatamente para minimizar parpadeos.
    const nextCourses = [...courses, ...body.data];
    setCourses(nextCourses);

    // Si el modo "seleccionar todo" estaba activo, extender la selección
    if (selectAllActive && nextCourses.length) {
      const all = new Set(nextCourses.map((c) => c.id));
      setSelected(all);
    }

    setPage(body.pagination.next); // null si no hay más

    setLoading(false);
  };

  useIntersectionObserver(sentinelRef, loadMore);

  useEffect(() => {
    if (!page) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading) {
        loadMore();
      }
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [page, loading, loadMore]);

  const onDelete = (courseId: number) => () => {
    const courseName = courses.find((course) => course.id === courseId)?.name;
    setModal({
      isOpen: true,
      message: (
        <>
          {"¿Estás seguro de que deseas eliminar el curso "}
          <b>{courseName}</b>
          {"? Esta acción no se puede deshacer."}
        </>
      ),
      action: () => {
        setCourses((prev) => prev.filter((course) => course.id !== courseId));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
        setModal({ ...modal, isOpen: false });
      },
    });
  };

  const onDeleteSelected = () => {
    setModal({
      isOpen: true,
      message: (
        <>
          {"¿Estás seguro de que deseas eliminar los "}
          <b>{selected.size} cursos seleccionados</b>
          {"? Esta acción no se puede deshacer."}
        </>
      ),
      action: () => {
        setCourses((prev) => prev.filter((course) => !selected.has(course.id)));
        setSelected(new Set());
        setModal({ ...modal, isOpen: false });
      },
    });
  };

  const navigate = useNavigate();

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <Modal
        isOpen={modal.isOpen}
        message={modal.message}
        onConfirm={modal.action}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Administrar Carreras</h2>
        <div>
          {selected.size > 0 && (
            <button
              className="mr-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={onDeleteSelected}
            >
              Eliminar Seleccionados ({selected.size})
            </button>
          )}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => navigate("/admin/carreras/nuevo")}
          >
            Crear Carrera
          </button>
        </div>
      </div>
      <div className="flex rounded-xl border border-gray-300 bg-white shadow-md overflow-y-auto max-h-[550px] scrollbar-none">
        <table className="w-full h-20 border-separate border-spacing-0">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 pt-1 border-b border-gray-300">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={
                    selected.size === courses.length && courses.length > 0
                  }
                  onChange={() => toggleAll()}
                  className="w-4 h-4"
                  aria-label="Seleccionar todo"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                Nombre
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Sigla
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Creado
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Actualizado
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-t border-gray-300">
                <td className="px-4 pt-1 border-b border-gray-300">
                  <input
                    type="checkbox"
                    checked={selected.has(course.id)}
                    onChange={(e) => toggleOne(course.id, e.target.checked)}
                    className="w-4 h-4"
                    aria-label={`Seleccionar curso ${course.name}`}
                  />
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300">
                  {course.name}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {course.shortName || "N/A"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {formatDateTimeLocal(course.createdAt)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 border-b border-gray-300 text-center">
                  {formatDateTimeLocal(course.updatedAt)}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500 border-b border-gray-300">
                  <ActionButtons
                    onEdit={() => console.log("Edit course", course.name)}
                    onDelete={onDelete(course.id)}
                    editHref={`/admin/carreras/${course.id}`}
                  />
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="border-t border-gray-300 text-center py-4"
                >
                  Cargando…
                </td>
              </tr>
            )}
            <tr ref={sentinelRef}>
              <td colSpan={7}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
