import { renderSpiderChart } from './spider-chart.js';

export function renderWelcome() {
  return `
    <section class="screen">
      <div class="screen__inner">
        <p class="eyebrow">Data Governance Diagnostic</p>
        <h1 class="question">Find out what your data is really worth to you.</h1>
        <p class="subtitle">A 5-minute self-assessment that surfaces where your organisation is losing value to poor data governance.</p>
        <input type="email" id="welcome-email" placeholder="Your work email" required style="width:100%;padding:14px 18px;border:1.5px solid var(--option-border);border-radius:8px;background:var(--option-bg);font-family:inherit;font-size:14px;margin-bottom:24px" />
        <button class="btn btn--primary" id="welcome-begin" disabled>Begin →</button>
      </div>
    </section>
  `;
}

export function renderBoxQuestion({ eyebrow, question, options, selectedValue }) {
  const optionsHtml = options.map(opt => `
    <button class="option ${opt.value === selectedValue ? 'option--selected' : ''}" data-value="${opt.value}">
      <div class="option__label">${opt.label}</div>
      <div class="option__sublabel">${opt.sublabel || ''}</div>
    </button>
  `).join('');

  return `
    <section class="screen">
      <div class="screen__inner">
        <p class="eyebrow">${eyebrow}</p>
        <h2 class="question">${question}</h2>
        <p class="subtitle">Select the option that best reflects your organisation.</p>
        ${optionsHtml}
        <div class="nav">
          <button class="btn btn--ghost" id="nav-back">← Back</button>
          <button class="btn btn--primary" id="nav-next" disabled>Next →</button>
        </div>
      </div>
    </section>
  `;
}

export function renderTileQuestion({ eyebrow, question, options, selectedValue }) {
  const tilesHtml = options.map(opt => `
    <button class="tile ${opt.value === selectedValue ? 'tile--selected' : ''}" data-value="${opt.value}">
      ${opt.label}
    </button>
  `).join('');

  return `
    <section class="screen">
      <div class="screen__inner">
        <p class="eyebrow">${eyebrow}</p>
        <h2 class="question">${question}</h2>
        <p class="subtitle">Select the option that best describes your organisation.</p>
        <div class="tiles">${tilesHtml}</div>
        <div class="nav">
          <button class="btn btn--ghost" id="nav-back">← Back</button>
          <button class="btn btn--primary" id="nav-next" disabled>Next →</button>
        </div>
      </div>
    </section>
  `;
}

export function renderSliderQuestion({ eyebrow, question, descriptors, currentValue }) {
  const value = currentValue ?? 3;
  const levelsHtml = descriptors.map(d => `
    <div class="slider-level ${d.num === value ? 'slider-level--active' : ''}" data-value="${d.num}">
      <div class="slider-level__num">${d.num}</div>
      <div class="slider-level__name">${d.name}</div>
      <div class="slider-level__desc">${d.desc}</div>
    </div>
  `).join('');

  return `
    <section class="screen">
      <div class="screen__inner">
        <p class="eyebrow">${eyebrow}</p>
        <h2 class="question">${question}</h2>
        <p class="subtitle">Drag the slider or click a level below.</p>
        <div class="slider-block">
          <input type="range" min="1" max="5" value="${value}" id="slider-input" />
          <div class="slider-levels" id="slider-levels">${levelsHtml}</div>
        </div>
        <div class="nav">
          <button class="btn btn--ghost" id="nav-back">← Back</button>
          <button class="btn btn--primary" id="nav-next">Next →</button>
        </div>
      </div>
    </section>
  `;
}

export function renderCalculating() {
  return `
    <section class="screen">
      <div class="screen__inner" style="text-align:center">
        <p class="eyebrow">Analysing</p>
        <h2 class="question">Calculating your data value gap...</h2>
        <div class="spinner" style="margin:32px auto;width:48px;height:48px;border:4px solid var(--option-border);border-top-color:var(--pwc-orange);border-radius:50%;animation:spin 1s linear infinite"></div>
      </div>
    </section>
  `;
}

// --- Scorecard + Recommendations helpers ---

export function fmtCurrency(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function riskTier(gapScore) {
  if (gapScore >= 0.70) return 'high';
  if (gapScore >= 0.40) return 'mod';
  return 'low';
}

function riskLabel(tier) {
  return { high: 'High risk', mod: 'Moderate risk', low: 'Lower risk' }[tier];
}

const PILLAR_LABELS_FULL = {
  productivity: 'Productivity',
  efficiency: 'Efficiency',
  growth: 'Growth / Innovation',
  compliance: 'Control / Compliance',
  responsibility: 'Responsibility',
  adoption: 'Adoption / Literacy',
};

export function renderScorecard({ roi, maturityLabel, sectorLabel, headcountLabel }) {
  const pillarsSorted = Object.entries(roi.pillarBreakdown)
    .sort(([, a], [, b]) => b.value - a.value);

  const pillarRowsHtml = pillarsSorted.map(([key, data]) => {
    const tier = riskTier(data.gapScore);
    return `
      <div class="pillar-row pillar-row--${tier}">
        <div>
          <div class="pillar-row__label">${PILLAR_LABELS_FULL[key]}</div>
          <div class="pillar-row__risk">${riskLabel(tier)}</div>
        </div>
        <div class="pillar-row__value">${fmtCurrency(data.value)}</div>
      </div>
    `;
  }).join('');

  const maturityScores = {};
  for (const [key, data] of Object.entries(roi.pillarBreakdown)) {
    maturityScores[key] = Math.max(0.1, 1 - data.gapScore);
  }

  return `
    <section class="screen">
      <div class="scorecard">
        <div class="scorecard__header">
          <div>
            <div class="scorecard__eyebrow">Estimated Annual Value at Risk</div>
            <div class="scorecard__total">${fmtCurrency(roi.totalValueAtRisk)}</div>
            <div class="scorecard__context">Range: ${fmtCurrency(roi.displayRange.low)} – ${fmtCurrency(roi.displayRange.high)}</div>
          </div>
          <div style="text-align:right">
            <div class="scorecard__maturity-label">Overall Maturity</div>
            <div class="scorecard__maturity-badge">${maturityLabel}</div>
            <div style="font-size:10px;color:#888;margin-top:6px">${sectorLabel} · ${headcountLabel} employees</div>
          </div>
        </div>
        <div class="scorecard__body">
          <div>${renderSpiderChart(maturityScores)}</div>
          <div class="scorecard__pillars">
            <div class="scorecard__pillars-title">Value at Risk by Pillar</div>
            ${pillarRowsHtml}
          </div>
        </div>
        <div class="scorecard__footer">
          <button class="scorecard__methodology" id="methodology-link">Based on Gartner, IDC & Forrester benchmarks · View methodology</button>
          <button class="btn btn--primary" id="see-recommendations">See Recommendations →</button>
        </div>
      </div>
    </section>
  `;
}

const RECOMMENDATIONS_BY_PILLAR = {
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

export function renderRecommendations({ roi }) {
  const topThree = Object.entries(roi.pillarBreakdown)
    .sort(([, a], [, b]) => b.value - a.value)
    .slice(0, 3);

  const cardsHtml = topThree.map(([key, data]) => {
    const tier = data.gapScore >= 0.70 ? 'high' : 'mod';
    const rec = RECOMMENDATIONS_BY_PILLAR[key];
    return `
      <div class="issue-card issue-card--${tier}">
        <div class="issue-card__head">
          <span class="issue-card__badge">${tier === 'high' ? 'High Risk' : 'Moderate Risk'}</span>
          <div class="issue-card__title">${PILLAR_LABELS_FULL[key]} — ${fmtCurrency(data.value)} at risk</div>
        </div>
        <div class="issue-card__body">
          <div class="issue-card__heading">Issue</div>
          <div class="issue-card__text">${rec.issue}</div>
          <div class="issue-card__heading">What needs to happen</div>
          <ul class="issue-card__actions">
            ${rec.actions.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="screen">
      <div class="recommendations">
        <div class="recommendations__header">
          <div>
            <div class="scorecard__eyebrow">Your Priority Actions</div>
            <div style="font-size:18px;font-weight:800;color:#fff;line-height:1.3;margin-top:4px">3 areas need immediate attention</div>
          </div>
          <div style="font-size:11px;color:#888">Based on your responses</div>
        </div>
        <div class="recommendations__body">${cardsHtml}</div>
        <div class="recommendations__secondary-actions">
          <button class="btn btn--ghost" id="download-report">Download Report</button>
          <button class="btn btn--ghost" id="start-over">Start Over</button>
        </div>
        <div class="recommendations__cta-footer">
          <div>
            <div class="recommendations__cta-text">Ready to close the gap?</div>
            <div class="recommendations__cta-sub">PwC's Data Governance Advisory team works with APAC organisations to turn these findings into action.</div>
          </div>
          <button class="btn btn--primary" id="talk-to-pwc">Talk to PwC →</button>
        </div>
      </div>
    </section>
  `;
}
