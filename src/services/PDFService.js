// src/services/PDFService.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Servicio para generar PDF con funcionalidades comunes
 */
class PDFService {
  /**
   * Genera un PDF con los datos del vuelo y pasajeros
   * @param {Object} flightDetails - Detalles del vuelo
   * @param {Array} passengers - Lista de pasajeros
   * @param {Object} stats - Estadísticas calculadas
   * @param {Function} getSectionsInfo - Función para obtener información de secciones
   * @param {String} logoDataURL - URL de datos de la imagen del logo
   * @param {String} viewMode - Modo de vista ('all', 'checkin', 'boarded')
   * @param {String} weightUnit - Unidad de peso ('kg' o 'lb')
   * @returns {Promise} - Promesa que resuelve cuando el PDF se ha guardado
   */

  /**
   * Genera un PDF con los detalles del vuelo y la lista de pasajeros
   */
   // Método para generar un reporte estilo "Departure Control"
    static generateDepartureControlPDF(flightDetails, passengers, stats) {
      return new Promise((resolve, reject) => {
        try {
          // Crear un nuevo documento PDF
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          // Configurar metadatos del documento
          doc.setProperties({
            title: `Departure Control ${flightDetails.flightNumber || 'Sin número'}`,
            subject: 'Flight Departure Control',
            author: 'Goes Airport Services',
            creator: 'Goes Airport Services'
          });
          
          // Establecer la fuente "courier" para imitar el estilo de terminal
          doc.setFont("courier");

          // --- Encabezado ---
          doc.setFontSize(12);
          doc.text(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 10);
          
          doc.setFontSize(14);
          doc.text("GOES | Departure Control", 350, 20, null, null, "right");
          
          doc.setLineWidth(0.5);
          doc.line(20, 24, 190, 24);
          
          // --- Información del vuelo ---
          doc.setFontSize(10);
          doc.text("Airline      : " + (flightDetails.airlineCode || "Goes"), 20, 35);
          doc.text("Flight Number: " + (flightDetails.flightNumber || "-"), 20, 42);
          doc.text("Flight Date  : " + (flightDetails.date || "-"), 20, 49);
          doc.text("Departing    : " + (flightDetails.origin || "-"), 20, 56);
          doc.text("Registration : " + (flightDetails.aircraft || "-"), 20, 63);
          
          // --- Línea de encabezado de tabla ---
          doc.setFontSize(9);
          doc.text("ST", 20, 75);
          doc.text("SEQ", 30, 75);
          doc.text("PASSENGER NAME", 40, 75);
          doc.text("GRP", 100, 75);
          doc.text("BAG", 110, 75);
          
          doc.text("ITIN", 125, 75);
          doc.text("SSR", 145, 75);
          doc.text("STATUS", 155, 75);
          
          // Línea punteada
          let dashLength = 0.5;
          let dashSpace = 1;
          let dashCount = Math.floor(180 / (dashLength + dashSpace));
          for (let i = 0; i < dashCount; i++) {
            doc.line(20 + i * (dashLength + dashSpace), 78, 20 + i * (dashLength + dashSpace) + dashLength, 78);
          }
          
          // --- Lista de pasajeros ---
          let y = 85;
          const lineHeight = 5; // Altura de línea reducida para mostrar más pasajeros

          // Ordenar pasajeros alfabéticamente
          const sortedPassengers = [...passengers].sort((a, b) => {
            const lastNameA = (a.lastName || '').toLowerCase();
            const lastNameB = (b.lastName || '').toLowerCase();
            if (lastNameA !== lastNameB) return lastNameA.localeCompare(lastNameB);
            
            const firstNameA = (a.firstName || '').toLowerCase();
            const firstNameB = (b.firstName || '').toLowerCase();
            return firstNameA.localeCompare(firstNameB);
          });
          
          // Imprimir cada pasajero
          doc.setFontSize(8); // Fuente pequeña para mostrar más datos
          
          sortedPassengers.forEach((passenger, index) => {
            // Manejar salto de página
            if (y > 270) {
              doc.addPage();
              y = 30;
              
              // Repetir el encabezado de la tabla en la nueva página
              doc.setFontSize(9);
              doc.text("ST", 20, y);
              doc.text("SEQ", 30, y);
              doc.text("PASSENGER NAME", 40, y);
              doc.text("GRP", 100, y);
              doc.text("BAG", 110, y);
              
              doc.text("ITIN", 125, y);
              doc.text("SSR", 145, y);
              doc.text("STATUS", 155, y);
              
              // Línea punteada
              for (let i = 0; i < dashCount; i++) {
                doc.line(20 + i * (dashLength + dashSpace), y+3, 20 + i * (dashLength + dashSpace) + dashLength, y+3);
              }
              
              y += 10;
              doc.setFontSize(8);
            }
            
            // Número de asiento con formato XX-YY (donde XX es fila y YY es columna)
            const seat = passenger.seat ? passenger.seat.replace(/([0-9]+)([A-Z]+)/, "$1$2") : "--";
            
            // Secuencia del pasajero (índice + 1, con formato de 2 dígitos)
            const seq = String(index + 1).padStart(2, '0');
            
            // Formato de nombre: APELLIDO/NOMBRE (mayúsculas, truncado si es necesario)
            const lastName = (passenger.lastName || '').toUpperCase();
            const firstName = (passenger.firstName || '').toUpperCase();
            const passengerName = `${lastName}/${firstName}`;
            
            // Columna de asiento
            doc.text(`${seat}`, 20, y);

            // Columna de secuencia
            doc.text(`${seq}`, 30, y);
            
            // Columna de nombre del pasajero
            doc.text(passengerName, 40, y);
            
            // Columna de género
            const gender = (passenger.gender || 'M').toUpperCase();
            doc.text(gender, 100, y);
            
            
            
            // Columna de equipaje (formato: 0/0)
            let bagCount = "0/0";
            if (passenger.baggage && passenger.baggage.pieces) {
              bagCount = `${passenger.baggage.pieces.length}`;
            }
            let weight = "00kg";
            if (passenger.baggage && passenger.baggage.weight) {
              weight = `${Math.round(passenger.baggage.weight)}kg`;
            }
            doc.text(`${bagCount}/${weight}`, 110, y);

            
            
            // Columna de etiqueta de origen-destino
            doc.text(` ${flightDetails.origin || 'ORT'}-${flightDetails.destination || 'DES'}`, 125, y);
            
            // Columna de peso y estado
            let status = "Checked#";
            if (passenger.boarded) {
              status = "Boarded";
            }
            doc.text(`${status}`, 155, y);
            
            y += lineHeight;
          });
          
          // --- Línea divisoria ---
          // Línea punteada
          y += 5;
          for (let i = 0; i < dashCount; i++) {
            doc.line(20 + i * (dashLength + dashSpace), y, 20 + i * (dashLength + dashSpace) + dashLength, y);
          }
          y += 5;
          
          // --- Totales ---
          doc.setFontSize(9);
          doc.text(`Total ${passengers.length} Passengers`, 20, y);
          doc.text(`${PDFService.bagCount(passengers)}/${PDFService.calculateTotalWeight(passengers)}kg`, 110, y);
          
          
          // --- Pie de página ---
          y += 10;
          doc.setFontSize(8);
          doc.text(`Printed ${new Date().toDateString()} ${new Date().toLocaleTimeString()} GMT`, 20, y);
          doc.text("Produced by GOES Check-in System", 20, y+7);
          
          // --- URL en la parte inferior ---
          doc.setFontSize(7);
          
          
          // Guardar PDF
          const fileName = `departure_control_${flightDetails.flightNumber || 'flight'}_${new Date().toISOString().split('T')[0]}.pdf`;
          doc.save(fileName);
          
          resolve(fileName);
        } catch (error) {
          reject(error);
        }
      });
    }

    // Funciones auxiliares
    static bagCount(passengers) {
      let countBag = 0;
      let countHand = 0;
      
      passengers.forEach(passenger => {
        if (passenger.baggage && passenger.baggage.pieces) {
          countBag += passenger.baggage.pieces.length;
        }
      });
      
      return `${countBag}`;
    }

    static calculateTotalWeight(passengers) {
      let totalWeight = 0;
      
      passengers.forEach(passenger => {
        if (passenger.baggage && passenger.baggage.weight) {
          totalWeight += passenger.baggage.weight;
        }
      });
      
      return Math.round(totalWeight);
    }

  static generateFlightSummaryPDF(flightDetails, passengers, stats, getSectionsInfo, logoDataURL, viewMode = 'all', weightUnit = 'kg') {
    return new Promise((resolve, reject) => {
      try {
        // Crear un nuevo documento PDF
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Configurar metadatos del documento
        let docTitle = 'Flight Summary';
        if (viewMode === 'all') docTitle = 'Passenger Manifest';
        if (viewMode === 'checkin') docTitle = 'Check-in Summary';
        if (viewMode === 'boarded') docTitle = 'Boarding Summary';
        
        doc.setProperties({
          title: `${docTitle} - ${flightDetails.flightNumber || 'Sin número'}`,
          subject: viewMode === 'boarded' ? 'Boarding Status' : 'Flight Status',
          author: 'Goes Airport Services',
          creator: 'Goes Airport Services'
        });
        
        // Establecer la fuente "courier" (estilo computadora/terminal) para todo el documento
        doc.setFont("courier");

        // Función para añadir el logo y encabezado a cada página
        const addLogoHeader = () => {
          if (logoDataURL) {
            // Añadir logo como imagen
            doc.addImage(logoDataURL, 'PNG', 14, 10, 40, 15);
          }
          
          // Información adicional de encabezado
          doc.setFontSize(8);
          doc.setTextColor(100);
          
          // Línea separadora debajo del encabezado
          doc.setDrawColor(200);
          doc.line(14, 28, 196, 28);
        };

        // --- PÁGINA 1: Información del vuelo y estadísticas ---
        addLogoHeader(); // Añadir logo a la primera página
        this.generateFlightInfoPage(doc, flightDetails, stats, getSectionsInfo, viewMode, weightUnit);
        
        // --- PÁGINA 2: Lista de equipajes (solo si no estamos en modo 'all') ---
      if (viewMode !== 'all') {
        doc.addPage();
        addLogoHeader();
        this.generateBaggageListPage(doc, passengers, viewMode, weightUnit);
      }
        
        // --- PÁGINA 3: Lista de pasajeros ---
        doc.addPage();
        addLogoHeader(); // Añadir logo a la tercera página
        this.generatePassengerListPage(doc, passengers, viewMode, weightUnit);
        
        // Guardar PDF
        const fileName = `${viewMode}_${flightDetails.flightNumber || 'flight'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        resolve(fileName);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera la primera página con información del vuelo y estadísticas
   */
  static generateFlightInfoPage(doc, flightDetails, stats, getSectionsInfo, viewMode = 'all', weightUnit = 'kg') {
    // Función para convertir kg a libras
    const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);
    
    // Título principal adaptado al modo de vista
    let titleText = 'Flight Summary';
    if (viewMode === 'all') {
      titleText = 'Passenger Manifest';
    } else if (viewMode === 'checkin') {
      titleText = 'Check-in Summary';
    } else if (viewMode === 'boarded') {
      titleText = 'Boarding Summary';
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(titleText, 105, 20, { align: 'center' });

    // Información del vuelo
    doc.setFontSize(14);
    doc.text('Flight Information', 14, 32);

    doc.setFontSize(11);
    doc.text('Flight Number:', 14, 40);
    doc.text(flightDetails.flightNumber || 'N/A', 80, 40);

    doc.text('Aircraft:', 14, 46);
    doc.text(flightDetails.aircraft || 'N/A', 80, 46);

    doc.text('Date:', 14, 52);
    doc.text(flightDetails.date || 'N/A', 80, 52);

    doc.text('Departure Aerodrome:', 14, 58);
    doc.text(flightDetails.origin || 'N/A', 80, 58);

    doc.text('Destination Aerodrome:', 14, 64);
    doc.text(flightDetails.destination || 'N/A', 80, 64);

    // Estadísticas de pasajeros - adaptado al título según el modo
    doc.setFontSize(14);
    const passengerSectionTitle = viewMode === 'boarded' ? 'Boarded Passengers' : 
                                viewMode === 'checkin' ? 'Checked-in Passengers' :
                                'Passengers';
    doc.text(passengerSectionTitle, 14, 74);

    doc.setFontSize(11);
    doc.text('Total:', 14, 84);
    doc.text(stats.total.toString(), 80, 84);

    doc.text('Adults - Male:', 14, 90);
    doc.text(stats.byType.ADT.M.toString(), 80, 90);

    doc.text('Adults - Female:', 14, 96);
    doc.text(stats.byType.ADT.F.toString(), 80, 96);

    doc.text('Children:', 14, 102);
    doc.text(stats.byType.CHD.toString(), 80, 102);

    doc.text('Infants:', 14, 108);
    doc.text(stats.byType.INF.toString(), 80, 108);

    // Sólo mostrar información de equipaje y zonas si no estamos en el modo 'all'
      if (viewMode !== 'all') {
        // Estadísticas de equipaje
        doc.setFontSize(14);
        doc.text('Baggage Information', 14, 118);

        doc.setFontSize(11);
        doc.text('Total Pieces:', 14, 128);
        doc.text(String(stats.baggage.count), 80, 128);

        // Mostrar peso según la unidad seleccionada
        doc.text('Total Weight:', 14, 134);
        const totalWeightText = weightUnit === 'kg' 
          ? `${stats.baggage.weight.toFixed(1)} kg` 
          : `${(stats.baggage.weight * 2.20462).toFixed(1)} lb`;
        doc.text(totalWeightText, 80, 134);

        doc.text('Average W/p:', 14, 140);
        const avgWeightText = stats.total > 0 
          ? (weightUnit === 'kg' 
            ? `${(stats.baggage.weight / stats.total).toFixed(1)} kg` 
            : `${(stats.baggage.weight / stats.total * 2.20462).toFixed(1)} lb`)
          : weightUnit === 'kg' ? '0 kg' : '0 lb';
        doc.text(avgWeightText, 80, 140);

        // Distribución por zonas
        doc.setFontSize(14);
        doc.text('Zone Distribution', 14, 150);

        doc.setFontSize(11);
        doc.text('Zone', 14, 160);
        doc.text('M', 40, 160);
        doc.text('F', 55, 160);
        doc.text('C', 70, 160);
        doc.text('I', 85, 160);
        doc.text('TOTAL', 100, 160);

        // Línea separadora
        doc.line(14, 162, 120, 162);

        // Datos para cada zona
        let yPos = 168;
        Object.keys(stats.bySection).forEach((zoneId) => {
          const zone = stats.bySection[zoneId];

          doc.text(zoneId, 14, yPos);
          doc.text(String(zone.M), 40, yPos);
          doc.text(String(zone.F), 55, yPos);
          doc.text(String(zone.CHD), 70, yPos);
          doc.text(String(zone.INF), 85, yPos);
          doc.text(String(zone.total), 100, yPos);

          yPos += 6;
        });

        // Fila de totales
        doc.text('TOTAL', 14, yPos);
        doc.text(String(stats.totals.M), 40, yPos);
        doc.text(String(stats.totals.F), 55, yPos);
        doc.text(String(stats.totals.CHD), 70, yPos);
        doc.text(String(stats.totals.INF), 85, yPos);
        doc.text(String(stats.total), 100, yPos);

        // Información de zonas
        doc.setFontSize(12);
        doc.text('Zones:', 14, 200);

        const zones = getSectionsInfo();
        let zoneY = 206;
        let xPos = 14;
        const zoneWidth = 40;
        const zoneMargin = 5;

        zones.forEach((zone, idx) => {
          if (idx > 0 && idx % 4 === 0) {
            xPos = 14;
            zoneY += 8;
          }

          doc.text(`${zone.id}: ${zone.name}`, xPos, zoneY);
          xPos += zoneWidth + zoneMargin;
        });
      }

    // Pie de página
    const currentDate = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated on ${currentDate}`, 105, 285, { align: 'center' });
    
    // Texto informativo sobre el tipo de reporte
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    let reportTypeText = 'All passengers are included in this report';
    if (viewMode === 'checkin') {
      reportTypeText = 'Only checked-in passengers are included in this report';
    } else if (viewMode === 'boarded') {
      reportTypeText = 'Only boarded passengers are included in this report';
    }
    
    doc.text(reportTypeText, 105, 270, { align: 'center' });
  }

  /**
   * Genera la página de lista de equipajes con fuente más pequeña
   */
  static generateBaggageListPage(doc, passengers, viewMode = 'all', weightUnit = 'kg') {
    // Función para convertir kg a libras
    const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);
    
    // Título adaptativo según modo
    let titleText = 'Baggage List';
    if (viewMode === 'checkin') {
      titleText = 'Checked-in Passengers Baggage';
    } else if (viewMode === 'boarded') {
      titleText = 'Boarded Passengers Baggage';
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(titleText, 105, 20, { align: 'center' });
    
    // Si hay equipajes
    const baggage = passengers.filter(p => p.baggage && p.baggage.pieces && p.baggage.pieces.length > 0);
    
    if (baggage.length > 0) {
      // Encabezados con fuente más pequeña
      doc.setFontSize(10);
      doc.text('Passenger', 14, 40);
      doc.text('Seat', 85, 40); // Ajustado para dar más espacio a nombres
      doc.text('Tag', 110, 40);
      doc.text('Weight', 160, 40);
      
      // Línea separadora
      doc.line(14, 42, 180, 42);
      
      // Usar fuente aún más pequeña para datos
      doc.setFontSize(9);
      
      // Listar equipajes con líneas más juntas
      let y = 48;
      const lineHeight = 7; // Reducido para mayor compactación
      
      baggage.forEach(passenger => {
        if (passenger.baggage && passenger.baggage.pieces) {
          passenger.baggage.pieces.forEach((piece, idx) => {
            // Truncar nombres largos
            const fullName = `${passenger.lastName}, ${passenger.firstName}`;
            const maxLength = 33; // Máximo de caracteres
            const displayName = fullName.length > maxLength 
              ? fullName.substring(0, maxLength) + '...' 
              : fullName;
            
            doc.text(displayName, 14, y);
            doc.text(passenger.seat || '-', 85, y);
            doc.text(piece.tag || '-', 110, y);
            
            // Mostrar peso según unidad seleccionada
            const weightValue = weightUnit === 'kg' 
              ? `${piece.weight} kg` 
              : `${kgToLbs(piece.weight)} lb`;
            
            doc.text(weightValue, 160, y);
            
            y += lineHeight;
            if (y > 270) {
              doc.addPage();
              y = 40;
              
              // Repetir encabezados en la nueva página
              doc.setFontSize(10);
              doc.text('Passenger', 14, y);
              doc.text('Seat', 85, y);
              doc.text('Tag', 110, y);
              doc.text('Weight', 160, y);
              doc.line(14, y+2, 180, y+2);
              
              doc.setFontSize(9);
              y += lineHeight + 2;
            }
          });
        }
      });
    } else {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('No baggage registered', 105, 70, { align: 'center' });
    }
    
    // Pie de página
    const currentDate = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated on ${currentDate}`, 105, 285, { align: 'center' });
    
    // Texto informativo del tipo de reporte
    let footerText = 'PASSENGER MANIFEST - All registered passengers included';
    if (viewMode === 'checkin') {
      footerText = 'CHECK-IN REPORT - Only checked-in passengers are included';
    } else if (viewMode === 'boarded') {
      footerText = 'BOARDING REPORT - Only boarded passengers are included';
    }
    doc.text(footerText, 105, 290, { align: 'center' });
  }

  /**
   * Genera la página de lista de pasajeros con fuente más pequeña
   */
  static generatePassengerListPage(doc, passengers, viewMode = 'all', weightUnit = 'kg') {
    // Título adaptativo
    let titleText = 'Passenger List';
    if (viewMode === 'checkin') {
      titleText = 'Checked-in Passenger List';
    } else if (viewMode === 'boarded') {
      titleText = 'Boarded Passenger List';
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(titleText, 105, 20, { align: 'center' });
    
    if (passengers.length > 0) {
      // Encabezados - fuente un poco más pequeña
      doc.setFontSize(10); // Reducido de 11 a 10
      doc.text('Passenger', 14, 40);
      doc.text('Type', 85, 40); // Ajustado para dar más espacio al nombre
      doc.text('ID', 105, 40); // Ajustado
      doc.text('Seat', 145, 40); // Ajustado
      doc.text('Boarding Time', 165, 40); // Ajustado
      
      // Línea separadora
      doc.line(14, 42, 196, 42);
      
      // Ordenar pasajeros por hora de embarque (del más reciente al más antiguo)
      const sortedPassengers = [...passengers].sort((a, b) => {
        if (!a.boardedAt) return 1;
        if (!b.boardedAt) return -1;
        return new Date(b.boardedAt) - new Date(a.boardedAt);
      });
      
      // Reducir aún más el tamaño de fuente para los datos
      doc.setFontSize(9); // Reducido a 9 para los datos
      
      // Listar pasajeros con mayor espaciado vertical
      let y = 48;
      const lineHeight = 7; // Reducido de 8 a 7 para acomodar más filas
      
      sortedPassengers.forEach(passenger => {
        // Truncar nombres muy largos y añadir elipsis si es necesario
        const fullName = `${passenger.lastName}, ${passenger.firstName}`;
        const maxLength = 33; // Longitud máxima antes de truncar
        const displayName = fullName.length > maxLength 
          ? fullName.substring(0, maxLength) + '...' 
          : fullName;
        
        doc.text(displayName, 14, y);
        doc.text(`${passenger.passengerType || 'ADT'}${passenger.passengerType === 'ADT' ? ` (${passenger.gender || 'M'})` : ''}`, 85, y);
        
        const docNumber = passenger.documentNumber !== undefined && passenger.documentNumber !== null
          ? String(passenger.documentNumber) 
          : '-';

        // Mostramos el número completo sin truncar
        doc.text(docNumber, 105, y);
        doc.text(String(passenger.seat || '-'), 145, y);
        
        // Formatear la hora de embarque
        let boardingTime = '-';
        if (passenger.boardedAt) {
          const date = new Date(passenger.boardedAt);
          boardingTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        doc.text(boardingTime, 165, y);
        
        y += lineHeight; // Usar el nuevo valor de espaciado
        
        // Si llegamos al final de la página, crear una nueva
        if (y > 270) {
          doc.addPage();
          // Nueva página, añadir encabezados
          y = 40;
          
          // Repetir encabezados en la nueva página
          doc.setFontSize(10);
          doc.text('Passenger', 14, y);
          doc.text('Type', 85, y);
          doc.text('ID', 105, y);
          doc.text('Seat', 145, y);
          doc.text('Boarding Time', 165, y);
          doc.line(14, y+2, 196, y+2);
          
          doc.setFontSize(9); // Volver al tamaño para datos
          y += lineHeight + 2; // Añadir espacio después de encabezados
        }
      });
    } else {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('No passengers found', 105, 70, { align: 'center' });
    }
    
    // Pie de página
    const currentDate = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated on ${currentDate}`, 105, 285, { align: 'center' });
    
    // Texto informativo sobre el tipo de reporte
    let footerText = 'PASSENGER MANIFEST - All registered passengers included';
    if (viewMode === 'checkin') {
      footerText = 'CHECK-IN REPORT - Only checked-in passengers are included';
    } else if (viewMode === 'boarded') {
      footerText = 'BOARDING REPORT - Only boarded passengers are included';
    }
    doc.text(footerText, 105, 290, { align: 'center' });
  }
}

export default PDFService;