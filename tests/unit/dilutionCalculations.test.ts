import { describe, it, expect } from 'vitest';
import { calculateDilutionScenarios, calculateSeriesCOwnership } from '../../src/vestaron/utils/dilutionCalculations';
import type { DilutionInputs } from '../../src/vestaron/store/slices/dilutionSlice';

/**
 * Unit tests for dilution calculations - converted from E2E tests
 * These tests verify the economics logic without touching the DOM
 */
describe('Dilution Impact Scenarios - Economics Logic (Unit Tests)', () => {
  /**
   * Helper function to validate dilution scenario results
   */
  function validateDilutionScenario(
    result: ReturnType<typeof calculateDilutionScenarios>,
    expected: {
      scenario1?: {
        stage1?: { ev?: number; existingShareholders?: number; seriesC?: number; employeePool?: number };
        stage2?: { ev?: number; existingShareholders?: number; seriesC?: number; employeePool?: number };
        stage3?: { ev?: number; existingShareholders?: number; seriesC?: number; employeePool?: number };
      };
      scenario2?: {
        stage1?: { ev?: number; existingShareholders?: number; seriesC?: number; employeePool?: number };
        stage2?: { ev?: number; existingShareholders?: number; seriesC?: number; employeePool?: number };
        stage3?: { ev?: number; existingShareholders?: number; seriesC?: number; employeePool?: number };
      };
    }
  ) {
    // Validate Scenario 1: Pool Established BEFORE Round C
    if (expected.scenario1) {
      if (expected.scenario1.stage1) {
        const stage1 = expected.scenario1.stage1;
        if (stage1.ev !== undefined) expect(result.before.initial.ev).toBeCloseTo(stage1.ev, 1);
        if (stage1.existingShareholders !== undefined) expect(result.before.initial.existing).toBeCloseTo(stage1.existingShareholders, 1);
        if (stage1.seriesC !== undefined) expect(result.before.initial.seriesC).toBeCloseTo(stage1.seriesC, 1);
        if (stage1.employeePool !== undefined) expect(result.before.initial.pool).toBeCloseTo(stage1.employeePool, 1);
      }
      if (expected.scenario1.stage2) {
        const stage2 = expected.scenario1.stage2;
        if (stage2.ev !== undefined) expect(result.before.afterPool.ev).toBeCloseTo(stage2.ev, 1);
        if (stage2.existingShareholders !== undefined) expect(result.before.afterPool.existing).toBeCloseTo(stage2.existingShareholders, 1);
        if (stage2.seriesC !== undefined) expect(result.before.afterPool.seriesC).toBeCloseTo(stage2.seriesC, 1);
        if (stage2.employeePool !== undefined) expect(result.before.afterPool.pool).toBeCloseTo(stage2.employeePool, 1);
      }
      if (expected.scenario1.stage3) {
        const stage3 = expected.scenario1.stage3;
        if (stage3.ev !== undefined) expect(result.before.final.ev).toBeCloseTo(stage3.ev, 1);
        if (stage3.existingShareholders !== undefined) expect(result.before.final.existing).toBeCloseTo(stage3.existingShareholders, 1);
        if (stage3.seriesC !== undefined) expect(result.before.final.seriesC).toBeCloseTo(stage3.seriesC, 1);
        if (stage3.employeePool !== undefined) expect(result.before.final.pool).toBeCloseTo(stage3.employeePool, 1);
        
        // Verify ownership percentages sum to 100%
        expect(result.before.final.existing + result.before.final.seriesC + result.before.final.pool).toBeCloseTo(100, 2);
      }
    }

    // Validate Scenario 2: Pool Established AFTER Round C
    if (expected.scenario2) {
      if (expected.scenario2.stage1) {
        const stage1 = expected.scenario2.stage1;
        if (stage1.ev !== undefined) expect(result.after.initial.ev).toBeCloseTo(stage1.ev, 1);
        if (stage1.existingShareholders !== undefined) expect(result.after.initial.existing).toBeCloseTo(stage1.existingShareholders, 1);
        if (stage1.seriesC !== undefined) expect(result.after.initial.seriesC).toBeCloseTo(stage1.seriesC, 1);
        if (stage1.employeePool !== undefined) expect(result.after.initial.pool).toBeCloseTo(stage1.employeePool, 1);
      }
      if (expected.scenario2.stage2) {
        const stage2 = expected.scenario2.stage2;
        if (stage2.ev !== undefined) expect(result.after.afterRoundC.ev).toBeCloseTo(stage2.ev, 1);
        if (stage2.existingShareholders !== undefined) expect(result.after.afterRoundC.existing).toBeCloseTo(stage2.existingShareholders, 1);
        if (stage2.seriesC !== undefined) expect(result.after.afterRoundC.seriesC).toBeCloseTo(stage2.seriesC, 1);
        if (stage2.employeePool !== undefined) expect(result.after.afterRoundC.pool).toBeCloseTo(stage2.employeePool, 1);
      }
      if (expected.scenario2.stage3) {
        const stage3 = expected.scenario2.stage3;
        if (stage3.ev !== undefined) expect(result.after.final.ev).toBeCloseTo(stage3.ev, 1);
        if (stage3.existingShareholders !== undefined) expect(result.after.final.existing).toBeCloseTo(stage3.existingShareholders, 1);
        if (stage3.seriesC !== undefined) expect(result.after.final.seriesC).toBeCloseTo(stage3.seriesC, 1);
        if (stage3.employeePool !== undefined) expect(result.after.final.pool).toBeCloseTo(stage3.employeePool, 1);
        
        // Verify ownership percentages sum to 100%
        expect(result.after.final.existing + result.after.final.seriesC + result.after.final.pool).toBeCloseTo(100, 2);
      }
    }
  }

  describe('Default Case Study Scenario', () => {
    it('should calculate correctly for case study values (270M pre-money, 90M raised, 15% pool)', () => {
      const inputs: DilutionInputs = {
        preMoney: 270,
        seriesCAmount: 90,
        employeePool: 15,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 270, existingShareholders: 85, seriesC: 0, employeePool: 15 },
          stage3: { ev: 360, existingShareholders: 63.75, seriesC: 25, employeePool: 11.25 },
        },
        scenario2: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 360, existingShareholders: 75, seriesC: 25, employeePool: 0 },
          stage3: { ev: 360, existingShareholders: 68, seriesC: 17, employeePool: 15 },
        },
      });
    });
  });

  describe('High Pre-Money Valuation Scenarios', () => {
    it('should calculate correctly for high pre-money (500M pre-money, 100M raised, 15% pool)', () => {
      const inputs: DilutionInputs = {
        preMoney: 500,
        seriesCAmount: 100,
        employeePool: 15,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 500, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 500, existingShareholders: 85, seriesC: 0, employeePool: 15 },
          stage3: { ev: 600, existingShareholders: 70.83, seriesC: 16.67, employeePool: 12.5 },
        },
        scenario2: {
          stage1: { ev: 500, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 600, existingShareholders: 83.33, seriesC: 16.67, employeePool: 0 },
          stage3: { ev: 600, existingShareholders: 72.86, seriesC: 12.14, employeePool: 15 },
        },
      });
    });
  });

  describe('Large Series C Round Scenarios', () => {
    it('should calculate correctly for large Series C round (270M pre-money, 200M raised, 15% pool)', () => {
      const inputs: DilutionInputs = {
        preMoney: 270,
        seriesCAmount: 200,
        employeePool: 15,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 270, existingShareholders: 85, seriesC: 0, employeePool: 15 },
          stage3: { ev: 470, existingShareholders: 48.83, seriesC: 42.55, employeePool: 8.62 },
        },
        scenario2: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 470, existingShareholders: 57.4, seriesC: 42.6, employeePool: 0 },
          stage3: { ev: 470, existingShareholders: 59.63, seriesC: 25.37, employeePool: 15 },
        },
      });
    });
  });

  describe('Small Equity Pool Scenarios', () => {
    it('should calculate correctly for small equity pool (270M pre-money, 90M raised, 5% pool)', () => {
      const inputs: DilutionInputs = {
        preMoney: 270,
        seriesCAmount: 90,
        employeePool: 5,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 270, existingShareholders: 95, seriesC: 0, employeePool: 5 },
          stage3: { ev: 360, existingShareholders: 71.25, seriesC: 25, employeePool: 3.75 },
        },
        scenario2: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 360, existingShareholders: 75, seriesC: 25, employeePool: 0 },
          stage3: { ev: 360, existingShareholders: 76, seriesC: 19, employeePool: 5 },
        },
      });
    });
  });

  describe('Large Equity Pool Scenarios', () => {
    it('should calculate correctly for large equity pool (270M pre-money, 90M raised, 25% pool)', () => {
      const inputs: DilutionInputs = {
        preMoney: 270,
        seriesCAmount: 90,
        employeePool: 25,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 270, existingShareholders: 75, seriesC: 0, employeePool: 25 },
          stage3: { ev: 360, existingShareholders: 56.25, seriesC: 25, employeePool: 18.75 },
        },
        scenario2: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 360, existingShareholders: 75, seriesC: 25, employeePool: 0 },
          stage3: { ev: 360, existingShareholders: 60, seriesC: 15, employeePool: 25 },
        },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero equity pool', () => {
      const inputs: DilutionInputs = {
        preMoney: 270,
        seriesCAmount: 90,
        employeePool: 0,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage3: { ev: 360, existingShareholders: 75, seriesC: 25, employeePool: 0 },
        },
        scenario2: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 360, existingShareholders: 75, seriesC: 25, employeePool: 0 },
          stage3: { ev: 360, existingShareholders: 80, seriesC: 20, employeePool: 0 },
        },
      });
    });

    it('should handle very small pre-money valuation', () => {
      const inputs: DilutionInputs = {
        preMoney: 10,
        seriesCAmount: 5,
        employeePool: 15,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 10, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 10, existingShareholders: 85, seriesC: 0, employeePool: 15 },
          stage3: { ev: 15, existingShareholders: 56.67, seriesC: 33.33, employeePool: 10 },
        },
        scenario2: {
          stage1: { ev: 10, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 15, existingShareholders: 66.67, seriesC: 33.33, employeePool: 0 },
          stage3: { ev: 15, existingShareholders: 63.75, seriesC: 21.25, employeePool: 15 },
        },
      });
    });

    it('should handle very large pre-money valuation', () => {
      const inputs: DilutionInputs = {
        preMoney: 1000,
        seriesCAmount: 200,
        employeePool: 15,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 1000, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 1000, existingShareholders: 85, seriesC: 0, employeePool: 15 },
          stage3: { ev: 1200, existingShareholders: 70.83, seriesC: 16.67, employeePool: 12.5 },
        },
        scenario2: {
          stage1: { ev: 1000, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 1200, existingShareholders: 83.33, seriesC: 16.67, employeePool: 0 },
          stage3: { ev: 1200, existingShareholders: 72.86, seriesC: 12.14, employeePool: 15 },
        },
      });
    });

    it('should handle Series C amount equal to pre-money', () => {
      const inputs: DilutionInputs = {
        preMoney: 270,
        seriesCAmount: 270,
        employeePool: 15,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 270, existingShareholders: 85, seriesC: 0, employeePool: 15 },
          stage3: { ev: 540, existingShareholders: 42.5, seriesC: 50, employeePool: 7.5 },
        },
        scenario2: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 540, existingShareholders: 50, seriesC: 50, employeePool: 0 },
          stage3: { ev: 540, existingShareholders: 56.67, seriesC: 28.33, employeePool: 15 },
        },
      });
    });

    it('should handle maximum equity pool (50%)', () => {
      const inputs: DilutionInputs = {
        preMoney: 270,
        seriesCAmount: 90,
        employeePool: 50,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 270, existingShareholders: 50, seriesC: 0, employeePool: 50 },
          stage3: { ev: 360, existingShareholders: 37.5, seriesC: 25, employeePool: 37.5 },
        },
        scenario2: {
          stage1: { ev: 270, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 360, existingShareholders: 75, seriesC: 25, employeePool: 0 },
          stage3: { ev: 360, existingShareholders: 40, seriesC: 10, employeePool: 50 },
        },
      });
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle scenario with higher valuation (400M pre-money, 150M raised, 20% pool)', () => {
      const inputs: DilutionInputs = {
        preMoney: 400,
        seriesCAmount: 150,
        employeePool: 20,
      };

      const result = calculateDilutionScenarios(inputs);
      validateDilutionScenario(result, {
        scenario1: {
          stage1: { ev: 400, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 400, existingShareholders: 80, seriesC: 0, employeePool: 20 },
          stage3: { ev: 550, existingShareholders: 58.18, seriesC: 27.27, employeePool: 14.55 },
        },
        scenario2: {
          stage1: { ev: 400, existingShareholders: 100, seriesC: 0, employeePool: 0 },
          stage2: { ev: 550, existingShareholders: 72.73, seriesC: 27.27, employeePool: 0 },
          stage3: { ev: 550, existingShareholders: 62.86, seriesC: 17.14, employeePool: 20 },
        },
      });
    });
  });
});

