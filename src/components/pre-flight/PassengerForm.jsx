// src/components/pre-flight/PassengerForm.jsx
import React, { useState } from 'react';
import { usePassengersContext } from '../../contexts/PassengersContext';

const PassengerForm = ({ flightId, onAdd }) => {
  const { addPassengersFromExcel } = usePassengersContext();
  
  const [newPassenger, setNewPassenger] = useState({
    firstName: '',
    lastName: '',
    documentType: 'DNI',
    documentNumber: '',
    ticket: '',
    checkedIn: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPassenger({
      ...newPassenger,
      [name]: value
    });
  };

  const addPassenger = () => {
    // Verificar si hay un vuelo activo
    if (!flightId) {
      alert('Por favor, guarda primero la información del vuelo.');
      return;
    }
    
    // Validación básica
    if (!newPassenger.firstName || !newPassenger.lastName || !newPassenger.documentNumber) {
      alert('Por favor completa los campos obligatorios');
      return;
    }
    
    // Generar un ID único
    const id = `passenger-manual-${Date.now()}`;
    
    const passengerToAdd = {
      ...newPassenger,
      id,
      checkedIn: false,
      flightId: flightId
    };
    
    // Usar la función del contexto para añadir el pasajero
    addPassengersFromExcel([passengerToAdd]);
    
    // Limpiar el formulario
    setNewPassenger({
      firstName: '',
      lastName: '',
      documentType: 'DNI',
      documentNumber: '',
      ticket: '',
      checkedIn: false
    });
    
    if (onAdd) onAdd();
    
    // Mostrar mensaje de éxito
    alert('Pasajero añadido correctamente');
  };

  return (
    <div className="border border-gray-200 rounded-md p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">Añadir Nuevo Pasajero</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="firstName"
            value={newPassenger.firstName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido *
          </label>
          <input
            type="text"
            name="lastName"
            value={newPassenger.lastName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento
          </label>
          <select
            name="documentType"
            value={newPassenger.documentType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="DNI">DNI</option>
            <option value="PASSPORT">Pasaporte</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento *
          </label>
          <input
            type="text"
            name="documentNumber"
            value={newPassenger.documentNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Ticket
          </label>
          <input
            type="text"
            name="ticket"
            value={newPassenger.ticket}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <button
          type="button"
          onClick={addPassenger}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Agregar Pasajero
        </button>
      </div>
    </div>
  );
};

export default PassengerForm;