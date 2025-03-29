// src/components/check-in/PrinterSelector.jsx
import React, { useState, useEffect } from 'react';
import { FaPrint, FaCog, FaExclamationTriangle } from 'react-icons/fa';
import PrintingService from '../../services/PrintingService';

const PrinterSelector = ({ onPrinterChange, onConfigClick }) => {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinterId, setSelectedPrinterId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar impresoras disponibles
  useEffect(() => {
    const loadPrinters = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Usar el servicio para obtener impresoras
        const availablePrinters = await PrintingService.getPrinters();
        setPrinters(availablePrinters);
        
        // Seleccionar la impresora predeterminada
        const defaultPrinter = await PrintingService.getDefaultPrinter();
        if (defaultPrinter) {
          setSelectedPrinterId(defaultPrinter.id);
          if (onPrinterChange) {
            onPrinterChange(defaultPrinter);
          }
        } else if (availablePrinters.length > 0) {
          // Si no hay impresora predeterminada, usar la primera
          setSelectedPrinterId(availablePrinters[0].id);
          if (onPrinterChange) {
            onPrinterChange(availablePrinters[0]);
          }
        }
      } catch (err) {
        console.error('Error al cargar impresoras:', err);
        setError('Error al cargar impresoras. Por favor, configure las impresoras.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPrinters();
  }, [onPrinterChange]);

  // Manejar cambio de impresora
  const handlePrinterChange = (e) => {
    const printerId = e.target.value;
    setSelectedPrinterId(printerId);
    
    if (printerId) {
      const printer = printers.find(p => p.id === printerId);
      if (printer && onPrinterChange) {
        onPrinterChange(printer);
      }
    } else if (onPrinterChange) {
      onPrinterChange(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <select
            value={selectedPrinterId}
            onChange={handlePrinterChange}
            disabled={isLoading || printers.length === 0}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md appearance-none"
          >
            {isLoading ? (
              <option value="">Cargando impresoras...</option>
            ) : printers.length === 0 ? (
              <option value="">No hay impresoras configuradas</option>
            ) : (
              <>
                <option value="">Seleccione una impresora</option>
                {printers.map(printer => (
                    <option
                        key={printer.id}
                        value={printer.id}
                        className={printer.id === 'pdf-preview' ? 'text-blue-600 font-medium' : ''}
                    >
                        {printer.id === 'pdf-preview' ? '🔍 ' : ''}
                        {printer.name} {printer.isDefault ? '(Default)' : ''}
                    </option>
                    ))}
              </>
            )}
          </select>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaPrint className="text-gray-400" />
          </div>
        </div>
        
        {onConfigClick && (
          <button
            type="button"
            onClick={onConfigClick}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md flex items-center"
            title="Configurar impresoras"
          >
            <FaCog />
          </button>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <FaExclamationTriangle className="mr-1" /> {error}
        </div>
      )}
      
      {printers.length === 0 && !isLoading && !error && (
        <div className="mt-2 text-sm text-yellow-600">
          No hay impresoras configuradas. Configure impresoras para poder imprimir tarjetas de embarque.
        </div>
      )}
    </div>
  );
};

export default PrinterSelector;