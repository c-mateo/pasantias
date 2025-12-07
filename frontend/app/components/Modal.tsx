import { useRef, useEffect } from "react";

// const ask = (message: string, options: string[] = [], onConfirm?: () => void) => {
//     const confirmation = window.confirm(message);
//     if (confirmation && onConfirm) {
//         onConfirm();
//     }
// };

export function Modal({
  isOpen, message, onConfirm, onCancel,
}: {
  isOpen: boolean;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.focus();
    }
  }, [isOpen]);

  const onClickOutside = (e: React.MouseEvent) => {
    if (ref.current === e.target) {
      onCancel();
    }
  };

  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      ref={ref}
      onClick={onClickOutside}
      className="fixed z-10 inset-0 bg-black/25 backdrop-blur-xs flex items-center justify-center"
      onKeyUp={onKeyUp}
      tabIndex={-1}
    >
      <div className="max-w-xl bg-white p-6 rounded shadow-md">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
