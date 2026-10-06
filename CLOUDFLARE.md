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
Lapa `/cekus.html` ("Saglabāt čekus") ir atvērta bez paroles, bet tajā var tikai **pievienot** čekus: pēc saglabāšanas var labot datus apmēram 6 stundas. Saraksts, meklēšana, bildes, dzēšana un ZIP arhīvs ir tikai rēķinu rīka cilnē **Čeki**, un serveris tos neatdod bez `APP_TOKEN`.

Ja vēlies aizsargāt arī čeku pievienošanu, pievieno Secret `RECEIPTS_TOKEN` (tad lapa prasīs šo atslēgu).

## Čeku pievienošana no Android ("Share")
1. Android tālrunī Chrome atver `https://rekini.solidartrekini.workers.dev/cekus.html`.
2. Izvēlne (trīs punkti) → **Instalēt lietotni** (vai **Pievienot sākuma ekrānam**).
3. Tagad jebkuram attēlam vai PDF failam spied **Kopīgot (Share)** un izvēlies **Čeki**. Čeks tiek saglabāts un atveras datu aizpildīšanai.

iPhone šo funkciju neatbalsta, tur izmanto pogas lapā.

## Piezīmes
- Bez atslēgas API neatbild ar datiem. Lapa pati ir publiska, bet tajā nav tavu datu.
- Uzņēmumu reģistra dati (`ur-dati.bin`) tiek ielādēti būvēšanas laikā. Lai tos atjaunotu, palaid jaunu publicēšanu (Deployments → Retry).
- Google Drive un paroles slēdzene šajā režīmā netiek izmantoti.
