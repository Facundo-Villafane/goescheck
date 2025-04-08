// src/components/common/ExportModal.jsx
import React from 'react';
import { FaPrint, FaFilePdf, FaPlane } from 'react-icons/fa';

/**
 * Modal para exportar o imprimir
 * @param {boolean} show - Si se debe mostrar el modal
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onExportPDF - Función para exportar a PDF
 * @param {Function} onPrint - Función para imprimir
 * @param {Function} onExportDCS - Función para exportar el reporte DCS
 */
const ExportModal = ({ show, onClose, onExportPDF, onPrint, onExportDCS }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h3 className="text-lg font-medium mb-4">Exportar Resumen</h3>
        <div className="space-y-3">
          <button
            onClick={() => {
              onExportPDF();
              onClose();
            }}
            className="w-full px-4 py-2 bg-sand hover:bg-noche text-white rounded-md flex items-center justify-center"
          >
            <FaFilePdf className="mr-2" /> Exportar a PDF
          </button>
          <button
            onClick={() => {
              onPrint();
              onClose();
            }}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md flex items-center justify-center"
          >
            <FaPrint className="mr-2" /> Imprimir
          </button>
          
          {/* Botón para reporte DCS (solo si la función está disponible) */}
          {onExportDCS && (
            <button
              onClick={() => {
                onExportDCS();
                onClose();
              }}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
            >
              <FaPlane className="mr-2" /> Reporte DCS
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;