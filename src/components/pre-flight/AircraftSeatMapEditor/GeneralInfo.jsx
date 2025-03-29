const GeneralInfo = ({ 
    configName, 
    setConfigName, 
    aircraftType, 
    setAircraftType, 
    aircraftModel, 
    setAircraftModel 
  }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Configuración
          </label>
          <input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: Boeing 737-800 Aerolínea XYZ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fabricante
          </label>
          <input
            type="text"
            value={aircraftType}
            onChange={(e) => setAircraftType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: Boeing, Airbus, Embraer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo
          </label>
          <input
            type="text"
            value={aircraftModel}
            onChange={(e) => setAircraftModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: 737-800, A320, E190"
          />
        </div>
      </div>
    );
  };
  
  export default GeneralInfo;