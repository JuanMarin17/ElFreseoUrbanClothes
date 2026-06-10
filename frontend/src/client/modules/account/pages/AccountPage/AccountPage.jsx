import React, { useState, Suspense, memo } from 'react';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar.jsx';
import MyProfile      from '../../components/profile/MyProfile.jsx';
import './AccountPage.css';

// Secciones no críticas: se cargan solo cuando el usuario las visita
const Security    = React.lazy(() => import('../../components/Security/Security.jsx'));
const MyOrders    = React.lazy(() => import('../../components/Orders/MyOrders.jsx'));
const AddressBook = React.lazy(() => import('../../components/Addresses/AddressBook.jsx'));
const Preferences = React.lazy(() => import('../../components/Preferences/Preferences.jsx'));
const HelpSupport = React.lazy(() => import('../../components/Support/HelpSupport.jsx'));

const SectionFallback = (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 20px', color: '#666', fontSize: 12, letterSpacing: 2 }}>
    <span>CARGANDO...</span>
  </div>
);

// Renderiza solo la sección activa — sin crear las demás
function ActiveSection({ active, onNavigate }) {
  switch (active) {
    case 'profile':     return <MyProfile onNavigate={onNavigate} />;
    case 'security':    return <Security />;
    case 'orders':      return <MyOrders />;
    case 'addresses':   return <AddressBook />;
    case 'preferences': return <Preferences />;
    case 'support':     return <HelpSupport />;
    default:            return <MyProfile onNavigate={onNavigate} />;
  }
}

const MemoizedSidebar = memo(AccountSidebar);

export default function AccountPage() {
  const [active, setActive] = useState('profile');

  return (
    <div className="account-wrapper">
      <div className="account-layout">
        <MemoizedSidebar active={active} onSelect={setActive} />
        <main className="account-content">
          <div className="section-content-wrapper">
            <Suspense fallback={SectionFallback}>
              <ActiveSection active={active} onNavigate={setActive} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
