import { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import IAAdmin from '../../pages/IAAdmin/AIAdmin';
import { getStoreBySlug } from '../../../../../multi-tenant/pages/services/storeService';
import './AdminLayout.css';

const AdminLayout = () => {
  const { slug } = useParams();
  const [isAiOpen, setIsAiOpen] = useState(false);
  // IAAdmin solo se monta cuando storeId y userRole ya están correctos en localStorage
  const [storeReady, setStoreReady] = useState(!slug);

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
      <Sidebar storeSlug={slug} />

      <div className="admin-main-section">
        <AdminHeader
          isAiOpen={isAiOpen}
          setIsAiOpen={setIsAiOpen}
          showAi={true}
          showBell={true}
          showSettings={true}
          isSuperAdmin={false}
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
