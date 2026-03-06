import React, { useEffect } from 'react'; // Importamos useEffect
import Header from '../../components/Header/Header.jsx';
import HeroSection from '../../components/HeroSection/HeroSection.jsx';
import NewCollections from '../../components/NewCollections/NewCollections.jsx';
import Reviews from '../../components/Reviews/Reviews.jsx';
import Location from '../../components/Location/Location.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import './LandingPage.css';

function LandingPage() {
  
  useEffect(() => {
    // 1. Definimos las opciones
    const observerOptions = {
      threshold: 0.15,
    };

    // 2. Creamos el observer DENTRO del useEffect
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // 3. Seleccionamos los elementos DESPUÉS de que el componente cargue
    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => observer.observe(section));

    // Limpieza al desmontar el componente para evitar fugas de memoria
    return () => observer.disconnect();
  }, []); // El array vacío [] asegura que esto solo corra UNA vez

  return (
    <div className="main-container">
      <main>
        <Header />
        <section className='main-section'>
          <HeroSection />

          {/* OJO: Para que esto funcione, dentro del componente NewCollections
              debes recibir la prop 'className' y aplicarla al div principal.
          */}
          <NewCollections className="fade-in-section" />

          <Reviews className="fade-in-section" />
          <Location className="fade-in-section" />
          <Footer />
        </section>
      </main>
    </div>
  );
}

export default LandingPage;