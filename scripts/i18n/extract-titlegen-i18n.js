#!/usr/bin/env node
/**
 * Extract hardcoded Chinese strings in the Title Generation module
 * - Scans: src/features/titleGeneration/**/*.ts(x)
 * - Skips: i18n usages (tr(…), i18n.t(…)) to avoid duplicates
 * - Outputs: JSON to stdout with `{ file, line, literal, suggestedKey }`
 *
 * Usage (not executed automatically):
 *   node scripts/i18n/extract-titlegen-i18n.js > titlegen-i18n-report.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, 'src', 'features', 'titleGeneration');
const INCLUDE_EXTS = new Set(['.ts', '.tsx']);

/** Simple stable hash for suggested key */
function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p, out);
    } else {
      const ext = path.extname(ent.name);
      if (INCLUDE_EXTS.has(ext)) out.push(p);
    }
  }
  return out;
}

const CHINESE_CHAR = /[\u4e00-\u9fa5]/;
// Rough string literal patterns (single, double, template literal)
const STRING_LITERALS = /'(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`/g;

function extractFromFile(file) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const results = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip lines that already use i18n wrappers
    if (/\btr\s*\(|\bi18n\.t\s*\(/.test(line)) continue;

    const matches = line.match(STRING_LITERALS);
    if (!matches) continue;

    for (const lit of matches) {
      // Remove quotes/backticks
      const unquoted = lit.startsWith('`')
        ? lit.slice(1, -1)
        : lit.startsWith("'") || lit.startsWith('"')
        ? lit.slice(1, -1)
        : lit;

      if (CHINESE_CHAR.test(unquoted)) {
        // Skip common UI emojis-only etc.
        const trimmed = unquoted.trim();
        if (!trimmed) continue;

        const key = `titleGen.auto.${hash(trimmed)}`;
        results.push({ file: rel, line: i + 1, literal: trimmed, suggestedKey: key });
      }
    }
  }
  return results;
}

function main() {
  const files = walk(TARGET_DIR);
  const all = [];
  for (const f of files) {
    try {
      all.push(...extractFromFile(f));
    } catch (e) {
      // Swallow per-file errors, continue extraction
    }
  }
  process.stdout.write(JSON.stringify(all, null, 2) + '\n');
}

if (require.main === module) {
  main();
}

