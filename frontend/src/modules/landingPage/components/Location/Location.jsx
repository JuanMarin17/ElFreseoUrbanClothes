import React from 'react';
import './Location.css';

const Location = (className) => {
  return (
    <section className={`location-section ${className.className}`}>
      <div className="location-container">
        <h2 className="location-title">UBICACIÓN</h2>
        
        <div className="location-grid">
          {/* Columna de Información */}
          <div className="location-info">
            <h3>VISÍTANOS</h3>
            <p className="address">Carrera 15 <br />Montenegro, Quindio</p>
            
        
            
            <button className="location-btn" onClick={() => window.open('https://www.google.com/maps/@4.5668464,-75.7526717,3a,75y,342.86h,77.68t/data=!3m7!1e1!3m5!1sWX26rOms8890Sgucm69h2g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D12.316603451744086%26panoid%3DWX26rOms8890Sgucm69h2g%26yaw%3D342.864347452254!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI2MDIyNS4wIKXMDSoASAFQAw%3D%3D')}>
              CÓMO LLEGAR
            </button>
          </div>
          
          {/* Columna del Mapa - IMPLEMENTACIÓN */}
          <div className="location-map">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!4v1772460287786!6m8!1m7!1sWX26rOms8890Sgucm69h2g!2m2!1d4.566846409414615!2d-75.7526717080958!3f337.50541532247314!4f-0.3300239417410751!5f0.7820865974627469" // AQUI ESTÁ TU MAPA
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación El Freseo"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;