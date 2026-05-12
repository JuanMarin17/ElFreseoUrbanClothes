import React, { useState } from 'react';
import AccountSidebar from '../../components/AccountSidebar/AccountSidebar.jsx';
import MyProfile      from '../../components/profile/MyProfile.jsx';
import Security       from '../../components/Security/Security.jsx';
import MyOrders       from '../../components/Orders/MyOrders.jsx';
import AddressBook    from '../../components/Addresses/AddressBook.jsx';
import Preferences    from '../../components/Preferences/Preferences.jsx';
import HelpSupport    from '../../components/Support/HelpSupport.jsx';
import Header         from '../../../landingPage/components/Header/Header.jsx';
import './AccountPage.css';

const SECTIONS = {
  profile:     <MyProfile />,
  security:    <Security />,
  orders:      <MyOrders />,
  addresses:   <AddressBook />,
  preferences: <Preferences />,
  support:     <HelpSupport />,
};

export default function AccountPage() {
  const [active, setActive] = useState('profile');

  return (
    <div className="account-wrapper">
      <Header />
      <div className="account-layout">
        <AccountSidebar active={active} onSelect={setActive} />
        <main className="account-content">
          <div className="section-content-wrapper">
            {SECTIONS[active]}
          </div>
        </main>
      </div>
    </div>
  );
}