/* ============================================================
   PotenciaBR – Main JavaScript (Performance Optimized)
   ============================================================ */

'use strict';

// ─── DOM READY ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // Execute critical logic first
  initNavbar();
  initHamburger();
  initSmoothScroll();
  initMobileEmergencyBar();

  // Delay non-critical logic to allow for FCP/LCP
  requestAnimationFrame(function() {
    initScrollAnimations();
    initTestimonialSlider();
    initCountdownTimer();
    initLeadForm();
    initTiltEffect();
  });
});

// ─── NAVBAR SCROLL ───────────────────────────────────────────
function initNavbar() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.pageYOffset > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

// ─── HAMBURGER MENU ──────────────────────────────────────────
function initHamburger() {
  var btn = document.getElementById('hamburger');
  var links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ─── SCROLL ANIMATIONS (IntersectionObserver Optimized) ─────────────
function initScrollAnimations() {
  var elements = document.querySelectorAll('[data-aos]');
  if (!elements.length || !('IntersectionObserver' in window)) {
    // Fallback if no elements or no observer support
    elements.forEach(function(el) { el.classList.add('animated'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var delay = el.getAttribute('data-aos-delay');
        if (delay) {
          setTimeout(function () { el.classList.add('animated'); }, parseInt(delay, 10));
        } else {
          el.classList.add('animated');
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(function(el) { observer.observe(el); });
}

// ─── TESTIMONIAL SLIDER ───────────────────────────────────────
function initTestimonialSlider() {
  var track  = document.getElementById('testiTrack');
  var dotsWrap = document.getElementById('testiDots');
  var prevBtn  = document.getElementById('testiPrev');
  var nextBtn  = document.getElementById('testiNext');
  if (!track) return;

  var cards = track.querySelectorAll('.testi-card');
  var total = cards.length;
  var current = 0;
  var autoInterval = null;

  function getSlidesPerView() {
    if (window.innerWidth <= 768)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    var dotCount = total - getSlidesPerView() + 1;
    for (var i = 0; i < dotCount; i++) {
      var dot = document.createElement('button');
      dot.className = 'testi-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      (function(idx) {
        dot.addEventListener('click', function () { goTo(idx); });
      })(i);
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    var dots = dotsWrap.querySelectorAll('.testi-dot');
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    var slidesPerView = getSlidesPerView();
    var maxIndex = total - slidesPerView;
    current = Math.max(0, Math.min(index, maxIndex));
    // Cache layouts values for performance
    var cardRect = cards[0].getBoundingClientRect();
    var trackGap = parseInt(getComputedStyle(track).gap || 24, 10);
    var cardWidth = cardRect.width + trackGap;
    track.style.transform = 'translateX(-' + (current * cardWidth) + 'px)';
    updateDots();
  }

  function next() {
    var maxIdx = total - getSlidesPerView();
    goTo(current >= maxIdx ? 0 : current + 1);
  }
  function prev() {
    var maxIdx = total - getSlidesPerView();
    goTo(current <= 0 ? maxIdx : current - 1);
  }

  function startAuto() { stopAuto(); autoInterval = setInterval(next, 5000); }
  function stopAuto()  { if(autoInterval) clearInterval(autoInterval); }

  if (prevBtn) prevBtn.addEventListener('click', function () { stopAuto(); prev(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { stopAuto(); next(); startAuto(); });

  // Touch / swipe using passive listeners
  var touchStartX = 0;
  track.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    startAuto();
  }, { passive: true });

  window.addEventListener('resize', function () {
    buildDots();
    goTo(0);
  }, { passive: true });

  buildDots();
  goTo(0);
  startAuto();
}

// ─── COUNTDOWN TIMER ─────────────────────────────────────────
function initCountdownTimer() {
  var hEl = document.getElementById('timerH');
  var mEl = document.getElementById('timerM');
  var sEl = document.getElementById('timerS');
  if (!hEl || !mEl || !sEl) return;

  var endKey = 'potencia_timer_end';
  var stored = sessionStorage.getItem(endKey);
  var endTime;

  if (stored) {
    endTime = parseInt(stored, 10);
  } else {
    endTime = Date.now() + (2 * 3600 + 47 * 60 + 33) * 1000;
    sessionStorage.setItem(endKey, endTime);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    var remaining = Math.max(0, endTime - Date.now());
    if (remaining <= 0) {
      endTime = Date.now() + (2 * 3600 + 47 * 60 + 33) * 1000;
      sessionStorage.setItem(endKey, endTime);
      return;
    }
    var h = Math.floor(remaining / 3600000);
    var m = Math.floor((remaining % 3600000) / 60000);
    var s = Math.floor((remaining % 60000) / 1000);
    hEl.textContent = pad(h);
    mEl.textContent = pad(m);
    sEl.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
}

// ─── LEAD FORM ────────────────────────────────────────────────
function handleLeadForm(e) {
  e.preventDefault();
  var form    = document.getElementById('leadForm');
  var success = document.getElementById('leadSuccess');
  var btn     = form.querySelector('button[type="submit"]');
  if (!form || !success) return;

  var name  = document.getElementById('leadName').value.trim();
  var email = document.getElementById('leadEmail').value.trim();
  if (!name || !email) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

  setTimeout(function () {
    form.style.display = 'none';
    success.style.display = 'block';
  }, 1200);
}

// ─── TILT EFFECT (De-bounce optimized) ─────────────────────────
function initTiltEffect() {
  if (window.matchMedia('(hover: none)').matches) return;

  var tiltEls = document.querySelectorAll('[data-tilt]');
  tiltEls.forEach(function (el) {
    var rect = null;
    el.addEventListener('mouseenter', function() {
      rect = el.getBoundingClientRect();
    }, { passive: true });

    el.addEventListener('mousemove', function (e) {
      if (!rect) rect = el.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width  - 0.5;
      var y = (e.clientY - rect.top)  / rect.height - 0.5;
      el.style.transform = 'perspective(800px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 6) + 'deg) translateZ(6px)';
    }, { passive: true });

    el.addEventListener('mouseleave', function () {
      el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
      rect = null;
    }, { passive: true });
  });
}

// ─── SMOOTH SCROLL ────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var navbarH = (document.getElementById('navbar') || {}).offsetHeight || 70;
      var top = target.getBoundingClientRect().top + window.pageYOffset - navbarH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
}

// ─── MOBILE EMERGENCY BAR ─────────────────────────────────────
function initMobileEmergencyBar() {
  var bar = document.getElementById('mobileEmergencyBar');
  if (!bar) return;
  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) {
      bar.style.opacity = '1';
    }
  }, { passive: true });
}

// ─── EXPOSE GLOBAL HANDLER ─────────────────────────────────────
window.handleLeadForm = handleLeadForm;

// ─── DOWNLOAD REGULATION ────────────────────────
var dlBtn = document.getElementById('downloadRegBtn');
if (dlBtn) {
  dlBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var leadSection = document.getElementById('lead');
    if (leadSection) {
      leadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}