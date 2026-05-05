import { useEffect } from 'react';

/**
 * useScrollAnimation
 * Observa todos los elementos con la clase "fade-in-section"
 * y les agrega/quita "is-visible" según el scroll.
 *
 * Úsalo UNA SOLA VEZ en tu componente raíz (App.jsx)
 */
export function useScrollAnimation(threshold = 0.15) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold }
    );

    // Observa los elementos que ya existen al montar
    const observe = () => {
      document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
    };

    observe();

    // MutationObserver: detecta nuevos elementos añadidos al DOM
    // (útil para páginas con rutas dinámicas)
    const mutationObserver = new MutationObserver(() => {
      document.querySelectorAll('.fade-in-section:not([data-observed])').forEach(el => {
        el.setAttribute('data-observed', 'true');
        observer.observe(el);
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [threshold]);
}