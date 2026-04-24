import React from 'react';
import './HeroSection.css';
import LogoModel from "../../../../assets/HeroSection/HeroSectionIcon.jpg";

const HeroSection = () => {
  return (
    <section className="heroSection">
      <div className="heroSection-container">

        <div className="heroSection-info">
          {/* Tagline arriba del título — mejor flujo visual */}
          <p className="heroSection-tagline">Urban Clothes</p>

          <h1 className="heroSection-title">
            Bienvenidos mis <span>fresas</span>
          </h1>

          <p className="heroSection-description">
            Bienvenido a El Freseo. La tienda urbana donde encontrarás
            lo último en tendencia en ropa, gorras y accesorios exclusivos.
          </p>

          <button className="heroSection-btn">
            Catálogo
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