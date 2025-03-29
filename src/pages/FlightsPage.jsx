// src/pages/FlightsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFlightContext } from '../contexts/FlightContext';
import { usePassengersContext } from '../contexts/PassengersContext';
import { useAuth } from '../contexts/AuthContext'; // Importar el contexto de autenticación
import { FaPlane, FaEdit, FaTrash, FaCheck, FaUserFriends, FaSpinner, FaChevronDown, FaChevronUp, FaHistory, FaClock } from 'react-icons/fa';
import FlightCard from '../components/flights/FlightCard';
import FlightGroup from '../components/flights/FlightGroup';
import MvtFormModal from '../components/flights/MvtFormModal';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const FlightsPage = () => {
  const { 
    flightList, 
    loadFlight, 
    deleteFlight, 
    activeFlightId, 
    setActiveFlightId, 
    flightDetails, 
    setFlightDetails,
    setFlightList,
    isOnline, 
    loading 
  } = useFlightContext();
  
  const { setFlightId, checkedInPassengers } = usePassengersContext();
  const { userRole } = useAuth(); // Obtener el rol del usuario del contexto de autenticación
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMvtForm, setShowMvtForm] = useState(false);
  const [currentMvtFlightId, setCurrentMvtFlightId] = useState(null);
  const [showPastFlights, setShowPastFlights] = useState(false);
  const [mvtData, setMvtData] = useState({
    flightNumber: '',
    date: '',
    aircraft: '',
    crew: '',
    capacity: '',
    departureAirport: '',
    actualDeparture: '',
    airborne: '',
    estimatedArrival: '',
    arrivalAirport: '',
    passengers: {
      men: 0,
      women: 0,
      children: 0,
      infants: 0
    },
    baggage: {
      pieces: 0,
      weight: 0,
      position: ''
    },
    delay: '',
    remarks: ''
  });
  
  // Detectar si es modo admin y establecer según el rol o localStorage
  useEffect(() => {
    // Si el usuario es admin, establecer isAdmin por defecto
    if (userRole === 'admin') {
      const savedAdminMode = localStorage.getItem('adminMode');
      // Si hay un valor guardado, usar ese, de lo contrario true
      setIsAdmin(savedAdminMode === null ? true : savedAdminMode === 'true');
    } 
    // Si el usuario es supervisor, verificar localStorage, pero permitir cambio
    else if (userRole === 'supervisor') {
      const savedAdminMode = localStorage.getItem('adminMode');
      setIsAdmin(savedAdminMode === 'true');
    } 
    // Para otros roles, forzar a false y no permitir cambios
    else {
      setIsAdmin(false);
      localStorage.setItem('adminMode', 'false');
    }
  }, [userRole]);

  // Log de flightList cuando cambia
  useEffect(() => {
    console.log("flightList recibido:", flightList);
  }, [flightList]);

  // Función para guardar los datos del MVT
  const handleSaveMvt = async () => {
    if (!currentMvtFlightId) return;
    
    try {
      // Obtener el vuelo actual
      const flight = flightList.find(f => f.id === currentMvtFlightId);
      if (!flight) {
        console.error("No se encontró el vuelo para guardar MVT");
        return;
      }
      
      console.log("Guardando datos MVT para vuelo:", currentMvtFlightId);
      console.log("Datos a guardar:", mvtData);
      
      // Crear objeto actualizado del vuelo con todos los datos MVT
      const updatedFlight = {
        ...flight,
        departed: true, // Marcar como salido
        crew: mvtData.crew,
        capacity: mvtData.capacity,
        actualDeparture: mvtData.actualDeparture,
        airborne: mvtData.airborne,
        estimatedArrival: mvtData.estimatedArrival,
        passengers: {
          men: Number(mvtData.passengers.men) || 0,
          women: Number(mvtData.passengers.women) || 0,
          children: Number(mvtData.passengers.children) || 0,
          infants: Number(mvtData.passengers.infants) || 0
        },
        baggage: {
          pieces: Number(mvtData.baggage.pieces) || 0,
          weight: Number(mvtData.baggage.weight) || 0,
          position: mvtData.baggage.position || ''
        },
        delay: mvtData.delay || '',
        remarks: mvtData.remarks || '',
        mvtTimestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Guardar en Firebase si estamos online
      if (isOnline) {
        try {
          // Guardar en la colección de vuelos
          await setDoc(doc(db, 'flights', currentMvtFlightId), updatedFlight);
          console.log("Datos MVT guardados en Firebase");
        } catch (firebaseError) {
          console.error("Error guardando en Firebase:", firebaseError);
          alert("Error guardando en Firebase: " + firebaseError.message);
        }
      }
      
      // Actualizar el estado local de flightList
      setFlightList(prevList => 
        prevList.map(f => f.id === currentMvtFlightId ? updatedFlight : f)
      );
      
      // Guardar en localStorage como respaldo
      try {
        const flightsInStorage = JSON.parse(localStorage.getItem('flightList') || '[]');
        const updatedStorage = flightsInStorage.map(f => 
          f.id === currentMvtFlightId ? updatedFlight : f
        );
        localStorage.setItem('flightList', JSON.stringify(updatedStorage));
      } catch (storageError) {
        console.error("Error guardando en localStorage:", storageError);
      }
      
      // Cerrar el formulario
      setShowMvtForm(false);
      setCurrentMvtFlightId(null);
      
      // Mensaje de éxito
      alert('Datos MVT guardados correctamente');
    } catch (error) {
      console.error('Error general al guardar datos MVT:', error);
      alert('Error al guardar datos MVT: ' + error.message);
    }
  };
  
  const handleDeleteFlight = async (flightId) => {
    // Verificar permisos más estrictos para eliminar
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden eliminar vuelos');
      return;
    }
    
    if (confirmDelete === flightId) {
      await deleteFlight(flightId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(flightId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleNewFlight = () => {
    // Verificar si puede acceder a la página de config
    if (userRole !== 'admin' && userRole !== 'supervisor') {
      alert('No tienes permisos para crear nuevos vuelos');
      return;
    }

    console.log("Creando nuevo vuelo, limpiando estado...");
    
    // Limpiar el ID activo primero
    localStorage.removeItem('activeFlightId');
    
    // Reiniciar los datos del vuelo
    setFlightDetails({
      flightNumber: '',
      aircraft: '',
      origin: '',
      destination: '',
      date: '',
      airlineCode: '',
      std: '',
      seatConfig: null
    });
    
    // Limpiar el ID activo
    setActiveFlightId(null);
    
    // Navegar a configuración
    navigate('/config');
  };

  const handleLoadFlight = async (flightId) => {
    const success = await loadFlight(flightId);
    if (success) {
      setFlightId(flightId);
      
      // Si es admin o supervisor y está en modo admin, ir a config, de lo contrario ir a check-in
      if ((userRole === 'admin' || userRole === 'supervisor') && isAdmin) {
        navigate('/config');
      } else {
        navigate('/checkin');
      }
    }
  };
  
  const toggleAdminMode = () => {
    // Solo permitir cambiar el modo si es admin o supervisor
    if (userRole !== 'admin' && userRole !== 'supervisor') {
      return;
    }
    
    const newAdminMode = !isAdmin;
    setIsAdmin(newAdminMode);
    localStorage.setItem('adminMode', newAdminMode.toString());
  };
  
  // Helper para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no especificada';
    
    try {
      // Crear objeto de fecha sin conversión de zona horaria
      let date;
      
      // Intentar diferentes formatos de fecha
      if (dateString.includes('T')) {
        // Formato ISO
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // Formato YYYY-MM-DD
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      } else if (dateString.includes('/')) {
        // Formato DD/MM/YYYY
        const [day, month, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      } else {
        // Intentar parseo directo
        date = new Date(dateString);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn("Fecha inválida:", dateString);
        return dateString;
      }
      
      // Extraer partes de la fecha
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      // Formatear las partes para mostrar
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const formattedDate = `${day} ${monthNames[month-1]} ${year}`;
      
      return formattedDate;
    } catch (error) {
      console.error("Error formateando fecha:", error, "para", dateString);
      return dateString;
    }
  };

  // Función para formatear la hora en formato de 24 horas
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString;
  };
  
  // Función para obtener una fecha válida a partir de una cadena de fecha
  const getValidDate = (dateString, timeString = '00:00') => {
    if (!dateString) return null;
    
    try {
      let date;
      
      // Intentar diferentes formatos de fecha
      if (dateString.includes('T')) {
        // Ya es formato ISO, usar directamente
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // Formato YYYY-MM-DD
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      } else if (dateString.includes('/')) {
        // Formato DD/MM/YYYY
        const [day, month, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      } else {
        // Intentar parseo directo
        date = new Date(dateString);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn("Fecha inválida:", dateString);
        return null;
      }
      
      // Si hay hora de salida (STD), ajustar la hora
      if (timeString && /^\d{2}:\d{2}$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
      }
      
      return date;
    } catch (error) {
      console.error("Error convirtiendo fecha:", error, "para", dateString);
      return null;
    }
  };
  
  // Función para manejar el formulario MVT
  const handleOpenMvtForm = (flightId) => {
    // Verificar permisos para MVT (solo admin/supervisor en modo admin)
    if (!isAdmin || (userRole !== 'admin' && userRole !== 'supervisor')) {
      alert('No tienes permisos para esta acción');
      return;
    }
    
    const flight = flightList.find(f => f.id === flightId);
    if (!flight) return;

    // Filtrar pasajeros solo para este vuelo
    const flightPassengers = checkedInPassengers.filter(p => p.flightId === flightId);
    
    // 1. Contar pasajeros por tipo
    let men = 0;
    let women = 0;
    let children = 0;
    let infants = 0;
    
    flightPassengers.forEach(p => {
      if (p.passengerType === 'ADT') {
        if (p.gender === 'F') {
          women += 1;
        } else {
          men += 1;
        }
      } else if (p.passengerType === 'CHD') {
        children += 1;
      } else if (p.passengerType === 'INF') {
        infants += 1;
      } else {
        men += 1; // Valor por defecto
      }
    });
    
    // 2. Contar equipaje
    let pieces = 0;
    let weight = 0;
    
    flightPassengers.forEach(p => {
      if (p.baggage) {
        if (typeof p.baggage.count === 'number') {
          pieces += p.baggage.count;
        } else if (p.baggage.pieces && Array.isArray(p.baggage.pieces)) {
          pieces += p.baggage.pieces.length;
        }
        
        if (typeof p.baggage.weight === 'number') {
          weight += p.baggage.weight;
        }
      }
    });
    
    // 3. Construir el objeto mvtData
    const newMvtData = {
      flightNumber: flight.flightNumber || '',
      date: flight.date || new Date().toISOString().slice(0, 10),
      aircraft: flight.aircraft || '',
      crew: flight.crew || '',
      capacity: flight.capacity || '',
      departureAirport: flight.origin || '',
      actualDeparture: flight.actualDeparture || '',
      airborne: flight.airborne || '',
      estimatedArrival: flight.estimatedArrival || '',
      arrivalAirport: flight.destination || '',
      passengers: {
        men: men,
        women: women,
        children: children,
        infants: infants
      },
      baggage: {
        pieces: pieces,
        weight: weight,
        position: flight.baggage?.position || ''
      },
      delay: flight.delay || '',
      remarks: flight.remarks || ''
    };
    
    setMvtData(newMvtData);
    setCurrentMvtFlightId(flightId);
    setShowMvtForm(true);
  };
  
  // Separar vuelos en próximos y pasados
  const separateFlights = () => {
    const now = new Date();
    const upcomingFlights = [];
    const pastFlights = [];
    
    // Procesar cada vuelo
    flightList.forEach(flight => {
      // Calcular la fecha y hora de salida
      const departureDate = getValidDate(flight.date, flight.std);
      
      // Si no hay fecha o no es válida, considerar como vuelo próximo
      if (!departureDate) {
        upcomingFlights.push({
          ...flight,
          departureDate: null
        });
        return;
      }
      
      // Verificar si el vuelo ya pasó
      if (departureDate < now) {
        pastFlights.push({
          ...flight,
          departureDate
        });
      } else {
        upcomingFlights.push({
          ...flight,
          departureDate
        });
      }
    });
    
    // Ordenar vuelos próximos por tiempo de salida (los más cercanos primero)
    upcomingFlights.sort((a, b) => {
      if (!a.departureDate) return 1;
      if (!b.departureDate) return -1;
      return a.departureDate - b.departureDate;
    });
    
    // Ordenar vuelos pasados por tiempo de salida (los más recientes primero)
    pastFlights.sort((a, b) => {
      if (!a.departureDate) return 1;
      if (!b.departureDate) return -1;
      return b.departureDate - a.departureDate; // Orden inverso para mostrar los más recientes primero
    });
    
    return { upcomingFlights, pastFlights };
  };
  
  // Agrupar vuelos por fecha
  const groupFlightsByDate = (flights) => {
    const grouped = {};
    
    flights.forEach(flight => {
      let dateKey;
      
      if (!flight.departureDate) {
        dateKey = 'Sin fecha';
      } else {
        // Extraer solo la fecha (sin hora) para agrupar por día
        const date = flight.departureDate;
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(flight);
    });
    
    return grouped;
  };
  
  // Separar y procesar los vuelos
  const { upcomingFlights, pastFlights } = separateFlights();
  const upcomingFlightsByDate = groupFlightsByDate(upcomingFlights);
  const pastFlightsByDate = groupFlightsByDate(pastFlights);
  
  // Ordenar las fechas para los vuelos próximos (más cercanas primero)
  const upcomingDates = Object.keys(upcomingFlightsByDate).sort((a, b) => {
    if (a === 'Sin fecha') return 1;
    if (b === 'Sin fecha') return -1;
    return new Date(a) - new Date(b);
  });
  
  // Ordenar las fechas para los vuelos pasados (más recientes primero)
  const pastDates = Object.keys(pastFlightsByDate).sort((a, b) => {
    if (a === 'Sin fecha') return 1;
    if (b === 'Sin fecha') return -1;
    return new Date(b) - new Date(a);
  });
  
  // Componente para mostrar un vuelo pasado
  const PastFlightItem = ({ flight }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <div className="border-b border-gray-200 py-2">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <div className="flex items-center">
              <FaPlane className="text-gray-500 mr-2" />
              <span className="font-medium">{flight.flightNumber}</span>
              <span className="mx-2 text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                {formatDate(flight.date)} {formatTime(flight.std)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {flight.origin} → {flight.destination}
            </div>
          </div>
          <div className="flex space-x-2">
            {flight.departed && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Despegado
              </span>
            )}
            <button className="text-gray-400">
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-4 bg-gray-50 rounded-b">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Aeronave:</span> {flight.aircraft || 'No especificado'}
              </div>
              <div>
                <span className="text-gray-500">Fecha:</span> {formatDate(flight.date)}
              </div>
              <div>
                <span className="text-gray-500">STD:</span> {formatTime(flight.std)}
              </div>
              {flight.actualDeparture && (
                <div>
                  <span className="text-gray-500">ATD:</span> {formatTime(flight.actualDeparture)}
                </div>
              )}
              {flight.airborne && (
                <div>
                  <span className="text-gray-500">Airborne:</span> {formatTime(flight.airborne)}
                </div>
              )}
              {flight.estimatedArrival && (
                <div>
                  <span className="text-gray-500">ETA:</span> {formatTime(flight.estimatedArrival)}
                </div>
              )}
            </div>
            
            <div className="mt-3 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadFlight(flight.id);
                }}
                className="px-2 py-1 bg-sand text-white text-sm rounded flex items-center"
              >
                <FaEdit className="mr-1" /> Ver Detalles
              </button>
              
              {isAdmin && !flight.departed && (userRole === 'admin' || userRole === 'supervisor') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenMvtForm(flight.id);
                  }}
                  className="px-2 py-1 bg-green-600 text-white text-sm rounded flex items-center"
                >
                  <FaPlane className="mr-1" /> MVT
                </button>
              )}
              
              {userRole === 'admin' && isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFlight(flight.id);
                  }}
                  className={`px-2 py-1 ${confirmDelete === flight.id ? 'bg-red-600' : 'bg-gray-600'} text-white text-sm rounded flex items-center`}
                >
                  <FaTrash className="mr-1" /> {confirmDelete === flight.id ? 'Confirmar' : 'Eliminar'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-sand" />
        <span className="ml-2 text-lg">Cargando vuelos...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vuelos</h1>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => window.location.reload()} 
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            Recargar
          </button>
          
          {/* Solo mostrar el toggle a admin y supervisor */}
          {(userRole === 'admin' || userRole === 'supervisor') && (
            <button
              onClick={toggleAdminMode}
              className={`py-2 px-4 rounded ${isAdmin ? 'bg-dia text-noche border border-noche ' : 'bg-noche text-dia'}`}
            >
              Modo {isAdmin ? 'Administrador' : 'Usuario'}
            </button>
          )}
        </div>
      </div>
      
      {/* Indicador de estado online/offline */}
      <div className={`mb-4 p-2 rounded text-white text-sm text-center ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}>
        {isOnline ? 'Conectado - Sincronizando con la nube' : 'Modo sin conexión - Trabajando con datos locales'}
      </div>
      
      {flightList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg text-gray-600">No hay vuelos configurados</p>
          {(userRole === 'admin' || userRole === 'supervisor') && isAdmin && (
            <button
              onClick={handleNewFlight}
              className="mt-4 bg-sand hover:bg-noche text-white py-2 px-4 rounded"
            >
              Configurar Primer Vuelo
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Sección de Vuelos Próximos */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold flex items-center">
              <FaClock className="mr-2 text-sand" /> Vuelos Próximos
            </h2>
            
            {upcomingDates.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No hay vuelos próximos</p>
              </div>
            ) : (
              upcomingDates.map(date => (
                <FlightGroup 
                  key={date} 
                  date={date === 'Sin fecha' ? date : formatDate(date)}
                  flights={upcomingFlightsByDate[date]}
                  isAdmin={isAdmin}
                  userRole={userRole} // Pasar el rol de usuario al componente
                  activeFlightId={activeFlightId}
                  confirmDelete={confirmDelete}
                  onLoad={handleLoadFlight}
                  onDelete={handleDeleteFlight}
                  onOpenMvt={handleOpenMvtForm}
                />
              ))
            )}
          </div>

          {/* Sección de Vuelos Pasados */}
          {pastDates.length > 0 && (
            <div className="mt-8 border-t border-gray-300 pt-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowPastFlights(!showPastFlights)}
              >
                <h2 className="text-xl font-semibold flex items-center">
                  <FaHistory className="mr-2 text-gray-600" /> Vuelos Pasados ({pastFlights.length})
                </h2>
                <button className="text-gray-500 hover:text-gray-700">
                  {showPastFlights ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              
              {showPastFlights && (
                <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                  {pastDates.map(date => (
                    <div key={date} className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2 px-2 py-1 bg-gray-100 rounded">
                        {date === 'Sin fecha' ? date : formatDate(date)}
                      </h3>
                      <div className="divide-y divide-gray-200">
                        {pastFlightsByDate[date].map(flight => (
                          <PastFlightItem key={flight.id} flight={flight} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Modal del formulario MVT */}
      {showMvtForm && (
        <MvtFormModal 
          mvtData={mvtData}
          setMvtData={setMvtData}
          onClose={() => setShowMvtForm(false)}
          onSave={handleSaveMvt}
        />
      )}
    </div>
  );
};

export default FlightsPage;