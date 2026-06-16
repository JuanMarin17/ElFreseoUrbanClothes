import React, { useState, Suspense, memo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar.jsx';
import MyProfile      from '../../components/Profile/MyProfile.jsx';
import './AccountPage.css';

const PATH_TO_SECTION = {
  pedidos:         'orders',
  seguridad:       'security',
  direcciones:     'addresses',
  preferencias:    'preferences',
  configuracion:   'preferences',
  soporte:         'support',
  perfil:          'profile',
  notificaciones:  'notifications',
  devoluciones:    'returns',
  puntos:          'loyalty',
};

const Security       = React.lazy(() => import('../../components/Security/Security.jsx'));
const MyOrders       = React.lazy(() => import('../../components/Orders/MyOrders.jsx'));
const AddressBook    = React.lazy(() => import('../../components/Addresses/AddressBook.jsx'));
const Preferences    = React.lazy(() => import('../../components/Preferences/Preferences.jsx'));
const HelpSupport    = React.lazy(() => import('../../components/Support/HelpSupport.jsx'));
const Notifications  = React.lazy(() => import('../../components/Notifications/Notifications.jsx'));
const Returns        = React.lazy(() => import('../../components/Returns/Returns.jsx'));
const LoyaltyWidget  = React.lazy(() => import('../../components/Loyalty/LoyaltyWidget.jsx'));

const SectionFallback = (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 20px', color: '#666', fontSize: 12, letterSpacing: 2 }}>
    <span>CARGANDO...</span>
  </div>
);

function ActiveSection({ active, onNavigate }) {
  switch (active) {
    case 'profile':        return <MyProfile onNavigate={onNavigate} />;
    case 'security':       return <Security />;
    case 'orders':         return <MyOrders />;
    case 'addresses':      return <AddressBook />;
    case 'preferences':    return <Preferences />;
    case 'support':        return <HelpSupport />;
    case 'notifications':  return <Notifications />;
    case 'returns':        return <Returns />;
    case 'loyalty':        return <LoyaltyWidget />;
    default:               return <MyProfile onNavigate={onNavigate} />;
  }
}

const MemoizedSidebar = memo(AccountSidebar);

export default function AccountPage() {
  const location = useLocation();

  const getSectionFromPath = () => {
    const segment = location.pathname.split('/').filter(Boolean).at(-1) ?? '';
    return PATH_TO_SECTION[segment] ?? 'profile';
  };

  const [active, setActive] = useState(getSectionFromPath);

  useEffect(() => {
    setActive(getSectionFromPath());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
