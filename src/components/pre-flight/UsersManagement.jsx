// src/components/pre-flight/UsersManagement.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserPlus, FaEdit, FaSave, FaTimes, FaTrash } from 'react-icons/fa';

const UsersManagement = () => {
  const { userRole, getAllUsers, register, updateUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Estado para el formulario de creación/edición
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
  // Estado para los campos del formulario
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('checkin');
  
  // Cargar usuarios al montar el componente
  useEffect(() => {
    // No hacer nada mientras authLoading sea true
    if (authLoading) {
      return;
    }
    
    const fetchUsers = async () => {
      // Verificar permisos explícitamente
      if (userRole !== 'admin') {
        console.log('No tienes permisos de administrador para ver usuarios');
        navigate('/unauthorized');
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        console.log('Intentando obtener usuarios con rol:', userRole);
        const usersList = await getAllUsers();
        setUsers(usersList);
        console.log('Usuarios cargados correctamente:', usersList.length);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar usuarios: ' + error.message);
        
        // Error específico para permisos
        if (error.message && error.message.includes('Missing or insufficient permissions')) {
          setError('Error de permisos: No tienes autorización para ver esta información. Por favor, contacta al administrador del sistema.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Solo ejecutar si el rol está definido
    if (userRole) {
      fetchUsers();
    }
  }, [userRole, getAllUsers, navigate, authLoading]);
  
  // Manejar la creación de un nuevo usuario
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!formName || !formEmail || !formPassword || !formRole) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await register(formEmail, formPassword, formName, formRole);
      
      // Recargar lista de usuarios
      const usersList = await getAllUsers();
      setUsers(usersList);
      
      // Limpiar formulario y cerrar
      resetForm();
      setIsCreating(false);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('Ya existe una cuenta con este correo electrónico');
      } else if (error.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres');
      } else {
        setError('Error al crear usuario: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar la actualización de un usuario
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!formName || !formEmail || !formRole) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await updateUser(editingUserId, {
        name: formName,
        email: formEmail,
        role: formRole,
        updatedAt: new Date().toISOString()
      });
      
      // Recargar lista de usuarios
      const usersList = await getAllUsers();
      setUsers(usersList);
      
      // Limpiar formulario y cerrar
      resetForm();
      setIsEditing(false);
      setEditingUserId(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setError('Error al actualizar usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Preparar formulario para edición
  const handleEditClick = (user) => {
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword(''); // No mostrar la contraseña en edición
    setEditingUserId(user.id);
    setIsEditing(true);
  };
  
  // Resetear formulario
  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('checkin');
    setError('');
  };
  
  // Si está cargando autenticación, mostrar indicador
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-midnight"></div>
      </div>
    );
  }
  
  // Si el usuario no es admin, mostrar mensaje de error y redirigir
  if (userRole !== 'admin') {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
        <p className="font-bold">Acceso denegado</p>
        <p>No tienes permisos para gestionar usuarios.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
        {!isCreating && !isEditing && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-sand hover:bg-midnight text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaUserPlus className="mr-2" /> Nuevo Usuario
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Formulario de creación/edición */}
      {(isCreating || isEditing) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            {isCreating ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
          </h3>
          
          <form onSubmit={isCreating ? handleCreateUser : handleUpdateUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nombre y apellido"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="correo@ejemplo.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  disabled={isEditing} // No permitir cambiar el email en edición
                />
              </div>
              
              {isCreating && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Contraseña segura"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    required={isCreating}
                    minLength={6}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Rol
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  required
                >
                  <option value="admin">Administrador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="checkin">Agente de Check-in</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsCreating(false);
                  setIsEditing(false);
                  setEditingUserId(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md flex items-center"
              >
                <FaTimes className="mr-2" /> Cancelar
              </button>
              
              <button
                type="submit"
                className="bg-sand hover:bg-midnight text-white px-4 py-2 rounded-md flex items-center"
                disabled={loading}
              >
                <FaSave className="mr-2" /> {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Lista de usuarios */}
      {loading && !isCreating && !isEditing ? (
        <div className="text-center py-4">Cargando usuarios...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'supervisor'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'admin' 
                        ? 'Administrador' 
                        : user.role === 'supervisor'
                        ? 'Supervisor'
                        : 'Agente Check-in'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="text-sand hover:text-midnight mr-3"
                      title="Editar usuario"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;