import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import IAAdmin from '../../pages/IAAdmin/AIAdmin';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="admin-terminal-wrapper">
      <Sidebar />

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

          <IAAdmin isOpen={isAiOpen} setIsOpen={setIsAiOpen} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;