import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '@/auth/callbackHandler';
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
        
        // 检查URL参数是否存在
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          throw new Error(`认证错误: ${error}`);
        }
        
        if (!code) {
          throw new Error('缺少授权码参数');
        }
        
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
          
          // 3秒后跳转到首页
          setTimeout(() => {
            if (isMounted) {
              navigate('/', { replace: true });
            }
          }, 3000);
        }
      } catch (error) {
        logger.error('❌ 回调处理失败:', error);
        
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
        
        // 3秒后跳转到首页
        setTimeout(() => {
          if (isMounted) {
            navigate('/', { replace: true });
          }
        }, 3000);
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

          {/* 错误时显示返回按钮 */}
          {hasError && (
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              返回首页
            </button>
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
