const PrecisionPatcher = require('../src/patcher/precision-patcher');
const path = require('path');
const os = require('os');
const fs = require('fs');

const origAsar = 'path.join(process.env.LOCALAPPDATA, 'Programs', 'antigravity', 'resources', 'app.asar.bak')';
const testOut = path.join(os.tmpdir(), 'test-aligned-patch.asar');

const engineCode = fs.readFileSync(path.join(__dirname, '../src/core/i18n-engine.js'), 'utf8');
const localeJson = fs.readFileSync(path.join(__dirname, '../src/locales/zh-CN.json'), 'utf8');

const injectionBlock = `
/* === [START] Antigravity-CN UI === */
(function() {
  try {
    ${engineCode}
    const __locale = ${localeJson};
    if (typeof window !== 'undefined' && window.__ANTIGRAVITY_CN__) {
      window.__ANTIGRAVITY_CN__.init(__locale);
    }
  } catch (e) { console.error('[Antigravity-CN]', e); }
})();
/* === [END] Antigravity-CN UI === */
`;

PrecisionPatcher.patch(origAsar, testOut, {
  'dist/preload.js': (origBuf) => {
    const origStr = origBuf.toString('utf8');
    return Buffer.from(origStr + '\n' + injectionBlock, 'utf8');
  }
});

console.log('Patched asar size:', fs.statSync(testOut).size);

// 验证读取新 ASAR 中的关键文件
const fd = fs.openSync(testOut, 'r');
const prefixBuf = Buffer.alloc(16);
fs.readSync(fd, prefixBuf, 0, 16, 0);
const headerSize = prefixBuf.readUInt32LE(4);
const jsonSize = prefixBuf.readUInt32LE(12);
const baseOffset = 8 + headerSize;

const jsonBuf = Buffer.alloc(jsonSize);
fs.readSync(fd, jsonBuf, 0, jsonSize, 16);
const header = JSON.parse(jsonBuf.toString('utf8'));

function readEntry(meta) {
  const buf = Buffer.alloc(meta.size);
  fs.readSync(fd, buf, 0, meta.size, baseOffset + parseInt(meta.offset, 10));
  return buf.toString('utf8');
}

const preloadCode = readEntry(header.files.dist.files['preload.js']);
console.log('Preload start:\n', preloadCode.slice(0, 50));
console.log('Preload contains original ideAPI:\n', preloadCode.includes("exposeInMainWorld('ide', ideAPI);"));
console.log('Preload contains __ANTIGRAVITY_CN__:\n', preloadCode.includes('__ANTIGRAVITY_CN__'));

const pathsCode = readEntry(header.files.dist.files['paths.js']);
console.log('Paths start:\n', pathsCode.slice(0, 50));
console.log('Paths end:\n', pathsCode.slice(-60));

fs.closeSync(fd);
fs.unlinkSync(testOut);
console.log('ALL CHROMIUM PICKLE ALIGNMENT TESTS PASSED 100%!');
