import { useEffect } from 'react';
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
import ForgotPassword   from './admin/modules/auth/pages/ForgotPassword/ForgotPassword.jsx';
import NewPassword      from './admin/modules/auth/pages/NewPassword.jsx';
import VerificationPage from './admin/modules/auth/pages/VerificationPage.jsx';
import VerifyCode       from './admin/modules/auth/pages/VerifyCode/VerifyCode.jsx';

/* ─── Cliente ─── */
import VexioLanding  from './client/modules/landingPage/pages/VexioLanding/VexioLanding.jsx';
import HelpCenter    from './client/modules/help/pages/HelpCenter/HelpCenter.jsx';
import SessionClosed from './client/modules/MainPage/pages/SessionClosed.jsx';

/* ─── Vexio Market (Nueva Vista Principal) ─── */
import MarketPage    from './client/modules/MarketPage/Pages/MarketPage/MarketPage.jsx';

/* ─── Account ─── */
import AccountPage from './client/modules/account/pages/AccountPage/AccountPage.jsx';

/* ─── Hooks y Providers ─── */
import { useScrollAnimation } from './hooks/UsescrollAnimation.jsx';
import { AuthProvider }       from './admin/modules/auth/pages/hook/Useauth.jsx';

function App() {
  useScrollAnimation();

  return (
    <AuthProvider>
      <div className="main-container">
        <Routes>

          {/* ─── Públicas cliente ─── */}
          <Route path="/"         element={<div className="ayuda"><VexioLanding /></div>} />
          <Route path="/landing"  element={<VexioLanding />} />
          
          {/* Redireccionamos el antiguo catálogo al nuevo Market global */}
          <Route path="/catalogo" element={<MarketPage />} />
          <Route path="/market"   element={<MarketPage />} />

          {/* ─── Account ─── */}
          <Route path="/cuenta/*" element={<AccountPage />} />

          {/* ─── Login ─── */}
          <Route path="/login"          element={<div className="ayuda"><Login mode="login" /></div>} />
          <Route path="/login/register" element={<div className="ayuda"><Login mode="register" /></div>} />

          {/* ─── Recuperar contraseña ─── */}
          <Route path="/recuperar-contraseña" element={<ForgotPassword />} />
          <Route path="/verificar-codigo"     element={<VerifyCode />} />
          <Route path="/nueva-contraseña"      element={<NewPassword />} />

          {/* ─── Ayuda ─── */}
          <Route path="/ayuda"           element={<div className="ayuda"><HelpCenter /></div>} />
          <Route path="/pedidos-ayuda"   element={<div className="ayuda"><HelpCenter /></div>} />
          <Route path="/pagos"           element={<div className="ayuda"><HelpCenter /></div>} />
          <Route path="/devoluciones"    element={<div className="ayuda"><HelpCenter /></div>} />
          <Route path="/seguridad-ayuda" element={<div className="ayuda"><HelpCenter /></div>} />

          {/* ─── Misc ─── */}
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
      </div>
    </AuthProvider>
  );
}

export default App;