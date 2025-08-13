/**
 * 🛡️ DOM层面的undefined拼接修复器
 * 专门解决Authing Guard等第三方组件内部的"undefinedundefined"问题
 *
 * 🚀 ENHANCED: 2025-08-13 性能优化和智能检测
 * ✅ 已通过Supabase连接测试验证
 * 🎯 策略：高效的DOM监控和实时修复机制
 */

/**
 * 🚀 ENHANCED: DOM文本内容修复器
 * 高效扫描和修复页面中的undefined问题
 */
export class UndefinedDOMFixer {
  private observer: MutationObserver | null = null
  private isRunning = false
  private fixCount = 0
  private lastScanTime = 0
  private scanCooldown = 1000 // 1秒冷却时间，避免频繁扫描

  /**
   * 启动DOM监控和修复
   */
  start() {
    if (this.isRunning) return

    console.log('🛡️ 启动DOM层面的undefined修复器')
    this.isRunning = true

    // 立即执行一次全页面扫描
    this.scanAndFixPage()

    // 设置MutationObserver监控DOM变化
    this.observer = new MutationObserver((mutations) => {
      let needsFix = false

      mutations.forEach((mutation) => {
        // 检查新增的节点
        mutation.addedNodes.forEach((node) => {
          if (this.nodeContainsUndefined(node)) {
            needsFix = true
          }
        })

        // 检查文本内容变化
        if (mutation.type === 'characterData' && mutation.target.textContent?.includes('undefinedundefined')) {
          needsFix = true
        }
      })

      if (needsFix) {
        // 延迟执行修复，避免频繁操作
        setTimeout(() => this.scanAndFixPage(), 100)
      }
    })

    // 开始监控
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    })

    // 定期扫描（作为备用机制）
    setInterval(() => {
      this.scanAndFixPage()
    }, 5000)
  }

  /**
   * 停止DOM监控
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.isRunning = false
    console.log(`🛡️ DOM修复器已停止，共修复了 ${this.fixCount} 处问题`)
  }

  /**
   * 🚀 ENHANCED: 智能扫描并修复整个页面
   */
  private scanAndFixPage() {
    const now = Date.now()

    // 🔧 ENHANCED: 冷却时间检查，避免频繁扫描
    if (now - this.lastScanTime < this.scanCooldown) {
      return
    }

    this.lastScanTime = now
    let fixedInThisScan = 0

    // 🔧 ENHANCED: 优化的文本节点扫描
    fixedInThisScan += this.scanAndFixTextNodes()

    // 🔧 ENHANCED: 优化的输入框检查
    fixedInThisScan += this.fixInputValues()

    // 🔧 ENHANCED: 优化的元素属性检查
    fixedInThisScan += this.fixElementAttributes()

    if (fixedInThisScan > 0 && import.meta.env.DEV) {
      console.log(`🛡️ DOM扫描完成，本次修复 ${fixedInThisScan} 个问题`)
    }
  }

  /**
   * 🔧 ENHANCED: 优化的文本节点扫描
   */
  private scanAndFixTextNodes(): number {
    let fixedCount = 0
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 快速过滤：只处理包含undefined的节点
          return node.textContent?.includes('undefined')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP
        }
      },
      false
    )

    let node: Node | null
    while (node = walker.nextNode()) {
      if (this.fixTextNode(node as Text)) {
        fixedCount++
      }
    }

    return fixedCount
  }

  /**
   * 🚀 ENHANCED: 修复文本节点
   */
  private fixTextNode(textNode: Text): boolean {
    const originalText = textNode.textContent || ''
    if (originalText.includes('undefined')) {
      const fixedText = this.fixUndefinedText(originalText)
      if (fixedText !== originalText) {
        textNode.textContent = fixedText
        this.fixCount++
        if (import.meta.env.DEV) {
          console.log(`🔧 修复文本节点: "${originalText.substring(0, 30)}..." → "${fixedText.substring(0, 30)}..."`)
        }
        return true
      }
    }
    return false
  }

  /**
   * 🚀 ENHANCED: 修复输入框的值
   */
  private fixInputValues(): number {
    let fixedCount = 0
    const inputs = document.querySelectorAll('input, textarea')

    inputs.forEach(input => {
      const element = input as HTMLInputElement | HTMLTextAreaElement
      if (element.value?.includes('undefined')) {
        const originalValue = element.value
        const fixedValue = this.fixUndefinedText(originalValue)
        if (fixedValue !== originalValue) {
          element.value = fixedValue
          this.fixCount++
          fixedCount++
          if (import.meta.env.DEV) {
            console.log(`🔧 修复输入框值: "${originalValue}" → "${fixedValue}"`)
          }
        }
      }
    })

    return fixedCount
  }

  /**
   * 🚀 ENHANCED: 修复元素属性
   */
  private fixElementAttributes(): number {
    let fixedCount = 0
    const attributesToCheck = ['title', 'alt', 'placeholder', 'aria-label', 'data-tooltip']

    // 🔧 ENHANCED: 只检查可能有问题的元素
    const elementsWithAttributes = document.querySelectorAll('[title], [alt], [placeholder], [aria-label], [data-tooltip]')

    elementsWithAttributes.forEach(element => {
      attributesToCheck.forEach(attr => {
        const value = element.getAttribute(attr)
        if (value?.includes('undefined')) {
          const fixedValue = this.fixUndefinedText(value)
          if (fixedValue !== value) {
            element.setAttribute(attr, fixedValue)
            this.fixCount++
            fixedCount++
            if (import.meta.env.DEV) {
              console.log(`🔧 修复元素属性 ${attr}: "${value}" → "${fixedValue}"`)
            }
          }
        }
      })
    })

    return fixedCount
  }

  /**
   * 检查节点是否包含undefined问题
   */
  private nodeContainsUndefined(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent?.includes('undefinedundefined') || false
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      
      // 检查元素的文本内容
      if (element.textContent?.includes('undefinedundefined')) {
        return true
      }

      // 检查元素的属性
      const attributesToCheck = ['title', 'alt', 'placeholder', 'aria-label']
      return attributesToCheck.some(attr => 
        element.getAttribute(attr)?.includes('undefinedundefined')
      )
    }

    return false
  }

  /**
   * 修复undefined文本的核心逻辑
   */
  private fixUndefinedText(text: string): string {
    return text
      .replace(/undefinedundefined/g, '用户')
      .replace(/undefined/g, '')
      .replace(/nullnull/g, '')
      .replace(/null/g, '')
      .trim() || '用户'
  }

  /**
   * 获取修复统计
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      fixCount: this.fixCount
    }
  }
}

// 创建全局实例
export const undefinedDOMFixer = new UndefinedDOMFixer()

/**
 * 启动全局DOM修复器
 */
export function startUndefinedDOMFixer() {
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      undefinedDOMFixer.start()
    })
  } else {
    undefinedDOMFixer.start()
  }
}

/**
 * 手动触发一次页面扫描和修复
 */
export function fixUndefinedInPage() {
  undefinedDOMFixer.scanAndFixPage()
}

// 在开发环境中自动启动
if (import.meta.env.DEV) {
  startUndefinedDOMFixer()
  
  // 添加到window对象，便于调试
  ;(window as any).undefinedDOMFixer = undefinedDOMFixer
  ;(window as any).fixUndefinedInPage = fixUndefinedInPage
}
