// Pakalpojumu skripts: pieņem čekus no Android "Share" (Web Share Target) un nodod tos lapai cekus.html.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method === "POST" && u.pathname.endsWith("/cekus-share")) {
    e.respondWith((async () => {
      const scope = self.registration.scope;
      let n = 0;
      try {
        const fd = await r.formData();
        const files = fd.getAll("files").filter(f => f && typeof f !== "string" && f.size > 0);
        const c = await caches.open("rr-share");
        for (const k of await c.keys()) await c.delete(k);
        for (const f of files) await c.put(new URL("shared/" + n++, scope).href, new Response(f, { headers: { "Content-Type": f.type || "application/octet-stream", "X-Name": encodeURIComponent(f.name || "fails") } }));
      } catch (err) { n = 0; }
      return Response.redirect(new URL("cekus.html?shared=" + n, scope).href, 303);
    })());
  }
});
