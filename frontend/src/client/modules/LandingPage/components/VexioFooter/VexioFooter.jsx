import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../../../../assets/LogoVexios/banervexio.png';
import './VexioFooter.css';

const LINKS = {
  Producto:  ['Características', 'Precios', 'Integraciones',],
  Empresa:   ['Sobre nosotros', 'Trabaja con nosotros'],
  Soporte:   ['Centro de ayuda', 'Contacto'],
};

export default function VexioFooter() {
  return (
    <footer className="vx-footer">
      <div className="vx-footer-top">

        <div className="vx-footer-brand">
          <img src={Logo} alt="Vexio" className="vx-footer-logo" />
          <p className="vx-footer-tagline">
            La plataforma de comercio unificado para negocios colombianos que quieren crecer sin límites.
          </p>
          <div className="vx-footer-socials">
            {['in', 'ig', 'tw', 'yt'].map(s => (
              <a key={s} href="#" className="vx-footer-social">{s}</a>
            ))}
          </div>
        </div>

        {Object.entries(LINKS).map(([col, items]) => (
          <div key={col} className="vx-footer-col">
            <h4 className="vx-footer-col-title">{col}</h4>
            <ul>
              {items.map(item => (
                <li key={item}><a href="#">{item}</a></li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      <div className="vx-footer-bottom">
        <span className="vx-footer-copy">
          © 2025 Vexio. Todos los derechos reservados
        </span>
        <div className="vx-footer-legal">
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
