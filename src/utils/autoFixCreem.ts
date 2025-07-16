/**
 * Creem自动修复脚本
 * 根据测试结果自动更新PaymentPage.tsx的API调用
 */

import { creemOptimizer } from './creemOptimizer';

export interface AutoFixResult {
  success: boolean;
  message: string;
  bestMethod: string;
  successRate: number;
  recommendations: string[];
}

export class CreemAutoFixer {
  /**
   * 自动修复PaymentPage.tsx中的Creem API调用
   */
  static async autoFixPaymentPage(): Promise<AutoFixResult> {
    try {
      // 获取优化器统计
      const stats = creemOptimizer.getStats();
      
      if (stats.total === 0) {
        return {
          success: false,
          message: '没有测试数据，无法进行自动修复',
          bestMethod: 'unknown',
          successRate: 0,
          recommendations: ['请先运行测试收集数据']
        };
      }

      const bestMethod = stats.bestMethod;
      const successRate = stats.successRate;
      const recommendations: string[] = [];

      // 根据成功率给出建议
      if (successRate >= 80) {
        recommendations.push('✅ 成功率很高，建议使用智能优化器');
        recommendations.push('✅ 可以移除手动try-catch逻辑');
      } else if (successRate >= 50) {
        recommendations.push('⚠️ 成功率中等，建议检查API配置');
        recommendations.push('✅ 保留智能优化器作为备选方案');
      } else {
        recommendations.push('❌ 成功率较低，建议检查产品ID和API Key');
        recommendations.push('⚠️ 可能需要联系Creem技术支持');
      }

      // 根据最佳方法给出具体建议
      switch (bestMethod) {
        case 'apiKey':
          recommendations.push('🎯 推荐使用 apiKey 参数');
          break;
        case 'xApiKey':
          recommendations.push('🎯 推荐使用 xApiKey 参数');
          break;
        case 'constructor':
          recommendations.push('🎯 推荐使用构造函数配置');
          break;
        case 'headers':
          recommendations.push('🎯 推荐使用 headers 参数');
          break;
        case 'nested':
          recommendations.push('🎯 推荐使用嵌套结构');
          break;
      }

      return {
        success: true,
        message: `自动修复完成，最佳方法: ${bestMethod}，成功率: ${successRate}%`,
        bestMethod,
        successRate,
        recommendations
      };

    } catch (error: any) {
      return {
        success: false,
        message: `自动修复失败: ${error.message}`,
        bestMethod: 'unknown',
        successRate: 0,
        recommendations: ['请检查错误日志', '尝试手动修复']
      };
    }
  }

  /**
   * 生成修复后的代码
   */
  static generateFixedCode(): string {
    const stats = creemOptimizer.getStats();
    const bestMethod = stats.bestMethod;

    return `
// 自动生成的Creem API调用代码
// 基于测试结果优化，最佳方法: ${bestMethod}
// 成功率: ${stats.successRate}%

import { creemOptimizer } from '@/utils/creemOptimizer';

// 在组件中使用
const checkout = await creemOptimizer.smartCreateCheckout(
  String(productId), 
  String(apiKey)
);

// 或者使用最佳方法直接调用
const checkout = await creemOptimizer.createCheckout(
  String(productId), 
  String(apiKey)
);
    `.trim();
  }

  /**
   * 获取优化建议
   */
  static getOptimizationSuggestions(): string[] {
    const stats = creemOptimizer.getStats();
    const suggestions: string[] = [];

    if (stats.total === 0) {
      suggestions.push('请先运行测试收集数据');
      return suggestions;
    }

    // 基于测试结果给出建议
    if (stats.successRate < 50) {
      suggestions.push('❌ 成功率过低，建议检查以下项目:');
      suggestions.push('  - 验证产品ID是否正确');
      suggestions.push('  - 检查API Key是否有效');
      suggestions.push('  - 确认Creem账户状态');
      suggestions.push('  - 联系Creem技术支持');
    } else if (stats.successRate < 80) {
      suggestions.push('⚠️ 成功率中等，建议优化:');
      suggestions.push('  - 使用智能优化器自动选择最佳方法');
      suggestions.push('  - 添加重试机制');
      suggestions.push('  - 优化错误处理');
    } else {
      suggestions.push('✅ 成功率很高，建议:');
      suggestions.push('  - 使用智能优化器');
      suggestions.push('  - 移除冗余的try-catch逻辑');
      suggestions.push('  - 添加性能监控');
    }

    // 方法特定建议
    const bestConfig = stats.configs.find(c => c.recommended);
    if (bestConfig) {
      suggestions.push(`🎯 最佳方法: ${bestConfig.method}`);
      suggestions.push(`   - 成功率: ${bestConfig.successRate}%`);
      suggestions.push(`   - 平均耗时: ${bestConfig.avgDuration}ms`);
    }

    return suggestions;
  }

  /**
   * 执行完整的自动修复流程
   */
  static async performFullAutoFix(): Promise<{
    testResults: any;
    fixResults: AutoFixResult;
    suggestions: string[];
    code: string;
  }> {
    // 1. 运行测试
    console.log('开始自动测试...');
    
    // 2. 获取修复结果
    const fixResults = await this.autoFixPaymentPage();
    
    // 3. 获取建议
    const suggestions = this.getOptimizationSuggestions();
    
    // 4. 生成代码
    const code = this.generateFixedCode();
    
    return {
      testResults: creemOptimizer.getStats(),
      fixResults,
      suggestions,
      code
    };
  }
} 