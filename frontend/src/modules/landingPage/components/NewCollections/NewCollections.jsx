import React, { useState } from 'react';
// Importamos Swiper y sus estilos
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
// Importamos el archivo CSS corregido
import './NewCollections.css';

const NewCollections = (className) => {
  // --- AÑADIDO: Estado para controlar Swiper ---
  const [swiperInstance, setSwiperInstance] = useState(null);

  // Datos de los productos
  const products = [
    {
      id: 1,
      name: "CAMISETA ROJA FRESEO",
      price: "COP 49.900",
      image: "https://instagram.fclo10-1.fna.fbcdn.net/v/t51.82787-15/519389700_17966433866921280_7355484378521885856_n.jpg?stp=dst-jpg_e35_p720x720_tt6&_nc_cat=100&ig_cache_key=MzY3NjA5Mjg0OTAyODg5NjE2Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTkxOS5zZHIuQzMifQ%3D%3D&_nc_ohc=-cNef_CfhzIQ7kNvwFvg997&_nc_oc=AdlLQBWMG3L8MOMohJXc7WMfs2Wn_lQNMKmUyBQWtu8bU2eTQ6MmlMEM7mAO7E9Nn9o&_nc_ad=z-m&_nc_cid=1462&_nc_zt=23&_nc_ht=instagram.fclo10-1.fna&_nc_gid=M7mNCM6SvklJexKIXLIpSw&_nc_ss=8&oh=00_Afxkkmap-n8hQLdKRqyFg2M5GNAkypB-bTk3xEIwU9QUyA&oe=69AB4FDD",
    },
    {
      id: 2,
      name: "GORRAS",
      price: "COP 39.900",
      image: "https://instagram.fclo10-1.fna.fbcdn.net/v/t51.75761-15/483346071_17952452009921280_7061664094933156677_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&_nc_cat=107&ig_cache_key=MzU4NDE5NTAyNTczNjA4ODQ4OQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=nt5PH8p-8pIQ7kNvwF2V85Q&_nc_oc=AdkAhCmwdc9d9cOjUEIJAeq2HmSjsvE9mJFojlg-CnzF_GriFSWATpabvgm-q-9NHRw&_nc_ad=z-m&_nc_cid=1462&_nc_zt=23&_nc_ht=instagram.fclo10-1.fna&_nc_gid=OhhlwnO9pd674lBATpBdHw&_nc_ss=8&oh=00_AfxN1V-a9IQOVlg2dYtDiIGOhhSGYctL_SOMMplCKLXqSA&oe=69AB5AA9",
    },
    {
      id: 3,
      name: "NUEVO DROP",
      price: "COP 49.900",
      image: "https://instagram.fclo10-1.fna.fbcdn.net/v/t51.75761-15/470042217_17942443907921280_5574404031797056122_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&_nc_cat=103&ig_cache_key=MzUyMjk2OTE2NTY0MTU0OTQ2NA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=RfcFUxAgbZMQ7kNvwFOCvpy&_nc_oc=Adk2noBgO9S5a3NmNwH7K20MWyRGpEpWYw5rmp_WKaCLFCGrPwesom99-79MfGYM6Uc&_nc_ad=z-m&_nc_cid=1462&_nc_zt=23&_nc_ht=instagram.fclo10-1.fna&_nc_gid=OhhlwnO9pd674lBATpBdHw&_nc_ss=8&oh=00_Afzfxw31jNnMv5G4AvbA1feGiv6buaEGH2TURVX4WeFsYw&oe=69AB62C6",
    },
     {
      id: 4,
      name: "NUEVO DROP ",
      price: "COP 55.000",
      image: "https://instagram.fclo10-1.fna.fbcdn.net/v/t51.75761-15/469904719_17942096948921280_5595345049872274170_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&_nc_cat=103&ig_cache_key=MzUyMDk3MDcyODgwMTA5NzYxNA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjEzMjB4MTY0OS5zZHIuQzMifQ%3D%3D&_nc_ohc=YF4HXsbva9AQ7kNvwEUCw3u&_nc_oc=AdnX7QAVBrHkvQDmzvVKVUA_18Fp7yvYof1Os4mGQmwXHo0FBHt-W5BG10CcLdEW4Kc&_nc_ad=z-m&_nc_cid=1462&_nc_zt=23&_nc_ht=instagram.fclo10-1.fna&_nc_gid=0snMbktTzLV1WDnevIRLwA&_nc_ss=8&oh=00_AfxtOQ5tsRHFMJWb0zrQ1y5ZwWNWvyudUdrx2PyELvYnqw&oe=69AB4E6E",
    },
  ];

  return (
    <section className={`newCollections ${className.className} `}>
      <h2 className="newCollections-title">NUEVAS COLECCIONES</h2>

      {/* --- AÑADIDO: Eventos para pausar/reanudar --- */}
      <div 
        onMouseEnter={() => swiperInstance?.autoplay.stop()}
        onMouseLeave={() => swiperInstance?.autoplay.start()}
      >
        <Swiper
          modules={[Autoplay, Navigation]}
          onSwiper={setSwiperInstance} // Guardamos la instancia
          spaceBetween={10}
          slidesPerView={1.12}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          navigation={true}
          breakpoints={{
            768: {
              slidesPerView: 1.25,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 1.5,
              spaceBetween: 20,
            }
          }}
          className="newCollectionsSwiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
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
                  <button className="product-action-btn">
                    VER PRODUCTO
                  </button>
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