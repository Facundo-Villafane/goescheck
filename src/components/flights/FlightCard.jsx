// src/components/flights/FlightCard.jsx
import { FaPlane, FaEdit, FaTrash, FaCheck, FaUserFriends } from 'react-icons/fa';

const FlightCard = ({ 
  flight, 
  isAdmin, 
  isActive, 
  isConfirmDelete,
  onLoad,
  onDelete,
  onOpenMvt
}) => {
  return (
    <div 
      className={`p-4 hover:bg-gray-200 flex items-center justify-between ${
        isActive ? 'bg-gray-50 bg-opacity-10' : ''
      }`}
    >
      <div 
        className="flex-grow cursor-pointer" 
        onClick={() => onLoad(flight.id)}
      >
        <div className="flex items-center">
          <FaPlane className="mr-2 text-sand" />
          <span className="font-bold">
            {flight.flightNumber}
          </span>
          {isActive && (
            <span className="ml-2 bg-sand text-white text-xs px-2 py-0.5 rounded-full">
              Activo
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-600 ml-6">
          {flight.origin && flight.destination ? (
            <span>{flight.origin} → {flight.destination}</span>
          ) : (
            <span>Ruta no especificada</span>
          )}
          {flight.std && (
            <span className="ml-3">STD: {flight.std}</span>
          )}
        </div>
        
        <div className="text-xs text-gray-500 ml-6 mt-1">
          {flight.aircraft || 'Aeronave no especificada'}
          
          {flight.passengerCount !== undefined && (
            <span className="ml-3 flex items-center">
              <FaUserFriends className="mr-1" />
              {flight.passengerCount} pasajeros
            </span>
          )}
        </div>
      </div>
      
      {/* Botones de acción para cada vuelo */}
      <div className="flex space-x-2">
        <button
          onClick={() => onLoad(flight.id)}
          className="bg-sand text-white p-2 rounded hover:bg-noche"
          title={isActive ? "Vuelo activo" : "Seleccionar vuelo"}
        >
          {isActive ? <FaCheck /> : isAdmin ? <FaEdit /> : <FaCheck />}
        </button>
      
        {/* Solo mostrar botones admin en modo admin */}
        {isAdmin && (
          <>
            {/* Botón de Departed */}
            <button
              onClick={() => onOpenMvt(flight.id)}
              className={`p-2 rounded ${
                flight.departed 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={flight.departed ? "Editar MVT" : "Marcar como Departed"}
            >
              <FaPlane className="transform rotate-315" />
            </button>
          
            {/* Botón de eliminar */}
            <button
              onClick={() => onDelete(flight.id)}
              className={`p-2 rounded ${
                isConfirmDelete 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={isConfirmDelete ? 'Confirmar eliminación' : 'Eliminar vuelo'}
            >
              <FaTrash />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FlightCard;