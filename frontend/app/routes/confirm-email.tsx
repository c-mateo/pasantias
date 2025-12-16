import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "~/api/api";
import toast from "~/util/toast";

export default function ConfirmEmail() {
  const token = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get("token");
  const navigate = useNavigate();

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirm = async () => {
      if (!token) {
        setError("Falta el token de confirmación.");
        setLoading(false);
        return;
      }

      try {
        await api.post({ token }, "/profile/email/confirm").json();
        toast.success({ title: "Correo actualizado", message: "Tu correo fue actualizado correctamente." });
        // Redirect to profile (auth-required page will forward to login if not authenticated)
        navigate("/profile");
      } catch (err: any) {
        console.error(err);
        const msg = err?.response?.message || "No se pudo confirmar el cambio de correo";
        toast.error({ title: "Error", message: msg });
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, [token, navigate]);

  return (
    <div className="min-h-screen py-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-shadow duration-150 hover:shadow-md">
        <h2 className="text-2xl font-bold mb-4">Confirmando correo</h2>
        {loading && <p>Verificando...</p>}
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </main>
    </div>
  );
}
