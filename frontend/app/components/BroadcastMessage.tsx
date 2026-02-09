import React, { useState } from "react";
import { Button, Input, Textarea } from "@heroui/react";
import { api } from "~/api/api";
import { toast } from "~/util/toast";

export default function BroadcastMessage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return toast.warn({ title: "Mensaje vacío" });
    setSending(true);
    try {
      const res = await api
        .post(
          { title, message },
          "/admin/notifications/broadcast",
        )
        .res();
      if (!res.ok) throw new Error(`Error ${res.status}`);
      toast.success({ title: "Broadcast enviado" });
      setTitle("");
      setMessage("");
    } catch (err) {
      console.error(err);
      const message =
        (err as any)?.response?.message ||
        (err as any)?.message ||
        "Error al enviar broadcast";
      toast.error({ title: "Error al enviar broadcast", message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <h3 className="text-sm font-medium mb-2">
        Enviar notificación (Broadcast)
      </h3>
      <div className="space-y-2">
        <Input
          label="Título (opcional)"
          value={title}
          onValueChange={setTitle}
          labelPlacement="outside"
          placeholder="Título"
        />
        <Textarea
          label="Mensaje"
          value={message}
          onValueChange={setMessage}
          placeholder="Texto de la notificación"
          labelPlacement="outside"
        />
        <div className="flex justify-end">
          <Button isDisabled={sending} onPress={send} appearance="primary">
            {sending ? "Enviando..." : "Enviar a todos"}
          </Button>
        </div>
      </div>
    </div>
  );
}
