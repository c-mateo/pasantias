
import { Field } from "./Field";
import { Form } from "@heroui/react";
import { Button } from "@heroui/button";
import type { CompanyDTO } from "~/api/types";
import { api } from "~/api/api";
import { Modal } from "./Modal";

interface CargarEmpresaProps {
  value?: CompanyDTO;
}

type NullToOptional<T> = {
  // Campos que NO incluyen null → se quedan obligatorios
  [K in keyof T as null extends T[K] ? never : K]: T[K];
} & {
  // Campos que incluyen null → se vuelven opcionales y sin null
  [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
};

export function omitNull<T>(obj: T): NullToOptional<T> {
  const result : any = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result as NullToOptional<T>;
}

export function CargarEmpresa({ value }: CargarEmpresaProps) {
  const { id, name, email, phone, website, description, logo } = omitNull(value) || {};

  const submitText = value ? "Guardar cambios" : "Crear";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    // console.log("Datos enviados:", data);
    if (id) {
      // Actualizar empresa existente
      await api.patch(data, `/admin/companies/${id}`).json();
    }
    else {
      // Crear nueva empresa
      await api.post(data, `/admin/companies`).json();
    }
  };

  const canSubmit = [ name, email, phone, website, description ].every(value => value);
  const buttonClasses = canSubmit ? "submit-button" : "submit-button disabled";

  return (
    <>
      <Form onSubmit={handleSubmit} className="w-full">
        <Field label="Nombre" type="text" name="name" initialValue={name} required />
        <Field label="Email" type="email" name="email" initialValue={email} required />
        <Field label="Teléfono" type="tel" name="phone" initialValue={phone} required />
        <Field label="Sitio Web" type="url" name="website" initialValue={website} required />
        <Field label="Descripción" type="text" name="description" initialValue={description} required />
        <Field label="Logo URL" type="url" name="logo" initialValue={logo} />
        <Button type="submit">{submitText}</Button>
      </Form>
      <Modal title="Confirmar acción" body="¿Estás seguro de que deseas continuar?" onConfirm={() => {}} onCancel={() => {}} />
    </>
  );
}

interface EmpresaProps {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  logo?: string;
}
function Empresa({ name, email, phone, address, website, description, logo }: EmpresaProps) {
  return (
    <div className="empresa">
      <h2>{name}</h2>
      <p>Email: {email}</p>
      <p>Teléfono: {phone}</p>
      <p>Dirección: {address}</p>
      <p>Sitio Web: <a href={website} target="_blank" rel="noopener noreferrer">{website}</a></p>
      <p>Descripción: {description}</p>
      {logo && <img src={logo} alt={`${name} logo`} />}
    </div>
  );
}
