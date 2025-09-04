/**
 * 转发引擎Hook
 * 负责一键转发和批量转发的逻辑处理
 */

import { useCallback } from 'react';
import { useAdaptPage } from '../AdaptPageProvider';
import { ForwardingOptions, ForwardingResult, BatchForwardingProgress } from '../types';

// ========================================================================================
// 平台发布URL配置
// ========================================================================================

const platformUrls: Record<string, string> = {
  xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish',
  weibo: 'https://weibo.com/compose/',
  zhihu: 'https://zhuanlan.zhihu.com/write',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  wechat: 'https://mp.weixin.qq.com/cgi-bin/appmsg',
  bilibili: 'https://member.bilibili.com/platform/upload/text/edit',
};

// ========================================================================================
// 转发引擎Hook
// ========================================================================================

export function useForwardingEngine() {
  const { state } = useAdaptPage();

  /**
   * 开始批量转发
   */
  const startForwarding = useCallback(async (
    platforms: string[], 
    options: ForwardingOptions = { mode: 'manual', platforms: [] }
  ) => {
    try {
      const dispatch = (state as any).dispatch;
      
      // 初始化转发状态
      const initialProgress: BatchForwardingProgress = {
        total: platforms.length,
        completed: 0,
        status: 'running',
        results: [],
        startTime: Date.now(),
      };

      dispatch({ type: 'SET_FORWARDING_STATE', payload: true });
      dispatch({ type: 'SET_FORWARDING_PROGRESS', payload: initialProgress });

      const results: ForwardingResult[] = [];

      // 逐个处理平台转发
      for (let i = 0; i < platforms.length; i++) {
        const platformId = platforms[i];
        
        // 更新当前处理的平台
        const currentProgress: BatchForwardingProgress = {
          ...initialProgress,
          completed: i,
          current: getPlatformName(platformId),
          results: [...results],
        };
        dispatch({ type: 'SET_FORWARDING_PROGRESS', payload: currentProgress });

        try {
          // 执行单个平台转发
          const result = await forwardToPlatform(platformId, options, state);
          results.push(result);

          // 添加延迟避免过快操作
          if (options.delayBetween && i < platforms.length - 1) {
            await new Promise(resolve => setTimeout(resolve, options.delayBetween));
          }
        } catch (error) {
          // 处理单个平台转发失败
          const errorResult: ForwardingResult = {
            platformId,
            platformName: getPlatformName(platformId),
            success: false,
            error: error instanceof Error ? error.message : '转发失败',
            method: options.mode,
            timestamp: Date.now(),
            retryCount: 0,
          };
          results.push(errorResult);
        }
      }

      // 完成转发
      const finalProgress: BatchForwardingProgress = {
        ...initialProgress,
        completed: platforms.length,
        status: 'completed',
        results,
        endTime: Date.now(),
      };

      dispatch({ type: 'SET_FORWARDING_PROGRESS', payload: finalProgress });
      dispatch({ type: 'SET_FORWARDING_STATE', payload: false });

      return results;
    } catch (error) {
      console.error('Batch forwarding failed:', error);
      const dispatch = (state as any).dispatch;
      dispatch({ type: 'SET_FORWARDING_STATE', payload: false });
      dispatch({ 
        type: 'SET_FORWARDING_PROGRESS', 
        payload: { ...state.forwardingProgress, status: 'error' } 
      });
      throw error;
    }
  }, [state]);

  /**
   * 取消转发
   */
  const cancelForwarding = useCallback(() => {
    const dispatch = (state as any).dispatch;
    dispatch({ type: 'SET_FORWARDING_STATE', payload: false });
    dispatch({ 
      type: 'SET_FORWARDING_PROGRESS', 
      payload: { ...state.forwardingProgress, status: 'cancelled' } 
    });
  }, [state]);

  /**
   * 重试单个平台转发
   */
  const retryPlatformForwarding = useCallback(async (platformId: string) => {
    try {
      const options: ForwardingOptions = {
        mode: state.forwardingOptions.mode,
        platforms: [platformId],
        batchMode: false,
      };

      const result = await forwardToPlatform(platformId, options, state);
      
      // 更新结果
      const dispatch = (state as any).dispatch;
      const updatedResults = state.forwardingProgress.results.map((r: ForwardingResult) =>
        r.platformId === platformId ? { ...result, retryCount: r.retryCount + 1 } : r
      );
      
      dispatch({ 
        type: 'SET_FORWARDING_PROGRESS', 
        payload: { ...state.forwardingProgress, results: updatedResults } 
      });

      return result;
    } catch (error) {
      console.error('Platform retry failed:', error);
      throw error;
    }
  }, [state]);

  return {
    startForwarding,
    cancelForwarding,
    retryPlatformForwarding,
  };
}

// ========================================================================================
// 辅助函数
// ========================================================================================

/**
 * 转发到单个平台
 */
async function forwardToPlatform(
  platformId: string, 
  options: ForwardingOptions, 
  state: any
): Promise<ForwardingResult> {
  const platformName = getPlatformName(platformId);
  
  try {
    // 获取平台内容
    const result = state.results.find((r: any) => r.platformId === platformId);
    if (!result) {
      throw new Error('未找到该平台的内容');
    }

    const content = result.content || (result.versions && result.versions[0]?.content) || '';
    if (!content) {
      throw new Error('内容为空');
    }

    // 根据转发模式执行不同的转发逻辑
    switch (options.mode) {
      case 'api':
        return await forwardViaAPI(platformId, platformName, content);
      case 'automation':
        return await forwardViaAutomation(platformId, platformName, content);
      case 'manual':
      default:
        return await forwardManually(platformId, platformName, content);
    }
  } catch (error) {
    return {
      platformId,
      platformName,
      success: false,
      error: error instanceof Error ? error.message : '转发失败',
      method: options.mode,
      timestamp: Date.now(),
      retryCount: 0,
    };
  }
}

/**
 * API直发
 */
async function forwardViaAPI(
  platformId: string, 
  platformName: string, 
  content: string
): Promise<ForwardingResult> {
  // 这里应该调用平台API
  // 现在返回模拟结果
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟成功率（80%）
  const success = Math.random() > 0.2;
  
  if (success) {
    return {
      platformId,
      platformName,
      success: true,
      url: `https://${platformId}.com/post/12345`,
      method: 'api',
      timestamp: Date.now(),
      retryCount: 0,
    };
  } else {
    throw new Error('API调用失败');
  }
}

/**
 * 自动化转发
 */
async function forwardViaAutomation(
  platformId: string, 
  platformName: string, 
  content: string
): Promise<ForwardingResult> {
  // 这里应该调用自动化脚本
  // 现在返回模拟结果
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const success = Math.random() > 0.3;
  
  if (success) {
    return {
      platformId,
      platformName,
      success: true,
      url: `https://${platformId}.com/post/auto-12345`,
      method: 'automation',
      timestamp: Date.now(),
      retryCount: 0,
    };
  } else {
    throw new Error('自动化转发失败');
  }
}

/**
 * 手动转发
 */
async function forwardManually(
  platformId: string, 
  platformName: string, 
  content: string
): Promise<ForwardingResult> {
  try {
    // 复制内容到剪贴板
    await navigator.clipboard.writeText(content);
    
    // 保存到历史记录
    const shareHistory = JSON.parse(localStorage.getItem('shareHistory') || '[]');
    shareHistory.unshift({
      id: Date.now().toString(),
      platformId,
      platformName,
      content,
      time: new Date().toISOString(),
    });
    localStorage.setItem('shareHistory', JSON.stringify(shareHistory.slice(0, 100)));
    
    // 打开平台发布页面
    const url = platformUrls[platformId];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    
    return {
      platformId,
      platformName,
      success: true,
      url,
      method: 'manual',
      timestamp: Date.now(),
      retryCount: 0,
    };
  } catch (error) {
    throw new Error('手动转发失败：' + (error instanceof Error ? error.message : '未知错误'));
  }
}

/**
 * 获取平台名称
 */
function getPlatformName(platformId: string): string {
  const platformNames: Record<string, string> = {
    xiaohongshu: '小红书',
    weibo: '微博',
    zhihu: '知乎',
    douyin: '抖音',
    wechat: '微信公众号',
    bilibili: 'B站',
  };
  
  return platformNames[platformId] || platformId;
}
