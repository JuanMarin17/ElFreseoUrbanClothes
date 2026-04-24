import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import './NewCollections.css';

const NewCollections = ({ className }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);

  // ─────────────────────────────────────────────────────────────
  // TODO: REEMPLAZAR ESTAS IMÁGENES
  // Las URLs de Instagram expiran — usa imágenes propias subidas
  // a /src/assets/ o a un CDN como Cloudinary/Supabase Storage.
  // Ejemplo: image: "/assets/camiseta-roja.jpg"
  // ─────────────────────────────────────────────────────────────
  const products = [
    { id: 1, name: "CAMISETA ROJA FRESEO", price: "COP 49.900", image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80" },
    { id: 2, name: "GORRAS",               price: "COP 39.900", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80" },
    { id: 3, name: "NUEVO DROP",           price: "COP 49.900", image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80" },
    { id: 4, name: "NUEVO DROP",           price: "COP 55.000", image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80" },
    // Duplicamos slides para que el loop de Swiper funcione sin warnings
    { id: 5, name: "CAMISETA ROJA FRESEO", price: "COP 49.900", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80" },
    { id: 6, name: "GORRAS",               price: "COP 39.900", image: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&q=80" },
  ];

  return (
    <section className={`newCollections ${className || ""}`}>
      <h2 className="newCollections-title">NUEVAS COLECCIONES</h2>

      <div
        className="swiper-container-relative"
        onMouseEnter={() => swiperInstance?.autoplay.stop()}
        onMouseLeave={() => swiperInstance?.autoplay.start()}
      >
        <button className="custom-prev-btn">
          <ChevronLeft size={32} strokeWidth={1.5} />
        </button>
        <button className="custom-next-btn">
          <ChevronRight size={32} strokeWidth={1.5} />
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          onSwiper={setSwiperInstance}
          spaceBetween={10}
          slidesPerView={1.12}
          centeredSlides={true}
          loop={true}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          navigation={{ nextEl: '.custom-next-btn', prevEl: '.custom-prev-btn' }}
          breakpoints={{
            768:  { slidesPerView: 1.25, spaceBetween: 15 },
            1024: { slidesPerView: 1.5,  spaceBetween: 20 },
          }}
          className="newCollectionsSwiper"
        >
          {products.map((product) => (
            <SwiperSlide key={`slide-${product.id}`}>
              <div className="product-card-horizontal">
                <div className="product-image-section">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img-horizontal"
                  />
                </div>
                <div className="product-info-section">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">{product.price}</p>
                  <button className="product-action-btn">VER PRODUCTO</button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default NewCollections;