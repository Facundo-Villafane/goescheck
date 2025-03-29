// src/components/layout/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  // Verificar permisos
  if (userRole !== 'admin' && userRole !== 'supervisor') {
    navigate('/unauthorized');
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Contenido principal (sin sidebar para el layout de admin) */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;