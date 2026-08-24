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
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const res = [];
      let n;
      while (n = walker.nextNode()) {
        if (n.textContent.includes('to be installed') || n.textContent.includes('Google Chrome') || n.textContent.includes('Collapse Diffs') || n.textContent.includes('Archive') || n.textContent.includes('Conversation Name')) {
          res.push({
            raw: JSON.stringify(n.textContent),
            parentTag: n.parentElement.tagName,
            parentClass: n.parentElement.className
          });
        }
      }
      return res;
    })()`,
    returnByValue: true
  });

  console.log('Nodes found in DOM:', JSON.stringify(res.result.value, null, 2));
}

main().catch(console.error);
