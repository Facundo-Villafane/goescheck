// src/components/summary/FlightInfoSection.jsx
import React from 'react';
import { FaPlane } from 'react-icons/fa';

/**
 * Componente que muestra la información principal del vuelo
 */
const FlightInfoSection = ({ flightDetails, forwardRef }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 print:shadow-none print:border" ref={forwardRef}>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaPlane className="mr-2" /> Flight Information
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-gray-600">Flight Number</p>
          <p className="font-medium">{flightDetails.flightNumber || 'No definido'}</p>
        </div>
        <div>
          <p className="text-gray-600">Aircraft</p>
          <p className="font-medium">{flightDetails.aircraft || 'No definido'}</p>
        </div>
        <div>
          <p className="text-gray-600">Date</p>
          <p className="font-medium">{flightDetails.date || 'No definido'}</p>
        </div>
        <div>
          <p className="text-gray-600">From</p>
          <p className="font-medium">{flightDetails.origin || 'No definido'}</p>
        </div>
        <div>
          <p className="text-gray-600">To</p>
          <p className="font-medium">{flightDetails.destination || 'No definido'}</p>
        </div>
      </div>
    </div>
  );
};

export default FlightInfoSection;