import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {render} from '../build-ssr/entry-server.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=JSON.parse(await fs.readFile(path.join(root,'client/src/data/pages.json'),'utf8'));
const evidence=JSON.parse(await fs.readFile(path.join(root,'research/probay-2026-10-29/inventory.json'),'utf8'));
const template=await fs.readFile(path.join(root,'dist/index.html'),'utf8');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const base=(process.env.SITE_URL||'https://probay.in').replace(/\/$/,'');
for(const [route,page] of Object.entries(pages)){
 let html=template.replace(/<title>.*?<\/title>/s,`<title>${escape(page.title)}</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(page.description)}" />`);
 html=html.replace('<div id="root"></div>',`<div id="root">${render(route)}</div>`);
 const source=evidence.find(p=>p.url==='https://probay.in'+route);
 const schemas=(source?.scripts||[]).filter(s=>s.type==='application/ld+json').map(s=>{try{return JSON.parse(s.inline)}catch{return null}}).filter(Boolean);
 if(page.faqCount&&route!=='/'){
  // FAQ markup remains rendered in the static HTML. Original graph schemas are retained below.
 }
 const extra=`<link rel="canonical" href="${base}${route}"/><meta name="robots" content="index, follow, max-image-preview:large"/><meta property="og:title" content="${escape(page.title)}"/><meta property="og:description" content="${escape(page.description)}"/><meta property="og:type" content="website"/><meta property="og:url" content="${base}${route}"/><meta property="og:image" content="${base}/images/hero-v2.webp"/><meta name="twitter:card" content="summary_large_image"/>`+schemas.map(s=>`<script type="application/ld+json">${JSON.stringify(s).replaceAll('<','\\u003c')}</script>`).join('');
 html=html.replace('</head>',extra+'</head>');
 html=html.replace('</body>',`<script id="page-data" type="application/json">${JSON.stringify(page).replaceAll('<','\\u003c')}</script></body>`);
 await fs.writeFile(path.join(root,'dist',route==='/'?'index.html':route.slice(1)),html);
}
await fs.writeFile(path.join(root,'dist/404.html'),template.replace('<div id="root"></div>',`<div id="root">${render('/not-found')}</div>`).replace('</head>','<meta name="robots" content="noindex"/></head>'));
await fs.writeFile(path.join(root,'dist/sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(pages).map(p=>`<url><loc>${base}${p}</loc></url>`).join('')}</urlset>`);
await fs.writeFile(path.join(root,'dist/robots.txt'),`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`);
console.log(`Prerendered ${Object.keys(pages).length} pages with unique metadata, original schema, sitemap and 404.`);
