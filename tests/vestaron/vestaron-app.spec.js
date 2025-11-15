import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import { getTestEnvironment } from './setup.js';
import { cleanupTestEnvironment } from './helpers/test-environment.js';
import * as helpers from './helpers/async-helpers.js';

describe('Vestaron Return Comparison Application', () => {
  beforeEach(async () => {
    await getTestEnvironment();
    // Reset to defaults before each test
    await helpers.resetToDefaults();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  describe('Initial Page Load', () => {
    test('should load the page with correct title', async () => {
      const env = await getTestEnvironment();
      const title = await env.page.title();
      expect(title).toContain('Vestaron Case Study Modelling');
    });

    test('should display both tabs', async () => {
      const dilutionTab = await helpers.querySelector('button:has-text("Dilution Impact")');
      const returnTab = await helpers.querySelector('button:has-text("Return Comparison")');
      
      expect(dilutionTab).toBeTruthy();
      expect(returnTab).toBeTruthy();
      
      const dilutionText = await dilutionTab.textContent();
      const returnText = await returnTab.textContent();
      
      expect(dilutionText).toContain('Dilution Impact');
      expect(returnText).toContain('Return Comparison');
    });

    test('should have dilution tab active by default', async () => {
      const hasActive = await helpers.hasClass('dilution-tab', 'active');
      expect(hasActive).toBe(true);
    });

    test('should have default input values', async () => {
      expect(await helpers.getValue('dilutionPreMoney')).toBe('270');
      expect(await helpers.getValue('seriesCAmount')).toBe('90');
      expect(await helpers.getValue('employeePool')).toBe('15');
    });
  });

  describe('Tab Navigation', () => {
    test('should switch to return comparison tab', async () => {
      await helpers.clickButton('button:has-text("Return Comparison")');
      await helpers.waitForCalculations(100);
      
      const returnTabActive = await helpers.hasClass('return-tab', 'active');
      const dilutionTabActive = await helpers.hasClass('dilution-tab', 'active');
      
      expect(returnTabActive).toBe(true);
      expect(dilutionTabActive).toBe(false);
    });

    test('should switch back to dilution tab', async () => {
      // Switch to return tab first
      await helpers.clickButton('button:has-text("Return Comparison")');
      await helpers.waitForCalculations(100);
      
      let returnTabActive = await helpers.hasClass('return-tab', 'active');
      expect(returnTabActive).toBe(true);
      
      // Switch back to dilution tab
      await helpers.clickButton('button:has-text("Dilution Impact")');
      await helpers.waitForCalculations(100);
      
      const dilutionTabActive = await helpers.hasClass('dilution-tab', 'active');
      returnTabActive = await helpers.hasClass('return-tab', 'active');
      
      expect(dilutionTabActive).toBe(true);
      expect(returnTabActive).toBe(false);
    });
  });

  // NOTE: Economics calculation tests have been moved to unit tests (tests/unit/)
  // These tests verify calculation logic without DOM interaction
  // E2E tests below focus on UI integration only

  describe('Dilution Impact - UI Integration', () => {
    test('should render pie chart for scenario 1', async () => {
      const pieChart1 = await helpers.getElementById('pieChart1');
      expect(pieChart1).toBeTruthy();
    });

    test('should render pie chart for scenario 2', async () => {
      const pieChart2 = await helpers.getElementById('pieChart2');
      expect(pieChart2).toBeTruthy();
    });

    test('should display result boxes for all stages', async () => {
      expect(await helpers.getElementById('beforeInitial')).toBeTruthy();
      expect(await helpers.getElementById('beforeAfterPool')).toBeTruthy();
      expect(await helpers.getElementById('beforeFinal')).toBeTruthy();
      expect(await helpers.getElementById('afterInitial')).toBeTruthy();
      expect(await helpers.getElementById('afterAfterRoundC')).toBeTruthy();
      expect(await helpers.getElementById('afterFinal')).toBeTruthy();
    });
  });

  describe('Return Comparison - Common Parameters', () => {
    beforeEach(async () => {
      // Switch to return comparison tab
      await helpers.clickButton('button:has-text("Return Comparison")');
      await helpers.waitForCalculations(50);
    });

    test('should display default values', async () => {
      expect(await helpers.getValue('postMoney')).toBe('360.0');
      expect(await helpers.getValue('ipoMultiple')).toBe('3');
      expect(await helpers.getValue('initialInvestment')).toBe('1000');
      expect(await helpers.getValue('ipoExitYear')).toBe('2024');
    });

    test('should have pool timing radio buttons', async () => {
      const beforeRadio = await helpers.getElementById('returnPoolBefore');
      const afterRadio = await helpers.getElementById('returnPoolAfter');
      
      expect(beforeRadio).toBeTruthy();
      expect(afterRadio).toBeTruthy();
      expect(await helpers.isChecked('returnPoolBefore')).toBe(true);
    });

    test('should switch pool timing', async () => {
      await helpers.setChecked('returnPoolAfter', true);
      await helpers.waitForCalculations(100);
      
      expect(await helpers.isChecked('returnPoolAfter')).toBe(true);
      expect(await helpers.isChecked('returnPoolBefore')).toBe(false);
    });
  });

  describe('Return Comparison - UI Integration', () => {
    beforeEach(async () => {
      await helpers.clickButton('button:has-text("Return Comparison")');
      await helpers.waitForCalculations(50);
    });

    test('should display certificate calculation elements', async () => {
      expect(await helpers.getElementById('certExitEV')).toBeTruthy();
      expect(await helpers.getElementById('certInitialInvestment')).toBeTruthy();
      expect(await helpers.getElementById('certNetValue')).toBeTruthy();
    });

    test('should display VC fund calculation elements', async () => {
      expect(await helpers.getElementById('vcExitEV')).toBeTruthy();
      expect(await helpers.getElementById('vcInitialInvestment')).toBeTruthy();
      expect(await helpers.getElementById('vcNetValue')).toBeTruthy();
    });

    test('should update labels when exit year changes', async () => {
      await helpers.selectOption('ipoExitYear', '2025');
      await helpers.waitForCalculations(300);
      
      const irrLabel = await helpers.getText('certIRRLabel');
      expect(irrLabel).toContain('years');
      
      const mgmtFeeLabel = await helpers.getText('vcMgmtFeesLabel');
      expect(mgmtFeeLabel).toContain('years');
    });
  });

  describe('Return Comparison - Comparison Metrics', () => {
    beforeEach(async () => {
      await helpers.clickButton('button:has-text("Return Comparison")');
      await helpers.waitForCalculations(50);
    });

    test('should display comparison metrics', async () => {
      const netValueDiff = await helpers.getElementById('netValueDiff');
      const returnDiff = await helpers.getElementById('returnDiff');
      const multipleDiff = await helpers.getElementById('multipleDiff');
      const advantage = await helpers.getElementById('advantage');
      const irrDiff = await helpers.getElementById('irrDiff');
      
      expect(netValueDiff).toBeTruthy();
      expect(returnDiff).toBeTruthy();
      expect(multipleDiff).toBeTruthy();
      expect(advantage).toBeTruthy();
      expect(irrDiff).toBeTruthy();
      
      // All metrics should have values
      expect(await helpers.getText('netValueDiff')).not.toBe('');
      expect(await helpers.getText('returnDiff')).not.toBe('');
      expect(await helpers.getText('multipleDiff')).not.toBe('');
      const advantageText = await helpers.getText('advantage');
      expect(['Certificate', 'VC Fund']).toContain(advantageText);
      expect(await helpers.getText('irrDiff')).not.toBe('');
    });
  });

  describe('Return Comparison - Pool Timing Impact', () => {
    beforeEach(async () => {
      await helpers.clickButton('button:has-text("Return Comparison")');
      await helpers.waitForCalculations(50);
    });

    test('should recalculate when switching from pool before to pool after', async () => {
      // Ensure we start with pool before
      await helpers.setChecked('returnPoolBefore', true);
      await helpers.setChecked('returnPoolAfter', false);
      await helpers.waitForCalculations(200);
      
      const initialStake = await helpers.getText('certSeriesCStake');
      
      // Switch to pool after
      await helpers.setChecked('returnPoolAfter', true);
      await helpers.setChecked('returnPoolBefore', false);
      await helpers.waitForCalculations(300);
      
      const newStake = await helpers.getText('certSeriesCStake');
      expect(newStake).not.toBe(initialStake);
    });
  });

  // NOTE: Edge case calculation tests moved to unit tests (tests/unit/)
  // E2E tests focus on UI behavior, not calculation correctness

  describe('Integration Tests - Full Workflow', () => {
    test('should maintain consistency across tabs', async () => {
      // Set values in dilution tab
      await helpers.setValue('dilutionPreMoney', '300');
      await helpers.setValue('seriesCAmount', '100');
      await helpers.waitForCalculations(100);
      
      // Switch to return tab
      await helpers.clickButton('button:has-text("Return Comparison")');
      await helpers.waitForCalculations(50);
      
      // Post-money should reflect dilution tab values
      expect(await helpers.getValue('postMoney')).toBe('400.0');
    });
  });
});
