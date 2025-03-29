// src/services/StatsService.js

/**
 * Servicio para cálculos estadísticos relacionados con los pasajeros
 */
class StatsService {
    /**
     * Devuelve el objeto de estadísticas inicial
     */
    static getInitialStats() {
      return {
        total: 0,
        byType: { ADT: { M: 0, F: 0 }, CHD: 0, INF: 0 },
        bySection: { 
          A0: { M: 0, F: 0, CHD: 0, INF: 0, total: 0 },
          B0: { M: 0, F: 0, CHD: 0, INF: 0, total: 0 },
          C0: { M: 0, F: 0, CHD: 0, INF: 0, total: 0 }
        },
        totals: { M: 0, F: 0, CHD: 0, INF: 0 },
        baggage: { count: 0, weight: 0 }
      };
    }
    
    /**
     * Calcula las estadísticas para los pasajeros dados
     */
    static calculateStats(passengers, flightDetails) {
      // Función para determinar la sección correcta desde un asiento
      const getSectionFromSeat = (seat) => {
        // Extraer el número de fila del asiento (por ejemplo, de "12A" obtener "12")
        const rowMatch = seat.match(/^\d+/);
        if (!rowMatch) return 'A0'; // Valor por defecto si no hay número
        
        const rowNumber = parseInt(rowMatch[0]);
        
        // Obtener la configuración del mapa de asientos si existe
        if (flightDetails.seatConfig && flightDetails.seatConfig.rows) {
          // Nueva versión del formato
          const rowConfig = flightDetails.seatConfig.rows.find(r => r.number === rowNumber);
          if (rowConfig && rowConfig.section) {
            return rowConfig.section;
          }
        } 
        
        // Formato antiguo o recaer a la lógica de secciones por defecto
        if (rowNumber <= 10) {
          return 'A0';
        } else if (rowNumber <= 20) {
          return 'B0';
        } else {
          return 'C0';
        }
      };
      
      // Función para obtener todas las secciones disponibles
      const getAvailableSections = () => {
        // Si hay configuración personalizada con secciones
        if (flightDetails.seatConfig && flightDetails.seatConfig.sections) {
          return flightDetails.seatConfig.sections.map(section => section.id);
        }
        // De lo contrario, usar las secciones por defecto
        return ['A0', 'B0', 'C0'];
      };
      
      // Inicializar estadísticas por sección con todas las secciones disponibles
      const initSectionStats = () => {
        const sections = getAvailableSections();
        const sectionStats = {};
        
        sections.forEach(sectionId => {
          sectionStats[sectionId] = { M: 0, F: 0, CHD: 0, INF: 0, total: 0 };
        });
        
        return sectionStats;
      };
      
      // Crear un nuevo objeto de estadísticas
      const newStats = {
        total: 0,
        byType: { ADT: { M: 0, F: 0 }, CHD: 0, INF: 0 },
        bySection: initSectionStats(),
        totals: { M: 0, F: 0, CHD: 0, INF: 0 },
        baggage: { count: 0, weight: 0 }
      };
      
      // Actualizar el total general
      newStats.total = passengers.length;
      
      passengers.forEach(passenger => {
        // Determinar tipo y género (con valores por defecto)
        const passengerType = passenger.passengerType || 'ADT';
        const gender = passenger.gender || 'M';
        
        // Contar por tipo
        if (passengerType === 'CHD') {
          newStats.byType.CHD++;
          newStats.totals.CHD++;
        } else if (passengerType === 'INF') {
          newStats.byType.INF++;
          newStats.totals.INF++;
        } else {
          // Es adulto, contar por género
          if (gender === 'F') {
            newStats.byType.ADT.F++;
            newStats.totals.F++;
          } else {
            newStats.byType.ADT.M++;
            newStats.totals.M++;
          }
        }
        
        // Contar por sección y tipo
        if (passenger.seat) {
          // Obtener la sección correcta usando la nueva función
          const section = getSectionFromSeat(passenger.seat);
          
          // Asegurarse de que la sección existe en las estadísticas
          if (!newStats.bySection[section]) {
            newStats.bySection[section] = { M: 0, F: 0, CHD: 0, INF: 0, total: 0 };
          }
          
          // Incrementar el contador correcto según tipo y sección
          if (passengerType === 'CHD') {
            newStats.bySection[section].CHD++;
          } else if (passengerType === 'INF') {
            newStats.bySection[section].INF++;
          } else if (gender === 'F') {
            newStats.bySection[section].F++;
          } else {
            newStats.bySection[section].M++;
          }
          
          // Incrementar el total de la sección
          newStats.bySection[section].total++;
        }
        
        // Sumar equipaje
        if (passenger.baggage) {
          // Contar piezas si existe el array
          if (passenger.baggage.pieces && Array.isArray(passenger.baggage.pieces)) {
            newStats.baggage.count += passenger.baggage.pieces.length;
          }
          
          // Sumar peso
          if (typeof passenger.baggage.weight === 'number') {
            newStats.baggage.weight += passenger.baggage.weight;
          }
        }
      });
      
      return newStats;
    }
    
    /**
     * Obtiene la información de las secciones desde la configuración de vuelo
     */
    static getSectionsInfo(flightDetails) {
      // Si existe la nueva configuración con secciones personalizadas
      if (flightDetails.seatConfig && flightDetails.seatConfig.sections) {
        return flightDetails.seatConfig.sections;
      }
      
      // Si no, devolver las secciones por defecto
      return [
        { id: 'A0', name: 'Cabina Principal', color: '#3b82f6' },
        { id: 'B0', name: 'Sección Central', color: '#10b981' },
        { id: 'C0', name: 'Sección Trasera', color: '#f59e0b' }
      ];
    }
  }
  
  export default StatsService;