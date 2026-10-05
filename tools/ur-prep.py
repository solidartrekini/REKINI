"""Pārveido UR atvērto datu register.csv par kompaktu ur-dati.bin (gzip TSV: regcode, name, address).
Lietošana: python3 ur-prep.py register.csv ur-dati.bin
Paņem tikai darbojošos subjektus (tukšs 'terminated' lauks)."""
import csv, gzip, sys, io

src, dst = sys.argv[1], sys.argv[2]
raw = open(src, 'rb').read()
text = raw.decode('utf-8-sig', errors='replace')
delim = ';' if text[:2000].count(';') > text[:2000].count(',') else ','
rows = csv.DictReader(io.StringIO(text), delimiter=delim)
clean = lambda s: (s or '').replace('\t', ' ').replace('\n', ' ').replace('\r', ' ').strip()
n = 0
with gzip.open(dst, 'wt', encoding='utf-8', compresslevel=9) as out:
    for r in rows:
        r = {k.strip().lower(): v for k, v in r.items() if k}
        if clean(r.get('terminated')):
            continue
        reg, name = clean(r.get('regcode')), clean(r.get('name'))
        if not reg or not name:
            continue
        out.write(f"{reg}\t{name}\t{clean(r.get('address'))}\n"); n += 1
print('ieraksti:', n)
