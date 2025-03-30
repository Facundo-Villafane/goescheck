// src/components/pre-flight/Sidebar.jsx
import React, { useState } from 'react';
import { 
  FaPlane, FaPrint, FaUserCog, FaCog,
  FaChevronLeft, FaChevronRight, FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-midnight text-white transition-all duration-300 ease-in-out flex flex-col`}>
      {/* Cabecera del sidebar */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && <h2 className="text-xl font-bold">SETTINGS</h2>}
        <button 
          className="p-1 rounded-full hover:bg-gray-700"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      
      {/* Opciones del menú */}
      <div className="flex-1 py-4">
        <nav>
          <ul className="space-y-2">
            <SidebarItem
              icon={<FaPlane />}
              text="Vuelos"
              active={activeSection === 'flights'}
              collapsed={collapsed}
              onClick={() => setActiveSection('flights')}
            />
            <SidebarItem
              icon={<FaPrint />}
              text="Impresoras"
              active={activeSection === 'printers'}
              collapsed={collapsed}
              onClick={() => setActiveSection('printers')}
            />
            
            {/* Solo mostrar gestión de usuarios a administradores */}
            {userRole === 'admin' && (
              <SidebarItem
                icon={<FaUserCog />}
                text="Usuarios"
                active={activeSection === 'users'}
                collapsed={collapsed}
                onClick={() => setActiveSection('users')}
              />
            )}
          </ul>
        </nav>
      </div>
      
      
    </div>
  );
};

const SidebarItem = ({ icon, text, active, collapsed, onClick }) => {
  return (
    <li>
      <button
        className={`flex items-center w-full p-3 ${
          active ? 'bg-sand' : 'hover:bg-gray-800'
        } transition-colors duration-200 ${collapsed ? 'justify-center' : ''} rounded`}
        onClick={onClick}
      >
        <span className="text-lg">{icon}</span>
        {!collapsed && <span className="ml-3">{text}</span>}
      </button>
    </li>
  );
};

export default Sidebar;