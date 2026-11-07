// Capture d'écran via CDP brut (chromium headless déjà lancé sur 9333)
// usage: node shot.mjs <url> <out.png> [w] [h] [dpr] [full|view] [scrollY] [waitMs]
import { writeFileSync } from 'node:fs';

const [url, out, w = 393, h = 844, dpr = 3, mode = 'view', scrollY = 0, waitMs = 1600] = process.argv.slice(2);

const list = await (await fetch('http://127.0.0.1:9333/json/list')).json();
const page = list.find(t => t.type === 'page');
if (!page) throw new Error('no page target');

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));

let id = 0; const pending = new Map();
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, m => m.error ? rej(new Error(method + ': ' + JSON.stringify(m.error))) : res(m.result));
  ws.send(JSON.stringify({ id: i, method, params }));
});

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: +w, height: +h, deviceScaleFactor: +dpr, mobile: true, screenWidth: +w, screenHeight: +h
});
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url });
await new Promise(r => setTimeout(r, +waitMs));
// attendre les polices
await send('Runtime.evaluate', { expression: 'document.fonts ? document.fonts.ready.then(()=>1) : 1', awaitPromise: true });

await send('Runtime.evaluate', { expression: "document.documentElement.style.scrollBehavior='auto'" });
if (+scrollY) {
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${+scrollY})` });
}
await new Promise(r => setTimeout(r, 400));
await send('Runtime.evaluate', { expression: "document.querySelectorAll('.rise').forEach(e=>e.classList.add('in'))" });
await new Promise(r => setTimeout(r, 700));

let clip;
if (mode === 'full') {
  const m = await send('Page.getLayoutMetrics');
  const cs = m.cssContentSize || m.contentSize;
  clip = { x: 0, y: 0, width: +w, height: Math.min(cs.height, 12000), scale: 1 };
}
const shot = await send('Page.captureScreenshot', {
  format: 'png', captureBeyondViewport: mode === 'full', fromSurface: true, ...(clip ? { clip } : {})
});
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('saved', out, JSON.stringify(clip || 'viewport'));
ws.close();
process.exit(0);
