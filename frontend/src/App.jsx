import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion';
import './App.css'
import LandingPage from './modules/landingPage/pages/LandingPage/LandingPage.jsx'
import LoadingScreen from './modules/landingPage/LoadingScreen/LoadingScreen.jsx'; // Asegura esta ruta

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='main'>
      <AnimatePresence>
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <LandingPage key="main" />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App;