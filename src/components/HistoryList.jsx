import React, { useState } from "react";
import { Modal } from "./Modal";

export function HistoryList({ history, onCopy, onDelete }) {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    index: null,
  });

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <p className="text-gray-500 text-lg font-medium">
          No hay registros guardados
        </p>
        <p className="text-gray-400 text-sm">
          Los JSONs guardados aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {history.map((entry, index) => (
        <div
          key={index}
          className={`border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer
            ${
              selectedEntry === index
                ? "border-indigo-500 bg-indigo-50 shadow-lg"
                : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
            }`}
          onClick={() => setSelectedEntry(index)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <div className="text-sm text-gray-600">
                {new Date(entry.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 text-sm text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    JSON.stringify(entry.data, null, 2)
                  );
                  onCopy();
                }}
              >
                Copiar
              </button>
              <button
                className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModal({ isOpen: true, index });
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
          <pre
            className={`bg-white p-4 rounded-lg overflow-auto max-h-60 transition-all duration-200
            ${
              selectedEntry === index
                ? "border-2 border-indigo-200"
                : "border border-gray-200"
            }`}
          >
            <code className="text-sm">
              {JSON.stringify(entry.data, null, 2)}
            </code>
          </pre>
        </div>
      ))}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, index: null })}
        onConfirm={() => {
          onDelete(deleteModal.index);
          if (selectedEntry === deleteModal.index) {
            setSelectedEntry(null);
          }
        }}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este JSON? Esta acción no se puede deshacer."
      />
    </div>
  );
}
