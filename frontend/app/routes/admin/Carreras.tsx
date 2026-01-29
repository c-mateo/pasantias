import { startTransition, useOptimistic, useState } from "react";
import type { Route } from "./+types/Carreras";
import { api } from "~/api/api";
import type {
  AdminCourseListResponse,
  CourseDTO,
  Paginated,
} from "~/api/types";
import AdminList2, { type Header } from "~/components/AdminList2";
import { useList } from "./Aplicaciones";

export async function clientLoader(data: Route.ClientLoaderArgs) {
  return await api.get("/courses?limit=10").json<AdminCourseListResponse>();
}

// export function AdminPage<T extends Paginated<{ id: number }>>({
//   title,
//   createHref,
//   columns,
//   listEndpoint,
//   deleteEndpoint,
//   chunk,
//   loaderData,
//   getName,
// }: {
//   title: string;
//   createHref: string;
//   columns: Header[];
//   listEndpoint: string;
//   deleteEndpoint: string;
//   chunk: number;
//   loaderData: T;
//   getName: (item: T) => string;
// }) {
//   const { items, hasMore, loading, loadMore, deleteItems } = useList({
//     endpoint: listEndpoint,
//     chunk,
//     loaderData,
//   });

//   const [optimisticItems, deleteOptimisticItems] = useOptimistic(
//     items,
//     (items, deletedIds: number[]) => {
//       return items.filter((item) => !deletedIds.includes(item.id));
//     },
//   );

//   const onDeleteItem = async (id: number) => {
//     startTransition(async () => {
//       deleteOptimisticItems([id]);
//       await api.delete(deleteEndpoint + "/" + id).res();
//       deleteItems([id]);
//     });
//   };

//   const onDeleteItems = async (ids: number[]) => {
//     startTransition(async () => {
//       deleteOptimisticItems(ids);
//       await Promise.all(
//         ids.map(
//           async (id) => await api.delete(deleteEndpoint + "/" + id).res(),
//         ),
//       );
//       deleteItems(ids);
//     });
//   };

//   return (
//     <div className="px-4 py-3 max-w-4xl mx-auto">
//       <AdminList2
//         canCreate
//         canDelete
//         columns={columns}
//         items={optimisticItems}
//         loading={loading}
//         hasMore={hasMore}
//         loadMore={loadMore}
//         getId={(c) => c.id}
//         getName={getName}
//         onDeleteItem={(id) => onDeleteItem(id)}
//         onDeleteSelected={(ids) => onDeleteItems(ids)}
//         createHref={createHref}
//         title={title}
//       />
//     </div>
//   );
// }

export default function Cursos({ loaderData }: Route.ComponentProps) {
  const { items, hasMore, loading, loadMore, deleteItems } = useList({
    endpoint: "/courses",
    chunk: 10,
    loaderData,
  });

  const [optimisticItems, deleteOptimisticItems] = useOptimistic(
    items,
    (items, deletedIds: number[]) => {
      return items.filter((item) => !deletedIds.includes(item.id));
    },
  );

  const deleteCourse = async (id: number) => {
    startTransition(async () => {
      deleteOptimisticItems([id]);
      await api.delete(`/courses/${id}`).res();
      deleteItems([id]);
    });
  };

  const deleteCourses = async (ids: number[]) => {
    startTransition(async () => {
      deleteOptimisticItems(ids);
      await Promise.all(
        ids.map(async (id) => await api.delete(`/courses/${id}`).res()),
      );
      deleteItems(ids);
    });
  };

  return (
    <div className="px-4 py-3 max-w-4xl mx-auto">
      <AdminList2
        canCreate
        canDelete
        columns={[
          { name: "name", label: "Nombre", sortable: true },
          {
            name: "shortName",
            label: "Sigla",
            alignment: "center",
            sortable: true,
            renderer: (value) => value ?? "N/A",
          },
        ]}
        items={optimisticItems}
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
