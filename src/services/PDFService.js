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
   * @returns {Promise} - Promesa que resuelve cuando el PDF se ha guardado
   */
  static generateFlightSummaryPDF(flightDetails, passengers, stats, getSectionsInfo, logoDataURL) {
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
          title: `Flight Summary ${flightDetails.flightNumber || 'Sin número'}`,
          subject: 'Check-in Closed',
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
        this.generateFlightInfoPage(doc, flightDetails, stats, getSectionsInfo);
        
        // --- PÁGINA 2: Lista de equipajes ---
        doc.addPage();
        addLogoHeader(); // Añadir logo a la segunda página
        this.generateBaggageListPage(doc, passengers);
        
        // --- PÁGINA 3: Lista de pasajeros ---
        doc.addPage();
        addLogoHeader(); // Añadir logo a la tercera página
        this.generatePassengerListPage(doc, passengers);
        
        // Guardar PDF
        const fileName = `checkin_${flightDetails.flightNumber || 'flight'}_${new Date().toISOString().split('T')[0]}.pdf`;
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
  static generateFlightInfoPage(doc, flightDetails, stats, getSectionsInfo) {
    // Main Title
doc.setFontSize(16);
doc.setTextColor(0);
doc.text('Check-in Summary', 105, 20, { align: 'center' });

// Flight Information
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

// Passenger Statistics
doc.setFontSize(14);
doc.text('Passenger Information', 14, 74);

doc.setFontSize(11);
doc.text('Total Passengers:', 14, 84);
doc.text(stats.total.toString(), 80, 84);

doc.text('Adults - Male:', 14, 90);
doc.text(stats.byType.ADT.M.toString(), 80, 90);

doc.text('Adults - Female:', 14, 96);
doc.text(stats.byType.ADT.F.toString(), 80, 96);

doc.text('Children:', 14, 102);
doc.text(stats.byType.CHD.toString(), 80, 102);

doc.text('Infants:', 14, 108);
doc.text(stats.byType.INF.toString(), 80, 108);

// Baggage Statistics
doc.setFontSize(14);
doc.text('Baggage Information', 14, 118);

doc.setFontSize(11);
doc.text('Total Pieces:', 14, 128);
doc.text(stats.baggage.count.toString(), 80, 128);

doc.text('Total Weight:', 14, 134);
doc.text(`${stats.baggage.weight.toFixed(1)} kg`, 80, 134);

doc.text('Average W/p:', 14, 140);
doc.text(`${stats.total > 0 ? (stats.baggage.weight / stats.total).toFixed(1) : '0'} kg`, 80, 140);

// Zone Distribution
doc.setFontSize(14);
doc.text('Zone Distribution', 14, 150);

doc.setFontSize(11);
doc.text('Zone', 14, 160);
doc.text('M', 40, 160);
doc.text('F', 55, 160);
doc.text('C', 70, 160);
doc.text('I', 85, 160);
doc.text('TOTAL', 100, 160);

// Line separator
doc.line(14, 162, 120, 162);

// Data for each zone
let yPos = 168;
Object.keys(stats.bySection).forEach((zoneId, index) => {
  const zone = stats.bySection[zoneId];

  doc.text(zoneId, 14, yPos);
  doc.text(zone.M.toString(), 40, yPos);
  doc.text(zone.F.toString(), 55, yPos);
  doc.text(zone.CHD.toString(), 70, yPos);
  doc.text(zone.INF.toString(), 85, yPos);
  doc.text(zone.total.toString(), 100, yPos);

  yPos += 6;
});

// Total row
doc.text('TOTAL', 14, yPos);
doc.text(stats.totals.M.toString(), 40, yPos);
doc.text(stats.totals.F.toString(), 55, yPos);
doc.text(stats.totals.CHD.toString(), 70, yPos);
doc.text(stats.totals.INF.toString(), 85, yPos);
doc.text(stats.total.toString(), 100, yPos);

// Zone information
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

// Footer
const currentDate = new Date().toLocaleString();
doc.setFontSize(8);
doc.setTextColor(150);
doc.text(`Generated on ${currentDate}`, 105, 285, { align: 'center' });
  }

  /**
   * Genera la página de lista de equipajes
   */
  static generateBaggageListPage(doc, passengers) {
    // Título de la página - ajustado para dar espacio al logo
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Baggage List', 105, 20, { align: 'center' });
    
    // Si hay equipajes
    const baggage = passengers.filter(p => p.baggage && p.baggage.pieces && p.baggage.pieces.length > 0);
    
    if (baggage.length > 0) {
      // Encabezados
      doc.setFontSize(11);
      doc.text('Passenger', 14, 40);
      doc.text('Seat', 80, 40);
      doc.text('Tag', 110, 40);
      doc.text('Weight', 160, 40);
      
      // Línea separadora
      doc.line(14, 42, 180, 42);
      
      // Listar equipajes
      let y = 48;
      baggage.forEach(passenger => {
        if (passenger.baggage && passenger.baggage.pieces) {
          passenger.baggage.pieces.forEach((piece, idx) => {
            doc.text(`${passenger.lastName}, ${passenger.firstName}`, 14, y);
            doc.text(passenger.seat || '-', 80, y);
            doc.text(piece.tag, 110, y);
            doc.text(`${piece.weight} kg`, 160, y);
            
            y += 8;
            if (y > 270) {
              doc.addPage();
              addLogoHeader(); // el logo aquí también
              y = 40;
              // Repetir encabezados en la nueva página
              doc.text('Passenger', 14, 40);
              doc.text('Seat', 80, 40);
              doc.text('Tag', 110, 40);
              doc.text('Weight', 160, 40);
              doc.line(14, y+2, 180, y+2);
              y += 8;
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
  }

  /**
   * Genera la página de lista de pasajeros
   */
  static generatePassengerListPage(doc, passengers) {
    // Título de la página - ajustado para dar espacio al logo
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Passenger List', 105, 20, { align: 'center' });
    
    if (passengers.length > 0) {
      // Encabezados
      doc.setFontSize(11);
      doc.text('Passenger', 14, 40);
      doc.text('Type', 70, 40);
      doc.text('ID', 90, 40);
      doc.text('Seat', 140, 40);
      doc.text('Baggage', 160, 40);
      
      // Línea separadora
      doc.line(14, 42, 180, 42);
      
      // Listar pasajeros
      let y = 48;
      passengers.forEach(passenger => {
        doc.text(`${passenger.lastName}, ${passenger.firstName}`, 14, y);
        doc.text(`${passenger.passengerType || 'ADT'}${passenger.passengerType === 'ADT' ? ` (${passenger.gender || 'M'})` : ''}`, 70, y);
        doc.text(`${passenger.documentType || 'DNI'}: ${passenger.documentNumber}`, 90, y);
        doc.text(passenger.seat || '-', 140, y);
        doc.text(passenger.baggage && passenger.baggage.pieces 
          ? `${passenger.baggage.pieces.length} (${passenger.baggage.weight} kg)`
          : '-', 160, y);
        
        y += 8;
        if (y > 270) {
          doc.addPage();
          addLogoHeader(); //  el logo aquí también
          y = 40;
          // Repetir encabezados en la nueva página
          doc.text('Passenger', 14, 40);
          doc.text('Type', 70, 40);
          doc.text('ID', 90, 40);
          doc.text('Seat', 140, 40);
          doc.text('Baggage', 160, 40);
          doc.line(14, y+2, 180, y+2);
          y += 8;
        }
      });
    } else {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('No checked-in passengers', 105, 70, { align: 'center' });
    }
    
    // Pie de página
    const currentDate = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated on ${currentDate}`, 105, 285, { align: 'center' });
  }
}

export default PDFService;