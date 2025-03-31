// src/contexts/FlightContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy, where, writeBatch } from 'firebase/firestore';

const FlightContext = createContext();

export const useFlightContext = () => useContext(FlightContext);

export const FlightProvider = ({ children }) => {
  const [flightDetails, setFlightDetails] = useState({
    flightNumber: '',
    aircraft: '',
    origin: '',
    destination: '',
    date: '',
    airlineCode: '',
    std: '',
    seatConfig: null
  });
  
  const [flightList, setFlightList] = useState([]);
  const [activeFlightId, setActiveFlightId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  
  // Monitorear estado online
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Cargar vuelos desde Firebase o localStorage al montar
  useEffect(() => {
    // En loadFlights (línea 41-42 de tu código)
      const loadFlights = async () => {
        setLoading(true);
        try {
          if (isOnline) {
            console.log("Intentando cargar vuelos desde Firebase...");
            const flightsQuery = query(collection(db, 'flights'), orderBy('updatedAt', 'desc'));
            const flightsSnapshot = await getDocs(flightsQuery);
            
            console.log("Respuesta de Firebase:", flightsSnapshot.size, "documentos");
            
            const flights = [];
            flightsSnapshot.forEach(doc => {
              console.log("Documento encontrado:", doc.id, doc.data());
              flights.push({ id: doc.id, ...doc.data() });
            });
      
            console.log("Vuelos procesados:", flights);
          
          // Obtener el recuento de pasajeros para cada vuelo
          const flightsWithCounts = await Promise.all(flights.map(async (flight) => {
            try {
              const passengersQuery = query(
                collection(db, 'passengers'),
                where('flightId', '==', flight.id)
              );
              const passengersSnapshot = await getDocs(passengersQuery);
              
              // Añadir el recuento de pasajeros al objeto de vuelo
              return {
                ...flight,
                passengerCount: passengersSnapshot.size
              };
            } catch (error) {
              console.error(`Error obteniendo pasajeros para vuelo ${flight.id}:`, error);
              return flight;
            }
          }));
          
          setFlightList(flightsWithCounts);
          localStorage.setItem('flightList', JSON.stringify(flightsWithCounts));
        } else {
          // Cargar desde localStorage
          loadFromLocalStorage();
        }
        
        // Cargar vuelo activo
        const savedActiveFlightId = localStorage.getItem('activeFlightId');
        if (savedActiveFlightId) {
          setActiveFlightId(savedActiveFlightId);
          await loadFlightDetails(savedActiveFlightId);
        }
      } catch (error) {
        console.error('Error cargando vuelos:', error);
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };
    
    loadFlights();
  }, [isOnline]);
  
  const loadFromLocalStorage = () => {
    try {
      const savedFlightList = localStorage.getItem('flightList');
      if (savedFlightList) {
        setFlightList(JSON.parse(savedFlightList));
      }
      
      const savedFlightDetails = localStorage.getItem('flightDetails');
      if (savedFlightDetails) {
        setFlightDetails(JSON.parse(savedFlightDetails));
      }
    } catch (error) {
      console.error('Error cargando datos desde localStorage:', error);
    }
  };
  
  // Mejora para loadFlightDetails en FlightContext.jsx
const loadFlightDetails = async (flightId) => {
  try {
    console.log("Cargando detalles del vuelo:", flightId);
    
    if (isOnline) {
      // Cargar desde Firebase
      const flightDoc = await getDoc(doc(db, 'flights', flightId));
      if (flightDoc.exists()) {
        const flightData = flightDoc.data();
        console.log("Datos del vuelo cargados desde Firebase:", flightData);
        
        // Asegurarnos de que seatConfig se mantiene intacto
        setFlightDetails({
          ...flightData,
          seatConfig: flightData.seatConfig || null
        });
        
        // Guardar en localStorage para acceso offline
        localStorage.setItem('flightDetails', JSON.stringify(flightData));
      } else {
        console.warn("No se encontró el vuelo en Firebase:", flightId);
      }
    } else {
      // En modo offline, intentar cargar del localStorage
      const savedFlightList = localStorage.getItem('flightList');
      if (savedFlightList) {
        const flights = JSON.parse(savedFlightList);
        const flight = flights.find(f => f.id === flightId);
        if (flight) {
          console.log("Datos del vuelo cargados desde localStorage:", flight);
          
          // Asegurarnos de que seatConfig se mantiene intacto
          setFlightDetails({
            ...flight,
            seatConfig: flight.seatConfig || null
          });
          
          localStorage.setItem('flightDetails', JSON.stringify(flight));
        } else {
          console.warn("No se encontró el vuelo en localStorage:", flightId);
        }
      }
    }
  } catch (error) {
    console.error('Error cargando detalles del vuelo:', error);
  }
};
  
  // Guardar vuelo activo en localStorage cuando cambie
  useEffect(() => {
    if (activeFlightId) {
      localStorage.setItem('activeFlightId', activeFlightId);
    }
  }, [activeFlightId]);
  
  // Función para guardar el vuelo actual
  const saveFlight = async () => {
    if (!flightDetails.flightNumber) return null;
    
    let flightId = activeFlightId;
    
    // Si no hay ID activo, generar uno nuevo
  if (!flightId) {
    flightId = `flight-${Date.now()}`;
    console.log("Generando nuevo ID de vuelo:", flightId);
  } else {
    console.log("Actualizando vuelo existente:", flightId);
  }
    
  const flightData = {
    ...flightDetails,
    id: flightId,
    updatedAt: new Date().toISOString(),
    // Nuevos campos para embarque
    boardedPassengers: [], // Array de IDs de pasajeros embarcados
    lastBoardingUpdate: null, // Timestamp de la última actualización de embarque
    boardingStatus: {
      totalCheckedIn: 0,
      totalBoarded: 0,
      completionPercentage: 0
    }
  };

  const updateBoardingStats = async (flightId, checkedInCount, boardedCount) => {
    if (!flightId || !isOnline) return;
    
    try {
      const flightRef = doc(db, 'flights', flightId);
      
      await updateDoc(flightRef, {
        'boardingStatus.totalCheckedIn': checkedInCount,
        'boardingStatus.totalBoarded': boardedCount,
        'boardingStatus.completionPercentage': checkedInCount > 0 ? 
          Math.round((boardedCount / checkedInCount) * 100) : 0,
        lastBoardingUpdate: new Date().toISOString()
      });
      
      console.log('Estadísticas de embarque actualizadas en Firebase');
    } catch (error) {
      console.error('Error actualizando estadísticas de embarque:', error);
    }
  };

    // Asegurarnos de que seatConfig esté presente
  if (!flightData.seatConfig) {
    console.warn("No hay configuración de asientos para este vuelo");
  } else {
    console.log("Configuración de asientos encontrada:", 
                flightData.seatConfig.rows ? 
                `${flightData.seatConfig.rows.length} filas` : 
                "Formato no reconocido");
  }
    
    // Si es un vuelo nuevo, añadir createdAt
    if (!activeFlightId) {
      flightData.createdAt = flightData.updatedAt;
    }
    
    console.log("Datos a guardar:", flightData);
    
    try {
      // Guardar en Firebase si estamos online
      if (isOnline) {
        await setDoc(doc(db, 'flights', flightId), flightData);
      }
      
      // Actualizar estado local
      setFlightList(prevList => {
        const existingIndex = prevList.findIndex(f => f.id === flightId);
        if (existingIndex >= 0) {
          // Actualizar vuelo existente
          const updatedList = [...prevList];
          updatedList[existingIndex] = flightData;
          return updatedList;
        } else {
          // Añadir nuevo vuelo
          return [flightData, ...prevList];
        }
      });
      
      // Guardar en localStorage
      localStorage.setItem('flightDetails', JSON.stringify(flightData));
      
      // Actualizar vuelo activo
      setActiveFlightId(flightId);
      
      return flightId;
    } catch (error) {
      console.error('Error guardando vuelo:', error);
      
      // Aún así actualizar localStorage y estado local
      setFlightList(prevList => {
        const existingIndex = prevList.findIndex(f => f.id === flightId);
        if (existingIndex >= 0) {
          const updatedList = [...prevList];
          updatedList[existingIndex] = flightData;
          localStorage.setItem('flightList', JSON.stringify(updatedList));
          return updatedList;
        } else {
          const updatedList = [flightData, ...prevList];
          localStorage.setItem('flightList', JSON.stringify(updatedList));
          return updatedList;
        }
      });
      
      localStorage.setItem('flightDetails', JSON.stringify(flightData));
      setActiveFlightId(flightId);
      
      return flightId;
    }
  };
  
  // Función para cargar un vuelo de la lista
  const loadFlight = async (flightId) => {
    try {
      await loadFlightDetails(flightId);
      setActiveFlightId(flightId);
      return true;
    } catch (error) {
      console.error('Error cargando vuelo:', error);
      return false;
    }
  };
  
  // Función para eliminar un vuelo
  const deleteFlight = async (flightId) => {
    try {
      // Eliminar de Firebase si estamos online
      if (isOnline) {
        await deleteDoc(doc(db, 'flights', flightId));
        
        // También deberíamos eliminar todos los pasajeros asociados a este vuelo
        const passengersQuery = query(
          collection(db, 'passengers'), 
          where('flightId', '==', flightId)
        );
        const passengersSnapshot = await getDocs(passengersQuery);
        
        const batch = writeBatch(db);
        passengersSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      }
      
      // Actualizar estado local
      setFlightList(prevList => {
        const updatedList = prevList.filter(f => f.id !== flightId);
        localStorage.setItem('flightList', JSON.stringify(updatedList));
        return updatedList;
      });
      
      // Si era el vuelo activo, limpiar
      if (activeFlightId === flightId) {
        setActiveFlightId(null);
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
        localStorage.removeItem('activeFlightId');
        localStorage.removeItem('flightDetails');
      }
      
      return true;
    } catch (error) {
      console.error('Error eliminando vuelo:', error);
      
      // Aún así actualizar el estado local
      setFlightList(prevList => {
        const updatedList = prevList.filter(f => f.id !== flightId);
        localStorage.setItem('flightList', JSON.stringify(updatedList));
        return updatedList;
      });
      
      if (activeFlightId === flightId) {
        setActiveFlightId(null);
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
        localStorage.removeItem('activeFlightId');
        localStorage.removeItem('flightDetails');
      }
      
      return true;
    }
  };

  return (
    <FlightContext.Provider value={{ 
      flightDetails, 
      setFlightDetails,
      flightList,
      setFlightList,
      activeFlightId,
      setActiveFlightId,
      saveFlight,
      loadFlight,
      deleteFlight,
      
      isOnline,
      loading
    }}>
      {children}
    </FlightContext.Provider>
  );
};