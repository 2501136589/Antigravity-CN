const fs = require('fs');
const path = require('path');
const os = require('os');

async function main() {
  const portFile = path.join(os.homedir(), 'AppData', 'Roaming', 'Antigravity', 'DevToolsActivePort');
  const port = parseInt(fs.readFileSync(portFile, 'utf8').trim().split('\n')[0], 10);
  console.log('Active CDP port:', port);

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

  // 获取当前页面所有文本
  const res = await call('Runtime.evaluate', {
    expression: `(() => {
      const texts = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        const t = node.textContent.trim();
        if (t && t.length < 200 && !/^[0-9\\s\\-\\:\\/\\.\\,\\%\\(\\)\\[\\]\\{\\}]+$/.test(t)) {
          texts.push(t);
        }
      }
      return Array.from(new Set(texts));
    })()`,
    returnByValue: true
  });

  console.log('Visible texts:', res.result.value);
}

main().catch(console.error);
