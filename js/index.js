/* ============================================================
   CONDADO BARBEARIA — Scripts v3
   ------------------------------------------------------------
   1.  Feature detection & constants
   2.  Mobile menu
   3.  Navbar scroll state
   4.  Active link tracking
   5.  Custom cursor with magnetic pull
   6.  Hero parallax (GPU-composited)
   7.  Text split — hero title character reveal
   8.  Scroll reveal with stagger
   9.  Card 3D tilt
   10. Price counter animation
   11. Feedback carousel (redesenhado)
   12. Scroll progress bar
   13. Gallery cinematic parallax on hover
   14. Footer year
   15. Section eyebrow line draw
   16. Hero ambient mouse movement
   ============================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     1. FEATURE DETECTION & CONSTANTS
  ───────────────────────────────────────────────────────── */
  const PRM      = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = navigator.maxTouchPoints > 0;
  const IS_MOBILE = window.innerWidth < 768;

  /* ─────────────────────────────────────────────────────────
     2. MOBILE MENU
  ───────────────────────────────────────────────────────── */
  const toggle  = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navLinks');
  const navbar  = document.querySelector('.navbar');

  const closeMenu = () => {
    navMenu?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    navMenu?.classList.add('open');
    toggle?.setAttribute('aria-expanded', 'true');
  };

  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu?.classList.contains('open') ? closeMenu() : openMenu();
  });

  document.addEventListener('click', (e) => {
    if (navMenu?.classList.contains('open') && !navbar?.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  document.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => {
      document.querySelectorAll('.nav-links a').forEach((x) => x.classList.remove('active'));
      a.classList.add('active');
      closeMenu();
    });
  });

  /* ─────────────────────────────────────────────────────────
     3. NAVBAR SCROLL STATE
  ───────────────────────────────────────────────────────── */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar?.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ─────────────────────────────────────────────────────────
     4. ACTIVE LINK TRACKING
  ───────────────────────────────────────────────────────── */
  const navAnchors = document.querySelectorAll('.nav-links a');
  const sections   = [...document.querySelectorAll('section[id], header[id]')]
    .filter((el) => document.querySelector(`.nav-links a[href="#${el.id}"]`));

  if (sections.length && 'IntersectionObserver' in window) {
    sections.forEach((s) =>
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          navAnchors.forEach((a) =>
            a.classList.toggle('active', a.getAttribute('href') === `#${s.id}`)
          );
        }
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 }).observe(s)
    );
  }

  /* ─────────────────────────────────────────────────────────
     5. CUSTOM CURSOR WITH MAGNETIC PULL
  ───────────────────────────────────────────────────────── */
  if (!PRM && !IS_TOUCH) {
    const cursor    = document.createElement('div');
    const cursorDot = document.createElement('div');
    cursor.className    = 'c-cursor';
    cursorDot.className = 'c-cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    let cx = -100, cy = -100;
    let dx = -100, dy = -100;

    const lerp = (a, b, t) => a + (b - a) * t;

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
      cursorDot.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    });

    const tick = () => {
      dx = lerp(dx, cx, 0.14);
      dy = lerp(dy, cy, 0.14);
      cursor.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    const MAGNETS = document.querySelectorAll(
      '.btn-ghost, .icon-btn, .mobile-toggle, .footer-link, .brand-mark'
    );

    MAGNETS.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hovering');
        el.style.transform = '';
      });
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width  / 2);
        const relY = e.clientY - (rect.top  + rect.height / 2);
        el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.25}px)`;
      });
    });

    document.querySelectorAll('.card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-card'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-card'));
    });
  }

  /* ─────────────────────────────────────────────────────────
     6. HERO PARALLAX
  ───────────────────────────────────────────────────────── */
  if (!PRM && !IS_MOBILE) {
    const heroEl = document.querySelector('.hero');
    let scrollY  = 0;
    let rafPx;

    const updateParallax = () => {
      const offset = scrollY * 0.4;
      if (heroEl) heroEl.style.backgroundPositionY = `calc(center + ${offset}px)`;
      rafPx = null;
    };

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
      if (!rafPx) rafPx = requestAnimationFrame(updateParallax);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────
     7. TEXT SPLIT — HERO TITLE CHARACTER REVEAL
  ───────────────────────────────────────────────────────── */
  const splitAndAnimate = () => {
    const titleLines = document.querySelectorAll('.hero-title .line');
    if (!titleLines.length) return;

    titleLines.forEach((line, lineIdx) => {
      let charIdx = 0;

      const wrapText = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent.split('').map((ch) => {
            if (ch === ' ') return ' ';
            const delay = (lineIdx * 6 + charIdx++) * 38;
            return `<span class="char" style="--cd:${delay}ms">${ch}</span>`;
          }).join('');
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const clone = node.cloneNode(false);
          let inner = '';
          node.childNodes.forEach((child) => { inner += wrapText(child); });
          clone.innerHTML = inner;
          return clone.outerHTML;
        }
        return '';
      };

      if (!PRM) {
        let result = '';
        line.childNodes.forEach((child) => { result += wrapText(child); });
        line.innerHTML = result;
        line.style.animation = 'none';
        line.style.overflow   = 'hidden';
      }
    });
  };

  splitAndAnimate();

  /* ─────────────────────────────────────────────────────────
     8. SCROLL REVEAL WITH STAGGER
  ───────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el) => {
      if (!PRM) obs.observe(el);
      else el.classList.add('in-view');
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ─────────────────────────────────────────────────────────
     9. CARD 3D TILT
  ───────────────────────────────────────────────────────── */
  if (!PRM && !IS_TOUCH) {
    document.querySelectorAll('.card').forEach((card) => {
      const INTENSITY = 12;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x    = (e.clientX - rect.left) / rect.width  - 0.5;
        const y    = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateX(${-y * INTENSITY}deg) rotateY(${x * INTENSITY}deg) translateY(-6px)`;

        const shine = card.querySelector('.card-shine');
        if (shine) {
          shine.style.opacity   = '1';
          shine.style.transform = `translate(${x * 100 + 50}%, ${y * 100 + 50}%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.2,0.9,0.2,1)';
        card.style.transform  = '';
        setTimeout(() => { card.style.transition = ''; }, 600);
        const shine = card.querySelector('.card-shine');
        if (shine) shine.style.opacity = '0';
      });

      const shine = document.createElement('div');
      shine.className = 'card-shine';
      card.appendChild(shine);
    });
  }

  /* ─────────────────────────────────────────────────────────
     10. PRICE COUNTER ANIMATION
  ───────────────────────────────────────────────────────── */
  const animateCounter = (el) => {
    const text    = el.textContent.trim();
    const match   = text.match(/\d+/);
    if (!match) return;
    const target  = parseInt(match[0], 10);
    const prefix  = text.slice(0, text.indexOf(match[0]));
    const suffix  = text.slice(text.indexOf(match[0]) + match[0].length);
    const duration = 900;
    const startTime = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      el.textContent = `${prefix}${Math.round(ease(progress) * target)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && !PRM) {
    const priceObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          priceObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.8 });

    document.querySelectorAll('.card-price').forEach((el) => priceObs.observe(el));
  }

  /* ─────────────────────────────────────────────────────────
     11. FEEDBACK CAROUSEL — redesenhado
  ───────────────────────────────────────────────────────── */
  (function initFeedbackCarousel () {
    const track    = document.getElementById('fbTrack');
    const dotsWrap = document.getElementById('fbDots');
    const btnPrev  = document.getElementById('fbPrev');
    const btnNext  = document.getElementById('fbNext');
    const elCur    = document.getElementById('fbCounterCur');
    const elTotal  = document.getElementById('fbCounterTotal');

    if (!track || !dotsWrap || !btnPrev || !btnNext) return;

    const cards  = Array.from(track.querySelectorAll('.fb-card'));
    const TOTAL  = cards.length;
    let   current   = 0;
    let   isDragging  = false;
    let   startX      = 0;
    let   startOffset = 0;
    let   hasDragged  = false;

    /* Total exibido com zero à esquerda */
    if (elTotal) elTotal.textContent = String(TOTAL).padStart(2, '0');

    /* Quantos visíveis por breakpoint */
    function getVisible () {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 980) return 2;
      return 3;
    }

    /* Passo: largura do card + gap */
    function stride () {
      const gap = window.innerWidth <= 640 ? 16 : 22;
      return cards[0].getBoundingClientRect().width + gap;
    }

    /* Navega para índice */
    function goTo (index, instant) {
      const max = Math.max(0, TOTAL - getVisible());
      current   = Math.max(0, Math.min(index, max));

      const offset = current * stride();

      if (instant || PRM) {
        track.style.transition = 'none';
        track.style.transform  = `translateX(-${offset}px)`;
        track.getBoundingClientRect(); // força reflow
        track.style.transition = '';
      } else {
        track.style.transform = `translateX(-${offset}px)`;
      }

      syncUI();
    }

    /* Sincroniza dots, setas e counter */
    function syncUI () {
      const max = Math.max(0, TOTAL - getVisible());

      /* Dots */
      dotsWrap.querySelectorAll('.fb-dot').forEach((d, i) => {
        const active = i === current;
        d.classList.toggle('is-active', active);
        d.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      /* Setas */
      btnPrev.disabled = current === 0;
      btnNext.disabled = current >= max;

      /* Counter */
      if (elCur) elCur.textContent = String(current + 1).padStart(2, '0');
    }

    /* Constrói dots */
    function buildDots () {
      dotsWrap.innerHTML = '';
      const max = Math.max(0, TOTAL - getVisible());

      for (let i = 0; i <= max; i++) {
        const btn = document.createElement('button');
        btn.className = 'fb-dot';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', `Foto ${i + 1}`);
        btn.setAttribute('aria-selected', i === current ? 'true' : 'false');
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      }

      syncUI();
    }

    /* Botões */
    btnPrev.addEventListener('click', () => goTo(current - 1));
    btnNext.addEventListener('click', () => goTo(current + 1));

    /* Teclado — só quando o stage está visível */
    document.addEventListener('keydown', (e) => {
      const stage = document.querySelector('.fb-stage');
      if (!stage) return;
      const rect   = stage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    /* Drag / Swipe com Pointer Events */
    const stage = document.querySelector('.fb-stage');
    if (!stage) return;

    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType !== 'touch') return;
      isDragging  = true;
      hasDragged  = false;
      startX      = e.clientX;
      startOffset = current * stride();
      track.style.transition = 'none';
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 4) hasDragged = true;
      track.style.transform = `translateX(-${startOffset - delta}px)`;
    });

    stage.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = '';
      const delta = e.clientX - startX;
      if (hasDragged) {
        if (delta < -60)     goTo(current + 1);
        else if (delta > 60) goTo(current - 1);
        else                 goTo(current);
      }
    });

    stage.addEventListener('pointercancel', () => {
      if (isDragging) { isDragging = false; goTo(current); }
    });

    /* Bloqueia clique-acidental pós-drag */
    stage.addEventListener('click', (e) => {
      if (hasDragged) e.stopPropagation();
    }, true);

    /* Auto-play suave — avança a cada 4s, pausa no hover */
    let autoTimer;
    if (!PRM) {
      const startAuto = () => {
        autoTimer = setInterval(() => {
          const max = Math.max(0, TOTAL - getVisible());
          goTo(current >= max ? 0 : current + 1);
        }, 4000);
      };

      const stopAuto = () => clearInterval(autoTimer);

      stage.addEventListener('mouseenter', stopAuto);
      stage.addEventListener('mouseleave', startAuto);
      stage.addEventListener('pointerdown', stopAuto);
      stage.addEventListener('pointerup',   () => { stopAuto(); startAuto(); });

      startAuto();
    }

    /* Resize */
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

  /* ─────────────────────────────────────────────────────────
     12. SCROLL PROGRESS BAR
  ───────────────────────────────────────────────────────── */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct       = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progress.style.setProperty('--p', `${pct}%`);
    });
  }, { passive: true });

  /* ─────────────────────────────────────────────────────────
     13. GALLERY CINEMATIC PARALLAX ON HOVER
  ───────────────────────────────────────────────────────── */
  if (!PRM) {
    document.querySelectorAll('.gallery-main, .gallery-side').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x    = (e.clientX - rect.left) / rect.width  - 0.5;
        const y    = (e.clientY - rect.top)  / rect.height - 0.5;
        const img  = card.querySelector('.gallery-img');
        if (img) img.style.transform = `scale(1.08) translate(${x * 22}px, ${y * 22}px)`;
      });

      card.addEventListener('mouseleave', () => {
        const img = card.querySelector('.gallery-img');
        if (img) {
          img.style.transition = 'transform 1.4s cubic-bezier(0.2,0.8,0.2,1)';
          img.style.transform  = 'scale(1)';
          setTimeout(() => { if (img) img.style.transition = ''; }, 1400);
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     14. FOOTER YEAR
  ───────────────────────────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─────────────────────────────────────────────────────────
     15. SECTION EYEBROW LINE DRAW
  ───────────────────────────────────────────────────────── */
  if (!PRM && 'IntersectionObserver' in window) {
    const eyeObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('line-drawn');
          eyeObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.section-eyebrow').forEach((el) => eyeObs.observe(el));
  }

  /* ─────────────────────────────────────────────────────────
     16. HERO AMBIENT MOUSE MOVEMENT
  ───────────────────────────────────────────────────────── */
  if (!PRM && !IS_TOUCH && !IS_MOBILE) {
    const heroEl2 = document.querySelector('.hero');
    let hx = 50, hy = 50;
    let thx = 50, thy = 50;

    document.addEventListener('mousemove', (e) => {
      thx = (e.clientX / window.innerWidth)  * 100;
      thy = (e.clientY / window.innerHeight) * 100;
    });

    const animHero = () => {
      hx += (thx - hx) * 0.05;
      hy += (thy - hy) * 0.05;
      heroEl2?.style.setProperty('--mx', `${hx}%`);
      heroEl2?.style.setProperty('--my', `${hy}%`);
      requestAnimationFrame(animHero);
    };
    animHero();
  }

})();