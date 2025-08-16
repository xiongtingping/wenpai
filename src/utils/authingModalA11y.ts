/**
 * Authing 弹窗 A11y 与错误文案清理工具
 * - 仅作用于 Authing 弹窗容器（选择器白名单）
 * - 提供首焦点修复与 "undefinedundefined" 文案清理
 * - 暴露统一的挂载/卸载 API 便于复用与单测
 */

export interface ModalA11yController {
  mount(): void;
  unmount(): void;
  blurActive(): void;
  sanitizeOnce(): void;
}

const AUTHING_ROOT_SELECTORS = [
  '#authing_guard_container',
  '.authing-ant-modal-root',
  '.authing-guard-container',
  '.authing-ant-modal',
  '#authing-guard-container-v4'
];

function collectAuthingRoots(): HTMLElement[] {
  const roots: HTMLElement[] = [];
  try {
    document.querySelectorAll(AUTHING_ROOT_SELECTORS.join(', '))
      .forEach((el) => roots.push(el as HTMLElement));
    const idRoot = document.getElementById('authing_guard_container');
    if (idRoot && !roots.includes(idRoot)) roots.push(idRoot);
  } catch {}
  return roots;
}

function isHidden(el: HTMLElement | null): boolean {
  return !!el && (el.getAttribute('aria-hidden') === 'true' || isHidden(el.parentElement));
}

function fixFocusIn(root: HTMLElement) {
  try {
    const active = document.activeElement as HTMLElement | null;
    if (active && isHidden(active)) active.blur();
    const focusable = root.querySelector<HTMLElement>('input, button, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
  } catch {}
}

function sanitizeUndefinedTextIn(root: HTMLElement) {
  try {
    const re = /undefined\s*undefined/gi;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while (n = walker.nextNode()) {
      const t = n as Text;
      if (t.nodeValue && re.test(t.nodeValue)) t.nodeValue = t.nodeValue.replace(re, '');
    }
    root.querySelectorAll('.g2-error-message-text, .authing-ant-modal-body, .authing-ant-modal-content')
      .forEach((el) => {
        if (el && el.textContent && el.textContent.includes('undefinedundefined')) {
          el.textContent = el.textContent.replace(/undefinedundefined/g, '');
        }
      });
  } catch {}
}

export function createAuthingModalA11yController(): ModalA11yController {
  let textObserver: MutationObserver | null = null;

  const blurActive = () => {
    try { (document.activeElement as HTMLElement | null)?.blur(); } catch {}
  };

  const sanitizeOnce = () => {
    try {
      const roots = collectAuthingRoots();
      roots.forEach((r) => sanitizeUndefinedTextIn(r));
    } catch {}
  };

  const mount = () => {
    blurActive();
    const roots = collectAuthingRoots();
    roots.forEach((r) => { sanitizeUndefinedTextIn(r); fixFocusIn(r); });
    if (!textObserver && roots.length) {
      textObserver = new MutationObserver(() => {
        roots.forEach((r) => sanitizeUndefinedTextIn(r));
      });
      roots.forEach((r) => textObserver!.observe(r, { subtree: true, characterData: true, childList: true }));
    }
  };

  const unmount = () => {
    try { textObserver?.disconnect(); } catch {}
    textObserver = null;
  };

  return { mount, unmount, blurActive, sanitizeOnce };
}


/**
 * 站内通用对话框一次性清理：不作用于 Authing 容器
 * - 用于在注册/登录触发站内 Dialog 时，清除残留的 undefinedundefined 文案
 * - 极小范围且无副作用：仅替换文本，不更改行为
 */
export function sanitizeSiteDialogsOnce() {
  try {
    const siteDialogSelectors = [
      '[data-radix-dialog-content]',
      '[role="dialog"]',
      '[aria-modal="true"]',
      'dialog',
      '.ant-modal', '.ant-modal-wrap', '.ant-modal-root',
      '[class*="modal"]', '[class*="dialog"]', '[class*="popup"]', '[class*="overlay"]'
    ].join(', ');

    const authingRoot = document.querySelector('.authing-ant-modal-root');

    document.querySelectorAll(siteDialogSelectors).forEach((el) => {
      const node = el as HTMLElement;
      if (authingRoot && authingRoot.contains(node)) return; // 排除 Authing 容器
      // 清理文本节点
      const re = /undefined\s*undefined/gi;
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const t = n as Text;
        if (t.nodeValue && re.test(t.nodeValue)) t.nodeValue = t.nodeValue.replace(re, '');
      }
      // 常见容器兜底
      node.querySelectorAll('.g2-error-message-text, .ant-modal-body, .ant-modal-content')
        .forEach((sub) => {
          if (sub.textContent && sub.textContent.includes('undefinedundefined')) {
            sub.textContent = sub.textContent.replace(/undefinedundefined/g, '');
          }
        });
    });
  } catch {}
}
