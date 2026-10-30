#!/usr/bin/env bash
# Builds two outputs from src/:
#   dist/index.html     full single-file page (GitHub Pages / any static host)
#   dist/artifact.html  body fragment used for the claude.ai artifact
set -e
cd "$(dirname "$0")"
mkdir -p dist
ORDER="core assets rig creatures terrain data combat world scenery ui main"
JS=""
for f in $ORDER; do JS="$JS src/$f.js"; done
{ cat src/shell.html; echo '<script>'; cat $JS; echo '</script>'; } > dist/artifact.html
{ echo '<!doctype html><html lang="fa" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><meta name="theme-color" content="#07040f"><link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icons/favicon.png"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="NIMA">';
  sed -n '1,/<\/style>/p' src/shell.html; echo '</head><body>';
  sed '1,/<\/style>/d' src/shell.html; echo '<script>'; cat $JS; echo '</script></body></html>'; } > dist/index.html
cp -r pwa/* dist/
for f in $JS; do node --check "$f"; done
echo "built: $(wc -c < dist/index.html) bytes"
