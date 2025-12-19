import React from "react";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router";

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  editHref?: string;
};

export default function ActionButtons({ onEdit, onDelete, editHref }: Props) {
  const navigate = useNavigate();

  const handleEdit = () => {
    if (editHref) {
      // use react-router navigation to avoid full page reloads
      navigate(editHref);
    } else if (onEdit) onEdit();
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        isIconOnly
        aria-label="Editar"
        title="Editar"
        onPress={handleEdit}
        color="default"
        className="inline-flex items-center justify-center w-8 h-8"
        radius="full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.313l-4 1 1-4L16.862 3.487z" />
        </svg>
      </Button>

      <Button
        isIconOnly
        aria-label="Eliminar"
        title="Eliminar"
        onPress={onDelete}
        color="danger"
        className="inline-flex items-center justify-center w-8 h-8"
        radius="full"
      >
        {/* prettier-ignore */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 9v6" />
        </svg>
      </Button>
    </div>
  );
}
