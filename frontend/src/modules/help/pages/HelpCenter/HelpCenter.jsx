import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importación necesaria para el router
import { 
  Search, Truck, MessageCircle, Ruler, ChevronDown, 
  ShieldCheck, CreditCard, RefreshCcw, Package, 
  Mail, MapPin, Send, Globe 
} from 'lucide-react';
import Header from '../../../landingPage/components/Header/Header';
import './HelpCenter.css';

const HelpCenter = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const categories = [
    { icon: <Package size={24} />, title: "Pedidos", desc: "Gestión y estados" },
    { icon: <CreditCard size={24} />, title: "Pagos", desc: "Métodos y facturación" },
    { icon: <RefreshCcw size={24} />, title: "Devoluciones", desc: "Políticas de cambio" },
    { icon: <ShieldCheck size={24} />, title: "Seguridad", desc: "Privacidad de datos" },
  ];

  const faqs = [
    { 
      id: 1, 
      question: "¿Cuánto tarda el envío?", 
      answer: "Nuestros envíos nacionales tardan entre 2 a 5 días hábiles. Recibirás un número de guía apenas tu pedido salga de bodega." 
    },
    { 
      id: 2, 
      question: "¿Cómo hago un cambio?", 
      answer: "Tienes 15 días tras recibir tu compra. La prenda debe estar en perfecto estado y con etiquetas originales." 
    },
    { 
      id: 3, 
      question: "¿Qué métodos de pago aceptan?", 
      answer: "Aceptamos tarjetas de crédito, débito, PSE y pagos contra entrega en ciudades seleccionadas." 
    }
  ];

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <>
      <Header />
      <div className="help-container">
        
        <header className="help-header">
          <h1>Centro de Ayuda <span className="neon-text">El Freseo</span></h1>
          <p className="subtitle">Resolución rápida para tu estilo urban</p>
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder="¿Qué buscas?" className="neon-search" />
          </div>
        </header>

        <section className="support-cards">
          <div className="glass-card">
            <Truck size={32} color="#a855f7" />
            <h3>Rastrear Pedido</h3>
            <p>Consulta el estado de tu envío.</p>
          </div>
          <div className="glass-card">
            <MessageCircle size={32} color="#a855f7" />
            <h3>WhatsApp</h3>
            <p>Asesoría personalizada inmediata.</p>
          </div>
          <div className="glass-card">
            <Ruler size={32} color="#a855f7" />
            <h3>Guía de Tallas</h3>
            <p>El fit perfecto para tu outfit.</p>
          </div>
        </section>

        {/* Sección de Categorías con Router Link aplicado como pediste */}
        <section className="categories-section">
          <h2 className="section-title">Explorar por categoría</h2>
          <div className="categories-grid">
            {categories.map((cat, index) => (
              <Link to={`/${cat.title.toLowerCase()}`} key={index} className="category-card-link">
                <div className="category-item">
                  <div className="category-icon">{cat.icon}</div>
                  <h4>{cat.title}</h4>
                  <p>{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="faq-section">
          <h2 className="section-title">Preguntas Frecuentes</h2>
          <div className="accordion-group">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className={`accordion-item ${activeAccordion === faq.id ? 'active' : ''}`}
                onClick={() => toggleAccordion(faq.id)}
              >
                <div className="accordion-header">
                  <span>{faq.question}</span>
                  <div className="icon-wrapper">
                    <ChevronDown size={20} className="arrow-icon" />
                  </div>
                </div>
                <div className="accordion-content">
                  <div className="content-inner">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>¿Aún tienes dudas?</h2>
              <p>Envíanos un mensaje y te responderemos en breve.</p>
              <div className="contact-details">
                <div className="detail-item"><Mail size={18} color="#a855f7" /> soporte@elfreseo.com</div>
                <div className="detail-item"><MapPin size={18} color="#a855f7" /> Montenegro - Quindio, CO</div>
              </div>
            </div>
            
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <input type="text" id="name" required />
                <label htmlFor="name">Nombre completo</label>
                <div className="input-line"></div>
              </div>

              <div className="input-group">
                <input type="email" id="email" required />
                <label htmlFor="email">Correo electrónico</label>
                <div className="input-line"></div>
              </div>

              <div className="input-group">
                <textarea id="message" required rows="4"></textarea>
                <label htmlFor="message">¿En qué podemos ayudarte?</label>
                <div className="input-line"></div>
              </div>

              <button type="submit" className="neon-button">
                Enviar mensaje <Send size={18} />
              </button>
            </form>
          </div>
        </section>

        <footer className="help-footer">
          <p>© 2026 El Freseo Urban Clothes. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default HelpCenter;