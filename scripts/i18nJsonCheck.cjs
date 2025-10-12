/*
 * i18n JSON syntax checker
 * Scans src/i18n/locales for *.json files and validates JSON.parse
 * Exits non‑zero when any file fails, printing a concise report
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'src', 'i18n', 'locales');

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(p);
    } else if (entry.isFile() && p.endsWith('.json')) {
      yield p;
    }
  }
}

let ok = 0;
const fails = [];

if (!fs.existsSync(DIR)) {
  console.log('[i18n:lint] locales directory not found, skipping.');
  process.exit(0);
}

for (const file of walk(DIR)) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    JSON.parse(content);
    ok++;
  } catch (e) {
    fails.push({ file: path.relative(ROOT, file), error: e && e.message ? e.message : String(e) });
  }
}

if (fails.length) {
  console.error('[i18n:lint] JSON syntax errors found:', JSON.stringify({ ok, failCount: fails.length, fails }, null, 2));
  process.exit(1);
} else {
  console.log(`[i18n:lint] OK: ${ok} files`);
}

