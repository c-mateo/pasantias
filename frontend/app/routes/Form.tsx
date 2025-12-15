import { Field } from "../components/Field";
import { Button } from "@heroui/button";
import { Form as HForm } from "@heroui/react";

import React from "react";

type FieldDefinition = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
};

type FormProps<T> = {
  value?: T;
  fields: FieldDefinition[];
  onSubmit: (data: T) => Promise<void>;
};

export function Form<T>({ fields, value, onSubmit }: FormProps<T>) {
  const submitText = value ? "Guardar cambios" : "Crear";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const entries = Object.fromEntries(formData.entries());

    // Conversión de tipos simple (puedes extender esto si necesitas casting)
    // const data = Object.fromEntries(
    //   fields.map((field) => [field.name, entries[field.name]])
    // ) as T;

    await onSubmit(entries as T);
  };

  return (
    <HForm onSubmit={handleSubmit} validationErrors={{}}>
      {fields.map((field) => (
        <Field
          key={field.name}
          label={field.label}
          type={field.type}
          name={field.name}
          initialValue={value?.[field.name as keyof T] as string}
          required={field.required}
        />
      ))}
      <Button type="submit">{submitText}</Button>
    </HForm>
  );
}

