// src/components/layout/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useFlightContext } from '../../contexts/FlightContext';
import Navbar from './Navbar';
import { FaPlane, FaRegCheckCircle, FaChartBar, FaTools, FaCog } from 'react-icons/fa';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { activeFlightId, flightDetails } = useFlightContext();
  const { userRole, canAccessSection } = useAuth();
  const navigate = useNavigate();

  // Cerrar el sidebar cuando cambia la ruta
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Verificar si la ruta actual está activa
  const isActive = (path) => {
    return location.pathname === path;
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
                <div className="text-xs text-blue-300 mt-1">
                  {flightDetails.date && new Date(flightDetails.date).toLocaleDateString()}
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
