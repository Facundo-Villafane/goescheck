// src/components/pre-flight/FlightInfoTab.jsx
import React from 'react';
import { FaImage } from 'react-icons/fa';

const FlightInfoTab = ({ flightDetails, setFlightDetails, onSave, onShowLogoManager }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFlightDetails({
      ...flightDetails,
      [name]: value
    });
    
    // Guardar en localStorage después de actualizar
    try {
      localStorage.setItem('flightDetails', JSON.stringify({
        ...flightDetails,
        [name]: value
      }));
    } catch (error) {
      console.error('Error al guardar detalles de vuelo:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Información del Vuelo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Vuelo *
          </label>
          <input
            type="text"
            name="flightNumber"
            value={flightDetails.flightNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            name="date"
            value={flightDetails.date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matrícula *
          </label>
          <input
            type="text"
            name="aircraft"
            value={flightDetails.aircraft}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ej: LV-AAA, CC-EEE, HC-CWG, etc."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origen
          </label>
          <input
            type="text"
            name="origin"
            value={flightDetails.origin}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Código IATA ej: MDZ"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destino
          </label>
          <input
            type="text"
            name="destination"
            value={flightDetails.destination}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Código IATA ej: AEP"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora de Salida (STD) *
          </label>
          <input
            type="time"
            name="std"
            value={flightDetails.std || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Formato 24hs (Hora local Argentina)</p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onShowLogoManager}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium flex items-center"
        >
          <FaImage className="mr-2" /> Configurar Logo
        </button>
        
        <button
          type="button"
          onClick={onSave}
          className="bg-sand hover:bg-noche text-white py-2 px-4 rounded-md font-medium"
        >
          Guardar y Continuar
        </button>
      </div>
    </div>
  );
};

export default FlightInfoTab;