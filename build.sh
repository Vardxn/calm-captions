#!/bin/sh
# Builds dist/calm-captions-chromium.zip (Chrome + Edge) and dist/calm-captions-firefox.zip
set -e
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist/ff
(cd src && zip -qr ../dist/calm-captions-chromium.zip .)
cp -R src/. dist/ff/
python3 - <<'P'
import json
m=json.load(open('dist/ff/manifest.json'))
m['browser_specific_settings']={'gecko':{'id':'calm-captions@example.invalid','strict_min_version':'140.0','data_collection_permissions':{'required':['none']}}}
json.dump(m,open('dist/ff/manifest.json','w'),indent=2)
P
(cd dist/ff && zip -qr ../calm-captions-firefox.zip .)
rm -rf dist/ff
ls dist
