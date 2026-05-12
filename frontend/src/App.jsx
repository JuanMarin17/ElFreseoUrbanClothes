import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './animations.css';

/* ─── Admin ─── */
import AdminLayout   from './admin/modules/administration/components/AdminLayout/AdminLayout.jsx';
import Dashboard     from './admin/modules/administration/dashboard/Dashboard.jsx';
import Filter        from './admin/modules/administration/dashboard/Filter.jsx';
import UploadProduct from './admin/modules/administration/pages/UploadProduct/UploadProduct.jsx';
import EditProduct   from './admin/modules/administration/pages/EditProduct/EditProduct.jsx';

/* ─── Auth ─── */
import Login            from './admin/modules/auth/pages/Login/Login.jsx';
import NewPassword      from './admin/modules/auth/pages/NewPassword.jsx';
import VerificationPage from './admin/modules/auth/pages/VerificationPage.jsx';

/* ─── Cliente ─── */
import LandingPage   from './client/modules/landingPage/pages/LandingPage/LandingPage.jsx';
import LoadingScreen from './client/modules/landingPage/LoadingScreen/LoadingScreen.jsx';
import Cart          from './client/modules/landingPage/Cart/pages/Cart.jsx';
import MainPage      from './client/modules/MainPage/pages/MainPage/MainPage.jsx';
import HelpCenter    from './client/modules/help/pages/HelpCenter/HelpCenter.jsx';
import SessionClosed from './client/modules/MainPage/pages/SessionClosed.jsx';

/* ─── Account ─── */
import AccountPage from './client/modules/account/pages/AccountPage/AccountPage.jsx';

/* ─── Hooks y Providers ─── */
import { useScrollAnimation } from './hooks/UsescrollAnimation.jsx';
import { AuthProvider }       from './admin/modules/auth/pages/hook/Useauth.jsx';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useScrollAnimation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <div className="main-container">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingScreen key="loading" />
          ) : (
            <Routes key="main-content">

              {/* ─── Públicas cliente ─── */}
              <Route path="/"         element={<div className="ayuda"><LandingPage /></div>} />
              <Route path="/landing"  element={<LandingPage />} />
              <Route path="/cart"     element={<Cart />} />
              <Route path="/catalogo" element={<MainPage />} />

              {/* ─── Account ─── */}
              <Route path="/cuenta/*" element={<AccountPage />} />

              {/* ─── Login ─── */}
              <Route path="/login"          element={<div className="ayuda"><Login mode="login" /></div>} />
              <Route path="/login/register" element={<div className="ayuda"><Login mode="register" /></div>} />

              {/* ─── Ayuda ─── */}
              <Route path="/ayuda"          element={<div className="ayuda"><HelpCenter /></div>} />
              <Route path="/pedidos-ayuda"  element={<div className="ayuda"><HelpCenter /></div>} />
              <Route path="/pagos"          element={<div className="ayuda"><HelpCenter /></div>} />
              <Route path="/devoluciones"   element={<div className="ayuda"><HelpCenter /></div>} />
              <Route path="/seguridad-ayuda" element={<div className="ayuda"><HelpCenter /></div>} />

              {/* ─── Misc ─── */}
              <Route path="/nueva-contraseña"    element={<NewPassword />} />
              <Route path="/verificacion-pagina" element={<VerificationPage />} />
              <Route path="/session-cerrada"     element={<SessionClosed />} />

              {/* ─── Admin ─── */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index                      element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"           element={<Dashboard />} />
                <Route path="filter"              element={<Filter />} />
                <Route path="subir-productos"     element={<UploadProduct />} />
                <Route path="editar-producto/:id" element={<EditProduct />} />
                <Route path="usuarios"            element={<Dashboard />} />
              </Route>

              {/* ─── Fallback ─── */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          )}
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
}

export default App;