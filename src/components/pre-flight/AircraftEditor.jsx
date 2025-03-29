// src/components/pre-flight/AircraftEditor.jsx
import { useState, useEffect } from 'react';
import { FaPlane, FaChair, FaTrash, FaCheck, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';

const AircraftEditor = ({ initialConfig, onSave }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [aircraftType, setAircraftType] = useState('');
  const [rowCount, setRowCount] = useState(30);
  const [columnConfig, setColumnConfig] = useState(['A', 'B', 'C', '', 'D', 'E', 'F']);
  const [skipRows, setSkipRows] = useState([]);
  const [newSkipRow, setNewSkipRow] = useState('');
  const [previewMap, setPreviewMap] = useState([]);

  // Inicializar con config existente si está disponible
  useEffect(() => {
    if (initialConfig) {
      setAircraftType(initialConfig.type || '');
      setRowCount(initialConfig.rowCount || 30);
      setColumnConfig(initialConfig.columnConfig || ['A', 'B', 'C', '', 'D', 'E', 'F']);
      setSkipRows(initialConfig.skipRows || []);
    }
  }, [initialConfig]);

  // Actualizar vista previa cuando cambian los parámetros
  useEffect(() => {
    generatePreview();
  }, [rowCount, columnConfig, skipRows]);

  // Cargar plantilla base cuando cambia el tipo de aeronave
  const handleAircraftTypeChange = (e) => {
    const type = e.target.value;
    setAircraftType(type);
    
    // Cargar configuración preestablecida
    switch(type) {
      case 'A320':
        setRowCount(30);
        setColumnConfig(['A', 'B', 'C', '', 'D', 'E', 'F']);
        setSkipRows([]);
        break;
      case 'B737':
        setRowCount(33);
        setColumnConfig(['A', 'B', 'C', '', 'D', 'E', 'F']);
        setSkipRows([]);
        break;
      case 'ERJ145':
        setRowCount(20);
        setColumnConfig(['A', 'B', '', 'C', 'D']);
        setSkipRows([]);
        break;
      case 'small':
        setRowCount(15);
        setColumnConfig(['A', 'B', '', 'C', 'D']);
        setSkipRows([13]);
        break;
      case 'custom':
        // Mantener la configuración actual
        break;
      default:
        setRowCount(30);
        setColumnConfig(['A', 'B', 'C', '', 'D', 'E', 'F']);
        setSkipRows([]);
    }
  };

  // Añadir fila a omitir
  const handleAddSkipRow = () => {
    const rowNum = parseInt(newSkipRow);
    if (!isNaN(rowNum) && rowNum > 0 && rowNum <= rowCount && !skipRows.includes(rowNum)) {
      setSkipRows([...skipRows, rowNum]);
      setNewSkipRow('');
    }
  };

  // Eliminar fila de la lista de omitidas
  const handleRemoveSkipRow = (row) => {
    setSkipRows(skipRows.filter(r => r !== row));
  };

  // Cambiar configuración de columnas (asientos por fila)
  const handleColumnConfigChange = (config) => {
    setColumnConfig(config);
  };

  // Generar vista previa del mapa de asientos
  const generatePreview = () => {
    const preview = [];
    
    for (let row = 1; row <= rowCount; row++) {
      // Omitir filas especificadas
      if (skipRows.includes(row)) continue;
      
      const rowData = [];
      for (let col of columnConfig) {
        if (col === '') {
          rowData.push({ type: 'aisle' });
        } else {
          rowData.push({
            id: `${row}${col}`,
            type: 'seat'
          });
        }
      }
      preview.push(rowData);
    }
    
    setPreviewMap(preview);
  };

  // Guardar configuración
  const handleSaveConfig = () => {
    const config = {
      type: aircraftType,
      rowCount,
      columnConfig,
      skipRows
    };
    onSave(config);
    setShowEditor(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FaPlane className="mr-2" /> Configuración de Aeronave
        </h2>
        <button 
          type="button"
          onClick={() => setShowEditor(!showEditor)}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
        >
          {showEditor ? 'Ocultar Editor' : 'Mostrar Editor'}
        </button>
      </div>
      
      {showEditor && (
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Selección de plantilla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plantilla de Aeronave
              </label>
              <select
                value={aircraftType}
                onChange={handleAircraftTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccionar plantilla</option>
                <option value="A320">Airbus A320</option>
                <option value="B737">Boeing 737</option>
                <option value="ERJ145">Embraer ERJ145</option>
                <option value="small">Avión Pequeño (2+2)</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            {/* Número de filas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Filas
              </label>
              <div className="flex items-center">
                <button 
                  type="button"
                  onClick={() => setRowCount(Math.max(1, rowCount - 1))}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-l-md"
                >
                  <FaMinusCircle />
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={rowCount}
                  onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border-y border-gray-300 text-center"
                />
                <button 
                  type="button"
                  onClick={() => setRowCount(rowCount + 1)}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-r-md"
                >
                  <FaPlusCircle />
                </button>
              </div>
            </div>
          </div>
          
          {/* Configuración de columnas */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configuración de Asientos por Fila
            </label>
            <div className="flex flex-wrap gap-2">
              <button 
                type="button" 
                onClick={() => handleColumnConfigChange(['A', 'B', 'C', '', 'D', 'E', 'F'])}
                className={`px-3 py-1 border rounded-md ${columnConfig.join('') === 'ABC DEF' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
              >
                3-3 (A-B-C | D-E-F)
              </button>
              <button 
                type="button" 
                onClick={() => handleColumnConfigChange(['A', 'B', '', 'C', 'D'])}
                className={`px-3 py-1 border rounded-md ${columnConfig.join('') === 'AB CD' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
              >
                2-2 (A-B | C-D)
              </button>
              <button 
                type="button" 
                onClick={() => handleColumnConfigChange(['A', 'B', '', 'C'])}
                className={`px-3 py-1 border rounded-md ${columnConfig.join('') === 'AB C' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
              >
                2-1 (A-B | C)
              </button>
              <button 
                type="button" 
                onClick={() => handleColumnConfigChange(['A', '', 'B'])}
                className={`px-3 py-1 border rounded-md ${columnConfig.join('') === 'A B' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
              >
                1-1 (A | B)
              </button>
            </div>
          </div>
          
          {/* Filas a omitir */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filas a Omitir (ej: 13)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={rowCount}
                value={newSkipRow}
                onChange={(e) => setNewSkipRow(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Fila"
              />
              <button 
                type="button"
                onClick={handleAddSkipRow}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Añadir
              </button>
            </div>
            
            {skipRows.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skipRows.sort((a, b) => a - b).map(row => (
                  <div key={row} className="flex items-center bg-gray-100 px-2 py-1 rounded">
                    <span>Fila {row}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveSkipRow(row)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Vista previa */}
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Vista Previa</h3>
            <div className="border border-gray-200 p-4 rounded-md bg-gray-50 overflow-auto max-h-60">
              <div className="flex justify-center mb-2">
                <div className="bg-gray-300 px-4 py-1 rounded text-sm">Frente</div>
              </div>
              
              <div className="flex flex-col items-center">
                {previewMap.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center mb-1">
                    <span className="text-xs w-8 text-right mr-2">
                      {rowIndex + 1 + skipRows.filter(r => r <= rowIndex + 1).length}
                    </span>
                    <div className="flex">
                      {row.map((seat, seatIndex) => (
                        <div 
                          key={seatIndex}
                          className={`
                            ${seat.type === 'aisle' ? 'w-3' : 'w-6 h-6 bg-blue-100 flex items-center justify-center text-xs rounded'}
                            mx-0.5
                          `}
                        >
                          {seat.type !== 'aisle' && <FaChair size={14} />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-2">
                <div className="bg-gray-300 px-4 py-1 rounded text-sm">Cola</div>
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={() => setShowEditor(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md mr-2"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center"
            >
              <FaCheck className="mr-1" /> Guardar Configuración
            </button>
          </div>
        </div>
      )}
      
      {!showEditor && initialConfig && (
        <div className="text-gray-600">
          <p>Aeronave configurada: <span className="font-medium">{initialConfig.type || 'Personalizada'}</span></p>
          <p>Filas: <span className="font-medium">{initialConfig.rowCount}</span></p>
          <p>Configuración: <span className="font-medium">
            {initialConfig.columnConfig.filter(c => c !== '').length} asientos por fila
            ({initialConfig.columnConfig.filter(c => c !== '').join('-')})
          </span></p>
          {initialConfig.skipRows.length > 0 && (
            <p>Filas omitidas: <span className="font-medium">
              {initialConfig.skipRows.sort((a, b) => a - b).join(', ')}
            </span></p>
          )}
        </div>
      )}
    </div>
  );
};

export default AircraftEditor;