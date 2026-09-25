import fs from 'node:fs';

/** Pair live and prototype elements by their text and report position deltas.
 *  This is the free build-side inner loop — it converges geometry without
 *  spending live navigations. */
const [liveFile, protoFile] = process.argv.slice(2);
const L = JSON.parse(fs.readFileSync(liveFile, 'utf8')).elements;
const P = JSON.parse(fs.readFileSync(protoFile, 'utf8')).elements;

const key = (e) => (e.text || '').replace(/\s+/g, ' ').trim().slice(0, 48);
const index = (arr) => {
  const m = new Map();
  for (const e of arr) {
    const k = key(e);
    if (!k) continue;
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(e);
  }
  return m;
};
const li = index(L);
const pi = index(P);

let paired = 0;
let clean = 0;
const rows = [];
for (const [k, la] of li) {
  const pa = pi.get(k);
  if (!pa) { rows.push(['MISSING', k, '', '']); continue; }
  const n = Math.min(la.length, pa.length);
  for (let i = 0; i < n; i += 1) {
    paired += 1;
    const [lx, ly, lw, lh] = la[i].rect;
    const [px, py, pw, ph] = pa[i].rect;
    const d = [px - lx, py - ly, pw - lw, ph - lh];
    if (d.every((v) => Math.abs(v) <= 1)) { clean += 1; continue; }
    rows.push(['DELTA', k, `live ${ly}+${lh} x${lx} w${lw}`, `Δy ${d[1]} Δx ${d[0]} Δw ${d[2]} Δh ${d[3]}`]);
  }
}
rows.slice(0, Number(process.env.ROWS || 40)).forEach((r) => console.log(r[0].padEnd(8), r[1].padEnd(50), r[2].padEnd(26), r[3]));
console.log(`\npaired ${paired}, clean ${clean}, deltas ${rows.filter((r) => r[0] === 'DELTA').length}, missing ${rows.filter((r) => r[0] === 'MISSING').length}`);
