(function () {
  'use strict';

  const PRM      = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = navigator.maxTouchPoints > 0;

  // ─── Ano no footer ──────────────────────────────────────────────────────────

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ─── Parallax da foto no pro-card (desktop) ──────────────────────────────────
  // A foto acompanha o mouse com um lerp suave para evitar jank.

  if (!PRM && !IS_TOUCH) {
    document.querySelectorAll('.pro-card').forEach((card) => {
      const img = card.querySelector('.pro-card__photo img');
      if (!img) return;

      let raf;
      let tx = 0, ty = 0;
      let cx = 0, cy = 0;
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

  // ─── IntersectionObserver genérico para revelar elementos ────────────────────
  // Centraliza a lógica de reveal para não repetir código em cada selector.

  function observeReveal(selector, opts) {
    if (!('IntersectionObserver' in window) || PRM) {
      document.querySelectorAll(selector).forEach((el) => el.classList.add('in-view'));
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

    document.querySelectorAll(selector).forEach((el) => obs.observe(el));
  }

  observeReveal('.pro-card',         { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  observeReveal('.valor-item',       { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  observeReveal('.destaque-card',    { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });
  observeReveal('.destaques-label',  { threshold: 0.3 });
  observeReveal('.destaques-footer', { threshold: 0.3 });
  observeReveal('.cta-wrap',         { threshold: 0.2 });

  // ─── Tilt 3D leve nos destaque-cards (desktop) ───────────────────────────────

  if (!PRM && !IS_TOUCH) {
    document.querySelectorAll('.destaque-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top)  / r.height - 0.5) *  6;
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

  // ─── Dots de navegação da galeria (mobile) ────────────────────────────────────
  // Só aparecem no breakpoint ≤720px. O dot ativo é calculado pelo scroll do grid.

  const dotsWrap = document.getElementById('destaquesDots');
  const grid     = document.querySelector('.destaques-grid');

  if (dotsWrap && grid) {
    const dots  = dotsWrap.querySelectorAll('.destaques-dots__dot');
    const cards = grid.querySelectorAll('.destaque-card');
    const mq    = window.matchMedia('(max-width: 720px)');

    const toggleDots = (show) => { dotsWrap.style.display = show ? 'flex' : 'none'; };
    toggleDots(mq.matches);
    mq.addEventListener('change', (e) => toggleDots(e.matches));

    // Atualiza o dot ativo com base em qual card está mais próximo da borda esquerda do grid
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

    // Clique no dot → scroll suave até o card correspondente
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