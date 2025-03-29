// src/components/pre-flight/AircraftSeatMapEditor/SeatMap.jsx - Versión mejorada
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlane, FaEllipsisH, FaExclamationTriangle, FaPlus, FaCheck, FaTrash, 
  FaArrowUp, FaArrowDown, FaInfoCircle
} from 'react-icons/fa';
import Seat from './Seat'; // Importar el componente Seat separado

// Función para cerrar todos los menús en una fila
const closeAllMenusInRow = (except) => {
  window.dispatchEvent(new CustomEvent('closeAllMenus', { 
    detail: { except } 
  }));
};

// Componente para una fila completa
const Row = ({ 
  row, 
  rowIndex, 
  sections, 
  deleteRow, 
  toggleEmergencyExit, 
  assignSectionToRow, 
  addRow,
  addSeat,
  deleteSeat,
  toggleSeatProperty,
  updateRowNumber,
  updateSeatLabel,
  totalRows
}) => {
  // Estados
  const [showOptions, setShowOptions] = useState(false);
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [newRowNumber, setNewRowNumber] = useState(row.number);
  
  // Encontrar la sección correspondiente
  const section = sections.find(s => s.id === row.section);
  const sectionColor = section ? section.color : '#3b82f6';

  // Función para validar número de fila
  const validateRowNumber = (num) => {
    return !isNaN(num) && num > 0 && num <= 999;
  };

  // Función para guardar el número de fila
  const handleSaveRowNumber = () => {
    const num = parseInt(newRowNumber);
    if (validateRowNumber(num)) {
      updateRowNumber(rowIndex, num);
    } else {
      // Volver al valor original si no es válido
      setNewRowNumber(row.number);
    }
    setIsEditingNumber(false);
  };
  
  // Manejar tecla Enter en edición de número
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveRowNumber();
    } else if (e.key === 'Escape') {
      // Cancelar edición
      setNewRowNumber(row.number);
      setIsEditingNumber(false);
    }
  };
  
  // Determinar estilo de la fila
  let rowStyle = "mb-2 flex items-center w-full max-w-4xl ";
  if (row.isEmergencyExit) {
    rowStyle += "bg-orange-50 border border-orange-200 rounded-md px-1 py-1";
  }
  
  return (
    <div className={rowStyle}>
      {/* Controles de fila */}
      <div className="w-16 flex flex-col items-center">
        {isEditingNumber ? (
          <input
            type="number"
            value={newRowNumber}
            onChange={(e) => setNewRowNumber(e.target.value)}
            onBlur={handleSaveRowNumber}
            onKeyDown={handleKeyDown}
            className="w-12 text-center px-1 py-0 border border-blue-400 rounded-md text-sm"
            autoFocus
            min="1"
            max="999"
          />
        ) : (
          <div 
            className="text-sm font-bold cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded"
            onClick={() => {
              setIsEditingNumber(true);
              setNewRowNumber(row.number);
            }}
            title="Click para editar número de fila"
          >
            {row.number}
          </div>
        )}
        <div className="flex mt-1">
          <button
            type="button"
            onClick={() => {
              if (totalRows <= 1) {
                alert("No puedes eliminar la única fila. El mapa debe tener al menos una fila.");
                return;
              }
              // Confirmar antes de eliminar
              if (window.confirm(`¿Estás seguro de eliminar la fila ${row.number}?`)) {
                deleteRow(rowIndex);
              }
            }}
            className="p-1 text-red-500 hover:text-red-700"
            title="Eliminar fila"
          >
            <FaTrash size={12} />
          </button>
          <button
            type="button"
            onClick={() => toggleEmergencyExit(rowIndex)}
            className={`p-1 ${row.isEmergencyExit ? 'text-orange-500' : 'text-gray-400'} hover:text-orange-700`}
            title={row.isEmergencyExit ? "Quitar salida de emergencia" : "Marcar como salida de emergencia"}
          >
            <FaExclamationTriangle size={12} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Más opciones"
            >
              <FaEllipsisH size={12} />
            </button>
            {showOptions && (
              <div className="absolute left-full ml-1 bg-white shadow-md rounded-md p-1 z-10">
                <button
                  type="button"
                  onClick={() => {
                    addRow(rowIndex);
                    setShowOptions(false);
                  }}
                  className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center"
                >
                  <FaPlus size={10} className="mr-1" /> Agregar fila después
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addRow(rowIndex - 1);
                    setShowOptions(false);
                  }}
                  className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center"
                >
                  <FaArrowUp size={10} className="mr-1" /> Agregar fila antes
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="text-xs font-medium px-2 py-1 text-gray-500">Sección:</div>
                {sections.map(section => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      assignSectionToRow(rowIndex, section.id);
                      setShowOptions(false);
                    }}
                    className={`block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center ${row.section === section.id ? 'font-bold' : ''}`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-1" 
                      style={{ backgroundColor: section.color }}
                    ></div>
                    {section.name}
                    {row.section === section.id && <FaCheck size={12} className="ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Asientos con botones "+" entre ellos */}
      <div className="flex flex-grow items-center justify-center gap-1 ml-2">
        {/* Botón para agregar al inicio */}
        <button
          type="button"
          onClick={() => addSeat(rowIndex, 0)}
          className="w-4 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md"
          title="Agregar asiento aquí"
        >
          <FaPlus size={9} className="text-gray-400" />
        </button>
        
        {/* Renderizar asientos intercalados con botones "+" */}
        {row.seats.map((seat, seatIndex) => (
          <React.Fragment key={`seat-group-${seatIndex}-${seat.id || `seat-${seatIndex}`}`}>
            {seat.type === 'aisle' ? (
              <div 
                key={`aisle-${seatIndex}`}
                className="w-8 flex items-center justify-center text-gray-400"
                title="Pasillo"
              >
                <FaEllipsisH />
              </div>
            ) : (
              <Seat 
                key={`seat-${seatIndex}`}
                seat={seat}
                sectionColor={sectionColor}
                rowIndex={rowIndex}
                seatIndex={seatIndex}
                toggleSeatProperty={toggleSeatProperty}
                deleteSeat={deleteSeat}
                updateSeatLabel={updateSeatLabel}
                closeAllMenus={closeAllMenusInRow}
              />
            )}
            
            {/* Agregar botón "+" después de cada asiento excepto después del pasillo */}
            {seat.type !== 'aisle' && (
              <button
                type="button"
                onClick={() => addSeat(rowIndex, seatIndex + 1)}
                className="w-4 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md"
                title="Agregar asiento aquí"
              >
                <FaPlus size={9} className="text-gray-400" />
              </button>
            )}
          </React.Fragment>
        ))}
        
        {/* Botón para agregar al final */}
        <button
          type="button"
          onClick={() => addSeat(rowIndex, row.seats.length)}
          className="w-8 h-10 flex items-center justify-center border border-dashed border-gray-300 rounded-md hover:bg-gray-50"
          title="Agregar asiento"
        >
          <FaPlus size={12} className="text-gray-400" />
        </button>
      </div>
      
      {/* Indicador de sección */}
      <div className="w-12 ml-2">
        {row.section && (
          <div 
            className="text-xs px-1 py-0.5 rounded text-center"
            style={{ 
              backgroundColor: `${sectionColor}30`,
              color: sectionColor
            }}
          >
            {row.section}
          </div>
        )}
      </div>
    </div>
  );
};

const SeatMap = (props) => {
  const { rows, addRow, updateSeatLabel, updateRowNumber } = props;
  
  // Estado para manejar errores
  const [error, setError] = useState(null);
  
  // Validar que las funciones requeridas existen
  useEffect(() => {
    if (!updateSeatLabel || typeof updateSeatLabel !== 'function') {
      console.error("La función updateSeatLabel no está definida correctamente");
      setError("Falta función de actualización de etiquetas");
    }
    
    if (!updateRowNumber || typeof updateRowNumber !== 'function') {
      console.error("La función updateRowNumber no está definida correctamente");
      setError("Falta función de actualización de números de fila");
    }
  }, [updateSeatLabel, updateRowNumber]);
  
  // Manejador de errores para funciones críticas
  const safeUpdateSeatLabel = useCallback((rowIndex, seatIndex, newLabel) => {
    try {
      if (updateSeatLabel) {
        updateSeatLabel(rowIndex, seatIndex, newLabel);
      } else {
        console.error("updateSeatLabel no está disponible");
      }
    } catch (err) {
      console.error("Error al actualizar etiqueta de asiento:", err);
      setError("Error al actualizar etiqueta");
    }
  }, [updateSeatLabel]);
  
  return (
    <div className="border rounded-md p-3 bg-gray-50 flex-grow overflow-auto relative">
      {/* Banner de error si hay problemas */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 flex items-center">
          <FaInfoCircle className="mr-2" />
          {error}
          <button 
            className="ml-auto text-red-700 hover:text-red-900"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-center mb-2">
        <div className="bg-blue-500 text-white py-1 px-3 rounded-md flex items-center">
          <FaPlane className="mr-2" /> Parte Frontal
        </div>
      </div>
      
      {/* Renderizado del mapa de asientos */}
      <div className="mt-4 flex flex-col items-center">
        {rows.map((row, rowIndex) => (
          <Row 
            key={`row-${rowIndex}-${row.id || row.number}`} 
            row={row} 
            rowIndex={rowIndex} 
            {...props} 
            updateSeatLabel={safeUpdateSeatLabel}
            totalRows={rows.length}
          />
        ))}
      </div>
      
      {/* Añadir fila al final */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={() => addRow('end')}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md flex items-center"
        >
          <FaPlus className="mr-1" /> Agregar Fila al Final
        </button>
      </div>
      
      {/* Información de ayuda */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Tip: Click en el número de fila para editar. Click en un asiento para acceder a sus opciones.
      </div>
    </div>
  );
};

export default SeatMap;