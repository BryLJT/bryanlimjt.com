import { createState } from './state.js';
import {
  renderWelcome,
  renderBoxQuestion,
  renderTileQuestion,
  renderSliderQuestion,
  renderCalculating,
  renderScorecard,
  renderRecommendations,
  fmtCurrency,
} from './screens.js';
import { SIZING_QUESTIONS, PILLAR_QUESTIONS, PILLAR_LABELS } from './questions.js';
import { calculateROI } from './calculator.js';

const state = createState();
const container = document.getElementById('screen-container');
const progressFill = document.getElementById('progress-fill');

const TOTAL_SCREENS = 19;
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
  if (idx >= 1 && idx <= 3) return { type: 'sizing', sizingIndex: idx - 1 };
  if (idx >= 4 && idx <= 15) {
    const pillarIdx = Math.floor((idx - 4) / 2);
    const questionIdx = (idx - 4) % 2;
    return { type: 'pillar', pillar: PILLAR_ORDER[pillarIdx], questionIdx };
  }
  if (idx === 16) return { type: 'calculating' };
  if (idx === 17) return { type: 'scorecard' };
  if (idx === 18) return { type: 'recommendations' };
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
  } else if (cfg.type === 'sizing') {
    const q = SIZING_QUESTIONS[cfg.sizingIndex];
    if (q.type === 'box') {
      container.innerHTML = renderBoxQuestion({
        eyebrow: 'About your organisation',
        question: q.question,
        options: q.options,
        selectedValue: state.responses[q.id],
      });
      wireBoxScreen(q.id);
    } else if (q.type === 'tiles') {
      container.innerHTML = renderTileQuestion({
        eyebrow: 'About your organisation',
        question: q.question,
        options: q.options,
        selectedValue: state.responses[q.id],
      });
      wireTileScreen(q.id);
    }
  } else if (cfg.type === 'pillar') {
    const q = PILLAR_QUESTIONS[cfg.pillar][cfg.questionIdx];
    const existing = state.responses[cfg.pillar][cfg.questionIdx];
    if (q.type === 'box') {
      container.innerHTML = renderBoxQuestion({
        eyebrow: `Pillar — ${PILLAR_LABELS[cfg.pillar]}`,
        question: q.question,
        options: q.options,
        selectedValue: existing?.value,
      });
      wirePillarBoxScreen(cfg.pillar, cfg.questionIdx);
    } else if (q.type === 'slider') {
      container.innerHTML = renderSliderQuestion({
        eyebrow: `Pillar — ${PILLAR_LABELS[cfg.pillar]}`,
        question: q.question,
        descriptors: q.descriptors,
        currentValue: existing?.value,
      });
      wireSliderScreen(cfg.pillar, cfg.questionIdx);
    }
  } else if (cfg.type === 'calculating') {
    container.innerHTML = renderCalculating();
    setTimeout(() => { state.next(); render(); }, 2200);
  } else if (cfg.type === 'scorecard') {
    const roi = calculateROI(buildRoiResponses());
    container.innerHTML = renderScorecard({
      roi,
      maturityLabel: MATURITY_LABELS[state.responses.maturity],
      sectorLabel: SECTOR_LABELS[state.responses.sector],
      headcountLabel: HEADCOUNT_LABELS[state.responses.headcount],
    });
    document.getElementById('see-recommendations').addEventListener('click', () => {
      state.next();
      render();
    });
    document.getElementById('methodology-link').addEventListener('click', () => {
      window.open('methodology.md', '_blank');
    });
  } else if (cfg.type === 'recommendations') {
    const roi = calculateROI(buildRoiResponses());
    container.innerHTML = renderRecommendations({ roi });
    document.getElementById('talk-to-pwc').addEventListener('click', () => {
      alert('Thanks — a PwC consultant will be in touch. (CTA destination TBD)');
    });
    document.getElementById('download-report').addEventListener('click', () => {
      downloadReport(roi);
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

function wireBoxScreen(sizingId) {
  const nextBtn = document.getElementById('nav-next');
  const backBtn = document.getElementById('nav-back');
  const timer = { id: null };
  document.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.option').forEach(b => b.classList.remove('option--selected'));
      btn.classList.add('option--selected');
      state.recordSizing(sizingId, btn.dataset.value);
      nextBtn.disabled = false;
      scheduleAutoAdvance(timer);
    });
  });
  if (state.responses[sizingId]) nextBtn.disabled = false;
  nextBtn.addEventListener('click', () => { clearTimeout(timer.id); state.next(); render(); });
  backBtn.addEventListener('click', () => { clearTimeout(timer.id); state.back(); render(); });
}

function wireTileScreen(sizingId) {
  const nextBtn = document.getElementById('nav-next');
  const backBtn = document.getElementById('nav-back');
  const timer = { id: null };
  document.querySelectorAll('.tile').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tile').forEach(b => b.classList.remove('tile--selected'));
      btn.classList.add('tile--selected');
      state.recordSizing(sizingId, btn.dataset.value);
      nextBtn.disabled = false;
      scheduleAutoAdvance(timer);
    });
  });
  if (state.responses[sizingId]) nextBtn.disabled = false;
  nextBtn.addEventListener('click', () => { clearTimeout(timer.id); state.next(); render(); });
  backBtn.addEventListener('click', () => { clearTimeout(timer.id); state.back(); render(); });
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

const PILLAR_LABELS_REPORT = {
  productivity: 'Productivity',
  efficiency: 'Efficiency',
  growth: 'Growth / Innovation',
  compliance: 'Control / Compliance',
  responsibility: 'Responsibility',
  adoption: 'Adoption / Literacy',
};

const REPORT_RECOMMENDATIONS = {
  productivity: {
    issue: 'Teams are spending significant time finding, validating and reconciling data — creating a compounding drag on output across the organisation.',
    actions: [
      'Establish a single trusted data source with defined ownership and refresh cadence.',
      'Automate data validation workflows to reduce manual reconciliation effort.',
    ],
  },
  efficiency: {
    issue: 'Manual and fragmented data processes are slowing down operations — workflows that could be automated are still handled by people, at scale.',
    actions: [
      'Map and prioritise high-frequency data processes for automation or standardisation.',
      'Introduce data pipeline tooling to reduce handoff friction between teams.',
    ],
  },
  growth: {
    issue: 'Data is not being used as a strategic asset — opportunities for revenue growth and market differentiation are slipping past unrecognised.',
    actions: [
      'Stand up an analytics capability that aligns data assets to commercial priorities.',
      'Embed data-driven scoring into key decision processes (pricing, customer, product).',
    ],
  },
  compliance: {
    issue: 'Data governance controls are inconsistent across business units, creating audit exposure and increasing the cost of regulatory response.',
    actions: [
      'Define a data classification framework and apply access controls consistently.',
      'Implement automated monitoring and audit trails for high-sensitivity data assets.',
    ],
  },
  responsibility: {
    issue: 'When data issues arise, accountability is unclear — issues persist longer than they should and recur across the organisation.',
    actions: [
      'Establish formal data ownership roles aligned to business domains.',
      'Define and rehearse incident response playbooks for data quality and breach scenarios.',
    ],
  },
  adoption: {
    issue: 'Data literacy is uneven — too many decisions still rely on instinct rather than the data you already have.',
    actions: [
      'Roll out a structured data literacy programme tied to role-based competencies.',
      'Embed self-serve analytics tooling into the everyday workflow of business teams.',
    ],
  },
};

function downloadReport(roi) {
  const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const sortedPillars = Object.entries(roi.pillarBreakdown).sort(([, a], [, b]) => b.value - a.value);
  const topThree = sortedPillars.slice(0, 3);

  const pillarRows = sortedPillars.map(([key, data]) => {
    const tier = data.gapScore >= 0.70 ? 'High' : data.gapScore >= 0.40 ? 'Moderate' : 'Lower';
    return `
      <tr>
        <td style="padding:10px 14px;font-weight:600">${PILLAR_LABELS_REPORT[key]}</td>
        <td style="padding:10px 14px;color:#555">${tier} risk</td>
        <td style="padding:10px 14px;text-align:right;font-weight:700">${fmtCurrency(data.value)}</td>
      </tr>
    `;
  }).join('');

  const issueCards = topThree.map(([key, data]) => {
    const tier = data.gapScore >= 0.70 ? 'High Risk' : 'Moderate Risk';
    const tierColor = data.gapScore >= 0.70 ? '#E0301E' : '#E36F1E';
    const rec = REPORT_RECOMMENDATIONS[key];
    return `
      <div style="border:1px solid #F0E0DC;border-radius:10px;overflow:hidden;margin-bottom:16px;page-break-inside:avoid">
        <div style="background:#FEF1EE;padding:14px 18px;border-bottom:1px solid #F0E0DC">
          <span style="display:inline-block;background:${tierColor};color:#fff;font-size:10px;font-weight:800;padding:3px 10px;border-radius:12px;letter-spacing:1px;text-transform:uppercase;margin-right:10px">${tier}</span>
          <span style="font-size:13px;font-weight:700;color:#2D2926">${PILLAR_LABELS_REPORT[key]} — ${fmtCurrency(data.value)} at risk</span>
        </div>
        <div style="padding:14px 18px">
          <div style="font-size:12px;font-weight:700;color:#2D2926;margin-bottom:4px">Issue</div>
          <div style="font-size:12px;color:#555;margin-bottom:12px;line-height:1.5">${rec.issue}</div>
          <div style="font-size:12px;font-weight:700;color:#2D2926;margin-bottom:4px">What needs to happen</div>
          <ul style="margin:0;padding-left:18px">
            ${rec.actions.map(a => `<li style="font-size:12px;color:#555;line-height:1.6">${a}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>PwC Data Governance ROI Report — ${date}</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #2D2926; max-width: 800px; margin: 40px auto; padding: 0 32px; line-height: 1.5; }
  .header { background: #2D2926; color: #fff; padding: 24px 32px; border-radius: 8px 8px 0 0; }
  .eyebrow { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #E36F1E; margin-bottom: 6px; }
  .total { font-size: 44px; font-weight: 900; line-height: 1; margin: 6px 0 4px; }
  .context { font-size: 12px; color: #aaa; }
  h2 { font-size: 18px; margin: 28px 0 12px; color: #2D2926; }
  table { width: 100%; border-collapse: collapse; }
  table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; padding: 10px 14px; border-bottom: 1px solid #eee; }
  table td { border-bottom: 1px solid #f5f5f5; font-size: 13px; }
  .meta { display: flex; justify-content: space-between; padding: 16px 32px; background: #FAFAFA; border-radius: 0 0 8px 8px; font-size: 11px; color: #888; }
  .methodology-note { font-size: 11px; color: #888; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; line-height: 1.6; }
  @media print { body { margin: 0; padding: 0 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="eyebrow">Data Governance Diagnostic — Estimated Annual Value at Risk</div>
    <div class="total">${fmtCurrency(roi.totalValueAtRisk)}</div>
    <div class="context">Range: ${fmtCurrency(roi.displayRange.low)} – ${fmtCurrency(roi.displayRange.high)}</div>
  </div>
  <div class="meta">
    <div>${SECTOR_LABELS[state.responses.sector]} · ${HEADCOUNT_LABELS[state.responses.headcount]} employees</div>
    <div>Maturity: ${MATURITY_LABELS[state.responses.maturity]}</div>
    <div>${date}</div>
  </div>

  <h2>Value at Risk by Pillar</h2>
  <table>
    <thead>
      <tr><th>Pillar</th><th>Risk Tier</th><th style="text-align:right">Value at Risk</th></tr>
    </thead>
    <tbody>${pillarRows}</tbody>
  </table>

  <h2>Priority Actions</h2>
  ${issueCards}

  <div class="methodology-note">
    Estimates based on indicative Gartner, IDC, Forrester and McKinsey benchmarks applied to your stated headcount and sector. The ±15% range is a credibility band, not a statistical confidence interval. Full methodology available on request from your PwC contact.
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PwC-Data-Governance-ROI-Report-${date.replace(/\s/g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

render();
