import { Button } from "@heroui/button";
import { useNavigate } from "react-router";
import { Tooltip } from "@heroui/react";

import EditIcon from "app/assets/pencil.svg?react";
import DeleteIcon from "app/assets/trash.svg?react";

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
      <Tooltip color="default" content="Editar">
        <Button
          isIconOnly
          aria-label="Editar"
          title="Editar"
          onPress={handleEdit}
          color="default"
          className="inline-flex items-center justify-center w-8 h-8"
          radius="full"
        >
          <EditIcon className="h-full p-2" />
        </Button>
      </Tooltip>

      <Tooltip color="danger" content="Eliminar">
        <Button
          isIconOnly
          onPress={onDelete}
          color="danger"
          className="inline-flex items-center justify-center w-8 h-8"
          radius="full"
        >
          <DeleteIcon className="h-full p-2 fill-white" />
        </Button>
      </Tooltip>
    </div>
  );
}
