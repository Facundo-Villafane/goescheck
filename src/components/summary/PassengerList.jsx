// src/components/summary/PassengerList.jsx
import React from 'react';
import { FaUsers } from 'react-icons/fa';

/**
 * Componente que muestra la lista completa de pasajeros
 */
const PassengerList = ({ passengers, forwardRef }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border page-break-before" ref={forwardRef}>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FaUsers className="mr-2" /> Passenger List
      </h2>
      
      {passengers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Last name, First name</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Seat</th>
                <th className="border p-2 text-left">Bag</th>
              </tr>
            </thead>
            <tbody>
              {passengers.map(passenger => (
                <tr key={passenger.id} className="border-b">
                  <td className="border p-2 uppercase">
                    {passenger.lastName}/{passenger.firstName}
                  </td>
                  <td className="border p-2">
                    {passenger.passengerType || 'ADT'}
                    {passenger.passengerType === 'ADT' && ` (${passenger.gender || 'M'})`}
                  </td>
                  <td className="border p-2">
                    {passenger.documentNumber}
                  </td>
                  <td className="border p-2">{passenger.seat || '-'}</td>
                  <td className="border p-2">
                    {passenger.baggage && passenger.baggage.pieces 
                      ? `${passenger.baggage.pieces.length} (${passenger.baggage.weight} kg)`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-4 text-gray-500">There are no passengers with check-in</p>
      )}
    </div>
  );
};

export default PassengerList;