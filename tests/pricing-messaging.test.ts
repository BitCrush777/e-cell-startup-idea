import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Pricing & Free Trial Launch Sitewide Consistency', () => {
  const rootDir = path.resolve(__dirname, '..');
  const srcDir = path.join(rootDir, 'src');

  test('Pricing page displays Free Trial Available and Paid Plans Coming Soon', () => {
    const pricingFile = path.join(srcDir, 'app', 'pricing', 'page.tsx');
    assert.ok(fs.existsSync(pricingFile), 'pricing/page.tsx must exist');
    const content = fs.readFileSync(pricingFile, 'utf8');

    // Key required phrases
    assert.ok(content.includes('FREE TRIAL AVAILABLE'), 'Must display FREE TRIAL AVAILABLE badge');
    assert.ok(content.includes('Try TempLink for Free'), 'Must headline Free trial access');
    assert.ok(content.includes('Available Now'), 'Must indicate Free Trial is available now');
    assert.ok(content.includes('Paid Plans Are Coming Soon'), 'Must state paid plans are coming soon');
    assert.ok(content.includes('href="/create"'), 'Free plan CTA must link to /create');
    assert.ok(
      content.includes('No credit card or payment required') ||
      content.includes('No payment is required'),
      'Must clarify no payment is required'
    );
  });

  test('No active paid pricing (₹99, ₹999) or annual discounts (Save 16%) in public pages', () => {
    const prohibitedPatterns = [
      '₹99',
      '₹999',
      'Save 16%',
      'billed annually',
      'Upgrade to Pro',
    ];

    const appDir = path.join(srcDir, 'app');
    function scanDir(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files = files.concat(scanDir(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const allAppFiles = scanDir(appDir);
    for (const filePath of allAppFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of prohibitedPatterns) {
        assert.strictEqual(
          content.includes(pattern),
          false,
          `File ${path.relative(rootDir, filePath)} contains prohibited pattern "${pattern}"`
        );
      }
    }
  });

  test('Create and Join pages explain free trial room limits without broken upgrade buttons', () => {
    const createFile = path.join(srcDir, 'app', 'create', 'page.tsx');
    const joinFile = path.join(srcDir, 'app', 'join', 'page.tsx');
    const createContent = fs.readFileSync(createFile, 'utf8');
    const joinContent = fs.readFileSync(joinFile, 'utf8');

    assert.ok(
      createContent.includes('Free trial limit') || createContent.includes('3 participants per room'),
      'Create page should clearly state free trial limit'
    );
    assert.ok(
      joinContent.includes('Free trial rooms support up to 3 members') || joinContent.includes('3-member limit'),
      'Join page should explain 3-member limit for free rooms'
    );
  });

  test('Settings page presents user plan as Free Trial without fake purchase triggers', () => {
    const settingsFile = path.join(srcDir, 'app', 'settings', 'page.tsx');
    const settingsContent = fs.readFileSync(settingsFile, 'utf8');

    assert.ok(settingsContent.includes('FREE TRIAL'), 'Settings should label active plan as Free Trial');
    assert.ok(settingsContent.includes('PRO (PLANNED)'), 'Pro plan in settings must be marked as planned');
    assert.ok(!settingsContent.includes('Upgrade to Pro'), 'Settings must not contain Upgrade to Pro button');
  });
});
