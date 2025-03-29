// src/components/pre-flight/PassengerList.jsx
import React from 'react';
import { usePassengersContext } from '../../contexts/PassengersContext';
import { FaTrash } from 'react-icons/fa';

const PassengerList = () => {
  const { passengerList, setPassengerList } = usePassengersContext();
  
  const handleRemovePassenger = (passengerId) => {
    const updatedList = passengerList.filter(p => p.id !== passengerId);
    setPassengerList(updatedList);
    
    try {
      localStorage.setItem('passengerList', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  };
  
  if (passengerList.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Lista de Pasajeros ({passengerList.length})</h3>
      
      <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-md">
        {passengerList.map((passenger) => (
          <div key={passenger.id} className="p-3 border-b border-gray-200 flex justify-between items-center">
            <div>
              <div className="font-medium">{passenger.lastName}, {passenger.firstName}</div>
              <div className="text-sm text-gray-600">
                {passenger.documentType || 'Doc'}: {passenger.documentNumber}
                {passenger.ticket && ` | Ticket: ${passenger.ticket}`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemovePassenger(passenger.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Eliminar pasajero"
            >
              <FaTrash className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('¿Estás seguro de que deseas eliminar todos los pasajeros?')) {
              setPassengerList([]);
              localStorage.removeItem('passengerList');
            }
          }}
          className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
        >
          Eliminar Todos
        </button>
        
        <span className="text-gray-600 text-sm pt-1">
          Total: {passengerList.length} pasajeros
        </span>
      </div>
    </div>
  );
};

export default PassengerList;