import { useState } from "react";

interface FieldProps {
  label: string;
  name: string;
  initialValue?: string;
  type?: string;
  required?: boolean;
}
export function Field({ label, name, initialValue, type = "text", required = false }: FieldProps) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const classes = initialValue && value !== initialValue ? "field changed" : "field";

  const rest = {
    onChange: initialValue ? handleChange : undefined,
    value: initialValue,
    required
  };

  return (
    <div className={classes}>
      <label htmlFor={name}>{label}</label>
      <input type={type} name={name} id={name} {...rest} />
    </div>
  );
}
