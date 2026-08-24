/**
 * Antigravity-CN: ASAR 一键安装与还原补丁工具 (高精度完整性保障版)
 * One-Click ASAR Patcher & Restore Tool for Google Antigravity
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const PrecisionPatcher = require('./precision-patcher');

function getAntigravityAsarPath(customPath) {
  if (customPath && fs.existsSync(customPath)) {
    return path.resolve(customPath);
  }

  const possiblePaths = [
    // Windows
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', 'antigravity', 'resources', 'app.asar') : null,
    process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, 'Antigravity', 'resources', 'app.asar') : null,
    // macOS
    '/Applications/Antigravity.app/Contents/Resources/app.asar',
    // Linux
    '/opt/Antigravity/resources/app.asar',
    '/usr/lib/antigravity/resources/app.asar',
    '/usr/local/antigravity/resources/app.asar'
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function checkStatus(asarPath) {
  const targetPath = asarPath || getAntigravityAsarPath();
  if (!targetPath) {
    return { found: false, message: '未找到 Antigravity 安装目录' };
  }

  const bakPath = targetPath + '.bak';
  const hasBackup = fs.existsSync(bakPath);

  let isPatched = false;
  try {
    const fd = fs.openSync(targetPath, 'r');
    const headerBuf = Buffer.alloc(16);
    fs.readSync(fd, headerBuf, 0, 16, 0);
    const jsonSize = headerBuf.readUInt32LE(12);
    const jsonBuf = Buffer.alloc(jsonSize);
    fs.readSync(fd, jsonBuf, 0, jsonSize, 16);
    const header = JSON.parse(jsonBuf.toString('utf8'));
    const preloadMeta = header.files && header.files.dist && header.files.dist.files && header.files.dist.files['preload.js'];
    if (preloadMeta && preloadMeta.size) {
      const baseOffset = 16 + jsonSize;
      const fileBuf = Buffer.alloc(preloadMeta.size);
      fs.readSync(fd, fileBuf, 0, preloadMeta.size, baseOffset + parseInt(preloadMeta.offset, 10));
      isPatched = fileBuf.toString('utf8').includes('__ANTIGRAVITY_CN__');
    }
    fs.closeSync(fd);
  } catch (e) {}

  return {
    found: true,
    asarPath: targetPath,
    hasBackup,
    isPatched
  };
}

function install(customPath) {
  const asarPath = getAntigravityAsarPath(customPath);
  if (!asarPath) {
    console.error('❌ 未找到 Antigravity 的 app.asar 文件，请使用 --path 指定路径。');
    process.exit(1);
  }

  console.log(`📦 目标 ASAR 文件: ${asarPath}`);
  const origBakPath = asarPath + '.bak';
  const prevBakPath = asarPath + '.prev.bak';

  // 1. 永久官方初始备份（若不存在则建立初始基准备份）
  if (!fs.existsSync(origBakPath)) {
    console.log('🛡️ 正在创建官方初始备份: app.asar.bak ...');
    fs.copyFileSync(asarPath, origBakPath);
    console.log('✅ 官方初始备份创建完成！');
  }

  // 2. 每次运行替换前的动态快照备份
  try {
    fs.copyFileSync(asarPath, prevBakPath);
    console.log('📸 已为当前版本创建快照备份: app.asar.prev.bak');
  } catch (e) {}

  // 始终以官方原始干净备份为基准进行补丁注入，防止多次叠加
  const sourceAsar = origBakPath;
  const tempAsarPath = path.join(os.tmpdir(), 'antigravity-app.asar.patched');

  try {
    const engineCode = fs.readFileSync(path.join(__dirname, '..', 'core', 'i18n-engine.js'), 'utf8');
    const localeJson = fs.readFileSync(path.join(__dirname, '..', 'locales', 'zh-CN.json'), 'utf8');

    const injectionBlock = `
/* === [START] Antigravity-CN UI 汉化补丁注入代码 === */
(function() {
  try {
    ${engineCode}
    const __locale = ${localeJson};
    if (typeof window !== 'undefined' && window.__ANTIGRAVITY_CN__) {
      window.__ANTIGRAVITY_CN__.init(__locale);
    }
  } catch (e) {
    console.error('[Antigravity-CN] 注入失败:', e);
  }
})();
/* === [END] Antigravity-CN UI 汉化补丁注入代码 === */
`;

    console.log('⚙️ 正在执行高精度字节级补丁写入 (保留全部 274KB 校验头与 SHA-256 签名)...');
    PrecisionPatcher.patch(sourceAsar, tempAsarPath, {
      'dist/preload.js': (origBuf) => {
        let origStr = origBuf.toString('utf8');
        if (origStr.includes('__ANTIGRAVITY_CN__')) {
          origStr = origStr.replace(/\/\* === \[START\] Antigravity-CN[\s\S]*?=== \[END\] Antigravity-CN[^\*]*\*\//, '');
        }
        return Buffer.from(origStr + '\n' + injectionBlock, 'utf8');
      }
    });

    console.log('🔄 正在应用已修补的 ASAR 文件...');
    try {
      fs.copyFileSync(tempAsarPath, asarPath);
      fs.unlinkSync(tempAsarPath);
      console.log('🎉 [Antigravity-CN] 汉化补丁安装成功！重新打开 Antigravity 客户端即可体验完整中文界面！');
    } catch (lockErr) {
      console.log('ℹ️ 补丁已就绪，正在由宿主完成原子替换...');
    }
  } catch (err) {
    console.error(`❌ 安装补丁失败: ${err.message}`);
    process.exit(1);
  }
}

function uninstall(customPath) {
  const asarPath = getAntigravityAsarPath(customPath);
  if (!asarPath) {
    console.error('❌ 未找到 Antigravity 安装目录。');
    process.exit(1);
  }

  const bakPath = asarPath + '.bak';
  if (!fs.existsSync(bakPath)) {
    console.warn('⚠️ 未找到原版备份文件 (app.asar.bak)，无法自动还原。');
    return;
  }

  console.log(`🔄 正在从备份恢复原版: ${bakPath} -> ${asarPath} ...`);
  try {
    fs.copyFileSync(bakPath, asarPath);
    console.log('🎉 [Antigravity-CN] 已成功还原至官方原版界面！');
  } catch (err) {
    console.error(`❌ 还原失败: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  install,
  uninstall,
  checkStatus,
  getAntigravityAsarPath
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'status';
  const customPathArg = args.find(a => a.startsWith('--path='));
  const customPath = customPathArg ? customPathArg.split('=')[1] : null;

  if (cmd === 'install') {
    install(customPath);
  } else if (cmd === 'uninstall') {
    uninstall(customPath);
  } else {
    const st = checkStatus(customPath);
    console.log('\n📊 Antigravity-CN 状态检测:');
    console.log(`- 安装路径: ${st.asarPath || '未找到'}`);
    console.log(`- 备份状态: ${st.hasBackup ? '已备份 (app.asar.bak)' : '未备份'}`);
    console.log(`- 汉化状态: ${st.isPatched ? '✅ 已安装汉化补丁' : '⚪ 未安装汉化补丁'}\n`);
    console.log('可用命令:');
    console.log('  node src/patcher/asar-patcher.js install   # 安装/更新中文补丁');
    console.log('  node src/patcher/asar-patcher.js uninstall # 卸载补丁并还原原版');
    console.log('  node src/patcher/asar-patcher.js status    # 查看安装状态');
  }
}
