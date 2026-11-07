// Navigue, exécute un scénario JS, puis capture (chromium headless 9333)
// usage: node flow.mjs <url> <out.png> <w> <h> <dpr> '<js>' [waitMs]
const [url, out, w, h, dpr, js, waitMs = 900] = process.argv.slice(2);
import { writeFileSync } from 'node:fs';
const list = await (await fetch('http://127.0.0.1:9333/json/list')).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: +dpr, mobile: true, screenWidth: +w, screenHeight: +h });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.navigate', { url });
await new Promise(r => setTimeout(r, 2400));
await send('Runtime.evaluate', { expression: 'document.fonts && document.fonts.ready', awaitPromise: true }).catch(()=>{});
const r = await send('Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true, userGesture: true });
if (r.result && r.result.value !== undefined) console.log('js:', JSON.stringify(r.result.value));
if (r.exceptionDetails) console.log('JS ERROR', JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails));
await new Promise(r2 => setTimeout(r2, +waitMs));
const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('saved', out);
ws.close(); process.exit(0);
