// Question bank for the PwC Data Governance ROI Calculator.
// Each pillar has 2 questions. Sizing has 3 (headcount, sector, maturity).
// Question types: 'box' (4 options) or 'slider' (1-5 with descriptors).

export const SIZING_QUESTIONS = [
  {
    id: 'headcount',
    type: 'box',
    question: 'How many employees does your organisation have?',
    options: [
      { value: '<500', label: 'Under 500', sublabel: 'Small to mid-sized organisation' },
      { value: '500-2000', label: '500 – 2,000', sublabel: 'Mid-market scale' },
      { value: '2000-10000', label: '2,000 – 10,000', sublabel: 'Large enterprise' },
      { value: '10000+', label: '10,000+', sublabel: 'Global enterprise' },
    ],
  },
  {
    id: 'sector',
    type: 'tiles',
    question: "What is your organisation's primary industry?",
    options: [
      { value: 'financial-services', label: 'Financial Services' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'energy-utilities', label: 'Energy & Utilities' },
      { value: 'government', label: 'Government' },
      { value: 'retail-consumer', label: 'Retail & Consumer' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'maturity',
    type: 'box',
    question: "How would you describe your organisation's current approach to data management?",
    options: [
      { value: 'ad-hoc', label: 'Ad hoc', sublabel: 'No formal data practices' },
      { value: 'developing', label: 'Developing', sublabel: 'Some policies, inconsistently applied' },
      { value: 'defined', label: 'Defined', sublabel: 'Policies exist and are largely followed' },
      { value: 'advanced', label: 'Advanced', sublabel: 'Data governance is embedded in operations' },
    ],
  },
];

const SLIDER_DESCRIPTORS_LITERACY = [
  { num: 1, name: 'Ad hoc', desc: 'Data requests go to a central team. Most staff cannot self-serve.' },
  { num: 2, name: 'Limited', desc: 'Some teams use dashboards but rely on analysts to interpret them.' },
  { num: 3, name: 'Developing', desc: 'Core teams are data-literate. Most managers can read reports.' },
  { num: 4, name: 'Capable', desc: 'Most business units pull and interpret data independently.' },
  { num: 5, name: 'Embedded', desc: 'Data literacy is a hiring standard across all functions.' },
];

const SLIDER_DESCRIPTORS_GENERIC = [
  { num: 1, name: 'Not at all', desc: 'No formal capability or process in place.' },
  { num: 2, name: 'Limited', desc: 'Some capability, mostly informal or reactive.' },
  { num: 3, name: 'Developing', desc: 'Capability exists but is uneven across the organisation.' },
  { num: 4, name: 'Capable', desc: 'Strong, consistent capability across most business units.' },
  { num: 5, name: 'Fully embedded', desc: 'Best-in-class practices, formally measured and improving.' },
];

export const PILLAR_QUESTIONS = {
  productivity: [
    {
      type: 'slider',
      question: 'How confident are you that employees across your organisation can access the right data at the right time to do their jobs effectively?',
      descriptors: SLIDER_DESCRIPTORS_GENERIC,
    },
    {
      type: 'box',
      question: 'How much time do teams typically spend finding, validating or reconciling data before they can use it confidently?',
      options: [
        { value: 0, label: 'Rarely', sublabel: 'Under 1 hour per week' },
        { value: 1, label: 'Occasionally', sublabel: '1–3 hours per week' },
        { value: 2, label: 'Frequently', sublabel: '3–7 hours per week' },
        { value: 3, label: 'Extensively', sublabel: '7+ hours per week' },
      ],
    },
  ],
  efficiency: [
    {
      type: 'box',
      question: 'How often do data errors or quality issues cause delays in reporting or operational decisions?',
      options: [
        { value: 0, label: 'Rarely', sublabel: 'Teams move fast with high confidence' },
        { value: 1, label: 'Occasionally', sublabel: 'A few times a month' },
        { value: 2, label: 'Frequently', sublabel: 'Weekly disruptions' },
        { value: 3, label: 'Constantly', sublabel: 'It is the norm' },
      ],
    },
    {
      type: 'slider',
      question: 'To what extent are your data workflows and handoffs between teams automated vs. manual?',
      descriptors: SLIDER_DESCRIPTORS_GENERIC,
    },
  ],
  growth: [
    {
      type: 'slider',
      question: 'How effectively does your organisation use data to identify new revenue opportunities or market trends?',
      descriptors: SLIDER_DESCRIPTORS_GENERIC,
    },
    {
      type: 'box',
      question: 'How quickly can your organisation produce reliable data to support a new business decision or initiative?',
      options: [
        { value: 0, label: 'Days', sublabel: 'Fast, trusted data on demand' },
        { value: 1, label: 'Weeks', sublabel: 'Manageable but requires effort' },
        { value: 2, label: 'Months', sublabel: 'Major delays — slows decisions' },
        { value: 3, label: "We often can't", sublabel: 'Data simply is not available in time' },
      ],
    },
  ],
  compliance: [
    {
      type: 'box',
      question: 'How consistent are your data governance controls (access, classification, retention) across business units?',
      options: [
        { value: 0, label: 'Consistent and audited', sublabel: 'Controls are uniform and verified' },
        { value: 1, label: 'Mostly consistent', sublabel: 'Minor variation between units' },
        { value: 2, label: 'Inconsistent', sublabel: 'Significant gaps between units' },
        { value: 3, label: 'No formal controls', sublabel: 'Practices vary entirely by team' },
      ],
    },
    {
      type: 'slider',
      question: "How confident are you in your organisation's ability to respond to a data-related regulatory request within required timelines?",
      descriptors: SLIDER_DESCRIPTORS_GENERIC,
    },
  ],
  responsibility: [
    {
      type: 'box',
      question: 'When a data quality issue arises, how clear is it who is responsible for resolving it?',
      options: [
        { value: 0, label: 'Always clear', sublabel: 'Defined ownership for every dataset' },
        { value: 1, label: 'Usually clear', sublabel: 'Ownership exists for most areas' },
        { value: 2, label: 'Often unclear', sublabel: 'Responsibility is debated case by case' },
        { value: 3, label: 'No defined ownership', sublabel: 'Issues go unaddressed' },
      ],
    },
    {
      type: 'slider',
      question: 'To what extent does your organisation have formal processes for responding to data incidents or breaches?',
      descriptors: SLIDER_DESCRIPTORS_GENERIC,
    },
  ],
  adoption: [
    {
      type: 'slider',
      question: 'How confident are you that employees across your organisation can interpret and act on data independently?',
      descriptors: SLIDER_DESCRIPTORS_LITERACY,
    },
    {
      type: 'box',
      question: 'Does your organisation have formal data literacy or training programmes in place?',
      options: [
        { value: 0, label: 'Yes, organisation-wide', sublabel: 'Mandatory programmes across all functions' },
        { value: 1, label: 'Yes, for select teams', sublabel: 'Limited to data or analytics roles' },
        { value: 2, label: 'Informal only', sublabel: 'On-the-job learning, no curriculum' },
        { value: 3, label: 'No', sublabel: 'No data literacy programmes in place' },
      ],
    },
  ],
};

export const PILLAR_LABELS = {
  productivity: 'Productivity',
  efficiency: 'Efficiency',
  growth: 'Innovation',
  compliance: 'Compliance',
  responsibility: 'Responsibility',
  adoption: 'Literacy',
};
