/**
 * 🚀 Undefined问题系统监控器
 * 统一管理和监控所有undefined修复系统的状态
 * 
 * 创建时间: 2025-08-13
 * 目的: 提供统一的调试和监控接口
 */

import { undefinedDOMFixer } from './undefinedDOMFixer'
import { startGuardDOMFixer } from './authingGuardSafeWrapper'

/**
 * 系统监控状态接口
 */
interface SystemMonitorStatus {
  domFixer: {
    isRunning: boolean
    fixCount: number
  }
  guardFixer: {
    isActive: boolean
    lastCheckTime: number
  }
  overallHealth: 'excellent' | 'good' | 'warning' | 'error'
  recommendations: string[]
}

/**
 * Undefined问题系统监控器
 */
export class UndefinedSystemMonitor {
  private static instance: UndefinedSystemMonitor | null = null
  private guardFixerCleanup: (() => void) | null = null
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): UndefinedSystemMonitor {
    if (!UndefinedSystemMonitor.instance) {
      UndefinedSystemMonitor.instance = new UndefinedSystemMonitor()
    }
    return UndefinedSystemMonitor.instance
  }

  /**
   * 启动完整的undefined防护系统
   */
  startCompleteSystem(): void {
    console.log('🚀 启动完整的undefined防护系统')

    // 启动DOM修复器
    if (typeof window !== 'undefined') {
      undefinedDOMFixer.start()
      console.log('✅ DOM修复器已启动')
    }

    // 启动Guard专用修复器
    if (typeof document !== 'undefined') {
      this.guardFixerCleanup = startGuardDOMFixer()
      console.log('✅ Guard专用修复器已启动')
    }

    // 启动监控
    this.startMonitoring()
    console.log('✅ 系统监控已启动')

    // 在开发环境中添加到window对象
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      ;(window as any).undefinedSystemMonitor = this
      console.log('🔧 调试工具已添加到 window.undefinedSystemMonitor')
    }
  }

  /**
   * 停止完整的undefined防护系统
   */
  stopCompleteSystem(): void {
    console.log('🛑 停止undefined防护系统')

    // 停止DOM修复器
    undefinedDOMFixer.stop()

    // 停止Guard修复器
    if (this.guardFixerCleanup) {
      this.guardFixerCleanup()
      this.guardFixerCleanup = null
    }

    // 停止监控
    this.stopMonitoring()

    console.log('✅ undefined防护系统已完全停止')
  }

  /**
   * 获取系统状态
   */
  getSystemStatus(): SystemMonitorStatus {
    const domFixerStats = undefinedDOMFixer.getStats()
    
    const status: SystemMonitorStatus = {
      domFixer: {
        isRunning: domFixerStats.isRunning,
        fixCount: domFixerStats.fixCount
      },
      guardFixer: {
        isActive: this.guardFixerCleanup !== null,
        lastCheckTime: Date.now()
      },
      overallHealth: 'excellent',
      recommendations: []
    }

    // 健康状态评估
    if (!status.domFixer.isRunning && !status.guardFixer.isActive) {
      status.overallHealth = 'error'
      status.recommendations.push('所有修复器都未运行，请重启系统')
    } else if (!status.domFixer.isRunning || !status.guardFixer.isActive) {
      status.overallHealth = 'warning'
      status.recommendations.push('部分修复器未运行，建议检查系统状态')
    } else if (status.domFixer.fixCount > 100) {
      status.overallHealth = 'warning'
      status.recommendations.push('修复次数较多，建议检查数据源头问题')
    } else {
      status.overallHealth = 'excellent'
      status.recommendations.push('系统运行正常')
    }

    return status
  }

  /**
   * 手动触发全页面扫描和修复
   */
  triggerManualFix(): { fixed: number; scanned: number } {
    console.log('🔧 手动触发全页面修复')
    
    const beforeCount = undefinedDOMFixer.getStats().fixCount
    
    // 触发DOM修复器扫描
    ;(window as any).fixUndefinedInPage?.()
    
    // 等待一下再获取统计
    setTimeout(() => {
      const afterCount = undefinedDOMFixer.getStats().fixCount
      const fixed = afterCount - beforeCount
      console.log(`🎯 手动修复完成，修复了 ${fixed} 个问题`)
    }, 500)

    return {
      fixed: 0, // 实际数值会在异步回调中显示
      scanned: document.querySelectorAll('*').length
    }
  }

  /**
   * 获取详细的调试信息
   */
  getDebugInfo(): any {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      systemStatus: this.getSystemStatus(),
      domStats: {
        totalElements: document.querySelectorAll('*').length,
        textNodes: document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT
        ).nextNode() ? 'present' : 'none',
        guardElements: document.querySelectorAll('[class*="authing"], [class*="guard"]').length
      },
      performance: {
        memoryUsage: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024) + 'MB'
        } : 'not available'
      }
    }
  }

  /**
   * 启动系统监控
   */
  private startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitoringInterval = setInterval(() => {
      const status = this.getSystemStatus()
      
      if (status.overallHealth === 'error') {
        console.error('🚨 Undefined防护系统出现严重问题:', status.recommendations)
      } else if (status.overallHealth === 'warning') {
        console.warn('⚠️ Undefined防护系统需要注意:', status.recommendations)
      }
      
      // 在开发环境中定期输出状态
      if (import.meta.env.DEV && status.domFixer.fixCount > 0) {
        console.log(`🛡️ 系统状态: ${status.overallHealth}, 已修复: ${status.domFixer.fixCount} 次`)
      }
    }, 30000) // 每30秒检查一次
  }

  /**
   * 停止系统监控
   */
  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
  }

  /**
   * 重启整个系统
   */
  restartSystem(): void {
    console.log('🔄 重启undefined防护系统')
    this.stopCompleteSystem()
    setTimeout(() => {
      this.startCompleteSystem()
      console.log('✅ 系统重启完成')
    }, 1000)
  }
}

// 创建全局实例
export const undefinedSystemMonitor = UndefinedSystemMonitor.getInstance()

/**
 * 便捷的启动函数
 */
export function startUndefinedProtectionSystem() {
  undefinedSystemMonitor.startCompleteSystem()
}

/**
 * 便捷的状态检查函数
 */
export function checkUndefinedSystemHealth() {
  return undefinedSystemMonitor.getSystemStatus()
}

// 在开发环境中自动启动
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // 延迟启动，确保DOM已加载
  setTimeout(() => {
    startUndefinedProtectionSystem()
  }, 1000)
}
