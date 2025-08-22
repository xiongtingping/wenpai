import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '@/auth/callbackHandler';
import { callbackUrlNormalizer } from '@/auth/callbackUrlNormalizer';
import { authRetryGuard } from '@/auth/authRetryGuard';
import { authCodeGuard } from '@/auth/authCodeGuard';
import { useUnifiedAuth } from '@/auth/UnifiedAuthProvider';
import { logger } from '@/utils/logger';

/**
 * 🔐 统一认证回调页面
 * 处理OAuth认证回调，完成登录流程
 */
const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useUnifiedAuth();

  // 添加状态管理以提供更好的用户反馈
  const [processingStep, setProcessingStep] = useState('验证授权码...');
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    let isProcessing = false;
    
    const processCallback = async () => {
      // 防止重复处理
      if (isProcessing) {
        logger.debug('⏳ 回调处理已在进行中，跳过重复执行');
        return;
      }
      
      // 检查认证流程防护
      const authUtils = (window as any).authFlowUtils;
      if (authUtils && !authUtils.preventAuthLoop('callback')) {
        logger.warn('🛑 认证流程循环保护触发，停止处理');
        return;
      }
      
      isProcessing = true;
      
      try {
        if (!isMounted) return;
        
        setProcessingStep('验证授权码...');
        setProgress(10);

        logger.debug('🔄 处理OAuth认证回调...');
        
        // 🔧 使用URL规范化器检测和处理多重回调URL问题
        const currentUrl = window.location.href;
        const urlNormalization = callbackUrlNormalizer.normalizeCallbackUrl(currentUrl);
        
        logger.debug('🔍 URL规范化结果:', urlNormalization);
        
        // 如果检测到多重URL问题，记录并尝试修复
        if (urlNormalization.hasMultipleUrls) {
          logger.warn('⚠️ 检测到多重回调URL问题:', {
            originalUrl: currentUrl,
            extractedParams: urlNormalization.extractedParams,
            cleanedUrl: urlNormalization.cleanedUrl
          });
          
          // 🛡️ 记录认证失败尝试
          const attemptId = authRetryGuard.startAttempt('callback', currentUrl);
          authRetryGuard.markFailure(attemptId, '检测到多重回调URL问题');
          
          // 如果可能的话，使用清理后的URL重新处理
          if (urlNormalization.cleanedUrl && urlNormalization.cleanedUrl !== currentUrl) {
            logger.info('🔄 尝试使用清理后的URL重新处理');
            window.location.href = urlNormalization.cleanedUrl;
            return;
          }
        }
        
        // 检查URL参数是否存在
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          // 🛡️ 记录认证错误
          const attemptId = authRetryGuard.startAttempt('callback', currentUrl);
          authRetryGuard.markFailure(attemptId, `认证错误: ${error}`);
          throw new Error(`认证错误: ${error}`);
        }
        
        if (!code) {
          // 🛡️ 记录缺少授权码错误
          const attemptId = authRetryGuard.startAttempt('callback', currentUrl);
          authRetryGuard.markFailure(attemptId, '缺少授权码参数');
          throw new Error('缺少授权码参数');
        }
        
        // 🛡️ 开始正常的回调处理尝试
        const attemptId = authRetryGuard.startAttempt('callback', currentUrl);
        
        if (!isMounted) return;
        
        setProcessingStep('处理认证信息...');
        setProgress(30);
        
        // 使用统一的回调处理器
        const result = await handleAuthCallback();
        
        if (!isMounted) return;
        
        setProgress(60);
        
        if (result.success) {
          setProcessingStep('登录成功，正在跳转...');
          setProgress(90);
          
          // 🛡️ 标记认证尝试成功
          authRetryGuard.markSuccess(attemptId);
          
          // 检查认证状态
          await checkAuthStatus();
          
          if (!isMounted) return;
          
          setProgress(100);
          
          // 跳转到目标页面
          const redirectTo = result.redirectTo || '/';
          logger.info('✅ 认证成功，跳转到:', redirectTo);
          
          // 重置认证尝试计数
          if (authUtils) {
            authUtils.resetAuthAttempts();
          }
          
          setTimeout(() => {
            if (isMounted) {
              navigate(redirectTo, { replace: true });
            }
          }, 500);
        } else {
          // 🛡️ 标记认证尝试失败
          authRetryGuard.markFailure(attemptId, result.error || '认证失败');
          
          // 处理错误
          if (!isMounted) return;
          
          setHasError(true);
          setErrorMessage(result.error || '认证失败');
          setProcessingStep('认证失败');
          
          logger.error('❌ 认证失败:', result.error);
          
          // 清除认证相关的localStorage数据，避免循环
          try {
            localStorage.removeItem('pkce_code_verifier');
            localStorage.removeItem('auth_state');
            localStorage.removeItem('auth_redirect_to');
          } catch (e) {
            console.warn('清除localStorage失败:', e);
          }
          
          // 重置认证尝试计数
          const authUtils = (window as any).authFlowUtils;
          if (authUtils) {
            authUtils.resetAuthAttempts();
          }
          
          // 不自动跳转，让用户手动选择
          console.log('🛑 认证失败，停止自动重试');
        }
      } catch (error) {
        logger.error('❌ 回调处理失败:', error);
        
        // 🛡️ 如果有记录的尝试，标记为失败
        try {
          const errorMessage = error instanceof Error ? error.message : '处理失败';
          // 尝试查找最近的callback尝试并标记失败
          const recentAttempts = authRetryGuard.getStatus();
          if (recentAttempts.recentAttempts > 0) {
            // 这里简化处理，创建新的失败记录
            const attemptId = authRetryGuard.startAttempt('callback', window.location.href);
            authRetryGuard.markFailure(attemptId, errorMessage);
          }
        } catch (guardError) {
          logger.debug('标记认证失败时出错:', guardError);
        }
        
        if (!isMounted) return;
        
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : '处理失败');
        setProcessingStep('处理失败');
        
        // 清除认证相关的localStorage数据，避免循环
        try {
          localStorage.removeItem('pkce_code_verifier');
          localStorage.removeItem('auth_state');
          localStorage.removeItem('auth_redirect_to');
        } catch (e) {
          console.warn('清除localStorage失败:', e);
        }
        
        // 重置认证尝试计数
        const authUtils = (window as any).authFlowUtils;
        if (authUtils) {
          authUtils.resetAuthAttempts();
        }
        
        // 不自动跳转，让用户手动选择
        console.log('🛑 回调处理失败，停止自动重试');
      } finally {
        isProcessing = false;
      }
    };

    processCallback();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, checkAuthStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center">
          {/* Logo或图标 */}
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            {hasError ? (
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* 标题 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {hasError ? '认证失败' : '正在登录'}
          </h1>

          {/* 状态描述 */}
          <p className="text-gray-600 mb-6">
            {hasError ? errorMessage : processingStep}
          </p>

          {/* 进度条 */}
          {!hasError && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* 错误时显示详细信息和操作按钮 */}
          {hasError && (
            <div className="space-y-4">
              {/* 错误详情 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium mb-2">错误详情</h3>
                <p className="text-red-700 text-sm">{errorMessage}</p>
                
                {/* URL规范化诊断信息 */}
                <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-600">
                  <p className="font-medium mb-1">🔍 URL诊断信息：</p>
                  <p>当前URL: {window.location.href}</p>
                  {(() => {
                    const urlInfo = callbackUrlNormalizer.normalizeCallbackUrl(window.location.href);
                    return (
                      <>
                        <p>多重URL检测: {urlInfo.hasMultipleUrls ? '❌ 发现问题' : '✅ 正常'}</p>
                        {urlInfo.hasMultipleUrls && (
                          <>
                            <p>提取参数: {JSON.stringify(urlInfo.extractedParams)}</p>
                            <p>建议URL: {urlInfo.cleanedUrl}</p>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                {/* 认证重试状态信息 */}
                <div className="mt-2 p-2 bg-orange-100 rounded text-xs text-orange-600">
                  <p className="font-medium mb-1">🛡️ 认证状态信息：</p>
                  {(() => {
                    const retryStatus = authRetryGuard.getStatus();
                    return (
                      <>
                        <p>近期尝试次数: {retryStatus.recentAttempts}</p>
                        <p>冷却状态: {retryStatus.inCooldown ? `❄️ 冷却中 (剩余${retryStatus.cooldownRemaining}秒)` : '✅ 可尝试'}</p>
                        {retryStatus.lastFailureTime > 0 && (
                          <p>上次失败时间: {new Date(retryStatus.lastFailureTime).toLocaleString()}</p>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                {/* 授权码防护状态信息 */}
                <div className="mt-2 p-2 bg-purple-100 rounded text-xs text-purple-600">
                  <p className="font-medium mb-1">🛡️ 授权码防护状态：</p>
                  {(() => {
                    const codeCheck = authCodeGuard.checkCurrentUrl();
                    const codeStats = authCodeGuard.getUsageStats();
                    return (
                      <>
                        <p>当前检查: {codeCheck.hasCodeIssue ? '❌ 发现问题' : '✅ 正常'}</p>
                        <p>总授权码数: {codeStats.totalCodes}</p>
                        <p>成功使用: {codeStats.successfulCodes} | 失败: {codeStats.failedCodes}</p>
                        {codeCheck.hasCodeIssue && (
                          <p className="text-red-600">问题: {codeCheck.recommendedAction}</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/', { replace: true })}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  返回首页
                </button>
                <button
                  onClick={() => {
                    // 清理状态后重新尝试
                    localStorage.clear();
                    window.location.href = '/';
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  重新登录
                </button>
              </div>
            </div>
          )}

          {/* 加载动画 */}
          {!hasError && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallbackPage;
