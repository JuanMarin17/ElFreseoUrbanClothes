import { useState, useEffect, useMemo } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import IAAdmin from '../../pages/IAAdmin/AIAdmin';
import { getStoreBySlug } from '../../../../../multi-tenant/pages/services/storeService';
import './AdminLayout.css';

const ROUTE_TITLES = {
  dashboard:         'Dashboard',
  'subir-producto':  'Subir Producto',
  'editar-producto': 'Editar Producto',
  inventario:        'Inventario',
  usuarios:          'Gestionar Usuarios',
  report:            'Informes',
  pedidos:           'Ver Pedidos',
  alertas:           'Alertas de Stock',
  proveedores:       'Proveedores',
  promociones:       'Promociones',
  productos:         'Productos',
  cms:               'Contenido CMS',
  IA:                'Asistente IA',
};

function parseUserFromJwt() {
  try {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return null;
    const decoded = JSON.parse(atob(jwt.split('.')[1]));
    return {
      userName: decoded.sub ?? null,
      userRole: localStorage.getItem('userRole') ?? decoded.role ?? 'OWNER',
    };
  } catch {
    return null;
  }
}

const AdminLayout = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // IAAdmin solo se monta cuando storeId y userRole ya están correctos en localStorage
  const [storeReady, setStoreReady] = useState(!slug);

  const userInfo = useMemo(() => parseUserFromJwt(), []);

  const pageTitle = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    return ROUTE_TITLES[last] ?? null;
  }, [location.pathname]);

  // Close sidebar on route change (mobile navigation)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!slug) return;

    getStoreBySlug(slug)
      .then((store) => {
        const storeId = store?.storeId ?? store?.id ?? store?.store_id ?? null;
        if (storeId) localStorage.setItem("storeId", storeId);

        const currentRole = localStorage.getItem("userRole");
        if (!currentRole || currentRole === "null" || currentRole === "USER") {
          localStorage.setItem("userRole", "OWNER");
        }
      })
      .catch(() => {
        // Fallback: al menos corregir el rol aunque no pudiéramos resolver el storeId
        const currentRole = localStorage.getItem("userRole");
        if (!currentRole || currentRole === "null" || currentRole === "USER") {
          localStorage.setItem("userRole", "OWNER");
        }
      })
      .finally(() => setStoreReady(true));
  }, [slug]);

  return (
    <div className="admin-terminal-wrapper">
      <Sidebar
        storeSlug={slug}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="admin-main-section">
        <AdminHeader
          isAiOpen={isAiOpen}
          setIsAiOpen={setIsAiOpen}
          showAi={true}
          showBell={true}
          showSettings={true}
          isSuperAdmin={false}
          onToggleSidebar={() => setIsSidebarOpen(o => !o)}
          userName={userInfo?.userName}
          userRole={userInfo?.userRole}
          pageTitle={pageTitle}
        />

        <div className="admin-workspace-split">
          <main className="admin-page-body">
            <Outlet />
          </main>

          {storeReady && <IAAdmin isOpen={isAiOpen} setIsOpen={setIsAiOpen} />}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
