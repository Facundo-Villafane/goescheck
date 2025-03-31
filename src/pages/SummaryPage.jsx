// src/pages/SummaryPage.jsx - Versión final enfocada solo en pasajeros embarcados
import { useState, useEffect, useRef } from 'react';
import { FaSave, FaPlane, FaEnvelope, FaPrint } from 'react-icons/fa';
import { useFlightContext } from '../contexts/FlightContext';
import { usePassengersContext } from '../contexts/PassengersContext';

// Importar componentes modulares
import FlightInfoSection from '../components/summary/FlightInfoSection';
import BoardedStatsSection from '../components/summary/BoardedStatsSection';
import DistributionTable from '../components/summary/DistributionTable';
import BoardedBaggageList from '../components/summary/BoardedBaggageList';
import BoardedPassengerList from '../components/summary/BoardedPassengerList';
import ExportModal from '../components/common/ExportModal';
import Logo from '../components/common/Logo';

// Importar servicios
import StatsService from '../services/StatsService';
import PDFService from '../services/PDFService';

// Importar hook personalizado para capturar logo
import useLogoCapture from '../hook/useLogoCapture';

const SummaryPage = () => {
  const { flightDetails } = useFlightContext();
  const { checkedInPassengers, passengerList } = usePassengersContext();
  
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
  
  // Estados para las estadísticas y datos de pasajeros embarcados
  const [stats, setStats] = useState(StatsService.getInitialStats());
  const [boardedPassengers, setBoardedPassengers] = useState([]);
  const [totalCheckedIn, setTotalCheckedIn] = useState(0);
  
  // Obtener solo pasajeros embarcados
  useEffect(() => {
    // Filtrar pasajeros embarcados del listado general
    const boarded = passengerList.filter(p => p.boarded === true);
    setBoardedPassengers(boarded);
    
    // Guardar el total de pasajeros con check-in para la comparación
    setTotalCheckedIn(checkedInPassengers.length);
    
    // Calcular estadísticas solo con pasajeros embarcados
    const newStats = StatsService.calculateStats(boarded, flightDetails);
    setStats(newStats);
  }, [checkedInPassengers, passengerList, flightDetails]);
  
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
        boardedPassengers,
        stats,
        getSectionsInfo,
        logoDataURL
      );
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert(`Error al generar PDF: ${error.message}`);
    }
  };

  // Función para enviar el resumen por correo (placeholder)
  const handleEmailReport = () => {
    alert('Esta funcionalidad aún no está implementada');
    // Aquí irá la lógica para enviar por correo
  };
  
  return (
    <div className="max-w-4xl mx-auto print:w-full">
      {/* Logo invisible para generar la imagen para el PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <Logo ref={logoRef} size="xl" fillColor="#000000" />
      </div>
      
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold flex items-center">
          <FaPlane className="mr-2 text-green-600" /> Boarding Summary
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-sand hover:bg-noche text-white rounded-md flex items-center"
          >
            <FaSave className="mr-2" /> Exportar
          </button>
          
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
          >
            <FaPrint className="mr-2" /> Imprimir
          </button>
        </div>
      </div>
      
      {/* Banner de estadísticas de embarque */}
      <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded-r-md">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-green-800">Estado de Embarque</h2>
          <div className="text-xl font-bold text-green-700">
            {boardedPassengers.length} / {totalCheckedIn} pasajeros ({Math.round((boardedPassengers.length / totalCheckedIn) * 100) || 0}%)
          </div>
        </div>
      </div>
      
      {/* Información del vuelo */}
      <FlightInfoSection 
        flightDetails={flightDetails} 
        forwardRef={flightInfoRef} 
      />
      
      {/* Estadísticas específicas de embarque */}
      <BoardedStatsSection 
        stats={stats} 
        forwardRef={statsRef} 
      />
      
      {/* Distribución por secciones (si hay asientos asignados) */}
      {boardedPassengers.some(p => p.seat) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 print:shadow-none print:border" ref={distributionRef}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaPlane className="mr-2" /> Distribución de Pasajeros Embarcados
          </h2>
          
          <DistributionTable
            stats={stats}
            getSectionsInfo={getSectionsInfo}
          />
        </div>
      )}
      
      {/* Lista de equipaje de pasajeros embarcados */}
      <BoardedBaggageList
        passengers={boardedPassengers}
        forwardRef={baggageListRef}
      />
      
      {/* Lista de pasajeros embarcados */}
      <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border page-break-before" ref={passengerListRef}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaPlane className="mr-2 text-green-600" /> Boarded Passengers List ({boardedPassengers.length})
        </h2>
        
        <BoardedPassengerList
          passengers={boardedPassengers}
          showBoardingTime={true}
        />
      </div>
      
      {/* Pie de página */}
      <div className="mt-8 text-center text-sm text-gray-500 print:mt-4">
        <p>Generated on {new Date().toLocaleString()}</p>
        <p className="font-medium text-green-600">
          This report shows only boarded passengers ({boardedPassengers.length} of {totalCheckedIn} checked-in)
        </p>
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