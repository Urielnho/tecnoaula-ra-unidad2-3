const targets = await (await fetch("http://127.0.0.1:9223/json")).json();
const target = targets.find((t) => t.url.startsWith("devtools://"));
if (!target) throw new Error("DevTools no disponible");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) =>
  ws.addEventListener("open", resolve, { once: true }),
);
let seq = 0;
const waiting = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && waiting.has(msg.id)) {
    waiting.get(msg.id)(msg);
    waiting.delete(msg.id);
  }
});
function call(method, params) {
  return new Promise((resolve) => {
    const id = ++seq;
    waiting.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
const expression = `(() => { const all=[]; function walk(root){ for(const e of root.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);if(e.getAttribute('role')==='tab' && e.getAttribute('aria-label')==='Console'){e.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}));e.click();all.push('Console seleccionado');}} } walk(document);return all;})()`;
console.log(
  JSON.stringify(
    await call("Runtime.evaluate", { expression, returnByValue: true }),
  ),
);
await call("Page.bringToFront", {});
console.log(
  JSON.stringify(
    await call("Runtime.evaluate", {
      expression:
        "JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio})",
      returnByValue: true,
    }),
  ),
);
const screenshot = await call("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: false,
  clip: { x: 1152, y: 0, width: 555, height: 400, scale: 1 },
});
if (screenshot.result?.data) {
  const fs = await import("node:fs/promises");
  await fs.writeFile(
    "output/evidencias/02_consola_token.png",
    Buffer.from(screenshot.result.data, "base64"),
  );
  console.log("Consola real capturada");
} else console.log(JSON.stringify(screenshot));
ws.close();
