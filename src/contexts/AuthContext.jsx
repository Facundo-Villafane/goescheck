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
      console.log("Iniciando sesión con:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sesión iniciada correctamente");
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
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  // Registrar un nuevo usuario (solo admin puede usar esto)
  const register = async (email, password, name, role) => {
    console.log("Iniciando registro de usuario:", email, role);
    
    try {
      // Verificar si el usuario actual es admin
      if (userRole !== 'admin') {
        console.error("Error: solo los administradores pueden registrar usuarios");
        throw new Error('Solo los administradores pueden registrar usuarios');
      }
      
      console.log("Creando usuario en Firebase Auth...");
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Usuario creado en Firebase Auth:", user.uid);
      
      // Crear documento de usuario en Firestore
      console.log("Creando documento de usuario en Firestore...");
      const userData = {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      };
      
      console.log("Datos a guardar:", userData);
      
      try {
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log("Documento de usuario creado en Firestore");
      } catch (firestoreError) {
        console.error("Error al crear documento en Firestore:", firestoreError);
        console.error("Código:", firestoreError.code);
        console.error("Mensaje:", firestoreError.message);
        
        // Intentar eliminar el usuario de Auth ya que no pudimos crear su documento
        try {
          await user.delete();
          console.log("Usuario eliminado de Auth debido a error en Firestore");
        } catch (deleteError) {
          console.error("Error al eliminar usuario de Auth:", deleteError);
        }
        
        throw firestoreError;
      }
      
      return user;
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      console.error("Código:", error.code);
      console.error("Mensaje:", error.message);
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
      console.log("getAllUsers - Verificando permisos, rol actual:", userRole);
      
      // Verificar si el usuario actual es admin
      if (userRole !== 'admin') {
        console.error("Error: No tienes permisos para acceder a esta información");
        throw new Error('No tienes permisos para acceder a esta información');
      }
      
      console.log("getAllUsers - Consultando colección de usuarios");
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      const users = [];
      usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`getAllUsers - Se encontraron ${users.length} usuarios`);
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
      case 'summary':
        // Solo admin y supervisor pueden ver resúmenes
        return ['admin', 'supervisor', 'checkin'].includes(userRole);
      default:
        return false;
    }
  };

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