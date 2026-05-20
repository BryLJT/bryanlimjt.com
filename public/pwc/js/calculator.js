import {
  SALARY_BY_HEADCOUNT,
  SECTOR_MULTIPLIER,
  PILLAR_WEIGHTS,
  MATURITY_DAMPENER,
  BOX_GAP_SCORES,
  SLIDER_GAP_SCORES,
} from './benchmarks.js';

const HEADCOUNT_MIDPOINT = {
  '<500': 250,
  '500-2000': 1250,
  '2000-10000': 6000,
  '10000+': 15000,
};

const DISPLAY_RANGE_PERCENT = 0.15;

export function responseToGap(response) {
  if (response.type === 'box') {
    const gap = BOX_GAP_SCORES[response.value];
    if (gap === undefined) throw new Error(`Invalid box response value: ${response.value} (expected 0-3)`);
    return gap;
  }
  if (response.type === 'slider') {
    const gap = SLIDER_GAP_SCORES[response.value];
    if (gap === undefined) throw new Error(`Invalid slider response value: ${response.value} (expected 1-5)`);
    return gap;
  }
  throw new Error(`Unknown response type: ${response.type}`);
}

export function pillarGapScore(responses) {
  const gaps = responses.map(responseToGap);
  return gaps.reduce((a, b) => a + b, 0) / gaps.length;
}

export function annualLabourCost(headcountBand) {
  return HEADCOUNT_MIDPOINT[headcountBand] * SALARY_BY_HEADCOUNT[headcountBand];
}

export function pillarValueAtRisk({ annualLabourCost, sectorMultiplier, pillarWeight, pillarGap }) {
  return annualLabourCost * sectorMultiplier * pillarWeight * pillarGap;
}

/**
 * Calculate ROI from responses.
 * @param responses - { headcount, sector, maturity, productivity, efficiency, growth, compliance, responsibility, adoption }
 *                    Pillar properties are arrays of 2 response objects: { type: 'box' | 'slider', value: number }
 * @returns {{ totalValueAtRisk, pillarBreakdown, displayRange }}
 *   - `pillarBreakdown[pillar].value` is the post-dampener value at risk for that pillar
 *   - Sum of pillar values equals `totalValueAtRisk` (the maturity dampener is applied per-pillar)
 *   - `displayRange` is ±15% around the total (a credibility band, not a statistical interval)
 */
export function calculateROI(responses) {
  const labourCost = annualLabourCost(responses.headcount);
  const sectorMult = SECTOR_MULTIPLIER[responses.sector];
  const dampener = MATURITY_DAMPENER[responses.maturity];

  if (labourCost === undefined || isNaN(labourCost)) {
    throw new Error(`Unknown headcount band: ${responses.headcount}`);
  }
  if (sectorMult === undefined) {
    throw new Error(`Unknown sector: ${responses.sector}`);
  }
  if (dampener === undefined) {
    throw new Error(`Unknown maturity level: ${responses.maturity}`);
  }

  const pillarBreakdown = {};
  let totalValueAtRisk = 0;

  for (const pillarKey of Object.keys(PILLAR_WEIGHTS)) {
    const gap = pillarGapScore(responses[pillarKey]);
    const rawValue = pillarValueAtRisk({
      annualLabourCost: labourCost,
      sectorMultiplier: sectorMult,
      pillarWeight: PILLAR_WEIGHTS[pillarKey],
      pillarGap: gap,
    });
    const dampenedValue = rawValue * dampener;
    pillarBreakdown[pillarKey] = { value: dampenedValue, gapScore: gap };
    totalValueAtRisk += dampenedValue;
  }

  return {
    totalValueAtRisk,
    pillarBreakdown,
    displayRange: {
      low: totalValueAtRisk * (1 - DISPLAY_RANGE_PERCENT),
      high: totalValueAtRisk * (1 + DISPLAY_RANGE_PERCENT),
    },
  };
}
