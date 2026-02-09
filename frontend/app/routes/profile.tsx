import React, { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Form, Input, type InputProps } from "@heroui/react";
import { api } from "~/api/api";
import toast from "~/util/toast";
import { requireUser, checkSession, useAuth } from "~/util/AuthContext";
import { Navigate, redirect } from "react-router";

export async function clientLoader() {
  const user = await requireUser();
  if (!user) throw redirect("/login");
}

import Cuil from "~/components/Cuil";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [email, setEmail] = useState("");
  const [cuil, setCuil] = useState<string | null>(null);
  const [cuilInput, setCuilInput] = useState("");

  // Email/password UI
  const [newEmail, setNewEmail] = useState("");
  const [isEmailSaving, setIsEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const auth = useAuth()

  if (!auth.user) return <Navigate to="/" replace />;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/profile").json();
        const data = (res as any).data;
        if (!mounted) return;
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setPhone(data.phone ?? "");
        setAddress(data.address ?? "");
        setCity(data.city ?? "");
        setProvince(data.province ?? "");
        setEmail(data.email ?? "");
        setCuil(data.cuil ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        firstName,
        lastName,
        phone,
        address,
        city,
        province,
      };
      // If CUIL is being set for the first time, call dedicated endpoint
      if (cuil === null && cuilInput) {
        const resCuil = await api.post({ cuil: cuilInput }, "/profile/set-cuil").res();
        if (resCuil.ok) {
          setCuil(cuilInput);
          setCuilInput("");
          await checkSession();
          toast.success({ title: "CUIL establecido" });
        } else {
          const body = await resCuil.json().catch(() => null);
          const msg = body?.detail || body?.message || `Error ${resCuil.status}`;
          throw new Error(String(msg));
        }
      }

      await api.patch(payload, "/profile").json();
      await checkSession();
      toast.success({ title: "Perfil actualizado" });
    } catch (err) {
      console.error(err);
      toast.error({
        title: "Error",
        message: "No se pudo guardar el perfil (intente nuevamente más tarde)",
      });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) return setEmailMessage("Ingrese un correo");
    if (!emailCurrentPassword)
      return setEmailMessage("Ingrese su contraseña actual");
    setIsEmailSaving(true);
    setEmailMessage(null);
    try {
      const res = await api
        .post(
          { newEmail, currentPassword: emailCurrentPassword },
          "/profile/change-email",
        )
        .res();
      if (res.ok) {
        setNewEmail("");
        setEmailCurrentPassword("");
        setEmailMessage("Revisa tu correo para confirmar el cambio");
        return;
      }
      const body = await res.json().catch(() => null);
      const msg = body?.detail || body?.message || `Error ${res.status}`;
      console.error("Request email change failed", res.status, body);
      setEmailMessage(String(msg));
    } catch (err: any) {
      console.error(err);
      setEmailMessage(err?.message ?? "Error de red");
    } finally {
      setIsEmailSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword)
      return setPasswordMessage("Complete todos los campos");
    if (newPassword !== confirmPassword)
      return setPasswordMessage("La nueva contraseña no coincide");
    setIsPasswordSaving(true);
    setPasswordMessage(null);
    try {
      const res = await api
        .post({ currentPassword, newPassword }, "/profile/change-password")
        .res();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMessage("Contraseña actualizada");
        return;
      }
      const body = await res.json().catch(() => null);
      const msg = body?.detail || body?.message || `Error ${res.status}`;
      console.error("Change password failed", res.status, body);
      setPasswordMessage(String(msg));
    } catch (err: any) {
      console.error(err);
      setPasswordMessage(err?.message ?? "Error de red");
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Mi perfil</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main profile info (takes 2 cols on lg) */}
          <section className="lg:col-span-2 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Información personal</h2>
            <Form onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={firstName}
                  onValueChange={setFirstName}
                />
                <Input
                  label="Apellido"
                  value={lastName}
                  onValueChange={setLastName}
                />
                <Input
                  label="Teléfono"
                  value={phone}
                  onValueChange={setPhone}
                />
                <Input
                  label="Dirección"
                  value={address}
                  onValueChange={setAddress}
                />
                <Input label="Ciudad" value={city} onValueChange={setCity} />
                <Input
                  label="Provincia"
                  value={province}
                  onValueChange={setProvince}
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button type="submit" color="primary">
                  Guardar cambios
                </Button>
                <span className="text-sm text-gray-600">
                  Los cambios se guardan en su cuenta.
                </span>
              </div>
            </Form>

            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-3">CUIL</h3>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Cuil
                    id="cuil-input"
                    label="CUIL"
                    value={cuil ?? cuilInput}
                    onValueChange={cuil ? () => {} : setCuilInput}
                    placeholder="XX-XXXXXXXX-X"
                    description={cuil ? "CUIL establecido. Contactá a soporte para cambios." : "El CUIL se puede establecer solo una vez."}
                    disabled={!!cuil}
                  />
                  {!cuil ? (
                    <div className="mt-3">
                      <Button
                        onPress={async () => {
                          const val = cuilInput?.trim();
                          if (!val) return toast.warn({ title: "Ingrese un CUIL" });
                          try {
                            const res = await api.post({ cuil: val }, "/profile/set-cuil").res();
                            if (res.ok) {
                              setCuil(val);
                              setCuilInput("");
                              await checkSession();
                              toast.success({ title: "CUIL establecido" });
                            } else {
                              const body = await res.json().catch(() => null);
                              const msg = body?.detail || body?.message || `Error ${res.status}`;
                              throw new Error(String(msg));
                            }
                          } catch (err) {
                            console.error(err);
                            toast.error({
                              title: "Error",
                              message: "No se pudo establecer el CUIL",
                            });
                          }
                        }}
                        color="primary"
                        disabled={!cuilInput}
                      >
                        Establecer
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {/* Right: Email and Password cards */}
          <aside className="space-y-6">
            <Form className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Correo electrónico</h3>
              <div className="text-sm text-gray-700 mb-3">
                Correo actual: <strong>{email}</strong>
              </div>
              <Input
                label="Nuevo correo"
                value={newEmail}
                onValueChange={setNewEmail}
                autoComplete="email"
              />
              <Input
                type="password"
                label="Contraseña actual"
                value={emailCurrentPassword}
                onValueChange={setEmailCurrentPassword}
                className="mt-2"
                autoComplete="current-password"
              />
              <div className="flex items-center gap-3 mt-3">
                <Button
                  onPress={() => handleChangeEmail()}
                  color="primary"
                  disabled={isEmailSaving}
                >
                  {isEmailSaving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
              {emailMessage && (
                <div className="text-sm mt-2 text-gray-700">{emailMessage}</div>
              )}
            </Form>

            <Form className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Cambiar contraseña</h3>
              <Input
                type="password"
                label="Contraseña actual"
                value={currentPassword}
                onValueChange={setCurrentPassword}
              />
              <Input
                type="password"
                label="Nueva contraseña"
                value={newPassword}
                onValueChange={setNewPassword}
                className="mt-2"
                autoComplete="new-password"
              />
              <Input
                type="password"
                label="Confirmar nueva contraseña"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                className="mt-2"
                autoComplete="new-password"
              />
              <div className="flex items-center gap-3 mt-3">
                <Button
                  onPress={() => handleChangePassword()}
                  color="primary"
                  disabled={isPasswordSaving}
                >
                  {isPasswordSaving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
              {passwordMessage && (
                <div className="text-sm mt-2 text-gray-700">
                  {passwordMessage}
                </div>
              )}
            </Form>
          </aside>
        </div>
      </div>
    </main>
  );
}
