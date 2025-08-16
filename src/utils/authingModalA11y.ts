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

function sanitizeUndefinedTextIn(root: HTMLElement | ShadowRoot) {
  try {
    const re = /undefined\s*undefined/gi;
    const fallback = '发生错误，请稍后重试';

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while (n = walker.nextNode()) {
      const t = n as Text;
      if (t.nodeValue && re.test(t.nodeValue)) {
        // 若属于错误信息区域，则替换为友好的中文提示；否则去除串联内容
        const parentEl = t.parentElement;
        const inErrorArea = !!parentEl?.closest('.g2-error-message-text, .g2-view-error, .authing-ant-modal-body, .authing-ant-modal-content');
        t.nodeValue = inErrorArea ? t.nodeValue.replace(re, fallback) : t.nodeValue.replace(re, '');
      }
    }

    root.querySelectorAll('.g2-error-message-text, .authing-ant-modal-body, .authing-ant-modal-content')
      .forEach((el) => {
        if (!el) return;
        const txt = el.textContent || '';
        if (re.test(txt)) {
          // 在可见错误区域直接给出友好提示
          if (el.classList.contains('g2-error-message-text') || el.closest('.g2-view-error')) {
            el.textContent = txt.replace(re, fallback);
          } else {
            el.textContent = txt.replace(re, '');
          }
        }
      });
  } catch {}
}

export function createAuthingModalA11yController(): ModalA11yController {
  let textObserver: MutationObserver | null = null;
  let attachObserver: MutationObserver | null = null;
  let pulseTimer: number | null = null;
  let pulseEndTimer: number | null = null;
  const observedRoots = new Set<HTMLElement>();
  const observedShadows = new Set<ShadowRoot>();

  const blurActive = () => {
    try { (document.activeElement as HTMLElement | null)?.blur(); } catch {}
  };

  const observeRoot = (root: HTMLElement) => {
    if (!observedRoots.has(root)) observedRoots.add(root);
    try {
      sanitizeUndefinedTextIn(root);
      fixFocusIn(root);
      if (!textObserver) {
        textObserver = new MutationObserver(() => {
          observedRoots.forEach((r) => sanitizeUndefinedTextIn(r));
          observedShadows.forEach((sr) => sanitizeUndefinedTextIn(sr));
        });
      }
      textObserver.observe(root, { subtree: true, characterData: true, childList: true });
      // 递归登记 shadowRoot
      root.querySelectorAll('*').forEach((el) => {
        const sr = (el as any).shadowRoot as ShadowRoot | undefined;
        if (sr && !observedShadows.has(sr)) {
          observedShadows.add(sr);
          try { textObserver!.observe(sr as any, { subtree: true, characterData: true, childList: true }); } catch {}
          sanitizeUndefinedTextIn(sr);
        }
      });
    } catch {}
  };

  const sanitizeOnce = () => {
    try {
      const roots = collectAuthingRoots();
      roots.forEach(observeRoot);
      observedRoots.forEach((r) => sanitizeUndefinedTextIn(r));
      observedShadows.forEach((sr) => sanitizeUndefinedTextIn(sr));
    } catch {}
  };

  const mount = () => {
    blurActive();
    // 1) 立即处理已存在的根
    collectAuthingRoots().forEach(observeRoot);

    // 2) 监听后续插入的 Authing 根节点（晚加载场景）
    if (!attachObserver) {
      attachObserver = new MutationObserver((mutations) => {
        try {
          for (const m of mutations) {
            if (m.type === 'childList') {
              m.addedNodes.forEach((n) => {
                if (n.nodeType !== 1) return;
                const el = n as HTMLElement;
                // 如果自身或其后代包含任一根选择器，则登记观察
                const selfMatch = AUTHING_ROOT_SELECTORS.some((sel) => el.matches?.(sel));
                const deepMatch = AUTHING_ROOT_SELECTORS.some((sel) => el.querySelector?.(sel));
                if (selfMatch) observeRoot(el);
                if (deepMatch) {
                  AUTHING_ROOT_SELECTORS.forEach((sel) => el.querySelectorAll?.(sel).forEach((e) => observeRoot(e as HTMLElement)));
                }
              });
            }
          }
        } catch {}
      });
      try { attachObserver.observe(document.body, { subtree: true, childList: true }); } catch {}
    }

    // 3) 补刀：在多个延迟时点再次清理，覆盖动画/远程渲染
    try {
      setTimeout(sanitizeOnce, 0);
      setTimeout(sanitizeOnce, 300);
      setTimeout(sanitizeOnce, 800);
      setTimeout(sanitizeOnce, 1500);
      requestAnimationFrame(sanitizeOnce);

      // 4) 脉冲清理：短时间高频清理以覆盖最慢的渲染节奏
      if (!pulseTimer) {
        // 每 200ms 执行一次，持续 5s
        pulseTimer = window.setInterval(sanitizeOnce, 200);
        pulseEndTimer = window.setTimeout(() => {
          if (pulseTimer) { try { clearInterval(pulseTimer); } catch {} ; pulseTimer = null; }
          if (pulseEndTimer) { try { clearTimeout(pulseEndTimer); } catch {} ; pulseEndTimer = null; }
        }, 5000);
      }
    } catch {}
  };

  const unmount = () => {
    try { textObserver?.disconnect(); } catch {}
    try { attachObserver?.disconnect(); } catch {}
    if (pulseTimer) { try { clearInterval(pulseTimer); } catch {}; pulseTimer = null; }
    if (pulseEndTimer) { try { clearTimeout(pulseEndTimer); } catch {}; pulseEndTimer = null; }
    textObserver = null;
    attachObserver = null;
    observedRoots.clear();
    observedShadows.clear();
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
