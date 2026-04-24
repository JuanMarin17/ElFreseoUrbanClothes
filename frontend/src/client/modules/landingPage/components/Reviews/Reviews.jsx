import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

// Importación de estilos
import 'swiper/css';
import 'swiper/css/navigation';
import './Reviews.css';

const Reviews = (className) => {
  // Datos de ejemplo (puedes añadir o quitar para probar la condicional)
  const testimonials = [
    {
      id: 1,
      name: "Andrés Morales",
      status: "CLIENTE VERIFICADO",
      text: "La calidad de las prendas es brutal. El fit es perfecto y el diseño realmente transmite esa vibra urbana que buscaba. Definitivamente el envío fue muy rápido.",
      image: "/cliente1.png", // Asegúrate de tener esta imagen en tu carpeta public
    }, {
      id: 1,
      name: "Andrés Morales",
      status: "CLIENTE VERIFICADO",
      text: "La calidad de las prendas es brutal. El fit es perfecto y el diseño realmente transmite esa vibra urbana que buscaba. Definitivamente el envío fue muy rápido.",
      image: "/cliente1.png", // Asegúrate de tener esta imagen en tu carpeta public
    }, {
      id: 1,
      name: "Andrés Morales",
      status: "CLIENTE VERIFICADO",
      text: "La calidad de las prendas es brutal. El fit es perfecto y el diseño realmente transmite esa vibra urbana que buscaba. Definitivamente el envío fue muy rápido.",
      image: "/cliente1.png", // Asegúrate de tener esta imagen en tu carpeta public
    }, {
      id: 1,
      name: "Andrés Morales",
      status: "CLIENTE VERIFICADO",
      text: "La calidad de las prendas es brutal. El fit es perfecto y el diseño realmente transmite esa vibra urbana que buscaba. Definitivamente el envío fue muy rápido.",
      image: "/cliente1.png", // Asegúrate de tener esta imagen en tu carpeta public
    },
    {
      id: 2,
      name: "Camila Restrepo",
      status: "CLIENTE VERIFICADO",
      text: "Me encantó la gorra, el material es resistente y el color es idéntico al de las fotos. Mis fresas, se la recomiendo a todos sin pensarlo.",
      image: "/cliente2.png",
    },
    {
      id: 3,
      name: "Mateo López",
      status: "CLIENTE VERIFICADO",
      text: "Es mi tercera compra en El Freseo y nunca fallan. La atención al cliente es 10/10 y la exclusividad de los diseños se nota en la calle.",
      image: "/cliente3.png",
    }
  ];

  // CONDICIONAL: Si hay menos de 3, no se usa carrusel, se muestran estáticas
  const isCarousel = testimonials.length >= 3;

  return (
    <section className={`reviews-section ${className.className}`}>
      <div className="reviews-container">
        
        {/* Encabezado: Título y Navegación alineados */}
        <div className="reviews-header-flex">
          <h2 className="reviews-title">RESEÑAS</h2>
          {isCarousel && (
            <div className="custom-nav">
              <button className="nav-arrow prev-btn">←</button>
              <button className="nav-arrow next-btn">→</button>
            </div>
          )}
        </div>

        {/* Lógica condicional de renderizado */}
        {isCarousel ? (
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={30}
            slidesPerView={1.1} // Efecto de asomo en móvil
            centeredSlides={true}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={{ prevEl: '.prev-btn', nextEl: '.next-btn' }}
            breakpoints={{
              768: { slidesPerView: 2, centeredSlides: false },
              1024: { slidesPerView: 2.5, centeredSlides: true }
            }}
            className="reviewsSwiper"
          >
            {testimonials.map((review) => (
              <SwiperSlide key={review.id}>
                <ReviewCard review={review} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="reviews-static-grid">
            {testimonials.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Sub-componente: Diseño de la tarjeta grande
const ReviewCard = ({ review }) => (
  <div className="review-card">
    <div className="review-user-box">
      <div className="review-img-wrapper">
        <img src={review.image} alt={review.name} />
      </div>
      <div className="review-info">
        <h3>{review.name}</h3>
        <span className="verified-tag">✓ {review.status}</span>
        <div className="review-stars">★★★★★</div>
      </div>
    </div>
    
    <div className="review-quote">
      <p>"{review.text}"</p>
    </div>
  </div>
);

export default Reviews;