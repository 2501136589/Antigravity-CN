/**
 * Antigravity-CN: CDP (Chrome DevTools Protocol) 实时热注入工具
 * 在不重启应用、不修改本地文件的前提下，将中文语言包即时注入至运行中的 Antigravity 界面。
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 查找 DevToolsActivePort 路径
function getDevToolsPortPath() {
  const possiblePaths = [
    path.join(os.homedir(), 'AppData', 'Roaming', 'Antigravity', 'DevToolsActivePort'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'antigravity', 'DevToolsActivePort'),
    path.join(os.homedir(), 'Library', 'Application Support', 'Antigravity', 'DevToolsActivePort'),
    path.join(os.homedir(), '.config', 'antigravity', 'DevToolsActivePort')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function getActivePort() {
  const devToolsFile = getDevToolsPortPath();
  if (devToolsFile) {
    try {
      const content = fs.readFileSync(devToolsFile, 'utf8').trim().split('\n');
      const port = parseInt(content[0].trim(), 10);
      if (port > 0) return port;
    } catch (e) {
      console.warn(`[CDP] 读取端口文件失败: ${e.message}`);
    }
  }

  // 备用端口列表
  const fallbackPorts = [51871, 9222, 9229];
  for (const p of fallbackPorts) {
    try {
      const res = await fetch(`http://127.0.0.1:${p}/json/version`);
      if (res.ok) return p;
    } catch (e) {}
  }
  return null;
}

async function inject(watchMode = false) {
  const port = await getActivePort();
  if (!port) {
    console.error('❌ 未找到正在运行的 Antigravity 客户端调试端口！请确保已启动 Antigravity 桌面端。');
    process.exit(1);
  }

  console.log(`🔍 检测到 Antigravity 远程调试端口: ${port}`);
  const targetsRes = await fetch(`http://127.0.0.1:${port}/json`).catch(e => null);
  if (!targetsRes || !targetsRes.ok) {
    console.error('❌ 连接 Antigravity 调试接口失败。');
    process.exit(1);
  }

  const targets = await targetsRes.json();
  const pages = targets.filter(t => t.type === 'page');
  if (pages.length === 0) {
    console.error('❌ 未找到可注入的 Antigravity 页面。');
    process.exit(1);
  }

  const engineCode = fs.readFileSync(path.join(__dirname, '..', 'core', 'i18n-engine.js'), 'utf8');
  const localeJson = fs.readFileSync(path.join(__dirname, '..', 'locales', 'zh-CN.json'), 'utf8');

  const bundleScript = `
    (() => {
      try {
        ${engineCode}
        const locale = ${localeJson};
        if (window.__ANTIGRAVITY_CN__) {
          window.__ANTIGRAVITY_CN__.init(locale);
          window.__ANTIGRAVITY_CN__.walkAndTranslate(document.body);
          console.log('[Antigravity-CN] 热注入成功！');
          return { success: true, count: document.body.innerText.length };
        }
        return { success: false, reason: 'No global object' };
      } catch (err) {
        return { success: false, error: err.message, stack: err.stack };
      }
    })()
  `;

  for (const page of pages) {
    console.log(`🚀 正在注入页面: ${page.title || page.url}`);
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    await new Promise(resolve => (ws.onopen = resolve));

    const result = await new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 1000000);
      ws.onmessage = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === id) {
          ws.close();
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.send(JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: {
          expression: bundleScript,
          returnByValue: true
        }
      }));
    });

    console.log('✅ 注入结果:', JSON.stringify(result.result?.value || result));
  }

  console.log('\n🎉 [Antigravity-CN] 实时汉化热注入完成！请查看 Antigravity 窗口体验汉化界面。');

  if (watchMode) {
    console.log('👀 正在监听 zh-CN.json 与 i18n-engine.js 变动，保存即自动热重载...');
    const watchPaths = [
      path.join(__dirname, '..', 'locales', 'zh-CN.json'),
      path.join(__dirname, '..', 'core', 'i18n-engine.js')
    ];
    for (const wp of watchPaths) {
      fs.watch(wp, () => {
        console.log(`\n🔄 检测到文件变动: ${path.basename(wp)}，重新热注入...`);
        inject(false);
      });
    }
  }
}

if (require.main === module) {
  const watch = process.argv.includes('--watch') || process.argv.includes('-w');
  inject(watch).catch(console.error);
}

module.exports = { inject };
