/**
 * Test environment helper for React app testing using Playwright
 * 
 * Usage:
 *   npm test   - Test against React app at http://localhost:5173/vestaron.html
 * 
 * Note: Ensure the dev server is running at http://localhost:5173/
 */

const REACT_APP_URL = process.env.REACT_APP_URL || 'http://localhost:5173/vestaron.html';

let playwrightBrowser = null;
let playwrightPage = null;

/**
 * Initialize the test environment using Playwright
 * Optimized for faster initialization and better error handling
 */
export async function initializeTestEnvironment() {
  try {
    const { chromium } = await import('playwright');
    
    // Reuse browser if already launched (for test suites that share browser)
    if (!playwrightBrowser) {
      playwrightBrowser = await chromium.launch({ 
        headless: true,
        // Optimize browser launch for faster startup
        args: ['--disable-dev-shm-usage', '--disable-setuid-sandbox']
      });
    }
    
    // Create new context for isolation (each test suite gets its own context)
    const context = await playwrightBrowser.newContext();
    playwrightPage = await context.newPage();
    
    // Set reasonable timeouts (increased for reliability)
    playwrightPage.setDefaultTimeout(5000);
    playwrightPage.setDefaultNavigationTimeout(5000);
    
    // Navigate and wait for network to be idle (more reliable than domcontentloaded)
    await playwrightPage.goto(REACT_APP_URL, { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Wait for React to render - use condition-based wait instead of fixed timeout
    await playwrightPage.waitForSelector('#root', { timeout: 5000 });
    await playwrightPage.waitForSelector('h1:has-text("Vestaron")', { timeout: 5000 });
    
    // Wait for React to finish initial render by checking for calculation results
    await playwrightPage.waitForFunction(
      () => {
        const container = document.getElementById('beforeFinal');
        if (container) {
          const ev = container.querySelector('[data-field="ev"]')?.textContent;
          return ev && ev.includes('$') && ev !== '$0.0M';
        }
        return false;
      },
      { timeout: 5000 }
    ).catch(() => {
      // Fallback: if calculations aren't ready, just proceed (they'll be ready soon)
    });
    
    return { page: playwrightPage };
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('Playwright not installed. Run: npm install --save-dev playwright');
    }
    if (error.message.includes('net::ERR_CONNECTION_REFUSED') || error.message.includes('Navigation timeout')) {
      throw new Error(
        `React app not running at ${REACT_APP_URL}.\n` +
        `Please start the dev server with: npm run dev\n` +
        `Or set REACT_APP_URL environment variable to point to your app.`
      );
    }
    throw error;
  }
}

/**
 * Cleanup test environment
 */
export async function cleanupTestEnvironment() {
  if (playwrightBrowser) {
    await playwrightBrowser.close();
    playwrightBrowser = null;
    playwrightPage = null;
  }
}
