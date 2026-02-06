import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "~/api/api";
import toast from "~/util/toast";

export default function VerifyEmail() {
  const token = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get("token");
  const navigate = useNavigate();

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError("Falta el token de verificación.");
        setLoading(false);
        return;
      }

      try {
        await api.post({ token }, "/profile/verify").json();
        toast.success({ title: "Correo verificado", message: "Tu correo fue verificado correctamente." });
        setMessage("Correo verificado. Serás redirigido a la página principal...");
        // Redirect to homepage after short delay so user sees toast
        setTimeout(() => navigate("/"), 1200);
      } catch (err: any) {
        console.error(err);
        const msg = err?.response?.message || "No se pudo verificar el correo";
        toast.error({ title: "Error", message: msg });
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen py-20">
      <main className="max-w-md mx-auto bg-white p-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-shadow duration-150 hover:shadow-md">
        <h2 className="text-2xl font-bold mb-4">Verificando correo</h2>
        {loading && <p>Verificando...</p>}
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </main>
    </div>
  );
}
