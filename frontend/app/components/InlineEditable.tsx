import React, { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";

type EditorProps<T> = {
  value: T;
  onValueChange: (v: T) => void;
  inputRef?: React.Ref<any>;
  className?: string;
  isInvalid?: boolean;
  errorMessage?: React.ReactNode;
};

type Props<T> = {
  value: T;
  Editor: React.ComponentType<EditorProps<T>>;
  renderView?: (v: T) => React.ReactNode;
  onRequestSave: (v: T) => void; // called when user requests to save (Enter or icon)
  saveDisabled?: boolean;
  /** Validate value; return error message or null if valid */
  validate?: (v: T) => string | null;
};

export default function InlineEditable<T>({
  value,
  Editor,
  renderView,
  onRequestSave,
  saveDisabled,
  validate,
}: Props<T>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<T>(value);
  const inputRef = useRef<any>(null);

  // keep draft in sync when value changes externally
  useEffect(() => {
    setDraft(value);
    // if editing and parent updated to the same value, exit editing
    if (editing && value === draft) {
      setEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const validationError = validate ? validate(draft) : null;

  useEffect(() => {
    if (editing) {
      // focus input when editing opens
      setTimeout(() => {
        try {
          if (inputRef.current?.focus) inputRef.current.focus();
        } catch (e) {}
      }, 0);
    }
  }, [editing]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!saveDisabled) onRequestSave(draft);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setDraft(value);
      setEditing(false);
    }
  };

  return (
    <div className="flex gap-2">
      {editing ? (
        <div className="flex items-start gap-2 w-full" onKeyDown={onKeyDown}>
          <div className="flex-1 min-w-0">
            <div className="w-full">
              <Editor
                value={draft}
                onValueChange={setDraft}
                inputRef={inputRef}
                isInvalid={!!validationError}
                errorMessage={validationError}
              />
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2 ml-2 relative top-1">
            <Button
              isIconOnly
              aria-label="Cancelar edición"
              title="Cancelar"
              color="default"
              variant="light"
              size="sm"
              onPress={() => {
                setDraft(value);
                setEditing(false);
              }}
              className="inline-flex items-center justify-center w-8 h-8"
              radius="full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>

            <div className="flex flex-col items-end">
              <Button
                isIconOnly
                aria-label="Guardar"
                title="Guardar"
                color="primary"
                variant="light"
                size="sm"
                onPress={() => {
                  if (validationError) return;
                  if (!saveDisabled) onRequestSave(draft);
                }}
                disabled={saveDisabled || !!validationError}
                className="inline-flex items-center justify-center w-8 h-8"
                radius="full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {renderView ? renderView(value) : <span>{String(value)}</span>}
          <Button
            isIconOnly
            aria-label="Editar"
            color="default"
            variant="light"
            size="sm"
            onPress={() => setEditing(true)}
            className="inline-flex items-center justify-center w-8 h-8"
            radius="full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.313l-4 1 1-4L16.862 3.487z"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
