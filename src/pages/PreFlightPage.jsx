// src/pages/PreFlightPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFlightContext } from '../contexts/FlightContext';
import { usePassengersContext } from '../contexts/PassengersContext';
import { useAuth } from '../contexts/AuthContext';
import AircraftSeatMapEditor from '../components/pre-flight/AircraftSeatMapEditor/index';
import PrinterConfig from '../components/pre-flight/PrinterConfig';
import LogoManager from '../components/pre-flight/LogoManager';
import Sidebar from '../components/pre-flight/Sidebar';
import TabNavigation from '../components/pre-flight/TabNavigation';
import FlightInfoTab from '../components/pre-flight/FlightInfoTab';
import AircraftTab from '../components/pre-flight/AircraftTab';
import PassengersTab from '../components/pre-flight/PassengersTab';
import UsersManagement from '../components/pre-flight/UsersManagement';
import { FaPlus, FaPrint, FaTimes } from 'react-icons/fa';

const PreFlightPage = () => {
  const { flightDetails, setFlightDetails, activeFlightId, saveFlight } = useFlightContext();
  const { passengerList, setPassengerList } = usePassengersContext();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  
  // Estados para UI
  const [activeTab, setActiveTab] = useState('info');
  const [activeSection, setActiveSection] = useState('flights');
  const [showSeatMapEditor, setShowSeatMapEditor] = useState(false);
  const [showLogoManager, setShowLogoManager] = useState(false);
  const [showPrinterConfig, setShowPrinterConfig] = useState(false);
  
  // Estado para monitorear pasos completados
  const [completedSteps, setCompletedSteps] = useState({
    info: false,
    aircraft: false,
    passengers: false
  });

  // Verificar estado completado de pestañas
  useEffect(() => {
    if (activeFlightId) {
      setCompletedSteps(prev => ({ ...prev, info: true }));
    } else {
      setCompletedSteps(prev => ({ ...prev, info: false }));
    }
    
    if (flightDetails.seatConfig) {
      setCompletedSteps(prev => ({ ...prev, aircraft: true }));
    }
    
    if (passengerList.length > 0) {
      setCompletedSteps(prev => ({ ...prev, passengers: true }));
    }
  }, [activeFlightId, flightDetails.seatConfig, passengerList.length]);

  // Cargar datos desde localStorage
  useEffect(() => {
    try {
      const isNewFlight = localStorage.getItem('isNewFlight') === 'true';
      
      if (!isNewFlight) {
        const savedPassengerList = localStorage.getItem('passengerList');
        if (savedPassengerList) {
          setPassengerList(JSON.parse(savedPassengerList));
        }
        
        const savedFlightDetails = localStorage.getItem('flightDetails');
        if (savedFlightDetails) {
          setFlightDetails(JSON.parse(savedFlightDetails));
        }
      } else {
        localStorage.removeItem('isNewFlight');
      }
    } catch (error) {
      console.error('Error al cargar datos desde localStorage:', error);
    }
  }, [setPassengerList, setFlightDetails]);

  // Recuperar configuración de asientos si falta
  useEffect(() => {
    if (activeFlightId && flightDetails.id === activeFlightId && !flightDetails.seatConfig) {
      try {
        const savedFlightList = localStorage.getItem('flightList');
        if (savedFlightList) {
          const flights = JSON.parse(savedFlightList);
          const fullFlightData = flights.find(f => f.id === activeFlightId);
          
          if (fullFlightData && fullFlightData.seatConfig) {
            setFlightDetails(prev => ({
              ...prev,
              seatConfig: fullFlightData.seatConfig
            }));
          }
        }
      } catch (error) {
        console.error("Error recuperando seatConfig:", error);
      }
    }
  }, [activeFlightId, flightDetails, setFlightDetails]);

  // Funciones de manejo de eventos
  const handleSeatConfigSave = (config) => {
    const newFlightDetails = {
      ...flightDetails,
      seatConfig: config,
      aircraft: config.aircraftType || config.aircraftModel || flightDetails.aircraft
    };
    
    setFlightDetails(newFlightDetails);
    localStorage.setItem('flightDetails', JSON.stringify(newFlightDetails));
    setCompletedSteps(prev => ({ ...prev, aircraft: true }));
  };

  const handleSaveFlightInfo = async () => {
    if (!flightDetails.flightNumber || !flightDetails.aircraft || !flightDetails.std) {
      alert('Por favor completa los campos obligatorios: Número de vuelo, Tipo de aeronave y hora de salida (STD)');
      return false;
    }
    
    const savedFlightId = await saveFlight();
    
    if (savedFlightId) {
      setFlightDetails(prev => ({ ...prev, id: savedFlightId }));
      setCompletedSteps(prev => ({ ...prev, info: true }));
      setActiveTab('aircraft');
      return true;
    } else {
      alert('Hubo un problema al guardar el vuelo. Intente nuevamente.');
      return false;
    }
  };

  const handleNewFlight = () => {
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
    
    setCompletedSteps({
      info: false,
      aircraft: false,
      passengers: false
    });
    
    setActiveTab('info');
    localStorage.setItem('isNewFlight', 'true');
  };

  const handleFinishConfig = () => {
    if (completedSteps.info && completedSteps.aircraft) {
      navigate('/checkin');
    } else {
      alert('Por favor completa la información básica del vuelo y la configuración de la aeronave antes de continuar.');
    }
  };

  // Renderizar contenido según la sección activa
  const renderContent = () => {
    if (activeSection === 'printers') {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configuración de Impresoras</h2>
          <PrinterConfig onClose={() => {}} />
        </div>
      );
    } else if (activeSection === 'users') {
      // Verificar si el usuario tiene permisos de administrador
      if (userRole !== 'admin') {
        return (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Acceso restringido</p>
            <p>Solo los administradores pueden gestionar usuarios.</p>
          </div>
        );
      }
      
      return <UsersManagement />;
    } else {
      // Sección de vuelos (predeterminada)
      return (
        <>
          <TabNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            completedSteps={completedSteps}
          />
          
          {activeTab === 'info' && 
            <FlightInfoTab 
              flightDetails={flightDetails}
              setFlightDetails={setFlightDetails}
              onSave={handleSaveFlightInfo}
              onShowLogoManager={() => setShowLogoManager(true)}
            />
          }
          
          {activeTab === 'aircraft' && 
            <AircraftTab 
              flightDetails={flightDetails}
              onSave={() => {
                setCompletedSteps(prev => ({ ...prev, aircraft: true }));
                setActiveTab('passengers');
              }}
              onBack={() => setActiveTab('info')}
              onShowEditor={() => setShowSeatMapEditor(true)}
            />
          }
          
          {activeTab === 'passengers' && 
            <PassengersTab 
              flightDetails={flightDetails}
              onBack={() => setActiveTab('aircraft')}
              onFinish={handleFinishConfig}
              onComplete={() => setCompletedSteps(prev => ({ ...prev, passengers: true }))}
            />
          }
        </>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userRole={userRole}
      />
      
      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-4">
          {/* Banner y header */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="font-bold">Modo Administrador</p>
            </div>
            <p className="mt-1">
              Esta sección es para configuración y administración de vuelos. 
              Los operadores de check-in deberían usar la sección "Vuelos" para seleccionar un vuelo activo.
            </p>
          </div>

          {/* Header con botones de acción */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Configuración Pre-Vuelo</h1>
            
            <div className="flex space-x-3">
              <button
                onClick={handleNewFlight}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center"
              >
                <FaPlus className="mr-2" /> Nuevo Vuelo
              </button>
            </div>
          </div>
          
          {/* Contenido principal */}
          {renderContent()}
        </div>
      </div>

      {/* Modales */}
      {showSeatMapEditor && (
        <AircraftSeatMapEditor
          isOpen={showSeatMapEditor}
          onClose={() => setShowSeatMapEditor(false)}
          initialConfig={flightDetails.seatConfig}
          onSave={handleSeatConfigSave}
        />
      )}

      {showLogoManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <LogoManager 
              flightId={flightDetails.id || 'new-flight'} 
              onClose={() => setShowLogoManager(false)}
              onSave={(logoData) => {
                console.log('Logo guardado para el vuelo');
                setShowLogoManager(false);
              }}
            />
          </div>
        </div>
      )}

      {showPrinterConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Configuración de Impresoras</h2>
              <button 
                onClick={() => setShowPrinterConfig(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="overflow-auto max-h-[70vh]">
              <PrinterConfig 
                onClose={() => setShowPrinterConfig(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreFlightPage;