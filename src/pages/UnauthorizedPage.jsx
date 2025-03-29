// src/pages/UnauthorizedPage.jsx
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { FaExclamationTriangle, FaHome, FaSignOutAlt } from 'react-icons/fa';

const UnauthorizedPage = () => {
  const { logout, userRole } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
        
        <p className="text-lg text-gray-600 mb-6">
          No tienes permisos para acceder a esta sección.
          {userRole && (
            <>
              <br />
              <span className="font-medium">
                Tu rol actual: {' '}
                <span className="font-semibold">
                  {userRole === 'admin' 
                    ? 'Administrador' 
                    : userRole === 'supervisor'
                    ? 'Supervisor'
                    : 'Agente de Check-in'}
                </span>
              </span>
            </>
          )}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center"
          >
            <FaHome className="mr-2" /> Ir al Inicio
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center"
          >
            <FaSignOutAlt className="mr-2" /> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;