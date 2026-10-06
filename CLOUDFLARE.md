# Hostings Cloudflare (dati uz servera)

Rīks dzīvo Cloudflare Worker, un klienti ar rēķiniem glabājas Cloudflare D1 datubāzē (serverī), nevis pārlūkā. Viss ir bezmaksas plānā.

Rīks pats pārslēdzas uz servera režīmu, ja tam blakus ir `/api`. GitHub Pages versija turpina strādāt kā līdz šim.

## 1. D1 datubāze
Workers un datubāzi `rekini` Cloudflare izveido pats pēc `wrangler.jsonc`, ja tās vēl nav.

## 2. Izveido projektu no GitHub
Workers & Pages → Create application → Import a repository → `REKINI`:
- Project name: `rekini` (tikai mazie burti, cipari un domuzīmes)
- Build command: `sh tools/cf-build.sh`
- Deploy command: `npx wrangler deploy`
- Deploy

## 3. Atslēga
Projekta (Worker) lapā: **Settings → Variables and Secrets → Add**
- Type: **Secret**, Name: `APP_TOKEN`, Value: tava garā slepenā atslēga (30+ rakstzīmes, saglabā to paroļu pārvaldniekā)
- Deploy

## 4. Pirmā ieeja
Atver `https://rekini.<konts>.workers.dev`. Rīks palūgs piekļuves atslēgu: ievadi `APP_TOKEN` vērtību (pārlūks to atcerēsies). Ja šajā pārlūkā jau ir dati, rīks piedāvās tos pārcelt uz serveri.

## Čeki
Lapa `/cekus.html` ("Saglabāt čekus") ir atvērta bez paroles: čeku bildes un dati glabājas D1 datubāzē. Ja vēlies to aizsargāt, pievieno Secret `RECEIPTS_TOKEN` (tad lapa prasīs šo atslēgu; der arī `APP_TOKEN`).

## Piezīmes
- Bez atslēgas API neatbild ar datiem. Lapa pati ir publiska, bet tajā nav tavu datu.
- Uzņēmumu reģistra dati (`ur-dati.bin`) tiek ielādēti būvēšanas laikā. Lai tos atjaunotu, palaid jaunu publicēšanu (Deployments → Retry).
- Google Drive un paroles slēdzene šajā režīmā netiek izmantoti.
