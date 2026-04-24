
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion';
import { Routes, Route } from 'react-router-dom';
import './App.css'
import './animations.css'
import UploadProduct from "./admin/modules/administration/pages/UploadProduct";
import EditProduct from "./admin/modules/administration/pages/EditProduct";
import DetailsProduct from "./client/modules/MainPage/components/ProductDetail/ProductDetail.jsx";
import LandingPage from './client/modules/landingPage/pages/LandingPage/LandingPage.jsx'
import LoadingScreen from './client/modules/landingPage/LoadingScreen/LoadingScreen.jsx';
import HelpCenter from './client/modules/help/pages/HelpCenter/HelpCenter.jsx';
import Login from './admin/modules/auth/pages/Login/Login.jsx';
import MainPage from './client/modules/MainPage/pages/MainPage/MainPage.jsx';
import { useScrollAnimation } from './hooks/UsescrollAnimation.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  const [isLoading, setIsLoading] = useState(true);

  useScrollAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='main-container'>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <Routes key="main-content">
            <Route path="/" element={<div className='ayuda'><LandingPage /></div>} />
            <Route path="/login" element={<div className='ayuda'><Login /></div>} />
            <Route path="/ayuda" element={<div className='ayuda'><HelpCenter /></div>} />
            <Route path="/landing" element={<LandingPage />} />

            {/* NUEVA RUTA PARA EL CATÁLOGO */}
            <Route path="/catalogo" element={<MainPage />} />

            <Route path="/pedidos" element={<div className='ayuda'><HelpCenter /></div>} />
            <Route path="/pagos" element={<div className='ayuda'><HelpCenter /></div>} />
            <Route path="/devoluciones" element={<div className='ayuda'><HelpCenter /></div>} />
            <Route path="/seguridad" element={<div className='ayuda'><HelpCenter /></div>} />
          </Routes>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App;

