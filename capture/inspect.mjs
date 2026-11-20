// Inspecteur de mise en page (capture Devvit) : compare la geometrie du produit
// a la planche verrouillee. Outil local, hors build applicatif.
import { spawn } from 'node:child_process';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 8766;
const CDP = 9333;
const BASE = `http://127.0.0.1:${PORT}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const INSPECT = `(() => {
  const pick = (sel) => Array.from(document.querySelectorAll(sel)).map((el) => {
    const r = el.getBoundingClientRect();
    const cls = typeof el.className === 'string' ? el.className : (el.className.baseVal || '');
    return [cls, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), (el.textContent||'').trim().slice(0,28)];
  });
  const style = (sel, prop) => { const el = document.querySelector(sel); return el ? getComputedStyle(el)[prop] : null; };
  return JSON.stringify({
    frame: pick('.game'),
    top: pick('.g-top .chip'),
    scene: pick('.scene, .post-scene'),
    hud: pick('.hud'),
    bignum: pick('.bignum'),
    room: pick('.room, .res'),
    colr: pick('.col-r'),
    cta: pick('.cta'),
    segs: pick('.segs i'),
    slots: pick('.slot'),
    path: pick('.path div'),
    bars: pick('.hist rect'),
    cal: pick('.cal i'),
    rows: pick('.rk-t tr'),
    stats: pick('.stat'),
    font: style('.wm', 'fontFamily'),
    titleFont: style('.room h2, .res h2', 'fontSize'),
    numFont: style('.bignum', 'fontSize'),
    bodyFont: style('.rule, .preview', 'fontSize'),
  });
})()`;

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1440,900',
  `--remote-debugging-port=${CDP}`,
  '--user-data-dir=' + process.env.TEMP + '\\arche-cdp-profile',
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

for (const screen of ['post', 'jeu', 'fin', 'series']) {
  await send('Page.navigate', { url: `${BASE}/?screen=${screen}` });
  await sleep(1200);
  const res = await send('Runtime.evaluate', { expression: INSPECT, returnByValue: true });
  console.log(`\n=== ${screen} ===`);
  const data = JSON.parse(res.result.result.value);
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      console.log(`${key}: ${value.length ? value.map((v) => v.join('|')).join('  ·  ') : '(vide)'}`);
    } else {
      console.log(`${key}: ${value}`);
    }
  }
}

ws.close();
cleanup();
