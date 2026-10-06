#!/bin/sh
# Cloudflare Pages būvēšanas komanda: sagatavo mapi "site" ar lapu un Uzņēmumu reģistra datiem.
set -e
mkdir -p site
cp *.html sw.js manifest.webmanifest icon-*.png site/
if curl -fsSL --retry 3 -o register.csv "https://data.gov.lv/dati/dataset/4de9697f-850b-45ec-8bba-61fa09ce932f/resource/25e80bf3-f107-4ab4-89ef-251b5b9374e9/download/register.csv"; then
  python3 tools/ur-prep.py register.csv site/ur-dati.bin || echo "Reģistra dati netika sagatavoti"
else
  echo "Reģistra datus neizdevās lejupielādēt"
fi
ls -la site
