import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion';
import { Routes, Route } from 'react-router-dom'; 
import './App.css'
import LandingPage from './modules/landingPage/pages/LandingPage/LandingPage.jsx'
import LoadingScreen from './modules/landingPage/LoadingScreen/LoadingScreen.jsx'; 
import HelpCenter from './modules/help/pages/HelpCenter/HelpCenter.jsx';
import Login from './modules/auth/pages/Login/Login.jsx';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Ajusta el tiempo si lo prefieres más rápido o lento

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='main-container'>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <Routes key="main-content">
            {/* Ruta principal: Ahora muestra el HelpCenter con su Header */}
            <Route path="/" element={<div className='ayuda'><LandingPage /></div>} />


            <Route path="/login" element={<div className='ayuda'><Login /></div>} />

            {/* Otras rutas del proyecto */}
            <Route path="/ayuda" element={<div className='ayuda'><HelpCenter /></div>} />
            <Route path="/landing" element={<LandingPage />} />
            
            {/* Rutas de categorías */}
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