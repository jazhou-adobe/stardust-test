#!/usr/bin/env node
/*
 * Local QA server for the replica harness.
 *
 * `aem-cli up` is not available here, so this serves the repo the way the
 * runtime expects: static files from the repo root, plus the two `.plain.html`
 * fragment routes that loadFragment() fetches for the header and footer.
 */
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { extname, join, normalize } from 'path';

const root = process.cwd();
const port = Number(process.argv[2] || 3033);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

const FRAGMENTS = {
  '/nav.plain.html': 'content/nav.html',
  '/footer.plain.html': 'content/footer.html',
};

function resolve(pathname) {
  if (FRAGMENTS[pathname]) return join(root, FRAGMENTS[pathname]);
  if (pathname === '/' || pathname === '/index.html') {
    return join(root, 'stardust/.work/harness/index.html');
  }
  return join(root, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const file = resolve(pathname);
  if (!existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  try {
    let body = await readFile(file);
    if (FRAGMENTS[pathname]) {
      // .plain.html is the document's <main> contents, not a full body fragment.
      const html = body.toString();
      const match = html.match(/<main>([\s\S]*)<\/main>/i);
      body = Buffer.from(match ? match[1] : html);
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end(String(err));
  }
}).listen(port, () => {
  process.stdout.write(`serving ${root} on http://localhost:${port}\n`);
});
