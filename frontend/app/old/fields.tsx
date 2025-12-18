
// function TextField(data: { initialValue: string, inlineEdit: boolean, onSave?: (newValue: string) => void }) {

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";

interface FieldAdapterChange extends React.SyntheticEvent {
  target: EventTarget & {
    value: string;
  };
}

interface FieldAdapterProps<T, E extends HTMLElement> {
  className?: string;
  value: T;
  readOnly?: boolean;
  onKeyUp?: (e: React.KeyboardEvent<E>) => void;
  onKeyDown?: (e: React.KeyboardEvent<E>) => void;
  onBlur?: (e: React.FocusEvent<E>) => void;
  onChange?: (e: FieldAdapterChange) => void;
  onDoubleClick?: () => void;
  ref?: React.Ref<E>;
}

function TextAreaAdapter(
  props: FieldAdapterProps<string, HTMLTextAreaElement>
) {
  return <textarea {...props} />;
}

type InputAdapterProps = FieldAdapterProps<string, HTMLInputElement> & {
  type: HTMLInputTypeAttribute;
};

function InputAdapter({ type, ...props }: InputAdapterProps) {
  return <input type={type} {...props} />;
}

type FieldProps<T> = {
  initialValue: T;
  inlineEdit?: boolean;
  multiline?: boolean;
  type?: HTMLInputTypeAttribute;
  onSave?: (newValue: T) => void;
};

function Field<T>({
  initialValue,
  type = "text",
  inlineEdit = false,
  multiline = false,
  onSave,
}: FieldProps<T>) {
  const Element = (props) => {
    return multiline ? <textarea {...props} /> : <input {...props} />;
  };

  if (!inlineEdit) {
    return (
      <td className="px-4 py-2 text-sm text-gray-600">
        <Element
          className="p-1 w-full field-sizing-content resize-none border-transparent outline-none"
          value={initialValue as any}
          readOnly
        />
      </td>
    );
  }

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<T>(initialValue);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  const confirm = () => {
    if (onSave) onSave(inputRef.current?.value as any);
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
    setValue(initialValue);
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      confirm();
    }
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      cancel();
    }
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const onBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.relatedTarget === confirmRef.current) {
      confirm();
    } else {
      cancel();
    }
  };

  const onChange = (e: FieldAdapterChange) => {
    setValue(e.target.value as any);
  };

  const onDoubleClick = () => {
    setEditing(true);
  }
  return (
    <td className="px-4 py-1 text-sm text-gray-600 relative">
      <Element
        className={`p-1 w-full field-sizing-content resize-none ${styles}`}
        value={value as any}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onChange={onChange}
        ref={inputRef}
        readOnly={!editing}
        onDoubleClick={onDoubleClick}
      />
      <div
        className={`absolute top-1 -right-2 text-xs text-gray-400 select-none flex flex-col gap-1 ${optionStyles}`}
      >
        <Button
          className="size-5 border-1 border-gray-400 flex justify-center items-center hover:cursor-pointer"
          onPress={cancel}
          color="default"
          size="sm"
          radius="full"
        >
          ✖
        </Button>
        <Button
          className="size-5 border-1 border-gray-400 flex justify-center items-center hover:cursor-pointer"
          onPress={confirm}
          color="primary"
          size="sm"
          radius="full"
          ref={confirmRef as any}
        >
          ✔
        </Button>
      </div>
    </td>
  );
}