/* ============================================================
   CONDADO BARBEARIA — profissionais.js v3
   1. Footer year
   2. Pro card: parallax foto
   3. Observers: pro-card, valor-item, destaque-card, label, footer, cta
   ============================================================ */

(function () {
  'use strict';

  const PRM      = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = navigator.maxTouchPoints > 0;

  /* ─── 1. FOOTER YEAR ─── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── 2. PRO CARD PARALLAX ─── */
  if (!PRM && !IS_TOUCH) {
    document.querySelectorAll('.pro-card').forEach((card) => {
      const img = card.querySelector('.pro-card__photo img');
      if (!img) return;
      let raf, tx = 0, ty = 0, cx = 0, cy = 0;
      const lerp = (a, b, t) => a + (b - a) * t;
      const tick = () => {
        cx = lerp(cx, tx, 0.09);
        cy = lerp(cy, ty, 0.09);
        img.style.transform = `scale(1.08) translate(${cx}px, ${cy}px)`;
        raf = requestAnimationFrame(tick);
      };
      card.addEventListener('mouseenter', () => tick());
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        tx = -((e.clientX - r.left) / r.width  - 0.5) * 16;
        ty = -((e.clientY - r.top)  / r.height - 0.5) * 12;
      });
      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        img.style.transition = 'transform 1.2s cubic-bezier(0.2,0.8,0.2,1)';
        img.style.transform  = 'scale(1)';
        tx = ty = cx = cy = 0;
        setTimeout(() => { img.style.transition = ''; }, 1200);
      });
    });
  }

  /* ─── 3. OBSERVER HELPER ─── */
  function observe(selector, opts) {
    if (!('IntersectionObserver' in window) || PRM) {
      document.querySelectorAll(selector).forEach(el => el.classList.add('in-view'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, opts);
    document.querySelectorAll(selector).forEach(el => obs.observe(el));
  }

  observe('.pro-card',          { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  observe('.valor-item',        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  observe('.destaque-card',     { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });
  observe('.destaques-label',   { threshold: 0.3  });
  observe('.destaques-footer',  { threshold: 0.3  });
  observe('.cta-wrap',          { threshold: 0.2  });

  /* ─── 4. DESTAQUE CARD — tilt 3D leve no hover (desktop) ─── */
  if (!PRM && !IS_TOUCH) {
    document.querySelectorAll('.destaque-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top)  / r.height - 0.5) * 6;
        const ry = ((e.clientX - r.left) / r.width  - 0.5) * -6;
        card.style.transform = `translateY(-6px) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1), border-color 0.4s ease';
        card.style.transform  = 'translateY(0) perspective(600px) rotateX(0deg) rotateY(0deg)';
        setTimeout(() => { card.style.transition = ''; }, 600);
      });
    });
  }

  /* ─── 5. DOTS DE SCROLL — mobile ─── */
  const dotsWrap = document.getElementById('destaquesDots');
  const grid     = document.querySelector('.destaques-grid');

  if (dotsWrap && grid) {
    const dots  = dotsWrap.querySelectorAll('.destaques-dots__dot');
    const cards = grid.querySelectorAll('.destaque-card');

    /* mostra os dots só quando o layout for scroll (≤720px) */
    const mq = window.matchMedia('(max-width: 720px)');

    function initDots(show) {
      dotsWrap.style.display = show ? 'flex' : 'none';
    }

    initDots(mq.matches);
    mq.addEventListener('change', (e) => initDots(e.matches));

    /* atualiza o dot ativo baseado no scroll */
    let scrollRaf;
    grid.addEventListener('scroll', () => {
      cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const gridLeft = grid.getBoundingClientRect().left;
        let closest = 0;
        let minDist  = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(card.getBoundingClientRect().left - gridLeft);
          if (dist < minDist) { minDist = dist; closest = i; }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === closest));
      });
    }, { passive: true });

    /* clica no dot → scroll suave até o card */
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const card = cards[i];
        if (!card) return;
        const offset = card.offsetLeft - grid.offsetLeft;
        grid.scrollTo({ left: offset, behavior: 'smooth' });
      });
    });
  }

})();