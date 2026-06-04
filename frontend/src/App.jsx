import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./animations.css";

/* ─── Providers y guards — se cargan siempre (no son rutas) ─── */
import { AuthProvider }                        from "./admin/modules/auth/pages/hook/Useauth.jsx";
import { AuthProvider as MultiTenantAuthProvider } from "./multi-tenant/context/AuthContext.jsx";
import { StoreProvider }                       from "./multi-tenant/pages/StoreContext.jsx";
import { ProtectedRoute }                      from "./admin/modules/auth/pages/hook/ProtectedRoute.jsx";
import { TokenGuard }                          from "./admin/modules/auth/pages/hook/TokenGuard.jsx";
import ProtectedStep                           from "./multi-tenant/components/ProtectStep.jsx";
import SubscriptionGuard                       from "./admin/modules/auth/pages/hook/SubscriptionGuard.jsx";

/* ─── Páginas — lazy (se cargan solo cuando la ruta es visitada) ─── */

// Suscripciones
const SubscriptionPlansPage = lazy(() => import("./admin/modules/administration/pages/Subscription/SubscriptionPlansPage.jsx"));
const SubscriptionSuccess   = lazy(() => import("./admin/modules/administration/pages/Subscription/SubscriptionSuccess.jsx"));
const SubscriptionFailure   = lazy(() => import("./admin/modules/administration/pages/Subscription/SubscriptionFailure.jsx"));
const SubscriptionPending   = lazy(() => import("./admin/modules/administration/pages/Subscription/SubscriptionPending.jsx"));

// Administración
const AdminLayout      = lazy(() => import("./admin/modules/administration/components/AdminLayout/AdminLayout.jsx"));
const Dashboard        = lazy(() => import("./admin/modules/administration/dashboard/Dashboard.jsx"));
const UploadProduct    = lazy(() => import("./admin/modules/administration/pages/UploadProduct/UploadProduct.jsx"));
const EditProduct      = lazy(() => import("./admin/modules/administration/pages/EditProduct/EditProduct.jsx"));
const InventaryStock   = lazy(() => import("./admin/modules/administration/pages/Inventary/InventaryStock.jsx"));
const Report           = lazy(() => import("./admin/modules/administration/pages/Report/Report.jsx"));
const IAAdmin          = lazy(() => import("./admin/modules/administration/pages/IAAdmin/AIAdmin.jsx"));
const OrdersManagement = lazy(() => import("./admin/modules/administration/pages/OrdersManagement/OrdersManagement.jsx"));
const ShockAlerts      = lazy(() => import("./admin/modules/administration/pages/StockAlerts/StockAlert.jsx"));

// Auth
const Login            = lazy(() => import("./admin/modules/auth/pages/Login/Login.jsx"));
const ForgotPassword   = lazy(() => import("./admin/modules/auth/pages/ForgotPassword/ForgotPassword.jsx"));
const NewPassword      = lazy(() => import("./admin/modules/auth/pages/NewPassword.jsx"));
const VerificationPage = lazy(() => import("./admin/modules/auth/pages/VerificationPage.jsx"));
const VerifyCode       = lazy(() => import("./admin/modules/auth/pages/VerifyCode/VerifyCode.jsx"));

// Cliente
const VexioLanding  = lazy(() => import("./client/modules/landingPage/pages/VexioLanding/VexioLanding.jsx"));
const HelpCenter    = lazy(() => import("./client/modules/help/pages/HelpCenter/HelpCenter.jsx"));
const SessionClosed = lazy(() => import("./client/modules/MainPage/pages/SessionClosed.jsx"));
const MarketPage    = lazy(() => import("./client/modules/MarketPage/Pages/MarketPage/MarketPage.jsx"));
const AccountPage   = lazy(() => import("./client/modules/account/pages/AccountPage/AccountPage.jsx"));

// Multi-tenant
const StoreProductsAdmin = lazy(() => import("./multi-tenant/pages/StoreProductsAdmin/StoreProductsAdmin.jsx"));
const StoreResult        = lazy(() => import("./multi-tenant/pages/StoreResult.jsx"));
const CreateStore        = lazy(() => import("./multi-tenant/pages/CreateStore.jsx"));
const StepBasicPage      = lazy(() => import("./multi-tenant/pages/StepBasicPage.jsx"));
const StepLegalPage      = lazy(() => import("./multi-tenant/pages/StepLegalPage.jsx"));
const StepPaymentPage    = lazy(() => import("./multi-tenant/pages/StepPaymentPage.jsx"));
const SelectPlan         = lazy(() => import("./multi-tenant/pages/SelectPlan.jsx"));
const LayoutSelect       = lazy(() => import("./multi-tenant/components/SelectLayout/LayoutSelect.jsx"));
const CustomizationPanel = lazy(() => import("./multi-tenant/components/CustomizationPanel.jsx"));
const ComponentCustomizer= lazy(() => import("./multi-tenant/components/ComponentCustomizer.jsx"));
const WidgetsCustomizer  = lazy(() => import("./multi-tenant/components/WidgetsCustomizer.jsx"));
const OrdersDashboard    = lazy(() => import("./multi-tenant/components/OrdersDashboard.jsx"));
const MyStore            = lazy(() => import("./multi-tenant/pages/MyStore.jsx"));
const StorePage          = lazy(() => import("./multi-tenant/pages/StorePage.jsx"));

function PageLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0c0e14" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #1e2230", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MultiTenantAuthProvider>
        <StoreProvider>
          <TokenGuard />
          <div className="main-container">
            <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes key="main-content">

                {/* ─── Públicas cliente ─── */}
                <Route path="/"        element={<VexioLanding />} />
                <Route path="/landing" element={<VexioLanding />} />
                <Route path="/market"  element={<MarketPage />} />

                {/* ─── Account ─── */}
                <Route path="/cuenta/*" element={<AccountPage />} />

                {/* ─── Auth ─── */}
                <Route path="/login"          element={<div className="ayuda"><Login mode="login" /></div>} />
                <Route path="/login/register" element={<div className="ayuda"><Login mode="register" /></div>} />
                <Route path="/recuperar-contraseña" element={<ForgotPassword />} />
                <Route path="/verificar-codigo"     element={<VerifyCode />} />
                <Route path="/nueva-contraseña"     element={<NewPassword />} />
                <Route path="/verificacion-pagina"  element={<VerificationPage />} />

                {/* ─── Ayuda ─── */}
                <Route path="/ayuda"        element={<div className="ayuda"><HelpCenter /></div>} />
                <Route path="/pedidos"      element={<div className="ayuda"><HelpCenter /></div>} />
                <Route path="/pagos"        element={<div className="ayuda"><HelpCenter /></div>} />
                <Route path="/devoluciones" element={<div className="ayuda"><HelpCenter /></div>} />
                <Route path="/seguridad"    element={<div className="ayuda"><HelpCenter /></div>} />

                {/* ─── Misc ─── */}
                <Route path="/session-cerrada" element={<SessionClosed />} />

                {/* ─── Multi-tenant ─── */}
                <Route path="/plan"                 element={<SelectPlan showComponents={true} />} />
                <Route path="/crear-tienda/basico"  element={<StepBasicPage />} />
                <Route path="/crear-tienda/legal"   element={<StepLegalPage />} />
                <Route path="/crear-tienda/pagos"   element={<StepPaymentPage />} />
                <Route path="/layout"    element={<ProtectedStep requiredStep={3}><LayoutSelect /></ProtectedStep>} />
                <Route path="/customer"  element={<ProtectedStep requiredStep={4}><CustomizationPanel /></ProtectedStep>} />
                <Route path="/component" element={<ProtectedStep requiredStep={5}><ComponentCustomizer /></ProtectedStep>} />
                <Route path="/widgets"   element={<ProtectedStep requiredStep={6}><WidgetsCustomizer /></ProtectedStep>} />
                <Route path="/crear-tienda" element={<ProtectedStep requiredStep={7}><CreateStore /></ProtectedStep>} />
                <Route path="/resultado"    element={<ProtectedStep requiredStep={8}><StoreResult /></ProtectedStep>} />
                  <Route path="/tiendas"    element={<MyStore />} />

                {/* ─── Rutas protegidas ─── */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/inventario" element={<Navigate to="/tiendas" replace />} />
                  <Route path="/ordenes"    element={<OrdersDashboard />} />
                  <Route path="/mi-tienda/productos" element={<StoreProductsAdmin />} />
                </Route>

                {/* ─── Tienda publica ─── */}
                <Route path="/tienda/:slug" element={<StorePage />} />

                {/* ─── Suscripciones ─── */}
                <Route path="/planes" element={<SubscriptionPlansPage />} />
                <Route path="/dashboard/subscription/success" element={<SubscriptionSuccess />} />
                <Route path="/dashboard/subscription/failure" element={<SubscriptionFailure />} />
                <Route path="/dashboard/subscription/pending" element={<SubscriptionPending />} />

                {/* ─── Admin (scope por tienda) — protegido por suscripción ─── */}
                <Route element={<SubscriptionGuard />}>
                <Route path="/admin/:storeSlug" element={<AdminLayout />}>
                  <Route index                      element={<Navigate to="dashboard" replace />} />
                  <Route path="IA"                  element={<IAAdmin />} />
                  <Route path="dashboard"           element={<Dashboard />} />
                  <Route path="subir-producto"      element={<UploadProduct />} />
                  <Route path="editar-producto/:id" element={<EditProduct />} />
                  <Route path="inventario"          element={<InventaryStock />} />
                  <Route path="usuarios"            element={<Dashboard />} />
                  <Route path="report"              element={<Report />} />
                  <Route path="pedidos"             element={<OrdersManagement />} />
                  <Route path="alertas"             element={<ShockAlerts />} />
                </Route>
                </Route>

                {/* ─── Fallback ─── */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </AnimatePresence>
            </Suspense>
          </div>
        </StoreProvider>
      </MultiTenantAuthProvider>
    </AuthProvider>
  );
}

export default App;
