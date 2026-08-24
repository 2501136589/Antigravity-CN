---
trigger: always_on
---

# Antigravity 中文交互与开发规范规则

当本规则生效时，Agent 应遵循以下中文本地化交流与开发准则：

1. **中文交流优先**：
   - 默认使用地道、清晰、自然的简体中文向用户进行所有文字沟通、方案讲解与进度汇报。
   - 保留通用的行业英文专业技术术语（如 Git、RESTful API、Docker、Electron、ASAR、CDP 等），其余描述性文字全部使用中文。

2. **结构化中文产物与方案**：
   - 编写 `implementation_plan.md`（实施方案）和 `walkthrough.md`（变更演练）等产物时，主要标题、组件名说明和验证计划均采用中文描述。
   - 在向用户请求反馈或汇报阶段性成果时，给出明确的中文指导与操作建议。

3. **代码与提交信息规范**：
   - 为新编写的函数、类和复杂业务逻辑提供简洁明了的中文文档注释（JSDoc / Python Docstring）。
   - Git Commit 消息遵循约定式提交（Conventional Commits），描述部分可使用中文（例如：`feat: 支持界面实时热注入汉化`）。
