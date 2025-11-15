/**
 * Async helpers for React app testing using Playwright
 */

import { getTestEnvironment } from '../setup.js';

/**
 * Get element by ID using Playwright locator
 */
export async function getElementById(id) {
  const env = await getTestEnvironment();
  const locator = env.page.locator(`#${id}`);
  const count = await locator.count();
  if (count === 0) return null;
  return locator;
}

/**
 * Get text content
 */
export async function getText(id) {
  const locator = await getElementById(id);
  if (!locator) return '';
  const text = await locator.textContent();
  return text || '';
}

/**
 * Get text content from a ResultBox field
 * @param {string} containerId - The ID of the ResultBox container
 * @param {string} field - The field name (ev, existing, seriesC, pool)
 */
export async function getResultBoxFieldText(containerId, field) {
  const containerLocator = await getElementById(containerId);
  if (!containerLocator) return '';
  const fieldLocator = containerLocator.locator(`[data-field="${field}"]`);
  const text = await fieldLocator.textContent();
  return text || '';
}

/**
 * Get input value
 */
export async function getValue(id) {
  const locator = await getElementById(id);
  if (!locator) return '';
  return await locator.inputValue();
}

/**
 * Set input value
 */
export async function setValue(id, value) {
  const env = await getTestEnvironment();
  const locator = await getElementById(id);
  if (!locator) return;
  await locator.fill(value.toString());
  await locator.dispatchEvent('input');
  await locator.dispatchEvent('change');
  // Wait for the value to be set (Playwright's fill already waits, but ensure React updates)
  await locator.evaluate((el, val) => el.value === val.toString(), value).catch(() => {});
  // Small delay for React state updates to propagate
  await env.page.waitForTimeout(50);
}

/**
 * Click element
 */
export async function clickElement(id) {
  const env = await getTestEnvironment();
  const locator = await getElementById(id);
  if (!locator) return;
  await locator.click();
  // Wait for click to process (minimal delay for event propagation)
  await env.page.waitForTimeout(50);
}

/**
 * Click button by selector
 */
export async function clickButton(selector) {
  const env = await getTestEnvironment();
  // Find button by text content (more reliable for React)
  let buttonText = null;
  if (selector.includes('dilution') || selector.includes('Dilution Impact')) {
    buttonText = 'Dilution Impact';
  } else if (selector.includes('return') || selector.includes('Return Comparison')) {
    buttonText = 'Return Comparison';
  }
  
  if (buttonText) {
    const button = env.page.locator(`button:has-text("${buttonText}")`);
    await button.click();
    // Wait for tab switch to complete by checking for active class
    await env.page.waitForFunction(
      (text) => {
        const activeTab = document.querySelector('.tab.active');
        return activeTab && activeTab.textContent?.includes(text);
      },
      buttonText,
      { timeout: 1000 }
    ).catch(() => {
      // Fallback to minimal delay if waitForFunction fails
      return env.page.waitForTimeout(50);
    });
  } else {
    // Try the selector as-is
    const button = env.page.locator(selector).first();
    await button.click();
    await env.page.waitForTimeout(50);
  }
}

/**
 * Check if element has class
 */
export async function hasClass(id, className) {
  const locator = await getElementById(id);
  if (!locator) return false;
  return await locator.evaluate((el, cls) => el.classList.contains(cls), className);
}

/**
 * Get checked state
 */
export async function isChecked(id) {
  const locator = await getElementById(id);
  if (!locator) return false;
  return await locator.isChecked();
}

/**
 * Set checked state
 */
export async function setChecked(id, checked) {
  const env = await getTestEnvironment();
  const locator = await getElementById(id);
  if (!locator) return;
  if (checked) {
    await locator.check();
  } else {
    await locator.uncheck();
  }
  // Wait for checked state to be set (Playwright's check/uncheck already waits)
  await locator.evaluate((el, checked) => el.checked === checked, checked).catch(() => {});
  // Small delay for React state updates
  await env.page.waitForTimeout(50);
}

/**
 * Select option
 */
export async function selectOption(id, value) {
  const env = await getTestEnvironment();
  const locator = await getElementById(id);
  if (!locator) return;
  await locator.selectOption(value.toString());
  // Wait for select value to be set (Playwright's selectOption already waits)
  await locator.evaluate((el, val) => el.value === val.toString(), value).catch(() => {});
  // Small delay for React state updates
  await env.page.waitForTimeout(50);
}

/**
 * Wait for calculations to complete by checking for updated DOM values
 */
export async function waitForCalculations(timeout = 5000) {
  const env = await getTestEnvironment();
  
  // Wait for calculations to complete by checking if result boxes have been updated
  try {
    await env.page.waitForFunction(
      () => {
        // Check if we're on dilution tab
        const dilutionTab = document.getElementById('dilution-tab');
        if (dilutionTab?.classList.contains('active')) {
          const container = document.getElementById('beforeFinal');
          if (container) {
            const ev = container.querySelector('[data-field="ev"]')?.textContent;
            // Check if EV field has been populated with a currency value
            return ev && ev.includes('$') && ev !== '$0.0M';
          }
        }
        
        // Check if we're on return comparison tab
        const returnTab = document.getElementById('return-tab');
        if (returnTab?.classList.contains('active')) {
          const exitEV = document.getElementById('certExitEV')?.textContent;
          // Check if exit EV has been populated
          return exitEV && exitEV.includes('$') && exitEV !== '$0.0M';
        }
        
        // Default: assume calculations are done if we can't determine tab
        return true;
      },
      { timeout }
    );
  } catch (error) {
    // Fallback to minimal delay if waitForFunction times out
    await env.page.waitForTimeout(100);
  }
}

/**
 * Query selector
 */
export async function querySelector(selector) {
  const env = await getTestEnvironment();
  return env.page.locator(selector);
}

/**
 * Reset app state to defaults
 * Optimized to only reset values that have changed
 */
export async function resetToDefaults() {
  const env = await getTestEnvironment();
  
  // Batch operations to reduce wait times
  const resetPromises = [];
  
  // Check current values and only reset if different (optimization)
  const currentPreMoney = await getValue('dilutionPreMoney');
  const currentSeriesC = await getValue('seriesCAmount');
  const currentPool = await getValue('employeePool');
  
  if (currentPreMoney !== '270') {
    resetPromises.push(setValue('dilutionPreMoney', '270'));
  }
  if (currentSeriesC !== '90') {
    resetPromises.push(setValue('seriesCAmount', '90'));
  }
  if (currentPool !== '15') {
    resetPromises.push(setValue('employeePool', '15'));
  }
  
  // Wait for dilution inputs to be set before continuing
  await Promise.all(resetPromises);
  
  // Reset return comparison inputs (only if we're on that tab or need to switch)
  const dilutionTabActive = await hasClass('dilution-tab', 'active');
  if (!dilutionTabActive) {
    // We're on return tab, reset those values
    const resetReturnPromises = [];
    const currentIpoMultiple = await getValue('ipoMultiple');
    const currentInitialInvestment = await getValue('initialInvestment');
    
    if (currentIpoMultiple !== '3') {
      resetReturnPromises.push(setValue('ipoMultiple', '3'));
    }
    if (currentInitialInvestment !== '1000') {
      resetReturnPromises.push(setValue('initialInvestment', '1000'));
    }
    
    resetReturnPromises.push(
      selectOption('ipoExitYear', '2024'),
      setValue('structuringFee', '2'),
      setValue('performanceFee', '20'),
      setValue('managementFee', '2'),
      setValue('carriedInterest', '20'),
      setChecked('returnPoolBefore', true)
    );
    
    await Promise.all(resetReturnPromises);
  }
  
  // Always switch back to dilution tab and wait for calculations
  if (!dilutionTabActive) {
    await clickButton('button:has-text("Dilution Impact")');
  }
  await waitForCalculations(2000); // Use condition-based wait
}
