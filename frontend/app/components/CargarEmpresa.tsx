import { type Company, companies } from "api/api";
import { Field } from "./Field";
import { Form } from "@heroui/react";

interface CargarEmpresaProps {
  value?: Company;
}
export function CargarEmpresa({ value }: CargarEmpresaProps) {
  const { id, name, email, phone, address, website, description, logo } = value || {};

  const submitText = value ? "Guardar cambios" : "Crear";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    // console.log("Datos enviados:", data);
    if (id) {
      // Actualizar empresa existente
      await companies.update(id, data);
    }
    else {
      // Crear nueva empresa
      await companies.create(data);
    }
  };

  const canSubmit = [ name, email, phone, address, website, description ].every(value => value);
  const buttonClasses = canSubmit ? "submit-button" : "submit-button disabled";
  return (
    <Form onSubmit={handleSubmit} className="w-full">
      <Field label="Nombre" type="text" name="name" initialValue={name} required />
      <Field label="Email" type="email" name="email" initialValue={email} required />
      <Field label="Teléfono" type="tel" name="phone" initialValue={phone} required />
      <Field label="Dirección" type="text" name="address" initialValue={address} required />
      <Field label="Sitio Web" type="url" name="website" initialValue={website} required />
      <Field label="Descripción" type="text" name="description" initialValue={description} required />
      <Field label="Logo URL" type="url" name="logo" initialValue={logo} />
      <button type="submit">{submitText}</button>
    </Form>
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
