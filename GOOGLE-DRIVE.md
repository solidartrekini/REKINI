# Saglabāšana Google Drive

Rīks saglabā datus Google Drive mapē **Rēķinu rīks**: failu `rekinu-riks-dati.json` (klienti, rēķini, rekvizīti), Google Sheets tabulu **Klienti** (rediģējams klientu saraksts) un katru lejupielādēto rēķina PDF mapēs `Rēķini / gads / mēnesis`. Rīks redz tikai tos failus, ko pats izveidojis (atļauja `drive.file`).

## Vienreizēja iestatīšana (apmēram 10 minūtes)

1. Atver https://console.cloud.google.com/ un augšā izveido jaunu projektu, piemēram "Rēķinu rīks".
2. **APIs & Services → Library**, sameklē **Google Drive API** un spied **Enable**.
3. Tāpat ieslēdz **Google Sheets API**: https://console.cloud.google.com/apis/library/sheets.googleapis.com
4. **APIs & Services → OAuth consent screen** (vai **Google Auth platform**): lietotāja tips **External**, aizpildi lietotnes nosaukumu un savu e-pastu. Sadaļā **Test users** (**Audience**) pievieno savu Google e-pastu.
5. **APIs & Services → Credentials → Create credentials → OAuth client ID**: tips **Web application**. Sadaļā **Authorized JavaScript origins** pievieno `https://solidartrekini.github.io` (bez `/REKINI/` un bez slīpsvītras beigās).
6. Nokopē **Client ID** (beidzas ar `.apps.googleusercontent.com`).
7. Rīkā atver **Mani rekvizīti**, ielīmē to laukā **Google Client ID** un saglabā. Augšā spied **Pieslēgt Google Drive** un apstiprini piekļuvi.

Pieslēgums jāapstiprina katrā jaunā pārlūka sesijā (Google atļauja derīga apmēram stundu); poga augšā pateiks, kad vajag pieslēgties atkārtoti.
