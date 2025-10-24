/*
 * RSSHub OpenAPI Smoke Test (Netlify Preview)
 * Base: https://wenpaiai.netlify.app
 * Usage: node scripts/rsshub-openapi-test.preview.mjs
 * Requires: Node >= 18 (built-in fetch)
 */

const BASE = 'https://wenpaiai.netlify.app';
const PROXY = '/.netlify/functions/rsshub-proxy';
const HEADERS = { Accept: 'application/json' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (n) => Math.floor(Math.random() * n);

function buildUrl(path) {
  const qs = new URLSearchParams({ path });
  return `${BASE}${PROXY}?${qs.toString()}`;
}

async function fetchWithRetry(path, maxRetries = 2) {
  const url = buildUrl(path);
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetch(url, { headers: HEADERS, redirect: 'follow' });
      const ct = resp.headers.get('content-type') || '';
      const isJson = ct.includes('json');
      const body = isJson ? await resp.text() : await resp.text();
      const okish = resp.status >= 200 && resp.status < 400;
      if (okish) return { status: resp.status, ct, len: body.length, snippet: body.slice(0, 200) };
      if (resp.status === 429 || resp.status >= 500) {
        const backoff = (500 * Math.pow(2, attempt)) + jitter(250);
        await sleep(backoff);
        continue;
      }
      return { status: resp.status, ct, len: body.length, snippet: body.slice(0, 200) };
    } catch (e) {
      const backoff = (500 * Math.pow(2, attempt)) + jitter(250);
      if (attempt < maxRetries) { await sleep(backoff); continue; }
      return { status: 0, ct: 'n/a', len: 0, snippet: String(e) };
    }
  }
}

async function run() {
  const paths = [
    '/api/category/popular',
    '/api/radar/rules',
    '/api/radar/rules/github.com',
    '/api/namespace/weibo',
    '/api/follow/config',
    // 放在最后，限流较严
    '/api/namespace'
  ];

  const results = [];
  for (const p of paths) {
    console.log(`\n==> GET ${p}`);
    const r = await fetchWithRetry(p, 2);
    console.log(`STATUS: ${r.status}  CT: ${r.ct}  LEN: ${r.len}`);
    console.log(`SNIPPET: ${r.snippet.replace(/\n/g, ' ').slice(0, 180)}`);
    results.push({ path: p, ...r });
    await sleep(700 + jitter(200));
  }

  const summary = results.map(x => `${x.path} -> ${x.status} (${x.len})`).join('\n');
  console.log(`\nSummary (preview):\n${summary}`);
}

await run();

