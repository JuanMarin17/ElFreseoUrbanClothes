import React from 'react';
import { motion } from 'framer-motion';
import Logo from '../../../assets/Freseo.png'; // AJUSTA ESTA RUTA A TU LOGO
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <motion.div 
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      <motion.img
        src={Logo}
        alt="Freseo Logo"
        className="loading-logo"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut", 
          repeat: Infinity,
          repeatType: "reverse"
          
        }}
      />
    </motion.div>
  );
};

export default LoadingScreen;