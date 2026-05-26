import React from "react";
import "./styles/VexioTerms.css";

const sections = [
  {
    id: "01",
    title: "Definición de la Plataforma",
    content:
      "Vexio es una plataforma multitienda orientada a emprendedores, marcas y negocios que desean crear y administrar sus propias tiendas digitales dentro de un mismo ecosistema tecnológico.",
    items: [
      "Creación de tiendas virtuales",
      "Gestión de productos e inventarios",
      "Administración de ventas y pedidos",
      "Personalización visual de tiendas",
      "Gestión comercial y de clientes",
    ],
  },
  {
    id: "02",
    title: "Aceptación de los Términos",
    content:
      "Al registrarse en Vexio, el usuario declara que ha leído, comprendido y aceptado estos términos y condiciones.",
    items: [
      "Uso legal de la plataforma",
      "Información veraz y actualizada",
      "Aceptación de políticas de privacidad",
      "Cumplimiento de normas colombianas",
    ],
  },
  {
    id: "03",
    title: "Responsabilidad del Usuario",
    content:
      "Cada usuario será responsable de toda la información, contenido, productos y actividades realizadas dentro de su tienda digital.",
    items: [
      "Suplantación de identidad",
      "Publicidad engañosa",
      "Manipulación fraudulenta de precios",
      "Fraudes o estafas",
      "Uso ilegal de la plataforma",
      "Información falsa",
    ],
    danger: true,
  },
  {
    id: "04",
    title: "Productos y Servicios Prohibidos",
    content:
      "Vexio prohíbe estrictamente la publicación, venta, distribución o promoción de productos ilegales o que infrinjan derechos de terceros.",
    items: [
      "Productos falsificados o réplicas",
      "Productos robados o ilegales",
      "Productos que infrinjan marcas registradas",
      "Sustancias ilícitas",
      "Contenido ofensivo o discriminatorio",
      "Productos engañosos o fraudulentos",
    ],
  },
  {
    id: "05",
    title: "Falsificaciones y Propiedad Intelectual",
    content:
      "Los usuarios garantizan que todos los productos publicados dentro de Vexio son auténticos y cuentan con autorización legal para su comercialización.",
    items: [
      "Réplicas no autorizadas",
      "Copias ilegales",
      "Productos alterados para aparentar originalidad",
      "Uso indebido de marcas registradas",
    ],
  },
  {
    id: "06",
    title: "Pagos y Seguridad",
    content:
      "Vexio podrá implementar validaciones automáticas de seguridad para prevenir fraudes, actividades sospechosas o usos indebidos dentro de la plataforma.",
  },
  {
    id: "07",
    title: "Suspensión o Eliminación de Cuentas",
    content:
      "Vexio podrá suspender o eliminar cuentas cuando detecte actividades fraudulentas, incumplimientos legales o riesgos de seguridad.",
  },
  {
    id: "08",
    title: "Tratamiento de Datos Personales",
    content:
      "Vexio tratará los datos personales conforme a la legislación colombiana de protección de datos personales.",
  },
  {
    id: "09",
    title: "Limitación de Responsabilidad",
    content:
      "Vexio actúa como plataforma tecnológica intermediaria y no como vendedor directo de los productos publicados por terceros.",
  },
  {
    id: "10",
    title: "Legislación Aplicable",
    content:
      "Estos términos se regirán por las leyes de la República de Colombia, incluyendo la Ley 1480 de 2011, Ley 527 de 1999 y Ley 1581 de 2012.",
  },
];

const VexioTermsPage = () => {
  return (
    <main className="terms-page">
      <div className="terms-container">
        <header className="terms-header">
          <span className="terms-badge">Plataforma Multitienda</span>

          <h1>
            Términos y <span>Condiciones</span>
          </h1>

          <p>
            Bienvenido a Vexio. Al acceder, registrarse o utilizar nuestra
            plataforma, usted acepta los presentes términos y condiciones que
            regulan el uso de nuestros servicios.
          </p>

          <div className="terms-meta">
            <span>Última actualización: 13 de mayo de 2026</span>
            <span>•</span>
            <span>Legislación Colombiana</span>
          </div>
        </header>

        <section className="terms-sections">
          {sections.map((section) => (
            <article className="terms-card" key={section.id}>
              <div className="terms-card-number">{section.id}</div>

              <div className="terms-card-content">
                <h2>{section.title}</h2>

                <p>{section.content}</p>

                {section.items && (
                  <ul
                    className={
                      section.danger ? "terms-list danger" : "terms-list"
                    }
                  >
                    {section.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default VexioTermsPage;
