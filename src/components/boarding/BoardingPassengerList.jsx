// src/components/boarding/BoardingPassengerList.jsx
import React, { useState } from 'react';
import { FaSearch, FaUserCheck, FaUndo, FaFilter, FaSort, FaSortAlphaDown, FaSortAlphaUp, FaSuitcase } from 'react-icons/fa';

const BoardingPassengerList = ({ boardedPassengers, pendingPassengers, onBoardPassenger, onUndoBoarding }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'boarded', 'pending'
  const [sortMode, setSortMode] = useState('lastName'); // 'lastName', 'firstName', 'seat', 'boardingTime'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'
  const [baggageFilter, setBaggageFilter] = useState('all'); // 'all', 'with', 'without'
  
  // All passengers
  const allPassengers = [...boardedPassengers, ...pendingPassengers];
  
  // Filter passengers
  const getFilteredPassengers = () => {
    return allPassengers
      .filter(passenger => {
        // Filter by search term
        if (searchTerm) {
          const fullName = `${passenger.firstName} ${passenger.lastName}`.toLowerCase();
          const lastNameFirst = `${passenger.lastName} ${passenger.firstName}`.toLowerCase();
          const seatNumber = passenger.seat ? passenger.seat.toLowerCase() : '';
          const docNumber = passenger.documentNumber ? passenger.documentNumber.toString().toLowerCase() : '';
          
          const searchLower = searchTerm.toLowerCase();
          if (!fullName.includes(searchLower) && 
              !lastNameFirst.includes(searchLower) && 
              !seatNumber.includes(searchLower) && 
              !docNumber.includes(searchLower)) {
            return false;
          }
        }
        
        // Filter by boarding status
        if (filterMode === 'boarded') {
          if (!boardedPassengers.some(p => p.id === passenger.id)) return false;
        } else if (filterMode === 'pending') {
          if (!pendingPassengers.some(p => p.id === passenger.id)) return false;
        }
        
        // Filter by baggage
        if (baggageFilter === 'with') {
          // Check if passenger has baggage (pieces > 0 or weight > 0)
          const hasBaggage = passenger.baggage && 
            ((passenger.baggage.pieces && passenger.baggage.pieces.length > 0) || 
             (passenger.baggage.count > 0) || 
             (passenger.baggage.weight > 0));
          if (!hasBaggage) return false;
        } else if (baggageFilter === 'without') {
          // Check if passenger has no baggage
          const hasBaggage = passenger.baggage && 
            ((passenger.baggage.pieces && passenger.baggage.pieces.length > 0) || 
             (passenger.baggage.count > 0) || 
             (passenger.baggage.weight > 0));
          if (hasBaggage) return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by selected field
        let valueA, valueB;
        
        switch (sortMode) {
          case 'lastName':
            valueA = a.lastName || '';
            valueB = b.lastName || '';
            break;
          case 'firstName':
            valueA = a.firstName || '';
            valueB = b.firstName || '';
            break;
          case 'seat':
            valueA = a.seat || '';
            valueB = b.seat || '';
            break;
          case 'boardingTime':
            valueA = a.boardedAt || '0';
            valueB = b.boardedAt || '0';
            // For pending passengers, put them at the end
            if (!a.boardedAt) return 1;
            if (!b.boardedAt) return -1;
            break;
          default:
            valueA = a.lastName || '';
            valueB = b.lastName || '';
        }
        
        // Direction
        const direction = sortDirection === 'asc' ? 1 : -1;
        return valueA.localeCompare(valueB) * direction;
      });
  };
  
  const filteredPassengers = getFilteredPassengers();
  
  // Toggle sort direction
  const handleSort = (field) => {
    if (sortMode === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMode(field);
      setSortDirection('asc');
    }
  };
  
  const formatBoardingTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getSortIcon = (field) => {
    if (sortMode !== field) return <FaSort className="ml-1" />;
    return sortDirection === 'asc' ? <FaSortAlphaDown className="ml-1 text-blue-600" /> : <FaSortAlphaUp className="ml-1 text-blue-600" />;
  };
  
  // Get baggage info for a passenger
  const getBaggageInfo = (passenger) => {
    if (!passenger.baggage) return null;
    
    let pieces = 0;
    let weight = 0;
    
    if (passenger.baggage.pieces && Array.isArray(passenger.baggage.pieces)) {
      pieces = passenger.baggage.pieces.length;
      weight = passenger.baggage.pieces.reduce((sum, piece) => sum + (piece.weight || 0), 0);
    } else {
      pieces = passenger.baggage.count || 0;
      weight = passenger.baggage.weight || 0;
    }
    
    if (pieces === 0 && weight === 0) return null;
    
    return { pieces, weight };
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="font-semibold text-lg mb-3">Lista de Pasajeros</h2>
      
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar pasajero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-10 py-2 border border-gray-300 rounded"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded bg-white"
          >
            <option value="all">Todos</option>
            <option value="boarded">Embarcados</option>
            <option value="pending">Pendientes</option>
          </select>
          
          <select
            value={baggageFilter}
            onChange={(e) => setBaggageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded bg-white"
          >
            <option value="all">Todos los equipajes</option>
            <option value="with">Con equipaje</option>
            <option value="without">Sin equipaje</option>
          </select>
          
          <select
            value={sortMode}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded bg-white"
          >
            <option value="lastName">Apellido</option>
            <option value="firstName">Nombre</option>
            <option value="seat">Asiento</option>
            <option value="boardingTime">Hora de Embarque</option>
          </select>
        </div>
      </div>
      
      {/* Stats summary */}
      <div className="mb-4 grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-md text-center text-sm">
        <div>
          <span className="font-medium">Total: </span>
          <span>{allPassengers.length}</span>
        </div>
        <div>
          <span className="font-medium">Embarcados: </span>
          <span className="text-green-600">{boardedPassengers.length}</span>
        </div>
        <div>
          <span className="font-medium">Pendientes: </span>
          <span className="text-orange-600">{pendingPassengers.length}</span>
        </div>
      </div>
      
      {/* Passenger List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left border-b">
                <button 
                  className="flex items-center font-medium"
                  onClick={() => handleSort('lastName')}
                >
                  Apellido {getSortIcon('lastName')}
                </button>
              </th>
              <th className="py-2 px-3 text-left border-b">
                <button 
                  className="flex items-center font-medium"
                  onClick={() => handleSort('firstName')}
                >
                  Nombre {getSortIcon('firstName')}
                </button>
              </th>
              <th className="py-2 px-3 text-left border-b">
                <button 
                  className="flex items-center font-medium"
                  onClick={() => handleSort('seat')}
                >
                  Asiento {getSortIcon('seat')}
                </button>
              </th>
              <th className="py-2 px-3 text-center border-b">Equipaje</th>
              <th className="py-2 px-3 text-center border-b">
                <button 
                  className="flex items-center font-medium"
                  onClick={() => handleSort('boardingTime')}
                >
                  Estado {getSortIcon('boardingTime')}
                </button>
              </th>
              <th className="py-2 px-3 text-right border-b">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredPassengers.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
                  No se encontraron pasajeros
                </td>
              </tr>
            ) : (
              filteredPassengers.map(passenger => {
                const isBoarded = boardedPassengers.some(p => p.id === passenger.id);
                const baggageInfo = getBaggageInfo(passenger);
                
                return (
                  <tr key={passenger.id} className={`hover:bg-gray-50 ${isBoarded ? 'bg-green-50' : ''}`}>
                    <td className="py-2 px-3 border-b">{passenger.lastName}</td>
                    <td className="py-2 px-3 border-b">{passenger.firstName}</td>
                    <td className="py-2 px-3 border-b">{passenger.seat || '-'}</td>
                    <td className="py-2 px-3 border-b text-center">
                      {baggageInfo ? (
                        <div className="flex items-center justify-center">
                          <FaSuitcase className="text-blue-600 mr-1" />
                          <span className="text-sm">{baggageInfo.pieces} pcs ({baggageInfo.weight} kg)</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin equipaje</span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-b text-center">
                      {isBoarded ? (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaUserCheck className="mr-1" /> Embarcado
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {formatBoardingTime(passenger.boardedAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-b text-right">
                      {isBoarded ? (
                        <button
                          onClick={() => onUndoBoarding(passenger)}
                          className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
                          title="Deshacer embarque"
                        >
                          <FaUndo />
                        </button>
                      ) : (
                        <button
                          onClick={() => onBoardPassenger(passenger)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Embarcar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BoardingPassengerList;