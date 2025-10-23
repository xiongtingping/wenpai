#!/usr/bin/env node
/**
 * Scan specific platform-selection/batch-publish files for hardcoded orange Tailwind classes.
 * Looks for: text-orange-*, bg-orange-*
 *
 * Usage:
 *   node scripts/scan-orange-hardcoding.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const targets = [
  'src/constants/platforms.tsx',
  'src/pages/ShareManagerPage.tsx',
  'src/features/content-adapter/components/PlatformSelector.tsx',
  'src/components/EnhancedBatchPublishPanel.tsx',
  'src/components/PlatformContentCard.tsx',
  'src/components/批量发布集成示例.tsx',
];

const pattern = /(text-orange-\d+|bg-orange-\d+)/g;

function scanFile(filePath) {
  const abs = path.join(repoRoot, filePath);
  if (!fs.existsSync(abs)) return { file: filePath, exists: false, matches: [] };
  const content = fs.readFileSync(abs, 'utf8');
  const lines = content.split('\n');
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const found = line.match(pattern);
    if (found) {
      matches.push({ line: i + 1, text: line.trim(), tokens: found });
    }
  }
  return { file: filePath, exists: true, matches };
}

let totalIssues = 0;
const results = targets.map(scanFile);

for (const res of results) {
  if (!res.exists) continue;
  if (res.matches.length) {
    console.log(`\n[FAIL] ${res.file}`);
    for (const m of res.matches) {
      console.log(`  L${m.line}: ${m.tokens.join(', ')}  => ${m.text}`);
      totalIssues++;
    }
  } else {
    console.log(`[OK]   ${res.file}`);
  }
}

if (totalIssues > 0) {
  console.error(`\nFound ${totalIssues} hardcoded orange classes.`);
  process.exit(1);
} else {
  console.log('\nNo hardcoded orange classes found in target files.');
  process.exit(0);
}

