// src/pages/CheckInPage.jsx (con mejoras de impresión)
import { useState, useEffect } from 'react';
import PassengerDetails from '../components/check-in/PassengerDetails';
import SeatMap from '../components/check-in/SeatMap';
import BaggageForm from '../components/check-in/BaggageForm';
import BoardingPass from '../components/check-in/BoardingPass';
import PrinterConfig from '../components/pre-flight/PrinterConfig';
import { usePassengersContext } from '../contexts/PassengersContext';
import { useFlightContext } from '../contexts/FlightContext';
import { FaUser, FaUserCheck, FaSearch, FaSort, FaPrint, FaCog, FaEdit, FaUndo } from 'react-icons/fa';

const CheckInPage = () => {
  const { 
    passengerList, 
    checkInPassenger, 
    uncheckInPassenger,
    updatePassenger,
    saveToLocalStorage, 
    loadFromLocalStorage 
  } = usePassengersContext();
  const { flightDetails, activeFlightId } = useFlightContext();
  
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [updatedPassenger, setUpdatedPassenger] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [baggage, setBaggage] = useState({ count: 0, weight: 0, pieces: [] });
  
  // Estado para la lista de pasajeros
  const [flightPassengers, setFlightPassengers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    showCheckedIn: true,
    showPending: true,
    sortBy: 'lastName' // 'lastName', 'firstName', 'checkedIn'
  });
  
  // Estado para controlar la impresión de tarjeta de embarque
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [boardingPassPassenger, setBoardingPassPassenger] = useState(null);
  const [showPrinterConfig, setShowPrinterConfig] = useState(false);
  const [autoPrintBoardingPass, setAutoPrintBoardingPass] = useState(
    localStorage.getItem('autoPrintBoardingPass') === 'true'
  );

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Filtrar pasajeros para el vuelo activo
  useEffect(() => {
    if (activeFlightId && passengerList.length > 0) {
      const passengers = passengerList.filter(p => p.flightId === activeFlightId);
      setFlightPassengers(passengers);
    }
  }, [activeFlightId, passengerList]);

  // Filtrar y ordenar la lista de pasajeros según los criterios
  const getFilteredPassengers = () => {
    return flightPassengers
      .filter(p => {
        // Filtrar por texto de búsqueda
        if (searchTerm) {
          const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
          const lastNameFirst = `${p.lastName} ${p.firstName}`.toLowerCase();
          const docNumber = p.documentNumber ? p.documentNumber.toString().toLowerCase() : '';
          
          if (!fullName.includes(searchTerm.toLowerCase()) && 
              !lastNameFirst.includes(searchTerm.toLowerCase()) && 
              !docNumber.includes(searchTerm.toLowerCase())) {
            return false;
          }
        }
        
        // Filtrar por estado de check-in
        if (!filterOptions.showCheckedIn && p.checkedIn) return false;
        if (!filterOptions.showPending && !p.checkedIn) return false;
        
        return true;
      })
      .sort((a, b) => {
        // Ordenar
        switch (filterOptions.sortBy) {
          case 'lastName':
            return a.lastName.localeCompare(b.lastName);
          case 'firstName':
            return a.firstName.localeCompare(b.firstName);
          case 'checkedIn':
            return (b.checkedIn ? 1 : 0) - (a.checkedIn ? 1 : 0);
          default:
            return 0;
        }
      });
  };

  const handlePassengerSelect = (passenger) => {
    setSelectedPassenger(passenger);
    setUpdatedPassenger(passenger);
    setSelectedSeat(passenger.seat || null);
    setBaggage(passenger.baggage || { count: 0, weight: 0, pieces: [] });
  };

  const handlePassengerUpdate = (updated) => {
    setUpdatedPassenger(updated);
    
    // Si el pasajero ya no está checkeado, resetear el asiento seleccionado
    if (!updated.checkedIn && selectedSeat) {
      setSelectedSeat(null);
    }
  };

  const handleSeatSelect = (seatId) => {
    setSelectedSeat(seatId);
  };

  const handleCheckIn = () => {
    // Solo validamos pasajero y asiento, el equipaje es opcional
    if (!updatedPassenger) {
      alert('Por favor selecciona un pasajero');
      return;
    }
    
    if (!selectedSeat) {
      alert('Por favor selecciona un asiento');
      return;
    }
    
    // Si el pasajero no tiene tipo asignado, asignar ADT por defecto
    if (!updatedPassenger.passengerType) {
      updatedPassenger.passengerType = 'ADT';
    }
    
    // Actualiza los datos del pasajero con el asiento y equipaje
    const finalPassenger = {
      ...updatedPassenger,
      seat: selectedSeat,
      checkedIn: true,
      baggage: baggage,
      checkInTime: new Date().toISOString()
    };
    
    checkInPassenger(finalPassenger);
    saveToLocalStorage(); // Guardar en localStorage
    
    // Si autoPrintBoardingPass está activado, mostrar el modal de impresión
    if (autoPrintBoardingPass) {
      setBoardingPassPassenger(finalPassenger);
      setShowBoardingPass(true);
    } else {
      // Si no, simplemente reiniciar el formulario
      handleCloseBoardingPass();
    }
  };
  
  // Función para manejar el cierre del modal de tarjeta de embarque
  const handleCloseBoardingPass = () => {
    setShowBoardingPass(false);
    
    // Reiniciar el formulario después de un tiempo breve
    setTimeout(() => {
      setSelectedPassenger(null);
      setUpdatedPassenger(null);
      setSelectedSeat(null);
      setBaggage({ count: 0, weight: 0, pieces: [] });
    }, 300);
  };
  
  // Nueva función para imprimir tarjeta de embarque de un pasajero ya checkeado
  const handlePrintBoardingPass = (passenger) => {
    setBoardingPassPassenger(passenger);
    setShowBoardingPass(true);
  };
  
  // Manejar cambio en la opción de impresión automática
  const handleAutoPrintChange = (e) => {
    const checked = e.target.checked;
    setAutoPrintBoardingPass(checked);
    localStorage.setItem('autoPrintBoardingPass', checked);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Parsear la fecha correctamente
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateString;
    }
  };
  
  // Nueva función para manejar el descheckeo de un pasajero
  const handleUncheckIn = async (passenger) => {
    if (window.confirm('¿Estás seguro que deseas eliminar el check-in de este pasajero?')) {
      try {
        const updatedPassenger = await uncheckInPassenger(passenger);
        
        // Si es el pasajero actualmente seleccionado, actualizarlo
        if (selectedPassenger && selectedPassenger.id === passenger.id) {
          setSelectedPassenger(updatedPassenger);
          setUpdatedPassenger(updatedPassenger);
          setSelectedSeat(null);
        }
      } catch (error) {
        console.error('Error al descheckear pasajero:', error);
        alert('Ocurrió un error al eliminar el check-in');
      }
    }
  };

  const filteredPassengers = getFilteredPassengers();

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header - Información del vuelo */}
      <div className="hidden bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className='flex flex-row items-center gap-8'>
            <h1 className="text-2xl font-bold mb-2">Check-In: {flightDetails.flightNumber}</h1>
            
            <div className="text-gray-600">
            {flightDetails.origin} → {flightDetails.destination} • {formatDate(flightDetails.date)}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <label className="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoPrintBoardingPass}
                onChange={handleAutoPrintChange}
                className="mr-2 h-4 w-4"
              />
              Auto-imprimir tarjetas
            </label>
            
            <button
              onClick={() => setShowPrinterConfig(true)}
              className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-3 py-2 rounded-md"
              title="Configurar impresoras"
            >
              <FaCog className="mr-2" /> Impresoras
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna izquierda - Lista de pasajeros */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
            <div className="bg-gray-100 px-4 py-3 border-b">
              <h2 className="font-semibold text-gray-800">Pasajeros del Vuelo</h2>
              
              {/* Barra de búsqueda */}
              <div className="mt-2 relative">
                <input
                  type="text"
                  placeholder="Buscar pasajero..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Filtros */}
              <div className="mt-2 flex justify-between">
                <div className="flex space-x-2">
                  <label className="inline-flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filterOptions.showCheckedIn}
                      onChange={() => setFilterOptions({...filterOptions, showCheckedIn: !filterOptions.showCheckedIn})}
                      className="mr-1"
                    />
                    Con check-in
                  </label>
                  
                  <label className="inline-flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filterOptions.showPending}
                      onChange={() => setFilterOptions({...filterOptions, showPending: !filterOptions.showPending})}
                      className="mr-1"
                    />
                    Pendientes
                  </label>
                </div>
                
                <select
                  value={filterOptions.sortBy}
                  onChange={(e) => setFilterOptions({...filterOptions, sortBy: e.target.value})}
                  className="text-xs border border-gray-300 rounded px-1"
                >
                  <option value="lastName">Ordenar: Apellido</option>
                  <option value="firstName">Ordenar: Nombre</option>
                  <option value="checkedIn">Ordenar: Estado</option>
                </select>
              </div>
            </div>
            
            {/* Lista de pasajeros */}
            <div className="max-h-[500px] overflow-y-auto">
              {filteredPassengers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron pasajeros
                </div>
              ) : (
                filteredPassengers.map(passenger => (
                  <div
                    key={passenger.id}
                    className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                      selectedPassenger?.id === passenger.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-grow" onClick={() => handlePassengerSelect(passenger)}>
                        <div className="font-medium">{passenger.lastName}, {passenger.firstName}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <span className="mr-2">{passenger.documentType || 'Doc'}: {passenger.documentNumber}</span>
                          {passenger.seat && (
                            <span className="bg-gray-200 text-gray-700 px-1 rounded text-xs">
                              Asiento: {passenger.seat}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passenger.checkedIn ? (
                          <>
                            <FaUserCheck className="text-green-500" title="Check-in completado" />
                            <button 
                              onClick={() => handlePrintBoardingPass(passenger)} 
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Imprimir tarjeta de embarque"
                            >
                              <FaPrint />
                            </button>
                            <button 
                              onClick={() => handleUncheckIn(passenger)} 
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Eliminar check-in"
                            >
                              <FaUndo />
                            </button>
                          </>
                        ) : (
                          <FaUser className="text-yellow-500" title="Pendiente de check-in" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Contador de pasajeros */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="font-bold text-lg">{filteredPassengers.filter(p => p.checkedIn).length}</div>
                <div className="text-sm text-gray-600">Con check-in</div>
              </div>
              <div>
                <div className="font-bold text-lg">{filteredPassengers.filter(p => !p.checkedIn).length}</div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Columnas central y derecha */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna de detalles y equipaje */}
            <div>
              {selectedPassenger ? (
                <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
                  <h2 className="text-xl font-semibold mb-4">Detalles del Pasajero</h2>
                  <PassengerDetails 
                    passenger={selectedPassenger} 
                    onUpdate={handlePassengerUpdate}
                  />
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6 text-center">
                  <p className="text-gray-500">Selecciona un pasajero de la lista</p>
                </div>
              )}
              
              {selectedPassenger && (
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Registro de Equipaje</h2>
                  <BaggageForm 
                    baggage={baggage} 
                    onChange={setBaggage}
                    flightInfo={flightDetails}
                    passengerInfo={updatedPassenger}
                  />
                </div>
              )}
            </div>
            
            {/* Columna del mapa de asientos */}
            <div>
              <SeatMap 
                onSeatSelect={handleSeatSelect} 
                selectedSeat={selectedSeat}
              />
              
              {selectedPassenger && (
                <div className="mt-6">
                  {selectedPassenger.checkedIn ? (
                    <button
                      onClick={() => handlePrintBoardingPass(selectedPassenger)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center"
                    >
                      <FaPrint className="mr-2" /> Imprimir Tarjeta de Embarque
                    </button>
                  ) : selectedSeat ? (
                    <button
                      onClick={handleCheckIn}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition"
                    >
                      Completar Check-in
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                    >
                      Selecciona un asiento
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Tarjeta de Embarque */}
      {showBoardingPass && boardingPassPassenger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tarjeta de Embarque</h2>
              <button 
                onClick={handleCloseBoardingPass}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-auto max-h-[70vh]">
              <BoardingPass 
                passenger={boardingPassPassenger} 
                flightDetails={flightDetails} 
                onPrint={handleCloseBoardingPass}
                onClose={handleCloseBoardingPass}
                onConfigurePrinters={() => {
                  setShowBoardingPass(false);
                  setShowPrinterConfig(true);
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Configuración de Impresoras */}
      {showPrinterConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Configuración de Impresoras</h2>
              <button 
                onClick={() => setShowPrinterConfig(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-auto max-h-[70vh]">
              <PrinterConfig 
                onSave={() => {}} 
                onClose={() => setShowPrinterConfig(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;