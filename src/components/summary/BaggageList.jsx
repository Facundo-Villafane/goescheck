// src/components/summary/BaggageList.jsx
import React from 'react';
import { FaSuitcase } from 'react-icons/fa';

/**
 * Componente que muestra la lista de equipajes
 */
const BaggageList = ({ passengers, forwardRef }) => {
  // Filtrar pasajeros que tienen equipaje
  const passengersWithBaggage = passengers.filter(
    p => p.baggage && p.baggage.pieces && p.baggage.pieces.length > 0
  );
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 print:shadow-none print:border page-break-before" ref={forwardRef}>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaSuitcase className="mr-2" /> Checked Bags List
      </h2>
      
      {passengersWithBaggage.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Pax</th>
                <th className="border p-2 text-left">Seat</th>
                <th className="border p-2 text-left">Bag Tag</th>
                <th className="border p-2 text-left">Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {passengersWithBaggage.map(passenger => (
                passenger.baggage.pieces.map((piece, idx) => (
                  <tr key={`${passenger.id}-${idx}`} className="border-b">
                    <td className="border p-2">
                      {passenger.lastName}, {passenger.firstName}
                    </td>
                    <td className="border p-2">{passenger.seat || '-'}</td>
                    <td className="border p-2 font-mono">{piece.tag}</td>
                    <td className="border p-2">{piece.weight}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-4 text-gray-500">No checked bags</p>
      )}
    </div>
  );
};

export default BaggageList;