import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import {
  getStoreBySlug,
  getStoresByUser,
  getStoreSettingsByHeader,
  saveStoreSettings,
} from "../../../../../multi-tenant/pages/services/storeService";
import IAAdmin from "../../pages/IAAdmin/AIAdmin";
import AdminHeader from "../AdminHeader/AdminHeader";
import AdminNotifToast from "../AdminNotifToast/AdminNotifToast";
import Sidebar from "../Sidebar/Sidebar";
import StockAlertToast from "../StockAlertToast/StockAlertToast";
import { useAdminNotifications } from "../../../../../hooks/useAdminNotifications";

import "./AdminLayout.css";

const ROUTE_TITLES = {
  dashboard:         "Dashboard",
  "subir-producto":  "Subir Producto",
  "editar-producto": "Editar Producto",
  inventario:        "Inventario",
  usuarios:          "Gestionar Usuarios",
  report:            "Informes",
  pedidos:           "Ver Pedidos",
  alertas:           "Alertas de Stock",
  proveedores:       "Proveedores",
  promociones:       "Promociones",
  productos:         "Productos",
  cms:               "Contenido CMS",
  IA:                "Asistente IA",
};

function parseUserFromJwt() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return null;
    const decoded = JSON.parse(atob(jwt.split(".")[1]));
    return {
      userName: decoded.sub ?? null,
      userRole: localStorage.getItem("userRole") ?? decoded.role ?? "OWNER",
    };
  } catch {
    return null;
  }
}

function getUserIdFromJwt() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return null;
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.user_id ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

const isValid = (v) => !!v && v !== "null" && v !== "undefined";

const AdminLayout = () => {
  const { slug } = useParams();
  const location = useLocation();

  const [isAiOpen,      setIsAiOpen]      = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storeReady,    setStoreReady]    = useState(!slug);
  const [sseStoreId,    setSseStoreId]    = useState(
    () => {
      const id = localStorage.getItem("storeId");
      return id && id !== "null" && id !== "undefined" ? id : null;
    },
  );

  // ── Brand: logo + nombre real de la tienda ──────────────────────────────
  const [storeInfo, setStoreInfo] = useState({ name: null, logo: null });

  // ── Tema oscuro / claro ──────────────────────────────────────────────────
  const [theme, setTheme] = useState(
    () => localStorage.getItem("adminTheme") ?? "dark",
  );

  const toggleTheme = () => {
    const wrapper = document.querySelector(".admin-terminal-wrapper");
    wrapper?.setAttribute("data-theme-switching", "");
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("adminTheme", next);
      return next;
    });
    setTimeout(() => wrapper?.removeAttribute("data-theme-switching"), 50);
  };

  // ── Color personalizado del sidebar (por tienda) ─────────────────────────
  const [sidebarColor, setSidebarColor] = useState(null);

  const handleSidebarColorChange = async (color) => {
    setSidebarColor(color);
    const storeId = localStorage.getItem("storeId");
    if (!storeId || storeId === "null") return;
    localStorage.setItem(`sidebarColor_${storeId}`, color);
    try {
      await saveStoreSettings(storeId, {
        completedStep: 9,
        styles: { sidebarColor: color },
      });
    } catch { /* silent — color ya está en localStorage */ }
  };

  const userInfo = useMemo(() => parseUserFromJwt(), []);

  // ── SSE: notificaciones en tiempo real (órdenes, tickets, reseñas) ────────
  const { notifications, unread, markAllRead } = useAdminNotifications(sseStoreId);

  const pageTitle = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    return ROUTE_TITLES[last] ?? null;
  }, [location.pathname]);

  // Cerrar sidebar al navegar (móvil)
  useEffect(() => {
    const run = async () => setIsSidebarOpen(false);
    run();
  }, [location.pathname]);

  // ── Resolver storeId y cargar branding ──────────────────────────────────
  useEffect(() => {
    if (!slug) return;

    getStoreBySlug(slug)
      .then(async (store) => {
        const storeId = store?.storeId ?? store?.id ?? store?.store_id ?? null;
        if (storeId) {
          localStorage.setItem("storeId", storeId);
          setSseStoreId(storeId);

          // Nombre real de la tienda desde el objeto store
          const name = store.name ?? store.storeName ?? null;
          if (name) localStorage.setItem("storeName", name);
          setStoreInfo({ name, logo: null });

          // Intentar cargar logo y color de sidebar desde settings
          try {
            const settings = await getStoreSettingsByHeader(storeId);
            if (settings) {
              setStoreInfo({
                name,
                logo: settings.basic?.logoPreview ?? settings.logoUrl ?? null,
              });
              const savedColor = settings.styles?.sidebarColor
                ?? localStorage.getItem(`sidebarColor_${storeId}`);
              if (savedColor) {
                setSidebarColor(savedColor);
                localStorage.setItem(`sidebarColor_${storeId}`, savedColor);
              }
            }
          } catch { /* silent */ }
        }

        const currentRole = localStorage.getItem("userRole");
        if (!currentRole || currentRole === "null" || currentRole === "USER") {
          localStorage.setItem("userRole", "OWNER");
        }
      })
      .catch(() => {
        const currentRole = localStorage.getItem("userRole");
        if (!currentRole || currentRole === "null" || currentRole === "USER") {
          localStorage.setItem("userRole", "OWNER");
        }
      })
      .finally(() => setStoreReady(true));
  }, [slug]);

  // ── Para admin sin slug: cargar la primera tienda del usuario ───────────
  useEffect(() => {
    const run = async () => {
      if (isValid(localStorage.getItem("storeId"))) {
        const storeId = localStorage.getItem("storeId");
        const localColor = localStorage.getItem(`sidebarColor_${storeId}`);
        if (localColor) setSidebarColor(localColor);

        if (!storeInfo.name && !storeInfo.logo) {
          try {
            const settings = await getStoreSettingsByHeader(storeId);
            if (settings) {
              setStoreInfo((prev) => ({
                name: prev.name,
                logo: settings.basic?.logoPreview ?? settings.logoUrl ?? null,
              }));
              const savedColor = settings.styles?.sidebarColor ?? localColor;
              if (savedColor) {
                setSidebarColor(savedColor);
                localStorage.setItem(`sidebarColor_${storeId}`, savedColor);
              }
            }
          } catch { /* silent */ }
        }
        return;
      }

      if (slug) {
        try {
          const store = await getStoreBySlug(slug);
          const id = store?.storeId ?? store?.id ?? null;
          if (id) {
            localStorage.setItem("storeId", id);
            if (store?.role) localStorage.setItem("userRole", store.role);
            const name = store.name ?? null;
            if (name) localStorage.setItem("storeName", name);
            setStoreInfo({ name, logo: null });
            try {
              const settings = await getStoreSettingsByHeader(id);
              if (settings) {
                setStoreInfo({
                  name,
                  logo: settings.basic?.logoPreview ?? settings.logoUrl ?? null,
                });
              }
            } catch { /* silent */ }
          }
        } catch { /* silent */ }
      } else {
        const userId = getUserIdFromJwt();
        if (!userId) return;
        try {
          const data = await getStoresByUser(userId);
          const list = Array.isArray(data) ? data : (data?.data ?? []);
          const first = list[0];
          const id = first?.storeId ?? first?.store_id ?? first?.id ?? null;
          if (id) {
            localStorage.setItem("storeId", id);
            setSseStoreId(id);
            const role = first?.role ?? "OWNER";
            localStorage.setItem("userRole", role);
            const name = first?.name ?? first?.storeName ?? null;
            if (name) localStorage.setItem("storeName", name);
            setStoreInfo({ name, logo: null });
            try {
              const settings = await getStoreSettingsByHeader(id);
              if (settings) {
                setStoreInfo({
                  name,
                  logo: settings.basic?.logoPreview ?? settings.logoUrl ?? null,
                });
              }
            } catch { /* silent */ }
          }
        } catch { /* silent */ }
      }
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="admin-terminal-wrapper" data-theme={theme}>
      <Sidebar
        storeSlug={slug}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        brandName={storeInfo.name}
        brandSub={userInfo?.userRole ?? "OWNER"}
        logoUrl={storeInfo.logo}
        useImageLogo={!!storeInfo.logo}
        theme={theme}
        onToggleTheme={toggleTheme}
        sidebarColor={sidebarColor}
      />

      <div className="admin-main-section">
        <AdminHeader
          isAiOpen={isAiOpen}
          setIsAiOpen={setIsAiOpen}
          showAi={true}
          showBell={true}
          showSettings={true}
          isSuperAdmin={false}
          onToggleSidebar={() => setIsSidebarOpen((o) => !o)}
          userName={userInfo?.userName}
          userRole={userInfo?.userRole}
          pageTitle={pageTitle}
          theme={theme}
          onToggleTheme={toggleTheme}
          sidebarColor={sidebarColor}
          onSidebarColorChange={handleSidebarColorChange}
          notifCount={unread}
          onBellClick={markAllRead}
        />

        <div className="admin-workspace-split">
          <main className="admin-page-body">
            <Outlet />
          </main>

          {storeReady && <IAAdmin isOpen={isAiOpen} setIsOpen={setIsAiOpen} />}
        </div>
      </div>

      <StockAlertToast />
      <AdminNotifToast notifications={notifications} />
    </div>
  );
};

export default AdminLayout;
