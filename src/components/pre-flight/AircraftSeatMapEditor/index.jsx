// src/components/pre-flight/AircraftSeatMapEditor/index.jsx
import { useState, useEffect, useRef } from 'react';
import Modal from '../../common/Modal';
import EditorToolbar from './EditorToolbar';
import GeneralInfo from './GeneralInfo';
import SectionPanel from './SectionPanel';
import RecentConfigsPanel from './RecentConfigsPanel';
import SeatMap from './SeatMap';

const AircraftSeatMapEditor = ({ isOpen, onClose, initialConfig, onSave }) => {
  // Estados principales
  const [configName, setConfigName] = useState('Nueva Configuración');
  const [aircraftType, setAircraftType] = useState('');
  const [aircraftModel, setAircraftModel] = useState('');
  const [recentConfigs, setRecentConfigs] = useState([]);
  
  // Estados para el editor visual
  const [rows, setRows] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Referencias para el editor
  const fileInputRef = useRef(null);
  
  // Estado para secciones de la aeronave (A0, B0, C0, etc.)
  const [sections, setSections] = useState([
    { id: 'A0', name: 'Cabina Principal', color: '#3b82f6' },
    { id: 'B0', name: 'Sección Central', color: '#10b981' },
    { id: 'C0', name: 'Sección Trasera', color: '#f59e0b' }
  ]);

  // Estado para rastrear la sección resaltada
const [highlightedSection, setHighlightedSection] = useState(null);
  
  // Inicializar con configuración existente
  useEffect(() => {
    if (initialConfig) {
      try {
        setConfigName(initialConfig.name || 'Configuración Importada');
        setAircraftType(initialConfig.aircraftType || '');
        setAircraftModel(initialConfig.aircraftModel || '');
        
        if (initialConfig.sections && Array.isArray(initialConfig.sections)) {
          setSections(initialConfig.sections);
        }
        
        if (initialConfig.rows && Array.isArray(initialConfig.rows)) {
          setRows(initialConfig.rows);
          // Guardar estado inicial en historial
          addToHistory(initialConfig.rows);
        } else {
          // Inicializar con mapa vacío
          initializeEmptyMap();
        }
      } catch (error) {
        console.error("Error al cargar la configuración inicial:", error);
        initializeEmptyMap();
      }
    } else {
      initializeEmptyMap();
    }
    
    // Cargar configuraciones recientes desde localStorage
    const savedConfigs = localStorage.getItem('recentAircraftConfigs');
    if (savedConfigs) {
      try {
        setRecentConfigs(JSON.parse(savedConfigs));
      } catch (e) {
        console.error("Error al cargar configuraciones recientes:", e);
      }
    }
  }, [initialConfig, isOpen]);
  
  // Inicializar mapa vacío
// Función mejorada para inicializar el mapa con diferentes secciones

const initializeEmptyMap = () => {
  // Crear una configuración predeterminada con diferentes secciones
  const defaultRows = Array(10).fill().map((_, rowIndex) => {
    // Asignar secciones basadas en el rango de filas
    let sectionId;
    if (rowIndex < 3) {
      sectionId = 'A0'; // Primeras 3 filas
    } else if (rowIndex < 6) {
      sectionId = 'B0'; // Filas 4-6
    } else {
      sectionId = 'C0'; // Resto de las filas
    }
    
    return {
      id: `row-${rowIndex + 1}`,
      number: rowIndex + 1,
      section: sectionId,
      isEmergencyExit: rowIndex === 4, // La fila 5 como salida de emergencia por defecto
      seats: [
        { id: `${rowIndex + 1}A`, label: 'A', type: 'seat', position: 'window', side: 'left' },
        { id: `${rowIndex + 1}B`, label: 'B', type: 'seat', position: 'middle', side: 'left' },
        { id: `${rowIndex + 1}C`, label: 'C', type: 'seat', position: 'aisle', side: 'left' },
        { id: `aisle-${rowIndex + 1}`, type: 'aisle', width: 1 },
        { id: `${rowIndex + 1}D`, label: 'D', type: 'seat', position: 'aisle', side: 'right' },
        { id: `${rowIndex + 1}E`, label: 'E', type: 'seat', position: 'middle', side: 'right' },
        { id: `${rowIndex + 1}F`, label: 'F', type: 'seat', position: 'window', side: 'right' }
      ]
    };
  });
  
  setRows(defaultRows);
  addToHistory(defaultRows);
  
  // Actualizar etiquetas de secciones después de inicializar
  setTimeout(updateSectionLabels, 50);
};
  
  // Gestión del historial (undo/redo)
  const addToHistory = (newState) => {
    // Si estamos en un punto intermedio del historial, descartar futuro
    const newHistory = historyIndex < 0 
      ? [newState] 
      : [...historyStack.slice(0, historyIndex + 1), newState];
    
    // Limitar historial a 20 estados para evitar consumo excesivo de memoria
    const limitedHistory = newHistory.slice(-20);
    
    setHistoryStack(limitedHistory);
    setHistoryIndex(limitedHistory.length - 1);
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setRows(historyStack[newIndex]);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setRows(historyStack[newIndex]);
    }
  };
  
// Función mejorada para añadir filas con herencia de sección

const addRow = (position = 'end') => {
  try {
    const newRows = [...rows];
    
    // Determinar el número para la nueva fila
    let newRowNumber;
    
    // Determinar la sección para la nueva fila
    let newSectionId = 'A0'; // Valor por defecto, por si no hay otras filas
    
    if (position === 'start') {
      // Si se agrega al inicio, verificar si ya hay una fila con número 1
      const hasRowOne = newRows.some(r => r.number === 1);
      
      // Tomar la sección de la primera fila si existe
      if (newRows.length > 0) {
        newSectionId = newRows[0].section || 'A0';
      }
      
      if (hasRowOne) {
        // Si ya existe fila 1, incrementar todas las filas y usar 1 para la nueva
        newRows.forEach(row => {
          row.number += 1;
          
          // Actualizar IDs de asientos
          row.seats.forEach(seat => {
            if (seat.type === 'seat') {
              // Extraer la letra del asiento actual
              const seatLetter = seat.id.substring(String(row.number - 1).length);
              // Crear nuevo ID
              seat.id = `${row.number}${seatLetter}`;
            } else if (seat.type === 'aisle') {
              seat.id = `aisle-${row.number}`;
            }
          });
        });
        
        // La nueva fila será la número 1
        newRowNumber = 1;
      } else {
        // Si no hay fila 1, usar un número menor que el mínimo actual
        const minRowNumber = Math.min(...newRows.map(r => r.number), Number.MAX_SAFE_INTEGER);
        newRowNumber = Math.max(1, minRowNumber - 1); // Asegurarse que no sea menor que 1
      }
    } else if (position === 'end') {
      // Si se agrega al final, usar un número mayor que el máximo actual
      const maxRowNumber = Math.max(...newRows.map(r => r.number || 0), 0);
      newRowNumber = maxRowNumber + 1;
      
      // Tomar la sección de la última fila si existe
      if (newRows.length > 0) {
        newSectionId = newRows[newRows.length - 1].section || 'A0';
      }
    } else if (typeof position === 'number') {
      // Si se agrega después de una fila específica
      if (position >= 0 && position < newRows.length) {
        // Determinar el número para la nueva fila: entre la actual y la siguiente
        const currentRowNumber = newRows[position].number;
        const nextRowNumber = position + 1 < newRows.length ? 
                              newRows[position + 1].number : 
                              currentRowNumber + 1;
        
        // Tomar la sección de la fila actual (la que está antes de la nueva)
        newSectionId = newRows[position].section || 'A0';
        
        if (nextRowNumber > currentRowNumber + 1) {
          // Si hay espacio entre números, usar el siguiente
          newRowNumber = currentRowNumber + 1;
        } else {
          // Si no hay espacio, incrementar todas las filas siguientes
          for (let i = position + 1; i < newRows.length; i++) {
            newRows[i].number += 1;
            
            // Actualizar IDs de asientos en filas incrementadas
            newRows[i].seats.forEach(seat => {
              if (seat.type === 'seat') {
                // Extraer la letra del asiento
                const seatLetter = seat.label;
                // Crear nuevo ID
                seat.id = `${newRows[i].number}${seatLetter}`;
              } else if (seat.type === 'aisle') {
                seat.id = `aisle-${newRows[i].number}`;
              }
            });
          }
          
          // La nueva fila toma el número siguiente a la actual
          newRowNumber = currentRowNumber + 1;
        }
      } else {
        console.error(`Posición ${position} fuera de rango`);
        return;
      }
    }
    
    // Si estamos añadiendo antes de una fila específica
    if (typeof position === 'number' && position >= 0 && position < newRows.length - 1) {
      // Determinar si debemos heredar la sección de la fila anterior o siguiente
      // Aquí decidimos heredar de la anterior (la que está en la posición especificada)
      newSectionId = newRows[position].section || 'A0';
    }
    
    console.log(`Usando sección ${newSectionId} para la nueva fila`);
    
    // Tomar como modelo la primera fila existente o crear configuración por defecto
    const templateRow = newRows.length > 0 ? newRows[0] : {
      seats: [
        { label: 'A', type: 'seat', position: 'window', side: 'left' },
        { label: 'B', type: 'seat', position: 'middle', side: 'left' },
        { label: 'C', type: 'seat', position: 'aisle', side: 'left' },
        { type: 'aisle', width: 1 },
        { label: 'D', type: 'seat', position: 'aisle', side: 'right' },
        { label: 'E', type: 'seat', position: 'middle', side: 'right' },
        { label: 'F', type: 'seat', position: 'window', side: 'right' }
      ]
    };
    
    // Crear nueva fila basada en la plantilla
    const newRow = {
      id: `row-${newRowNumber}`,
      number: newRowNumber,
      section: newSectionId, // Usar la sección determinada anteriormente
      isEmergencyExit: false,
      seats: templateRow.seats.map(seat => {
        if (seat.type === 'seat') {
          return {
            ...seat,
            id: `${newRowNumber}${seat.label}`,
          };
        } else {
          return {
            ...seat,
            id: `${seat.type}-${newRowNumber}`
          };
        }
      })
    };
    
    // Insertar la nueva fila en la posición indicada
    if (position === 'start') {
      newRows.unshift(newRow);
    } else if (position === 'end') {
      newRows.push(newRow);
    } else if (typeof position === 'number' && position >= 0 && position < newRows.length) {
      newRows.splice(position + 1, 0, newRow);
    }
    
    // Actualizar el estado
    setRows(newRows);
    addToHistory(newRows);
    
    console.log(`Fila añadida: ${newRowNumber} en posición ${position} con sección ${newSectionId}`);
    
    // Actualizar etiquetas de secciones
    setTimeout(updateSectionLabels, 50);
    
  } catch (error) {
    console.error("Error al añadir fila:", error);
    
    try {
      alert(`No se pudo añadir la fila. Por favor intente nuevamente.`);
    } catch (e) {
      console.error("Error crítico en addRow:", e);
    }
  }
};
  
  const deleteRow = (rowIndex) => {
    const newRows = [...rows];
    newRows.splice(rowIndex, 1);
    setRows(newRows);
    addToHistory(newRows);
  };

  const updateRowNumber = (rowIndex, newNumber) => {
    try {
      // Verificaciones de seguridad
      if (rowIndex < 0 || rowIndex >= rows.length) {
        console.error(`Índice de fila ${rowIndex} fuera de rango`);
        return;
      }
      
      // Validación de número de fila
      if (isNaN(newNumber) || newNumber <= 0 || newNumber > 999) {
        console.error(`Número de fila inválido: ${newNumber}. Debe ser un número entre 1 y 999.`);
        return;
      }
      
      // Verificar si el número de fila ya está en uso
      const duplicateRow = rows.find((r, idx) => r.number === newNumber && idx !== rowIndex);
      if (duplicateRow) {
        console.error(`Ya existe una fila con el número ${newNumber}`);
        alert(`Ya existe una fila con el número ${newNumber}. Por favor elija otro número.`);
        return;
      }
      
      const newRows = [...rows];
      const currentRow = newRows[rowIndex];
      
      // Guardar el número anterior para actualizar IDs
      const oldNumber = currentRow.number;
      
      // Actualizar el número de la fila
      currentRow.number = newNumber;
      
      // Actualizar los IDs de los asientos en la fila
      currentRow.seats.forEach(seat => {
        if (seat.type === 'seat') {
          // Solo actualizar si el ID sigue el patrón esperado
          if (seat.id.startsWith(`${oldNumber}`)) {
            // Reemplazar la parte del número en el ID
            seat.id = seat.id.replace(`${oldNumber}`, `${newNumber}`);
          } else {
            // Si el ID no sigue el patrón esperado, regenerarlo
            seat.id = `${newNumber}${seat.label}`;
            console.warn(`ID de asiento regenerado: ${seat.id}`);
          }
        } else if (seat.type === 'aisle') {
          seat.id = `aisle-${newNumber}`;
        }
      });
      
      setRows(newRows);
      addToHistory(newRows);
      
      console.log(`Número de fila actualizado: ${oldNumber} → ${newNumber}`);
      
    } catch (error) {
      console.error("Error al actualizar número de fila:", error);
      
      try {
        alert(`No se pudo actualizar el número de fila. Por favor intente nuevamente.`);
      } catch (e) {
        console.error("Error crítico en updateRowNumber:", e);
      }
    }
  };
  
  const toggleEmergencyExit = (rowIndex) => {
    const newRows = [...rows];
    newRows[rowIndex].isEmergencyExit = !newRows[rowIndex].isEmergencyExit;
    setRows(newRows);
    addToHistory(newRows);
  };
  
  // Asignar sección a una fila
  const assignSectionToRow = (rowIndex, sectionId) => {
    const newRows = [...rows];
    newRows[rowIndex].section = sectionId;
    setRows(newRows);
    addToHistory(newRows);
  };
  
  // Funciones para manipular asientos
  // Función mejorada para añadir asientos en AircraftSeatMapEditor/index.jsx

const addSeat = (rowIndex, position) => {
  try {
    // Verificaciones de seguridad
    if (rowIndex < 0 || rowIndex >= rows.length) {
      console.error(`Índice de fila ${rowIndex} fuera de rango`);
      return;
    }
    
    const newRows = [...rows];
    const row = newRows[rowIndex];
    
    // Validar posición
    if (position < 0 || position > row.seats.length) {
      console.error(`Posición ${position} fuera de rango para esta fila`);
      return;
    }
    
    // Encontrar el índice del pasillo (si existe)
    const aisleIndex = row.seats.findIndex(item => item.type === 'aisle');
    
    // Verificar si estamos añadiendo un asiento a la izquierda o derecha del pasillo
    const side = aisleIndex !== -1 && position <= aisleIndex ? 'left' : 'right';
    
    // Obtener todos los asientos actuales de ese lado
    const sideSeats = row.seats.filter(item => 
      item.type === 'seat' && item.side === side
    );
    
    // Generar nueva etiqueta para el asiento
    let newLabel = '';
    
    // Letras disponibles por lado
    const leftLabels = ['A', 'B', 'C'];
    const rightLabels = ['D', 'E', 'F'];
    const extendedLeftLabels = ['G', 'H', 'J']; // Evitamos I que se confunde con 1
    const extendedRightLabels = ['K', 'L', 'M'];
    
    // Conjunto de todas las etiquetas usadas en la fila actual
    const usedLabels = new Set(
      row.seats
        .filter(s => s.type === 'seat')
        .map(s => s.label)
    );
    
    // Función para encontrar la próxima etiqueta disponible
    const findNextAvailableLabel = (preferredLabels, fallbackLabels, otherLabels) => {
      // Primero intentar con las etiquetas preferidas
      for (const label of preferredLabels) {
        if (!usedLabels.has(label)) {
          return label;
        }
      }
      
      // Luego con las fallback
      for (const label of fallbackLabels) {
        if (!usedLabels.has(label)) {
          return label;
        }
      }
      
      // Finalmente con las otras
      for (const label of otherLabels) {
        if (!usedLabels.has(label)) {
          return label;
        }
      }
      
      // Si todo está usado, crear una etiqueta numérica
      let counter = 1;
      while (true) {
        const candidateLabel = side === 'left' ? `L${counter}` : `R${counter}`;
        if (!usedLabels.has(candidateLabel)) {
          return candidateLabel;
        }
        counter++;
      }
    };
    
    // Asignar etiqueta basada en el lado
    if (side === 'left') {
      newLabel = findNextAvailableLabel(leftLabels, extendedLeftLabels, rightLabels);
    } else {
      newLabel = findNextAvailableLabel(rightLabels, extendedRightLabels, leftLabels);
    }
    
    // Determinar posición (window, middle, aisle)
    let seatPosition = 'middle';
    
    // Si hay pasillo
    if (aisleIndex !== -1) {
      // Comprobar si será un asiento de ventana
      if ((side === 'left' && position === 0) || 
          (side === 'right' && position === row.seats.length)) {
        seatPosition = 'window';
      } 
      // Comprobar si será un asiento de pasillo
      else if ((side === 'left' && position === aisleIndex) ||
              (side === 'right' && position === aisleIndex + 1)) {
        seatPosition = 'aisle';
      }
    } else {
      // Sin pasillo, los asientos extremos son ventanas
      if (position === 0 || position === row.seats.length) {
        seatPosition = 'window';
      }
    }
    
    // Crear nuevo asiento
    const newSeat = {
      id: `${row.number}${newLabel}`,
      label: newLabel,
      type: 'seat',
      position: seatPosition,
      side
    };
    
    // Insertar asiento en la posición deseada
    row.seats.splice(position, 0, newSeat);
    
    // Actualizar el estado
    setRows(newRows);
    addToHistory(newRows);
    
    console.log(`Asiento añadido: ${newSeat.id} en fila ${row.number}, posición ${position}`);
    
  } catch (error) {
    console.error("Error al añadir asiento:", error);
    
    try {
      alert(`No se pudo añadir el asiento. Por favor intente nuevamente.`);
    } catch (e) {
      console.error("Error crítico en addSeat:", e);
    }
  }
};
  
const deleteSeat = (rowIndex, seatIndex) => {
  try {
    // Verificaciones de seguridad
    if (rowIndex < 0 || rowIndex >= rows.length) {
      console.error(`Índice de fila ${rowIndex} fuera de rango`);
      return;
    }
    
    const newRows = [...rows];
    const row = newRows[rowIndex];
    
    if (seatIndex < 0 || seatIndex >= row.seats.length) {
      console.error(`Índice de asiento ${seatIndex} fuera de rango`);
      return;
    }
    
    // Verificar que no sea un pasillo
    if (row.seats[seatIndex].type === 'aisle') {
      console.error("No se puede eliminar un pasillo directamente");
      return;
    }
    
    // Guardar información del asiento para el log
    const seatToDelete = row.seats[seatIndex];
    
    // Eliminar el asiento
    row.seats.splice(seatIndex, 1);
    
    // Si no quedan asientos en la fila, mostrar advertencia
    if (row.seats.filter(s => s.type === 'seat').length === 0) {
      console.warn(`La fila ${row.number} no tiene asientos`);
    }
    
    // Actualizar el estado
    setRows(newRows);
    addToHistory(newRows);
    
    console.log(`Asiento eliminado: ${seatToDelete.id} de la fila ${row.number}`);
    
  } catch (error) {
    console.error("Error al eliminar asiento:", error);
    
    try {
      alert(`No se pudo eliminar el asiento. Por favor intente nuevamente.`);
    } catch (e) {
      console.error("Error crítico en deleteSeat:", e);
    }
  }
};
  
  const toggleSeatProperty = (rowIndex, seatIndex, property) => {
    const newRows = [...rows];
    const seat = newRows[rowIndex].seats[seatIndex];
    
    if (property === 'blocked') {
      seat.isBlocked = !seat.isBlocked;
    } else if (property === 'premium') {
      seat.isPremium = !seat.isPremium;
    } else if (property === 'special') {
      seat.isSpecial = !seat.isSpecial;
    }
    
    setRows(newRows);
    addToHistory(newRows);
  };

// Función mejorada para actualizar etiquetas de asientos en AircraftSeatMapEditor/index.jsx

// Para agregar a tu archivo AircraftSeatMapEditor/index.jsx
const updateSeatLabel = (rowIndex, seatIndex, newLabel) => {
  try {
    // Verificaciones de seguridad
    if (rowIndex < 0 || rowIndex >= rows.length) {
      console.error(`Índice de fila ${rowIndex} fuera de rango`);
      return;
    }
    
    const row = rows[rowIndex];
    if (seatIndex < 0 || seatIndex >= row.seats.length) {
      console.error(`Índice de asiento ${seatIndex} fuera de rango`);
      return;
    }
    
    const seat = row.seats[seatIndex];
    if (seat.type !== 'seat') {
      console.error(`No se puede actualizar etiqueta en elemento tipo "${seat.type}"`);
      return;
    }
    
    // Validar formato de etiqueta
    newLabel = newLabel.trim().toUpperCase();
    if (!newLabel) {
      console.error("La etiqueta no puede estar vacía");
      return;
    }
    
    // Verificar que no exista ya un asiento con esta etiqueta en la misma fila
    const duplicateInRow = row.seats.some((s, idx) => 
      s.type === 'seat' && 
      s.label === newLabel && 
      idx !== seatIndex
    );
    
    if (duplicateInRow) {
      console.error(`Ya existe un asiento con etiqueta ${newLabel} en la fila ${row.number}`);
      return;
    }
    
    // Clonar las filas para no mutar el estado directamente
    const newRows = [...rows];
    const currentRow = newRows[rowIndex];
    const currentSeat = currentRow.seats[seatIndex];
    
    // Guardar la etiqueta anterior para actualizar ID
    const oldLabel = currentSeat.label;
    
    // Actualizar la etiqueta
    currentSeat.label = newLabel;
    
    // Actualizar ID del asiento
    // Ejemplo: cambiar "12A" a "12B" si la fila es 12 y cambiamos "A" por "B"
    if (currentSeat.id.includes(currentRow.number.toString() + oldLabel)) {
      currentSeat.id = currentSeat.id.replace(
        currentRow.number.toString() + oldLabel, 
        currentRow.number.toString() + newLabel
      );
    } else {
      // Si por alguna razón el ID no sigue el patrón esperado, crear uno nuevo
      currentSeat.id = `${currentRow.number}${newLabel}`;
      console.warn(`ID de asiento regenerado: ${currentSeat.id}`);
    }
    
    // Actualizar el estado
    setRows(newRows);
    
    // Añadir al historial para poder deshacer/rehacer
    addToHistory(newRows);
    
    console.log(`Etiqueta actualizada: ${oldLabel} → ${newLabel} en fila ${currentRow.number}`);
    
  } catch (error) {
    console.error("Error al actualizar etiqueta de asiento:", error);
    
    // Intentar evitar que la aplicación se rompa por este error
    try {
      // Notificar al usuario de manera amigable
      alert(`No se pudo actualizar la etiqueta del asiento. Por favor intente nuevamente.`);
    } catch (e) {
      // Si ni siquiera podemos mostrar la alerta, al menos registrar el error
      console.error("Error crítico en updateSeatLabel:", e);
    }
  }
};
  
  // Gestión de secciones
  const addSection = () => {
    // Generar ID único para la nueva sección
    const sectionIds = sections.map(s => s.id);
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let newId = '';
    
    for (const letter of letters) {
      const potentialId = `${letter}0`;
      if (!sectionIds.includes(potentialId)) {
        newId = potentialId;
        break;
      }
    }
    
    // Si no se encontró un ID disponible, crear uno con número
    if (!newId) {
      let counter = 1;
      while (!newId) {
        const potentialId = `S${counter}`;
        if (!sectionIds.includes(potentialId)) {
          newId = potentialId;
        }
        counter++;
      }
    }
    
    // Generar color aleatorio para la sección
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const usedColors = sections.map(s => s.color);
    const availableColors = colors.filter(c => !usedColors.includes(c));
    const color = availableColors.length > 0 
      ? availableColors[0] 
      : `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    const newSection = {
      id: newId,
      name: `Sección ${newId}`,
      color
    };
    
    setSections([...sections, newSection]);
  };
  
  const updateSection = (sectionId, updates) => {
    const newSections = sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    );
    setSections(newSections);
  };
  
  const deleteSection = (sectionId) => {
    // Verificar si la sección está en uso
    const sectionInUse = rows.some(row => row.section === sectionId);
    
    if (sectionInUse) {
      alert(`No se puede eliminar la sección ${sectionId} porque está en uso.`);
      return;
    }
    
    const newSections = sections.filter(section => section.id !== sectionId);
    setSections(newSections);
  };

  // Función para actualizar las etiquetas de secciones basadas en las filas
// Añadir en AircraftSeatMapEditor/index.jsx

const updateSectionLabels = () => {
  try {
    // Crear un mapa para agrupar filas por sección
    const sectionRows = {};
    
    // Recorrer todas las filas y agruparlas por su sección
    rows.forEach(row => {
      if (!row.section) return;
      
      if (!sectionRows[row.section]) {
        sectionRows[row.section] = [];
      }
      
      sectionRows[row.section].push(row.number);
    });
    
    // Para cada sección, actualizar su nombre con el rango de filas
    const newSections = sections.map(section => {
      // Si no hay filas para esta sección, mantener el nombre original
      if (!sectionRows[section.id] || sectionRows[section.id].length === 0) {
        return section;
      }
      
      // Ordenar los números de fila
      const rowNumbers = sectionRows[section.id].sort((a, b) => a - b);
      
      // Extraer el nombre base (sin el rango de filas)
      let baseName = section.name;
      // Si el nombre ya incluye "Filas X-Y", quitarlo
      if (baseName.includes("Filas ")) {
        baseName = baseName.replace(/Filas \d+(-\d+)?:?\s*/, "");
      }
      
      // Crear el nuevo nombre con el rango de filas
      let newName;
      if (rowNumbers.length === 1) {
        newName = `Filas ${rowNumbers[0]}: ${baseName}`;
      } else {
        const firstRow = rowNumbers[0];
        const lastRow = rowNumbers[rowNumbers.length - 1];
        
        // Verificar si las filas son consecutivas
        const isConsecutive = lastRow - firstRow === rowNumbers.length - 1;
        
        if (isConsecutive) {
          newName = `Filas ${firstRow}-${lastRow}: ${baseName}`;
        } else {
          // Si no son consecutivas, listar todas o usar los extremos
          if (rowNumbers.length <= 5) {
            newName = `Filas ${rowNumbers.join(', ')}: ${baseName}`;
          } else {
            newName = `Filas ${firstRow}-${lastRow} (${rowNumbers.length}): ${baseName}`;
          }
        }
      }
      
      // Devolver la sección actualizada sin mutar el original
      return {
        ...section,
        name: newName.trim()
      };
    });
    
    // Actualizar el estado de las secciones
    setSections(newSections);
    
    console.log("Etiquetas de secciones actualizadas");
    
  } catch (error) {
    console.error("Error al actualizar etiquetas de secciones:", error);
  }
};

// Función para resaltar filas de una sección
const highlightSection = (sectionId) => {
  setHighlightedSection(sectionId);
  
  // Quitar el resaltado después de un tiempo
  setTimeout(() => {
    setHighlightedSection(null);
  }, 2000); // 2 segundos
};


  
  // Importar/Exportar configuraciones
    const exportConfig = () => {
    try {
      // Crear objeto de configuración completa
      const config = {
        name: configName,
        aircraftType,
        aircraftModel,
        sections,
        rows,
        createdAt: new Date().toISOString(),
        version: '2.0'
      };
      
      // Convertir a JSON con formato legible
      const jsonConfig = JSON.stringify(config, null, 2);
      
      // Crear blob y descargar archivo
      const blob = new Blob([jsonConfig], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Usar un nombre de archivo basado en la configuración
      const safeFileName = configName
        .replace(/[^a-zA-Z0-9_\-]/g, '_') // Reemplazar caracteres no seguros
        .replace(/_{2,}/g, '_') // Evitar múltiples guiones consecutivos
        .toLowerCase();
      
      link.download = `config_${safeFileName}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("Configuración exportada:", config);
      alert("Configuración exportada correctamente. Archivo descargado.");
      
      // Guardar en configuraciones recientes
      saveToRecentConfigs(config);
    } catch (error) {
      console.error("Error al exportar configuración:", error);
      alert("Error al exportar: " + error.message);
    }
  };
  
  const importConfig = () => {
    try {
      fileInputRef.current.click();
    } catch (error) {
      console.error("Error al abrir selector de archivos:", error);
      alert("Error al importar: " + error.message);
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log("No se seleccionó ningún archivo");
      return;
    }
    
    console.log("Archivo seleccionado:", file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target.result;
        console.log("Contenido del archivo leído");
        
        const config = JSON.parse(jsonContent);
        console.log("Configuración parseada:", config);
        
        // Validar que el archivo tenga el formato esperado
        if (!config.name) {
          throw new Error("El archivo no contiene una configuración válida (falta nombre)");
        }
        
        setConfigName(config.name || 'Configuración Importada');
        setAircraftType(config.aircraftType || '');
        setAircraftModel(config.aircraftModel || '');
        
        if (config.sections && Array.isArray(config.sections)) {
          setSections(config.sections);
        }
        
        // Manejar tanto el formato nuevo como el antiguo
        if (config.rows && Array.isArray(config.rows)) {
          console.log("Formato nuevo detectado (rows)");
          setRows(config.rows);
        } else if (config.rowCount && config.columnConfig) {
          console.log("Formato antiguo detectado, convirtiendo");
          const convertedConfig = convertOldFormatToNew(config);
          setRows(convertedConfig.rows);
        } else {
          throw new Error("Formato de configuración no reconocido");
        }
        
        // Reiniciar historial con este estado
        const newRows = config.rows || (convertOldFormatToNew(config).rows);
        setHistoryStack([newRows]);
        setHistoryIndex(0);
        
        // Guardar en configuraciones recientes
        saveToRecentConfigs(config);
        
        alert(`Configuración "${config.name}" importada exitosamente`);
      } catch (error) {
        console.error("Error al importar la configuración:", error);
        alert(`Error al importar la configuración: ${error.message}`);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Error al leer el archivo:", error);
      alert("Error al leer el archivo");
    };
    
    reader.readAsText(file);
    
    // Limpiar input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = null;
  };
  
  // Guardar en configuraciones recientes
  const saveToRecentConfigs = (config) => {
    // Limitar a 10 configuraciones recientes
    const configMeta = {
      id: crypto.randomUUID(),
      name: config.name,
      aircraftType: config.aircraftType,
      aircraftModel: config.aircraftModel,
      timestamp: new Date().toISOString(),
      rowCount: config.rows.length,
      seatCount: config.rows.reduce((total, row) => 
        total + row.seats.filter(s => s.type === 'seat').length, 0
      ),
      config
    };
    
    // Evitar duplicados basados en nombre exacto
    const updatedConfigs = [
      configMeta,
      ...recentConfigs.filter(c => c.name !== config.name)
    ].slice(0, 10);
    
    setRecentConfigs(updatedConfigs);
    localStorage.setItem('recentAircraftConfigs', JSON.stringify(updatedConfigs));
  };
  
  // Función loadFromRecentConfig mejorada - para usar en index.jsx
  const loadFromRecentConfig = (configId) => {
    console.log("Intentando cargar configuración con ID:", configId);
    
    // Buscar la configuración por ID
    const configMeta = recentConfigs.find(c => c.id === configId);
    
    if (!configMeta || !configMeta.config) {
      console.error("No se encontró la configuración o está incompleta:", configId);
      alert("No se pudo cargar la configuración seleccionada");
      return;
    }
    
    try {
      const config = configMeta.config;
      console.log("Cargando configuración:", config);
      
      // Actualizar estados con la configuración cargada
      setConfigName(config.name || 'Configuración Cargada');
      setAircraftType(config.aircraftType || '');
      setAircraftModel(config.aircraftModel || '');
      
      // Cargar secciones
      if (config.sections && Array.isArray(config.sections)) {
        setSections(config.sections);
      }
      
      // Cargar filas, intentando primero el nuevo formato
      if (config.rows && Array.isArray(config.rows)) {
        setRows(config.rows);
      } 
      // Si no tiene el formato nuevo, intentar convertir del formato antiguo
      else if (config.rowCount && config.columnConfig) {
        const convertedConfig = convertOldFormatToNew(config);
        setRows(convertedConfig.rows);
      } else {
        console.error("Formato de configuración no reconocido");
        alert("El formato de la configuración no es compatible");
        return;
      }
      
      // Reiniciar historial con este estado
      setHistoryStack([config.rows || []]);
      setHistoryIndex(0);
      
      console.log("Configuración cargada exitosamente");
      alert("Configuración cargada exitosamente: " + config.name);
    } catch (error) {
      console.error("Error al cargar la configuración:", error);
      alert("Error al cargar la configuración: " + error.message);
    }
  };
  
  // Guardar configuración final
  const handleSaveConfig = () => {
    try {
      // Crear objeto de configuración en el nuevo formato
      const newFormatConfig = {
        name: configName,
        aircraftType,
        aircraftModel,
        sections,
        rows,
        createdAt: new Date().toISOString(),
        version: '2.0'
      };
      
      // Crear también una versión compatible con el formato antiguo
      // para que no se rompa el resto de la aplicación
      const backwardsCompatibleConfig = {
        ...newFormatConfig,
        type: aircraftType || aircraftModel,
        rowCount: rows.length,
        // Recrear columnConfig basado en la primera fila (asumiendo que todas las filas tienen la misma estructura)
        columnConfig: rows.length > 0 ? 
          rows[0].seats.map((seat, index) => ({
            id: index + 1,
            label: seat.type === 'seat' ? seat.label : '',
            type: seat.type
          })) : 
          [],
        // Mantener skipRows y emergencyRows si existen
        skipRows: [], // Puedes llenarlo con números de filas que desees omitir
        emergencyRows: rows
          .filter(row => row.isEmergencyExit)
          .map(row => row.number)
      };
      
      // Llamar a onSave con la configuración que mantiene compatibilidad
      onSave(backwardsCompatibleConfig);
      
      // Guardar en configuraciones recientes
      saveToRecentConfigs(newFormatConfig);
      
      onClose();
    } catch (error) {
      alert("Error al guardar la configuración: " + error.message);
    }
  };

  // Props compartidas para pasar a los componentes hijos
  const sharedProps = {
    rows,
    sections,
    historyIndex,
    historyStack,
    addRow,
    deleteRow,
    toggleEmergencyExit,
    assignSectionToRow,
    addSeat,
    deleteSeat,
    toggleSeatProperty,
    handleUndo,
    handleRedo,
    updateRowNumber,
    updateSeatLabel
  };

  
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Editor Avanzado de Mapa de Asientos"
      size="xl"
    >
      <div className="flex flex-col h-full">
        {/* Barra de herramientas superior */}
        <EditorToolbar 
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          historyIndex={historyIndex}
          historyStackLength={historyStack.length}
          addRow={addRow}
          addSection={addSection}
          importConfig={importConfig}
          exportConfig={exportConfig}
        />
        
        {/* Input de archivo oculto para importar */}
        <input 
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {/* Detalles generales de la configuración */}
        <GeneralInfo 
          configName={configName}
          setConfigName={setConfigName}
          aircraftType={aircraftType}
          setAircraftType={setAircraftType}
          aircraftModel={aircraftModel}
          setAircraftModel={setAircraftModel}
        />
        
        {/* Área principal con editor y controles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
          {/* Panel izquierdo: Secciones y Configuraciones recientes */}
          <div className="md:col-span-1 flex flex-col">
          <SectionPanel 
            sections={sections}
            updateSection={updateSection}
            deleteSection={deleteSection}
            updateSectionLabels={updateSectionLabels}
            highlightSection={highlightSection}
          />
            
            {/* Configuraciones recientes */}
            {recentConfigs.length > 0 && (
              <RecentConfigsPanel 
                recentConfigs={recentConfigs}
                loadFromRecentConfig={loadFromRecentConfig}
              />
            )}
          </div>
          
          {/* Panel central: Editor visual */}
          <div className="md:col-span-3 flex flex-col">
            <SeatMap {...sharedProps}
            updateRowNumber={updateRowNumber}
            updateSeatLabel={updateSeatLabel} />
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-between items-center gap-2 mt-4 pt-3 border-t">
          <div className="text-sm text-gray-500">
            {rows.length} filas, {rows.reduce((total, row) => 
              total + row.seats.filter(s => s.type === 'seat').length, 0
            )} asientos
          </div>
          
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AircraftSeatMapEditor;