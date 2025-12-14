import React from "react";
import { Button } from "@heroui/button";

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  editHref?: string;
};

export default function ActionButtons({ onEdit, onDelete, editHref }: Props) {
  const handleEdit = () => {
    if (editHref) {
      window.location.href = editHref;
    } else if (onEdit) onEdit();
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        isIconOnly
        aria-label="Editar"
        onPress={handleEdit}
        color="default"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.313l-4 1 1-4L16.862 3.487z" />
        </svg>
      </Button>

      <Button
        isIconOnly
        aria-label="Eliminar"
        onPress={onDelete}
        color="danger"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      </Button>
    </div>
  );
}
