// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import Logo from '../common/Logo';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { currentUser, userRole, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Traducir el rol a un nombre más amigable
  const getRoleName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      case 'checkin':
        return 'Agente de Check-in';
      default:
        return 'Invitado';
    }
  };

  return (
    <nav className="bg-midnight text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-white md:hidden p-2 mr-3 sm:mr-4 hover:bg-gray-700 rounded-md"
            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <FaBars />
          </button>
          
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-xl font-bold hover:text-sand transition-colors"
            >
              <Logo/>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Botón de configuración (solo para admin/supervisor) */}
          {(userRole === 'admin' || userRole === 'supervisor') && (
            <Link
              to="/config"
              className={`p-2 rounded-md mr-2 ${
                location.pathname.startsWith('/config') 
                  ? 'bg-sand text-white' 
                  : 'hover:bg-gray-700'
              }`}
              title="Configuración"
            >
              <FaCog />
            </Link>
          )}
          
          {/* Menú de usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-2 hover:bg-gray-700 rounded-md"
            >
              <div className="w-8 h-8 bg-sand rounded-full flex items-center justify-center text-midnight">
                <FaUser />
              </div>
              <span className="ml-2 hidden sm:inline-block">{currentUser?.email?.split('@')[0]}</span>
              <div className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-700 hidden sm:block">
                {getRoleName(userRole)}
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                <div className="px-4 py-2">
                  <div className="font-semibold text-gray-800">{currentUser?.email}</div>
                  <div className="text-sm text-gray-500">{getRoleName(userRole)}</div>
                </div>
                <div className="border-t border-gray-200"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FaSignOutAlt className="mr-2" /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;