/**
 * Design System — RD Station CRM
 * JavaScript autocontido apenas para design-system.html.
 * Não depende de outros arquivos ou bibliotecas.
 */
(function () {
  'use strict';

  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /** Smooth scroll para âncoras dentro da página */
  function initSmoothScroll() {
    document.querySelectorAll('.ds-nav a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /** Inicialização */
  whenReady(function () {
    initSmoothScroll();
  });
})();
