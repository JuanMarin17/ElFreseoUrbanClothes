import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import "./animations.css";

// --- IMPORTS DE ADMINISTRACIÓN ---
import AdminLayout from "./admin/modules/administration/components/AdminLayout/AdminLayout.jsx";
import Dashboard from "./admin/modules/administration/dashboard/Dashboard.jsx";
import UploadProduct from "./admin/modules/administration/pages/UploadProduct/UploadProduct.jsx";
import InventaryStock from "./admin/modules/administration/pages/Inventary/InventaryStock.jsx";

/* ─── Auth ─── */
import Login from './admin/modules/auth/pages/Login/Login.jsx';
import ForgotPassword from './admin/modules/auth/pages/ForgotPassword/ForgotPassword.jsx';
import NewPassword from './admin/modules/auth/pages/NewPassword.jsx';
import VerificationPage from './admin/modules/auth/pages/VerificationPage.jsx';
import VerifyCode from './admin/modules/auth/pages/VerifyCode/VerifyCode.jsx';

/* ─── Cliente ─── */
import VexioLanding from './client/modules/landingPage/pages/VexioLanding/VexioLanding.jsx';
import HelpCenter from './client/modules/help/pages/HelpCenter/HelpCenter.jsx';
import SessionClosed from './client/modules/MainPage/pages/SessionClosed.jsx';

/* ─── Vexio Market (Nueva Vista Principal) ─── */
import MarketPage from './client/modules/MarketPage/Pages/MarketPage/MarketPage.jsx';

/* ─── Account ─── */
import AccountPage from './client/modules/account/pages/AccountPage/AccountPage.jsx';

// // --- IMPORTS MULTI-TENANT ---
// import CreateStore from "../multi-tenant/pages/CreateStore.jsx";

// --- IMPORTAR LA PÁGINA DEL CARRITO ---
// import Cart from "./client/modules/landingPage/Cart/pages/Cart.jsx";
// --- MULTI-TENANT ---
import CreateStore from "./multi-tenant/pages/CreateStore.jsx";
import StepBasicPage from "./multi-tenant/pages/StepBasicPage.jsx";
import StepLegalPage from "./multi-tenant/pages/StepLegalPage.jsx";
import StepPaymentPage from "./multi-tenant/pages/StepPaymentPage.jsx";
import SelectPlan from "./multi-tenant/pages/SelectPlan.jsx";
import LayoutSelect from "./multi-tenant/components/SelectLayout/LayoutSelect.jsx";
import CustomizationPanel from "./multi-tenant/components/CustomizationPanel.jsx";
import ComponentCustomizer from "./multi-tenant/components/ComponentCustomizer.jsx";
import WidgetsCustomizer from "./multi-tenant/components/WidgetsCustomizer.jsx";
import InventaryDashboard from "./multi-tenant/components/InventaryDashboard.jsx";
import OrdersDashboard from "./multi-tenant/components/OrdersDashboard.jsx";
import MyStore from "./multi-tenant/pages/MyStore.jsx";

// ✅ NUEVO: guard de rutas
import ProtectedStep from "./multi-tenant/components/ProtectStep.jsx";
import { StoreProvider } from "./multi-tenant/pages/StoreContext.jsx";
import StoreResult from "./multi-tenant/pages/StoreResult.jsx";
import { AuthProvider } from "./admin/modules/auth/pages/hook/Useauth.jsx";
import { AuthProvider as MultiTenantAuthProvider } from "./multi-tenant/context/AuthContext.jsx";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  // useScrollAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <MultiTenantAuthProvider>
        <StoreProvider>
        <div className="main-container">
          <AnimatePresence mode="wait">
              <Routes key="main-content">
                {/* --- RUTAS PÚBLICAS CLIENTE --- */}
                <Route
                  path="/"
                  element={
                    <div className="ayuda">
                      <VexioLanding />
                    </div>
                  }
                />

                <Route path="/landing" element={<VexioLanding />} />
                {/* Ruta para visualizar el carrito de compras */}
                {/* <Route path="/cart" element={<Cart />} /> */}
                <Route path="/catalogo" element={<MarketPage />} />

                <Route path="/plan" element={<SelectPlan showComponents={true} />} />

                {/* Paso 2a – Información básica */}
                <Route
                  path="/crear-tienda/basico"
                  element={<StepBasicPage />}
                />

                {/* Paso 2b – Información legal */}
                <Route path="/crear-tienda/legal" element={<StepLegalPage />} />

                {/* Paso 2c – Pagos y envíos */}
                <Route
                  path="/crear-tienda/pagos"
                  element={<StepPaymentPage />}
                />

                {/* Paso 4 – Elegir layout */}
                <Route
                  path="/layout"
                  element={
                    <ProtectedStep requiredStep={3}>
                      <LayoutSelect />
                    </ProtectedStep>
                  }
                />

                {/* Paso 5 – Estilos / CustomizationPanel */}
                <Route
                  path="/customer"
                  element={
                    <ProtectedStep requiredStep={4}>
                      <CustomizationPanel />
                    </ProtectedStep>
                  }
                />

                {/* Paso 6 – Componentes */}
                <Route
                  path="/component"
                  element={
                    <ProtectedStep requiredStep={5}>
                      <ComponentCustomizer />
                    </ProtectedStep>
                  }
                />

                {/* Paso 7 – Widgets */}
                <Route
                  path="/widgets"
                  element={
                    <ProtectedStep requiredStep={6}>
                      <WidgetsCustomizer />
                    </ProtectedStep>
                  }
                />

                {/* Paso 8 – Términos y crear tienda */}
                <Route
                  path="/crear-tienda"
                  element={
                    <ProtectedStep requiredStep={7}>
                      <CreateStore />
                    </ProtectedStep>
                  }
                />

                {/* Resultado final */}
                <Route
                  path="/resultado"
                  element={
                    <ProtectedStep requiredStep={8}>
                      <StoreResult />
                    </ProtectedStep>
                  }
                />

                {/* Inventario y órdenes (fuera del flujo, sin protección) */}
                <Route path="/inventario" element={<InventaryDashboard />} />
                <Route path="/ordenes" element={<OrdersDashboard />} />
                <Route path="/tiendas" element={<MyStore />} />

                <Route
                  path="/ayuda"
                  element={
                    <div className="ayuda">
                      <HelpCenter />
                    </div>
                  }
                />
                {/* Rutas de ayuda adicionales mapeadas al HelpCenter */}
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
                <Route
                  path="nueva-contraseña"
                  element={<NewPassword />}
                ></Route>
                <Route
                  path="verificacion-pagina"
                  element={<VerificationPage />}
                ></Route>
                <Route path="session-cerrada" element={<SessionClosed />}>
                  np
                </Route>

                {/* --- RUTAS DE ADMINISTRACIÓN (LAYOUT ANIDADO) --- */}
                {/* Al entrar a /admin, se carga el Sidebar y el Header fijo */}
                {/* --- RUTAS DE ADMINISTRACIÓN (LAYOUT ANIDADO) --- */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="subir-producto" element={<UploadProduct />} />
                  <Route path="inventario" element={<InventaryStock />} />
                  <Route path="usuarios" element={<Dashboard />} />
                </Route>
                {/* Redirección para rutas no encontradas */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
          </AnimatePresence>
        </div>
      </StoreProvider>
      </MultiTenantAuthProvider>
    </AuthProvider>
  );
}

export default App;