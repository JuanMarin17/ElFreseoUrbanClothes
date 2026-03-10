import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu } from 'lucide-react'; 
import './Header.css';
import Logo from "../../../../assets/Freseo.png"; // Asegura esta ruta

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // --- AÑADIDO: Estado para saber si esconder el header ---
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Lógica para el fondo glassmorphism (tu código original)
      setIsScrolled(currentScrollY > 50);

      // 2. --- AÑADIDO: Lógica para esconder/mostrar (Adidas style) ---
      // Solo esconder si hemos bajado más de 100px para evitar errores al inicio
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true); // Bajando -> esconder
      } else {
        setIsHidden(false); // Subiendo -> mostrar
      }
      
      // Actualizar la última posición del scroll
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Limpiar el evento al desmontar
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]); // Dependencia necesaria

  return (
    // --- CLASES DINÁMICAS APLICADAS AQUÍ ---
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'header-scroll-hidden' : ''}`}>
      <div className="header-container">
        
        <div className="logo">
          <img src={Logo} alt="Freseo Logo" className="logo-image" />
          EL FRESEO
        </div>

        {/* Navegación Central */}
        <nav className="nav-menu">
          <a href="#inicio" className="nav-link">INICIO</a>
          <a href="#tienda" className="nav-link">TIENDA</a>
          <a href="#catalogo" className="nav-link">CATÁLOGO</a>
        </nav>

        {/* Acciones de Usuario */}
        <div className="header-actions">
          <button className="icon-btn" aria-label="Usuario">
            <User size={22} />
          </button>
          <button className="icon-btn cart-btn" aria-label="Carrito">
            <ShoppingCart size={22} />
            <span className="cart-badge">0</span>
          </button>
          <button className="menu-mobile">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;