#!/usr/bin/env node
/**
 * Scan the entire src/ for hardcoded purple/violet Tailwind classes
 * Patterns:
 *  - text-(purple|violet)-N
 *  - bg-(purple|violet)-N
 *  - border-(purple|violet)-N
 *  - from-(purple|violet)-N, to-(purple|violet)-N
 *  - shadow-(purple|violet)-N
 *  - dark:* variants are matched implicitly
 *
 * Exit codes:
 *  - 0: no issues
 *  - 1: found occurrences
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const SRC = path.join(root, 'src');

const re = /(?:^|\s)(?:text|bg|border|from|to|shadow)-(?:purple|violet)-(?:50|100|200|300|400|500|600|700|800|900|950)(?:\/[0-9]{1,2})?(?=\s|"|'|`|\)|\]|$)/g;

let total = 0;

function walk(dir, out = []) {
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (p.includes('node_modules') || p.includes('dist') || p.includes('.git')) continue;
      walk(p, out);
    } else if (e.isFile()) {
      if (/(\.tsx|\.ts|\.jsx|\.js|\.css)$/i.test(p)) out.push(p);
    }
  }
  return out;
}

const files = walk(SRC);
for (const abs of files) {
  const rel = path.relative(root, abs);
  const text = fs.readFileSync(abs, 'utf8');
  const lines = text.split('\n');
  let hit = false;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (m) {
      if (!hit) {
        console.log(`\n[FAIL] ${rel}`);
        hit = true;
      }
      console.log(`  L${i + 1}: ${m.join(', ')}  => ${lines[i].trim()}`);
      total += m.length;
    }
  }
  if (!hit) {
    // Only print OK for .tsx files to keep output readable
    if (abs.endsWith('.tsx')) {
      console.log(`[OK]   ${rel}`);
    }
  }
}

if (total > 0) {
  console.error(`\nFound ${total} hardcoded purple/violet classes in src/.`);
  process.exit(1);
} else {
  console.log('\nNo hardcoded purple/violet classes found in src/.');
  process.exit(0);
}

