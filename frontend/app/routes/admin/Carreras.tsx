import { useState } from "react";
import type { Route } from "./+types/Carreras";
import { api } from "~/api/api";
import type { AdminCourseListResponse } from "~/api/types";
import AdminList2 from "~/components/AdminList2";

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

  const hasMore = page !== null;

  const deleteCourse = (courseId: number) =>
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  const deleteCourses = (ids: number[]) =>
    setCourses((prev) => prev.filter((c) => !ids.includes(c.id)));
  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      {/* AdminList shows title and create button */}
      <AdminList2
        canCreate
        canDelete
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
        onDeleteItem={(id) => deleteCourse(id)}
        onDeleteSelected={(ids) => deleteCourses(ids)}
        createHref="/admin/carreras/nuevo"
        title="Administrar Carreras"
      />
    </div>
  );
}
