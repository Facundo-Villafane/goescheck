// src/pages/BoardingPage.jsx
import { useState, useEffect } from 'react';
import { useFlightContext } from '../contexts/FlightContext';
import { usePassengersContext } from '../contexts/PassengersContext';
import BoardingSeatMap from '../components/boarding/BoardingSeatMap';
import BoardingPassengerList from '../components/boarding/BoardingPassengerList';
import BoardingStats from '../components/boarding/BoardingStats';
import BoardingScanner from '../components/boarding/BoardingScanner';
import { FaPlane, FaUserCheck, FaSpinner } from 'react-icons/fa';
import { calculateBoardingStats } from '../utils/boardingStats';

const BoardingPage = () => {
  const { flightDetails, activeFlightId } = useFlightContext();
  const { checkedInPassengers } = usePassengersContext();
  
  // Estados para la página de embarque
  const [boardedPassengers, setBoardedPassengers] = useState([]);
  const [pendingPassengers, setPendingPassengers] = useState([]);
  const [scanMode, setScanMode] = useState('scanner'); // 'scanner' o 'manual'
  const [statistics, setStatistics] = useState({
    total: 0,
    boarded: 0,
    pending: 0,
    adults: { total: 0, male: 0, female: 0, boarded: 0 },
    children: { total: 0, boarded: 0 },
    infants: { total: 0, boarded: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [lastBoardedPassenger, setLastBoardedPassenger] = useState(null);
  
  // Calculate stats for the header
  const boardingStats = calculateBoardingStats(activeFlightId, boardedPassengers, pendingPassengers);
  
  // Efecto para inicializar la lista de pasajeros pendientes de embarcar
  useEffect(() => {
    if (activeFlightId && checkedInPassengers.length > 0) {
      setLoading(true);
      
      // Filtrar solo pasajeros con check-in para este vuelo
      const flightPassengers = checkedInPassengers.filter(
        p => p.flightId === activeFlightId && p.checkedIn
      );
      
      // Cargar datos de embarque desde localStorage si existen
      const savedBoardingData = localStorage.getItem(`boarding_${activeFlightId}`);
      let boardedIds = [];
      
      if (savedBoardingData) {
        try {
          const data = JSON.parse(savedBoardingData);
          boardedIds = data.boardedIds || [];
          setBoardedPassengers(data.boardedPassengers || []);
        } catch (error) {
          console.error('Error loading boarding data from localStorage:', error);
          setBoardedPassengers([]);
        }
      } else {
        setBoardedPassengers([]);
      }
      
      // Determinar pasajeros pendientes
      const pending = flightPassengers.filter(p => !boardedIds.includes(p.id));
      setPendingPassengers(pending);
      
      // Actualizar estadísticas
      updateStatistics(flightPassengers, boardedIds);
      
      setLoading(false);
    }
  }, [activeFlightId, checkedInPassengers]);
  
  // Función para actualizar estadísticas
  const updateStatistics = (allPassengers, boardedIds) => {
    const stats = {
      total: allPassengers.length,
      boarded: boardedIds.length,
      pending: allPassengers.length - boardedIds.length,
      adults: { 
        total: 0, 
        male: 0, 
        female: 0, 
        boarded: 0 
      },
      children: { total: 0, boarded: 0 },
      infants: { total: 0, boarded: 0 }
    };
    
    // Contar por tipo de pasajero
    allPassengers.forEach(passenger => {
      const isBoarded = boardedIds.includes(passenger.id);
      
      if (passenger.passengerType === 'CHD') {
        stats.children.total++;
        if (isBoarded) stats.children.boarded++;
      } else if (passenger.passengerType === 'INF') {
        stats.infants.total++;
        if (isBoarded) stats.infants.boarded++;
      } else {
        // Es un adulto
        stats.adults.total++;
        if (passenger.gender === 'F') {
          stats.adults.female++;
        } else {
          stats.adults.male++;
        }
        if (isBoarded) stats.adults.boarded++;
      }
    });
    
    setStatistics(stats);
  };
  
  // Función para marcar un pasajero como embarcado
  const handleBoardPassenger = (passenger) => {
    // Verificar si ya está embarcado
    if (boardedPassengers.some(p => p.id === passenger.id)) {
      alert(`El pasajero ${passenger.lastName}, ${passenger.firstName} ya ha sido embarcado.`);
      return;
    }
    
    // Añadir a la lista de embarcados con timestamp
    const boardedPassenger = {
      ...passenger,
      boardedAt: new Date().toISOString()
    };
    
    // Actualizar estados
    const newBoardedList = [...boardedPassengers, boardedPassenger];
    setBoardedPassengers(newBoardedList);
    setPendingPassengers(pendingPassengers.filter(p => p.id !== passenger.id));
    setLastBoardedPassenger(boardedPassenger);
    
    // Actualizar localStorage
    const boardedIds = newBoardedList.map(p => p.id);
    localStorage.setItem(`boarding_${activeFlightId}`, JSON.stringify({
      boardedIds,
      boardedPassengers: newBoardedList,
      lastUpdated: new Date().toISOString()
    }));
    
    // Actualizar estadísticas
    const allPassengers = [...newBoardedList, ...pendingPassengers.filter(p => p.id !== passenger.id)];
    updateStatistics(allPassengers, boardedIds);
  };
  
  // Manejar resultado del scanner o entrada manual
  const handleScanResult = (scanData) => {
    try {
      let ticketNumber = '';
      let lastName = '';
      let firstName = '';
      let seatNumber = '';
      
      // Determine if we're using manual mode or scanner mode
      const isManualMode = scanMode === 'manual';
      
      if (isManualMode) {
        // For manual mode, just use the input as ticket number
        ticketNumber = scanData.trim();
        
        // Find passenger by exact ticket match only
        const matchedPassenger = pendingPassengers.find(passenger => {
          return String(passenger.ticket) === String(ticketNumber);
        });
        
        if (matchedPassenger) {
          handleBoardPassenger(matchedPassenger);
          return true;
        }
      } else {
        // For scanner mode, try to parse the full barcode data
        const matchResult = scanData.match(/([A-Z0-9]+)([A-Z]+)\/([A-Z]+)\s([A-Z0-9]+)\s([A-Z]+)([A-Z]+)\s([A-Z0-9]+)/);
        
        if (matchResult) {
          ticketNumber = matchResult[1];
          lastName = matchResult[2];
          firstName = matchResult[3];
          seatNumber = matchResult[7];
          
          // Find passenger matching all criteria
          const matchedPassenger = pendingPassengers.find(passenger => {
            return String(passenger.ticket) === String(ticketNumber) &&
                   passenger.lastName.toUpperCase().includes(lastName) && 
                   passenger.firstName.toUpperCase().includes(firstName) && 
                   passenger.seat === seatNumber;
          });
          
          if (matchedPassenger) {
            handleBoardPassenger(matchedPassenger);
            return true;
          }
        }
      }
      
      alert('No se encontró ningún pasajero pendiente de embarque con los datos proporcionados.');
      return false;
    } catch (error) {
      console.error('Error al procesar datos escaneados:', error);
      alert('Error al procesar el código escaneado. Intente nuevamente.');
      return false;
    }
  };
  
  // Revertir el embarque de un pasajero
  const handleUndoBoarding = (passenger) => {
    if (window.confirm(`¿Está seguro de revertir el embarque de ${passenger.lastName}, ${passenger.firstName}?`)) {
      // Remover de embarcados
      const newBoardedList = boardedPassengers.filter(p => p.id !== passenger.id);
      setBoardedPassengers(newBoardedList);
      
      // Añadir a pendientes
      setPendingPassengers([...pendingPassengers, passenger]);
      
      // Actualizar localStorage
      const boardedIds = newBoardedList.map(p => p.id);
      localStorage.setItem(`boarding_${activeFlightId}`, JSON.stringify({
        boardedIds,
        boardedPassengers: newBoardedList,
        lastUpdated: new Date().toISOString()
      }));
      
      // Actualizar estadísticas
      const allPassengers = [...newBoardedList, ...pendingPassengers, passenger];
      updateStatistics(allPassengers, boardedIds);
      
      setLastBoardedPassenger(null);
    }
  };
  
  // Reiniciar proceso de embarque
  const handleResetBoarding = () => {
    if (window.confirm('¿Está seguro de reiniciar todo el proceso de embarque? Esta acción no se puede deshacer.')) {
      // Reiniciar estados
      const allPassengers = [...boardedPassengers, ...pendingPassengers];
      setBoardedPassengers([]);
      setPendingPassengers(allPassengers);
      setLastBoardedPassenger(null);
      
      // Limpiar localStorage
      localStorage.removeItem(`boarding_${activeFlightId}`);
      
      // Actualizar estadísticas
      updateStatistics(allPassengers, []);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-sand" />
        <span className="ml-2 text-lg">Cargando datos de embarque...</span>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header - Información del vuelo */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Embarque: {flightDetails.flightNumber}</h1>
            <div className="text-gray-600">
              {flightDetails.origin} → {flightDetails.destination} • {formatDate(flightDetails.date)}
              {flightDetails.std && ` • STD: ${flightDetails.std}`}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-3xl font-bold text-sand">
              {boardingStats.boardingPercentage}%
            </div>
            <div className="text-gray-600">
              {boardingStats.boardedCount} / {boardingStats.totalCheckedIn} embarcados
            </div>
            {/* Uncomment if you want the reset button
            <button
              onClick={handleResetBoarding}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md"
            >
              Reiniciar Embarque
            </button>
            */}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Estadísticas y Scanner */}
        <div>
          {/* Estadísticas */}
          <BoardingStats statistics={statistics} />
          
          {/* Escáner y entrada manual */}
          <div className="mt-6">
            <BoardingScanner 
              onScanComplete={handleScanResult}
              scanMode={scanMode}
              setScanMode={setScanMode}
            />
          </div>
          
          {/* Último pasajero embarcado */}
          {lastBoardedPassenger && (
            <div className="mt-6 bg-green-50 border border-green-300 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2 flex items-center">
                <FaUserCheck className="mr-2" /> Último Pasajero Embarcado
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{lastBoardedPassenger.lastName}, {lastBoardedPassenger.firstName}</p>
                  <p className="text-sm text-gray-600">Asiento: {lastBoardedPassenger.seat}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(lastBoardedPassenger.boardedAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => handleUndoBoarding(lastBoardedPassenger)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Deshacer
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Columna central - Mapa de asientos */}
        <div className="lg:col-span-2">
          <BoardingSeatMap
            boardedPassengers={boardedPassengers}
            pendingPassengers={pendingPassengers}
            flightDetails={flightDetails}
          />
        </div>
      </div>
      
      {/* Lista de pasajeros (embarcados y pendientes) */}
      <div className="mt-6">
        <BoardingPassengerList
          boardedPassengers={boardedPassengers}
          pendingPassengers={pendingPassengers}
          onBoardPassenger={handleBoardPassenger}
          onUndoBoarding={handleUndoBoarding}
        />
      </div>
    </div>
  );
};

export default BoardingPage;