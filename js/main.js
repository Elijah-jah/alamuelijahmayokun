/* ============================================================
   ELIJAH MAYOKUN — PORTFOLIO
   Cinematic scroll choreography: GSAP ScrollTrigger + Lenis.
   Everything uses gsap.from()/fromTo() — content is visible by
   default and never gated on an animation firing.
   ============================================================ */
(function () {
  'use strict';

  clearTimeout(window.__introKill);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var intro = document.querySelector('.intro');

  /* Typewriter — runs in all modes (it's content, not decoration) */
  (function typewriter() {
    var el = document.getElementById('typewriter');
    if (!el) return;
    if (reduced) return; /* keeps the static HTML text */
    var words = ['Full-Stack Developer', 'Frontend Designer', 'Problem Solver', 'Drummer — Jahsticks007'];
    var wi = 0, ci = 0, del = false;
    function tick() {
      var w = words[wi];
      el.textContent = del ? w.substring(0, ci - 1) : w.substring(0, ci + 1);
      del ? ci-- : ci++;
      var s = del ? 45 : 95;
      if (!del && ci === w.length) { s = 2100; del = true; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; s = 450; }
      setTimeout(tick, s);
    }
    tick();
  })();

  /* ---------- living background: drifting amber embers ---------- */
  (function liveBackground() {
    if (reduced) return;
    var canvas = document.getElementById('live-bg');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, dpr, sparks = [], bokeh = [], running = true, raf = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = Math.floor(window.innerWidth * dpr);
      H = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    function makeSpark(y) {
      return {
        x: Math.random() * W,
        y: y === undefined ? Math.random() * H : y,
        r: (0.5 + Math.random() * 1.9) * dpr,
        vy: (0.10 + Math.random() * 0.30) * dpr,
        sway: (0.3 + Math.random() * 0.9) * dpr,
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.012,
        a: 0.15 + Math.random() * 0.5,
        gold: Math.random() > 0.5
      };
    }

    function makeBokeh() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: (26 + Math.random() * 70) * dpr,
        vx: (Math.random() - 0.5) * 0.06 * dpr,
        vy: (Math.random() - 0.5) * 0.05 * dpr,
        a: 0.025 + Math.random() * 0.04
      };
    }

    function build() {
      var n = Math.min(85, Math.floor(window.innerWidth / 15));
      sparks = [];
      for (var i = 0; i < n; i++) sparks.push(makeSpark());
      bokeh = [];
      for (var j = 0; j < 9; j++) bokeh.push(makeBokeh());
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      var i, b, s, alpha;
      for (i = 0; i < bokeh.length; i++) {
        b = bokeh[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
        var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, 'rgba(255, 174, 0,' + b.a + ')');
        g.addColorStop(1, 'rgba(255, 174, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (i = 0; i < sparks.length; i++) {
        s = sparks[i];
        s.phase += s.speed;
        s.y -= s.vy;
        s.x += Math.sin(s.phase * 3) * 0.15 * dpr;
        alpha = s.a * (0.55 + 0.45 * Math.sin(s.phase * 5));
        if (s.y < -10) { sparks[i] = makeSpark(H + 10); continue; }
        ctx.beginPath();
        ctx.fillStyle = s.gold
          ? 'rgba(255, 209, 102,' + alpha + ')'
          : 'rgba(255, 158, 44,' + alpha + ')';
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) { cancelAnimationFrame(raf); frame(); }
    });
    window.addEventListener('resize', function () { resize(); build(); });

    resize();
    build();
    frame();
  })();

  /* Bail-out path: no GSAP, or user prefers reduced motion.
     The page is fully readable — we only skip the choreography. */
  if (!window.gsap || reduced) {
    if (intro) intro.style.display = 'none';
    var yearEl0 = document.getElementById('year');
    if (yearEl0) yearEl0.textContent = new Date().getFullYear();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ---------- intro → hero entrance ---------- */
  var heroIn = gsap.timeline({ paused: true });
  heroIn
    .from('.hero-badge', { y: 24, opacity: 0, duration: 0.6, ease: 'expo.out' })
    .from('.hero-name .line-inner', { yPercent: 115, duration: 1.05, stagger: 0.12, ease: 'expo.out' }, '-=0.4')
    .from('.typeline', { y: 22, opacity: 0, duration: 0.6, ease: 'expo.out' }, '-=0.6')
    .from('.hero-lead', { y: 30, opacity: 0, duration: 0.7, ease: 'expo.out' }, '-=0.5')
    .from('.hero-actions .btn', { y: 26, opacity: 0, duration: 0.55, stagger: 0.09, ease: 'expo.out' }, '-=0.5')
    .from('.portrait-inner', { clipPath: 'inset(0 0 100% 0)', duration: 1.15, ease: 'expo.inOut' }, 0.35)
    .from('.hero-logo-img', { scale: 1.18, duration: 1.6, ease: 'expo.out' }, 0.6)
    .from('.hero-bg-word', { xPercent: 8, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.5)
    .from('.scroll-cue', { opacity: 0, duration: 0.6 }, '-=0.8');

  var introTl = gsap.timeline({
    onComplete: function () {
      intro.style.display = 'none';
      if (lenis) lenis.start();
    }
  });
  introTl
    .from('.intro-tag', { opacity: 0, y: 14, duration: 0.5, ease: 'power2.out', stagger: 0.1 })
    .from('.intro-name .in', { yPercent: 115, duration: 0.85, stagger: 0.1, ease: 'expo.out' }, '-=0.25')
    .to({}, { duration: 0.35 })
    .to('.intro-name .in', { yPercent: -115, duration: 0.6, stagger: 0.07, ease: 'expo.in' })
    .to('.intro-tag', { opacity: 0, y: -12, duration: 0.35, ease: 'power2.in' }, '<')
    .to(intro, { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, '-=0.15')
    .add(function () {
      heroIn.play();
      /* fresh tween at play-time: avoids from()/immediateRender caching quirks */
      gsap.fromTo('.nav', { yPercent: -120 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' });
    }, '-=0.55');

  /* ---------- hero parallax on scroll-away ---------- */
  gsap.to('.hero-name', {
    yPercent: -18, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero-lead, .hero-actions, .typeline', {
    yPercent: -42, opacity: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true }
  });
  gsap.to('.portrait', {
    yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero-bg-word', {
    xPercent: -14, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ---------- marquees (infinite, scroll-velocity reactive) ---------- */
  var mainMarqueeTween = null;
  document.querySelectorAll('.marquee').forEach(function (mq) {
    var track = mq.querySelector('.marquee-track');
    var dir = mq.dataset.dir === '-1' ? -1 : 1;
    var dur = parseFloat(mq.dataset.speed) || 20;
    var tween = gsap.fromTo(track,
      { xPercent: dir === 1 ? 0 : -50 },
      { xPercent: dir === 1 ? -50 : 0, repeat: -1, ease: 'none', duration: dur });
    if (!mq.classList.contains('footer-marquee')) mainMarqueeTween = tween;
  });

  if (mainMarqueeTween) {
    var settle = null;
    ScrollTrigger.create({
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-4, 4, 1 + self.getVelocity() / 260);
        mainMarqueeTween.timeScale(v);
        if (settle) settle.kill();
        settle = gsap.to(mainMarqueeTween, { timeScale: 1, duration: 0.9, ease: 'power2.out', delay: 0.08 });
      }
    });
  }

  /* ---------- about: word-by-word scrub reveal ---------- */
  document.querySelectorAll('.scrub-words').forEach(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    gsap.fromTo(p.querySelectorAll('.w'),
      { opacity: 0.13 },
      {
        opacity: 1, ease: 'none', stagger: 0.05,
        scrollTrigger: { trigger: p, start: 'top 82%', end: 'top 32%', scrub: true }
      });
  });

  gsap.from('.facts li', {
    y: 44, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.facts', start: 'top 85%' }
  });

  /* ---------- work: pinned horizontal reel (desktop) ---------- */
  var mm = gsap.matchMedia();

  mm.add('(min-width: 900px)', function () {
    var track = document.querySelector('.work-track');
    var progress = document.querySelector('.work-progress span');

    var distance = function () { return track.scrollWidth - window.innerWidth; };

    var reel = gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: '.work',
        start: 'top top',
        end: function () { return '+=' + distance(); },
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (progress) progress.style.transform = 'scaleX(' + self.progress + ')';
        }
      }
    });

    /* inner parallax: giant words drift against the reel */
    gsap.utils.toArray('.p-giant').forEach(function (el) {
      gsap.fromTo(el, { xPercent: 18 }, {
        xPercent: -10, ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.project'),
          containerAnimation: reel,
          start: 'left right',
          end: 'right left',
          scrub: true
        }
      });
    });

    gsap.utils.toArray('.p-body').forEach(function (el) {
      gsap.from(el, {
        y: 60, opacity: 0, duration: 0.9, ease: 'expo.out',
        scrollTrigger: {
          trigger: el.closest('.project'),
          containerAnimation: reel,
          start: 'left 75%'
        }
      });
    });

    gsap.from('.wintro > *', {
      y: 40, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'expo.out',
      scrollTrigger: { trigger: '.work', start: 'top 65%' }
    });
  });

  mm.add('(max-width: 899px)', function () {
    gsap.utils.toArray('.wpanel').forEach(function (panel) {
      gsap.from(panel.children, {
        y: 44, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: panel, start: 'top 78%' }
      });
    });
  });

  /* ---------- connect rows ---------- */
  gsap.from('.cap-row', {
    y: 56, opacity: 0, stagger: 0.09, duration: 0.75, ease: 'expo.out',
    scrollTrigger: { trigger: '.cap-list', start: 'top 80%' }
  });

  /* ---------- footer / contact ---------- */
  gsap.from('.footer-big .line-inner', {
    yPercent: 115, stagger: 0.12, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: '.footer', start: 'top 72%' }
  });
  gsap.from('.footer-sub, .contact-grid .c-row, .footer-cta', {
    y: 30, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'expo.out',
    scrollTrigger: { trigger: '.contact-grid', start: 'top 90%' }
  });

  /* ---------- nav behaviour ---------- */
  var nav = document.querySelector('.nav');
  var lastY = 0;
  var navHidden = false;
  function onScrollPos(y) {
    nav.classList.toggle('nav-scrolled', y > 40);
    var shouldHide = y > lastY && y > 140;
    if (shouldHide !== navHidden) {
      navHidden = shouldHide;
      gsap.to(nav, { yPercent: shouldHide ? -115 : 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
    }
    lastY = y;
  }
  if (lenis) {
    lenis.on('scroll', function (e) { onScrollPos(e.scroll); });
  } else {
    window.addEventListener('scroll', function () { onScrollPos(window.scrollY); }, { passive: true });
  }

  /* ---------- anchor navigation through Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      ev.preventDefault();
      if (lenis) {
        lenis.scrollTo(el, { duration: 1.5, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- housekeeping ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
