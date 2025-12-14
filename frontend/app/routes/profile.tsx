import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Form, Input } from "@heroui/react";
import { api } from "~/api/api";
import { requireUser, checkSession } from "~/util/AuthContext";
import { redirect } from "react-router";

export async function clientLoader() {
  const user = await requireUser();
  if (!user) throw redirect("/login");
}

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

  // For email/password UI (backend not implemented yet)
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      const payload: any = { firstName, lastName, phone, address, city, province };
      // If CUIL is being set for the first time, include it
      if (cuil === null && cuilInput) payload.cuil = cuilInput;

      await api.patch(payload, "/profile").json();
      await checkSession();
      alert("Perfil actualizado");
      // If we set cuil, reflect it locally
      if (payload.cuil) {
        setCuil(payload.cuil);
        setCuilInput("");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el perfil (intente nuevamente más tarde)");
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) return alert("Ingrese un correo");
    try {
      // Try calling backend endpoint (may not exist yet)
      const res = await api.patch({ email: newEmail }, "/profile/email").res();
      if (res.ok) {
        // Successful server update
        setEmail(newEmail);
        setNewEmail("");
        await checkSession();
        return alert("Correo actualizado");
      }
      // If not implemented, fallback to simulation
      if (res.status === 404 || res.status === 405) {
        localStorage.setItem("profile:email", newEmail);
        setEmail(newEmail);
        setNewEmail("");
        return alert("Correo actualizado localmente (endpoint no implementado aún)");
      }
      const body = await res.text().catch(() => "");
      console.error("Change email failed", res.status, body);
      alert("No se pudo cambiar el correo: " + res.status);
    } catch (err) {
      console.error(err);
      // Network error or endpoint missing -> simulate
      localStorage.setItem("profile:email", newEmail);
      setEmail(newEmail);
      setNewEmail("");
      alert("Correo actualizado localmente (demo)");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return alert("Complete todos los campos");
    if (newPassword !== confirmPassword) return alert("La nueva contraseña no coincide");
    try {
      // Try real endpoint (not implemented yet)
      const res = await api.post({ currentPassword, newPassword }, "/profile/change-password").res();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        return alert("Contraseña actualizada");
      }
      if (res.status === 404 || res.status === 405) {
        // Simulate locally
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        return alert("Contraseña cambiada localmente (endpoint no implementado aún)");
      }
      const body = await res.text().catch(() => "");
      console.error("Change password failed", res.status, body);
      alert("No se pudo cambiar la contraseña: " + res.status);
    } catch (err) {
      console.error(err);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Contraseña cambiada localmente (demo)");
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
                <Input label="Nombre" value={firstName} onValueChange={setFirstName} />
                <Input label="Apellido" value={lastName} onValueChange={setLastName} />
                <Input label="Teléfono" value={phone} onValueChange={setPhone} />
                <Input label="Dirección" value={address} onValueChange={setAddress} />
                <Input label="Ciudad" value={city} onValueChange={setCity} />
                <Input label="Provincia" value={province} onValueChange={setProvince} />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button type="submit" color="primary">Guardar cambios</Button>
                <span className="text-sm text-gray-600">Los cambios se guardan en su cuenta.</span>
              </div>
            </Form>

            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-3">CUIL</h3>
              {cuil ? (
                <div className="text-sm text-gray-700">{cuil} <span className="ml-2 text-xs text-gray-500">(No editable)</span></div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Input id="cuil-input" label="Establecer CUIL" value={cuilInput} onValueChange={setCuilInput} placeholder="XX-XXXXXXXX-X" />
                    <div className="text-sm text-gray-500 mt-2">El CUIL se puede establecer solo una vez.</div>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={async () => {
                        const val = cuilInput?.trim();
                        if (!val) return alert("Ingrese un CUIL");
                        try {
                          await api.patch({ cuil: val }, "/profile").json();
                          setCuil(val);
                          setCuilInput("");
                          await checkSession();
                          alert("CUIL establecido");
                        } catch (err) {
                          console.error(err);
                          alert("No se pudo establecer el CUIL");
                        }
                      }}
                      color="primary"
                      disabled={!cuilInput}
                    >
                      Establecer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right: Email and Password cards */}
          <aside className="space-y-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Correo electrónico</h3>
              <div className="text-sm text-gray-700 mb-3">Correo actual: <strong>{email}</strong></div>
              <Input label="Nuevo correo" value={newEmail} onValueChange={setNewEmail} />
              <div className="flex items-center gap-3 mt-3">
                <Button onClick={() => handleChangeEmail()}>
                  Guardar
                </Button>
                <Button color="secondary" onClick={() => {
                  // fallback simulate UI
                  handleChangeEmail();
                }}>Simular</Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">El cambio real de correo requiere el endpoint correspondiente.</div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Cambiar contraseña</h3>
              <Input type="password" label="Contraseña actual" value={currentPassword} onValueChange={setCurrentPassword} />
              <Input type="password" label="Nueva contraseña" value={newPassword} onValueChange={setNewPassword} className="mt-2" />
              <Input type="password" label="Confirmar nueva contraseña" value={confirmPassword} onValueChange={setConfirmPassword} className="mt-2" />
              <div className="flex items-center gap-3 mt-3">
                <Button onClick={() => handleChangePassword()}>
                  Guardar
                </Button>
                <Button color="secondary" onClick={() => handleChangePassword()}>Simular</Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">La contraseña se gestiona desde el backend; esto es una interfaz de prueba.</div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
