import { describe, it, expect } from 'vitest';
import { calculateReturnComparison } from '../../src/vestaron/utils/returnCalculations';
import type { DilutionInputs } from '../../src/vestaron/store/slices/dilutionSlice';
import type { ReturnComparisonInputs } from '../../src/vestaron/store/slices/returnComparisonSlice';

/**
 * Unit tests for return comparison calculations - converted from E2E tests
 * These tests verify the economics logic without touching the DOM
 */
describe('Return Comparison Scenarios - Economics Logic (Unit Tests)', () => {
  const defaultDilutionInputs: DilutionInputs = {
    preMoney: 270,
    seriesCAmount: 90,
    employeePool: 15,
  };

  /**
   * Helper function to validate return comparison results
   */
  function validateReturnComparison(
    result: ReturnType<typeof calculateReturnComparison>,
    expected: {
      certificate?: {
        exitEV?: number;
        seriesCStake?: number;
        seriesCInvestment?: number;
        seriesCMultiple?: number;
        initialInvestment?: number;
        structuringFee?: number;
        faceValue?: number;
        grossMOIC?: number;
        profit?: number;
        performanceFee?: number;
        grossFees?: number;
        netValue?: number;
        netReturn?: number;
        netMultiple?: number;
        irr?: number | null;
      };
      vcFund?: {
        exitEV?: number;
        seriesCStake?: number;
        seriesCInvestment?: number;
        seriesCMultiple?: number;
        initialInvestment?: number;
        grossMOIC?: number;
        profit?: number;
        managementFee?: number;
        carriedInterest?: number;
        grossFees?: number;
        netValue?: number;
        netReturn?: number;
        netMultiple?: number;
        irr?: number | null;
      };
    },
    tolerance: { certificate?: number; vcFund?: number } = {}
  ) {
    const certTolerance = tolerance.certificate ?? 1;
    const vcTolerance = tolerance.vcFund ?? 1;

    // Validate Tracking Certificate Investor results
    if (expected.certificate) {
      const cert = expected.certificate;
      if (cert.exitEV !== undefined) {
        expect(result.seriesC.exitEV).toBeCloseTo(cert.exitEV, certTolerance);
      }
      if (cert.seriesCStake !== undefined) {
        expect(result.seriesC.stake).toBeCloseTo(cert.seriesCStake, certTolerance);
      }
      if (cert.seriesCInvestment !== undefined) {
        expect(result.seriesC.investment).toBeCloseTo(cert.seriesCInvestment, certTolerance);
      }
      if (cert.seriesCMultiple !== undefined) {
        expect(result.seriesC.multiple).toBeCloseTo(cert.seriesCMultiple, 2);
      }
      if (cert.initialInvestment !== undefined) {
        expect(result.certificate.initialInvestment).toBeCloseTo(cert.initialInvestment, 0);
      }
      if (cert.structuringFee !== undefined) {
        expect(result.certificate.structuringFee).toBeCloseTo(Math.abs(cert.structuringFee), 0);
      }
      if (cert.faceValue !== undefined) {
        expect(result.certificate.faceValue).toBeCloseTo(cert.faceValue, 0);
      }
      if (cert.grossMOIC !== undefined) {
        const tolerance = Math.max(0.15, Math.abs(cert.grossMOIC) * 0.15);
        expect(Math.abs(result.certificate.grossMOIC - cert.grossMOIC)).toBeLessThanOrEqual(tolerance);
      }
      if (cert.profit !== undefined) {
        const tolerance = Math.max(100, Math.abs(cert.profit) * 0.15);
        expect(Math.abs(result.certificate.profit - cert.profit)).toBeLessThanOrEqual(tolerance);
      }
      if (cert.performanceFee !== undefined) {
        if (cert.performanceFee === 0) {
          expect(result.certificate.performanceFee).toBe(0);
        } else {
          const tolerance = Math.max(60, Math.abs(cert.performanceFee) * 0.15);
          expect(Math.abs(result.certificate.performanceFee - Math.abs(cert.performanceFee))).toBeLessThanOrEqual(tolerance);
        }
      }
      if (cert.grossFees !== undefined) {
        const tolerance = Math.max(60, Math.abs(cert.grossFees) * 0.15);
        expect(Math.abs(result.certificate.grossFees - Math.abs(cert.grossFees))).toBeLessThanOrEqual(tolerance);
      }
      if (cert.netValue !== undefined) {
        const tolerance = Math.max(5, Math.abs(cert.netValue) * 0.01);
        expect(Math.abs(result.certificate.netValue - cert.netValue)).toBeLessThanOrEqual(tolerance);
      }
      if (cert.netReturn !== undefined) {
        expect(result.certificate.netReturn).toBeCloseTo(cert.netReturn, 0);
      }
      if (cert.netMultiple !== undefined) {
        expect(result.certificate.netMultiple).toBeCloseTo(cert.netMultiple, 2);
      }
      if (cert.irr !== undefined) {
        if (cert.irr === null) {
          // Handle N/A case
          expect(result.certificate.irr).toBeLessThanOrEqual(-100);
        } else {
          expect(result.certificate.irr).toBeCloseTo(cert.irr, 0);
        }
      }
    }

    // Validate VC Fund Investor results
    if (expected.vcFund) {
      const vc = expected.vcFund;
      if (vc.exitEV !== undefined) {
        expect(result.seriesC.exitEV).toBeCloseTo(vc.exitEV, vcTolerance);
      }
      if (vc.seriesCStake !== undefined) {
        expect(result.seriesC.stake).toBeCloseTo(vc.seriesCStake, vcTolerance);
      }
      if (vc.seriesCInvestment !== undefined) {
        expect(result.seriesC.investment).toBeCloseTo(vc.seriesCInvestment, vcTolerance);
      }
      if (vc.seriesCMultiple !== undefined) {
        expect(result.seriesC.multiple).toBeCloseTo(vc.seriesCMultiple, 2);
      }
      if (vc.initialInvestment !== undefined) {
        expect(result.vcFund.initialInvestment).toBeCloseTo(vc.initialInvestment, 0);
      }
      if (vc.grossMOIC !== undefined) {
        expect(result.vcFund.grossMOIC).toBeCloseTo(vc.grossMOIC, 2);
      }
      if (vc.profit !== undefined) {
        const tolerance = Math.max(50, Math.abs(vc.profit) * 0.05);
        expect(Math.abs(result.vcFund.profit - vc.profit)).toBeLessThanOrEqual(tolerance);
      }
      if (vc.managementFee !== undefined) {
        expect(result.vcFund.managementFee).toBeCloseTo(Math.abs(vc.managementFee), 0);
      }
      if (vc.carriedInterest !== undefined) {
        if (vc.carriedInterest === 0) {
          expect(result.vcFund.carry).toBe(0);
        } else {
          const tolerance = Math.max(5, Math.abs(vc.carriedInterest) * 0.05);
          expect(Math.abs(result.vcFund.carry - Math.abs(vc.carriedInterest))).toBeLessThanOrEqual(tolerance);
        }
      }
      if (vc.grossFees !== undefined) {
        expect(result.vcFund.grossFees).toBeCloseTo(Math.abs(vc.grossFees), 0);
      }
      if (vc.netValue !== undefined) {
        expect(result.vcFund.netValue).toBeCloseTo(vc.netValue, 0);
      }
      if (vc.netReturn !== undefined) {
        expect(result.vcFund.netReturn).toBeCloseTo(vc.netReturn, 0);
      }
      if (vc.netMultiple !== undefined) {
        expect(result.vcFund.netMultiple).toBeCloseTo(vc.netMultiple, 2);
      }
      if (vc.irr !== undefined) {
        if (vc.irr === null) {
          expect(result.vcFund.irr).toBeLessThanOrEqual(-100);
        } else {
          expect(result.vcFund.irr).toBeCloseTo(vc.irr, 0);
        }
      }
    }
  }

  describe('Default Case Study Scenario', () => {
    it('should calculate correctly for case study values (360M post-money, 3x multiple, 2025 exit, pool before)', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 3,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2025,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 2.94,
          profit: 1960,
          performanceFee: -196,
          grossFees: -216,
          netValue: 2744,
          netReturn: 174.4,
          netMultiple: 2.74,
          irr: 40.0,
        },
        vcFund: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          grossMOIC: 3.0,
          profit: 2000,
          managementFee: -60,
          carriedInterest: -400,
          grossFees: -460,
          netValue: 2540,
          netReturn: 154.0,
          netMultiple: 2.54,
          irr: 36.4,
        },
      });
    });
  });

  describe('Loss Scenarios - IPO Multiple < 1x', () => {
    it('should handle 0.5x multiple - liquidation preference protects investors', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 0.5,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2025,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 180,
          seriesCStake: 90,
          seriesCInvestment: 90,
          seriesCMultiple: 1.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 0.98,
          profit: -20,
          performanceFee: 0,
          grossFees: -20,
          netValue: 980,
          netReturn: -2.0,
          netMultiple: 0.98,
          irr: -0.7,
        },
        vcFund: {
          exitEV: 180,
          seriesCStake: 90,
          seriesCInvestment: 90,
          seriesCMultiple: 1.0,
          initialInvestment: 1000,
          grossMOIC: 1.0,
          profit: 0,
          managementFee: -60,
          carriedInterest: 0,
          grossFees: -60,
          netValue: 940,
          netReturn: -6.0,
          netMultiple: 0.94,
          irr: -2.1,
        },
      });
    });

    it('should handle 0.3x multiple - exit EV capped by liquidation preference', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 0.3,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2024,
        poolTiming: 'after',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 108,
          seriesCStake: 90,
          seriesCInvestment: 90,
          seriesCMultiple: 1.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 0.98,
          profit: -20,
          performanceFee: 0,
          grossFees: -20,
          netValue: 980,
          netReturn: -2.0,
          netMultiple: 0.98,
          irr: -1.0,
        },
        vcFund: {
          exitEV: 108,
          seriesCStake: 90,
          seriesCInvestment: 90,
          seriesCMultiple: 1.0,
          initialInvestment: 1000,
          grossMOIC: 1.0,
          profit: 0,
          managementFee: -40,
          carriedInterest: 0,
          grossFees: -40,
          netValue: 960,
          netReturn: -4.0,
          netMultiple: 0.96,
          irr: -2.0,
        },
      });
    });

    it('should handle 0.2x multiple - severe loss, exit EV caps Series C recovery', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 0.2,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2024,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 72,
          seriesCStake: 72,
          seriesCInvestment: 90,
          seriesCMultiple: 0.8,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 0.78,
          profit: -216,
          performanceFee: 0,
          grossFees: -20,
          netValue: 784,
          netReturn: -21.6,
          netMultiple: 0.78,
          irr: -11.8,
        },
        vcFund: {
          exitEV: 72,
          seriesCStake: 72,
          seriesCInvestment: 90,
          seriesCMultiple: 0.8,
          initialInvestment: 1000,
          grossMOIC: 0.8,
          profit: -200,
          managementFee: -40,
          carriedInterest: 0,
          grossFees: -40,
          netValue: 760,
          netReturn: -24.0,
          netMultiple: 0.76,
          irr: -13.0,
        },
      });
    });

    it('should handle 0.1x multiple - catastrophic loss', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 0.1,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2026,
        poolTiming: 'after',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 36,
          seriesCStake: 36,
          seriesCInvestment: 90,
          seriesCMultiple: 0.4,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 0.39,
          profit: -588,
          performanceFee: 0,
          grossFees: -20,
          netValue: 392,
          netReturn: -60.8,
          netMultiple: 0.39,
          irr: -20.9,
        },
        vcFund: {
          exitEV: 36,
          seriesCStake: 36,
          seriesCInvestment: 90,
          seriesCMultiple: 0.4,
          initialInvestment: 1000,
          grossMOIC: 0.4,
          profit: -600,
          managementFee: -80,
          carriedInterest: 0,
          grossFees: -80,
          netValue: 320,
          netReturn: -68.0,
          netMultiple: 0.32,
          irr: -24.8,
        },
      });
    });
  });

  describe('Break-Even and Moderate Gain Scenarios', () => {
    it('should handle 1.0x multiple - break-even with liquidation preference', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 1.0,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2026,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 360,
          seriesCStake: 90,
          seriesCInvestment: 90,
          seriesCMultiple: 1.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 0.98,
          profit: -20,
          performanceFee: 0,
          grossFees: -20,
          netValue: 980,
          netReturn: -2.0,
          netMultiple: 0.98,
          irr: -0.5,
        },
        vcFund: {
          exitEV: 360,
          seriesCStake: 90,
          seriesCInvestment: 90,
          seriesCMultiple: 1.0,
          initialInvestment: 1000,
          grossMOIC: 1.0,
          profit: 0,
          managementFee: -80,
          carriedInterest: 0,
          grossFees: -80,
          netValue: 920,
          netReturn: -8.0,
          netMultiple: 0.92,
          irr: -2.1,
        },
      });
    });

    it('should handle 2.0x multiple - moderate gain', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 2.0,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2025,
        poolTiming: 'after',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 720,
          seriesCStake: 122.4,
          seriesCInvestment: 90,
          seriesCMultiple: 1.36,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 1.33,
          profit: 333,
          performanceFee: -33,
          grossFees: -53,
          netValue: 1298,
          netReturn: 29.8,
          netMultiple: 1.30,
          irr: 9.1,
        },
        vcFund: {
          exitEV: 720,
          seriesCStake: 122.4,
          seriesCInvestment: 90,
          seriesCMultiple: 1.36,
          initialInvestment: 1000,
          grossMOIC: 1.36,
          profit: 360,
          managementFee: -60,
          carriedInterest: -72,
          grossFees: -132,
          netValue: 1228,
          netReturn: 22.8,
          netMultiple: 1.23,
          irr: 7.1,
        },
      });
    });
  });

  describe('High Multiple Scenarios', () => {
    it('should handle 5.0x multiple - high return', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 5.0,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2027,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1800,
          seriesCStake: 450,
          seriesCInvestment: 90,
          seriesCMultiple: 5.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 4.90,
          profit: 3920,
          performanceFee: -392,
          grossFees: -412,
          netValue: 4508,
          netReturn: 350.8,
          netMultiple: 4.51,
          irr: 35.1,
        },
        vcFund: {
          exitEV: 1800,
          seriesCStake: 450,
          seriesCInvestment: 90,
          seriesCMultiple: 5.0,
          initialInvestment: 1000,
          grossMOIC: 5.0,
          profit: 4000,
          managementFee: -100,
          carriedInterest: -800,
          grossFees: -900,
          netValue: 4100,
          netReturn: 310.0,
          netMultiple: 4.10,
          irr: 32.6,
        },
      });
    });

    it('should handle 10.0x multiple - exceptional return', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 10.0,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2028,
        poolTiming: 'after',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 3600,
          seriesCStake: 612,
          seriesCInvestment: 90,
          seriesCMultiple: 6.8,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 6.00,
          profit: 5120,
          performanceFee: -512,
          grossFees: -532,
          netValue: 6096,
          netReturn: 509.6,
          netMultiple: 6.10,
          irr: 35.2,
        },
        vcFund: {
          exitEV: 3600,
          seriesCStake: 612,
          seriesCInvestment: 90,
          seriesCMultiple: 6.8,
          initialInvestment: 1000,
          grossMOIC: 6.8,
          profit: 5800,
          managementFee: -120,
          carriedInterest: -1160,
          grossFees: -1280,
          netValue: 5520,
          netReturn: 452.0,
          netMultiple: 5.52,
          irr: 32.9,
        },
      });
    });
  });

  describe('Different Fee Structures', () => {
    it('should handle higher certificate fees (3% structuring, 15% performance)', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 3,
        initialInvestment: 1000,
        structuringFee: 3,
        performanceFee: 15,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2025,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          structuringFee: -30,
          faceValue: 970,
          grossMOIC: 2.91,
          profit: 1940,
          performanceFee: -291,
          grossFees: -321,
          netValue: 2619,
          netReturn: 161.9,
          netMultiple: 2.62,
          irr: 37.8,
        },
        vcFund: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          grossMOIC: 3.0,
          profit: 2000,
          managementFee: -60,
          carriedInterest: -400,
          grossFees: -460,
          netValue: 2540,
          netReturn: 154.0,
          netMultiple: 2.54,
          irr: 36.4,
        },
      });
    });

    it('should handle higher VC fund fees (3% management, 25% carry)', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 3,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 3,
        carriedInterest: 25,
        ipoExitYear: 2025,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 2.94,
          profit: 1960,
          performanceFee: -196,
          grossFees: -216,
          netValue: 2744,
          netReturn: 174.4,
          netMultiple: 2.74,
          irr: 40.0,
        },
        vcFund: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          grossMOIC: 3.0,
          profit: 2000,
          managementFee: -90,
          carriedInterest: -500,
          grossFees: -590,
          netValue: 2410,
          netReturn: 141.0,
          netMultiple: 2.41,
          irr: 34.0,
        },
      });
    });

    it('should handle zero performance fee on certificate', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 3,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 0,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2025,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 2.94,
          profit: 1960,
          performanceFee: 0,
          grossFees: -20,
          netValue: 2940,
          netReturn: 194.0,
          netMultiple: 2.94,
          irr: 43.0,
        },
        vcFund: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          grossMOIC: 3.0,
          profit: 2000,
          managementFee: -60,
          carriedInterest: -400,
          grossFees: -460,
          netValue: 2540,
          netReturn: 154.0,
          netMultiple: 2.54,
          irr: 36.4,
        },
      });
    });
  });

  describe('Different Exit Years and Fund Life', () => {
    it('should handle 2023 exit (1 year) - shorter fund life', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 3,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2023,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 2.94,
          profit: 1960,
          performanceFee: -196,
          grossFees: -216,
          netValue: 2744,
          netReturn: 174.4,
          netMultiple: 2.74,
          irr: 174.4,
        },
        vcFund: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 1000,
          grossMOIC: 3.0,
          profit: 2000,
          managementFee: -20,
          carriedInterest: -400,
          grossFees: -420,
          netValue: 2580,
          netReturn: 158.0,
          netMultiple: 2.58,
          irr: 158.0,
        },
      });
    });

    it('should handle 2030 exit (8 years) - longer fund life', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 3,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2030,
        poolTiming: 'after',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1080,
          seriesCStake: 183.6,
          seriesCInvestment: 90,
          seriesCMultiple: 2.04,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 1.87,
          profit: 919,
          performanceFee: -92,
          grossFees: -112,
          netValue: 1897,
          netReturn: 89.7,
          netMultiple: 1.90,
          irr: 8.3,
        },
        vcFund: {
          exitEV: 1080,
          seriesCStake: 183.6,
          seriesCInvestment: 90,
          seriesCMultiple: 2.04,
          initialInvestment: 1000,
          grossMOIC: 2.04,
          profit: 1040,
          managementFee: -160,
          carriedInterest: -208,
          grossFees: -368,
          netValue: 1672,
          netReturn: 67.2,
          netMultiple: 1.67,
          irr: 6.6,
        },
      });
    });
  });

  describe('Different Pool Timings', () => {
    it('should handle pool after Round C with 3x multiple', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 3,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2025,
        poolTiming: 'after',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1080,
          seriesCStake: 183.6,
          seriesCInvestment: 90,
          seriesCMultiple: 2.04,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 1.87,
          profit: 919,
          performanceFee: -92,
          grossFees: -112,
          netValue: 1897,
          netReturn: 89.7,
          netMultiple: 1.90,
          irr: 23.8,
        },
        vcFund: {
          exitEV: 1080,
          seriesCStake: 183.6,
          seriesCInvestment: 90,
          seriesCMultiple: 2.04,
          initialInvestment: 1000,
          grossMOIC: 2.04,
          profit: 1040,
          managementFee: -60,
          carriedInterest: -208,
          grossFees: -268,
          netValue: 1772,
          netReturn: 77.2,
          netMultiple: 1.77,
          irr: 21.0,
        },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small initial investment ($100)', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 3,
        initialInvestment: 100,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2025,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 100,
          structuringFee: -2,
          faceValue: 98,
          grossMOIC: 2.94,
          profit: 196,
          performanceFee: -20,
          grossFees: -22,
          netValue: 274,
          netReturn: 174.4,
          netMultiple: 2.74,
          irr: 40.0,
        },
        vcFund: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 100,
          grossMOIC: 3.0,
          profit: 200,
          managementFee: -6,
          carriedInterest: -40,
          grossFees: -46,
          netValue: 254,
          netReturn: 154.0,
          netMultiple: 2.54,
          irr: 36.4,
        },
      });
    });

    it('should handle large initial investment ($10,000)', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 3,
        initialInvestment: 10000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2025,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 10000,
          structuringFee: -200,
          faceValue: 9800,
          grossMOIC: 2.94,
          profit: 19600,
          performanceFee: -1960,
          grossFees: -2160,
          netValue: 27440,
          netReturn: 174.4,
          netMultiple: 2.74,
          irr: 40.0,
        },
        vcFund: {
          exitEV: 1080,
          seriesCStake: 270,
          seriesCInvestment: 90,
          seriesCMultiple: 3.0,
          initialInvestment: 10000,
          grossMOIC: 3.0,
          profit: 20000,
          managementFee: -600,
          carriedInterest: -4000,
          grossFees: -4600,
          netValue: 25400,
          netReturn: 154.0,
          netMultiple: 2.54,
          irr: 36.4,
        },
      });
    });

    it('should handle 0.25x multiple - extreme loss scenario', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 0.25,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2024,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 90,
          seriesCStake: 90,
          seriesCInvestment: 90,
          seriesCMultiple: 1.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 0.98,
          profit: -20,
          performanceFee: 0,
          grossFees: -20,
          netValue: 980,
          netReturn: -2.0,
          netMultiple: 0.98,
          irr: -1.0,
        },
        vcFund: {
          exitEV: 90,
          seriesCStake: 90,
          seriesCInvestment: 90,
          seriesCMultiple: 1.0,
          initialInvestment: 1000,
          grossMOIC: 1.0,
          profit: 0,
          managementFee: -40,
          carriedInterest: 0,
          grossFees: -40,
          netValue: 960,
          netReturn: -4.0,
          netMultiple: 0.96,
          irr: -2.0,
        },
      });
    });
  });

  describe('Medium Multiple Scenarios', () => {
    it('should calculate correctly for moderate multiple (2x multiple)', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 2,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2024,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 720,
          seriesCStake: 180,
          seriesCInvestment: 90,
          seriesCMultiple: 2.0,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 1.96,
          profit: 960,
          performanceFee: -96,
          grossFees: -116,
          netValue: 1864,
          netReturn: 86.4,
          netMultiple: 1.86,
          irr: 36.5,
        },
        vcFund: {
          exitEV: 720,
          seriesCStake: 180,
          seriesCInvestment: 90,
          seriesCMultiple: 2.0,
          initialInvestment: 1000,
          grossMOIC: 2.0,
          profit: 1000,
          managementFee: -40,
          carriedInterest: -200,
          grossFees: -240,
          netValue: 1760,
          netReturn: 76.0,
          netMultiple: 1.76,
          irr: 32.7,
        },
      });
    });

    it('should calculate correctly for low profitable multiple (1.5x multiple)', () => {
      const returnInputs: ReturnComparisonInputs = {
        ipoMultiple: 1.5,
        initialInvestment: 1000,
        structuringFee: 2,
        performanceFee: 10,
        managementFee: 2,
        carriedInterest: 20,
        ipoExitYear: 2024,
        poolTiming: 'before',
      };

      const result = calculateReturnComparison(defaultDilutionInputs, returnInputs);
      validateReturnComparison(result, {
        certificate: {
          exitEV: 540,
          seriesCStake: 135,
          seriesCInvestment: 90,
          seriesCMultiple: 1.5,
          initialInvestment: 1000,
          structuringFee: -20,
          faceValue: 980,
          grossMOIC: 1.47,
          profit: 460,
          performanceFee: -46,
          grossFees: -66,
          netValue: 1421,
          netReturn: 42.1,
          netMultiple: 1.42,
          irr: 19.2,
        },
        vcFund: {
          exitEV: 540,
          seriesCStake: 135,
          seriesCInvestment: 90,
          seriesCMultiple: 1.5,
          initialInvestment: 1000,
          grossMOIC: 1.5,
          profit: 500,
          managementFee: -40,
          carriedInterest: -100,
          grossFees: -140,
          netValue: 1360,
          netReturn: 36.0,
          netMultiple: 1.36,
          irr: 16.6,
        },
      });
    });
  });
});
