// src/pages/BoardingPage.jsx
import { useState, useEffect } from 'react';
import { useFlightContext } from '../contexts/FlightContext';
import { usePassengersContext } from '../contexts/PassengersContext';
import BoardingSeatMap from '../components/boarding/BoardingSeatMap';
import BoardingPassengerList from '../components/boarding/BoardingPassengerList';
import BoardingStats from '../components/boarding/BoardingStats';
import BoardingScanner from '../components/boarding/BoardingScanner';
import { FaPlane, FaUserCheck, FaSpinner, FaSync } from 'react-icons/fa';
import { FiWifi, FiWifiOff } from "react-icons/fi";
import { calculateBoardingStats } from '../utils/boardingStats';

const BoardingPage = () => {
  const { flightDetails, activeFlightId } = useFlightContext();
  const { 
    checkedInPassengers, 
    isOnline,
    // Asegurarse de importar estas funciones del contexto
    boardPassenger,
    unboardPassenger,
    syncBoardingData
  } = usePassengersContext();
  
  // Estados para la página de embarque
  const [boardedPassengers, setBoardedPassengers] = useState([]);
  const [pendingPassengers, setPendingPassengers] = useState([]);
  const [scanMode, setScanMode] = useState('scanner');
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Calculate stats for the header
  const boardingStats = calculateBoardingStats(activeFlightId, boardedPassengers, pendingPassengers);
  
  // Efecto para inicializar la lista de pasajeros pendientes de embarcar
  // Cargar pasajeros embarcados desde Firebase y/o localStorage
  useEffect(() => {
    if (activeFlightId && checkedInPassengers.length > 0) {
      setLoading(true);
      
      // Filtrar pasajeros con check-in para este vuelo
      const flightPassengers = checkedInPassengers.filter(
        p => p.flightId === activeFlightId && p.checkedIn
      );
      
      // Primero intentar obtener datos desde Firebase
      const loadBoardingData = async () => {
        try {
          // Filtrar pasajeros ya embarcados (dato viene de Firebase)
          const boardedFromFirebase = flightPassengers.filter(p => p.boarded === true);
          
          if (boardedFromFirebase.length > 0) {
            console.log(`Cargados ${boardedFromFirebase.length} pasajeros embarcados desde Firebase`);
            setBoardedPassengers(boardedFromFirebase);
            setPendingPassengers(flightPassengers.filter(p => !p.boarded));
            
            // Guardar en localStorage para acceso offline
            saveToLocalStorage(boardedFromFirebase);
            
            // Actualizar estadísticas
            updateStatistics(flightPassengers, boardedFromFirebase.map(p => p.id));
            setLastSyncTime(new Date());
            setLoading(false);
            return;
          }
          
          // Si no hay datos en Firebase, intentar cargar desde localStorage
          loadFromLocalStorage(flightPassengers);
        } catch (error) {
          console.error('Error cargando datos de embarque:', error);
          loadFromLocalStorage(flightPassengers);
        }
      };
      
      loadBoardingData();
    }
  }, [activeFlightId, checkedInPassengers]);

  // Función para guardar en localStorage
  const saveToLocalStorage = (boardedList) => {
    const boardedIds = boardedList.map(p => p.id);
    localStorage.setItem(`boarding_${activeFlightId}`, JSON.stringify({
      boardedIds,
      boardedPassengers: boardedList,
      lastUpdated: new Date().toISOString()
    }));
  };
  
  // Función para cargar desde localStorage
  const loadFromLocalStorage = (flightPassengers) => {
    try {
      // Intentar cargar desde localStorage
      const savedBoardingData = localStorage.getItem(`boarding_${activeFlightId}`);
      let boardedIds = [];
      let boardedList = [];
      
      if (savedBoardingData) {
        const data = JSON.parse(savedBoardingData);
        boardedIds = data.boardedIds || [];
        
        // Reconstruir la lista de embarcados usando los IDs guardados
        boardedList = flightPassengers.filter(p => boardedIds.includes(p.id));
        
        // Asegurarse de que tengan la propiedad boardedAt
        if (data.boardedPassengers) {
          boardedList = boardedList.map(passenger => {
            const storedPassenger = data.boardedPassengers.find(p => p.id === passenger.id);
            return {
              ...passenger,
              boardedAt: storedPassenger ? storedPassenger.boardedAt : new Date().toISOString()
            };
          });
        }
        
        setBoardedPassengers(boardedList);
      } else {
        setBoardedPassengers([]);
        boardedList = [];
      }
      
      // Determinar pasajeros pendientes
      const pending = flightPassengers.filter(p => !boardedIds.includes(p.id));
      setPendingPassengers(pending);
      
      // Actualizar estadísticas
      updateStatistics(flightPassengers, boardedIds);
      
    } catch (error) {
      console.error('Error cargando datos desde localStorage:', error);
      setBoardedPassengers([]);
      setPendingPassengers(flightPassengers);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  // Función para marcar un pasajero como embarcado (MODIFICADA)
 // Modificar la función handleBoardPassenger para sincronizar en tiempo real
const handleBoardPassenger = async (passenger) => {
  // Verificar si ya está embarcado
  if (boardedPassengers.some(p => p.id === passenger.id)) {
    alert(`El pasajero ${passenger.lastName}, ${passenger.firstName} ya ha sido embarcado.`);
    return;
  }
  
  try {
    // Usar la función del contexto para sincronizar con Firebase
    const boardedPassenger = await boardPassenger(passenger);
    
    if (!boardedPassenger) {
      console.error("Error al embarcar pasajero");
      return;
    }
    
    // Actualizar estados locales
    const newBoardedList = [...boardedPassengers, boardedPassenger];
    setBoardedPassengers(newBoardedList);
    setPendingPassengers(pendingPassengers.filter(p => p.id !== passenger.id));
    setLastBoardedPassenger(boardedPassenger);
    
    // Guardar en localStorage (como respaldo)
    saveToLocalStorage(newBoardedList);
    
    // Actualizar estadísticas
    const boardedIds = newBoardedList.map(p => p.id);
    const allPassengers = [...newBoardedList, ...pendingPassengers.filter(p => p.id !== passenger.id)];
    updateStatistics(allPassengers, boardedIds);
    
    // Si estamos online, actualizamos que hemos sincronizado
    if (isOnline) {
      setLastSyncTime(new Date());
    } 
    // Si no estamos online, mostrar notificación
    else {
      // Opcionalmente, notificar que el pasajero fue embarcado offline
      console.log("Pasajero embarcado en modo offline. Se sincronizará cuando haya conexión.");
    }
    
  } catch (error) {
    console.error('Error al embarcar pasajero:', error);
    alert('Ocurrió un error al embarcar al pasajero. Intente nuevamente.');
  }
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
  
  // Modificar la función handleUndoBoarding para sincronizar en tiempo real
const handleUndoBoarding = async (passenger) => {
  if (window.confirm(`¿Está seguro de revertir el embarque de ${passenger.lastName}, ${passenger.firstName}?`)) {
    try {
      // Usar la nueva función del contexto
      const updatedPassenger = await unboardPassenger(passenger);
      
      if (!updatedPassenger) {
        console.error("Error al desembarcar pasajero");
        return;
      }
      
      // Actualizar estados locales
      const newBoardedList = boardedPassengers.filter(p => p.id !== passenger.id);
      setBoardedPassengers(newBoardedList);
      setPendingPassengers([...pendingPassengers, passenger]);
      
      // Guardar en localStorage
      saveToLocalStorage(newBoardedList);
      
      // Actualizar estadísticas
      const boardedIds = newBoardedList.map(p => p.id);
      const allPassengers = [...newBoardedList, ...pendingPassengers, passenger];
      updateStatistics(allPassengers, boardedIds);
      
      setLastBoardedPassenger(null);
      
      // Si estamos online, actualizamos que hemos sincronizado
      if (isOnline) {
        setLastSyncTime(new Date());
      }
      
    } catch (error) {
      console.error('Error al desembarcar pasajero:', error);
      alert('Ocurrió un error al desembarcar al pasajero. Intente nuevamente.');
    }
  }
};
  
  

  // Nueva función para sincronizar manualmente con Firebase
  const handleManualSync = async () => {
    if (!isOnline) {
      alert('No hay conexión a internet. La sincronización no es posible en este momento.');
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const success = await syncBoardingData();
      
      if (success) {
        setLastSyncTime(new Date());
        alert('Datos de embarque sincronizados correctamente con el servidor.');
      } else {
        alert('Hubo un problema al sincronizar los datos. Intente nuevamente.');
      }
    } catch (error) {
      console.error('Error en sincronización manual:', error);
      alert('Error en la sincronización: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Función para sincronizar cuando recuperamos la conexión
    const handleOnlineStatus = async () => {
      if (navigator.onLine && activeFlightId) {
        console.log("Conexión recuperada, sincronizando datos de embarque...");
        setIsSyncing(true);
        
        try {
          await syncBoardingData();
          setLastSyncTime(new Date());
          console.log("Sincronización automática completada");
        } catch (error) {
          console.error("Error en sincronización automática:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    
    // Añadir listeners para detectar cambios en la conexión
    window.addEventListener('online', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
    };
  }, [activeFlightId, syncBoardingData]);
  
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
            {/* Botón de sincronización y estado */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs flex items-center">
                {isOnline ? 
                  <FiWifi className="text-green-500 mr-1" /> : 
                  <FiWifiOff className="text-red-500 mr-1" />
                }
                {lastSyncTime ? 
                  `Última sincronización: ${new Date(lastSyncTime).toLocaleTimeString()}` : 
                  'Sin sincronizar'
                }
              </span>
              <button
                onClick={handleManualSync}
                disabled={!isOnline || isSyncing}
                className={`flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm ${
                  (!isOnline || isSyncing) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSyncing ? 
                  <FaSpinner className="animate-spin mr-1" /> : 
                  <FaSync className="mr-1" />
                }
                Sincronizar
              </button>
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