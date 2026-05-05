import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import './AdminHeader.css';

const AdminHeader = () => {
  return (
    <header className="admin-top-bar">
      <div className="search-box-terminal">
        <Search size={16} className="s-icon" />
        <input type="text" placeholder="Buscar usuarios..." />
      </div>
      
      <div className="top-bar-tools">
        <button className="tool-btn">
          <Bell size={18} />
          <span className="dot-alert"></span>
        </button>
        <button className="tool-btn">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;