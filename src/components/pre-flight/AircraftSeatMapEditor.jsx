// src/components/pre-flight/AircraftSeatMapEditor.jsx
import { useState, useEffect } from 'react';
import { FaPlane, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Modal from '../common/Modal';

const AircraftSeatMapEditor = ({ isOpen, onClose, initialConfig, onSave }) => {
  const [aircraftType, setAircraftType] = useState('');
  const [rowCount, setRowCount] = useState(30);
  const [columnLayout, setColumnLayout] = useState('3-3');
  const [skipRows, setSkipRows] = useState([]);
  const [emergencyRows, setEmergencyRows] = useState([]);
  const [newRowNumber, setNewRowNumber] = useState('');
  const [jsonConfig, setJsonConfig] = useState('');
  const [editMode, setEditMode] = useState('visual'); // 'visual' o 'json'

  // Inicializar con config existente si está disponible
  useEffect(() => {
    if (initialConfig) {
      setAircraftType(initialConfig.type || '');
      setRowCount(initialConfig.rowCount || 30);
      
      // Determinar el layout basado en la configuración
      if (initialConfig.columnConfig) {
        const seatCount = initialConfig.columnConfig.filter(c => c.type === 'seat').length;
        const hasMiddleAisle = initialConfig.columnConfig.some(c => c.type === 'aisle');
        
        if (seatCount === 6 && hasMiddleAisle) setColumnLayout('3-3');
        else if (seatCount === 4 && hasMiddleAisle) setColumnLayout('2-2');
        else if (seatCount === 3 && hasMiddleAisle) setColumnLayout('2-1');
        else if (seatCount === 2 && hasMiddleAisle) setColumnLayout('1-1');
        else setColumnLayout('custom');
      }
      
      setSkipRows(initialConfig.skipRows || []);
      setEmergencyRows(initialConfig.emergencyRows || []);
      
      // Actualizar JSON
      setJsonConfig(JSON.stringify(initialConfig, null, 2));
    }
  }, [initialConfig, isOpen]);

  // Generar configuración de columnas basada en el layout
  const getColumnConfigFromLayout = (layout) => {
    switch (layout) {
      case '3-3':
        return [
          { id: 1, label: 'A', type: 'seat' },
          { id: 2, label: 'B', type: 'seat' },
          { id: 3, label: 'C', type: 'seat' },
          { id: 4, label: '', type: 'aisle' },
          { id: 5, label: 'D', type: 'seat' },
          { id: 6, label: 'E', type: 'seat' },
          { id: 7, label: 'F', type: 'seat' }
        ];
      case '2-2':
        return [
          { id: 1, label: 'A', type: 'seat' },
          { id: 2, label: 'B', type: 'seat' },
          { id: 3, label: '', type: 'aisle' },
          { id: 4, label: 'C', type: 'seat' },
          { id: 5, label: 'D', type: 'seat' }
        ];
      case '2-1':
        return [
          { id: 1, label: 'A', type: 'seat' },
          { id: 2, label: 'B', type: 'seat' },
          { id: 3, label: '', type: 'aisle' },
          { id: 4, label: 'C', type: 'seat' }
        ];
      case '1-1':
        return [
          { id: 1, label: 'A', type: 'seat' },
          { id: 2, label: '', type: 'aisle' },
          { id: 3, label: 'B', type: 'seat' }
        ];
      default:
        return [];
    }
  };

  // Cargar plantilla base cuando cambia el tipo de aeronave
  const handleAircraftTypeChange = (e) => {
    const type = e.target.value;
    setAircraftType(type);
    
    // Cargar configuración preestablecida
    switch(type) {
      case 'A320':
        setRowCount(30);
        setColumnLayout('3-3');
        setSkipRows([]);
        setEmergencyRows([11, 12]);
        break;
      case 'B737':
        setRowCount(33);
        setColumnLayout('3-3');
        setSkipRows([]);
        setEmergencyRows([10, 11]);
        break;
      case 'ERJ145':
        setRowCount(20);
        setColumnLayout('2-2');
        setSkipRows([]);
        setEmergencyRows([12]);
        break;
      case 'small':
        setRowCount(15);
        setColumnLayout('2-2');
        setSkipRows([13]);
        setEmergencyRows([8]);
        break;
      case 'regional':
        setRowCount(12);
        setColumnLayout('1-1');
        setSkipRows([]);
        setEmergencyRows([6]);
        break;
      case 'custom':
        // Mantener la configuración actual
        break;
      default:
        setRowCount(30);
        setColumnLayout('3-3');
        setSkipRows([]);
        setEmergencyRows([]);
    }
  };

  // Función para manejar filas a omitir o marcar como emergencia
  const handleAddRow = (type) => {
    const rowNum = parseInt(newRowNumber);
    if (!isNaN(rowNum) && rowNum > 0 && rowNum <= rowCount) {
      if (type === 'skip' && !skipRows.includes(rowNum)) {
        setSkipRows([...skipRows, rowNum]);
      } else if (type === 'emergency' && !emergencyRows.includes(rowNum)) {
        setEmergencyRows([...emergencyRows, rowNum]);
      }
      setNewRowNumber('');
    }
  };

  // Eliminar fila de la lista de omitidas
  const handleRemoveRow = (type, row) => {
    if (type === 'skip') {
      setSkipRows(skipRows.filter(r => r !== row));
    } else if (type === 'emergency') {
      setEmergencyRows(emergencyRows.filter(r => r !== row));
    }
  };

  // Actualizar JSON cuando cambian los valores
  useEffect(() => {
    if (editMode === 'visual') {
      const config = {
        type: aircraftType,
        rowCount,
        columnConfig: getColumnConfigFromLayout(columnLayout),
        skipRows,
        emergencyRows
      };
      setJsonConfig(JSON.stringify(config, null, 2));
    }
  }, [aircraftType, rowCount, columnLayout, skipRows, emergencyRows, editMode]);

  // Parsear JSON cuando se edita manualmente
  const handleJsonChange = (e) => {
    setJsonConfig(e.target.value);
    try {
      const config = JSON.parse(e.target.value);
      if (config && typeof config === 'object') {
        // La validación es exitosa, pero no actualizamos los otros estados
        // para evitar problemas de sincronización mientras se edita
      }
    } catch (error) {
      // Error al parsear JSON, no hacemos nada hasta que sea válido
    }
  };

  // Actualizar estados visuales desde JSON
  const applyJsonToVisual = () => {
    try {
      const config = JSON.parse(jsonConfig);
      if (config) {
        setAircraftType(config.type || '');
        setRowCount(config.rowCount || 30);
        
        // Determinar layout desde columnConfig
        if (config.columnConfig) {
          const seatCount = config.columnConfig.filter(c => c.type === 'seat').length;
          const hasMiddleAisle = config.columnConfig.some(c => c.type === 'aisle');
          
          if (seatCount === 6 && hasMiddleAisle) setColumnLayout('3-3');
          else if (seatCount === 4 && hasMiddleAisle) setColumnLayout('2-2');
          else if (seatCount === 3 && hasMiddleAisle) setColumnLayout('2-1');
          else if (seatCount === 2 && hasMiddleAisle) setColumnLayout('1-1');
          else setColumnLayout('custom');
        }
        
        setSkipRows(config.skipRows || []);
        setEmergencyRows(config.emergencyRows || []);
      }
    } catch (error) {
      alert("Error al parsear JSON: " + error.message);
    }
  };

  // Guardar configuración
  const handleSaveConfig = (e) => {
    e.preventDefault(); // Importante: prevenir navegación
    try {
      let config;
      
      if (editMode === 'visual') {
        config = {
          type: aircraftType,
          rowCount,
          columnConfig: getColumnConfigFromLayout(columnLayout),
          skipRows,
          emergencyRows
        };
      } else {
        config = JSON.parse(jsonConfig);
      }
      
      onSave(config);
      onClose();
    } catch (error) {
      alert("Error al guardar la configuración: " + error.message);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Editor de Mapa de Asientos"
      size="lg"
    >
      <div className="flex mb-4">
        <button 
          type="button"
          onClick={() => setEditMode('visual')}
          className={`px-4 py-2 rounded-l-md ${editMode === 'visual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Modo Visual
        </button>
        <button 
          type="button"
          onClick={() => setEditMode('json')}
          className={`px-4 py-2 rounded-r-md ${editMode === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Modo JSON
        </button>
      </div>
      
      {editMode === 'visual' ? (
        <form onSubmit={handleSaveConfig}>
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
                <option value="regional">Avión Regional (1+1)</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            {/* Número de filas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Filas
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={rowCount}
                onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
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
                onClick={() => setColumnLayout('3-3')}
                className={`px-3 py-1 border rounded-md ${columnLayout === '3-3' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
              >
                3-3 (A-B-C | D-E-F)
              </button>
              <button 
                type="button" 
                onClick={() => setColumnLayout('2-2')}
                className={`px-3 py-1 border rounded-md ${columnLayout === '2-2' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
              >
                2-2 (A-B | C-D)
              </button>
              <button 
                type="button" 
                onClick={() => setColumnLayout('2-1')}
                className={`px-3 py-1 border rounded-md ${columnLayout === '2-1' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
              >
                2-1 (A-B | C)
              </button>
              <button 
                type="button" 
                onClick={() => setColumnLayout('1-1')}
                className={`px-3 py-1 border rounded-md ${columnLayout === '1-1' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
              >
                1-1 (A | B)
              </button>
            </div>
          </div>
          
          {/* Filas a omitir y salidas de emergencia */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filas a omitir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filas a Omitir (ej: 13)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  min="1"
                  max={rowCount}
                  value={newRowNumber}
                  onChange={(e) => setNewRowNumber(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Fila"
                />
                <button 
                  type="button"
                  onClick={() => handleAddRow('skip')}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  Omitir
                </button>
              </div>
              
              {skipRows.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skipRows.sort((a, b) => a - b).map(row => (
                    <div key={row} className="flex items-center bg-gray-100 px-2 py-1 rounded">
                      <span>Fila {row}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveRow('skip', row)}
                        className="ml-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Salidas de emergencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filas con Salida de Emergencia
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  min="1"
                  max={rowCount}
                  value={newRowNumber}
                  onChange={(e) => setNewRowNumber(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Fila"
                />
                <button 
                  type="button"
                  onClick={() => handleAddRow('emergency')}
                  className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center"
                >
                  <FaExclamationTriangle className="mr-1" /> Emergencia
                </button>
              </div>
              
              {emergencyRows.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {emergencyRows.sort((a, b) => a - b).map(row => (
                    <div key={row} className="flex items-center bg-orange-100 px-2 py-1 rounded">
                      <span>Fila {row}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveRow('emergency', row)}
                        className="ml-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Vista previa simplificada */}
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Resumen de Configuración</h3>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p><span className="font-medium">Tipo:</span> {aircraftType || 'Personalizado'}</p>
              <p><span className="font-medium">Filas:</span> {rowCount}</p>
              <p><span className="font-medium">Configuración:</span> {columnLayout}</p>
              <p>
                <span className="font-medium">Filas omitidas:</span> 
                {skipRows.length > 0 ? skipRows.sort((a, b) => a - b).join(', ') : ' Ninguna'}
              </p>
              <p>
                <span className="font-medium">Salidas de emergencia:</span> 
                {emergencyRows.length > 0 ? emergencyRows.sort((a, b) => a - b).join(', ') : ' Ninguna'}
              </p>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end gap-2 mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center"
            >
              <FaCheck className="mr-1" /> Guardar Configuración
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configuración JSON
            </label>
            <textarea
              value={jsonConfig}
              onChange={handleJsonChange}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Edita directamente el JSON para configuraciones avanzadas
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={applyJsonToVisual}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Aplicar al Modo Visual
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
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
    </Modal>
  );
};

export default AircraftSeatMapEditor;