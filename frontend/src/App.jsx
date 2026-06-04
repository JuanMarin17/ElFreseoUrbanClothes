import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./animations.css";

// --- IMPORTS DE ADMINISTRACIÓN ---
import AdminLayout from "./admin/modules/administration/components/AdminLayout/AdminLayout.jsx";
import Dashboard from "./admin/modules/administration/dashboard/Dashboard.jsx";
import UploadProduct from "./admin/modules/administration/pages/UploadProduct/UploadProduct.jsx";
import EditProduct from "./admin/modules/administration/pages/EditProduct/EditProduct.jsx";
import InventaryStock from "./admin/modules/administration/pages/Inventary/InventaryStock.jsx";
import StoreProductsAdmin from "./multi-tenant/pages/StoreProductsAdmin/StoreProductsAdmin.jsx";
import Report from "./admin/modules/administration/pages/Report/Report.jsx";
import IAAdmin from "./admin/modules/administration/pages/IAAdmin/AIAdmin.jsx";
import OrdersManagement from "./admin/modules/administration/pages/OrdersManagement/OrdersManagement.jsx";
import ShockAlerts from "./admin/modules/administration/pages/StockAlerts/StockAlert.jsx";

/* ─── Auth ─── */
import Login from "./admin/modules/auth/pages/Login/Login.jsx";
import ForgotPassword from "./admin/modules/auth/pages/ForgotPassword/ForgotPassword.jsx";
import NewPassword from "./admin/modules/auth/pages/NewPassword.jsx";
import VerificationPage from "./admin/modules/auth/pages/VerificationPage.jsx";
import VerifyCode from "./admin/modules/auth/pages/VerifyCode/VerifyCode.jsx";

/* ─── Cliente ─── */
import VexioLanding from "./client/modules/landingPage/pages/VexioLanding/VexioLanding.jsx";
import HelpCenter from "./client/modules/help/pages/HelpCenter/HelpCenter.jsx";
import SessionClosed from "./client/modules/MainPage/pages/SessionClosed.jsx";

/* ─── Market ─── */
import MarketPage from "./client/modules/MarketPage/Pages/MarketPage/MarketPage.jsx";

/* ─── Account ─── */
import AccountPage from "./client/modules/account/pages/AccountPage/AccountPage.jsx";

// // --- IMPORTS MULTI-TENANT ---
// import CreateStore from "../multi-tenant/pages/CreateStore.jsx";

// --- IMPORTAR LA PÁGINA DEL CARRITO ---
// import Cart from "./client/modules/landingPage/Cart/pages/Cart.jsx";

// ✅ NUEVO: guard de rutas
import ProtectedStep from "./multi-tenant/components/ProtectStep.jsx";
import { ProtectedRoute } from "./admin/modules/auth/pages/hook/ProtectedRoute.jsx";
import { TokenGuard } from "./admin/modules/auth/pages/hook/TokenGuard.jsx";
import { StoreProvider } from "./multi-tenant/pages/StoreContext.jsx";
import StoreResult from "./multi-tenant/pages/StoreResult.jsx";
import { AuthProvider } from "./admin/modules/auth/pages/hook/Useauth.jsx";
import { AuthProvider as MultiTenantAuthProvider } from "./multi-tenant/context/AuthContext.jsx";

/* ─── Multi-tenant ─── */
import CreateStore          from "./multi-tenant/pages/CreateStore.jsx";
import StepBasicPage        from "./multi-tenant/pages/StepBasicPage.jsx";
import StepLegalPage        from "./multi-tenant/pages/StepLegalPage.jsx";
import StepPaymentPage      from "./multi-tenant/pages/StepPaymentPage.jsx";
import SelectPlan           from "./multi-tenant/pages/SelectPlan.jsx";
import LayoutSelect         from "./multi-tenant/components/SelectLayout/LayoutSelect.jsx";
import CustomizationPanel   from "./multi-tenant/components/CustomizationPanel.jsx";
import ComponentCustomizer  from "./multi-tenant/components/ComponentCustomizer.jsx";
import WidgetsCustomizer    from "./multi-tenant/components/WidgetsCustomizer.jsx";
import InventaryDashboard   from "./multi-tenant/components/InventaryDashboard.jsx";
import OrdersDashboard      from "./multi-tenant/components/OrdersDashboard.jsx";
import MyStore              from "./multi-tenant/pages/MyStore.jsx";
import StorePage            from "./multi-tenant/pages/StorePage.jsx";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <MultiTenantAuthProvider>
        <StoreProvider>
        <div className="main-container">
          <AnimatePresence mode="wait">
            <Routes key="main-content">

              {/* ─── Públicas cliente ─── */}
              <Route path="/"       element={<div className="ayuda"><VexioLanding /></div>} />
              <Route path="/landing" element={<VexioLanding />} />
              <Route path="/market" element={<MarketPage />} />

                {/* ─── Account ─── */}
                <Route path="/cuenta/*" element={<AccountPage />} />

                {/* ─── Auth ─── */}
                <Route
                  path="/login"
                  element={
                    <div className="ayuda">
                      <Login mode="login" />
                    </div>
                  }
                />
                <Route
                  path="/login/register"
                  element={
                    <div className="ayuda">
                      <Login mode="register" />
                    </div>
                  }
                />
                <Route
                  path="/recuperar-contraseña"
                  element={<ForgotPassword />}
                />
                <Route path="/verificar-codigo" element={<VerifyCode />} />
                <Route path="/nueva-contraseña" element={<NewPassword />} />
                <Route
                  path="/verificacion-pagina"
                  element={<VerificationPage />}
                />

                {/* ─── Ayuda ─── */}
                <Route
                  path="/ayuda"
                  element={
                    <div className="ayuda">
                      <HelpCenter />
                    </div>
                  }
                />
                <Route
                  path="/pedidos"
                  element={
                    <div className="ayuda">
                      <HelpCenter />
                    </div>
                  }
                />
                <Route
                  path="/pagos"
                  element={
                    <div className="ayuda">
                      <HelpCenter />
                    </div>
                  }
                />
                <Route
                  path="/devoluciones"
                  element={
                    <div className="ayuda">
                      <HelpCenter />
                    </div>
                  }
                />
                <Route
                  path="/seguridad"
                  element={
                    <div className="ayuda">
                      <HelpCenter />
                    </div>
                  }
                />

                {/* ─── Misc ─── */}
                <Route path="/session-cerrada" element={<SessionClosed />} />

              {/* ─── Multi-tenant ─── */}
              <Route path="/plan"              element={<SelectPlan showComponents={true} />} />
              <Route path="/crear-tienda/basico"  element={<StepBasicPage />} />
              <Route path="/crear-tienda/legal"   element={<StepLegalPage />} />
              <Route path="/crear-tienda/pagos"   element={<StepPaymentPage />} />
              <Route path="/layout"   element={<ProtectedStep requiredStep={3}><LayoutSelect /></ProtectedStep>} />
              <Route path="/customer" element={<ProtectedStep requiredStep={4}><CustomizationPanel /></ProtectedStep>} />
              <Route path="/component" element={<ProtectedStep requiredStep={5}><ComponentCustomizer /></ProtectedStep>} />
              <Route path="/widgets"  element={<ProtectedStep requiredStep={6}><WidgetsCustomizer /></ProtectedStep>} />
              <Route path="/crear-tienda" element={<ProtectedStep requiredStep={7}><CreateStore /></ProtectedStep>} />
              <Route path="/resultado"    element={<ProtectedStep requiredStep={8}><StoreResult /></ProtectedStep>} />
              <Route path="/inventario"   element={<InventaryDashboard />} />
              <Route path="/ordenes"      element={<OrdersDashboard />} />
              <Route path="/tiendas"      element={<MyStore />} />
              <Route path="/tienda/:slug" element={<StorePage />} />

              {/* ─── Admin ─── */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index               element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"    element={<Dashboard />} />
                <Route path="subir-producto" element={<UploadProduct />} />
                <Route path="inventario"   element={<InventaryStock />} />
                <Route path="usuarios"     element={<Dashboard />} />
              </Route>

                {/* ─── Fallback ─── */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </StoreProvider>
      </MultiTenantAuthProvider>
    </AuthProvider>
  );
}

export default App;
