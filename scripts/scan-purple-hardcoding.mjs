#!/usr/bin/env node
/**
 * Scan Tag/Hashtag related files for hardcoded purple Tailwind classes.
 * Looks for: text-purple-*, bg-purple-*, border-purple-*, bg-violet-*, text-violet-*, border-violet-*
 *
 * Usage:
 *   node scripts/scan-purple-hardcoding.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = process.cwd();

// Heuristics: only scan files likely related to tag/hashtag UI
const candidateGlobs = [
  'src/components/**/Tag*.tsx',
  'src/components/**/Hashtag*.tsx',
  'src/components/PlatformHashtags.tsx',
  'src/features/**/ResultsDisplay.tsx',
  'src/features/**/Tags*.tsx',
  'src/features/**/Hashtag*.tsx',
];

// Simple glob without deps - expand directories recursively and filter by pattern suffixes
function collectFiles() {
  const results = new Set();
  const includes = [
    /Tag.*\.tsx$/i,
    /Hashtag.*\.tsx$/i,
    /PlatformHashtags\.tsx$/,
    /ResultsDisplay\.tsx$/
  ];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (full.includes('node_modules') || full.includes('dist')) continue;
        walk(full);
      } else if (e.isFile()) {
        if (!full.endsWith('.tsx')) continue;
        if (includes.some((re) => re.test(full))) {
          results.add(full);
        }
      }
    }
  }
  walk(path.join(repoRoot, 'src'));
  return Array.from(results);
}

const files = collectFiles();

const pattern = /(text|bg|border)-(purple|violet)-(50|100|200|300|400|500|600|700|800|900|950)(\/[0-9]{1,2})?/g;

let totalIssues = 0;
for (const abs of files) {
  const rel = path.relative(repoRoot, abs);
  const content = fs.readFileSync(abs, 'utf8');
  const lines = content.split('\n');
  let printedHeader = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.match(pattern);
    if (matches) {
      if (!printedHeader) {
        console.log(`\n[FAIL] ${rel}`);
        printedHeader = true;
      }
      console.log(`  L${i + 1}: ${matches.join(', ')}  => ${line.trim()}`);
      totalIssues++;
    }
  }
  if (!printedHeader) {
    console.log(`[OK]   ${rel}`);
  }
}

if (totalIssues > 0) {
  console.error(`\nFound ${totalIssues} hardcoded purple classes in Tag/Hashtag related files.`);
  process.exit(1);
} else {
  console.log('\nNo hardcoded purple classes found in Tag/Hashtag related files.');
  process.exit(0);
}

