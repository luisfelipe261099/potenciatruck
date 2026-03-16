/* ============================================================
   POTÊNCIA BR – Interactive Savings Calculator
   ============================================================ */

'use strict';

(function () {

  // ── Pricing model ────────────────────────────────────────────────
  // Monthly rate: base % of FIPE value, with vehicle type multipliers
  var BASE_RATE = 0.0030;  // 0.30% of FIPE per month for cars

  var TYPE_MULTIPLIER = { car: 1.0, suv: 1.12, moto: 0.88 };
  var COVERAGE_ADD    = { third: 18, nature: 14, assist: 9 };

  // Traditional insurance estimate: ~0.35% of FIPE/month
  var TRAD_RATE = 0.0055;  // ~0.55% of FIPE/month for traditional insurance

  var currentType = 'car';

  // ── Elements ─────────────────────────────────────────────────────
  var slider      = document.getElementById('carValueSlider');
  var sliderFill  = document.getElementById('sliderFill');
  var valDisplay  = document.getElementById('carValueDisplay');
  var priceDisplay = document.getElementById('monthlyPrice');
  var savingsVal  = document.getElementById('savingsVal');
  var vTypeBtns   = document.querySelectorAll('.vtype-btn');
  var covThird    = document.getElementById('covThird');
  var covNature   = document.getElementById('covNature');
  var covAssist   = document.getElementById('covAssist');

  if (!slider) return;

  // ── Utility: format BRL number ───────────────────────────────────
  function fmtBRL(n) {
    return n.toLocaleString('pt-BR');
  }

  // ── Calculate monthly price ──────────────────────────────────────
  function calcMonthly(fipe) {
    var base = Math.round(fipe * BASE_RATE * TYPE_MULTIPLIER[currentType]);
    var add  = 0;
    if (covThird  && covThird.checked)  add += COVERAGE_ADD.third;
    if (covNature && covNature.checked) add += COVERAGE_ADD.nature;
    if (covAssist && covAssist.checked) add += COVERAGE_ADD.assist;
    return base + add;
  }

  // ── Calculate annual savings vs traditional ───────────────────────
  function calcSavings(fipe) {
    var ourAnnual  = calcMonthly(fipe) * 12;
    var tradAnnual = Math.round(fipe * TRAD_RATE * TYPE_MULTIPLIER[currentType]) * 12;
    return Math.max(0, tradAnnual - ourAnnual);
  }

  // ── Update the slider fill track ─────────────────────────────────
  function updateSliderFill(val) {
    if (!sliderFill) return;
    var min  = parseFloat(slider.min);
    var max  = parseFloat(slider.max);
    var pct  = ((val - min) / (max - min)) * 100;
    sliderFill.style.width = pct + '%';
  }

  // ── Animate number change ────────────────────────────────────────
  function animateNumber(el, targetVal, duration, prefix) {
    if (!el) return;
    var startVal  = parseFloat(el.textContent.replace(/\./g, '').replace(',', '.')) || 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(startVal + (targetVal - startVal) * ease);
      el.textContent = prefix ? fmtBRL(current) : current;
      el.classList.add('counting');
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix ? fmtBRL(targetVal) : targetVal;
        el.classList.remove('counting');
      }
    }
    requestAnimationFrame(step);
  }

  // ── Main update function ─────────────────────────────────────────
  function updateCalc() {
    var fipe    = parseInt(slider.value, 10);
    var monthly = calcMonthly(fipe);
    var savings = calcSavings(fipe);

    // Update FIPE display
    animateNumber(valDisplay, fipe, 300, true);
    updateSliderFill(fipe);

    // Update monthly price
    animateNumber(priceDisplay, monthly, 400, false);

    // Update savings
    if (savingsVal) {
      savingsVal.textContent = 'R$ ' + fmtBRL(savings);
    }
  }

  // ── Slider events ─────────────────────────────────────────────────
  slider.addEventListener('input', updateCalc);
  slider.addEventListener('change', updateCalc);

  // ── Vehicle type buttons ─────────────────────────────────────────
  vTypeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      vTypeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentType = btn.getAttribute('data-type') || 'car';
      updateCalc();
    });
  });

  // ── Coverage checkboxes ───────────────────────────────────────────
  [covThird, covNature, covAssist].forEach(function (cb) {
    if (cb) cb.addEventListener('change', updateCalc);
  });

  // ── Initial render ────────────────────────────────────────────────
  updateCalc();

})();