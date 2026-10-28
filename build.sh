#!/bin/bash
set -e
cd "$(dirname "$0")"
mkdir -p dist android/app/src/main/assets
JS=$(cat src/core.js src/chars.js src/bg.js src/meta.js src/story.js src/game.js src/fight.js src/ui.js)
{ cat src/head.html; echo "<script>"; echo "$JS"; echo "</script>"; } > dist/n2-game.html
# full standalone document for the APK / GitHub Pages
{ echo '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'
  echo '<meta name="theme-color" content="#07051a"><meta name="mobile-web-app-capable" content="yes">'
  echo '<link rel="stylesheet" href="fonts/fonts.css">'
  echo '</head><body>'
  cat src/head.html; echo "<script>"; echo "$JS"; echo "</script></body></html>"; } > android/app/src/main/assets/index.html
cat src/core.js src/chars.js src/bg.js src/meta.js src/story.js src/game.js src/fight.js src/ui.js > dist/check.js
node --check dist/check.js && echo SYNTAX_OK
