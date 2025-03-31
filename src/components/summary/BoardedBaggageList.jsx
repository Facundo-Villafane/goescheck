// src/components/summary/BoardedBaggageList.jsx
import React from 'react';
import { FaSuitcase, FaPlane } from 'react-icons/fa';

/**
 * Componente que muestra la lista de equipajes de pasajeros embarcados
 */
const BoardedBaggageList = ({ passengers, forwardRef }) => {
  // Filtrar pasajeros que tienen equipaje
  const passengersWithBaggage = passengers.filter(
    p => p.baggage && p.baggage.pieces && p.baggage.pieces.length > 0
  );
  
  // Calcular estadísticas de equipaje
  const totalPieces = passengersWithBaggage.reduce(
    (sum, p) => sum + p.baggage.pieces.length, 0
  );
  
  const totalWeight = passengersWithBaggage.reduce(
    (sum, p) => sum + (p.baggage.weight || 
                      p.baggage.pieces.reduce((s, piece) => s + (piece.weight || 0), 0)),
    0
  );
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 print:shadow-none print:border page-break-before" ref={forwardRef}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FaSuitcase className="mr-2" /> Boarded Passengers Baggage
        </h2>
        
        <div className="text-sm bg-blue-50 p-2 rounded-md">
          <span className="font-medium">Total: </span>
          <span>{totalPieces} piezas / {totalWeight.toFixed(1)} kg</span>
        </div>
      </div>
      
      {passengersWithBaggage.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Passenger</th>
                <th className="border p-2 text-left">Seat</th>
                <th className="border p-2 text-left">Bag Tag</th>
                <th className="border p-2 text-left">Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {passengersWithBaggage.map(passenger => (
                passenger.baggage.pieces.map((piece, idx) => (
                  <tr key={`${passenger.id}-${idx}`} className="border-b hover:bg-blue-50">
                    <td className="border p-2">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{passenger.lastName}, {passenger.firstName}</div>
                          <div className="text-xs text-gray-500">
                            {passenger.documentType}: {passenger.documentNumber}
                          </div>
                        </div>
                        <FaPlane className="ml-2 text-green-600" title="Pasajero embarcado" />
                      </div>
                    </td>
                    <td className="border p-2 font-medium">{passenger.seat || '-'}</td>
                    <td className="border p-2 font-mono text-sm">{piece.tag || `TAG-${idx+1}`}</td>
                    <td className="border p-2">{piece.weight || '-'} kg</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-4 text-gray-500">No hay equipaje registrado para pasajeros embarcados</p>
      )}
      
      {/* Resumen de equipaje */}
      {passengersWithBaggage.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm font-medium">Pasajeros con equipaje</div>
            <div className="text-lg">{passengersWithBaggage.length} / {passengers.length}</div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm font-medium">Piezas totales</div>
            <div className="text-lg">{totalPieces}</div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm font-medium">Peso promedio por pieza</div>
            <div className="text-lg">
              {totalPieces > 0 ? (totalWeight / totalPieces).toFixed(1) : 0} kg
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardedBaggageList;