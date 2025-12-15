import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import AdminList from "~/components/AdminList";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import type { Route } from "./+types/Carreras";
import { formatDateTimeLocal } from "~/util/helpers";
import { api } from "~/api/api";
import type { AdminCourseListResponse } from "~/api/types";

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

export async function clientLoader(data: Route.ClientLoaderArgs) {
  // const user = await requireUser();
  // if (user?.role !== "ADMIN") return null;

  const res = await api
    .get("/courses?limit=10")
    .json<AdminCourseListResponse>();
  return {
    initialData: res?.data ?? [],
    pagination: res?.pagination ?? { next: null, prev: null },
  };
}

export default function Cursos({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;

  const [courses, setCourses] = useState(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);
  // selection & modal handled by AdminList now

  const sentinelRef = useRef<HTMLTableRowElement>(null);

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);
    try {
      const res = await api.get(`/courses?limit=10&after=${page}`).json<AdminCourseListResponse>();
      const next = res?.data ?? [];
      setCourses((prev) => [...prev, ...next]);
      setPage(res?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const deleteCourse = (courseId: number) =>
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  const deleteCourses = (ids: number[]) =>
    setCourses((prev) => prev.filter((c) => !ids.includes(c.id)));
  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* AdminList shows title and create button */}
      <AdminList
        headers={[
          { label: "Nombre" },
          {
            label: "Sigla",
            className:
              "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300",
          },
          {
            label: "Creado",
            className:
              "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300",
          },
          {
            label: "Actualizado",
            className:
              "px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-300",
          },
        ]}
        items={courses}
        loading={loading}
        sentinelRef={sentinelRef}
        getId={(c) => c.id}
        getName={(c) => c.name}
        // Use AdminList renderCells to display each column cell
        renderCells={(course) => (
          <>
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
          </>
        )}
        onDeleteItem={(id) => deleteCourse(id)}
        onDeleteSelected={(ids) => deleteCourses(ids)}
        createHref="/admin/carreras/nuevo"
        title="Administrar Carreras"
      />
    </div>
  );
}
