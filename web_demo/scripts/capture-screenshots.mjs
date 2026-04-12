import { chromium, devices } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../');
const screenshotsDir = path.join(root, 'docs', 'screenshots');

const iphone = devices['iPhone 13'];

const savePath = (name) => path.join(screenshotsDir, name);

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...iphone });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  await page.screenshot({ path: savePath('01-home-mobile.png'), fullPage: true });

  await page.getByRole('button', { name: '后视' }).click();
  await page.getByRole('button', { name: '选择腰背' }).click();
  await page.getByRole('button', { name: 'L4-L5' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: savePath('02-capture-fine-grained.png'), fullPage: true });

  await page.getByRole('button', { name: 'B 抽取' }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: savePath('03-ai-extract-citation.png'), fullPage: true });

  await page.getByRole('button', { name: 'C 预警' }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: savePath('04-risk-alert.png'), fullPage: true });

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
