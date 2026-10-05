# Rēķinu rīks

Vienkāršs web rīks rēķinu izrakstīšanai: klienti, rēķina pozīcijas, PVN (vai "nav PVN maksātājs"), automātiska numerācija (`RR-2026-001`), summa vārdiem un PDF lejupielāde.

Viss ir vienā failā `index.html`, bez būvēšanas soļa.

## Lietošana

- Atver `index.html` pārlūkā. Dati glabājas šī pārlūka `localStorage`.
- claude.ai artifact versijā dati glabājas lietotāja kontā (artifact `db`), un PDF tiek saglabāts caur `downloads`.
- Datu kopiju var lejupielādēt kā JSON cilnē **Mani rekvizīti**.

## Atkarības

- [html2pdf.js 0.10.1](https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js) no cdnjs
- IBM Plex Sans / Mono no Google Fonts
