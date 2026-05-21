import { createState } from './state.js';
import {
  renderWelcome,
  renderSizingScreen,
  renderBoxQuestion,
  renderSliderQuestion,
  renderCalculating,
  renderReport,
} from './screens.js';
import { SIZING_QUESTIONS, PILLAR_QUESTIONS, PILLAR_LABELS } from './questions.js';
import { calculateROI } from './calculator.js';

const state = createState();
const container = document.getElementById('screen-container');
const progressFill = document.getElementById('progress-fill');

const TOTAL_SCREENS = 16;
const PILLAR_ORDER = ['productivity', 'efficiency', 'growth', 'compliance', 'responsibility', 'adoption'];

const SECTOR_LABELS = {
  'financial-services': 'Financial Services',
  'healthcare': 'Healthcare',
  'energy-utilities': 'Energy & Utilities',
  'government': 'Government',
  'retail-consumer': 'Retail & Consumer',
  'other': 'Other sector',
};
const MATURITY_LABELS = {
  'ad-hoc': 'AD HOC',
  'developing': 'DEVELOPING',
  'defined': 'DEFINED',
  'advanced': 'ADVANCED',
};
const HEADCOUNT_LABELS = {
  '<500': '<500',
  '500-2000': '500–2,000',
  '2000-10000': '2,000–10,000',
  '10000+': '10,000+',
};

function getScreenConfig(idx) {
  if (idx === 0) return { type: 'welcome' };
  if (idx === 1) return { type: 'sizing' };
  if (idx >= 2 && idx <= 13) {
    const pillarIdx = Math.floor((idx - 2) / 2);
    const questionIdx = (idx - 2) % 2;
    return { type: 'pillar', pillar: PILLAR_ORDER[pillarIdx], pillarIdx, questionIdx };
  }
  if (idx === 14) return { type: 'calculating' };
  if (idx === 15) return { type: 'report' };
  return null;
}

function buildRoiResponses() {
  return {
    headcount: state.responses.headcount,
    sector: state.responses.sector,
    maturity: state.responses.maturity,
    productivity: state.responses.productivity,
    efficiency: state.responses.efficiency,
    growth: state.responses.growth,
    compliance: state.responses.compliance,
    responsibility: state.responses.responsibility,
    adoption: state.responses.adoption,
  };
}

function render() {
  const cfg = getScreenConfig(state.currentScreen);
  if (!cfg) return;

  if (cfg.type === 'welcome') {
    container.innerHTML = renderWelcome();
    const beginBtn = document.getElementById('welcome-begin');
    const emailInput = document.getElementById('welcome-email');

    const tryAdvance = () => {
      if (!emailInput.checkValidity() || emailInput.value.trim() === '') {
        emailInput.reportValidity();
        return;
      }
      state.next();
      render();
    };

    const refreshButtonState = () => {
      beginBtn.disabled = !emailInput.checkValidity() || emailInput.value.trim() === '';
    };

    beginBtn.addEventListener('click', tryAdvance);
    emailInput.addEventListener('input', refreshButtonState);
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        tryAdvance();
      }
    });
    emailInput.focus();

    wireWelcomeCarousel();

    document.querySelectorAll('.wf-spider-segment').forEach(seg => {
      seg.addEventListener('click', () => {
        document.querySelectorAll('.wf-spider-segment').forEach(s => s.classList.remove('active'));
        seg.classList.add('active');
        document.getElementById('spider-placeholder').style.display = 'none';
        document.getElementById('spider-content').style.display = 'block';
        document.getElementById('spider-name').textContent = seg.dataset.name;
        document.getElementById('spider-desc').textContent = seg.dataset.desc;
      });
    });
  } else if (cfg.type === 'sizing') {
    container.innerHTML = renderSizingScreen({ responses: state.responses });
    wireSizingScreen();
  } else if (cfg.type === 'pillar') {
    const q = PILLAR_QUESTIONS[cfg.pillar][cfg.questionIdx];
    const existing = state.responses[cfg.pillar][cfg.questionIdx];
    const breadcrumb = { pillarIndex: cfg.pillarIdx };
    if (q.type === 'box') {
      container.innerHTML = renderBoxQuestion({
        eyebrow: `${PILLAR_LABELS[cfg.pillar]} · Q${cfg.questionIdx + 1} of 2`,
        question: q.question,
        options: q.options,
        selectedValue: existing?.value,
        breadcrumb,
      });
      wirePillarBoxScreen(cfg.pillar, cfg.questionIdx);
    } else if (q.type === 'slider') {
      container.innerHTML = renderSliderQuestion({
        eyebrow: `${PILLAR_LABELS[cfg.pillar]} · Q${cfg.questionIdx + 1} of 2`,
        question: q.question,
        descriptors: q.descriptors,
        currentValue: existing?.value,
        breadcrumb,
      });
      wireSliderScreen(cfg.pillar, cfg.questionIdx);
    }
  } else if (cfg.type === 'calculating') {
    container.innerHTML = renderCalculating();
    setTimeout(() => { state.next(); render(); }, 2200);
  } else if (cfg.type === 'report') {
    const roi = calculateROI(buildRoiResponses());
    container.innerHTML = renderReport({
      roi,
      maturityLabel: MATURITY_LABELS[state.responses.maturity],
      sectorLabel: SECTOR_LABELS[state.responses.sector],
      headcountLabel: HEADCOUNT_LABELS[state.responses.headcount],
    });
    document.getElementById('methodology-link').addEventListener('click', () => {
      window.open('methodology.md', '_blank');
    });
    document.getElementById('talk-to-pwc').addEventListener('click', () => {
      alert('Thanks — a PwC consultant will be in touch. (CTA destination TBD)');
    });
    document.getElementById('start-over').addEventListener('click', () => {
      window.location.reload();
    });
  }

  progressFill.style.width = `${(state.currentScreen / (TOTAL_SCREENS - 1)) * 100}%`;
}

const AUTO_ADVANCE_MS = 220;

function scheduleAutoAdvance(timerRef) {
  if (timerRef.id) clearTimeout(timerRef.id);
  timerRef.id = setTimeout(() => { state.next(); render(); }, AUTO_ADVANCE_MS);
}

function wireSizingScreen() {
  const nextBtn = document.getElementById('nav-next');
  const backBtn = document.getElementById('nav-back');

  function checkComplete() {
    const { headcount, sector, maturity } = state.responses;
    nextBtn.disabled = !(headcount && sector && maturity);
  }

  document.querySelectorAll('.sz-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      document.querySelectorAll(`.sz-opt[data-field="${field}"]`).forEach(b => b.classList.remove('sz-opt--selected'));
      btn.classList.add('sz-opt--selected');
      state.recordSizing(field, btn.dataset.value);
      checkComplete();
    });
  });

  checkComplete();
  nextBtn.addEventListener('click', () => { state.next(); render(); });
  backBtn.addEventListener('click', () => { state.back(); render(); });
}

function wirePillarBoxScreen(pillar, qIdx) {
  const nextBtn = document.getElementById('nav-next');
  const backBtn = document.getElementById('nav-back');
  const timer = { id: null };
  document.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.option').forEach(b => b.classList.remove('option--selected'));
      btn.classList.add('option--selected');
      state.recordResponse(pillar, qIdx, { type: 'box', value: Number(btn.dataset.value) });
      nextBtn.disabled = false;
      scheduleAutoAdvance(timer);
    });
  });
  const existing = state.responses[pillar][qIdx];
  if (existing) nextBtn.disabled = false;
  nextBtn.addEventListener('click', () => { clearTimeout(timer.id); state.next(); render(); });
  backBtn.addEventListener('click', () => { clearTimeout(timer.id); state.back(); render(); });
}

function wireSliderScreen(pillar, qIdx) {
  const input = document.getElementById('slider-input');
  const levels = document.getElementById('slider-levels');
  const nextBtn = document.getElementById('nav-next');
  const backBtn = document.getElementById('nav-back');

  function setValue(val) {
    input.value = val;
    levels.querySelectorAll('.slider-level').forEach(el => {
      el.classList.toggle('slider-level--active', Number(el.dataset.value) === val);
    });
    state.recordResponse(pillar, qIdx, { type: 'slider', value: val });
  }

  if (!state.responses[pillar][qIdx]) setValue(3);

  input.addEventListener('input', e => setValue(Number(e.target.value)));
  levels.querySelectorAll('.slider-level').forEach(el => {
    el.addEventListener('click', () => setValue(Number(el.dataset.value)));
  });

  nextBtn.addEventListener('click', () => { state.next(); render(); });
  backBtn.addEventListener('click', () => { state.back(); render(); });
}

function wireWelcomeCarousel() {
  const track = document.getElementById('wf-track');
  const prev = document.getElementById('wf-prev');
  const next = document.getElementById('wf-next');
  const dots = Array.from(document.querySelectorAll('.wf-dot'));
  if (!track) return;

  const total = track.children.length;
  let idx = 0;
  let dragStartX = null;
  let dragDx = 0;
  let dragging = false;

  function go(n) {
    idx = Math.max(0, Math.min(total - 1, n));
    track.style.transition = 'transform 380ms cubic-bezier(.2,.7,.2,1)';
    track.style.transform = `translateX(${-idx * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('wf-dot--active', i === idx));
    prev.disabled = idx === 0;
    next.disabled = idx === total - 1;
  }

  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  dots.forEach(d => d.addEventListener('click', () => go(Number(d.dataset.idx))));

  function onDown(e) {
    dragging = true;
    dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
    dragDx = 0;
    track.style.transition = 'none';
  }
  function onMove(e) {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    dragDx = x - dragStartX;
    const width = track.parentElement.clientWidth;
    const pct = (dragDx / width) * 100;
    track.style.transform = `translateX(calc(${-idx * 100}% + ${pct}%))`;
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    const width = track.parentElement.clientWidth;
    const threshold = width * 0.18;
    if (dragDx < -threshold) go(idx + 1);
    else if (dragDx > threshold) go(idx - 1);
    else go(idx);
    dragDx = 0;
  }

  track.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  track.addEventListener('touchstart', onDown, { passive: true });
  track.addEventListener('touchmove', onMove, { passive: true });
  track.addEventListener('touchend', onUp);

  go(0);
}

render();
