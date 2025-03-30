// src/components/boarding/BoardingSeatMap.jsx
import React, { useState, useEffect } from 'react';
import { FaMale, FaFemale, FaChild, FaBaby, FaExclamationTriangle } from 'react-icons/fa';
import { BsFillPersonFill } from 'react-icons/bs';

const BoardingSeatMap = ({ boardedPassengers, pendingPassengers, flightDetails }) => {
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  
  // Generate seat map based on flight configuration
  useEffect(() => {
    if (flightDetails.seatConfig) {
      generateSeatMap();
    }
  }, [flightDetails.seatConfig, boardedPassengers, pendingPassengers]);
  
  const generateSeatMap = () => {
    // If there's a custom configuration in the new format (with rows)
    if (flightDetails.seatConfig && flightDetails.seatConfig.rows) {
      // Generate seat map using the new structure
      const newSeatMap = [];
      
      // Iterate through all defined rows
      flightDetails.seatConfig.rows.forEach(rowConfig => {
        const rowData = [];
        const isEmergencyRow = rowConfig.isEmergencyExit;
        
        // Add each seat/aisle to the row
        rowConfig.seats.forEach(seatConfig => {
          if (seatConfig.type === 'aisle') {
            rowData.push({ id: `${rowConfig.number}-aisle`, type: 'aisle' });
          } else if (seatConfig.type === 'seat') {
            const seatId = `${rowConfig.number}${seatConfig.label}`;
            
            // Check if the seat is occupied by a boarded passenger
            const boardedPassenger = boardedPassengers.find(p => p.seat === seatId);
            // Check if the seat is assigned to a pending passenger
            const pendingPassenger = pendingPassengers.find(p => p.seat === seatId);
            
            rowData.push({
              id: seatId,
              // If the seat is blocked, change its type to 'blocked'
              type: seatConfig.isBlocked ? 'blocked' : 'available',
              section: rowConfig.section || 'A0',
              isEmergencyExit: isEmergencyRow,
              // Seat properties
              isBlocked: seatConfig.isBlocked,
              boarded: !!boardedPassenger,
              pending: !!pendingPassenger,
              passenger: boardedPassenger || pendingPassenger
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
    
    // If new format doesn't exist, use old format (backward compatibility)
    let rows = 0;
    let columns = [];
    let skipRows = [];
    let emergencyRows = [];
    
    // Use custom configuration if it exists in old format
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
      // Default configurations
      const defaultConfig = {
        rows: 30,
        columns: [
          { id: 1, label: 'A', type: 'seat' },
          { id: 2, label: 'B', type: 'seat' },
          { id: 3, label: 'C', type: 'seat' },
          { id: 4, label: '', type: 'aisle' },
          { id: 5, label: 'D', type: 'seat' },
          { id: 6, label: 'E', type: 'seat' },
          { id: 7, label: 'F', type: 'seat' }
        ]
      };
      
      rows = defaultConfig.rows;
      columns = defaultConfig.columns;
    }
    
    // Generate seat matrix in old format
    const newSeatMap = [];
    for (let row = 1; row <= rows; row++) {
      // Skip specified rows
      if (skipRows.includes(row)) continue;
      
      const rowData = [];
      const isEmergencyRow = emergencyRows.includes(row);
      
      for (let col of columns) {
        // The aisle is not a seat
        if (col.type === 'aisle') {
          rowData.push({ id: `${row}-aisle`, type: 'aisle' });
        } else {
          const seatId = `${row}${col.label}`;
          
          // Check if the seat is occupied by a boarded passenger
          const boardedPassenger = boardedPassengers.find(p => p.seat === seatId);
          // Check if the seat is assigned to a pending passenger
          const pendingPassenger = pendingPassengers.find(p => p.seat === seatId);
          
          rowData.push({
            id: seatId,
            type: 'available',
            section: getSeatSection(row, col.label),
            isEmergencyExit: isEmergencyRow,
            boarded: !!boardedPassenger,
            pending: !!pendingPassenger,
            passenger: boardedPassenger || pendingPassenger
          });
        }
      }
      newSeatMap.push(rowData);
    }
    
    setSeatMap(newSeatMap);
  };
  
  // Determine the seat's section (A0, B0, C0, etc.)
  const getSeatSection = (row, col) => {
    // Try to find the section in the new format
    if (flightDetails.seatConfig && flightDetails.seatConfig.rows) {
      const rowConfig = flightDetails.seatConfig.rows.find(r => r.number === row);
      if (rowConfig && rowConfig.section) {
        return rowConfig.section;
      }
    }
    
    // Fallback to old system
    if (row <= 10) return 'A0';
    if (row <= 20) return 'B0';
    return 'C0';
  };
  
  // Render seat content (number or icon)
  const renderSeatContent = (seat) => {
    if (seat.type === 'aisle') return null;
    
    // For blocked seats
    if (seat.type === 'blocked' || seat.isBlocked) {
      return <span className="text-gray-800">X</span>;
    }
    
    if (seat.boarded) {
      // Show icon based on passenger type
      if (seat.passenger?.passengerType === 'CHD') {
        return <FaChild className="text-white" />;
      } else if (seat.passenger?.passengerType === 'INF') {
        return <FaBaby className="text-white" />;
      } else {
        // For adults, differentiate by gender
        if (seat.passenger?.gender === 'F') {
          return <FaFemale className="text-white" />;
        } else {
          return <FaMale className="text-white" />;
        }
      }
    } else if (seat.pending) {
      // Different icon for pending boarding
      return <BsFillPersonFill className="text-gray-700" />;
    }
    
    // For available seats, show the ID
    return seat.id;
  };
  
  // Get CSS classes for each seat
  const getSeatClassNames = (seat) => {
    let classes = 'w-8 h-8 m-1 flex items-center justify-center rounded text-xs font-medium ';
    
    if (seat.type === 'aisle') {
      return 'w-4 h-8 m-1';
    }
    
    // Blocked seat
    if (seat.type === 'blocked' || seat.isBlocked) {
      return classes + 'bg-gray-400 text-gray-800 cursor-not-allowed opacity-70';
    }
    
    if (seat.boarded) {
      // Different colors based on passenger type
      if (seat.passenger?.passengerType === 'CHD') {
        classes += 'bg-orange-500 text-white'; // Child
      } else if (seat.passenger?.passengerType === 'INF') {
        classes += 'bg-purple-500 text-white'; // Infant
      } else {
        // For adults, differentiate by gender
        if (seat.passenger?.gender === 'F') {
          classes += 'bg-pink-600 text-white'; // Female
        } else {
          classes += 'bg-blue-600 text-white'; // Male (default)
        }
      }
    } else if (seat.pending) {
      classes += 'bg-gray-300 text-gray-700 border border-gray-400'; // Pending boarding
    } else if (selectedSeat === seat.id) {
      classes += 'bg-green-500 text-white ring-2 ring-green-700';
    } else if (seat.isEmergencyExit) {
      classes += 'bg-orange-100 text-orange-800 border border-orange-300';
    } else {
      classes += 'bg-blue-100 text-blue-800';
    }
    
    return classes;
  };
  
  // SVG for the airplane nose (front)
  const AirplaneNose = () => (
    <div className="flex justify-center mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="300 270.4008 99.247 29.5992" width="99.247px" height="29.5992px" className="w-32">
        <g id="object-6">
          <path style={{fill: "rgb(216, 216, 216)", stroke: "rgb(0, 0, 0)"}} d="M 300 299.984 C 300 299.984 332.47880242005635 270.4997696653543 348.933 270.401 C 365.5581448573426 270.3012041888675 399.247 300 399.247 300" id="object-2"/>
          <polygon style={{stroke: "rgb(0, 0, 0)", fill: "rgb(13, 20, 34)"}} points="321.118 298.765 331.904 298.869 347.947 294.277 348.032 287.185" id="object-4"/>
          <polygon style={{stroke: "rgb(0, 0, 0)", fill: "rgb(13, 20, 34)", transformBox: "fill-box", transformOrigin: "50% 50%"}} points="350.823 287.289 361.608 287.185 377.651 291.777 377.737 298.869" id="object-5" transform="matrix(-1, 0, 0, -1, 0.000011, 0.00005)"/>
        </g>
      </svg>
    </div>
  );

  // SVG for the airplane tail
  const AirplaneTail = () => (
    <div className="flex justify-center mt-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="300.753 384.66 99.247 15.3392" width="99.247px" height="15.3392px" className="w-32">
        <path style={{fill: "rgb(216, 216, 216)", stroke: "rgb(0, 0, 0)"}} d="M 300.753 384.668 C 300.753 384.668 333.2516548787178 399.93569098561636 349.686 399.999 C 366.33080878626566 400.06311977058334 400 384.66 400 384.66" id="path-1"/>
      </svg>
    </div>
  );
  
  // Calculate boarding statistics
const totalCheckedIn = boardedPassengers.length + pendingPassengers.length;
const boardedCount = boardedPassengers.length;
  
const boardingPercentage = totalCheckedIn > 0 
    ? Math.round((boardedCount / totalCheckedIn) * 100) 
    : 0;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Mapa de Asientos</h2>
        <div className="text-sm">
          
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-gray-300 mr-2 flex items-center justify-center rounded">
            <BsFillPersonFill className="text-gray-700" />
          </div>
          <span className="text-sm">Asignado</span>
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
                title={
                  seat.passenger 
                    ? `${seat.passenger.lastName}, ${seat.passenger.firstName} - ${seat.boarded ? 'Embarcado' : 'Pendiente'}`
                    : null
                }
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
    </div>
  );
};

export default BoardingSeatMap;