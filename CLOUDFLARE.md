# Hostings Cloudflare (dati uz servera)

Ar šo variantu rīks dzīvo Cloudflare Pages, bet klienti un rēķini glabājas Cloudflare D1 datubāzē (serverī), nevis pārlūkā. Viss ir bezmaksas plānā.

Rīks pats pārslēdzas uz servera režīmu, ja tam blakus ir `/api`. GitHub Pages versija turpina strādāt kā līdz šim.

## 1. Izveido D1 datubāzi
1. Reģistrējies / ieej https://dash.cloudflare.com
2. Kreisajā izvēlnē: **Storage & databases → D1 SQL database → Create database**
3. Nosaukums: `rekini` → Create. (Tabulu veidot nevajag, tā izveidojas automātiski.)

## 2. Izveido Pages projektu no GitHub
1. **Workers & Pages → Create → Pages → Connect to Git**, izvēlies repozitoriju `solidartrekini/REKINI`.
2. Iestatījumi:
   - Production branch: `main`
   - Build command: `sh tools/cf-build.sh`
   - Build output directory: `site`
3. **Save and Deploy**.

## 3. Piesaisti datubāzi un uzliec atslēgu
Projektā: **Settings → Bindings → Add → D1 database**
- Variable name: `DB`
- D1 database: `rekini`

Tad **Settings → Variables and Secrets → Add**:
- Type: **Secret**, Name: `APP_TOKEN`, Value: tava garā slepenā atslēga (piem., 30+ rakstzīmes; saglabā to parole mā pārvaldniekā)

Pēc tam **Deployments → Retry deployment** (vai veic jebkuru jaunu commit), lai iestatījumi stātos spēkā.

## 4. Pirmā ieeja
Atver `https://<projekts>.pages.dev`. Rīks palūgs piekļuves atslēgu: ievadi `APP_TOKEN` vērtību (pārlūks to atcerēsies). Ja šajā pārlūkā jau ir dati, rīks piedāvās tos pārcelt uz serveri.

## Piezīmes
- Bez atslēgas API neatbild ar datiem. Lapa pati ir publiska, bet tajā nav tavu datu.
- Uzņēmumu reģistra dati (`ur-dati.bin`) tiek ielādēti būvēšanas laikā. Lai tos atjaunotu, **Deployments → Retry deployment**.
- Google Drive un paroles slēdzene šajā režīmā netiek izmantoti.
