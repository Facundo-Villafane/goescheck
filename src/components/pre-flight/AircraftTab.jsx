// src/components/pre-flight/AircraftTab.jsx
import React from 'react';
import { FaEdit } from 'react-icons/fa';

const AircraftTab = ({ flightDetails, onSave, onBack, onShowEditor }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Configuración de Aeronave</h2>
      
      <div>
        <p className="mb-4">Configura el mapa de asientos de la aeronave para este vuelo.</p>
        
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={onShowEditor}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
          >
            <FaEdit className="mr-2" /> 
            Configurar Mapa de Asientos
          </button>
        </div>
        
        {/* Mostrar información del mapa de asientos si existe */}
        {flightDetails.seatConfig && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Configuración actual:</h3>
            <p><span className="font-medium">Tipo:</span> {flightDetails.seatConfig.aircraftType || 'No especificado'}</p>
            <p><span className="font-medium">Modelo:</span> {flightDetails.seatConfig.aircraftModel || 'No especificado'}</p>
            <p>
              <span className="font-medium">Filas:</span> {flightDetails.seatConfig.rows ? flightDetails.seatConfig.rows.length : 0}
            </p>
            <p>
              <span className="font-medium">Asientos por fila:</span> {
                flightDetails.seatConfig.rows && flightDetails.seatConfig.rows.length > 0 
                  ? flightDetails.seatConfig.rows[0].seats.filter(s => s.type === 'seat').length 
                  : 0
              }
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
          disabled={!flightDetails.seatConfig}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default AircraftTab;