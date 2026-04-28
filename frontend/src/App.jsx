import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import './animations.css'

// --- IMPORTS DE ADMINISTRACIÓN ---
import AdminLayout from './admin/modules/administration/components/AdminLayout/AdminLayout.jsx';
import Dashboard from './admin/modules/administration/dashboard/Dashboard.jsx';
import UploadProduct from "./admin/modules/administration/pages/UploadProduct/UploadProduct.jsx";
import EditProduct from "./admin/modules/administration/pages/EditProduct/EditProduct.jsx";
import Login from './admin/modules/auth/pages/Login/Login.jsx';

// --- IMPORTS DE CLIENTE ---
import LandingPage from './client/modules/landingPage/pages/LandingPage/LandingPage.jsx'
import LoadingScreen from './client/modules/landingPage/LoadingScreen/LoadingScreen.jsx';
import HelpCenter from './client/modules/help/pages/HelpCenter/HelpCenter.jsx';
import MainPage from './client/modules/MainPage/pages/MainPage/MainPage.jsx';
// eslint-disable-next-line no-unused-vars
import DetailsProduct from "./client/modules/MainPage/components/ProductDetail/ProductDetail.jsx";

// --- HOOKS Y PROVIDERS ---
import { useScrollAnimation } from './hooks/UsescrollAnimation.jsx';
import { AuthProvider } from './admin/modules/auth/pages/hook/Useauth.jsx';
import { ProtectedRoute } from './admin/modules/auth/pages/hook/ProtectedRoute.jsx'; // ← AÑADIDO

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useScrollAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <div className='main-container'>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingScreen key="loading" />
          ) : (
            <Routes key="main-content">
              {/* --- RUTAS PÚBLICAS CLIENTE --- */}
              <Route path="/" element={<div className='ayuda'><LandingPage /></div>} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/catalogo" element={<MainPage />} />
              <Route path="/login" element={<div className='ayuda'><Login /></div>} />
              <Route path="/ayuda" element={<div className='ayuda'><HelpCenter /></div>} />

              {/* Rutas de ayuda adicionales mapeadas al HelpCenter */}
              <Route path="/pedidos" element={<div className='ayuda'><HelpCenter /></div>} />
              <Route path="/pagos" element={<div className='ayuda'><HelpCenter /></div>} />
              <Route path="/devoluciones" element={<div className='ayuda'><HelpCenter /></div>} />
              <Route path="/seguridad" element={<div className='ayuda'><HelpCenter /></div>} />

              {/* --- RUTAS DE ADMINISTRACIÓN PROTEGIDAS --- */}
              {/* ProtectedRoute verifica sesión y role='admin'; si no, redirige a /login */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="subir-productos" element={<UploadProduct />} />
                  <Route path="editar-producto/:id" element={<EditProduct />} />
                  <Route path="usuarios" element={<Dashboard />} />
                </Route>
              </Route>

              {/* Redirección para rutas no encontradas */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </AnimatePresence>
      </div>
    </AuthProvider>
  )
}

export default App;