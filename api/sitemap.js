const routes = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.7 },
  { path: "/contact", changefreq: "monthly", priority: 0.7 },
  { path: "/terms", changefreq: "yearly", priority: 0.3 },
  { path: "/privacy", changefreq: "yearly", priority: 0.3 },
  { path: "/cookies", changefreq: "yearly", priority: 0.3 },
];

function resolveSiteUrl(req) {
  const explicit = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const host = req?.headers?.["x-forwarded-host"] || req?.headers?.host;
  const proto = req?.headers?.["x-forwarded-proto"] || "https";
  if (host) return `${proto}://${host}`.replace(/\/$/, "");

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");

  return "https://www.earntasking.online";
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).send("Method Not Allowed");
  }

  const siteUrl = resolveSiteUrl(req);
  const lastmod = new Date().toISOString();

  const urls = routes
    .map((r) => {
      const loc = `${siteUrl}${r.path === "/" ? "" : r.path}`;
      return [
        "  <url>",
        `    <loc>${xmlEscape(loc)}</loc>`,
        `    <lastmod>${xmlEscape(lastmod)}</lastmod>`,
        `    <changefreq>${xmlEscape(r.changefreq)}</changefreq>`,
        `    <priority>${xmlEscape(r.priority)}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");

  if (req.method === "HEAD") return res.status(200).end();
  return res.status(200).send(sitemap);
};
