// src/pages/OperationsPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useFlightContext } from '../contexts/FlightContext';
import { FaPlane, FaSpinner, FaCopy, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const OperationsPage = () => {
  const { flightList, loading } = useFlightContext();
  const [departedFlights, setDepartedFlights] = useState([]);
  const [expandedFlights, setExpandedFlights] = useState({});
  const [copySuccess, setCopySuccess] = useState({});
  
  // Filtrar vuelos departed
  useEffect(() => {
    const departed = flightList.filter(flight => flight.departed);
    setDepartedFlights(departed);
    
    // Inicializar estados de expansión
    const initialExpandState = {};
    departed.forEach(flight => {
      initialExpandState[flight.id] = false;
    });
    setExpandedFlights(initialExpandState);
  }, [flightList]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-sand" />
        <span className="ml-2 text-lg">Cargando operaciones...</span>
      </div>
    );
  }
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };
  
  // Generar mensaje MVT para un vuelo
  const getMvtMessage = (flight) => {
    try {
      const formattedDate = flight.date ? 
        `${new Date(flight.date).getDate().toString().padStart(2, '0')}${new Date(flight.date).toLocaleString('en-US', {month: 'short'}).toUpperCase()}` : '';
      
      return `MVT
${flight.flightNumber}/${formattedDate}.${flight.aircraft} ${flight.crew} ${flight.capacity} ${flight.origin}
AD ${flight.actualDeparture}/${flight.airborne} EA ${flight.estimatedArrival} ${flight.destination}
PAX ${flight.passengers?.men || 0}/${flight.passengers?.women || 0}/${flight.passengers?.children || 0}/${flight.passengers?.infants || 0}
BAG ${flight.baggage?.pieces || 0}/${flight.baggage?.weight || 0} KGS POS ${flight.baggage?.position || ''}
DLY/${flight.delay || ''}
RMK ${flight.remarks || 'NIL'}`;
    } catch (error) {
      console.error("Error generando mensaje MVT:", error);
      return "Error generando mensaje MVT";
    }
  };

  // Manejar copia al portapapeles
  const handleCopyMvt = (flight) => {
    const mvtText = getMvtMessage(flight);
    navigator.clipboard.writeText(mvtText)
      .then(() => {
        // Mostrar mensaje de éxito
        setCopySuccess({...copySuccess, [flight.id]: true});
        // Ocultar después de 2 segundos
        setTimeout(() => {
          setCopySuccess({...copySuccess, [flight.id]: false});
        }, 2000);
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar al portapapeles');
      });
  };

  // Función para expandir/colapsar detalles
  const toggleDetails = (flightId) => {
    setExpandedFlights({
      ...expandedFlights,
      [flightId]: !expandedFlights[flightId]
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Operaciones</h1>
      
      {departedFlights.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg text-gray-600">No hay vuelos con salida registrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {departedFlights.map(flight => (
            <div key={flight.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-2 font-medium flex justify-between items-center">
                <div className="flex items-center">
                  <FaPlane className="mr-2" />
                  <span>{flight.flightNumber}</span>
                </div>
                <div>
                  {formatDate(flight.date)} • {flight.origin} → {flight.destination}
                </div>
              </div>
              
              <div className="p-4">
                {/* Mensaje MVT con botón de copiar */}
                <div className="mb-4 relative">
                  <div className="p-3 bg-gray-100 rounded font-mono whitespace-pre text-sm overflow-x-auto">
                    {getMvtMessage(flight)}
                  </div>
                  
                  <button 
                    onClick={() => handleCopyMvt(flight)}
                    className="absolute top-2 right-2 bg-sand hover:bg-noche text-white p-2 rounded-full"
                    title="Copiar MVT"
                  >
                    <FaCopy />
                  </button>
                  
                  {copySuccess[flight.id] && (
                    <div className="absolute top-2 right-12 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      ¡Copiado!
                    </div>
                  )}
                </div>
                
                {/* Botón para expandir/colapsar detalles */}
                <div className="mb-3">
                  <button 
                    onClick={() => toggleDetails(flight.id)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    {expandedFlights[flight.id] ? (
                      <>
                        <FaChevronUp className="mr-2" />
                        <span>Ocultar detalles</span>
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="mr-2" />
                        <span>Ver detalles</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Información detallada (colapsable) */}
                {expandedFlights[flight.id] && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Información de Vuelo</h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li><span className="font-medium">Aeronave:</span> {flight.aircraft}</li>
                        <li><span className="font-medium">Tripulación:</span> {flight.crew}</li>
                        <li><span className="font-medium">Capacidad:</span> {flight.capacity}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Horarios</h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li><span className="font-medium">Salida Programada:</span> {flight.std}</li>
                        <li><span className="font-medium">Salida Real:</span> {flight.actualDeparture}</li>
                        <li><span className="font-medium">Tiempo Despegue:</span> {flight.airborne}</li>
                        <li><span className="font-medium">Llegada Estimada:</span> {flight.estimatedArrival}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Pasajeros</h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li><span className="font-medium">Hombres:</span> {flight.passengers?.men || 0}</li>
                        <li><span className="font-medium">Mujeres:</span> {flight.passengers?.women || 0}</li>
                        <li><span className="font-medium">Niños:</span> {flight.passengers?.children || 0}</li>
                        <li><span className="font-medium">Infantes:</span> {flight.passengers?.infants || 0}</li>
                        <li><span className="font-medium">Total:</span> {(flight.passengers?.men || 0) + (flight.passengers?.women || 0) + (flight.passengers?.children || 0)}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Equipaje</h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li><span className="font-medium">Piezas:</span> {flight.baggage?.pieces || 0}</li>
                        <li><span className="font-medium">Peso Total:</span> {flight.baggage?.weight || 0} kg</li>
                        {flight.baggage?.position && (
                          <li><span className="font-medium">Distribución:</span> {flight.baggage.position}</li>
                        )}
                      </ul>
                    </div>
                    
                    {(flight.delay || flight.remarks) && (
                      <div className="col-span-1 md:col-span-2">
                        <h3 className="font-semibold">Información Adicional</h3>
                        {flight.delay && <p className="mt-1 text-sm"><span className="font-medium">Retraso:</span> {flight.delay}</p>}
                        {flight.remarks && <p className="mt-1 text-sm"><span className="font-medium">Observaciones:</span> {flight.remarks}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperationsPage;

