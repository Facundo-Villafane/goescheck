// src/components/check-in/SeatMap.jsx
import { useState, useEffect } from 'react';
import { usePassengersContext } from '../../contexts/PassengersContext';
import { useFlightContext } from '../../contexts/FlightContext';
// Importar los iconos que necesitamos
import { FaMale, FaFemale, FaChild, FaBaby, FaExclamationTriangle } from 'react-icons/fa';
import { BsFillPersonFill } from 'react-icons/bs';

const SeatMap = ({ onSeatSelect }) => {
  const { flightDetails } = useFlightContext();
  const { checkedInPassengers } = usePassengersContext();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatMap, setSeatMap] = useState([]);

  // Configuración de asientos según el tipo de aeronave
  useEffect(() => {
    if (flightDetails.aircraft || flightDetails.seatConfig) {
      // Aquí configuramos el mapa de asientos según el tipo de aeronave o configuración personalizada
      generateSeatMap();
    }
  }, [flightDetails.aircraft, flightDetails.seatConfig, checkedInPassengers]);

  const generateSeatMap = () => {
    // Si existe una configuración personalizada en el nuevo formato (con rows)
    if (flightDetails.seatConfig && flightDetails.seatConfig.rows) {
      // Generar mapa de asientos usando la nueva estructura
      const newSeatMap = [];
      
      // Iterar por todas las filas definidas
      flightDetails.seatConfig.rows.forEach(rowConfig => {
        const rowData = [];
        const isEmergencyRow = rowConfig.isEmergencyExit;
        
        // Añadir cada asiento/pasillo a la fila
        rowConfig.seats.forEach(seatConfig => {
          if (seatConfig.type === 'aisle') {
            rowData.push({ id: `${rowConfig.number}-aisle`, type: 'aisle' });
          } else if (seatConfig.type === 'seat') {
            const seatId = `${rowConfig.number}${seatConfig.label}`;
            rowData.push({
              id: seatId,
              // Si el asiento está bloqueado, cambiar su tipo a 'blocked'
              type: seatConfig.isBlocked ? 'blocked' : 'available',
              section: rowConfig.section || 'A0',
              isEmergencyExit: isEmergencyRow,
              // Propiedad de bloqueo
              isBlocked: seatConfig.isBlocked,
              // Verificar si el asiento ya está ocupado
              occupied: checkedInPassengers.some(p => p.seat === seatId),
              // Información del pasajero si está ocupado
              passenger: checkedInPassengers.find(p => p.seat === seatId)
            });
          }
        });
        
        if (rowData.length > 0) {
          newSeatMap.push(rowData);
        }
      });
      
      setSeatMap(newSeatMap);
      return;
    }
    
    // Si no existe el nuevo formato, usar el formato antiguo (compatible hacia atrás)
    let rows = 0;
    let columns = [];
    let skipRows = [];
    let emergencyRows = [];
    
    // Usar configuración personalizada si existe en formato antiguo
    if (flightDetails.seatConfig) {
      rows = flightDetails.seatConfig.rowCount || 30;
      columns = flightDetails.seatConfig.columnConfig || [
        { id: 1, label: 'A', type: 'seat' },
        { id: 2, label: 'B', type: 'seat' },
        { id: 3, label: 'C', type: 'seat' },
        { id: 4, label: '', type: 'aisle' },
        { id: 5, label: 'D', type: 'seat' },
        { id: 6, label: 'E', type: 'seat' },
        { id: 7, label: 'F', type: 'seat' }
      ];
      skipRows = flightDetails.seatConfig.skipRows || [];
      emergencyRows = flightDetails.seatConfig.emergencyRows || [];
    } else {
      // Configuraciones predeterminadas
      switch(flightDetails.aircraft) {
        case 'A320':
          rows = 30;
          columns = [
            { id: 1, label: 'A', type: 'seat' },
            { id: 2, label: 'B', type: 'seat' },
            { id: 3, label: 'C', type: 'seat' },
            { id: 4, label: '', type: 'aisle' },
            { id: 5, label: 'D', type: 'seat' },
            { id: 6, label: 'E', type: 'seat' },
            { id: 7, label: 'F', type: 'seat' }
          ];
          break;
        case 'B737':
          rows = 33;
          columns = [
            { id: 1, label: 'A', type: 'seat' },
            { id: 2, label: 'B', type: 'seat' },
            { id: 3, label: 'C', type: 'seat' },
            { id: 4, label: '', type: 'aisle' },
            { id: 5, label: 'D', type: 'seat' },
            { id: 6, label: 'E', type: 'seat' },
            { id: 7, label: 'F', type: 'seat' }
          ];
          break;
        case 'ERJ145':
          rows = 20;
          columns = [
            { id: 1, label: 'A', type: 'seat' },
            { id: 2, label: 'B', type: 'seat' },
            { id: 3, label: '', type: 'aisle' },
            { id: 4, label: 'C', type: 'seat' },
            { id: 5, label: 'D', type: 'seat' }
          ];
          break;
        default:
          rows = 20;
          columns = [
            { id: 1, label: 'A', type: 'seat' },
            { id: 2, label: 'B', type: 'seat' },
            { id: 3, label: 'C', type: 'seat' },
            { id: 4, label: '', type: 'aisle' },
            { id: 5, label: 'D', type: 'seat' },
            { id: 6, label: 'E', type: 'seat' },
            { id: 7, label: 'F', type: 'seat' }
          ];
      }
    }
    // Generar matriz de asientos en formato antiguo
  const newSeatMap = [];
  for (let row = 1; row <= rows; row++) {
    // Omitir filas especificadas
    if (skipRows.includes(row)) continue;
    
    const rowData = [];
    const isEmergencyRow = emergencyRows.includes(row);
    
    for (let col of columns) {
      // El pasillo no es un asiento
      if (col.type === 'aisle') {
        rowData.push({ id: `${row}-aisle`, type: 'aisle' });
      } else {
        const seatId = `${row}${col.label}`;
        rowData.push({
          id: seatId,
          type: 'available',
          section: getSeatSection(row, col.label),
          isEmergencyExit: isEmergencyRow,
          // Verificar si el asiento ya está ocupado
          occupied: checkedInPassengers.some(p => p.seat === seatId),
          // Información del pasajero si está ocupado
          passenger: checkedInPassengers.find(p => p.seat === seatId)
        });
      }
    }
    newSeatMap.push(rowData);
  }
  
  setSeatMap(newSeatMap);
};

  // Determinar la sección del asiento (A0, B0, C0, etc.)
  const getSeatSection = (row, col) => {
    // Intentar encontrar la sección en el nuevo formato
    if (flightDetails.seatConfig && flightDetails.seatConfig.rows) {
      const rowConfig = flightDetails.seatConfig.rows.find(r => r.number === row);
      if (rowConfig && rowConfig.section) {
        return rowConfig.section;
      }
    }
    
    // Fallback al sistema antiguo
    if (row <= 10) return 'A0';
    if (row <= 20) return 'B0';
    return 'C0';
  };

    // Actualizar la función handleSeatClick para no hacer nada si el asiento está bloqueado
    const handleSeatClick = (seat) => {
    // No hacer nada si es pasillo, asiento ocupado o bloqueado
    if (seat.type === 'aisle' || seat.occupied || seat.type === 'blocked' || seat.isBlocked) return;
    
    setSelectedSeat(seat.id);
    onSeatSelect(seat.id);
    };

  
    // Renderizar el contenido del asiento (número o icono)
    const renderSeatContent = (seat) => {
        if (seat.type === 'aisle') return null;
        
        // Para asientos bloqueados
        if (seat.type === 'blocked' || seat.isBlocked) {
        return <span className="text-gray-800">X</span>;
        }
        
        if (seat.occupied) {
        // Mostrar icono según tipo de pasajero
        if (seat.passenger?.passengerType === 'CHD') {
            return <FaChild className="text-white" />;
        } else if (seat.passenger?.passengerType === 'INF') {
            return <FaBaby className="text-white" />;
        } else {
            // Para adultos, diferenciar por género
            if (seat.passenger?.gender === 'F') {
            return <FaFemale className="text-white" />;
            } else {
            return <FaMale className="text-white" />;
            }
        }
        }
        
        // Para asientos normales disponibles, mostrar el ID
        return seat.id;
    };

    // Actualizar la función para obtener las clases CSS de cada asiento
    const getSeatClassNames = (seat) => {
        let classes = 'w-8 h-8 m-1 flex items-center justify-center rounded cursor-pointer text-xs font-medium ';
        
        if (seat.type === 'aisle') {
        return 'w-4 h-8 m-1';
        }
        
        // Asiento bloqueado (no disponible)
        if (seat.type === 'blocked' || seat.isBlocked) {
        return classes + 'bg-gray-400 text-gray-800 cursor-not-allowed opacity-70';
        }
        
        if (seat.occupied) {
        // Diferentes colores según el tipo de pasajero
        if (seat.passenger?.passengerType === 'CHD') {
            classes += 'bg-orange-500 text-white'; // Niño
        } else if (seat.passenger?.passengerType === 'INF') {
            classes += 'bg-purple-500 text-white'; // Infante
        } else {
            // Para adultos, diferenciar por género
            if (seat.passenger?.gender === 'F') {
            classes += 'bg-pink-600 text-white'; // Femenino
            } else {
            classes += 'bg-blue-600 text-white'; // Masculino (por defecto)
            }
        }
        } else if (selectedSeat === seat.id) {
        classes += 'bg-green-500 text-white ring-2 ring-green-700';
        } else if (seat.isEmergencyExit) {
        classes += 'bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-300';
        } else {
        classes += 'bg-blue-100 hover:bg-blue-200 text-blue-800';
        }
        
        return classes;
    };

    const getSectionsInfo = () => {
        // Si existen secciones personalizadas en la configuración
        if (flightDetails.seatConfig && flightDetails.seatConfig.sections) {
          return flightDetails.seatConfig.sections;
        }
        
        // De lo contrario, crear secciones por defecto basadas en rangos de filas
        // Determinar el número máximo de filas
        let maxRow = 30; // Por defecto
        
        if (flightDetails.seatConfig) {
          if (flightDetails.seatConfig.rows) {
            const rowNumbers = flightDetails.seatConfig.rows.map(r => r.number);
            maxRow = Math.max(...rowNumbers);
          } else if (flightDetails.seatConfig.rowCount) {
            maxRow = flightDetails.seatConfig.rowCount;
          }
        }
        
        // Crear rangos basados en el número de filas
        const rangeA = Math.min(10, Math.floor(maxRow * 0.3));
        const rangeB = Math.min(20, Math.floor(maxRow * 0.6));
        
        return [
          { id: 'A0', name: `Filas 1-${rangeA}`, color: '#f59e0b' },
          { id: 'B0', name: `Filas ${rangeA + 1}-${rangeB}`, color: '#10b981' },
          { id: 'C0', name: `Filas ${rangeB + 1}+`, color: '#3b82f6' }
        ];
      };
      
  // SVG para la nariz del avión (frente)
  const AirplaneNose = () => (
    <div className="flex justify-center mb-2 relative">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="300 270.4008 99.247 29.5992" width="99.247px" height="29.5992px" className="w-32">
        <g id="object-6">
          <path style={{fill: "rgb(216, 216, 216)", stroke: "rgb(0, 0, 0)"}} d="M 300 299.984 C 300 299.984 332.47880242005635 270.4997696653543 348.933 270.401 C 365.5581448573426 270.3012041888675 399.247 300 399.247 300" id="object-2"/>
          <polygon style={{stroke: "rgb(0, 0, 0)", fill: "rgb(13, 20, 34)"}} points="321.118 298.765 331.904 298.869 347.947 294.277 348.032 287.185" id="object-4"/>
          <polygon style={{stroke: "rgb(0, 0, 0)", fill: "rgb(13, 20, 34)", transformBox: "fill-box", transformOrigin: "50% 50%"}} points="350.823 287.289 361.608 287.185 377.651 291.777 377.737 298.869" id="object-5" transform="matrix(-1, 0, 0, -1, 0.000011, 0.00005)"/>
        </g>
      </svg>
      
    </div>
  );

  // SVG para el empenaje del avión (cola)
  const AirplaneTail = () => (
    <div className="flex justify-center mt-2 relative">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="300.753 384.66 99.247 15.3392" width="99.247px" height="15.3392px" className="w-32">
        <path style={{fill: "rgb(216, 216, 216)", stroke: "rgb(0, 0, 0)"}} d="M 300.753 384.668 C 300.753 384.668 333.2516548787178 399.93569098561636 349.686 399.999 C 366.33080878626566 400.06311977058334 400 384.66 400 384.66" id="path-1"/>
      </svg>
      
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Selección de Asiento</h2>
      
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-100 mr-2 flex items-center justify-center rounded">
            <BsFillPersonFill className="text-blue-800" />
          </div>
          <span className="text-sm">Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-600 mr-2 flex items-center justify-center rounded">
            <FaMale className="text-white" />
          </div>
          <span className="text-sm">Adulto (M)</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-pink-600 mr-2 flex items-center justify-center rounded">
            <FaFemale className="text-white" />
          </div>
          <span className="text-sm">Adulto (F)</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-orange-500 mr-2 flex items-center justify-center rounded">
            <FaChild className="text-white" />
          </div>
          <span className="text-sm">Niño</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-purple-500 mr-2 flex items-center justify-center rounded">
            <FaBaby className="text-white" />
          </div>
          <span className="text-sm">Infante</span>
        </div>
        <div className="flex items-center">
            <div className="w-6 h-6 bg-orange-100 mr-2 flex items-center justify-center rounded border border-orange-300">
                <FaExclamationTriangle className="text-orange-800" size={12} />
            </div>
            <span className="text-sm">Salida de emergencia</span>
        </div>
        <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-400 mr-2 flex items-center justify-center rounded opacity-70">
                <span className="text-gray-800">X</span>
            </div>
            <span className="text-sm">Bloqueado</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-500 mr-2 flex items-center justify-center rounded text-white">
            ✓
          </div>
          <span className="text-sm">Seleccionado</span>
        </div>
      </div>
      
      <div className="flex justify-center mb-2">
        <AirplaneNose />
      </div>
      
      <div className="overflow-auto max-h-96">
        {seatMap.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center">
            {row.map((seat, seatIndex) => (
              <div
                key={`${rowIndex}-${seatIndex}`}
                className={getSeatClassNames(seat)}
                onClick={() => handleSeatClick(seat)}
                title={seat.occupied ? `Ocupado por: ${seat.passenger.firstName} ${seat.passenger.lastName}` : null}
              >
                {renderSeatContent(seat)}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-2">
        <AirplaneTail />
      </div>
      
      {selectedSeat && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          Asiento seleccionado: <span className="font-medium">{selectedSeat}</span>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Zonas:</h3>
        <div className="flex flex-wrap gap-2">
            {getSectionsInfo().map(section => {
            // Convertir el color a formato rgba para fondo con transparencia
            const hexToRgb = (hex) => {
                const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
                return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
                } : null;
            };
            
            const rgb = hexToRgb(section.color);
            const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : '#f9fafb';
            
            return (
                <div 
                key={section.id}
                className="px-2 py-1 rounded text-sm" 
                style={{ 
                    backgroundColor: bgColor,
                    color: section.color,
                    borderColor: section.color,
                    border: '1px solid'
                }}
                >
                {section.id}: {section.name}
                </div>
            );
            })}
        </div>
        </div>
    </div>
  );
};

export default SeatMap;