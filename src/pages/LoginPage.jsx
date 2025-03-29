// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import Logo from '../components/common/Logo';
import Waves from '../components/common/Waves';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener a dónde redirigir después del login
  const from = location.state?.from?.pathname || '/';
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde o restablece tu contraseña');
      } else {
        setError('Error al iniciar sesión: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      console.error('Error al enviar correo de restablecimiento:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico');
      } else {
        setError('Error al enviar correo de restablecimiento: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-dia px-4">
        <Waves
        lineColor="#897E69"
        backgroundColor="rgba(255, 255, 255, 0.2)"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={20}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />
      <div className="z-10 max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
      
        <div className="bg-midnight py-6 px-6 flex">
            <Logo className="mr-4"/>
          <h2 className="text-xl font-bold text-white flex items-center text-center">
            Sistema de Check-in
          </h2>
        </div>
        
        <div className="py-8 px-6">
          {forgotPassword ? (
            <>
              {resetSent ? (
                <div className="text-center mb-6">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <p>Se ha enviado un correo con instrucciones para restablecer tu contraseña.</p>
                  </div>
                  <button
                    className="mt-4 text-sand hover:text-midnight"
                    onClick={() => {
                      setForgotPassword(false);
                      setResetSent(false);
                    }}
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Restablecer contraseña</h3>
                  <p className="text-gray-600 mb-6">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                  
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sand focus:border-sand"
                          placeholder="correo@ejemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <button
                        type="button"
                        className="text-sand hover:text-midnight"
                        onClick={() => setForgotPassword(false)}
                      >
                        Volver al inicio de sesión
                      </button>
                      
                      <button
                        type="submit"
                        className="bg-sand hover:bg-midnight text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                        disabled={loading}
                      >
                        {loading ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-gray-900 mb-6">Iniciar sesión</h3>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sand focus:border-sand"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sand focus:border-sand"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <button
                    type="button"
                    className="text-sand hover:text-midnight"
                    onClick={() => setForgotPassword(true)}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-sand hover:bg-midnight text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition duration-150 ease-in-out"
                    disabled={loading}
                  >
                    {loading ? (
                      'Iniciando sesión...'
                    ) : (
                      <>
                        <FaSignInAlt className="mr-2" /> Iniciar sesión
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;