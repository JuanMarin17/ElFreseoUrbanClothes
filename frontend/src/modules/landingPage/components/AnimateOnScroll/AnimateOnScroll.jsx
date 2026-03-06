import React from 'react';
import { motion } from 'framer-motion';

const AnimateOnScroll = ({ children }) => {
  // Configuración ultra-ligera
  const variants = {
    hidden: { opacity: 0, y: 30 }, // Reducido de 75 a 30 para que se sienta más rápido
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, // Más corto es más fluido
        ease: "easeOut" 
      } 
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible" // <-- Esto reemplaza al useEffect y useAnimation
      viewport={{ 
        once: true, 
        amount: 0.1,
        margin: "0px 0px -50px 0px" // Empieza a cargar un poquito antes de que aparezca
      }}
      variants={variants}
      style={{ 
        width: '100%', 
        display: 'block',
        willChange: "transform, opacity" // <-- Truco para activar la GPU
      }} 
    >
      {children}
    </motion.div>
  );
};

export default AnimateOnScroll;