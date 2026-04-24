#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

OUT="${1:-/tmp/grimoire-context.txt}"

FILES=(
  "src/types/grimoire.ts"
  "src/services/content.ts"
  "src/engine/useGrimoireEngine.ts"
  "src/App.tsx"
  "src/scene/RitualChamberScene.tsx"
  "src/scene/InWorldOraclePanels.tsx"
  "src/constants/ritualOptions.ts"
  "api/forge.ts"
  "api/oracle.ts"
)

{
  echo "GRIMOIRE XR CONTEXT BUNDLE"
  echo "Generated: $(date)"
  echo
  echo "GIT STATUS"
  git status --short || true
  echo
  echo "LATEST COMMIT"
  git log --oneline --max-count=3 || true
  echo
  echo "========================================"

  for file in "${FILES[@]}"; do
    echo
    echo "FILE: $file"
    echo "----------------------------------------"
    if [ -f "$file" ]; then
      nl -ba "$file"
    else
      echo "[MISSING FILE]"
    fi
    echo
    echo "========================================"
  done
} > "$OUT"

echo "Wrote context bundle to: $OUT"
