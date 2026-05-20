const PILLARS = ['productivity', 'efficiency', 'growth', 'compliance', 'responsibility', 'adoption'];
const SIZING_IDS = ['headcount', 'sector', 'maturity'];

export function createState() {
  return {
    currentScreen: 0,
    responses: {
      productivity: [],
      efficiency: [],
      growth: [],
      compliance: [],
      responsibility: [],
      adoption: [],
    },

    next() {
      this.currentScreen += 1;
    },

    back() {
      this.currentScreen = Math.max(0, this.currentScreen - 1);
    },

    recordResponse(pillar, questionIndex, response) {
      this.responses[pillar][questionIndex] = response;
    },

    recordSizing(id, value) {
      this.responses[id] = value;
    },

    isComplete() {
      const hasSizing = SIZING_IDS.every(id => this.responses[id] !== undefined);
      const hasPillars = PILLARS.every(p =>
        this.responses[p].length === 2 &&
        this.responses[p].every(r => r !== undefined)
      );
      return hasSizing && hasPillars;
    },
  };
}
