// src/components/flights/FlightGroup.jsx
import { useState } from 'react';
import { FaPlane, FaEdit, FaTrash, FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FlightGroup = ({ 
  date, 
  flights, 
  isAdmin, 
  userRole, // Nuevo prop para el rol de usuario
  activeFlightId, 
  confirmDelete, 
  onLoad, 
  onDelete, 
  onOpenMvt 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Formatear hora en formato de 24 horas
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="bg-gray-100 p-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-lg">{date}</h3>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="divide-y divide-gray-200">
          {flights.map(flight => (
            <div key={flight.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center">
                    <FaPlane className={`mr-2 ${activeFlightId === flight.id ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className="font-medium text-lg">{flight.flightNumber}</span>
                    {activeFlightId === flight.id && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                        <FaCheck className="mr-1" /> Activo
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {flight.origin} → {flight.destination}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    STD: {formatTime(flight.std)} {flight.aircraft && `• ${flight.aircraft}`}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onLoad(flight.id)}
                    className="px-3 py-1 bg-sand hover:bg-amber-600 text-white rounded flex items-center"
                    title={isAdmin && (userRole === 'admin' || userRole === 'supervisor') ? "Editar vuelo" : "Ir a check-in"}
                  >
                    <FaEdit className="mr-1" /> {isAdmin && (userRole === 'admin' || userRole === 'supervisor') ? "Editar" : "Check-in"}
                  </button>
                  
                  {/* Mostrar botón MVT solo para admin/supervisor en modo admin */}
                  {isAdmin && (userRole === 'admin' || userRole === 'supervisor') && !flight.departed && (
                    <button
                      onClick={() => onOpenMvt(flight.id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
                      title="Registrar despegue (MVT)"
                    >
                      <FaPlane className="mr-1" /> MVT
                    </button>
                  )}
                  
                  {/* Mostrar botón de eliminar solo para admins */}
                  {isAdmin && userRole === 'admin' && (
                    <button
                      onClick={() => onDelete(flight.id)}
                      className={`px-3 py-1 ${confirmDelete === flight.id ? 'bg-red-600' : 'bg-gray-600'} hover:bg-red-700 text-white rounded flex items-center`}
                      title="Eliminar vuelo"
                    >
                      <FaTrash className="mr-1" /> {confirmDelete === flight.id ? 'Confirmar' : 'Eliminar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightGroup;