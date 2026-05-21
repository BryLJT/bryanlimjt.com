// Renders a 6-axis spider chart as SVG string.
// Input: scores = { productivity, efficiency, growth, compliance, responsibility, adoption }
// Each score is 0..1 representing maturity (1 - gap). Bigger polygon = stronger maturity.

const CENTER = { x: 150, y: 140 };
const RADIUS = 90;
// Clockwise from top.
const PILLAR_ORDER = ['productivity', 'growth', 'compliance', 'adoption', 'responsibility', 'efficiency'];
const PILLAR_LABELS_SHORT = {
  productivity: 'Productivity',
  growth: 'Innovation',
  compliance: 'Compliance',
  adoption: 'Literacy',
  responsibility: 'Responsibility',
  efficiency: 'Efficiency',
};

function axisAngleDeg(i) { return -90 + i * 60; }
function deg2rad(d) { return d * Math.PI / 180; }

function pointAt(fraction, angleDeg) {
  const r = fraction * RADIUS;
  const rad = deg2rad(angleDeg);
  return { x: CENTER.x + r * Math.cos(rad), y: CENTER.y + r * Math.sin(rad) };
}

function hexagonPoints(fraction) {
  return PILLAR_ORDER.map((_, i) => pointAt(fraction, axisAngleDeg(i)))
    .map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function labelPosition(i) {
  const outer = pointAt(1, axisAngleDeg(i));
  const angle = axisAngleDeg(i);
  const dx = Math.cos(deg2rad(angle)) * 14;
  const dy = Math.sin(deg2rad(angle)) * 14;
  let anchor = 'middle';
  if (Math.abs(Math.cos(deg2rad(angle))) > 0.3) anchor = Math.cos(deg2rad(angle)) > 0 ? 'start' : 'end';
  return { x: outer.x + dx, y: outer.y + dy, anchor };
}

export function renderSpiderChart(scores) {
  const dataPoints = PILLAR_ORDER.map((p, i) => pointAt(scores[p], axisAngleDeg(i)));
  const dataPolygon = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const rings = [0.2, 0.4, 0.6, 0.8, 1.0].map(f => {
    const stroke = f === 0.8 ? 'stroke="#2D2926" stroke-dasharray="4,3"' : 'stroke="#E8E8E8"';
    return `<polygon points="${hexagonPoints(f)}" fill="none" ${stroke} stroke-width="1.2" />`;
  }).join('');

  const axes = PILLAR_ORDER.map((_, i) => {
    const end = pointAt(1, axisAngleDeg(i));
    return `<line x1="${CENTER.x}" y1="${CENTER.y}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(1)}" stroke="#E8E8E8" stroke-width="1" />`;
  }).join('');

  const labels = PILLAR_ORDER.map((p, i) => {
    const pos = labelPosition(i);
    return `<text x="${pos.x.toFixed(1)}" y="${pos.y.toFixed(1)}" text-anchor="${pos.anchor}" font-size="10" font-weight="600" fill="#555" font-family="system-ui">${PILLAR_LABELS_SHORT[p]}</text>`;
  }).join('');

  const dots = dataPoints.map(p =>
    `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="#FD5108" />`
  ).join('');

  return `
    <svg width="300" height="280" viewBox="0 0 300 280">
      ${rings}
      ${axes}
      <polygon points="${dataPolygon}" fill="#FD5108" fill-opacity="0.18" stroke="#FD5108" stroke-width="2" />
      ${dots}
      ${labels}
      <line x1="24" y1="268" x2="42" y2="268" stroke="#2D2926" stroke-dasharray="4,3" stroke-width="1.5" />
      <text x="46" y="272" font-size="9" font-family="system-ui" fill="#888">Industry benchmark (80%)</text>
    </svg>
  `;
}
