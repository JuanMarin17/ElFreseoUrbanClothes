import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./animations.css";
import { AuthProvider, useAuth } from "./admin/modules/auth/pages/hook/Useauth.jsx";
import UserNotifToast from "./client/components/UserNotifToast/UserNotifToast.jsx";

import ProductPage from "./client/modules/ProductPage/ProductPage.jsx";

import ProtectedStep from "./multi-tenant/components/ProtectStep.jsx";
import { ProtectedRoute } from "./admin/modules/auth/pages/hook/ProtectedRoute.jsx";
import { TokenGuard } from "./admin/modules/auth/pages/hook/TokenGuard.jsx";

import { AuthProvider as MultiTenantAuthProvider } from "./multi-tenant/context/AuthContext.jsx";
import { StoreProvider } from "./multi-tenant/pages/StoreContext.jsx";
import MyStoreLayout from "./multi-tenant/pages/MyStoreLayout.jsx";
import StoreBuilderChat from "./multi-tenant/components/StoreBuilderChat/StoreBuilderChat.jsx";

import ErrorBoundary from "./components/ErrorPages/ErrorBoundary.jsx";
import NotFound404 from "./components/ErrorPages/NotFound404.jsx";
import Forbidden403 from "./components/ErrorPages/Forbidden403.jsx";

// ── Suscripciones ─────────────────────────────────────────────────────────────
const SubscriptionPlansPage = lazy(
  () => import("./admin/modules/administration/pages/Subscription/SubscriptionPlansPage.jsx"),
);
const SubscriptionSuccess = lazy(
  () => import("./admin/modules/administration/pages/Subscription/SubscriptionSuccess.jsx"),
);
const SubscriptionFailure = lazy(
  () => import("./admin/modules/administration/pages/Subscription/SubscriptionFailure.jsx"),
);
const SubscriptionPending = lazy(
  () => import("./admin/modules/administration/pages/Subscription/SubscriptionPending.jsx"),
);
const SubscriptionGuard = lazy(
  () => import("./admin/modules/auth/pages/hook/SubscriptionGuard.jsx"),
);

// ── Admin ─────────────────────────────────────────────────────────────────────
const AdminLayout = lazy(
  () => import("./admin/modules/administration/components/AdminLayout/AdminLayout.jsx"),
);
const Dashboard = lazy(
  () => import("./admin/modules/administration/dashboard/Dashboard.jsx"),
);
const UploadProduct = lazy(
  () => import("./admin/modules/administration/pages/UploadProduct/UploadProduct.jsx"),
);
const EditProduct = lazy(
  () => import("./admin/modules/administration/pages/EditProduct/EditProduct.jsx"),
);
const InventaryStock = lazy(
  () => import("./admin/modules/administration/pages/Inventary/InventaryStock.jsx"),
);
const Report = lazy(
  () => import("./admin/modules/administration/pages/Report/Report.jsx"),
);
const IAAdmin = lazy(
  () => import("./admin/modules/administration/pages/IAAdmin/AIAdmin.jsx"),
);
const OrdersManagement = lazy(
  () => import("./admin/modules/administration/pages/OrdersManagement/OrdersManagement.jsx"),
);
const ShockAlerts = lazy(
  () => import("./admin/modules/administration/pages/StockAlerts/StockAlert.jsx"),
);
const SuppliersPage = lazy(
  () => import("./admin/modules/administration/pages/Suppliers/SuppliersPage.jsx"),
);
const PromotionsDashboard = lazy(
  () => import("./admin/modules/administration/promotions/PromotionsDashboards.jsx"),
);
const AdminProductsPage = lazy(
  () => import("./admin/modules/administration/pages/AdminProducts/AdminProductsPage.jsx"),
);
const CustomersPage = lazy(
  () => import("./admin/modules/administration/pages/CustomersPage/CustomersPage.jsx"),
);
const AdminReturnsPage = lazy(
  () => import("./admin/modules/administration/pages/AdminReturns/AdminReturnsPage.jsx"),
);
const POSPage = lazy(
  () => import("./admin/modules/administration/pages/POS/POSPage.jsx"),
);
const LocationsPage = lazy(
  () => import("./admin/modules/administration/pages/Locations/LocationsPage.jsx"),
);
const SubscriptionManagement = lazy(
  () => import("./admin/modules/administration/pages/Subscription/SubscriptionManagement.jsx"),
);
const StoreSettings = lazy(
  () => import("./admin/modules/administration/pages/StoreSettings/StoreSettings.jsx"),
);

// ── Auth ──────────────────────────────────────────────────────────────────────
const Login = lazy(() => import("./admin/modules/auth/pages/Login/login.jsx"));
const ForgotPassword = lazy(
  () => import("./admin/modules/auth/pages/ForgotPassword/ForgotPassword.jsx"),
);
const NewPassword = lazy(
  () => import("./admin/modules/auth/pages/NewPassword.jsx"),
);
const VerificationPage = lazy(
  () => import("./admin/modules/auth/pages/VerificationPage.jsx"),
);
const VerifyCode = lazy(
  () => import("./admin/modules/auth/pages/VerifyCode/VerifyCode.jsx"),
);

// ── Cliente ───────────────────────────────────────────────────────────────────
const CatalogoPage = lazy(
  () => import("./client/modules/Catalogo/CatalogoPage.jsx"),
);
const VexioLanding = lazy(
  () => import("./client/modules/LandingPage/pages/VexioLanding/VexioLanding.jsx"),
);
const HelpCenter = lazy(
  () => import("./client/modules/help/pages/HelpCenter/HelpCenter.jsx"),
);
const SessionClosed = lazy(
  () => import("./client/modules/MainPage/pages/SessionClosed.jsx"),
);
const MarketPage = lazy(
  () => import("./client/modules/MarketPage/Pages/MarketPage/MarketPage.jsx"),
);
const AccountPage = lazy(
  () => import("./client/modules/account/pages/AccountPage/AccountPage.jsx"),
);

// ── Multi-tenant ──────────────────────────────────────────────────────────────
const StoreProductsAdmin = lazy(
  () => import("./multi-tenant/pages/StoreProductsAdmin/StoreProductsAdmin.jsx"),
);
const StoreResult = lazy(() => import("./multi-tenant/pages/StoreResult.jsx"));
const CreateStore = lazy(() => import("./multi-tenant/pages/CreateStore.jsx"));
const StepBasicPage = lazy(
  () => import("./multi-tenant/pages/StepBasicPage.jsx"),
);
const StepLegalPage = lazy(
  () => import("./multi-tenant/pages/StepLegalPage.jsx"),
);
const StepPaymentPage = lazy(
  () => import("./multi-tenant/pages/StepPaymentPage.jsx"),
);
const SelectPlan = lazy(() => import("./multi-tenant/pages/SelectPlan.jsx"));
const LayoutSelect = lazy(
  () => import("./multi-tenant/components/SelectLayout/LayoutSelect.jsx"),
);
const CustomizationPanel = lazy(
  () => import("./multi-tenant/components/CustomizationPanel.jsx"),
);
const ComponentCustomizer = lazy(
  () => import("./multi-tenant/components/ComponentCustomizer.jsx"),
);
const WidgetsCustomizer = lazy(
  () => import("./multi-tenant/components/WidgetsCustomizer.jsx"),
);
const OrdersDashboard = lazy(
  () => import("./multi-tenant/components/OrdersDashboard.jsx"),
);
const MyStore = lazy(() => import("./multi-tenant/pages/MyStore.jsx"));
const StorePage = lazy(() => import("./multi-tenant/pages/StorePage.jsx"));
const CheckoutPage = lazy(() => import("./multi-tenant/pages/Checkout/CheckoutPage.jsx"));
const StoreMyOrders = lazy(() => import("./multi-tenant/pages/MyOrders/MyOrders.jsx"));
const StoreOrderDetail = lazy(() => import("./multi-tenant/pages/OrderDetail/OrderDetail.jsx"));
const Transaction = lazy(
  () => import("./multi-tenant/pages/Transaction/Transaction.jsx"),
);
const PlatformUsersPanel = lazy(
  () => import("./multi-tenant/pages/PlatformUsers/PlatformUsersPanel.jsx"),
);

// ── CMS ───────────────────────────────────────────────────────────────────────
const CMSEditor = lazy(() => import("./multi-tenant/cms/CMSeditor.jsx"));
const CMSAbout = lazy(() => import("./multi-tenant/cms/CMSabout.jsx"));
const CMSContact = lazy(() => import("./multi-tenant/cms/CMSconctact.jsx"));
const CMSLocations = lazy(() => import("./multi-tenant/cms/CMSlocations.jsx"));
const CMSReturns = lazy(() => import("./multi-tenant/cms/CMSreturns.jsx"));
const CMSFAQ = lazy(() => import("./multi-tenant/cms/CMSfaq.jsx"));

// ── Loader ────────────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 12,
        background: "#0c0e14",
        fontFamily: "Inter, sans-serif",
        color: "#475569",
        fontSize: 13,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          border: "3px solid #1e2230",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Cargando...
    </div>
  );
}

// Muestra toasts SSE del usuario solo cuando está autenticado
function UserNotifToastWrapper() {
  const { isAuthenticated } = useAuth();
  return <UserNotifToast enabled={isAuthenticated} />;
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <MultiTenantAuthProvider>
        <StoreProvider>
          <TokenGuard />
          <UserNotifToastWrapper />
          <StoreBuilderChat />
          <div className="main-container">
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                <ErrorBoundary>
                <Routes key="main-content">
                  {/* ── Públicas cliente ─────────────────────────────────── */}
                  <Route path="/" element={<VexioLanding />} />
                  <Route path="/landing" element={<VexioLanding />} />
                  <Route path="/market" element={<MarketPage />} />
                  <Route path="/catalogo" element={<CatalogoPage />} />
                  <Route path="/products/:productId" element={<ProductPage />} />
                  <Route path="/cuenta/*" element={<AccountPage />} />

                  {/* ── Auth ─────────────────────────────────────────────── */}
                  <Route
                    path="/login"
                    element={<div className="ayuda"><Login mode="login" /></div>}
                  />
                  <Route
                    path="/login/register"
                    element={<div className="ayuda"><Login mode="register" /></div>}
                  />
                  <Route path="/recuperar-contraseña" element={<ForgotPassword />} />
                  <Route path="/verificar-codigo" element={<VerifyCode />} />
                  <Route path="/nueva-contraseña" element={<NewPassword />} />
                  <Route path="/verificacion-pagina" element={<VerificationPage />} />

                  {/* ── Ayuda ────────────────────────────────────────────── */}
                  <Route path="/ayuda"        element={<div className="ayuda"><HelpCenter /></div>} />
                  <Route path="/pedidos"      element={<div className="ayuda"><HelpCenter /></div>} />
                  <Route path="/pagos"        element={<div className="ayuda"><HelpCenter /></div>} />
                  <Route path="/devoluciones" element={<div className="ayuda"><HelpCenter /></div>} />
                  <Route path="/seguridad"    element={<div className="ayuda"><HelpCenter /></div>} />
                  <Route path="/session-cerrada" element={<SessionClosed />} />

                  {/* ── Wizard creación de tienda ─────────────────────────── */}
                  <Route path="/plan" element={<SelectPlan showComponents={true} />} />
                  <Route path="/crear-tienda/basico" element={<StepBasicPage />} />
                  <Route path="/crear-tienda/legal"  element={<StepLegalPage />} />
                  <Route path="/crear-tienda/pagos"  element={<StepPaymentPage />} />
                  <Route path="/layout"    element={<ProtectedStep requiredStep={3}><LayoutSelect /></ProtectedStep>} />
                  <Route path="/customer"  element={<ProtectedStep requiredStep={4}><CustomizationPanel /></ProtectedStep>} />
                  <Route path="/component" element={<ProtectedStep requiredStep={5}><ComponentCustomizer /></ProtectedStep>} />
                  <Route path="/widgets"   element={<ProtectedStep requiredStep={6}><WidgetsCustomizer /></ProtectedStep>} />
                  <Route path="/cms"           element={<ProtectedStep requiredStep={7}><CMSEditor /></ProtectedStep>} />
                  <Route path="/cms/about"     element={<ProtectedStep requiredStep={7}><CMSAbout /></ProtectedStep>} />
                  <Route path="/cms/contact"   element={<ProtectedStep requiredStep={7}><CMSContact /></ProtectedStep>} />
                  <Route path="/cms/locations" element={<ProtectedStep requiredStep={7}><CMSLocations /></ProtectedStep>} />
                  <Route path="/cms/returns"   element={<ProtectedStep requiredStep={7}><CMSReturns /></ProtectedStep>} />
                  <Route path="/cms/faq"       element={<ProtectedStep requiredStep={7}><CMSFAQ /></ProtectedStep>} />
                  <Route path="/crear-tienda" element={<ProtectedStep requiredStep={8}><CreateStore /></ProtectedStep>} />
                  <Route path="/resultado"    element={<ProtectedStep requiredStep={9}><StoreResult /></ProtectedStep>} />

                  {/* ── Suscripciones ────────────────────────────────────── */}
                  <Route path="/planes" element={<SubscriptionPlansPage />} />
                  <Route path="/dashboard/subscription/success" element={<SubscriptionSuccess />} />
                  <Route path="/dashboard/subscription/failure" element={<SubscriptionFailure />} />
                  <Route path="/dashboard/subscription/pending" element={<SubscriptionPending />} />

                  {/* ── Tienda pública ───────────────────────────────────── */}
                  <Route path="/tienda/:slug" element={<StorePage />} />
                  <Route path="/tienda/:slug/checkout" element={<CheckoutPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/tienda/:slug/orders" element={<StoreMyOrders />} />
                  <Route path="/tienda/:slug/orders/:orderId" element={<StoreOrderDetail />} />

                  {/* ── Rutas protegidas ─────────────────────────────────── */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MyStoreLayout />}>
                      <Route path="/mis-tiendas"    element={<MyStore />} />
                      <Route path="/tiendas"        element={<MyStore />} />
                      <Route path="/informe-ventas" element={<MyStore />} />
                    </Route>
                    <Route path="/ordenes" element={<OrdersDashboard />} />
                    <Route path="/mi-tienda/productos" element={<StoreProductsAdmin />} />
                    <Route path="/inventario" element={<Navigate to="/tiendas" replace />} />
                  </Route>

                  {/* ── SUPERADMIN: panel de usuarios y transacciones de toda la plataforma ── */}
                  <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
                    <Route element={<MyStoreLayout />}>
                      <Route path="/usuarios"      element={<PlatformUsersPanel />} />
                      <Route path="/transacciones" element={<Transaction />} />
                    </Route>
                  </Route>

                  {/* ── Admin plano (ruta legacy /admin) ─────────────────── */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="IA"                    element={<IAAdmin />} />
                      <Route path="dashboard"             element={<Dashboard />} />
                      <Route path="subir-producto"        element={<UploadProduct />} />
                      <Route path="editar-producto/:id"   element={<EditProduct />} />
                      <Route path="inventario"            element={<InventaryStock />} />
                      <Route path="usuarios"              element={<Dashboard />} />
                      <Route path="promociones"           element={<PromotionsDashboard />} />
                      <Route path="report"                element={<Report />} />
                      <Route path="pedidos"               element={<OrdersManagement />} />
                      <Route path="alertas"               element={<ShockAlerts />} />
                      <Route path="configuracion"         element={<StoreSettings />} />
                    </Route>
                  </Route>

                  {/* ── Admin por tienda /tienda/:slug/admin ─────────────── */}
                  <Route element={<SubscriptionGuard />}>
                    <Route path="/tienda/:slug/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="proveedores"           element={<SuppliersPage />} />
                      <Route path="IA"                    element={<IAAdmin />} />
                      <Route path="dashboard"             element={<Dashboard />} />
                      <Route path="productos"             element={<AdminProductsPage />} />
                      <Route path="subir-producto"        element={<UploadProduct />} />
                      <Route path="editar-producto/:id"   element={<EditProduct />} />
                      <Route path="inventario"            element={<InventaryStock />} />
                      <Route path="usuarios"              element={<Dashboard />} />
                      <Route path="clientes"              element={<CustomersPage />} />
                      <Route path="devoluciones"          element={<AdminReturnsPage />} />
                      <Route path="pos"                   element={<POSPage />} />
                      <Route path="ubicaciones"           element={<LocationsPage />} />
                      <Route path="promociones"           element={<PromotionsDashboard />} />
                      <Route path="report"                element={<Report />} />
                      <Route path="pedidos"               element={<OrdersManagement />} />
                      <Route path="alertas"               element={<ShockAlerts />} />
                      <Route path="suscripcion"           element={<SubscriptionManagement />} />
                      <Route path="configuracion"         element={<StoreSettings />} />
                      <Route path="cms"           element={<CMSEditor />} />
                      <Route path="cms/about"     element={<CMSAbout />} />
                      <Route path="cms/contact"   element={<CMSContact />} />
                      <Route path="cms/locations" element={<CMSLocations />} />
                      <Route path="cms/returns"   element={<CMSReturns />} />
                      <Route path="cms/faq"       element={<CMSFAQ />} />
                    </Route>
                  </Route>

                  {/* ── Errores ──────────────────────────────────────────── */}
                  <Route path="/403" element={<Forbidden403 />} />

                  {/* ── Fallback ─────────────────────────────────────────── */}
                  <Route path="*" element={<NotFound404 />} />
                </Routes>
                </ErrorBoundary>
              </AnimatePresence>
            </Suspense>
          </div>
        </StoreProvider>
      </MultiTenantAuthProvider>
    </AuthProvider>
  );
}

export default App;
