/**
 * Antigravity-CN: 核心界面汉化与本地化运行时引擎 (零闪烁极速同步渲染版)
 * Core UI Localization Engine for Google Antigravity - Zero-Flicker Synchronous Engine
 * 
 * [Architecture] 
 * 1. 严格保护用户会话消息、AI输出文本、代码与终端，仅汉化软件界面与控件
 * 2. 采用微任务级同步 DOM 拦截与就地翻译，彻底消除动态下拉菜单与浮层的“英文闪烁”
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AntigravityCN = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  let localeData = {
    exact: {},
    attributes: {},
    patterns: []
  };

  let isEnabled = true;
  let observer = null;
  let isTranslating = false;

  const targetAttrs = ['placeholder', 'title', 'aria-label', 'alt'];

  // 严格忽略的标签（脚本、样式、预格式化代码、输入框等）
  const IGNORE_TAGS = new Set(['SCRIPT', 'STYLE', 'PRE', 'NOSCRIPT', 'TEMPLATE', 'TEXTAREA']);

  // 严格保护的选择器：
  // 1. 代码编辑器与终端环境
  // 2. 用户输入与用户发送的聊天消息
  // 3. AI 回复生成的正文 Markdown 区域
  const IGNORE_SELECTORS = [
    'pre',
    '.monaco-editor',
    '.monaco-mouse-cursor-text',
    '.xterm',
    '.terminal',
    '.code-block',
    '.diff-view',
    '[data-no-translate]',
    '[contenteditable="true"]',
    '[data-testid="user-input-step"]',
    '.md-divider-spacing',
    '[class*="md-divider-spacing"]'
  ];

  function shouldIgnoreElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    if (IGNORE_TAGS.has(el.tagName)) return true;
    for (const selector of IGNORE_SELECTORS) {
      if (el.closest && el.closest(selector)) return true;
    }
    return false;
  }

  /**
   * 翻译单条文本
   */
  function translateText(text) {
    if (!text || typeof text !== 'string') return text;
    const trimmed = text.trim();
    if (!trimmed) return text;

    // 1. 精确匹配
    if (localeData.exact && localeData.exact[trimmed]) {
      return text.replace(trimmed, localeData.exact[trimmed]);
    }

    // 2. 正则模式匹配
    if (localeData.patterns && Array.isArray(localeData.patterns)) {
      for (const pattern of localeData.patterns) {
        try {
          const reg = typeof pattern.regex === 'string' ? new RegExp(pattern.regex) : pattern.regex;
          if (reg.test(trimmed)) {
            const replaced = trimmed.replace(reg, pattern.replacement);
            return text.replace(trimmed, replaced);
          }
        } catch (e) {}
      }
    }

    return text;
  }

  /**
   * 翻译属性
   */
  function translateAttribute(val) {
    if (!val || typeof val !== 'string') return val;
    const trimmed = val.trim();
    if (!trimmed) return val;

    if (localeData.attributes && localeData.attributes[trimmed]) {
      return val.replace(trimmed, localeData.attributes[trimmed]);
    }

    if (localeData.exact && localeData.exact[trimmed]) {
      return val.replace(trimmed, localeData.exact[trimmed]);
    }

    if (localeData.patterns && Array.isArray(localeData.patterns)) {
      for (const pattern of localeData.patterns) {
        try {
          const reg = typeof pattern.regex === 'string' ? new RegExp(pattern.regex) : pattern.regex;
          if (reg.test(trimmed)) {
            return val.replace(trimmed, trimmed.replace(reg, pattern.replacement));
          }
        } catch (e) {}
      }
    }

    return val;
  }

  /**
   * 递归遍历并翻译指定 DOM 节点
   */
  function walkAndTranslate(rootNode) {
    if (!isEnabled || !rootNode) return;
    if (rootNode.nodeType === Node.ELEMENT_NODE && shouldIgnoreElement(rootNode)) {
      return;
    }

    // 1. 遍历文本节点
    const walker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (node.parentElement && shouldIgnoreElement(node.parentElement)) {
            return NodeFilter.FILTER_REJECT;
          }
          const t = node.textContent.trim();
          if (!t || /^[0-9\s\-\:\/\.]+$/.test(t)) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let textNode;
    while ((textNode = walker.nextNode())) {
      const original = textNode.textContent;
      const translated = translateText(original);
      if (translated !== original) {
        textNode.textContent = translated;
      }
    }

    // 2. 翻译常用属性
    const elements = rootNode.querySelectorAll ? rootNode.querySelectorAll('*') : [];
    const allElements = [rootNode, ...elements];

    for (const el of allElements) {
      if (el.nodeType !== Node.ELEMENT_NODE || shouldIgnoreElement(el)) continue;
      for (const attr of targetAttrs) {
        if (el.hasAttribute(attr)) {
          const orig = el.getAttribute(attr);
          const trans = translateAttribute(orig);
          if (trans !== orig) {
            el.setAttribute(attr, trans);
          }
        }
      }
    }
  }

  /**
   * 启动微任务级极速同步 MutationObserver
   */
  function startObserver() {
    if (observer || typeof MutationObserver === 'undefined') return;

    observer = new MutationObserver((mutations) => {
      if (!isEnabled || isTranslating) return;
      isTranslating = true;

      try {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE && !shouldIgnoreElement(node)) {
                walkAndTranslate(node);
              } else if (node.nodeType === Node.TEXT_NODE) {
                if (node.parentElement && !shouldIgnoreElement(node.parentElement)) {
                  const orig = node.textContent;
                  const trans = translateText(orig);
                  if (trans !== orig) {
                    node.textContent = trans;
                  }
                }
              }
            }
          } else if (mutation.type === 'characterData') {
            const node = mutation.target;
            if (node && node.parentElement && !shouldIgnoreElement(node.parentElement)) {
              const orig = node.textContent;
              const trans = translateText(orig);
              if (trans !== orig) {
                node.textContent = trans;
              }
            }
          } else if (mutation.type === 'attributes') {
            const el = mutation.target;
            if (el && el.nodeType === Node.ELEMENT_NODE && !shouldIgnoreElement(el)) {
              const attr = mutation.attributeName;
              if (targetAttrs.includes(attr) && el.hasAttribute(attr)) {
                const orig = el.getAttribute(attr);
                const trans = translateAttribute(orig);
                if (trans !== orig) {
                  el.setAttribute(attr, trans);
                }
              }
            }
          }
        }
      } finally {
        isTranslating = false;
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: targetAttrs
    });

    // 交互前瞻监听（在用户按下的瞬间确保 0 延迟）
    if (typeof document !== 'undefined') {
      const interactionHandler = () => {
        if (isEnabled) {
          walkAndTranslate(document.body);
        }
      };
      document.addEventListener('pointerdown', interactionHandler, true);
      document.addEventListener('focusin', interactionHandler, true);
    }
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  /**
   * 初始化引擎
   */
  function init(customLocale) {
    if (customLocale) {
      loadDictionary(customLocale);
    }

    if (typeof document !== 'undefined') {
      const readyHandler = () => {
        walkAndTranslate(document.body || document.documentElement);
        startObserver();
        console.log('[Antigravity-CN] 零闪烁汉化引擎已激活！');
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', readyHandler);
      } else {
        readyHandler();
      }
    }
  }

  function loadDictionary(dict) {
    if (!dict) return;
    if (dict.exact) localeData.exact = { ...localeData.exact, ...dict.exact };
    if (dict.attributes) localeData.attributes = { ...localeData.attributes, ...dict.attributes };
    if (dict.patterns) localeData.patterns = [...localeData.patterns, ...dict.patterns];
  }

  function enable() {
    isEnabled = true;
    if (typeof document !== 'undefined') {
      walkAndTranslate(document.body);
      startObserver();
    }
  }

  function disable() {
    isEnabled = false;
    stopObserver();
  }

  function toggle() {
    if (isEnabled) disable();
    else enable();
    return isEnabled;
  }

  const api = {
    init,
    loadDictionary,
    translateText,
    translateAttribute,
    walkAndTranslate,
    enable,
    disable,
    toggle,
    getStatus: () => ({ enabled: isEnabled, dictStats: { exact: Object.keys(localeData.exact).length, patterns: localeData.patterns.length } })
  };

  if (typeof window !== 'undefined') {
    window.__ANTIGRAVITY_CN__ = api;
  }

  return api;
});
