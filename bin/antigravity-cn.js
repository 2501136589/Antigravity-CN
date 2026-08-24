#!/usr/bin/env node

/**
 * Antigravity-CN 统一命令行工具
 * CLI Tool for Antigravity-CN Chinese Localization
 */

const { install, uninstall, checkStatus } = require('../src/patcher/asar-patcher');
const { inject } = require('../src/injector/cdp-injector');

const command = process.argv[2] || 'help';

function printHelp() {
  console.log(`
🚀 Antigravity-CN: Google Antigravity 界面中文汉化与本地化扩展工具

使用用法:
  antigravity-cn <command> [options]

指令列表:
  install, -i      一键安装/更新汉化补丁至 Antigravity 客户端（持久化生效）
  uninstall, -u    卸载汉化补丁，安全还原官方原版客户端
  inject, live     无侵入实时热注入（无需重启，即刻将中文应用到当前打开的窗口）
  watch, -w        开发调试模式：监听词典变动并自动热重载注入
  status, -s       检测当前系统安装状态与补丁状态
  help, -h         显示帮助信息

选项参数:
  --path=<path>    手动指定 app.asar 文件绝对路径

示例:
  npx antigravity-cn install
  npx antigravity-cn inject
  npx antigravity-cn uninstall
`);
}

async function main() {
  const customPathArg = process.argv.find(a => a.startsWith('--path='));
  const customPath = customPathArg ? customPathArg.split('=')[1] : null;

  switch (command.toLowerCase()) {
    case 'install':
    case '-i':
      install(customPath);
      break;
    case 'uninstall':
    case '-u':
      uninstall(customPath);
      break;
    case 'inject':
    case 'live':
      await inject(false);
      break;
    case 'watch':
    case '-w':
      await inject(true);
      break;
    case 'status':
    case '-s':
      const st = checkStatus(customPath);
      console.log('\n📊 Antigravity-CN 状态信息:');
      console.log(`- 安装路径: ${st.asarPath || '未找到'}`);
      console.log(`- 备份状态: ${st.hasBackup ? '已备份 (app.asar.bak)' : '未备份'}`);
      console.log(`- 汉化状态: ${st.isPatched ? '✅ 已安装汉化补丁' : '⚪ 未安装汉化补丁'}\n`);
      break;
    case 'help':
    case '-h':
    case '--help':
    default:
      printHelp();
      break;
  }
}

main().catch(console.error);
