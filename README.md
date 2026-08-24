# Antigravity-CN: Google Antigravity 界面中文汉化与本地化套件

<p align="center">
  <b>专为 Google Antigravity 打造的高性能、无损、轻量级界面中文汉化与本地化扩展方案</b><br>
  <i>零外部依赖 · 零后台常驻 · 零端口占用 · 代码与对话物理级隔离保护</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Platform">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success.svg" alt="Status">
</p>

---

## ✨ 核心特性

- 🎯 **全局深度汉化**：
  - 拥有 **365+ 精确专业词条** 与 **25+ 动态正则表达式模式**。
  - 深度覆盖主聊天画布、模型与套餐额度页、差异对比（Diff）面板、系统设置、快捷键面板、`@` 提及上下文菜单、`/` 快捷指令中文说明及右键快捷操作。
- 🛡️ **严格边界隔离（代码与对话零篡改）**：
  - 针对 **用户提问气泡**、**AI 回复正文 Markdown**、**Monaco 编辑器**、**代码块 (`<pre>`, `<code>`)** 与 **终端输入输出** 建立物理级白名单豁免。
  - 汉化仅且只作用于软件界面外壳，**绝对不修改任何代码、文件路径与会话内容**。
- ⚡ **微任务级零闪烁引擎 (Zero-Flicker)**：
  - 采用微任务级同步 DOM 拦截与就地翻译，彻底消除动态下拉菜单与 Popper 弹出层展开瞬间的 20ms 英文闪现。
- 🔧 **高精度 Chromium Pickle 物理补丁 (PrecisionPatcher)**：
  - 严格遵循 Chromium 二进制 4 字节物理对齐（4-Byte Alignment）规范，动态重构 SHA-256 数据块签名。
  - 完美兼容官方 293+ 原生动态链接模块，**0 闪退、0 崩溃**。
- 📦 **双重安全备份与 1 秒无损还原**：
  - **`app.asar.bak`**：永久锁定官方出厂初始底包。
  - **`app.asar.prev.bak`**：每次打补丁前自动保存实时快照。
  - 随时双击一键即可秒级恢复官方纯英文原版。
- 💻 **零开发环境依赖**：
  - 自带 Windows 原生 C# 控制台程序（`Antigravity-CN.exe`），目标电脑**无需安装 Node.js、Python 或 Git** 即可开箱即用。

---

## 📂 项目结构

```text
Antigravity-CN/
├── .agents/plugins/antigravity-cn/   # Antigravity 规范的 Agent 规则插件
│   ├── plugin.json
│   └── rules/AGENTS.md              # Agent 中文本地化输出准则
├── bin/
│   └── antigravity-cn.js            # 跨平台 CLI 统一命令行入口
├── src/
│   ├── core/
│   │   └── i18n-engine.js           # 零闪烁同步 DOM 汉化与隔离引擎
│   ├── locales/
│   │   └── zh-CN.json               # 核心本地化词库与动态匹配规则
│   ├── injector/
│   │   └── cdp-injector.js          # CDP 实时免重启热注入器
│   ├── patcher/
│   │   ├── precision-patcher.js     # Chromium Pickle 4 字节对齐高精度补丁器
│   │   ├── asar-util.js             # ASAR 归档读取与结构解析工具
│   │   └── asar-patcher.js          # 补丁生命周期与双重备份管理器
│   └── native/
│       └── Program.cs               # 零依赖 Windows 原生 C# Launcher 源码
├── scripts/
│   ├── install.ps1                  # PowerShell 一键持久化安装脚本
│   ├── uninstall.ps1                # PowerShell 一键还原原版脚本
│   └── live-inject.ps1              # PowerShell 一键免重启热注入脚本
├── test/
│   ├── test-dict.js                 # 词典与动态正则单元测试
│   └── verify-full-patch.js         # ASAR 结构完整性与字节对齐校验
├── [1] 一键安装汉化.bat              # Windows 快捷批处理：永久安装
├── [2] 实时热注入(免重启).bat         # Windows 快捷批处理：实时热注入
├── [3] 一键还原官方原版.bat           # Windows 快捷批处理：一键恢复官方
├── [4] 状态检测与管理菜单.bat         # Windows 快捷批处理：交互管理控制台
├── Antigravity-CN.exe               # 编译好的原生独立启动与管理程序
├── package.json
└── README.md
```

---

## 🚀 快速上手

### 选项 A：普通用户（开箱即用，零环境依赖）

1. 从 [Releases](../../releases) 页面下载最新的 `Antigravity-CN-v1.0.0-Portable.zip` 并解压。
2. 根据您的需求直接双击运行对应的批处理脚本：
   - 🌟 **`[1] 一键安装汉化.bat`**（推荐）：
     - 自动清理后台残留进程、建立安全快照并打入高精度补丁。
     - 安装完成后，平时**直接点击桌面的 Antigravity 官方图标启动**即可，永久纯中文，0 后台常驻、0 端口占用！
   - ⚡ **`[2] 实时热注入(免重启).bat`**：
     - 在 Antigravity 打开时双击，无需重启软件，毫秒级将当前界面转化为中文。
   - 🔄 **`[3] 一键还原官方原版.bat`**：
     - 随时双击，1 秒钟无损恢复官方原版英文环境。
   - 📊 **`[4] 状态检测与管理菜单.bat`** / **`Antigravity-CN.exe`**：
     - 打开可视化交互管理控制台，查看当前安装路径、备份状态与汉化生效情况。

---

### 选项 B：开发者 / 命令行模式

如果您已安装 Node.js 开发环境，也可以直接通过 npm 命令行进行管理与调试：

```bash
# 克隆仓库
git clone https://github.com/your-username/Antigravity-CN.git
cd Antigravity-CN

# 安装依赖
npm install

# 1. 永久安装汉化补丁
npm run patch

# 2. 实时免重启热注入当前窗口
npm run inject

# 3. 词典调试热重载（自动监听 zh-CN.json 变动并即时刷新）
npm run watch

# 4. 查看当前安装状态
npm run status

# 5. 一键还原官方原版
npm run unpatch

# 6. 运行全量测试套件
npm test
```

---

## 🛠️ CLI 命令行工具参数

本项目提供了全局命令行工具 `antigravity-cn`：

```bash
node bin/antigravity-cn.js <command> [options]
```

| 命令 | 别名 | 功能说明 |
| :--- | :--- | :--- |
| `install` | `-i`, `patch` | 执行高精度无损物理补丁写入（永久生效） |
| `uninstall` | `-u`, `unpatch` | 从官方备份恢复原始 `app.asar` |
| `inject` | `live` | 通过 CDP 协议实时热注入当前打开的窗口 |
| `watch` | `-w` | 监听词库变动并自动执行热注入 |
| `status` | `-s` | 检查安装路径、双重备份状态与补丁激活状态 |
| `help` | `-h` | 查看帮助信息 |

---

## 📖 词库扩展与贡献指南

词典文件位于 [`src/locales/zh-CN.json`](src/locales/zh-CN.json)，支持三种匹配维度：

```json
{
  "exact": {
    "New Conversation": "新建会话",
    "Settings": "系统设置",
    "View Stacked Diff": "层叠对比视图"
  },
  "attributes": {
    "Ask anything, @ to mention, / for actions": "询问任何问题，@ 提及上下文，/ 触发快捷指令",
    "Search projects...": "搜索项目..."
  },
  "patterns": [
    {
      "regex": "^Worked for (\\d+)m (\\d+)s$",
      "replacement": "已耗时 $1 分钟 $2 秒"
    },
    {
      "regex": "^([0-9\\.]+)% of the customization budget is available\\.?$",
      "replacement": "$1% 的扩展项 Token 配额可用。"
    }
  ]
}
```

- **`exact`**：静态文本 1:1 精确匹配。
- **`attributes`**：DOM 属性（`placeholder`、`title`、`aria-label` 等）翻译。
- **`patterns`**：针对带有动态数字、百分比、时间戳短语的正则表达式匹配。

在提交 Pull Request 之前，请运行测试套件确保所有测试用例通过：
```bash
npm test
```

---

## ❓ 常见问题 (FAQ)

### Q1: 汉化会影响我写的代码、Git 提交或文件路径吗？
**绝对不会。** 汉化引擎在 DOM 遍历层对 `pre`、`.monaco-editor`、`.diff-view`、`[data-testid="user-input-step"]` 以及 `.md-divider-spacing` 均设置了严格豁免白名单。所有文件读写、重构与 Git 提交均运行在底层原生环境，与汉化引擎完全隔离。

### Q2: 官方发布新版本更新后，汉化会失效吗？
- 如果官方执行了静默全量更新覆盖了 `app.asar`，您只需重新运行一次 **`[1] 一键安装汉化.bat`** 即可瞬间重新激活；
- 也可以随时使用 **`[2] 实时热注入(免重启).bat`** 无缝跨版本使用。

### Q3: 杀毒软件会误报吗？
本项目完全开源透明，`Antigravity-CN.exe` 是基于标准 .NET Framework `Program.cs` 编译的原生跳板，仅执行本地进程检测与文件读写，无任何联网收集隐私或恶意行为。

---

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

<p align="center">
  <b>如果本项目对您的开发体验有所帮助，欢迎在 GitHub 上点亮一颗 ⭐ Star！</b>
</p>
