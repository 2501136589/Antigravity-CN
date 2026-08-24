const fs = require('fs');
const path = require('path');
const os = require('os');

async function main() {
  const portFile = path.join(os.homedir(), 'AppData', 'Roaming', 'Antigravity', 'DevToolsActivePort');
  const port = parseInt(fs.readFileSync(portFile, 'utf8').trim().split('\n')[0], 10);

  const targets = await fetch(`http://127.0.0.1:${port}/json`).then(r => r.json());
  const page = targets.find(t => t.type === 'page');
  if (!page) return;

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  function call(method, params) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 1000000);
      ws.onmessage = (evt) => {
        const d = JSON.parse(evt.data);
        if (d.id === id) {
          ws.close();
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const res = await call('Runtime.evaluate', {
    expression: `(() => {
      // 找到含有 budget 或 browser subagent 的元素
      const els = Array.from(document.querySelectorAll('*')).filter(e => 
        (e.textContent.includes('budget is available') || e.textContent.includes('browser subagent')) && e.children.length === 0
      );

      return els.map(e => {
        const ancestors = [];
        let cur = e;
        while (cur) {
          ancestors.push({ tag: cur.tagName, className: cur.className, id: cur.id });
          cur = cur.parentElement;
        }
        return {
          text: e.textContent,
          trimmed: e.textContent.trim(),
          ancestors
        };
      });
    })()`,
    returnByValue: true
  });

  console.log('Inspection result:', JSON.stringify(res.result.value, null, 2));
}

main().catch(console.error);
