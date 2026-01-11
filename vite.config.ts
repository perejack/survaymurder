import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { promises as fs } from "node:fs";

const sitemapAndRobotsPlugin = (): Plugin => ({
  name: "generate-sitemap-and-robots",
  apply: "build",
  async closeBundle() {
    console.log("[sitemap-plugin] Starting sitemap and robots generation...");

    const siteUrl = (() => {
      const explicit = process.env.SITE_URL || process.env.VITE_SITE_URL;
      if (explicit) return explicit.replace(/\/$/, "");

      // Explicitly check for the production domain
      if (process.env.VERCEL_ENV === "production") {
        return "https://www.earntasking.online";
      }

      if (process.env.DEPLOY_PRIME_URL) return process.env.DEPLOY_PRIME_URL.replace(/\/$/, "");
      if (process.env.URL) return process.env.URL.replace(/\/$/, "");

      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");

      return "http://localhost:5173";
    })();

    console.log("[sitemap-plugin] Using site URL:", siteUrl);

    const routes = [
      { path: "/", changefreq: "weekly", priority: 1.0 },
      { path: "/about", changefreq: "monthly", priority: 0.7 },
      { path: "/contact", changefreq: "monthly", priority: 0.7 },
      { path: "/terms", changefreq: "yearly", priority: 0.3 },
      { path: "/privacy", changefreq: "yearly", priority: 0.3 },
      { path: "/cookies", changefreq: "yearly", priority: 0.3 },
    ];

    const xmlEscape = (s: unknown) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const distDir = path.resolve(process.cwd(), "dist");
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

    await fs.mkdir(distDir, { recursive: true });
    await fs.writeFile(path.join(distDir, "sitemap.xml"), sitemap, "utf8");

    console.log("[sitemap-plugin] Generated dist/sitemap.xml");

    const robotsPath = path.join(distDir, "robots.txt");
    const robots = [
      "User-agent: *",
      "Allow: /",
      "",
      `Sitemap: ${siteUrl}/sitemap.xml`,
      "",
    ].join("\n");

    await fs.writeFile(robotsPath, robots, "utf8");

    console.log("[sitemap-plugin] Generated dist/robots.txt");
    console.log("[sitemap-plugin] Sitemap and robots generation complete");
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" ? componentTagger() : undefined,
    sitemapAndRobotsPlugin(),
  ].filter((p): p is Plugin => Boolean(p)),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
