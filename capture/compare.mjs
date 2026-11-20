// Compare planche (design verrouille) vs produit : capture des deux cadres
// 740 x 560 puis collage cote a cote. Outil local, hors build applicatif.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 8767;
const CDP = 9334;
const APP = process.cwd();
const OUT = process.argv[2] ?? join(APP, '..', 'captures');
const PLANCHES = join(APP, 'G-DESIGN', 'planches', 'v2');
const DIST = join(APP, 'capture', 'dist');

const SCREENS = [
  ['post', '01-post.html'],
  ['jeu', '02-jeu.html'],
  ['fin', '03-carte-de-fin.html'],
  ['series', '04-series-classement.html'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1440,900',
  `--remote-debugging-port=${CDP}`,
  '--user-data-dir=' + process.env.TEMP + '\\arche-cdp-compare',
  'about:blank',
], { stdio: 'ignore' });

const cleanup = () => { try { chrome.kill(); } catch {} };
process.on('exit', cleanup);
await sleep(1500);

const targets = await (await fetch(`http://127.0.0.1:${CDP}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
await new Promise((resolve) => ws.addEventListener('open', resolve));
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

const clipOf = async (selector) => {
  const res = await send('Runtime.evaluate', {
    expression: `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height }; })()`,
    returnByValue: true,
  });
  return res.result.result.value;
};

const shot = async (url, selector, file) => {
  await send('Page.navigate', { url });
  await sleep(1400);
  const clip = await clipOf(selector);
  if (!clip) throw new Error(`selector absent : ${selector} (${url})`);
  const res = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { ...clip, scale: 1 },
    captureBeyondViewport: true,
  });
  writeFileSync(file, Buffer.from(res.result.data, 'base64'));
  return clip;
};

const html = (left, right, title) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  body { margin:0; background:#0d0d0f; color:#e8e8e8; font-family: "Segoe UI", system-ui, sans-serif; }
  .wrap { padding: 28px 40px; }
  h1 { font-size: 15px; letter-spacing: .18em; text-transform: uppercase; color:#9c9c9c; font-weight:600; margin:0 0 20px; }
  .row { display:flex; gap:28px; }
  figure { margin:0; }
  figcaption { font-size:12px; color:#9c9c9c; margin-bottom:10px; letter-spacing:.08em; text-transform:uppercase; }
  img { width:740px; height:560px; display:block; border:1px solid #2b2b2b; }
</style></head><body><div class="wrap"><h1>${title}</h1><div class="row">
<figure><figcaption>Planche (design verrouille)</figcaption><img src="${left}"></figure>
<figure><figcaption>Produit (app)</figcaption><img src="${right}"></figure>
</div></div></body></html>`;

for (const [name, planche] of SCREENS) {
  const plancheFile = join(OUT, `planche-${name}.png`);
  const produitFile = join(OUT, `produit-${name}.png`);
  await shot(`file:///${join(PLANCHES, planche).replace(/\\/g, '/')}`, '.webview', plancheFile);
  await shot(`http://127.0.0.1:${PORT}/?screen=${name}`, '.game', produitFile);
  const pageFile = join(OUT, `compare-${name}.html`);
  writeFileSync(pageFile, html(`planche-${name}.png`, `produit-${name}.png`, `Arche · ${name} · planche vs produit`));
  await shot(`file:///${pageFile.replace(/\\/g, '/')}`, 'body', join(OUT, `compare-${name}.png`));
  console.log(`compare-${name}.png`);
}

ws.close();
cleanup();
