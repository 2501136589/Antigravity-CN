const path = require('path');
const fs = require('fs');
const os = require('os');
const AsarUtil = require('../src/patcher/asar-util');

async function test() {
  console.log('🧪 开始测试 AsarUtil 打包与解包...');
  const tmpDir = path.join(os.tmpdir(), 'antigravity-cn-test-' + Date.now());
  const extractDir = path.join(tmpDir, 'extracted');
  const repackAsar = path.join(tmpDir, 'repacked.asar');
  const extractRepackDir = path.join(tmpDir, 're-extracted');

  fs.mkdirSync(tmpDir, { recursive: true });

  const appAsar = path.join(process.env.LOCALAPPDATA, 'Programs', 'antigravity', 'resources', 'app.asar');
  if (!fs.existsSync(appAsar)) {
    console.error('App asar not found at', appAsar);
    return;
  }

  console.log('1. 解包原始 app.asar...');
  AsarUtil.extractAll(appAsar, extractDir);
  console.log('   解包完成，检查 dist/preload.js 是否存在:', fs.existsSync(path.join(extractDir, 'dist', 'preload.js')));

  console.log('2. 重新打包为 repacked.asar...');
  AsarUtil.createPackage(extractDir, repackAsar);
  console.log('   打包完成，生成文件大小:', fs.statSync(repackAsar).size);

  console.log('3. 解包重新打包的 repacked.asar...');
  AsarUtil.extractAll(repackAsar, extractRepackDir);
  const origPreload = fs.readFileSync(path.join(extractDir, 'dist', 'preload.js'), 'utf8');
  const repackedPreload = fs.readFileSync(path.join(extractRepackDir, 'dist', 'preload.js'), 'utf8');

  if (origPreload === repackedPreload) {
    console.log('✅ 测试通过！解包与重打包内容 100% 一致！');
  } else {
    console.error('❌ 测试失败！内容不一致！');
  }

  // 清理临时文件
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

test().catch(console.error);
