import React from 'react';
import './Footer.css';
import LogoIg from "../../../../assets/IG_Logo.png";
import LogoFb from "../../../../assets/Facebook.png";
import LogoWa from "../../../../assets/whatsapp.png";
import LogoTiktok from "../../../../assets/tikTok.png";

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        {/* Columna 1: Marca y descripción */}
        <div className="footer-col brand-col">
          <h2 className="footer-logo">EL FRESEO</h2>
          <p className="footer-description">
            Urban clothes sin reglas. Alta calidad y diseños exclusivos para quienes marcan la diferencia.
          </p>
        </div>

        {/* Columna 2: Navegación rápida */}
        <div className="footer-col">
          <h3 className="footer-title">MENÚ</h3>
          <ul className="footer-links">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#colecciones">Colecciones</a></li>
            <li><a href="#reviews">Reseñas</a></li>
            <li><a href="#ubicacion">Ubicación</a></li>
          </ul>
        </div>

        {/* Columna 3: Soporte/Contacto */}
        <div className="footer-col">
          <h3 className="footer-title">SOPORTE</h3>
          <ul className="footer-links">
            <li><a href="#faq">Preguntas Frecuentes</a></li>
            <li><a href="#envios">Envíos y Devoluciones</a></li>
            <li><a href="#terminos">Términos de Servicio</a></li>
          </ul>
        </div>

        {/* Columna 4: Redes Sociales con LOGOS */}
        <div className="footer-col social-col">
          <h3 className="footer-title">SÍGUENOS</h3>
          <div className="social-icons-wrapper">
            
            <a href="https://www.instagram.com/freseourbanclothes/" target="_blank" rel="noopener noreferrer" className="social-logo-link">
              <img src={LogoIg} alt="Instagram El Freseo" className="social-logo" />
            </a>
            
            <a href="https://www.facebook.com/share/1JhviGJkwT/" target="_blank" rel="noopener noreferrer" className="social-logo-link">
              <img src={LogoFb} alt="Facebook El Freseo" className="social-logo" />
            </a>
            
            <a href="https://wa.me/573146964112" target="_blank" rel="noopener noreferrer" className="social-logo-link">
              <img src={LogoWa} alt="WhatsApp El Freseo" className="social-logo" />
            </a>
            
            <a href="https://www.tiktok.com/@eidderguerrero" target="_blank" rel="noopener noreferrer" className="social-logo-link">
              <img src={LogoTiktok} alt="TikTok El Freseo" className="social-logo" />
            </a>

          </div>
        </div>
      </div>

      {/* Barra inferior de copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EL FRESEO. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;