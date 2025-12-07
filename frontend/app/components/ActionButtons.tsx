import React from "react";

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  editHref?: string;
};

export default function ActionButtons({ onEdit, onDelete, editHref }: Props) {
  return (
    <div className="flex items-center gap-2">
      {editHref ? (
        <a
          href={editHref}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100"
          aria-label="Editar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.313l-4 1 1-4L16.862 3.487z" />
          </svg>
        </a>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100"
          aria-label="Editar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.313l-4 1 1-4L16.862 3.487z" />
          </svg>
        </button>
      )}

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-600 hover:bg-red-100"
        aria-label="Eliminar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      </button>
    </div>
  );
}
