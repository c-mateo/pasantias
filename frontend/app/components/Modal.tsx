import { useRef, useEffect, type ReactNode } from "react";
import { Button } from "@heroui/button";
import {
  Modal as HeroModal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

// const ask = (message: string, options: string[] = [], onConfirm?: () => void) => {
//     const confirmation = window.confirm(message);
//     if (confirmation && onConfirm) {
//         onConfirm();
//     }
// };

type ModalProps = {
  isOpen: boolean;
  title?: ReactNode;
  body?: ReactNode | ReactNode[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function Modal({
  isOpen,
  title,
  body,
  onConfirm,
  onCancel,
}: ModalProps) {
  const onOpenChange = (open: boolean) => {
    if (!open) {
      onCancel();
    }
  };

  return (
    <HeroModal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            {title && (
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            )}
            <ModalBody>{body}</ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  onCancel()
                  onClose();
                }}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Confirmar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </HeroModal>
  );
}

// export function Modal({
//   isOpen, message, onConfirm, onCancel,
// }: {
//   isOpen: boolean;
//   message: React.ReactNode;
//   onConfirm: () => void;
//   onCancel: () => void;
// }) {
//   if (!isOpen) return null;

//   const ref = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (isOpen) {
//       ref.current?.focus();
//     }
//   }, [isOpen]);

//   const onClickOutside = (e: React.MouseEvent) => {
//     if (ref.current === e.target) {
//       onCancel();
//     }
//   };

//   const onKeyUp = (e: React.KeyboardEvent) => {
//     if (e.key === "Escape") {
//       onCancel();
//     }
//   };

//   return (
//     <div
//       ref={ref}
//       onClick={onClickOutside}
//       className="fixed z-10 inset-0 bg-black/25 backdrop-blur-xs flex items-center justify-center"
//       onKeyUp={onKeyUp}
//       tabIndex={-1}
//     >
//       <div className="max-w-xl bg-white p-6 rounded shadow-md">
//         <p className="mb-4">{message}</p>
//         <div className="flex justify-end space-x-4">
//           <Button onPress={onCancel} color="default" className="px-4 py-2" radius="md">Cancelar</Button>
//           <Button onPress={onConfirm} color="primary" className="px-4 py-2" radius="md">Confirmar</Button>
//         </div>
//       </div>
//     </div>
//   );
// }
