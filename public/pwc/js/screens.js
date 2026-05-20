import { renderSpiderChart } from './spider-chart.js';

const PILLAR_BC_LABELS = ['Productivity', 'Efficiency', 'Growth & Innovation', 'Compliance', 'Responsibility', 'Adoption'];

function renderBreadcrumb({ pillarIndex }) {
  const items = PILLAR_BC_LABELS.map((label, i) => {
    const state = i < pillarIndex ? 'done' : i === pillarIndex ? 'active' : 'upcoming';
    return `<div class="bc__item bc__item--${state}">
      <div class="bc__marker">${i + 1}</div>
      <div class="bc__label">${label}</div>
    </div>`;
  }).join('<div class="bc__sep"></div>');
  return `<aside class="breadcrumb">${items}</aside>`;
}

export function renderWelcome() {
  return `
    <section class="screen welcome-screen">

      <div class="welcome__left">

        <div class="welcome__orange-hero">
          <span class="welcome__eyebrow">PwC · Data Governance Business Value Calculator · APAC</span>
          <h1 class="welcome__headline">Your data has a <em>hidden cost.</em></h1>
          <p class="welcome__desc">Find out exactly how much your organisation is losing to poor data governance — across productivity, compliance, and growth.</p>
        </div>

        <div class="welcome__dark-content">
          <div class="welcome__stats">
            <div class="welcome__stat">
              <span class="welcome__stat-num">6</span>
              <span class="welcome__stat-label">Governance pillars assessed</span>
            </div>
            <div class="welcome__stat">
              <span class="welcome__stat-num">$M</span>
              <span class="welcome__stat-label">Annual value at risk, quantified</span>
            </div>
            <div class="welcome__stat">
              <span class="welcome__stat-num">3</span>
              <span class="welcome__stat-label">Priority actions, personalised</span>
            </div>
          </div>

          <div class="wf-section">
            <div class="wf-section__num">01</div>
            <h3 class="wf-section__title">What is Data Governance?</h3>
            <p class="wf-section__body">Data governance is the set of policies, processes, and accountabilities that determine how your organisation collects, manages, and uses its data. When it works, it's invisible. When it doesn't, the cost compounds silently — across every team, every decision, every quarter.</p>
          </div>

          <div class="wf-section">
            <div class="wf-section__num">02</div>
            <h3 class="wf-section__title">Why it belongs on the board agenda</h3>
            <div class="wf-points">
              <div class="wf-point"><span class="wf-point__dot"></span><span>Regulators across APAC are tightening data requirements — from PDPA to sector-specific mandates. The cost of non-compliance is rising.</span></div>
              <div class="wf-point"><span class="wf-point__dot"></span><span>AI investment is accelerating — but AI is only as good as the data it runs on. Poor governance limits returns before you start.</span></div>
              <div class="wf-point"><span class="wf-point__dot"></span><span>Data breaches carry reputational and financial costs that dwarf the investment in prevention.</span></div>
              <div class="wf-point"><span class="wf-point__dot"></span><span>Organisations with mature data governance consistently outperform peers on decision speed, accuracy, and competitive agility.</span></div>
            </div>
          </div>

          <div class="wf-section">
            <div class="wf-section__num">03</div>
            <h3 class="wf-section__title">How we quantify the gap</h3>
            <p class="wf-section__body">We translate governance gaps into dollar figures using a consistent ROI methodology — your organisation's headcount, estimated annual labour cost, and sector-specific multipliers, applied against your responses across six governance pillars. The output is an indicative annual value at risk: not a precise forecast, but a credible, defensible signal of where to act and how urgently.</p>
          </div>

          <div class="wf-section">
            <div class="wf-section__num">04</div>
            <h3 class="wf-section__title">The assessment framework</h3>
            <p class="wf-section__body wf-section__body--mb">Six pillars capture the full cost of a governance gap — from day-to-day productivity drag through to strategic and regulatory exposure.</p>
            <div class="wf-pillars">
              <div class="wf-pillar"><span class="wf-pillar__num">1</span><div><div class="wf-pillar__name">Productivity</div><div class="wf-pillar__desc">Time lost finding, validating and reconciling data before it can be used</div></div></div>
              <div class="wf-pillar"><span class="wf-pillar__num">2</span><div><div class="wf-pillar__name">Efficiency</div><div class="wf-pillar__desc">Manual processes and data handoffs that could and should be automated</div></div></div>
              <div class="wf-pillar"><span class="wf-pillar__num">3</span><div><div class="wf-pillar__name">Growth &amp; Innovation</div><div class="wf-pillar__desc">Revenue opportunities missed because data isn't accessible, trusted, or used strategically</div></div></div>
              <div class="wf-pillar"><span class="wf-pillar__num">4</span><div><div class="wf-pillar__name">Control / Compliance</div><div class="wf-pillar__desc">Audit exposure and the escalating cost of responding to regulatory requirements</div></div></div>
              <div class="wf-pillar"><span class="wf-pillar__num">5</span><div><div class="wf-pillar__name">Responsibility</div><div class="wf-pillar__desc">Unclear accountability when data quality issues or incidents arise</div></div></div>
              <div class="wf-pillar"><span class="wf-pillar__num">6</span><div><div class="wf-pillar__name">Adoption &amp; Literacy</div><div class="wf-pillar__desc">Decisions made on instinct rather than the data your organisation already has</div></div></div>
            </div>
          </div>

        </div>
      </div>

      <div class="welcome__right">
        <div class="welcome__form-card">
          <div class="welcome__form-header">
            <span class="welcome__form-dot"></span>
            <span class="welcome__form-title">Access your diagnostic</span>
          </div>
          <p class="welcome__form-sub">Enter your work email to receive your personalised report and recommendations.</p>
          <input type="email" id="welcome-email" placeholder="you@company.com" required class="welcome__input" />
          <button class="btn btn--primary welcome__cta" id="welcome-begin" disabled>Begin assessment →</button>
          <p class="welcome__disclaimer">Takes 5 minutes · 500+ employees · Based on Gartner, IDC &amp; Forrester benchmarks</p>
        </div>
      </div>

    </section>
  `;
}

export function renderSizingScreen({ responses }) {
  function opt(field, value, label, sub) {
    const sel = String(responses[field]) === String(value) ? 'sz-opt--selected' : '';
    const subHtml = sub ? `<span class="sz-opt__sub">${sub}</span>` : '';
    return `<button class="sz-opt ${sel}" data-field="${field}" data-value="${value}"><span class="sz-opt__main">${label}</span>${subHtml}</button>`;
  }
  return `
    <section class="screen">
      <div class="screen__inner">
        <p class="eyebrow">About Your Organisation</p>
        <h2 class="question">A few quick details before we begin.</h2>

        <div class="sz-group">
          <p class="sz-group__label">Headcount</p>
          <div class="sz-row sz-row--4">
            ${opt('headcount','<500','Under 500')}
            ${opt('headcount','500-2000','500 – 2,000')}
            ${opt('headcount','2000-10000','2,000 – 10,000')}
            ${opt('headcount','10000+','10,000+')}
          </div>
        </div>

        <div class="sz-group">
          <p class="sz-group__label">Industry</p>
          <div class="sz-row sz-row--3">
            ${opt('sector','financial-services','Financial Services')}
            ${opt('sector','healthcare','Healthcare')}
            ${opt('sector','energy-utilities','Energy & Utilities')}
            ${opt('sector','government','Government')}
            ${opt('sector','retail-consumer','Retail & Consumer')}
            ${opt('sector','other','Other')}
          </div>
        </div>

        <div class="sz-group">
          <p class="sz-group__label">Data Management Maturity</p>
          <div class="sz-row sz-row--4">
            ${opt('maturity','ad-hoc','Ad hoc','No formal practices')}
            ${opt('maturity','developing','Developing','Some policies, inconsistent')}
            ${opt('maturity','defined','Defined','Policies largely followed')}
            ${opt('maturity','advanced','Advanced','Governance embedded')}
          </div>
        </div>

        <div class="nav nav--fixed">
          <button class="btn btn--ghost" id="nav-back">← Back</button>
          <button class="btn btn--primary" id="nav-next" disabled>Next →</button>
        </div>
      </div>
    </section>
  `;
}

export function renderBoxQuestion({ eyebrow, question, options, selectedValue, breadcrumb }) {
  const optionsHtml = options.map(opt => `
    <button class="option ${opt.value === selectedValue ? 'option--selected' : ''}" data-value="${opt.value}">
      <div class="option__label">${opt.label}</div>
      <div class="option__sublabel">${opt.sublabel || ''}</div>
    </button>
  `).join('');

  return `
    ${breadcrumb ? renderBreadcrumb(breadcrumb) : ''}
    <section class="screen">
      <div class="screen__inner">
        <p class="eyebrow">${eyebrow}</p>
        <h2 class="question">${question}</h2>
        <p class="subtitle">Select the option that best reflects your organisation.</p>
        ${optionsHtml}
        <div class="nav nav--fixed">
          <button class="btn btn--ghost" id="nav-back">← Back</button>
          <button class="btn btn--primary" id="nav-next" disabled>Next →</button>
        </div>
      </div>
    </section>
  `;
}

export function renderSliderQuestion({ eyebrow, question, descriptors, currentValue, breadcrumb }) {
  const value = currentValue ?? 3;
  const levelsHtml = descriptors.map(d => `
    <div class="slider-level ${d.num === value ? 'slider-level--active' : ''}" data-value="${d.num}">
      <div class="slider-level__num">${d.num}</div>
      <div class="slider-level__name">${d.name}</div>
      <div class="slider-level__desc">${d.desc}</div>
    </div>
  `).join('');

  return `
    ${breadcrumb ? renderBreadcrumb(breadcrumb) : ''}
    <section class="screen">
      <div class="screen__inner">
        <p class="eyebrow">${eyebrow}</p>
        <h2 class="question">${question}</h2>
        <p class="subtitle">Drag the slider or click a level below.</p>
        <div class="slider-block">
          <input type="range" min="1" max="5" value="${value}" id="slider-input" />
          <div class="slider-levels" id="slider-levels">${levelsHtml}</div>
        </div>
        <div class="nav nav--fixed">
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
  if (n >= 1_000_000) {
    const m = Math.round(n / 100_000) / 10;
    return `$${m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const k = Math.round(n / 10_000) * 10;
    return `$${k}K`;
  }
  return `$${Math.round(n)}`;
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
  growth: 'Growth & Innovation',
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
        <div class="pillar-row__left">
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
    recommendation: 'Establish a single authoritative data layer with designated ownership and automated quality checks.',
    actions: [
      'Appoint domain data owners and publish one trusted source per high-use dataset.',
      'Automate validation at ingestion to eliminate manual reconciliation effort.',
    ],
  },
  efficiency: {
    issue: 'Manual and fragmented data processes are slowing down operations — workflows that could be automated are still handled by people, at scale.',
    recommendation: 'Map, prioritise, and systematically automate your highest-frequency data workflows.',
    actions: [
      'Inventory manual data workflows and rank by frequency and time cost.',
      'Introduce pipeline tooling to reduce handoff friction between teams.',
    ],
  },
  growth: {
    issue: 'Data is not being used as a strategic asset — opportunities for revenue growth and market differentiation are slipping past unrecognised.',
    recommendation: 'Align data assets directly to commercial priorities and embed analytics into key decisions.',
    actions: [
      'Stand up an analytics capability tied to pricing, customer, and product decisions.',
      'Identify and productise two or three high-value datasets within the next quarter.',
    ],
  },
  compliance: {
    issue: 'Data governance controls are inconsistent across business units, creating audit exposure and increasing the cost of regulatory response.',
    recommendation: 'Implement a classification framework with consistent access controls and automated audit trails.',
    actions: [
      'Define data sensitivity tiers and enforce access controls across all systems.',
      'Deploy automated monitoring and audit logging for high-sensitivity data assets.',
    ],
  },
  responsibility: {
    issue: 'When data issues arise, accountability is unclear — issues persist longer than they should and recur across the organisation.',
    recommendation: 'Formalise data ownership roles by business domain and establish incident response protocols.',
    actions: [
      'Assign accountable data owners to each business domain with clear escalation paths.',
      'Define and rehearse data quality and breach incident playbooks.',
    ],
  },
  adoption: {
    issue: 'Data literacy is uneven — too many decisions still rely on instinct rather than the data you already have.',
    recommendation: 'Build a structured data literacy programme and embed self-serve analytics into daily workflows.',
    actions: [
      'Roll out role-based data literacy training with measurable competency targets.',
      'Deploy self-serve analytics tooling integrated into everyday team workflows.',
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

export function renderReport({ roi, maturityLabel, sectorLabel, headcountLabel }) {
  const pillarsSorted = Object.entries(roi.pillarBreakdown)
    .sort(([, a], [, b]) => b.value - a.value);

  const maturityScores = {};
  for (const [key, data] of Object.entries(roi.pillarBreakdown)) {
    maturityScores[key] = Math.max(0.1, 1 - data.gapScore);
  }

  const pillarRowsHtml = pillarsSorted.map(([key, data], i) => {
    const tier = riskTier(data.gapScore);
    const rankHtml = i < 3
      ? `<span class="pillar-row__rank">${i + 1}</span>`
      : '';
    return `
      <div class="pillar-row pillar-row--${tier}${i < 3 ? ' pillar-row--callout' : ''}">
        <div class="pillar-row__left">
          <div class="pillar-row__label-row">
            ${rankHtml}
            <span class="pillar-row__label">${PILLAR_LABELS_FULL[key]}</span>
          </div>
          <div class="pillar-row__risk">${riskLabel(tier)}</div>
        </div>
        <div class="pillar-row__value">${fmtCurrency(data.value)}</div>
      </div>
    `;
  }).join('');

  const topThree = pillarsSorted.slice(0, 3);
  const priorityCardsHtml = topThree.map(([key, data], i) => {
    const tier = riskTier(data.gapScore);
    const rec = RECOMMENDATIONS_BY_PILLAR[key];
    return `
      <div class="priority-card priority-card--${tier}">
        <div class="priority-card__head">
          <span class="priority-card__num">${i + 1}</span>
          <span class="priority-card__name">${PILLAR_LABELS_FULL[key]}</span>
          <span class="priority-card__badge">${tier === 'high' ? 'High Risk' : 'Moderate'}</span>
        </div>
        <div class="priority-card__leakage">
          <span class="priority-card__leakage-label">Attributed leakage</span>
          <strong class="priority-card__leakage-num">${fmtCurrency(data.value)}</strong>
        </div>
        <div class="priority-card__body">
          <p class="priority-card__issue">${rec.issue}</p>
          <div class="priority-card__rec">${rec.recommendation}</div>
          <ul class="priority-card__steps">
            ${rec.actions.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="screen report-screen">
      <div class="report">
        <div class="report__header">
          <div>
            <div class="report__eyebrow">Estimated Annual Value Leakage</div>
            <div class="report__total">${fmtCurrency(roi.totalValueAtRisk)}</div>
            <div class="report__range">Indicative range: ${fmtCurrency(roi.displayRange.low)} – ${fmtCurrency(roi.displayRange.high)}</div>
          </div>
          <div style="text-align:right">
            <div class="scorecard__maturity-label">Overall Maturity</div>
            <div class="scorecard__maturity-badge">${maturityLabel}</div>
            <div style="font-size:10px;color:#888;margin-top:6px">${sectorLabel} · ${headcountLabel} employees</div>
          </div>
        </div>
        <div class="report__overview">
          <div>${renderSpiderChart(maturityScores)}</div>
          <div class="report__pillars">
            <div class="scorecard__pillars-title">Value leakage by pillar</div>
            ${pillarRowsHtml}
          </div>
        </div>
        <div class="report__priorities">
          <div class="report__priorities-title">Top 3 priority areas</div>
          <div class="report__cards">${priorityCardsHtml}</div>
        </div>
        <div class="report__footer">
          <button class="report__methodology" id="methodology-link">Based on Gartner, IDC &amp; Forrester benchmarks · View methodology</button>
          <div class="report__cta-row">
            <div>
              <div class="recommendations__cta-text">Ready to close the gap?</div>
              <div class="recommendations__cta-sub">PwC's Data Governance Advisory team works with APAC organisations to turn these findings into action.</div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;flex-shrink:0">
              <button class="btn btn--ghost report__start-over" id="start-over">Start Over</button>
              <button class="btn btn--primary" id="talk-to-pwc">Talk to PwC →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
