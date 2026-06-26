/* ============================================================
   CONDADO BARBEARIA — cortes.js
   Scripts exclusivos da página de cortes
   ============================================================ */

(function () {
  'use strict';

  const PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── NAVBAR (reusa a lógica do index.js via id mobileToggle) ─── */
  // index.js já inicializa o toggle; só garantimos o footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── PRICE COUNTER — tabela ─── */
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

  /* ─── CARD SHINE (3D tilt) ─── */
  const IS_TOUCH = navigator.maxTouchPoints > 0;

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

  /* ─── TABELA ROW STAGGER ON ENTER ─── */
  if (!PRM && 'IntersectionObserver' in window) {
    const rows = document.querySelectorAll('.tabela tbody tr');
    const obs  = new IntersectionObserver((entries) => {
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
        obs.disconnect();
      }
    }, { threshold: 0.2 });

    const table = document.querySelector('.tabela-wrap');
    if (table) obs.observe(table);
  }

})();

(function () {
  'use strict';

  const PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── FOOTER YEAR ─── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── PRICE COUNTER — tabela ─── */
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

    document.querySelectorAll('.t-price').forEach((el) => priceObs.observe(el));
  }

  /* ─── TABELA ROW STAGGER ON ENTER ─── */
  if (!PRM && 'IntersectionObserver' in window) {
    const rows = document.querySelectorAll('.tabela tbody tr');
    const obs  = new IntersectionObserver((entries) => {
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
        obs.disconnect();
      }
    }, { threshold: 0.2 });

    const table = document.querySelector('.tabela-wrap');
    if (table) obs.observe(table);
  }

  
   /* Carrossel*/


  const track    = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const btnPrev  = document.getElementById('carouselPrev');
  const btnNext  = document.getElementById('carouselNext');

  if (!track || !dotsWrap || !btnPrev || !btnNext) return;

  const slides    = Array.from(track.querySelectorAll('.carousel-slide'));
  const TOTAL     = slides.length;
  let   current   = 0;
  let   isDragging  = false;
  let   startX      = 0;
  let   startScroll = 0;
  let   hasDragged  = false;

  /* Quantos slides visíveis por breakpoint */
  function getVisibleCount () {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 980)  return 2;
    return 3;
  }

  /* Largura de um slide + gap */
  function slideStride () {
    const gap = window.innerWidth <= 640 ? 16 : 20;
    return slides[0].getBoundingClientRect().width + gap;
  }

  /* Ir para índice */
  function goTo (index, instant) {
    const maxIndex = Math.max(0, TOTAL - getVisibleCount());
    current = Math.max(0, Math.min(index, maxIndex));

    const offset = current * slideStride();

    if (instant || PRM) {
      track.style.transition = 'none';
      track.style.transform  = `translateX(-${offset}px)`;
      track.getBoundingClientRect(); // força reflow
      track.style.transition = '';
    } else {
      track.style.transform = `translateX(-${offset}px)`;
    }

    updateDots();
    updateArrows();
  }

  /* Dots */
  function buildDots () {
    dotsWrap.innerHTML = '';
    const maxIndex = Math.max(0, TOTAL - getVisibleCount());

    for (let i = 0; i <= maxIndex; i++) {
      const btn = document.createElement('button');
      btn.className = 'carousel-dot';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Ir para slide ${i + 1}`);
      btn.setAttribute('aria-selected', i === current ? 'true' : 'false');
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }

    updateDots();
  }

  function updateDots () {
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  function updateArrows () {
    const maxIndex   = Math.max(0, TOTAL - getVisibleCount());
    btnPrev.disabled = current === 0;
    btnNext.disabled = current >= maxIndex;
  }

  /* Botões */
  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  /* Teclado — só ativa quando o carrossel está visível */
  document.addEventListener('keydown', (e) => {
    const viewport = document.querySelector('.carousel-viewport');
    if (!viewport) return;
    const rect   = viewport.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  /* Drag / Swipe com Pointer Events */
  const viewport = document.querySelector('.carousel-viewport');

  function onPointerDown (e) {
    if (e.button !== 0 && e.pointerType !== 'touch') return;
    isDragging  = true;
    hasDragged  = false;
    startX      = e.clientX;
    startScroll = current * slideStride();
    track.style.transition = 'none';
    viewport.setPointerCapture(e.pointerId);
  }

  function onPointerMove (e) {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 4) hasDragged = true;
    track.style.transform = `translateX(-${startScroll - delta}px)`;
  }

  function onPointerUp (e) {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    const delta = e.clientX - startX;
    if (hasDragged) {
      if (delta < -60)      goTo(current + 1);
      else if (delta > 60)  goTo(current - 1);
      else                  goTo(current);
    }
  }

  viewport.addEventListener('pointerdown',   onPointerDown);
  viewport.addEventListener('pointermove',   onPointerMove);
  viewport.addEventListener('pointerup',     onPointerUp);
  viewport.addEventListener('pointercancel', () => {
    if (isDragging) { isDragging = false; goTo(current); }
  });

  /* Bloqueia clique após arrastar */
  viewport.addEventListener('click', (e) => {
    if (hasDragged) e.stopPropagation();
  }, true);

  /* Eyebrow underline ao entrar na viewport */
  const eyebrow = document.querySelector('.carousel-section .section-eyebrow');
  if (eyebrow && 'IntersectionObserver' in window) {
    const obsEyebrow = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        eyebrow.classList.add('is-visible');
        obsEyebrow.disconnect();
      }
    }, { threshold: 0.5 });
    obsEyebrow.observe(eyebrow);
  } else if (eyebrow) {
    eyebrow.classList.add('is-visible');
  }

  /* Resize — reconstrói dots e reposiciona */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(current, true);
    }, 150);
  });

  /* Init */
  buildDots();
  goTo(0, true);

})();