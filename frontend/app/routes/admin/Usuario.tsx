import { useState, useRef, useEffect } from "react";
import { Form, Select, SelectItem } from "@heroui/react";
import Cuil from "~/components/Cuil";
import InlineEditable from "~/components/InlineEditable";
import { Modal } from "~/components/Modal";
import UserMessage from "~/components/UserMessage";
import { api } from "~/api/api";
import { toast as toastHelper } from "~/util/toast";
import { formatDateTimeLocal } from "~/util/helpers";
import type {
  UserDetailsResponse,
  CourseListResponse,
  PublicCourseDTO,
} from "~/api/types";
import { getAll } from "./Oferta";

export async function clientLoader({ params }: any) {
  const res = await api
    .get(`/admin/users/${params.usuarioId}`)
    .json<UserDetailsResponse>();
  const allCourses = await getAll<CourseListResponse>("/courses");
  return { user: res.data, courses: allCourses };
}

export default function Usuario({ loaderData }: any) {
  const { user, courses } = loaderData as any;

  const [userData, setUserData] = useState(user);

  const [originalCuil, setOriginalCuil] = useState(user?.cuil ?? "");

  const [originalRole, setOriginalRole] = useState(user?.role ?? "USER");

  const [loadingCuil, setLoadingCuil] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title?: string;
    body?: React.ReactNode;
    action?: () => Promise<void> | void;
  }>({ isOpen: false });

  // selected course ids and debounce timer for saving
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>(
    (user?.courses ?? []).map((c: any) => c.id),
  );
  const saveTimerRef = useRef<number | null>(null);
  const [savingCourses, setSavingCourses] = useState(false);

  useEffect(() => {
    setSelectedCourseIds((userData?.courses ?? []).map((c: any) => c.id));
  }, [userData?.courses]);

  // perform actual CUIL save (used after confirmation)
  const performSaveCuil = async (newCuil: string) => {
    if (newCuil.trim().length === 0 || newCuil === originalCuil) {
      return;
    }
    setLoadingCuil(true);
    try {
      let res = await api
        .patch({ cuil: newCuil }, `/admin/users/${userData.id}/cuil`)
        .res();
      if (res.status === 404) {
        res = await api
          .patch({ cuil: newCuil }, `/admin/users/${userData.id}`)
          .res();
      }
      await res.json();
      setOriginalCuil(newCuil);
      setUserData((prev: any) => ({ ...prev, cuil: newCuil }));
      toastHelper.success({ title: "CUIL actualizado" });
    } catch (err) {
      console.error(err);
      toastHelper.error({
        title: "Error",
        description: "No se pudo actualizar el CUIL",
      });
    } finally {
      setLoadingCuil(false);
    }
  };

  const performSaveRole = async (newRole: string) => {
    if (newRole === originalRole) return;
    setLoadingRole(true);
    try {
      let res = await api
        .put({ role: newRole }, `/admin/users/${userData.id}/role`)
        .res();
      if (res.status === 404) {
        res = await api
          .patch({ role: newRole }, `/admin/users/${userData.id}`)
          .res();
      }
      if (res.ok) await res.json();
      setOriginalRole(newRole);
      setUserData((prev: any) => ({ ...prev, role: newRole }));
      toastHelper.success({ title: "Rol actualizado" });
    } catch (err) {
      console.error(err);
      toastHelper.error({
        title: "Error",
        description: "No se pudo actualizar el rol",
      });
    } finally {
      setLoadingRole(false);
    }
  };

  const saveCourses = async (ids: number[]) => {
    if (!Array.isArray(ids)) return;
    setSavingCourses(true);
    try {
      let res = await api
        .put({ coursesIds: ids }, `/admin/users/${userData.id}/courses`)
        .res();
      if (res.status === 404) {
        res = await api
          .patch({ coursesIds: ids }, `/admin/users/${userData.id}`)
          .res();
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await res.json();
      setUserData((prev: any) => ({
        ...prev,
        courses: (courses ?? []).filter((c: any) => ids.includes(c.id)),
      }));
      toastHelper.success({ title: "Carreras actualizadas" });
    } catch (err) {
      console.error(err);
      toastHelper.error({
        title: "Error",
        description: "No se pudieron actualizar las carreras",
      });
    } finally {
      setSavingCourses(false);
    }
  };

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-4">
            <article className="bg-white rounded shadow">
              <div className="p-4">
                <div className="mb-4">
                  <a href="/admin/usuarios" className="text-sm text-blue-600">
                    ← Volver a Usuarios
                  </a>
                </div>
                {/* Confirmation modal for inline edits */}
                <Modal
                  isOpen={confirmModal.isOpen}
                  title={confirmModal.title}
                  body={confirmModal.body}
                  onConfirm={async () => {
                    try {
                      await confirmModal.action?.();
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setConfirmModal({ isOpen: false });
                    }
                  }}
                  onCancel={() => setConfirmModal({ isOpen: false })}
                />

                <Form
                  className="gap-4 items-stretch"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div>
                    <label className="text-sm text-default-500">Nombre</label>
                    <div className="text-lg font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-default-500">Email</label>
                    <div className="text-sm">{user?.email}</div>
                  </div>

                  <div>
                    <label className="text-sm text-default-500">Carreras</label>
                    <div className="text-sm mt-1">
                      <Select
                        labelPlacement="outside"
                        placeholder="Seleccionar carreras"
                        selectionMode="multiple"
                        items={courses ?? []}
                        selectedKeys={new Set(selectedCourseIds.map(String))}
                        onSelectionChange={(v: any) => {
                          let ids: number[] = [];
                          if (v instanceof Set) ids = Array.from(v).map((s) => Number(s));
                          else if (Array.isArray(v)) ids = v.map(Number);
                          else if (v != null) ids = [Number(v)];

                          // update UI immediately
                          setSelectedCourseIds(ids);
                          setUserData((prev: any) => ({
                            ...prev,
                            courses: (courses ?? []).filter((c: any) => ids.includes(c.id)),
                          }));

                          // debounce save (1s)
                          if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current as any);
                          saveTimerRef.current = window.setTimeout(() => {
                            if (saveTimerRef.current === null) return
                            void saveCourses(ids);
                            saveTimerRef.current = null;
                          }, 1000);
                        }}
                        onBlur={() => {
                          // on blur, flush pending save immediately
                          if (saveTimerRef.current) {
                            window.clearTimeout(saveTimerRef.current as any);
                            saveTimerRef.current = null;
                          }
                          void saveCourses(selectedCourseIds);
                        }}
                      >
                        {(c: any) => (
                          <SelectItem key={c.id}>{c.name}</SelectItem>
                        )}
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <label className="text-sm text-default-500">Rol</label>
                      <div className="text-sm mt-1">
                        <InlineEditable
                          value={userData?.role ?? "USER"}
                          Editor={(props: any) => {
                            return (
                              <Select
                                isRequired
                                selectedKeys={new Set([props.value])}
                                onSelectionChange={(v: any) => {
                                  if (v instanceof Set) {
                                    const first = Array.from(v)[0];
                                    props.onValueChange(String(first));
                                  } else {
                                    props.onValueChange(String(v));
                                  }
                                }}
                                className="w-full"
                                placeholder="Seleccione un rol"
                              >
                                <SelectItem key="USER">USER</SelectItem>
                                <SelectItem key="ADMIN">ADMIN</SelectItem>
                              </Select>
                            );
                          }}
                          renderView={(v: any) => <span>{v}</span>}
                          onRequestSave={(newVal: string) => {
                            setConfirmModal({
                              isOpen: true,
                              title: "Confirmar cambio de rol",
                              body: (
                                <div>
                                  ¿Asignar rol <b>{newVal}</b> a este usuario?
                                </div>
                              ),
                              action: async () => {
                                await performSaveRole(newVal);
                              },
                            });
                          }}
                          saveDisabled={loadingRole}
                          validate={(v: string) => {
                            if (!v) return "Seleccione un rol";
                            if (v !== "USER" && v !== "ADMIN")
                              return "Rol inválido";
                            return null;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-default-500">Teléfono</label>
                    <div className="text-sm">{user?.phone ?? "N/A"}</div>
                  </div>

                  <div>
                    <label className="text-sm text-default-500">
                      Dirección
                    </label>
                    <div className="text-sm">{user?.address ?? "N/A"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-default-500">
                        Provincia
                      </label>
                      <div className="text-sm">{user?.province ?? "N/A"}</div>
                    </div>
                    <div>
                      <label className="text-sm text-default-500">Ciudad</label>
                      <div className="text-sm">{user?.city ?? "N/A"}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <label className="text-sm text-default-500">CUIL</label>
                      <div className="text-sm mt-1">
                        <InlineEditable
                          value={userData?.cuil ?? ""}
                          Editor={(props: any) => (
                            <Cuil
                              isRequired
                              placeholder="Ej: 20-12345678-9"
                              {...props}
                            />
                          )}
                          renderView={(v: any) => (
                            <>
                              <span>{v || "N/A"}</span>
                            </>
                          )}
                          onRequestSave={(newVal: string) => {
                            setConfirmModal({
                              isOpen: true,
                              title: "Confirmar cambio de CUIL",
                              body: (
                                <div>
                                  ¿Actualizar CUIL a <b>{newVal}</b>?
                                </div>
                              ),
                              action: async () => {
                                await performSaveCuil(newVal);
                              },
                            });
                          }}
                          saveDisabled={loadingCuil}
                          validate={(v: string) => {
                            const val = String(v || "");
                            const digits = val.replace(/\D/g, "");
                            if (!val || val.trim().length === 0)
                              return "Ingrese un CUIL";
                            if (digits.length !== 11)
                              return "El CUIL debe tener 11 dígitos";
                            return null;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-default-500">Creado</label>
                    <div className="text-sm">
                      {formatDateTimeLocal(user?.createdAt)}
                    </div>
                  </div>
                </Form>
              </div>
            </article>
          </div>

          <aside className="lg:col-span-2" aria-hidden="true">
            <div className="bg-white rounded shadow p-4 space-y-4">
              <UserMessage userId={userData?.id} userName={`${userData?.firstName || ""} ${userData?.lastName || ""}`}/>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
