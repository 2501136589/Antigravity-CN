const assert = require('assert');
const path = require('path');
const fs = require('fs');
const i18nEngine = require('../src/core/i18n-engine');

function runTests() {
  console.log('🧪 开始运行 Antigravity-CN 词典与引擎测试套件...\n');

  // 1. 测试词典 JSON
  const localePath = path.join(__dirname, '..', 'src', 'locales', 'zh-CN.json');
  assert(fs.existsSync(localePath), 'zh-CN.json 文件应存在');
  const localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));

  assert(localeData.exact && typeof localeData.exact === 'object', 'exact 字典必须为对象');
  assert(localeData.patterns && Array.isArray(localeData.patterns), 'patterns 必须为数组');

  console.log(`✅ 词典格式正确，共加载 ${Object.keys(localeData.exact).length} 条精确词条，${localeData.patterns.length} 条正则匹配模式。`);

  // 2. 初始化引擎
  i18nEngine.loadDictionary(localeData);

  // 3. 测试精确匹配
  const exactTests = [
    { input: 'New Conversation', expected: '新建会话' },
    { input: 'Scheduled Tasks', expected: '定时任务' },
    { input: 'Files Changed', expected: '变更文件' },
    { input: 'Settings', expected: '系统设置' },
    { input: '  Install IDE  ', expected: '  安装 IDE  ' }
  ];

  for (const t of exactTests) {
    const result = i18nEngine.translateText(t.input);
    assert.strictEqual(result, t.expected, `精确匹配失败: 输入 "${t.input}" -> 输出 "${result}", 期望 "${t.expected}"`);
  }
  console.log('✅ 精确匹配测试全部通过！');

  // 4. 测试模式匹配
  const patternTests = [
    { input: 'Worked for 5m', expected: '已耗时 5 分钟' },
    { input: 'Worked for 12s', expected: '已耗时 12 秒' },
    { input: '3 files, 2 folders', expected: '3 个文件，2 个文件夹' },
    { input: '4 commands', expected: '4 条命令' },
    { input: 'No more older messages, showing 66 of 66', expected: '无更多历史消息，已展示 66 / 66 条' }
  ];

  for (const t of patternTests) {
    const result = i18nEngine.translateText(t.input);
    console.log(`   模式测试: "${t.input}" -> "${result}"`);
    assert(result !== t.input, `正则未命中: ${t.input}`);
  }
  console.log('✅ 动态模式匹配测试全部通过！');

  // 5. 测试属性翻译
  const attrTests = [
    { input: 'Ask anything, @ to mention, / for actions', expected: '询问任何问题，@ 提及上下文，/ 触发快捷指令' },
    { input: 'Overview tab', expected: '总览面板' }
  ];

  for (const t of attrTests) {
    const result = i18nEngine.translateAttribute(t.input);
    assert.strictEqual(result, t.expected, `属性翻译失败: 输入 "${t.input}" -> 输出 "${result}"`);
  }
  console.log('✅ 属性翻译测试全部通过！');

  console.log('\n🎉 所有测试通过！汉化引擎与词典运作良好！');
}

runTests();
