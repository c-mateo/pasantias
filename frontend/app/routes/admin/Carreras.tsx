import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import AdminList from "~/components/AdminList";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import type { Route } from "./+types/Carreras";
import { formatDateTimeLocal } from "~/util/helpers";
import { api } from "~/api/api";
import type { AdminCourseListResponse } from "~/api/types";
import AdminList2 from "~/components/AdminList2";

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

  const res = await api.get("/courses?limit=10").res();
  const json = await res.json();
  return {
    initialData: json?.data ?? [],
    pagination: json?.pagination ?? { next: null, prev: null },
  };
}

export default function Cursos({ loaderData }: Route.ComponentProps) {
  const { initialData, pagination } = loaderData;

  const [courses, setCourses] = useState<AdminCourse[]>(initialData || []);
  const [page, setPage] = useState(pagination.next);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!page || loading) return;
    setLoading(true);
    try {
      const res = await api.get(`/courses?limit=10&after=${page}`).res();
      const json = await res.json();
      const next = json?.data ?? [];
      setCourses((prev) => [...prev, ...next]);
      setPage(json?.pagination?.next ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasMore = page !== null;

  const deleteCourse = (courseId: number) =>
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  const deleteCourses = (ids: number[]) =>
    setCourses((prev) => prev.filter((c) => !ids.includes(c.id)));
  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* AdminList shows title and create button */}
      <AdminList2
        columns={[
          { name: "name", label: "Nombre", sortable: true },
          {
            name: "shortName",
            label: "Sigla",
            alignment: "center",
            renderer: (item) => item || "N/A",
          }
        ]}
        items={courses}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
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
