import React from 'react';
import './HeroSection.css';
import LogoModel from"../../../../assets/HeroSection/HeroSectionIcon.jpg";

const HeroSection = () => {
  return (
    <section className="heroSection">
      <div className="heroSection-container">
        
        <div className="heroSection-info">
          <h1 className="heroSection-title">
            Bienvenidos mis <span>fresas</span>
          </h1>
          <p className="heroSection-description">
            Bienvenido a El Freseo. La tienda urbana donde encontrarás lo último en tendencia en ropa, gorras y accesorios exclusivos.
          </p>
          <p className="heroSection-tagline">URBAN CLOTHES</p>
          
          <button className="heroSection-btn">
            CATALOGO
          </button>
        </div>

        <div className="heroSection-image-wrapper">
          <div className="model-frame">
             <img 
              src={LogoModel} 
              alt="Modelo El Freseo" 
              className="model-img" 
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;