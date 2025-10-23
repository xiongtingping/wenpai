#!/bin/bash
# Unify display naming: 免费版 ≡ 体验版 (zh-CN), Free ≡ Trial (en-US)
# Safe, preview-first mode. Requires macOS/BSD sed (-i '')

set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "🔎 Preview changes (no files modified). Use APPLY=1 to apply."

# Chinese: 免费版 -> 体验版 (UI text & docs)
ZH_TARGETS=(
  "src/**/*.ts"
  "src/**/*.tsx"
  "src/**/*.json"
  "public/**/*.html"
)

# English: "\"name\": \"Free\"" -> "\"name\": \"Trial\"" under pricing.free
EN_TARGETS=(
  "src/i18n/locales/en-US.json"
)

apply_change() {
  local file="$1"; shift
  local search="$1"; shift
  local replace="$1"; shift
  if [[ "${APPLY:-0}" == "1" ]]; then
    sed -i '' "s/${search}/${replace}/g" "$file"
  else
    if grep -qE "${search}" "$file"; then
      echo "— would change: $file"
      grep -nE "${search}" "$file" | sed 's/^/   line /'
    fi
  fi
}

# 1) zh-CN: 免费版 -> 体验版
for pattern in "${ZH_TARGETS[@]}"; do
  for f in $(find -E $(dirname "$pattern") -regex ".*/$(basename "$pattern" | sed 's/\*/.*/g')"); do
    [[ -f "$f" ]] || continue
    apply_change "$f" "免费版" "体验版"
  done
done

# 2) en-US: pricing.free.name Free -> Trial
for f in ${EN_TARGETS[@]}; do
  [[ -f "$f" ]] || continue
  apply_change "$f" "\"free\"\s*:\s*\{[\s\S]*?\"name\"\s*:\s*\"Free\"" "\"free\": {\\n        \"name\": \"Trial\""
done

echo "✅ Done. Set APPLY=1 to write changes. Example: APPLY=1 bash scripts/rename-free-to-trial.sh"

