// src/components/pre-flight/AircraftSeatMapEditor/RecentConfigsPanel.jsx - versión mejorada
import React from 'react';

const RecentConfigsPanel = ({ recentConfigs, loadFromRecentConfig }) => {
  const handleConfigClick = (configId) => {
    console.log("Intentando cargar configuración:", configId);
    
    // Buscar la configuración en el array
    const configToLoad = recentConfigs.find(c => c.id === configId);
    
    if (configToLoad) {
      console.log("Configuración encontrada:", configToLoad);
      loadFromRecentConfig(configId);
    } else {
      console.error("No se encontró la configuración con ID:", configId);
    }
  };
  
  return (
    <div className="border rounded-md p-3 h-full overflow-auto">
      <h3 className="text-md font-medium mb-2">Configuraciones Recientes</h3>
      <div className="space-y-2">
        {recentConfigs.length === 0 ? (
          <p className="text-sm text-gray-500">No hay configuraciones guardadas</p>
        ) : (
          recentConfigs.map((config) => (
            <div 
              key={config.id} 
              className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => handleConfigClick(config.id)}
            >
              <div className="font-medium text-sm">{config.name}</div>
              <div className="text-xs text-gray-500">
                {config.aircraftType} {config.aircraftModel}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{config.rowCount} filas, {config.seatCount} asientos</span>
                <span>{new Date(config.timestamp).toLocaleDateString()}</span>
              </div>
              <button 
                className="mt-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-2 rounded w-full text-center"
                onClick={(e) => {
                  e.stopPropagation(); // Evitar que se propague el clic
                  handleConfigClick(config.id);
                }}
              >
                Cargar configuración
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentConfigsPanel;