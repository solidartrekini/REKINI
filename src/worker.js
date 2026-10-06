// Rēķinu rīka serveris: Cloudflare Worker (statiskie faili + /api) ar D1 (binding DB).
// Piekļuve ar slepenu atslēgu (vide: APP_TOKEN), ko lietotne sūta kā "Authorization: Bearer ...".
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const COLL = new Set(["clients", "invoices", "config"]);

async function eq(a, b) {
  const h = async s => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  const [x, y] = [await h(a), await h(b)];
  let d = 0; for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

async function api(request, env0, parts) {
  const env = { ...env0, APP_TOKEN: env0.APP_TOKEN || env0.app_token, DB: env0.DB || env0.db, RECEIPTS_TOKEN: env0.RECEIPTS_TOKEN || env0.receipts_token };
  const m = request.method;
  if (parts[0] === "ping") return J({ ok: true, configured: !!(env.DB && env.APP_TOKEN), db: !!env.DB, token: !!env.APP_TOKEN, receiptsLocked: !!env.RECEIPTS_TOKEN });
  if (!env.DB) return J({ error: "D1 datubāze nav piesaistīta (binding DB)" }, 500);
  if (parts[0] === "receipts") return receipts(request, env, parts);
  if (!env.APP_TOKEN) return J({ error: "Nav iestatīts APP_TOKEN" }, 500);
  const tok = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!tok || !(await eq(tok, env.APP_TOKEN))) return J({ error: "Nepareiza atslēga" }, 401);

  await env.DB.exec("CREATE TABLE IF NOT EXISTS docs (coll TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY (coll, id))");

  if (parts[0] === "data" && m === "GET") {
    const { results } = await env.DB.prepare("SELECT coll, id, data FROM docs").all();
    const out = { settings: null, clients: [], invoices: [] };
    for (const r of results) {
      const o = JSON.parse(r.data);
      if (r.coll === "config" && r.id === "settings") out.settings = o;
      else if (r.coll === "clients" || r.coll === "invoices") out[r.coll].push({ ...o, id: r.id });
    }
    return J(out);
  }
  if (parts[0] === "doc" && parts.length === 3 && COLL.has(parts[1])) {
    const [, coll, id] = parts;
    if (m === "PUT") {
      const body = await request.text();
      if (body.length > 2_000_000) return J({ error: "Par lielu" }, 413);
      try { JSON.parse(body); } catch (e) { return J({ error: "Nederīgs JSON" }, 400); }
      await env.DB.prepare("INSERT INTO docs (coll, id, data) VALUES (?1, ?2, ?3) ON CONFLICT(coll, id) DO UPDATE SET data = ?3").bind(coll, id, body).run();
      return J({ ok: true });
    }
    if (m === "DELETE") { await env.DB.prepare("DELETE FROM docs WHERE coll = ?1 AND id = ?2").bind(coll, id).run(); return J({ ok: true }); }
  }
  return J({ error: "Nav atrasts" }, 404);
}

// ---- Čeki ----
// Pievienot var jebkurš (vai ar RECEIPTS_TOKEN, ja iestatīts), bet tikai svaigus čekus (6 h pēc izveides).
// Saraksts, bildes, dzēšana: tikai ar APP_TOKEN (rēķinu rīks).
const B64 = /^[A-Za-z0-9+/=]+$/;
const FRESH_MS = 6 * 3600 * 1000;
let receiptTables = false;
async function receipts(request, env, parts) {
  const m = request.method;
  const tok = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const admin = !!(tok && env.APP_TOKEN && (await eq(tok, env.APP_TOKEN)));
  const uploader = admin || !env.RECEIPTS_TOKEN || !!(tok && (await eq(tok, env.RECEIPTS_TOKEN)));
  if (!uploader) return J({ error: "Nepareiza atslēga" }, 401);
  if (!receiptTables) {
    await env.DB.exec("CREATE TABLE IF NOT EXISTS receipts (id TEXT PRIMARY KEY, data TEXT NOT NULL)");
    await env.DB.exec("CREATE TABLE IF NOT EXISTS receipt_imgs (id TEXT PRIMARY KEY, data TEXT NOT NULL)");
    receiptTables = true;
  }
  const needAdmin = () => J({ error: "Šī darbība ir pieejama tikai rēķinu rīkā" }, 401);
  if (parts.length === 1 && m === "GET") {
    if (!admin) return needAdmin();
    const { results } = await env.DB.prepare("SELECT id, data FROM receipts").all();
    return J(results.map(r => ({ ...JSON.parse(r.data), id: r.id })));
  }
  const id = parts[1];
  if (!id || !/^[\w-]{6,64}$/.test(id)) return J({ error: "Nederīgs id" }, 400);
  const fresh = async rid => {
    const row = await env.DB.prepare("SELECT data FROM receipts WHERE id = ?1").bind(rid).first();
    if (!row) return { exists: false, ok: true, data: null };
    let d = {}; try { d = JSON.parse(row.data); } catch (e) {}
    return { exists: true, ok: Date.now() - (Number(d.createdAt) || 0) < FRESH_MS, data: d };
  };
  if (parts.length === 2 && m === "PUT") {
    const body = await request.text();
    if (body.length > 150_000) return J({ error: "Par lielu" }, 413);
    try { JSON.parse(body); } catch (e) { return J({ error: "Nederīgs JSON" }, 400); }
    if (!admin) { const f = await fresh(id); if (!f.ok) return J({ error: "Čeku vairs nevar labot no šejienes. Atver to rēķinu rīkā." }, 403); }
    await env.DB.prepare("INSERT INTO receipts (id, data) VALUES (?1, ?2) ON CONFLICT(id) DO UPDATE SET data = ?2").bind(id, body).run();
    return J({ ok: true });
  }
  if (parts.length === 2 && m === "DELETE") {
    if (!admin) return needAdmin();
    const row = await env.DB.prepare("SELECT data FROM receipts WHERE id = ?1").bind(id).first();
    const ids = new Set([id]);
    try { for (const pg of (JSON.parse(row.data).pages || [])) if (pg && /^[\w-]{6,64}$/.test(pg.id)) ids.add(pg.id); } catch (e) {}
    await env.DB.prepare("DELETE FROM receipts WHERE id = ?1").bind(id).run();
    for (const i of ids) await env.DB.prepare("DELETE FROM receipt_imgs WHERE id = ?1").bind(i).run();
    return J({ ok: true });
  }
  if (parts.length === 3 && parts[2] === "img") {
    if (m === "PUT") {
      const b64 = (await request.text()).trim();
      if (!b64 || b64.length > 1_900_000 || !B64.test(b64)) return J({ error: "Nederīga vai pārāk liela bilde" }, 413);
      if (!admin) {
        // bildi drīkst pievienot tikai svaigam čekam, kura bilžu sarakstā šis id jau ir
        const cands = [id]; const f0 = await fresh(id); let ok = f0.exists && f0.ok;
        if (!ok) { const rid = new URL(request.url).searchParams.get("r"); if (rid && /^[\w-]{6,64}$/.test(rid)) { const f = await fresh(rid); ok = f.exists && f.ok && (f.data.pages || []).some(pg => pg.id === id); } }
        if (!ok) return J({ error: "Bildi var pievienot tikai svaigi saglabātam čekam" }, 403);
      }
      await env.DB.prepare("INSERT INTO receipt_imgs (id, data) VALUES (?1, ?2) ON CONFLICT(id) DO UPDATE SET data = ?2").bind(id, b64).run();
      return J({ ok: true });
    }
    if (!admin) return needAdmin();
    if (m === "DELETE") { await env.DB.prepare("DELETE FROM receipt_imgs WHERE id = ?1").bind(id).run(); return J({ ok: true }); }
    if (m === "GET") {
      const r = await env.DB.prepare("SELECT data FROM receipt_imgs WHERE id = ?1").bind(id).first();
      if (!r) return J({ error: "Nav atrasts" }, 404);
      const bin = atob(r.data), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return new Response(u8, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" } });
    }
  }
  return J({ error: "Nav atrasts" }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return api(request, env, url.pathname.slice(5).split("/").filter(Boolean).map(decodeURIComponent));
    return env.ASSETS.fetch(request);
  }
};
