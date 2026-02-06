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
  const [internal, setInternal] = React.useState<string>(value ?? "");

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
    const cursorPos = input ? input.selectionStart ?? 0 : null;

    if (cursorPos != null) {
      cursorDigitsRef.current = val
        .slice(0, cursorPos)
        .replace(/\D/g, "").length;
    } else {
      cursorDigitsRef.current = null;
    }

    const formatted = formatCuil(val);
    setInternal(formatted);
    // notify parent only if different from external value
    try {
      if (setValue && formatted !== (value ?? "")) setValue(formatted);
    } catch (e) {
      // ignore
    }
  };

  // Restaurar cursor después del render
  // Keep internal in sync when parent value changes
  useEffect(() => {
    setInternal(value ?? "");
  }, [value]);

  useEffect(() => {
    if (!ref.current || cursorDigitsRef.current == null) return;

    const digitsToFind = cursorDigitsRef.current;
    let pos = 0;
    let digitsSeen = 0;

    while (pos < internal.length && digitsSeen < digitsToFind) {
      if (/\d/.test(internal[pos])) digitsSeen++;
      pos++;
    }

    try {
      ref.current.setSelectionRange(pos, pos);
    } catch (e) {
      // ignore if setting selection fails
    }
    cursorDigitsRef.current = null;
  }, [internal]);

  return (
    <Input
      {...props}
      isDisabled={props.isDisabled}
      ref={(el: HTMLInputElement | null) => {
        ref.current = el;
        if (!inputRef) return;
        if (typeof inputRef === "function") inputRef(el);
        else if (typeof inputRef === "object") (inputRef as any).current = el;
      }}
      value={internal}
      onValueChange={onValueChange}
      inputMode="numeric"
    />
  );
}
