// src/components/summary/BoardedPassengerList.jsx 
import React from 'react';
import { FaPlane } from 'react-icons/fa';

/**
 * Componente que muestra la lista de pasajeros embarcados
 */
const BoardedPassengerList = ({ passengers, showBoardingTime = true }) => {
  // Ordenar pasajeros por hora de embarque (más reciente primero)
  const sortedPassengers = [...passengers].sort((a, b) => {
    if (!a.boardedAt) return 1;
    if (!b.boardedAt) return -1;
    return new Date(b.boardedAt) - new Date(a.boardedAt);
  });

  return (
    <>
      {sortedPassengers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Last name, First name</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Seat</th>
                <th className="border p-2 text-left">Bag</th>
                {showBoardingTime && (
                  <th className="border p-2 text-left">Boarding Time</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedPassengers.map(passenger => (
                <tr key={passenger.id} className="border-b hover:bg-green-50">
                  <td className="border p-2 uppercase font-medium">
                    {passenger.lastName}/{passenger.firstName}
                  </td>
                  <td className="border p-2">
                    {passenger.passengerType || 'ADT'}
                    {passenger.passengerType === 'ADT' && ` (${passenger.gender || 'M'})`}
                  </td>
                  <td className="border p-2">
                    {passenger.documentType || 'ID'}: {passenger.documentNumber}
                  </td>
                  <td className="border p-2 font-medium">{passenger.seat || '-'}</td>
                  <td className="border p-2">
                    {passenger.baggage && passenger.baggage.pieces && passenger.baggage.pieces.length > 0
                      ? `${passenger.baggage.pieces.length} (${
                          passenger.baggage.weight || 
                          passenger.baggage.pieces.reduce((sum, p) => sum + (p.weight || 0), 0)
                        } kg)`
                      : '-'}
                  </td>
                  {showBoardingTime && (
                    <td className="border p-2">
                      <div className="flex items-center text-green-700">
                        <FaPlane className="mr-1" />
                        {passenger.boardedAt 
                          ? new Date(passenger.boardedAt).toLocaleTimeString([], {
                              hour: '2-digit', 
                              minute: '2-digit'
                            })
                          : 'Embarcado'}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-4 text-gray-500">No hay pasajeros embarcados</p>
      )}
    </>
  );
};

export default BoardedPassengerList;