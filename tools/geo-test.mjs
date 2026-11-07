// Test géolocalisation : accorde la permission, simule une position (Dakar), clique le bouton, capture.
// usage: node geo-test.mjs <url> <out.png> [lat] [lng]
import { writeFileSync } from 'node:fs';
const [url, out, lat = 14.7645, lng = -17.3660] = process.argv.slice(2);
const list = await (await fetch('http://127.0.0.1:9333/json/list')).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Page.enable'); await send('Runtime.enable');
await send('Browser.grantPermissions', { origin: new URL(url).origin, permissions: ['geolocation'] });
await send('Emulation.setGeolocationOverride', { latitude: +lat, longitude: +lng, accuracy: 12 });
await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 844, deviceScaleFactor: 3, mobile: true, screenWidth: 393, screenHeight: 844 });
await send('Page.navigate', { url });
await new Promise(r => setTimeout(r, 2500));

const js = `(async()=>{
  document.getElementById('cartBtn').click();
  await new Promise(r=>setTimeout(r,500));
  const b = document.getElementById('geoBtn');
  if (!b) return 'pas de bouton geo';
  b.click();
  await new Promise(r=>setTimeout(r,2000));
  const ok = document.querySelector('.geo-ok');
  const map = document.querySelector('.geo-map iframe');
  return JSON.stringify({ok: ok?ok.textContent.trim():null, map: map?map.src.slice(0,80):null, stored: localStorage.getItem('drc_aurora_pos')});
})()`;
const r = await send('Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true, userGesture: true });
console.log('js:', r.result.value ?? JSON.stringify(r.result));
await new Promise(r2 => setTimeout(r2, 600));
const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('saved', out);
ws.close(); process.exit(0);
