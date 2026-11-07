// Évalue une expression dans une page (chromium headless sur 9333)
// usage: node eval.mjs <url> '<expression js>'
const [url, expr, w = 393, h = 844] = process.argv.slice(2);
const list = await (await fetch('http://127.0.0.1:9333/json/list')).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result));
  ws.send(JSON.stringify({ id: i, method, params }));
});
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 2, mobile: +w < 700, screenWidth: +w, screenHeight: +h });
await send('Page.navigate', { url });
await new Promise(r => setTimeout(r, 2200));
const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
console.log(typeof r.result.value === 'string' ? r.result.value : JSON.stringify(r.result.value, null, 1));
ws.close(); process.exit(0);
