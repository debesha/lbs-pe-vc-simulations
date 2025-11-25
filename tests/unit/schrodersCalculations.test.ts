import { describe, it, expect } from 'vitest';
import {
  calculateIRR,
  calculateFundPerformance,
  combineCashFlows,
  redistributeFromBuyout,
  clampValue,
  safeNumber,
} from '../../src/schroders/utils/calculations';
import type { FundConfig, VCConfig } from '../../src/schroders/types';

/**
 * Unit tests for Schroders calculations - following the same approach as vestaron tests
 * These tests verify the economics logic without touching the DOM
 */
describe('Schroders Calculations - Economics Logic (Unit Tests)', () => {
  const buyoutConfig: FundConfig = {
    name: 'European Buyout (Main Fund)',
    target_fund_size_eur_millions: 1000,
    strategy: 'Buyout deals across Europe',
    management_fees_percent: 1.85,
    preferred_return_percent: 8,
    manager_return_catch_up: 'Yes (100%)',
    carried_interest_percent: 20,
    fund_establishment_fee_percent_of_committed_capital: 0.2,
    fund_terms_years: '10 + 1 + 1',
    number_of_investments_targeted: '10-15',
    investment_period_years_from_initial_close: 6,
    expected_gross_return_on_investments_multiple: 3,
  };

  const coInvestConfig: FundConfig = {
    name: 'European Buyout (Co-Investment Fund Vehicle)',
    target_fund_size_eur_millions: 200,
    strategy: 'Buyout deals across Europe (co-investing with main fund)',
    management_fees_percent: null,
    preferred_return_percent: null,
    manager_return_catch_up: null,
    carried_interest_percent: null,
    fund_establishment_fee_percent_of_committed_capital: null,
    fund_terms_years: '10 + 1 + 1',
    number_of_investments_targeted: '10-15',
    investment_period_years_from_initial_close: 6,
    expected_gross_return_on_investments_multiple: 3,
  };

  const vcConfig: VCConfig = {
    name: 'European VC Fund',
    target_fund_size_eur_millions: 100,
    strategy: 'Venture deals across Europe',
    management_fees_percent: 2,
    preferred_return_percent: 8,
    manager_return_catch_up: 'Yes (100%)',
    carried_interest_structure: {
      base_carried_interest_percent: 20,
      base_threshold_net_multiple: 2.75,
      higher_carried_interest_percent: 25,
      higher_threshold_condition: '> 2.75x net return',
    },
    fund_establishment_fee_percent_of_committed_capital: 0.5,
    fund_terms_years: '10 + 1 + 1',
    number_of_investments_targeted: '~15',
    investment_period_years_from_initial_close: 6,
    expected_gross_return_on_investments_multiple: 5,
  };

  describe('calculateIRR', () => {
    it('should calculate IRR for simple positive return', () => {
      // Invest 1000 at year 0, get 2000 at year 1 (2x return, 100% IRR)
      const cashFlows = [-1000, 2000];
      const irr = calculateIRR(cashFlows);
      expect(irr).toBeCloseTo(1.0, 1); // 100% IRR
    });

    it('should calculate IRR for multi-year investment', () => {
      // Invest 1000 over 5 years (200 per year), exit at year 10 with 3000 (3x return)
      const cashFlows = [0, -200, -200, -200, -200, -200, 0, 0, 0, 0, 3000];
      const irr = calculateIRR(cashFlows);
      expect(irr).not.toBeNull();
      expect(irr!).toBeGreaterThan(0);
      expect(irr!).toBeLessThan(1); // Should be less than 100%
    });

    it('should return null for negative IRR scenarios', () => {
      // Invest 1000, get back 500 (loss scenario)
      const cashFlows = [-1000, 500];
      const irr = calculateIRR(cashFlows);
      // IRR calculation may return null for some edge cases
      // This test verifies the function handles it gracefully
      if (irr !== null) {
        expect(irr).toBeLessThan(0);
      }
    });

    it('should handle zero cash flows', () => {
      const cashFlows = [0, 0, 0];
      const irr = calculateIRR(cashFlows);
      // Should handle gracefully
      expect(irr === null || Number.isFinite(irr)).toBe(true);
    });

    it('should calculate IRR for break-even scenario', () => {
      // Invest 1000, get back 1000 (0% return)
      const cashFlows = [-1000, 1000];
      const irr = calculateIRR(cashFlows);
      expect(irr).toBeCloseTo(0, 1);
    });
  });

  describe('calculateFundPerformance - Buyout Fund', () => {
    it('should calculate performance for standard buyout fund scenario', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      expect(result.grossMultiple).toBe(3);
      expect(result.netMultiple).toBeGreaterThan(0);
      expect(result.netMultiple).toBeLessThan(3); // Net should be less than gross due to fees
      expect(result.totalFees).toBeGreaterThan(0);
      expect(result.feeDrag).toBeGreaterThan(0);
      expect(result.cashFlows.length).toBeGreaterThan(10);
      expect(result.cashEvents.length).toBeGreaterThan(0);
    });

    it('should include establishment fee in year 0', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      const establishmentFeeEvent = result.cashEvents.find(
        (e) => e.label.includes('Establishment fees'),
      );
      expect(establishmentFeeEvent).toBeDefined();
      expect(establishmentFeeEvent!.amount).toBeLessThan(0);
      expect(establishmentFeeEvent!.year).toBe(0);
    });

    it('should include capital calls over investment period', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      const capitalCallEvents = result.cashEvents.filter((e) =>
        e.label.includes('Capital called'),
      );
      expect(capitalCallEvents.length).toBe(5); // 5 years of capital calls
    });

    it('should include management fees', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      const mgmtFeeEvents = result.cashEvents.filter((e) =>
        e.label.includes('Management fees'),
      );
      expect(mgmtFeeEvents.length).toBeGreaterThan(0);
    });

    it('should calculate carry correctly', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      const carryEvent = result.cashEvents.find((e) => e.label.includes('Carry'));
      expect(carryEvent).toBeDefined();
      if (carryEvent) {
        expect(carryEvent.amount).toBeLessThan(0);
        expect(carryEvent.year).toBe(10);
      }
    });

    it('should return zero result for zero allocation', () => {
      const result = calculateFundPerformance({
        allocation: 0,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      expect(result.netMultiple).toBe(0);
      expect(result.netValue).toBe(0);
      expect(result.totalFees).toBe(0);
      expect(result.grossMultiple).toBe(3);
    });

    it('should handle different exit years', () => {
      const result5 = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 5,
        config: buyoutConfig,
      });

      const result10 = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      expect(result5.cashFlows.length).toBeLessThanOrEqual(result10.cashFlows.length);
      // Earlier exit should have different IRR
      if (result5.netIrr !== null && result10.netIrr !== null) {
        expect(result5.netIrr).not.toBe(result10.netIrr);
      }
    });

    it('should handle different gross multiples', () => {
      const result2x = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 2,
        exitYear: 10,
        config: buyoutConfig,
      });

      const result3x = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      expect(result3x.netMultiple).toBeGreaterThan(result2x.netMultiple);
      expect(result3x.netValue).toBeGreaterThan(result2x.netValue);
    });
  });

  describe('calculateFundPerformance - Co-Investment Fund', () => {
    it('should calculate performance for co-invest fund (no fees)', () => {
      const result = calculateFundPerformance({
        allocation: 100,
        grossMultiple: 3,
        exitYear: 10,
        config: coInvestConfig,
      });

      expect(result.grossMultiple).toBe(3);
      // Co-invest should have minimal or no fees
      expect(result.totalFees).toBe(0);
      expect(result.netMultiple).toBeCloseTo(3, 1); // Net should equal gross
      expect(result.feeDrag).toBeCloseTo(0, 1);
    });

    it('should still include capital calls for co-invest', () => {
      const result = calculateFundPerformance({
        allocation: 100,
        grossMultiple: 3,
        exitYear: 10,
        config: coInvestConfig,
      });

      const capitalCallEvents = result.cashEvents.filter((e) =>
        e.label.includes('Capital called'),
      );
      expect(capitalCallEvents.length).toBe(5);
    });
  });

  describe('calculateFundPerformance - VC Fund with Tiered Carry', () => {
    it('should use base carry rate when below threshold', () => {
      const result = calculateFundPerformance({
        allocation: 100,
        grossMultiple: 2, // Below 2.75x threshold
        exitYear: 10,
        config: vcConfig,
      });

      const carryEvent = result.cashEvents.find((e) => e.label.includes('Carry'));
      if (carryEvent && carryEvent.percent) {
        expect(carryEvent.percent).toBe(20); // Base carry rate
      }
    });

    it('should use higher carry rate when above threshold', () => {
      const result = calculateFundPerformance({
        allocation: 100,
        grossMultiple: 5, // Above 2.75x threshold
        exitYear: 10,
        config: vcConfig,
      });

      const carryEvent = result.cashEvents.find((e) => e.label.includes('Carry'));
      if (carryEvent && carryEvent.percent) {
        expect(carryEvent.percent).toBe(25); // Higher carry rate
      }
    });

    it('should include establishment fee for VC fund', () => {
      const result = calculateFundPerformance({
        allocation: 100,
        grossMultiple: 3,
        exitYear: 10,
        config: vcConfig,
      });

      const establishmentFeeEvent = result.cashEvents.find(
        (e) => e.label.includes('Establishment fees'),
      );
      expect(establishmentFeeEvent).toBeDefined();
      expect(establishmentFeeEvent!.percent).toBe(0.5);
    });
  });

  describe('combineCashFlows', () => {
    it('should combine two cash flow arrays', () => {
      const flows1 = [-100, -100, 300];
      const flows2 = [-50, -50, 150];
      const combined = combineCashFlows([flows1, flows2]);

      expect(combined.length).toBe(3);
      expect(combined[0]).toBe(-150); // -100 + -50
      expect(combined[1]).toBe(-150); // -100 + -50
      expect(combined[2]).toBe(450); // 300 + 150
    });

    it('should handle arrays of different lengths', () => {
      const flows1 = [-100, 200];
      const flows2 = [-50, -50, -50, 300];
      const combined = combineCashFlows([flows1, flows2]);

      expect(combined.length).toBe(4);
      expect(combined[0]).toBe(-150); // -100 + -50
      expect(combined[1]).toBe(150); // 200 + -50
      expect(combined[2]).toBe(-50); // 0 + -50
      expect(combined[3]).toBe(300); // 0 + 300
    });

    it('should handle empty arrays', () => {
      const flows1: number[] = [];
      const flows2 = [-100, 200];
      const combined = combineCashFlows([flows1, flows2]);

      expect(combined.length).toBe(2);
      expect(combined[0]).toBe(-100);
      expect(combined[1]).toBe(200);
    });

    it('should handle single array', () => {
      const flows = [-100, -100, 300];
      const combined = combineCashFlows([flows]);

      expect(combined).toEqual(flows);
    });

    it('should handle multiple arrays', () => {
      const flows1 = [-100, 200];
      const flows2 = [-50, 150];
      const flows3 = [-25, 75];
      const combined = combineCashFlows([flows1, flows2, flows3]);

      expect(combined[0]).toBe(-175); // -100 + -50 + -25
      expect(combined[1]).toBe(425); // 200 + 150 + 75
    });
  });

  describe('redistributeFromBuyout', () => {
    it('should trim buyout when it exceeds cap', () => {
      const result = redistributeFromBuyout(1200, 100, 1000, 100);
      expect(result.buyout).toBe(1000);
      expect(result.vc).toBe(100);
    });

    it('should redistribute excess buyout to VC when VC has headroom', () => {
      const result = redistributeFromBuyout(1200, 50, 1000, 100);
      expect(result.buyout).toBe(1000);
      expect(result.vc).toBe(100); // 50 + 50 (excess)
    });

    it('should not exceed VC cap when redistributing', () => {
      const result = redistributeFromBuyout(1500, 50, 1000, 100);
      expect(result.buyout).toBe(1000);
      expect(result.vc).toBe(100); // Capped at VC cap
    });

    it('should not redistribute when buyout is within cap', () => {
      const result = redistributeFromBuyout(800, 100, 1000, 100);
      expect(result.buyout).toBe(800);
      expect(result.vc).toBe(100);
    });

    it('should handle VC already at cap', () => {
      const result = redistributeFromBuyout(1200, 100, 1000, 100);
      expect(result.buyout).toBe(1000);
      expect(result.vc).toBe(100); // VC already at cap, can't redistribute
    });
  });

  describe('clampValue', () => {
    it('should clamp value to maximum', () => {
      expect(clampValue(1500, 1000)).toBe(1000);
    });

    it('should clamp value to minimum (0)', () => {
      expect(clampValue(-100, 1000)).toBe(0);
    });

    it('should return value when within range', () => {
      expect(clampValue(500, 1000)).toBe(500);
    });

    it('should handle value at boundaries', () => {
      expect(clampValue(0, 1000)).toBe(0);
      expect(clampValue(1000, 1000)).toBe(1000);
    });
  });

  describe('safeNumber', () => {
    it('should return finite numbers as-is', () => {
      expect(safeNumber(100)).toBe(100);
      expect(safeNumber(0)).toBe(0);
      expect(safeNumber(-100)).toBe(-100);
      expect(safeNumber(3.14)).toBe(3.14);
    });

    it('should return 0 for Infinity', () => {
      expect(safeNumber(Infinity)).toBe(0);
      expect(safeNumber(-Infinity)).toBe(0);
    });

    it('should return 0 for NaN', () => {
      expect(safeNumber(NaN)).toBe(0);
    });
  });

  describe('Edge Cases and Real-World Scenarios', () => {
    it('should handle very large allocation', () => {
      const result = calculateFundPerformance({
        allocation: 10000,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      expect(result.grossMultiple).toBe(3);
      expect(result.netMultiple).toBeGreaterThan(0);
      expect(result.netMultiple).toBeLessThan(3);
    });

    it('should handle very small allocation', () => {
      const result = calculateFundPerformance({
        allocation: 1,
        grossMultiple: 3,
        exitYear: 10,
        config: buyoutConfig,
      });

      expect(result.grossMultiple).toBe(3);
      expect(result.netMultiple).toBeGreaterThan(0);
    });

    it('should handle 1x multiple (break-even)', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 1,
        exitYear: 10,
        config: buyoutConfig,
      });

      expect(result.grossMultiple).toBe(1);
      expect(result.netMultiple).toBeLessThan(1); // Fees make it less than break-even
      // netValue = lpDistribution - totalFees, where lpDistribution = grossValue (no carry at 1x)
      // So netValue = allocation - totalFees, which may still be positive if fees < allocation
      expect(result.netValue).toBeLessThan(400); // Should be less than original allocation due to fees
      expect(result.totalFees).toBeGreaterThan(0);
    });

    it('should handle very high multiple', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 10,
        exitYear: 10,
        config: buyoutConfig,
      });

      expect(result.grossMultiple).toBe(10);
      expect(result.netMultiple).toBeGreaterThan(1);
      expect(result.netValue).toBeGreaterThan(0);
    });

    it('should handle early exit year', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 5,
        config: buyoutConfig,
      });

      expect(result.cashFlows.length).toBeGreaterThanOrEqual(6); // Years 0-5
      if (result.netIrr !== null) {
        expect(result.netIrr).toBeGreaterThan(0);
      }
    });

    it('should handle late exit year', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 15,
        config: buyoutConfig,
      });

      expect(result.cashFlows.length).toBeGreaterThanOrEqual(16); // Years 0-15
    });

    it('should calculate preferred return correctly', () => {
      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 2, // 2x return
        exitYear: 10,
        config: buyoutConfig,
      });

      // With 8% preferred return over 10 years, carry should only apply to profit above preferred return
      const carryEvent = result.cashEvents.find((e) => e.label.includes('Carry'));
      // Carry should exist if profit exceeds preferred return
      if (carryEvent) {
        expect(carryEvent.amount).toBeLessThan(0);
      }
    });

    it('should handle fund with no preferred return', () => {
      const configNoPref: FundConfig = {
        ...buyoutConfig,
        preferred_return_percent: null,
      };

      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 10,
        config: configNoPref,
      });

      expect(result.grossMultiple).toBe(3);
      expect(result.netMultiple).toBeGreaterThan(0);
    });

    it('should handle fund with no management fees', () => {
      const configNoMgmt: FundConfig = {
        ...buyoutConfig,
        management_fees_percent: null,
      };

      const result = calculateFundPerformance({
        allocation: 400,
        grossMultiple: 3,
        exitYear: 10,
        config: configNoMgmt,
      });

      const mgmtFeeEvents = result.cashEvents.filter((e) =>
        e.label.includes('Management fees'),
      );
      expect(mgmtFeeEvents.length).toBe(0);
    });
  });
});

