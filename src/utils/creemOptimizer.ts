/**
 * Creem API优化器
 * 根据测试结果自动选择最佳API调用方法
 */

import { Creem } from 'creem';

export interface CreemTestResult {
  method: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

export interface CreemOptimizedConfig {
  method: string;
  successRate: number;
  avgDuration: number;
  recommended: boolean;
}

export class CreemOptimizer {
  private testResults: CreemTestResult[] = [];
  private bestMethod: string = 'apiKey'; // 默认方法

  /**
   * 添加测试结果
   */
  addTestResult(result: CreemTestResult) {
    this.testResults.push(result);
    this.updateBestMethod();
  }

  /**
   * 更新最佳方法
   */
  private updateBestMethod() {
    const methodStats = new Map<string, { success: number; total: number; duration: number }>();
    
    this.testResults.forEach(result => {
      const current = methodStats.get(result.method) || { success: 0, total: 0, duration: 0 };
      current.total++;
      current.duration += result.duration;
      if (result.success) current.success++;
      methodStats.set(result.method, current);
    });

    let bestMethod = 'apiKey';
    let bestScore = 0;

    methodStats.forEach((stats, method) => {
      const successRate = stats.total > 0 ? stats.success / stats.total : 0;
      const avgDuration = stats.total > 0 ? stats.duration / stats.total : 0;
      const score = successRate * 100 - avgDuration / 100; // 成功率权重更高
      
      if (score > bestScore) {
        bestScore = score;
        bestMethod = method;
      }
    });

    this.bestMethod = bestMethod;
  }

  /**
   * 获取最佳方法
   */
  getBestMethod(): string {
    return this.bestMethod;
  }

  /**
   * 获取优化配置
   */
  getOptimizedConfig(): CreemOptimizedConfig[] {
    const methodStats = new Map<string, { success: number; total: number; duration: number }>();
    
    this.testResults.forEach(result => {
      const current = methodStats.get(result.method) || { success: 0, total: 0, duration: 0 };
      current.total++;
      current.duration += result.duration;
      if (result.success) current.success++;
      methodStats.set(result.method, current);
    });

    const configs: CreemOptimizedConfig[] = [];

    methodStats.forEach((stats, method) => {
      const successRate = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;
      const avgDuration = stats.total > 0 ? stats.duration / stats.total : 0;
      
      configs.push({
        method,
        successRate: Math.round(successRate),
        avgDuration: Math.round(avgDuration),
        recommended: method === this.bestMethod
      });
    });

    return configs.sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * 使用最佳方法调用Creem API
   */
  async createCheckout(productId: string, apiKey: string): Promise<any> {
    const creem = new Creem();
    
    switch (this.bestMethod) {
      case 'apiKey':
        return await creem.createCheckout({
          productId,
          apiKey,
        });
        
      case 'xApiKey':
        return await creem.createCheckout({
          productId,
          xApiKey: apiKey,
        });
        
      case 'constructor':
        const creemWithConfig = new Creem({ apiKey });
        return await creemWithConfig.createCheckout({
          productId,
        });
        
      case 'headers':
        return await creem.createCheckout({
          productId,
          headers: {
            'x-api-key': apiKey
          }
        });
        
      case 'nested':
        return await creem.createCheckout({
          productId,
          createCheckoutRequest: {
            productId,
            xApiKey: apiKey,
          }
        });
        
      default:
        // 回退到默认方法
        return await creem.createCheckout({
          productId,
          apiKey,
        });
    }
  }

  /**
   * 智能调用 - 自动尝试所有方法直到成功
   */
  async smartCreateCheckout(productId: string, apiKey: string): Promise<any> {
    // 验证API密钥格式
    if (!apiKey || !apiKey.startsWith('creem_')) {
      throw new Error('无效的Creem API密钥格式，应以creem_开头');
    }

    const methods = [
      { name: 'apiKey', method: async (creem: any) => 
        await creem.createCheckout({ productId, apiKey }) },
      { name: 'xApiKey', method: async (creem: any) => 
        await creem.createCheckout({ productId, xApiKey: apiKey }) },
      { name: 'constructor', method: async (creem: any) => {
        const creemWithConfig = new Creem({ apiKey });
        return await creemWithConfig.createCheckout({ productId });
      }},
      { name: 'headers', method: async (creem: any) => 
        await creem.createCheckout({ 
          productId, 
          headers: { 'x-api-key': apiKey } 
        }) },
      { name: 'nested', method: async (creem: any) => 
        await creem.createCheckout({ 
          productId,
          createCheckoutRequest: { productId, xApiKey: apiKey } 
        }) }
    ];

    const creem = new Creem();
    let lastError: any;

    for (const { name, method } of methods) {
      try {
        const startTime = Date.now();
        const result = await method(creem);
        const duration = Date.now() - startTime;
        
        // 记录成功结果
        this.addTestResult({
          method: name,
          success: true,
          duration,
          data: result
        });
        
        console.log(`✅ ${name}方法成功 (${duration}ms)`);
        return result;
        
      } catch (error: any) {
        const duration = Date.now();
        lastError = error;
        
        // 记录失败结果
        this.addTestResult({
          method: name,
          success: false,
          duration,
          error: error.message
        });
        
        console.log(`❌ ${name}方法失败: ${error.message}`);
      }
    }

    // 所有方法都失败
    throw lastError || new Error('所有Creem API调用方法都失败');
  }

  /**
   * 获取测试统计
   */
  getStats() {
    const total = this.testResults.length;
    const success = this.testResults.filter(r => r.success).length;
    const failure = total - success;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    
    return {
      total,
      success,
      failure,
      successRate,
      bestMethod: this.bestMethod,
      configs: this.getOptimizedConfig()
    };
  }

  /**
   * 重置测试结果
   */
  reset() {
    this.testResults = [];
    this.bestMethod = 'apiKey';
  }
}

// 全局优化器实例
export const creemOptimizer = new CreemOptimizer(); 