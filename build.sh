#!/usr/bin/env bash
# Build a Web-Store-ready ZIP for TV_Unlimit_0x.
# The ZIP contains manifest.json at its ROOT (Chrome rejects a nested folder).
set -euo pipefail
cd "$(dirname "$0")"

VER="$(python3 -c "import json;print(json.load(open('manifest.json'))['version'])")"
OUT="dist/TV_Unlimit_0x-${VER}.zip"
mkdir -p dist
rm -f "$OUT"

# Zip the CONTENTS of this folder (manifest at root), excluding build artifacts.
zip -r -X "$OUT" . \
  -x 'dist/*' 'build.sh' '.git/*' '.gitignore' 'ext_id.txt' '*.zip' >/dev/null

echo "Built: $OUT"
unzip -l "$OUT"
