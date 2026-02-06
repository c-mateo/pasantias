import { useRef, useEffect, type ReactNode } from "react";
import { Button } from "@heroui/button";
import {
  Modal as HeroModal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

type ModalProps = {
  isOpen: boolean;
  title?: ReactNode;
  body?: ReactNode | ReactNode[];
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Componente modal reutilizable.
 * Muestra `title` y `body`, y expone `onConfirm` / `onCancel`.
 */
export function Modal({
  isOpen,
  title,
  body,
  onConfirm,
  onCancel,
}: ModalProps) {
  const onOpenChange = (open: boolean) => {
    if (!open) onCancel();
  };

  return (
    <HeroModal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>{body}</ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  onCancel();
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
