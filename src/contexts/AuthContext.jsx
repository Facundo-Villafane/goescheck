// src/contexts/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Iniciar sesión con correo y contraseña
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  // Registrar un nuevo usuario (solo admin puede usar esto)
  const register = async (email, password, name, role) => {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });
      
      return user;
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
    }
  };

  // Enviar correo para restablecer contraseña
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error al enviar correo de restablecimiento:", error);
      throw error;
    }
  };

  // Obtener todos los usuarios (solo para admin)
  const getAllUsers = async () => {
    try {
      // Verificar si el usuario actual es admin
      if (userRole !== 'admin') {
        throw new Error('No tienes permisos para acceder a esta información');
      }
      
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const users = [];
      usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  };

  // Actualizar datos de un usuario
  const updateUser = async (userId, userData) => {
    try {
      // Verificar permisos (solo admin o el propio usuario)
      if (userRole !== 'admin' && currentUser.uid !== userId) {
        throw new Error('No tienes permisos para realizar esta acción');
      }
      
      await setDoc(doc(db, 'users', userId), userData, { merge: true });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  };

  // Obtener información del rol de usuario desde Firestore
  // Añade esto al método fetchUserRole en AuthContext.jsx
const fetchUserRole = async (userId) => {
    try {
      console.log('fetchUserRole - Buscando rol para userId:', userId);
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      console.log('fetchUserRole - ¿Documento existe?:', userDoc.exists());
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('fetchUserRole - Datos obtenidos:', userData);
        console.log('fetchUserRole - Rol encontrado:', userData.role);
        return userData.role;
      }
      
      console.log('fetchUserRole - No se encontró documento, retornando null');
      return null;
    } catch (error) {
      console.error("Error al obtener rol de usuario:", error);
      console.log('fetchUserRole - Error detallado:', JSON.stringify(error));
      return null;
    }
  };
  
  // También podemos añadir depuración a onAuthStateChanged
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged - Usuario actual:', user ? user.uid : 'No hay usuario');
      
      setCurrentUser(user);
      
      if (user) {
        // Obtener rol de usuario desde Firestore
        console.log('onAuthStateChanged - Obteniendo rol para:', user.uid);
        const role = await fetchUserRole(user.uid);
        console.log('onAuthStateChanged - Rol obtenido:', role);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);

  // Verificar si un usuario puede acceder a una sección específica
  const canAccessSection = (section) => {
    if (!userRole) return false;
    
    switch (section) {
      case 'flights':
        // Todos los roles pueden acceder a vuelos
        return true;
      case 'checkin':
        // Solo admin, supervisor y agente de check-in pueden acceder
        return ['admin', 'supervisor', 'checkin'].includes(userRole);
      case 'operations':
        // Solo admin, supervisor y agente de check-in pueden acceder
        return ['admin', 'supervisor', 'checkin'].includes(userRole);
      case 'config':
        // Solo admin y supervisor pueden acceder a configuración
        return ['admin', 'supervisor'].includes(userRole);
      case 'users':
        // Solo admin puede gestionar usuarios
        return userRole === 'admin';
      default:
        return false;
    }
  };

  // Monitorear cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Obtener rol de usuario desde Firestore
        const role = await fetchUserRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);

  // Valores y funciones que expondrá el contexto
  const value = {
    currentUser,
    userRole,
    login,
    logout,
    register,
    resetPassword,
    getAllUsers,
    updateUser,
    canAccessSection,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;