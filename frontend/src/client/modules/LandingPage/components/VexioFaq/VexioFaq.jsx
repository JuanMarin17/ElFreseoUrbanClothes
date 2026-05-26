import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import './VexioFaq.css';

const FAQS = [
  {
    q: '¿Necesito conocimientos técnicos para usar Vexio?',
    a: 'No. Vexio está diseñado para que cualquier persona pueda crear y gestionar su tienda sin escribir una sola línea de código. Nuestro editor visual es 100% intuitivo.',
  },
  {
    q: '¿Puedo migrar mi tienda actual a Vexio?',
    a: 'Sí. Ofrecemos migración asistida desde Shopify, WooCommerce, Vtex y otros. También puedes importar tu catálogo completo desde Excel/CSV. El equipo de onboarding te acompaña en el proceso.',
  },
  {
    q: '¿Qué métodos de pago están disponibles?',
    a: 'Aceptamos todas las tarjetas débito y crédito, PSE, Nequi, Daviplata, Efecty y pagos en efectivo. Las liquidaciones se realizan en 24–48 horas hábiles directamente a tu cuenta bancaria.',
  },
  {
    q: '¿Hay contrato de permanencia?',
    a: 'No. Todos nuestros planes son mensuales sin permanencia. Puedes cancelar, pausar o cambiar de plan en cualquier momento desde tu panel de administración.',
  },
  {
    q: '¿Vexio cobra comisión por venta?',
    a: 'No cobramos comisión sobre tus ventas. Solo pagas tu suscripción mensual. Las únicas tarifas aplicables son las de la pasarela de pagos, que son estándar del mercado y totalmente transparentes.',
  },
  {
    q: '¿El plan Enterprise incluye soporte dedicado?',
    a: 'Sí. El plan Enterprise incluye un gestor de cuenta dedicado, soporte 24/7 por teléfono y chat, SLA garantizado del 99.9% y sesiones de estrategia mensuales con nuestro equipo.',
  },
];

export default function VexioFaq() {
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen(prev => prev === i ? null : i);

  return (
    <section id="vx-faq" className="vx-section vx-section--dark2">
      <div className="vx-section-head vx-section-head--center">
        <p className="vx-section-label">Preguntas frecuentes</p>
        <h2 className="vx-section-title">Resolvemos tus dudas</h2>
      </div>

      <div className="vx-faq-list">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className={`vx-faq-item${open === i ? ' vx-faq-item--open' : ''}`}
          >
            <button className="vx-faq-q" onClick={() => toggle(i)}>
              <span>{faq.q}</span>
              <Plus size={18} className="vx-faq-icon" />
            </button>
            <div className="vx-faq-a">
              <div className="vx-faq-a-inner">{faq.a}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
