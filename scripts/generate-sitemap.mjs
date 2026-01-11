import { promises as fs } from 'node:fs'
import path from 'node:path'

const routes = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/about', changefreq: 'monthly', priority: 0.7 },
  { path: '/contact', changefreq: 'monthly', priority: 0.7 },
  { path: '/terms', changefreq: 'yearly', priority: 0.3 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { path: '/cookies', changefreq: 'yearly', priority: 0.3 }
]

function resolveSiteUrl() {
  const explicit = process.env.SITE_URL || process.env.VITE_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')

  if (process.env.DEPLOY_PRIME_URL) return process.env.DEPLOY_PRIME_URL.replace(/\/$/, '')
  if (process.env.URL) return process.env.URL.replace(/\/$/, '')

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '')

  return 'http://localhost:5173'
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function main() {
  console.log('[standalone-sitemap] Starting sitemap generation...')

  const siteUrl = resolveSiteUrl()
  console.log('[standalone-sitemap] Using site URL:', siteUrl)

  const distDir = path.resolve(process.cwd(), 'dist')

  const now = new Date()
  const lastmod = now.toISOString()

  const urls = routes
    .map((r) => {
      const loc = `${siteUrl}${r.path === '/' ? '' : r.path}`
      return [
        '  <url>',
        `    <loc>${xmlEscape(loc)}</loc>`,
        `    <lastmod>${xmlEscape(lastmod)}</lastmod>`,
        `    <changefreq>${xmlEscape(r.changefreq)}</changefreq>`,
        `    <priority>${xmlEscape(r.priority)}</priority>`,
        '  </url>'
      ].join('\n')
    })
    .join('\n')

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    ''
  ].join('\n')

  await fs.mkdir(distDir, { recursive: true })
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')

  console.log('[standalone-sitemap] Generated dist/sitemap.xml')

  const robotsPath = path.join(distDir, 'robots.txt')
  let robots = ''
  try {
    robots = await fs.readFile(robotsPath, 'utf8')
  } catch {
    robots = 'User-agent: *\nAllow: /\n'
  }

  const sitemapLine = `Sitemap: ${siteUrl}/sitemap.xml`
  const hasSitemap = robots
    .split(/\r?\n/)
    .some((l) => l.trim().toLowerCase().startsWith('sitemap:'))

  if (!hasSitemap) {
    robots = robots.replace(/\s+$/g, '') + `\n\n${sitemapLine}\n`
  } else {
    robots = robots
      .split(/\r?\n/)
      .map((l) => (l.trim().toLowerCase().startsWith('sitemap:') ? sitemapLine : l))
      .join('\n')
      .replace(/\s+$/g, '')
      .concat('\n')
  }

  await fs.writeFile(robotsPath, robots, 'utf8')

  console.log('[standalone-sitemap] Updated dist/robots.txt')
  console.log('[standalone-sitemap] Sitemap generation complete')
  console.log(`Generated sitemap.xml and updated robots.txt for ${siteUrl}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
