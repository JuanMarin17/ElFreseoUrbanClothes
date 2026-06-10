import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../admin/modules/auth/pages/hook/Useauth";
import { Store, CreditCard } from "lucide-react";
import Sidebar from "../../admin/modules/administration/components/Sidebar/Sidebar";
import AdminHeader from "../../admin/modules/administration/components/AdminHeader/AdminHeader";
import IAAdmin from "../../admin/modules/administration/pages/IAAdmin/AIAdmin";
import "../../admin/modules/administration/components/AdminLayout/AdminLayout.css";

const SUPERADMIN_MENU = [
  { path: "/mis-tiendas",   label: "MIS TIENDAS",   icon: Store      },
  { path: "/transacciones", label: "TRANSACCIONES", icon: CreditCard },
];

const ADMIN_MENU = [
  { path: "/mis-tiendas",   label: "MIS TIENDAS",   icon: Store      },
  { path: "/transacciones", label: "TRANSACCIONES", icon: CreditCard },
];

const MyStoreLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const name = user?.userName ?? user?.name ?? "Usuario";
  const role = "SUPERADMIN"; // ajusta cuando tengas roles reales

  const menuItems = role === "SUPERADMIN" ? SUPERADMIN_MENU : ADMIN_MENU;

  const [isAiOpen, setIsAiOpen] = useState(false);

  const searchPlaceholder =
    location.pathname === "/transacciones"
      ? "Buscar transacción..."
      : "Buscar tienda o ID...";

  return (
    <div className="admin-terminal-wrapper">

      <Sidebar
        menuItems={menuItems}
        brandName="VEXIO"
        brandSub={role === "SUPERADMIN" ? "SUPER ADMIN" : "ADMIN"}
        onLogout={logout}
        useImageLogo={false}
      />

      <div className="admin-main-section">

        <AdminHeader
          isAiOpen={isAiOpen}
          setIsAiOpen={setIsAiOpen}
          showAi={true}
          showBell={true}
          showSettings={true}
          isSuperAdmin={role === "SUPERADMIN"}
          searchPlaceholder={searchPlaceholder}
          userName={name}
          userRole={role}
        />

        <div className="admin-workspace-split">

          <main className="admin-page-body">
            <Outlet /> {/* ← MyStore o Transaction según la ruta */}
          </main>

          <IAAdmin isOpen={isAiOpen} setIsOpen={setIsAiOpen} />

        </div>
      </div>
    </div>
  );
};

export default MyStoreLayout();