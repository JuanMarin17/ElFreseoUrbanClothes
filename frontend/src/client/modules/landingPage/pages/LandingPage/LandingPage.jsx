import React, { useEffect } from 'react';
import Header from '../../components/Header/Header.jsx';
import HeroSection from '../../components/HeroSection/HeroSection.jsx';
import NewCollections from '../../components/NewCollections/NewCollections.jsx';
import Reviews from '../../components/Reviews/Reviews.jsx';
import Location from '../../components/Location/Location.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import './LandingPage.css';

function LandingPage() {
  
  useEffect(() => {
    // Configuramos el observador
    const observerOptions = {
      threshold: 0.15, // Se activa cuando el 15% es visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Aparece al bajar (o si está en pantalla)
          entry.target.classList.add('is-visible');
        } else {
          // Desaparece al subir (o salir de pantalla)
          entry.target.classList.remove('is-visible');
        }
      });
    }, observerOptions);

    // Seleccionamos todos los elementos que deben animarse
    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => observer.observe(section));

    // Limpieza: dejamos de observar si el usuario cambia de página
    return () => observer.disconnect();
  }, []);

  return (
    <div className="main-container">
      <main>
        <Header />
        <section className='main-section'>
          <HeroSection />

          {/* IMPORTANTE: Asegúrate de que estos componentes acepten la prop className 
            y la apliquen a su etiqueta HTML principal.
          */}
          <NewCollections className="fade-in-section" />
          
          <div className="fade-in-section">
            <Reviews />
          </div>

          <div className="fade-in-section">
            <Location />
          </div>

          <Footer />
        </section>
      </main>
    </div>
  );
}

export default LandingPage;