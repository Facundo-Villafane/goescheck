// src/contexts/PassengersContext.jsx
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';

const PassengersContext = createContext();

export const usePassengersContext = () => useContext(PassengersContext);

export const PassengersProvider = ({ children }) => {
  const [passengerList, setPassengerList] = useState([]);
  const [checkedInPassengers, setCheckedInPassengers] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [flightId, setFlightId] = useState(null);
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

  // Obtener el ID del vuelo activo desde localStorage
  useEffect(() => {
    const activeFlightId = localStorage.getItem('activeFlightId');
    if (activeFlightId) {
      setFlightId(activeFlightId);
    }
  }, []);

  // Cargar pasajeros cuando cambia el flightId o el estado online
  useEffect(() => {
    if (flightId) {
      loadPassengers(flightId);
    } else {
      setLoading(false);
    }
  }, [flightId, isOnline]);

  // Cargar pasajeros desde Firebase o localStorage
  const loadPassengers = async (currentFlightId) => {
    if (!currentFlightId) return;
    
    setLoading(true);
    try {
      if (isOnline) {
        // Intentar cargar desde Firebase
        const passengersQuery = query(
          collection(db, 'passengers'), 
          where('flightId', '==', currentFlightId)
        );
        const passengersSnapshot = await getDocs(passengersQuery);
        
        const passengers = [];
        passengersSnapshot.forEach(doc => {
          passengers.push({ id: doc.id, ...doc.data() });
        });
        
        setPassengerList(passengers);
        
        // Filtrar pasajeros con check-in
        const checkedIn = passengers.filter(p => p.checkedIn);
        setCheckedInPassengers(checkedIn);
        
        // También guardar en localStorage como respaldo
        localStorage.setItem('passengerList', JSON.stringify(passengers));
        localStorage.setItem('checkedInPassengers', JSON.stringify(checkedIn));
      } else {
        // Modo offline - cargar desde localStorage
        loadFromLocalStorage();
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Fallback a localStorage
      loadFromLocalStorage();
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedPassengerList = localStorage.getItem('passengerList');
      const savedCheckedInPassengers = localStorage.getItem('checkedInPassengers');
      
      if (savedPassengerList) {
        setPassengerList(JSON.parse(savedPassengerList));
      }
      
      if (savedCheckedInPassengers) {
        setCheckedInPassengers(JSON.parse(savedCheckedInPassengers));
      }
    } catch (error) {
      console.error('Error cargando datos desde localStorage:', error);
    }
  }, []);

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('passengerList', JSON.stringify(passengerList));
      localStorage.setItem('checkedInPassengers', JSON.stringify(checkedInPassengers));
    } catch (error) {
      console.error('Error guardando datos en localStorage:', error);
    }
  }, [passengerList, checkedInPassengers]);

  // Guardar en localStorage cuando cambian los datos
  useEffect(() => {
    if (dataLoaded) {
      saveToLocalStorage();
    }
  }, [passengerList, checkedInPassengers, dataLoaded, saveToLocalStorage]);

  // Función para añadir un pasajero individual
  const addPassenger = async (passenger) => {
    if (!flightId) {
      console.error('No hay un vuelo activo seleccionado');
      return;
    }
    
    // Añadir flightId al pasajero
    const passengerWithFlightId = { 
      ...passenger, 
      flightId,
      createdAt: new Date().toISOString()
    };
    
    // Actualizar estado local
    const newList = [...passengerList, passengerWithFlightId];
    setPassengerList(newList);
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Intentar sincronizar con Firebase
    if (isOnline) {
      try {
        // Si el pasajero no tiene un ID generado por Firebase, usar su ID actual como documento ID
        const passengerId = passenger.id;
        await setDoc(doc(db, 'passengers', passengerId), passengerWithFlightId);
      } catch (error) {
        console.error('Error guardando pasajero en Firebase:', error);
      }
    }
  };

  // Función para añadir múltiples pasajeros desde Excel
  const addPassengersFromExcel = async (passengers) => {
    if (!flightId) {
      console.error('No hay un vuelo activo seleccionado');
      return { total: 0, nuevos: 0, actualizados: 0 };
    }
    
    try {
      // Primero, obtener los pasajeros existentes para este vuelo
      let existingPassengers = [];
      
      if (isOnline) {
        const passengersQuery = query(
          collection(db, 'passengers'), 
          where('flightId', '==', flightId)
        );
        const passengersSnapshot = await getDocs(passengersQuery);
        
        passengersSnapshot.forEach(doc => {
          existingPassengers.push({ id: doc.id, ...doc.data() });
        });
      } else {
        // En modo offline, usar la lista local
        existingPassengers = [...passengerList];
      }
      
      // Identificar pasajeros nuevos vs existentes (por documento/ticket)
      const newPassengers = [];
      const updatedPassengers = [];
      
      passengers.forEach(passenger => {
        // Buscar si el pasajero ya existe (por número de documento y tipo)
        const existingIndex = existingPassengers.findIndex(p => 
          p.documentNumber === passenger.documentNumber && 
          p.documentType === passenger.documentType
        );
        
        if (existingIndex >= 0) {
          // Actualizar pasajero existente manteniendo su ID y datos de check-in
          const existingPassenger = existingPassengers[existingIndex];
          updatedPassengers.push({
            ...passenger,
            id: existingPassenger.id,
            flightId,
            checkedIn: existingPassenger.checkedIn || false,
            // Mantener otros campos importantes del pasajero existente
            boardingPass: existingPassenger.boardingPass,
            seat: existingPassenger.seat,
            checkInTime: existingPassenger.checkInTime,
            updatedAt: new Date().toISOString(),
            createdAt: existingPassenger.createdAt || new Date().toISOString()
          });
        } else {
          // Añadir nuevo pasajero
          newPassengers.push({
            ...passenger,
            flightId,
            checkedIn: false,
            createdAt: new Date().toISOString()
          });
        }
      });
      
      // Combinar todos los pasajeros
      const allPassengers = [...updatedPassengers, ...newPassengers];
      
      // Actualizar estado local
      setPassengerList(prev => {
        // Remover pasajeros que van a ser actualizados
        const filteredList = prev.filter(p => 
          !updatedPassengers.some(up => up.id === p.id)
        );
        // Añadir todos los pasajeros actualizados y nuevos
        return [...filteredList, ...allPassengers];
      });
      
      // Actualizar lista de check-in
      const checkedIn = passengerList.filter(p => p.checkedIn);
      setCheckedInPassengers(checkedIn);
      
      // Guardar en localStorage como respaldo
      saveToLocalStorage();
      
      // Sincronizar con Firebase si estamos online
      if (isOnline) {
        // Crear un batch para operaciones masivas
        const batch = writeBatch(db);
        
        // Añadir cada pasajero al batch
        allPassengers.forEach(passenger => {
          const passengerRef = doc(db, 'passengers', passenger.id);
          batch.set(passengerRef, passenger);
        });
        
        // Ejecutar el batch
        await batch.commit();
        
        console.log(`Sincronizados ${allPassengers.length} pasajeros con Firebase`);
      }
      
      return {
        total: allPassengers.length,
        nuevos: newPassengers.length,
        actualizados: updatedPassengers.length
      };
    } catch (error) {
      console.error('Error procesando pasajeros desde Excel:', error);
      throw error;
    }
  };

  const checkInPassenger = async (passenger) => {
    if (!flightId) return;
    
    // Asegurarnos de que el pasajero tenga flightId y marcar como checkedIn
    const updatedPassenger = { 
      ...passenger, 
      flightId, 
      checkedIn: true,
      checkInTime: new Date().toISOString() 
    };
    
    // Actualizar estado local
    setPassengerList(prevList => 
      prevList.map(p => p.id === passenger.id ? updatedPassenger : p)
    );
    
    // Actualizar lista de check-in
    const isAlreadyCheckedIn = checkedInPassengers.some(p => p.id === passenger.id);
    
    if (isAlreadyCheckedIn) {
      setCheckedInPassengers(prevList => 
        prevList.map(p => p.id === passenger.id ? updatedPassenger : p)
      );
    } else {
      setCheckedInPassengers(prevList => [...prevList, updatedPassenger]);
    }
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Intentar sincronizar con Firebase
    if (isOnline) {
      try {
        await setDoc(doc(db, 'passengers', passenger.id), updatedPassenger);
      } catch (error) {
        console.error('Error actualizando pasajero en Firebase:', error);
      }
    }
  };

  // Nueva función para descheckear a un pasajero
  const uncheckInPassenger = async (passenger) => {
    if (!flightId) return;
    
    // Clonar el pasajero y actualizar propiedades relacionadas con el check-in
    const updatedPassenger = { 
      ...passenger, 
      checkedIn: false,
      // Remover propiedades relacionadas con el check-in
      seat: null,
      checkInTime: null,
      // Mantener el flightId
      flightId
    };
    
    // Actualizar estado local
    setPassengerList(prevList => 
      prevList.map(p => p.id === passenger.id ? updatedPassenger : p)
    );
    
    // Eliminar de la lista de checkedIn
    setCheckedInPassengers(prevList => 
      prevList.filter(p => p.id !== passenger.id)
    );
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Intentar sincronizar con Firebase
    if (isOnline) {
      try {
        await setDoc(doc(db, 'passengers', passenger.id), updatedPassenger);
      } catch (error) {
        console.error('Error actualizando pasajero en Firebase:', error);
      }
    }
    
    return updatedPassenger;
  };

  // Función para actualizar propiedades del pasajero (incluyendo documentType)
  const updatePassenger = async (passenger) => {
    if (!flightId) return;
    
    // Asegurarnos de que el pasajero tenga flightId
    const updatedPassenger = { 
      ...passenger, 
      flightId,
      updatedAt: new Date().toISOString() 
    };
    
    // Actualizar estado local
    setPassengerList(prevList => 
      prevList.map(p => p.id === passenger.id ? updatedPassenger : p)
    );
    
    // Si el pasajero está checkeado, actualizar también en la lista de checkedIn
    if (passenger.checkedIn) {
      setCheckedInPassengers(prevList => 
        prevList.map(p => p.id === passenger.id ? updatedPassenger : p)
      );
    }
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Intentar sincronizar con Firebase
    if (isOnline) {
      try {
        await setDoc(doc(db, 'passengers', passenger.id), updatedPassenger);
      } catch (error) {
        console.error('Error actualizando pasajero en Firebase:', error);
      }
    }
    
    return updatedPassenger;
  };

  

  const boardPassenger = async (passenger) => {
    if (!flightId) return;
    
    // Asegurarnos de que el pasajero tenga flightId y añadir timestamp
    const updatedPassenger = { 
      ...passenger, 
      flightId, 
      boarded: true,
      boardedAt: new Date().toISOString() 
    };
    
    // Actualizar estado local
    setPassengerList(prevList => 
      prevList.map(p => p.id === passenger.id ? updatedPassenger : p)
    );
    
    // Guardar en localStorage (mantiene compatibilidad)
    saveToLocalStorage();
    
    // Intentar sincronizar con Firebase
    if (isOnline) {
      try {
        const passengerRef = doc(db, 'passengers', passenger.id);
        await updateDoc(passengerRef, {
          boarded: true,
          boardedAt: new Date().toISOString()
        });
        
        // También actualizar el registro de embarque del vuelo
        const flightRef = doc(db, 'flights', flightId);
        await updateDoc(flightRef, {
          boardedPassengers: arrayUnion(passenger.id),
          lastBoardingUpdate: new Date().toISOString()
        });
        
        console.log(`Pasajero ${passenger.lastName} embarcado y sincronizado con Firebase`);
      } catch (error) {
        console.error('Error actualizando estado de embarque en Firebase:', error);
      }
    }
    
    return updatedPassenger;
  };
  
  // Función para deshacer el embarque de un pasajero
  const unboardPassenger = async (passenger) => {
    if (!flightId) return;
    
    // Actualizar pasajero
    const updatedPassenger = { 
      ...passenger, 
      boarded: false,
      boardedAt: null
    };
    
    // Actualizar estado local
    setPassengerList(prevList => 
      prevList.map(p => p.id === passenger.id ? updatedPassenger : p)
    );
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Intentar sincronizar con Firebase
    if (isOnline) {
      try {
        const passengerRef = doc(db, 'passengers', passenger.id);
        await updateDoc(passengerRef, {
          boarded: false,
          boardedAt: null
        });
        
        // También actualizar el registro de embarque del vuelo
        const flightRef = doc(db, 'flights', flightId);
        await updateDoc(flightRef, {
          boardedPassengers: arrayRemove(passenger.id),
          lastBoardingUpdate: new Date().toISOString()
        });
        
        console.log(`Embarque revertido para pasajero ${passenger.lastName}`);
      } catch (error) {
        console.error('Error actualizando estado de embarque en Firebase:', error);
      }
    }
    
    return updatedPassenger;
  };
  
  // Función para sincronizar todos los datos de embarque con Firebase
  const syncBoardingData = async () => {
    if (!flightId) return false;
    
    // Si estamos offline, no intentamos sincronizar
    if (!isOnline) {
      console.log("No hay conexión a internet. La sincronización no es posible en este momento.");
      return false;
    }
    
    try {
      console.log('Sincronizando datos de embarque con Firebase...');
      
      // Obtener datos de localStorage
      const boardingDataKey = `boarding_${flightId}`;
      const savedBoardingData = localStorage.getItem(boardingDataKey);
      
      if (!savedBoardingData) {
        console.log('No hay datos de embarque locales para sincronizar');
        // Vamos a buscar en pasajeros existentes si hay alguno marcado como embarcado
        const boardedPassengers = passengerList.filter(p => p.boarded === true);
        
        if (boardedPassengers.length === 0) {
          console.log('No hay pasajeros embarcados para sincronizar');
          return true; // Consideramos que todo está sincronizado
        }
        
        // Si hay pasajeros marcados como embarcados, sincronizamos el vuelo
        const boardedIds = boardedPassengers.map(p => p.id);
        
        // Actualizar el documento del vuelo con los pasajeros embarcados
        try {
          const flightRef = doc(db, 'flights', flightId);
          await updateDoc(flightRef, {
            boardedPassengers: boardedIds,
            lastBoardingUpdate: new Date().toISOString(),
            'boardingStatus.totalCheckedIn': checkedInPassengers.length,
            'boardingStatus.totalBoarded': boardedIds.length,
            'boardingStatus.completionPercentage': checkedInPassengers.length > 0 ? 
              Math.round((boardedIds.length / checkedInPassengers.length) * 100) : 0
          });
          
          console.log(`Sincronizado estado del vuelo con ${boardedIds.length} pasajeros embarcados`);
          return true;
        } catch (error) {
          console.error('Error actualizando estado del vuelo:', error);
          return false;
        }
      }
      
      // Parsear los datos guardados
      const { boardedIds, boardedPassengers, lastUpdated } = JSON.parse(savedBoardingData);
      
      // Verificar si hay algo que sincronizar
      if (!boardedPassengers || boardedPassengers.length === 0) {
        console.log('No hay pasajeros embarcados para sincronizar en localStorage');
        return true;
      }
      
      console.log(`Encontrados ${boardedPassengers.length} pasajeros para sincronizar`);
      
      // Actualizar cada pasajero embarcado en Firebase
      const batch = writeBatch(db);
      
      boardedPassengers.forEach(passenger => {
        const passengerRef = doc(db, 'passengers', passenger.id);
        batch.update(passengerRef, {
          boarded: true,
          boardedAt: passenger.boardedAt || new Date().toISOString()
        });
      });
      
      // Actualizar el documento del vuelo con los pasajeros embarcados
      const flightRef = doc(db, 'flights', flightId);
      batch.update(flightRef, {
        boardedPassengers: boardedIds,
        lastBoardingUpdate: new Date().toISOString(),
        'boardingStatus.totalCheckedIn': checkedInPassengers.length,
        'boardingStatus.totalBoarded': boardedIds.length,
        'boardingStatus.completionPercentage': checkedInPassengers.length > 0 ? 
          Math.round((boardedIds.length / checkedInPassengers.length) * 100) : 0
      });
      
      // Ejecutar batch
      await batch.commit();
      
      console.log(`Sincronizados ${boardedIds.length} pasajeros embarcados con Firebase`);
      return true;
    } catch (error) {
      console.error('Error sincronizando datos de embarque:', error);
      return false;
    }
  };
  

  return (
    <PassengersContext.Provider value={{ 
      passengerList, 
      setPassengerList, 
      checkedInPassengers, 
      addPassenger,
      addPassengersFromExcel,
      checkInPassenger,
      uncheckInPassenger, // Nueva función para descheckear
      updatePassenger, // Nueva función para actualizar propiedades 
      loadFromLocalStorage,
      loadPassengers,
      saveToLocalStorage,
      isOnline,
      setFlightId,
      loading,
      boardPassenger,
      unboardPassenger,
      syncBoardingData
    }}>
      {children}
    </PassengersContext.Provider>
  );
};