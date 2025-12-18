import React, { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Form, Input, type InputProps } from "@heroui/react";
import { api } from "~/api/api";
import toast from "~/util/toast";
import { requireUser, checkSession } from "~/util/AuthContext";
import { redirect } from "react-router";

export async function clientLoader() {
  const user = await requireUser();
  if (!user) throw redirect("/login");
}

type CuilProps = Omit<InputProps, 'value' | 'onValueChange'> & {
  value: string;
  onValueChange: (value: string) => void;
};

function Cuil({value, onValueChange: setValue, ...props}: CuilProps) {
  const ref = useRef<HTMLInputElement>(null);
  const cursorDigitsRef = useRef<number | null>(null);

  const formatCuil = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 11) digits = digits.slice(0, 11);

    let formatted = '';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length >= 3) formatted += '-' + digits.slice(2, 10);
    if (digits.length === 11) formatted += '-' + digits.slice(10, 11);

    return formatted;
  };

  const onValueChange = (val: string) => {
    const input = ref.current;
    if (!input) return;

    const cursorPos = input.selectionStart ?? 0;

    // Cuántos dígitos hay antes del cursor
    cursorDigitsRef.current = val
      .slice(0, cursorPos)
      .replace(/\D/g, '').length;

    // Formatear
    setValue(formatCuil(val));
  };

  // Restaurar cursor después del render
  useEffect(() => {
    if (!ref.current || cursorDigitsRef.current == null) return;

    const digitsToFind = cursorDigitsRef.current;
    let pos = 0;
    let digitsSeen = 0;

    while (pos < value.length && digitsSeen < digitsToFind) {
      if (/\d/.test(value[pos])) digitsSeen++;
      pos++;
    }

    ref.current.setSelectionRange(pos, pos);
    cursorDigitsRef.current = null;
  }, [value]);

  return (
    <Input
      {...props}
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      inputMode="numeric"
    />
  );
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

  // Email/password UI
  const [newEmail, setNewEmail] = useState("");
  const [isEmailSaving, setIsEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

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
      toast.success({ title: "Perfil actualizado" });
      // If we set cuil, reflect it locally
      if (payload.cuil) {
        setCuil(payload.cuil);
        setCuilInput("");
      }
    } catch (err) {
      console.error(err);
      toast.error({ title: "Error", message: "No se pudo guardar el perfil (intente nuevamente más tarde)" });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) return setEmailMessage("Ingrese un correo");
    setIsEmailSaving(true);
    setEmailMessage(null);
    try {
      const res = await api.patch({ email: newEmail }, "/profile/email").res();
      if (res.ok) {
        setEmail(newEmail);
        setNewEmail("");
        await checkSession();
        setEmailMessage("Correo actualizado");
        return;
      }
      const body = await res.json().catch(() => null);
      const msg = body?.detail || body?.message || `Error ${res.status}`;
      console.error("Change email failed", res.status, body);
      setEmailMessage(String(msg));
    } catch (err: any) {
      console.error(err);
      setEmailMessage(err?.message ?? "Error de red");
    } finally {
      setIsEmailSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return setPasswordMessage("Complete todos los campos");
    if (newPassword !== confirmPassword) return setPasswordMessage("La nueva contraseña no coincide");
    setIsPasswordSaving(true);
    setPasswordMessage(null);
    try {
      const res = await api.post({ currentPassword, newPassword }, "/profile/change-password").res();
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
                    <Cuil
                      id="cuil-input"
                      label="Establecer CUIL"
                      value={cuilInput}
                      onValueChange={setCuilInput}
                      placeholder="XX-XXXXXXXX-X"
                      description="El CUIL se puede establecer solo una vez."
                    />
                    <div className="mt-3">
                      <Button
                        onPress={async () => {
                          const val = cuilInput?.trim();
                          if (!val) return toast.warn({ title: "Ingrese un CUIL" });
                          try {
                            await api.patch({ cuil: val }, "/profile").json();
                            setCuil(val);
                            setCuilInput("");
                            await checkSession();
                            toast.success({ title: "CUIL establecido" });
                          } catch (err) {
                            console.error(err);
                            toast.error({ title: "Error", message: "No se pudo establecer el CUIL" });
                          }
                        }}
                        color="primary"
                        disabled={!cuilInput}
                      >
                        Establecer
                      </Button>
                    </div>
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
                    <Button onPress={() => handleChangeEmail()} color="primary" disabled={isEmailSaving}>{isEmailSaving ? 'Guardando...' : 'Guardar'}</Button>
              </div>
              {emailMessage && <div className="text-sm mt-2 text-gray-700">{emailMessage}</div>}
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Cambiar contraseña</h3>
              <Input type="password" label="Contraseña actual" value={currentPassword} onValueChange={setCurrentPassword} />
              <Input
                type="password"
                label="Nueva contraseña"
                value={newPassword}
                onValueChange={setNewPassword}
                className="mt-2"
                description="La contraseña se gestiona desde el backend."
              />
              <Input type="password" label="Confirmar nueva contraseña" value={confirmPassword} onValueChange={setConfirmPassword} className="mt-2" />
              <div className="flex items-center gap-3 mt-3">
                <Button onPress={() => handleChangePassword()} color="primary" disabled={isPasswordSaving}>{isPasswordSaving ? 'Guardando...' : 'Guardar'}</Button>
              </div>
              {passwordMessage && <div className="text-sm mt-2 text-gray-700">{passwordMessage}</div>}

            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
