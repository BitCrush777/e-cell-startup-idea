import { test, describe } from 'node:test';
import assert from 'node:assert';
import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';

describe('TempLink Market-Readiness & SEO Crawlers Verification Tests', () => {
  test('Robots.txt: Excludes temporary rooms, join endpoints, and private APIs from crawlers', () => {
    const robotsConfig = robots();
    assert.ok(robotsConfig.rules, 'Robots config must specify rules');

    const rule = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
    const disallowList = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
    const allowList = Array.isArray(rule.allow) ? rule.allow : [rule.allow];

    // Must protect temporary rooms
    assert.ok(disallowList.includes('/room/'), 'Must disallow /room/ to prevent indexing active sessions');
    assert.ok(disallowList.includes('/join/'), 'Must disallow /join/ to prevent indexing room codes');
    assert.ok(disallowList.includes('/api/'), 'Must disallow /api/ endpoints');

    // Must index public pages
    assert.ok(allowList.includes('/'), 'Must allow landing page');
    assert.ok(allowList.includes('/privacy'), 'Must allow privacy policy');
    assert.ok(allowList.includes('/terms'), 'Must allow terms of service');
    assert.ok(allowList.includes('/how-it-works'), 'Must allow how-it-works');

    // Must have production sitemap
    assert.strictEqual(robotsConfig.sitemap, 'https://templink.in/sitemap.xml');
  });

  test('Sitemap.xml: References production canonical URLs and includes essential legal/public pages', () => {
    const sitemapEntries = sitemap();
    assert.ok(sitemapEntries.length >= 7, 'Sitemap must contain all public routes');

    const urls = sitemapEntries.map((e) => e.url);

    assert.ok(urls.includes('https://templink.in'), 'Must include root domain');
    assert.ok(urls.includes('https://templink.in/how-it-works'), 'Must include how-it-works');
    assert.ok(urls.includes('https://templink.in/security'), 'Must include security');
    assert.ok(urls.includes('https://templink.in/pricing'), 'Must include pricing');
    assert.ok(urls.includes('https://templink.in/about'), 'Must include about');
    assert.ok(urls.includes('https://templink.in/privacy'), 'Must include privacy policy');
    assert.ok(urls.includes('https://templink.in/terms'), 'Must include terms of service');

    // Must NOT contain room URLs or localhost
    urls.forEach((u) => {
      assert.ok(!u.includes('/room/'), 'Sitemap must never include /room/');
      assert.ok(!u.includes('/join/'), 'Sitemap must never include /join/');
      assert.ok(!u.includes('localhost'), 'Sitemap must use templink.in, never localhost');
      assert.ok(u.startsWith('https://templink.in'), 'All URLs must use https://templink.in');
    });
  });
});
