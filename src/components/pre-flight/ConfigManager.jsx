// src/components/pre-flight/ConfigManager.jsx
import { useState, useEffect } from 'react';
import { FaSave, FaFolder, FaPlane } from 'react-icons/fa';
import Modal from '../common/Modal';

const ConfigManager = ({ onLoadConfig }) => {
  const [showModal, setShowModal] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [newConfigName, setNewConfigName] = useState('');
  const [selectedConfig, setSelectedConfig] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Cargar lista de configuraciones disponibles
  const loadConfigList = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.listConfigs();
      if (result.success) {
        setConfigs(result.configs);
      } else {
        console.error("Error listing configs:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar lista cuando se abre el modal
  useEffect(() => {
    if (showModal) {
      loadConfigList();
    }
  }, [showModal]);
  
  // Guardar configuración actual
  const saveCurrentConfig = async () => {
    if (!newConfigName.trim()) {
      alert("Por favor ingrese un nombre para la configuración");
      return;
    }
    
    try {
      // Obtener la configuración actual del localStorage
      const flightDetailsStr = localStorage.getItem('flightDetails');
      if (!flightDetailsStr) {
        alert("No hay configuración actual para guardar");
        return;
      }
      
      const flightDetails = JSON.parse(flightDetailsStr);
      
      // Guardar solo la configuración de la aeronave
      const configToSave = {
        aircraft: flightDetails.aircraft,
        seatConfig: flightDetails.seatConfig
      };
      
      const result = await window.electronAPI.saveConfig(newConfigName, configToSave);
      if (result.success) {
        alert(`Configuración "${newConfigName}" guardada exitosamente`);
        setNewConfigName('');
        loadConfigList();
      } else {
        alert("Error al guardar: " + result.error);
      }
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Error: " + error.message);
    }
  };
  
  // Cargar configuración seleccionada
  const loadSelectedConfig = async () => {
    if (!selectedConfig) {
      alert("Por favor seleccione una configuración");
      return;
    }
    
    try {
      const result = await window.electronAPI.loadConfig(selectedConfig);
      if (result.success) {
        onLoadConfig(result.data);
        setShowModal(false);
      } else {
        alert("Error al cargar: " + result.error);
      }
    } catch (error) {
      console.error("Error loading config:", error);
      alert("Error: " + error.message);
    }
  };
  
  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          <FaFolder className="mr-1" /> Configuraciones
        </button>
      </div>
      
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Administrar Configuraciones"
        size="md"
      >
        <div className="space-y-6">
          {/* Guardar configuración actual */}
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Guardar Configuración Actual</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                placeholder="Nombre de la configuración"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={saveCurrentConfig}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center"
              >
                <FaSave className="mr-1" /> Guardar
              </button>
            </div>
          </div>
          
          {/* Cargar configuración guardada */}
          <div>
            <h3 className="font-medium mb-2">Cargar Configuración</h3>
            
            {loading ? (
              <p className="text-center py-4">Cargando...</p>
            ) : configs.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No hay configuraciones guardadas</p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {configs.map((config) => (
                    <div
                      key={config}
                      className={`p-3 border-b border-gray-200 flex items-center cursor-pointer ${
                        selectedConfig === config ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedConfig(config)}
                    >
                      <FaPlane className="mr-2 text-gray-500" />
                      <span>{config}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={loadSelectedConfig}
                  disabled={!selectedConfig}
                  className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Cargar Configuración Seleccionada
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConfigManager;