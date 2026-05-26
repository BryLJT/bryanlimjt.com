export const SALARY_BY_HEADCOUNT = {
  '<500': 65000,
  '500-2000': 70000,
  '2000-10000': 75000,
  '10000+': 80000,
};

export const SECTOR_MULTIPLIER = {
  'financial-services': 1.20,
  'healthcare': 1.15,
  'energy-utilities': 1.10,
  'government': 1.00,
  'retail-consumer': 1.15,
  'other': 1.00,
};

// Each pillar weight is the proportion of annual labour cost attributable to that
// pillar's data-governance impact. Weights are deliberately designed to sum to <1.0
// (currently 0.73) — they represent the share of labour cost at risk from data
// governance overall, not a probability distribution. Calculator code should sum
// these raw, not normalise them.
export const PILLAR_WEIGHTS = {
  productivity: 0.18,
  efficiency: 0.15,
  growth: 0.12,
  compliance: 0.10,
  responsibility: 0.08,
  adoption: 0.10,
};

// Higher maturity = lower dampener value. The dampener multiplies the raw pillar
// value at risk — advanced orgs have already captured value, so their risk is
// scaled down.
export const MATURITY_DAMPENER = {
  'ad-hoc': 1.10,
  'developing': 0.90,
  'defined': 0.75,
  'advanced': 0.55,
};

export const BOX_GAP_SCORES = [0.05, 0.25, 0.55, 0.80];

export const SLIDER_GAP_SCORES = {
  5: 0.05,
  4: 0.20,
  3: 0.40,
  2: 0.60,
  1: 0.80,
};
