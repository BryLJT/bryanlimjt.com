# Methodology & Assumptions

This document underpins every number shown in the PwC Data Governance ROI Calculator. Every assumption is stated below so the calculation is auditable and defensible in client conversations.

> **Status:** Indicative starting values. Each benchmark requires primary source verification before client deployment.

## 1. Annual Labour Cost

Annual labour cost is the base multiplier for the ROI calculation. It is derived from headcount × assumed average annual salary by band:

| Headcount band | Mid-point | Avg salary (APAC blended, USD) | Annual labour cost |
|---|---|---|---|
| <500 | 250 | $65,000 | $16.25M |
| 500–2,000 | 1,250 | $70,000 | $87.5M |
| 2,000–10,000 | 6,000 | $75,000 | $450M |
| 10,000+ | 15,000 | $80,000 | $1.2B |

**Source assumptions to validate:** Mercer APAC Compensation Survey; MOM Singapore wage data; sector-specific overlays.

## 2. Sector Multipliers

| Sector | Multiplier | Rationale |
|---|---|---|
| Financial Services | 1.20 | Higher data sensitivity, regulatory cost, talent premium |
| Healthcare | 1.15 | PHI obligations, clinical decision risk |
| Energy & Utilities | 1.10 | Operational technology data risk |
| Government | 1.00 | Baseline |
| Retail & Consumer | 1.15 | High-volume consumer/PII data, personalisation and pricing reliance on data quality |
| Other | 1.00 | Baseline |

**Source to validate:** Gartner sector-specific data management cost studies; IDC industry digital transformation indices.

## 3. Response-to-Gap Mapping

Each response maps non-linearly to a "gap score", the proportion of pillar value at risk:

**4-point box (best → worst):** 5% / 25% / 55% / 80%
**1–5 slider (best → worst):** 5% / 20% / 40% / 60% / 80%

The non-linear distribution reflects that the move from "developing" to "ad hoc" carries disproportionate risk. Gaps compound.

**Source to validate:** Gartner Data Quality Market Survey; IBM Cost of Poor Data Quality studies.

## 4. Pillar Benchmark Weights

Each pillar carries a weight expressed as a proportion of annual labour cost, the maximum value at risk for that pillar:

| Pillar | Weight | Primary source |
|---|---|---|
| Productivity | 18% | Gartner: "employees spend 20–25% of time on data quality tasks" |
| Efficiency | 15% | IDC: "data friction costs average 21% of productivity" |
| Growth / Innovation | 12% | Forrester: "data-driven firms grow 30% faster" (delta applied) |
| Control / Compliance | 10% | IBM: regulatory response costs avg 10–15% of IT spend |
| Accountability | 8% | Gartner: "data incidents cost avg $3.86M" (normalised to labour) |
| Adoption / Literacy | 10% | McKinsey: "data literacy gap reduces workforce effectiveness by 10–12%" |

**All weights require primary source verification before external use.**

## 5. Maturity Dampener

| Self-rated maturity | Dampener |
|---|---|
| Ad hoc | 1.10 |
| Developing | 0.90 |
| Defined | 0.75 |
| Advanced | 0.55 |

**Source:** DCAM maturity model stage definitions.

## 6. Calculation Formula

For each pillar:
```
pillar_value_at_risk = annual_labour_cost × sector_multiplier × pillar_weight × pillar_gap_score × maturity_dampener
```

Where `pillar_gap_score` is the average of the two question gap scores.

Total ROI:
```
total_value_at_risk = Σ(pillar_value_at_risk)
display_range = total_value_at_risk × [0.85, 1.15]
```

The ±15% display range reflects estimation uncertainty. It is a design choice for credibility, not a statistical confidence interval.

## 7. Scope Limitations

This calculator does **not** account for:
- Capital cost of poor data infrastructure
- Reputational risk and customer trust impact
- Opportunity cost of delayed innovation
- Cross-organisational dependencies (e.g. supplier data exposure)

These are deliberate scope choices to keep the calculation tractable. PwC consultants should surface these dimensions during follow-up conversations.
