(function () {
  'use strict';

  const PRM      = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = navigator.maxTouchPoints > 0;

  // ─── Ano no footer ──────────────────────────────────────────────────────────

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ─── Contador animado nos preços (cards + tabela) ────────────────────────────

  const animateCounter = (el) => {
    const text   = el.textContent.trim();
    const match  = text.match(/\d+/);
    if (!match) return;

    const target   = parseInt(match[0], 10);
    const prefix   = text.slice(0, text.indexOf(match[0]));
    const suffix   = text.slice(text.indexOf(match[0]) + match[0].length);
    const duration = 800;
    const start    = performance.now();
    const ease     = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = `${prefix}${Math.round(ease(progress) * target)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (!PRM && 'IntersectionObserver' in window) {
    const priceObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          priceObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.8 });

    document.querySelectorAll('.corte-price, .t-price').forEach((el) => priceObs.observe(el));
  }

  // ─── Tilt 3D leve nos cards de corte ─────────────────────────────────────────

  if (!PRM && !IS_TOUCH) {
    document.querySelectorAll('.corte-card').forEach((card) => {
      const INTENSITY = 10;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x    = (e.clientX - rect.left) / rect.width  - 0.5;
        const y    = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateX(${-y * INTENSITY}deg) rotateY(${x * INTENSITY}deg) translateY(-7px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.2,0.9,0.2,1)';
        card.style.transform  = '';
        setTimeout(() => { card.style.transition = ''; }, 600);
      });
    });
  }

  // ─── Linhas da tabela entram em stagger ao rolar ──────────────────────────────

  if (!PRM && 'IntersectionObserver' in window) {
    const rows   = document.querySelectorAll('.tabela tbody tr');
    const tblObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        rows.forEach((row, i) => {
          row.style.opacity   = '0';
          row.style.transform = 'translateX(-14px)';
          setTimeout(() => {
            row.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.2,0.9,0.2,1)';
            row.style.opacity    = '1';
            row.style.transform  = 'translateX(0)';
          }, i * 70);
        });
        tblObs.disconnect();
      }
    }, { threshold: 0.2 });

    const tableWrap = document.querySelector('.tabela-wrap');
    if (tableWrap) tblObs.observe(tableWrap);
  }

  // ─── Carrossel de cortes ──────────────────────────────────────────────────────
  // Mesma lógica de detecção de eixo do fb-carousel do index.js:
  // só bloqueia o scroll nativo quando o gesto é claramente horizontal.

  const track    = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const btnPrev  = document.getElementById('carouselPrev');
  const btnNext  = document.getElementById('carouselNext');

  if (!track || !dotsWrap || !btnPrev || !btnNext) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const TOTAL  = slides.length;

  let current      = 0;
  let isDragging   = false;
  let startX       = 0;
  let startY       = 0;
  let startOff     = 0;
  let hasDragged   = false;
  let isHorizontal = null;

  const getVisible = () => {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 980)  return 2;
    return 3;
  };

  const slideStride = () => {
    const gap = window.innerWidth <= 640 ? 16 : 20;
    return slides[0].getBoundingClientRect().width + gap;
  };

  const goTo = (index, instant = false) => {
    const max = Math.max(0, TOTAL - getVisible());
    current   = Math.max(0, Math.min(index, max));
    const offset = current * slideStride();

    if (instant || PRM) {
      track.style.transition = 'none';
      track.style.transform  = `translateX(-${offset}px)`;
      track.getBoundingClientRect();
      track.style.transition = '';
    } else {
      track.style.transform = `translateX(-${offset}px)`;
    }

    syncUI();
  };

  const syncUI = () => {
    const max = Math.max(0, TOTAL - getVisible());

    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    btnPrev.disabled = current === 0;
    btnNext.disabled = current >= max;
  };

  const buildDots = () => {
    dotsWrap.innerHTML = '';
    const max = Math.max(0, TOTAL - getVisible());

    for (let i = 0; i <= max; i++) {
      const btn = document.createElement('button');
      btn.className = 'carousel-dot';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Ir para slide ${i + 1}`);
      btn.setAttribute('aria-selected', i === current ? 'true' : 'false');
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }

    syncUI();
  };

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  // Teclas só quando o carrossel está visível
  document.addEventListener('keydown', (e) => {
    const vp   = document.querySelector('.carousel-viewport');
    if (!vp) return;
    const rect   = vp.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  const viewport = document.querySelector('.carousel-viewport');
  if (!viewport) return;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType !== 'touch') return;
    isDragging   = true;
    hasDragged   = false;
    isHorizontal = null;
    startX       = e.clientX;
    startY       = e.clientY;
    startOff     = current * slideStride();
    track.style.transition = 'none';
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (isHorizontal === null && (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4)) {
      isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    }

    // Gesto vertical: cancela o drag e deixa a página rolar normalmente
    if (isHorizontal === false) {
      isDragging = false;
      track.style.transition = '';
      track.style.transform  = `translateX(-${startOff}px)`;
      return;
    }

    if (isHorizontal) {
      e.preventDefault();
      if (Math.abs(deltaX) > 4) hasDragged = true;
      track.style.transform = `translateX(-${startOff - deltaX}px)`;
    }
  }, { passive: false });

  viewport.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';

    const deltaX = e.clientX - startX;
    if (hasDragged) {
      if (deltaX < -60)     goTo(current + 1);
      else if (deltaX > 60) goTo(current - 1);
      else                  goTo(current);
    }
  });

  viewport.addEventListener('pointercancel', () => {
    if (isDragging) { isDragging = false; goTo(current); }
  });

  // Bloqueia o click disparado imediatamente após um drag
  viewport.addEventListener('click', (e) => {
    if (hasDragged) e.stopPropagation();
  }, true);

  // Eyebrow underline ao entrar na viewport
  const eyebrow = document.querySelector('.carousel-section .section-eyebrow');
  if (eyebrow && 'IntersectionObserver' in window) {
    const eyeObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        eyebrow.classList.add('is-visible');
        eyeObs.disconnect();
      }
    }, { threshold: 0.5 });
    eyeObs.observe(eyebrow);
  } else if (eyebrow) {
    eyebrow.classList.add('is-visible');
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(current, true);
    }, 150);
  });

  buildDots();
  goTo(0, true);

})();