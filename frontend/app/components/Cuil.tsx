import React, { useRef, useEffect } from "react";
import { Input, type InputProps } from "@heroui/react";

export type CuilProps = Omit<InputProps, "value" | "onValueChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
};

export default function Cuil({ value, onValueChange: setValue, inputRef, ...props }: CuilProps) {
  const ref = useRef<HTMLInputElement>(null);
  const cursorDigitsRef = useRef<number | null>(null);

  const formatCuil = (val: string) => {
    let digits = val.replace(/\D/g, "");
    if (digits.length > 11) digits = digits.slice(0, 11);

    let formatted = "";
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length >= 3) formatted += "-" + digits.slice(2, 10);
    if (digits.length === 11) formatted += "-" + digits.slice(10, 11);

    return formatted;
  };

  const onValueChange = (val: string) => {
    const input = ref.current;
    if (!input) return;

    const cursorPos = input.selectionStart ?? 0;

    // Cuántos dígitos hay antes del cursor
    cursorDigitsRef.current = val
      .slice(0, cursorPos)
      .replace(/\D/g, "").length;

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
      ref={(el: HTMLInputElement | null) => {
        ref.current = el;
        if (!inputRef) return;
        if (typeof inputRef === "function") inputRef(el);
        else if (typeof inputRef === "object") (inputRef as any).current = el;
      }}
      value={value}
      onValueChange={onValueChange}
      inputMode="numeric"
    />
  );
}
