// src/components/layout/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useFlightContext } from '../../contexts/FlightContext';
import Navbar from './Navbar';
import { FaPlane, FaRegCheckCircle, FaChartBar, FaTools, FaCog, FaClock } from 'react-icons/fa';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const location = useLocation();
  const { activeFlightId, flightDetails } = useFlightContext();
  const { userRole, canAccessSection } = useAuth();
  const navigate = useNavigate();

  // Cerrar el sidebar cuando cambia la ruta
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Calcular y actualizar el tiempo restante
// Calcular y actualizar el tiempo restante
useEffect(() => {
  if (activeFlightId && flightDetails && flightDetails.std && flightDetails.date) {
    const updateTimeRemaining = () => {
      try {
        console.log('Calculando tiempo para vuelo:', flightDetails.flightNumber);
        
        // Parsear la fecha correctamente (asegurándonos de que sea la fecha local)
        const [year, month, day] = flightDetails.date.split('-').map(Number);
        
        // Mes en JavaScript comienza en 0, por lo que restamos 1
        const departureDate = new Date(year, month - 1, day);
        
        // Extraer horas y minutos de STD (formato HH:MM)
        const stdParts = flightDetails.std.split(':');
        const hours = parseInt(stdParts[0], 10);
        const minutes = parseInt(stdParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes)) {
          console.warn('Formato de hora STD inválido:', flightDetails.std);
          setTimeRemaining(null);
          return;
        }
        
        // Configurar la hora en la fecha de salida
        departureDate.setHours(hours, minutes, 0, 0);
        
        // Crear fecha para el cierre de check-in (45 minutos antes del STD)
        const checkInCloseDate = new Date(departureDate);
        checkInCloseDate.setMinutes(checkInCloseDate.getMinutes() - 45);
        
        console.log('Fecha y hora de salida:', departureDate.toLocaleString());
        console.log('Fecha y hora de cierre de check-in:', checkInCloseDate.toLocaleString());
        
        // Obtener fecha y hora actuales
        const now = new Date();
        
        // Calcular diferencia de tiempo para STD
        const diffToSTD = departureDate - now;
        const diffToClose = checkInCloseDate - now;
        
        // Calcular horas y minutos restantes para STD
        const stdMinutesRemaining = Math.floor(diffToSTD / (1000 * 60));
        const stdHoursRemaining = Math.floor(stdMinutesRemaining / 60);
        const stdRemainingMinutes = stdMinutesRemaining % 60;
        
        // Calcular horas y minutos restantes para cierre de check-in
        const closeMinutesRemaining = Math.floor(diffToClose / (1000 * 60));
        const closeHoursRemaining = Math.floor(closeMinutesRemaining / 60);
        const closeRemainingMinutes = closeMinutesRemaining % 60;
        
        // Determinar estado para hora de salida
        let stdStatusClass = 'text-green-300';
        if (stdMinutesRemaining < 30) {
          stdStatusClass = 'text-red-400 font-bold';
        } else if (stdMinutesRemaining < 60) {
          stdStatusClass = 'text-yellow-300';
        }
        
        // Determinar estado para cierre de check-in
        let closeStatusClass = 'text-green-300';
        if (closeMinutesRemaining < 15) {
          closeStatusClass = 'text-red-400 font-bold';
        } else if (closeMinutesRemaining < 30) {
          closeStatusClass = 'text-yellow-300';
        }
        
        setTimeRemaining({
          std: {
            expired: diffToSTD < 0,
            hours: stdHoursRemaining,
            minutes: stdRemainingMinutes,
            text: diffToSTD < 0 ? 'Salida pasada' : `${stdHoursRemaining}h ${stdRemainingMinutes}m`,
            statusClass: diffToSTD < 0 ? 'text-red-500' : stdStatusClass
          },
          checkInClose: {
            expired: diffToClose < 0,
            hours: closeHoursRemaining,
            minutes: closeRemainingMinutes,
            text: diffToClose < 0 ? 'Check-in cerrado' : `${closeHoursRemaining}h ${closeRemainingMinutes}m`,
            statusClass: diffToClose < 0 ? 'text-red-500' : closeStatusClass
          }
        });
      } catch (error) {
        console.error('Error calculando tiempo restante:', error);
        setTimeRemaining(null);
      }
    };
    
    // Actualizar inmediatamente
    updateTimeRemaining();
    
    // Configurar intervalo para actualizar cada minuto
    const interval = setInterval(updateTimeRemaining, 60000);
    
    // Limpiar intervalo cuando cambie el componente o el vuelo
    return () => clearInterval(interval);
  } else {
    setTimeRemaining(null);
  }
}, [activeFlightId, flightDetails]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Verificar si la ruta actual está activa
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Parsear la fecha correctamente
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateString;
    }
  };

  // Lista de enlaces de navegación
  const navLinks = [
    {
      to: '/',
      text: 'Vuelos',
      icon: <FaPlane />,
      access: true // Todos pueden ver vuelos
    },
    {
      to: '/checkin',
      text: 'Check-in',
      icon: <FaRegCheckCircle />,
      disabled: !activeFlightId,
      access: true // Todos pueden hacer check-in
    },
    {
      to: '/summary',
      text: 'Resumen',
      icon: <FaChartBar />,
      disabled: !activeFlightId,
      access: canAccessSection('summary') // Solo admin y supervisor
    },
    {
      to: '/operations',
      text: 'Operaciones',
      icon: <FaTools />,
      disabled: !activeFlightId,
      access: canAccessSection('operations') // Admin, supervisor, checkin
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transform fixed inset-y-0 left-0 z-30 w-64 bg-midnight text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 md:flex-shrink-0 pt-16 md:pt-0`}
        >
          <div className="h-full overflow-y-auto">
            {/* Información del vuelo activo */}
            {activeFlightId && (
              <div className="bg-noche px-4 py-3">
                <div className="text-xs font-semibold text-blue-300">Vuelo Activo</div>
                <div className="font-bold text-lg">{flightDetails.flightNumber}</div>
                <div className="text-sm">
                  {flightDetails.origin} → {flightDetails.destination}
                </div>
                
                {/* Detalles de fecha y hora */}
                <div className="mt-2">
                  <div className="text-xs text-blue-300">
                    {formatDate(flightDetails.date)}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm">
                      STD: {flightDetails.std || '--:--'}
                    </div>
                    
                    {/* Tiempo restante */}
                    {timeRemaining && (
                      <div className="mt-2 text-xs space-y-1">
                        {/* Tiempo para cierre de check-in */}
                        {timeRemaining.checkInClose && (
                          <div className={`flex items-center justify-between ${timeRemaining.checkInClose.statusClass}`}>
                            <span className='mr-1'>Cierre CHK:</span>
                            <span className="flex items-center">
                              <FaClock className="mr-1" size={10} />
                              {timeRemaining.checkInClose.text}
                            </span>
                          </div>
                        )}
                        
                        {/* Tiempo para salida */}
                        {timeRemaining.std && (
                          <div className={`flex items-center justify-between ${timeRemaining.std.statusClass}`}>
                            <span>Departure:</span>
                            <span className="flex items-center">
                              <FaPlane className="mr-1" size={10} />
                              {timeRemaining.std.text}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enlaces de navegación */}
            <nav className="p-4">
              <ul className="space-y-2">
                {navLinks.map(
                  (link) =>
                    link.access && (
                      <li key={link.to}>
                        <Link
                          to={link.disabled ? '#' : link.to}
                          className={`flex items-center p-2 rounded-md ${
                            isActive(link.to)
                              ? 'bg-sand text-white'
                              : 'text-white hover:bg-dia hover:text-noche'
                          } ${link.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={(e) => {
                            if (link.disabled) {
                              e.preventDefault();
                              if (!activeFlightId) {
                                alert('Por favor seleccione un vuelo primero');
                              }
                            }
                          }}
                        >
                          <span className="text-xl mr-3">{link.icon}</span>
                          <span className="font-medium">{link.text}</span>
                        </Link>
                      </li>
                    )
                )}

                {/* Enlace a configuración (solo para admin y supervisor) */}
                {canAccessSection('config') && (
                  <li>
                    <Link
                      to="/config"
                      className={`flex items-center p-2 rounded-md ${
                        location.pathname.startsWith('/config')
                          ? 'bg-sand text-white'
                          : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      <span className="text-xl mr-3">
                        <FaCog />
                      </span>
                      <span className="font-medium">Configuración</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
