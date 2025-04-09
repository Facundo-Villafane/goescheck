// src/pages/SummaryPage.jsx (modificado con opciones de filtrado)
import { useState, useEffect, useRef } from 'react';
import { FaSave, FaPlane, FaEnvelope, FaPrint, FaFilter } from 'react-icons/fa';
import { useFlightContext } from '../contexts/FlightContext';
import { usePassengersContext } from '../contexts/PassengersContext';

// Importar componentes modulares
import FlightInfoSection from '../components/summary/FlightInfoSection';
import StatsSection from '../components/summary/StatsSection';
import BoardedStatsSection from '../components/summary/BoardedStatsSection';
import DistributionTable from '../components/summary/DistributionTable';
import BaggageList from '../components/summary/BaggageList';
import BoardedBaggageList from '../components/summary/BoardedBaggageList';
import PassengerList from '../components/summary/PassengerList';
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
  
  // Estados para filtrado y estadísticas
  const [viewMode, setViewMode] = useState('all'); // 'all', 'checkin', 'boarded'
  const [stats, setStats] = useState(StatsService.getInitialStats());
  const [filteredPassengers, setFilteredPassengers] = useState([]);
  const [boardedPassengers, setBoardedPassengers] = useState([]);
  const [totalPassengers, setTotalPassengers] = useState(0);
  const [totalCheckedIn, setTotalCheckedIn] = useState(0);
  
  // Actualizar filtros y estadísticas cuando cambian los datos
  useEffect(() => {
    // Obtener pasajeros para este vuelo
    const flightPassengers = passengerList.filter(p => p.flightId === flightDetails.id);
    setTotalPassengers(flightPassengers.length);
    
    // Filtrar según modo de vista
    let passengers = [];
    if (viewMode === 'all') {
      // Todos los pasajeros
      passengers = flightPassengers;
    } else if (viewMode === 'checkin') {
      // Solo pasajeros con check-in
      passengers = flightPassengers.filter(p => p.checkedIn);
    } else if (viewMode === 'boarded') {
      // Solo pasajeros embarcados
      passengers = flightPassengers.filter(p => p.boarded === true);
    }
    
    setFilteredPassengers(passengers);
    
    // Guardar el total de pasajeros con check-in para la comparación
    const checkedIn = flightPassengers.filter(p => p.checkedIn);
    setTotalCheckedIn(checkedIn.length);
    
    // Guardar pasajeros embarcados por separado
    const boarded = flightPassengers.filter(p => p.boarded === true);
    setBoardedPassengers(boarded);
    
    // Calcular estadísticas con los pasajeros filtrados
    const newStats = StatsService.calculateStats(passengers, flightDetails);
    setStats(newStats);
    
  }, [checkedInPassengers, passengerList, flightDetails, viewMode]);
  
  // Función para obtener la información de las secciones 
  const getSectionsInfo = () => StatsService.getSectionsInfo(flightDetails);
  
  // Imprimir resumen
  const handlePrint = () => {
    window.print();
  };
  
  // Definir la función para generar el reporte DCS
  const generateDCSReport = async () => {
    try {
      const logoDataURL = await captureLogoAsImage();
      
      await PDFService.generateDepartureControlPDF(
        flightDetails,
        filteredPassengers,
        stats,
        logoDataURL
      );
    } catch (error) {
      console.error('Error generando reporte DCS:', error);
      alert(`Error al generar reporte: ${error.message}`);
    }
  };

  // Generar PDF optimizado para A4 con logo
  const generatePDF = async () => {
    try {
      // Obtener la unidad de peso actual del localStorage o usar kg por defecto
    const currentWeightUnit = localStorage.getItem('weightUnit') || 'kg';

      // Intentar convertir el Logo a imagen
      const logoDataURL = await captureLogoAsImage();
      
      

      // Generar el PDF usando el servicio
      await PDFService.generateFlightSummaryPDF(
        flightDetails,
        filteredPassengers,
        stats,
        getSectionsInfo,
        logoDataURL,
        viewMode,
        currentWeightUnit
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
  
  // Función para mostrar el título según el modo
  const getViewModeTitle = () => {
    switch(viewMode) {
      case 'all': 
        return 'Manifest (All Passengers)';
      case 'checkin': 
        return 'Check-in Summary';
      case 'boarded': 
        return 'Boarding Summary';
      default: 
        return 'Flight Summary';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto print:w-full">
      {/* Logo invisible para generar la imagen para el PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <Logo ref={logoRef} size="xl" fillColor="#000000" />
      </div>
      
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold flex items-center">
          <FaPlane className="mr-2 text-sand" /> {getViewModeTitle()}
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
      
      {/* Opciones de filtrado */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="font-medium flex items-center">
            <FaFilter className="mr-2 text-gray-600" /> Mostrar:
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-md ${
                viewMode === 'all' 
                  ? 'bg-sand text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Todos los pasajeros ({totalPassengers})
            </button>
            
            <button
              onClick={() => setViewMode('checkin')}
              className={`px-3 py-1.5 rounded-md ${
                viewMode === 'checkin' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Solo con check-in ({totalCheckedIn})
            </button>
            
            <button
              onClick={() => setViewMode('boarded')}
              className={`px-3 py-1.5 rounded-md ${
                viewMode === 'boarded' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Solo embarcados ({boardedPassengers.length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Banner de estadísticas según modo */}
      {viewMode === 'checkin' && (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-r-md">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-blue-800">Estado del Check-in</h2>
            <div className="text-xl font-bold text-blue-700">
              {totalCheckedIn} / {totalPassengers} pasajeros ({Math.round((totalCheckedIn / totalPassengers) * 100) || 0}%)
            </div>
          </div>
        </div>
      )}
      
      {viewMode === 'boarded' && totalCheckedIn > 0 && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded-r-md">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-green-800">Estado de Embarque</h2>
            <div className="text-xl font-bold text-green-700">
              {boardedPassengers.length} / {totalCheckedIn} pasajeros ({Math.round((boardedPassengers.length / totalCheckedIn) * 100) || 0}%)
            </div>
          </div>
        </div>
      )}
      
      {/* Información del vuelo */}
      <FlightInfoSection 
        flightDetails={flightDetails} 
        forwardRef={flightInfoRef} 
      />
      
      {/* Estadísticas según el modo */}
      {viewMode === 'boarded' ? (
        <BoardedStatsSection 
          stats={stats} 
          forwardRef={statsRef} 
        />
      ) : (
        <StatsSection 
          stats={stats} 
          forwardRef={statsRef} 
        />
      )}
      
      {/* Distribución por secciones (si hay asientos asignados) */}
      {filteredPassengers.some(p => p.seat) && (
        <DistributionTable
          stats={stats}
          getSectionsInfo={getSectionsInfo}
          forwardRef={distributionRef}
        />
      )}
      
      {/* Lista de equipaje según modo */}
      {viewMode === 'boarded' ? (
        <BoardedBaggageList
          passengers={filteredPassengers}
          forwardRef={baggageListRef}
        />
      ) : (
        <BaggageList
          passengers={filteredPassengers}
          forwardRef={baggageListRef}
        />
      )}
      
      {/* Lista de pasajeros según modo */}
      {viewMode === 'boarded' ? (
        <div className="bg-white rounded-lg shadow p-6 print:shadow-none print:border page-break-before" ref={passengerListRef}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaPlane className="mr-2 text-green-600" /> Boarded Passengers List ({filteredPassengers.length})
          </h2>
          
          <BoardedPassengerList
            passengers={filteredPassengers}
            showBoardingTime={true}
          />
        </div>
      ) : (
        <PassengerList 
          passengers={filteredPassengers} 
          forwardRef={passengerListRef}
          showBoardingStatus={viewMode === 'checkin'} // Mostrar estado de embarque solo en modo checkin
        />
      )}
      
      {/* Pie de página */}
      <div className="mt-8 text-center text-sm text-gray-500 print:mt-4">
        <p>Generated on {new Date().toLocaleString()}</p>
        <p className="font-medium text-sand">
          {viewMode === 'all' ? 'This report shows all passengers' : 
           viewMode === 'checkin' ? 'This report shows only checked-in passengers' :
           'This report shows only boarded passengers'}
        </p>
      </div>
      
      {/* Modal de exportación */}
      <ExportModal 
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportPDF={generatePDF}
        onPrint={handlePrint}
        onExportDCS={generateDCSReport} // Pasar la función como prop
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