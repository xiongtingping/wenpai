#!/usr/bin/env node
/**
 * Audit that the title copied in batch forwarding equals the AI adapter generated title.
 * Heuristics (static check):
 * 1) ContentAdapterPage.tsx should assign `title = titleStates[pid]?.title` when building `forwardPlatforms`
 * 2) BatchForwardModal.tsx should copy `platform.title` when clicking "复制标题"
 *
 * Exit 0 if both are satisfied; 1 otherwise. Prints matched lines for manual review.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function find(pathRel, regexes) {
  const p = path.join(root, pathRel);
  const text = fs.readFileSync(p, 'utf8');
  const lines = text.split('\n');
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    for (const re of regexes) {
      if (re.test(lines[i])) hits.push({ line: i + 1, text: lines[i].trim() });
    }
  }
  return hits;
}

let ok = true;

// 1) ContentAdapterPage: title from titleStates
const contentAdapterHits = find('src/features/content-adapter/components/ContentAdapterPage.tsx', [
  /title\s*=\s*titleState\?\.title/,
  /const\s+titleState\s*=\s*titleStates\[(pid|result\.platformId)\]/
]);
if (contentAdapterHits.length < 2) {
  ok = false;
  console.error('[FAIL] ContentAdapterPage.tsx: 未发现基于 titleStates 的标题赋值');
} else {
  console.log('[OK] ContentAdapterPage.tsx: 找到基于 titleStates 的标题赋值');
  for (const h of contentAdapterHits) console.log(`  L${h.line}: ${h.text}`);
}

// 2) BatchForwardModal: copy platform.title for 标题
const batchModalHits = find('src/components/BatchForwardModal.tsx', [
  /copyToClipboard\(\s*platform\.title\s*,.*标题/,
]);
if (batchModalHits.length < 1) {
  ok = false;
  console.error('[FAIL] BatchForwardModal.tsx: 未发现复制 标题 时使用 platform.title');
} else {
  console.log('[OK] BatchForwardModal.tsx: 复制 标题 使用 platform.title');
  for (const h of batchModalHits) console.log(`  L${h.line}: ${h.text}`);
}

process.exit(ok ? 0 : 1);

