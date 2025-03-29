// src/pages/SummaryPage.jsx
import { useState, useEffect, useRef } from 'react';
import { FaSave } from 'react-icons/fa';
import { useFlightContext } from '../contexts/FlightContext';
import { usePassengersContext } from '../contexts/PassengersContext';

// Importar componentes modulares
import FlightInfoSection from '../components/summary/FlightInfoSection';
import StatsSection from '../components/summary/StatsSection';
import DistributionTable from '../components/summary/DistributionTable';
import BaggageList from '../components/summary/BaggageList';
import PassengerList from '../components/summary/PassengerList';
import ExportModal from '../components/common/ExportModal';
import Logo from '../components/common/Logo';

// Importar servicios
import StatsService from '../services/StatsService';
import PDFService from '../services/PDFService';

// Importar hook personalizado para capturar logo
import useLogoCapture from '../hook/useLogoCapture';

const SummaryPage = () => {
  const { flightDetails } = useFlightContext();
  const { checkedInPassengers } = usePassengersContext();
  
  // Usar el hook para capturar el logo
  const { logoRef, captureLogoAsImage } = useLogoCapture();
  
  // Referencias para los componentes que se exportarán a PDF
  const flightInfoRef = useRef(null);
  const statsRef = useRef(null);
  const distributionRef = useRef(null);
  const baggageListRef = useRef(null);
  const passengerListRef = useRef(null);
  
  // Estado para mostrar/ocultar modal de selección de exportación
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Estado para las estadísticas
  const [stats, setStats] = useState(StatsService.getInitialStats());
  
  // Calcular estadísticas cuando cambian los pasajeros o el vuelo
  useEffect(() => {
    const newStats = StatsService.calculateStats(
      checkedInPassengers, 
      flightDetails
    );
    setStats(newStats);
  }, [checkedInPassengers, flightDetails]);
  
  // Función para obtener la información de las secciones 
  const getSectionsInfo = () => StatsService.getSectionsInfo(flightDetails);
  
  // Imprimir resumen
  const handlePrint = () => {
    window.print();
  };
  
  // Generar PDF optimizado para A4 con logo
  const generatePDF = async () => {
    try {
      // Intentar convertir el Logo a imagen
      const logoDataURL = await captureLogoAsImage();
      
      // Generar el PDF usando el servicio
      await PDFService.generateFlightSummaryPDF(
        flightDetails,
        checkedInPassengers,
        stats,
        getSectionsInfo,
        logoDataURL
      );
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert(`Error al generar PDF: ${error.message}`);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto print:w-full">
      {/* Logo invisible para generar la imagen para el PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <Logo ref={logoRef} size="xl" fillColor="#000000" />
      </div>
      
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold">Summary</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-sand hover:bg-noche text-white rounded-md flex items-center"
          >
            <FaSave className="mr-2" /> Exportar
          </button>
        </div>
      </div>
      
      {/* Información del vuelo */}
      <FlightInfoSection 
        flightDetails={flightDetails} 
        forwardRef={flightInfoRef} 
      />
      
      {/* Estadísticas */}
      <StatsSection 
        stats={stats} 
        forwardRef={statsRef} 
      />
      
      {/* Distribución por tabla */}
      <DistributionTable
        stats={stats}
        getSectionsInfo={getSectionsInfo}
        forwardRef={distributionRef}
      />
      
      {/* Lista de pasajeros con equipaje */}
      <BaggageList
        passengers={checkedInPassengers}
        forwardRef={baggageListRef}
      />
      
      {/* Lista completa de pasajeros */}
      <PassengerList
        passengers={checkedInPassengers}
        forwardRef={passengerListRef}
      />
      
      {/* Pie de página */}
      <div className="mt-8 text-center text-sm text-gray-500 print:mt-4">
        <p>Generated on {new Date().toLocaleString()}</p>
      </div>
      
      {/* Modal de exportación */}
      <ExportModal 
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportPDF={generatePDF}
        onPrint={handlePrint}
      />
      
      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            background-color: white;
          }
          
          .page-break-before {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
};

export default SummaryPage;