# Rēķinu rīks

Vienkāršs web rīks rēķinu izrakstīšanai: klienti, rēķina pozīcijas, PVN (vai "nav PVN maksātājs"), automātiska numerācija (`RR-2026-001`), summa vārdiem un PDF lejupielāde.

Viss ir vienā failā `index.html`, bez būvēšanas soļa.

## Lietošana

- Atver `index.html` pārlūkā. Dati glabājas šī pārlūka `localStorage`.
- claude.ai artifact versijā dati glabājas lietotāja kontā (artifact `db`), un PDF tiek saglabāts caur `downloads`.
- Datu kopiju var lejupielādēt kā JSON cilnē **Mani rekvizīti**.
- Google Drive saglabāšana: skat. [GOOGLE-DRIVE.md](GOOGLE-DRIVE.md).
- Dati uz servera (Cloudflare Pages + D1): skat. [CLOUDFLARE.md](CLOUDFLARE.md).

## Atkarības

- [pdf-lib 1.17.1](https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js) un [@pdf-lib/fontkit](https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js) no jsDelivr (PDF ar īstu tekstu)
- IBM Plex Sans / Mono no Google Fonts; PDF izmanto IBM Plex Sans apakškopu (SIL OFL), iegultu kodā
