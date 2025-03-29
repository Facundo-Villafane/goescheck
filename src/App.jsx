// src/App.jsx
import { useEffect } from 'react';
import { createHashRouter, RouterProvider } from 'react-router';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import PreFlightPage from './pages/PreFlightPage';
import FlightsPage from './pages/FlightsPage';
import CheckInPage from './pages/CheckInPage';
import SummaryPage from './pages/SummaryPage';
import OperationsPage from './pages/OperationsPage';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { FlightProvider } from './contexts/FlightContext';
import { PassengersProvider, usePassengersContext } from './contexts/PassengersContext';
import { AuthProvider } from './contexts/AuthContext';

const AppContent = () => {
  const { loadFromLocalStorage } = usePassengersContext();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const router = createHashRouter([
    // Rutas públicas
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/unauthorized',
      element: <UnauthorizedPage />
    },
    // Rutas protegidas para todos los usuarios autenticados
    {
      element: <ProtectedRoute />, // Protección básica - requiere autenticación
      children: [
        {
          path: '/',
          element: <Layout />,
          children: [
            {
              index: true,
              element: <FlightsPage />,
            },
            {
              path: 'checkin',
              element: <CheckInPage />,
            },
            {
              // Resumen solo para admin y supervisor
              path: 'summary',
              element: <ProtectedRoute requiredRoles={['admin', 'supervisor']} />,
              children: [
                {
                  index: true,
                  element: <SummaryPage />,
                }
              ]
            },
            {
              // Operaciones para todos excepto pasajeros
              path: 'operations',
              element: <ProtectedRoute requiredRoles={['admin', 'supervisor', 'checkin']} />,
              children: [
                {
                  index: true,
                  element: <OperationsPage />,
                }
              ]
            },
          ],
        },
        // Ruta separada para las páginas administrativas con su propio layout
        {
          path: '/config',
          element: <ProtectedRoute requiredRoles={['admin', 'supervisor']} />,
          children: [
            {
              path: '',
              element: <AdminLayout />,
              children: [
                {
                  index: true,
                  element: <PreFlightPage />,
                },
              ],
            }
          ]
        },
      ]
    }
  ]);

  return <RouterProvider router={router} />;
};

function App() {
  return (
    <AuthProvider>
      <FlightProvider>
        <PassengersProvider>
          <AppContent />
        </PassengersProvider>
      </FlightProvider>
    </AuthProvider>
  );
}

export default App;