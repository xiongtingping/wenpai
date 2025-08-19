import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '@/utils/logger';

/**
 * Authing 登录回调页面
 * 处理从 Authing 登录页面返回的授权码
 */
const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 添加状态管理以提供更好的用户反馈
  const [processingStep, setProcessingStep] = useState('验证授权码...');
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setProcessingStep('验证授权码...');
        setProgress(10);

        logger.debug('🔄 处理 Authing 登录回调...');
        console.log('🔄 CallbackPage 组件已加载并开始处理回调');
        
        // 获取授权码和状态
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 🔍 详细诊断信息
        logger.debug('🌐 当前页面信息:', {
          url: window.location.href,
          origin: window.location.origin,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        });

        logger.debug('📋 回调参数:', { code, state, error, errorDescription });

        // 🔍 检查是否在弹窗中
        logger.debug('🪟 窗口信息:', {
          hasOpener: !!window.opener,
          isOpenerClosed: window.opener?.closed,
          windowName: window.name
        });

        if (error) {
          logger.error('❌ 登录失败:', error, errorDescription);
          
          // 通知父窗口登录失败
          if (window.opener) {
            window.opener.postMessage({
              type: 'AUTHING_LOGIN_ERROR',
              error: errorDescription || error
            }, window.location.origin);
            window.close();
            return;
          }
          
          // 如果不是弹窗，重定向到首页并显示错误
          navigate('/?error=' + encodeURIComponent(errorDescription || error));
          return;
        }

        if (!code) {
          logger.error('❌ 未收到授权码');
          
          // 通知父窗口登录失败
          if (window.opener) {
            window.opener.postMessage({
              type: 'AUTHING_LOGIN_ERROR',
              error: '未收到授权码'
            }, window.location.origin);
            window.close();
            return;
          }
          
          navigate('/?error=' + encodeURIComponent('登录失败：未收到授权码'));
          return;
        }

        logger.debug('✅ 收到授权码，准备交换 token (PKCE)...');
        setProcessingStep('交换访问令牌...');
        setProgress(30);

        let codeVerifier = sessionStorage.getItem('auth_pkce_verifier');

        // 🔧 增强PKCE验证器恢复机制 - 多重备份恢复
        if (!codeVerifier) {
          // 尝试从localStorage备份恢复
          const backupVerifier = localStorage.getItem('auth_pkce_verifier_backup');
          if (backupVerifier) {
            console.log('🔄 从localStorage备份恢复PKCE验证器');
            codeVerifier = backupVerifier;
            sessionStorage.setItem('auth_pkce_verifier', backupVerifier);
          }
        }

        if (!codeVerifier) {
          // 尝试从JSON数据恢复
          const pkceDataStr = localStorage.getItem('auth_pkce_data');
          if (pkceDataStr) {
            try {
              const pkceData = JSON.parse(pkceDataStr);
              if (pkceData.verifier) {
                console.log('🔄 从JSON数据恢复PKCE验证器');
                codeVerifier = pkceData.verifier;
                sessionStorage.setItem('auth_pkce_verifier', codeVerifier);
                localStorage.setItem('auth_pkce_verifier_backup', codeVerifier);
              }
            } catch (e) {
              console.warn('⚠️ 解析PKCE数据失败:', e);
            }
          }
        }

        if (!codeVerifier) {
          // 最后尝试从cookie恢复
          const cookies = document.cookie.split(';');
          const pkceCookie = cookies.find(cookie => cookie.trim().startsWith('pkce_verifier='));
          if (pkceCookie) {
            const cookieValue = pkceCookie.split('=')[1];
            if (cookieValue) {
              console.log('🔄 从Cookie恢复PKCE验证器');
              codeVerifier = cookieValue;
              sessionStorage.setItem('auth_pkce_verifier', codeVerifier);
              localStorage.setItem('auth_pkce_verifier_backup', codeVerifier);
            }
          }
        }

        console.log('🔍 PKCE验证器检查:', {
          hasSessionVerifier: !!sessionStorage.getItem('auth_pkce_verifier'),
          hasBackupVerifier: !!localStorage.getItem('auth_pkce_verifier_backup'),
          finalVerifier: !!codeVerifier,
          verifierLength: codeVerifier?.length,
          currentUrl: window.location.href
        });

        if (!codeVerifier) {
          console.error('❌ PKCE验证器完全丢失，尝试重新登录');
          console.error('🔍 存储状态:', {
            sessionKeys: Object.keys(sessionStorage),
            localAuthKeys: Object.keys(localStorage).filter(k => k.includes('auth'))
          });

          // 清除可能损坏的状态
          sessionStorage.clear();
          localStorage.removeItem('authing_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_pkce_verifier_backup');

          // 重定向到首页并提示重新登录
          window.location.href = '/?error=pkce_missing';
          return;
        }

        // 使用 Netlify Function 与 Authing 后端交换 token（PKCE，无 client_secret）
        const resp = await fetch('/.netlify/functions/authing-token-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, code_verifier: codeVerifier })
        });

        setProcessingStep('验证用户信息...');
        setProgress(60);

        if (!resp.ok) {
          const detail = await resp.json().catch(() => ({}));
          throw new Error('token exchange failed: ' + JSON.stringify(detail));
        }

        const data = await resp.json();
        const token = data?.tokens?.access_token;
        const userInfo = data?.userInfo || {};

        if (!token) {
          throw new Error('no access_token received');
        }

        // 🔍 详细调试用户信息字段
        console.log('🔍 原始用户信息调试:', {
          userInfo,
          availableFields: Object.keys(userInfo || {}),
          nickname: userInfo?.nickname,
          name: userInfo?.name,
          username: userInfo?.username,
          given_name: userInfo?.given_name,
          family_name: userInfo?.family_name,
          preferred_username: userInfo?.preferred_username,
          photo: userInfo?.photo,
          avatar: userInfo?.avatar,
          picture: userInfo?.picture
        });

        // 🔧 智能用户信息处理函数
        const processUserInfo = (rawUserInfo: any) => {
          // 昵称优先级：nickname > name > preferred_username > username > given_name
          const getNickname = () => {
            const candidates = [
              rawUserInfo?.nickname,
              rawUserInfo?.name,
              rawUserInfo?.preferred_username,
              rawUserInfo?.username,
              rawUserInfo?.given_name
            ].filter(Boolean); // 过滤掉空值

            // 如果有有效的昵称，使用第一个
            if (candidates.length > 0) {
              return candidates[0];
            }

            // 如果都没有，尝试从email生成昵称
            if (rawUserInfo?.email) {
              const emailPrefix = rawUserInfo.email.split('@')[0];
              if (emailPrefix && emailPrefix !== 'user') {
                return emailPrefix;
              }
            }

            // 不设置默认值，让AuthProvider处理
            return undefined;
          };

          // 头像优先级：photo > picture > avatar
          const getAvatar = () => {
            return rawUserInfo?.photo || rawUserInfo?.picture || rawUserInfo?.avatar || null;
          };

          // 用户名优先级：username > preferred_username > email前缀
          const getUsername = () => {
            if (rawUserInfo?.username) return rawUserInfo.username;
            if (rawUserInfo?.preferred_username) return rawUserInfo.preferred_username;
            if (rawUserInfo?.email) {
              return rawUserInfo.email.split('@')[0];
            }
            return null;
          };

          return {
            id: rawUserInfo?.sub || rawUserInfo?.userId || rawUserInfo?.id || 'user_' + Date.now(),
            username: getUsername(),
            email: rawUserInfo?.email,
            nickname: getNickname(),
            avatar: getAvatar(),
            // 保存原始信息用于调试
            _raw: rawUserInfo
          };
        };

        const processedUserInfo = processUserInfo(userInfo);
        const mergedUser = {
          ...processedUserInfo,
          token
        };

        console.log('🔍 处理后用户信息:', {
          processed: processedUserInfo,
          merged: mergedUser,
          nicknameSource: userInfo?.nickname ? 'nickname' :
                         userInfo?.name ? 'name' :
                         userInfo?.preferred_username ? 'preferred_username' :
                         userInfo?.username ? 'username' :
                         userInfo?.given_name ? 'given_name' :
                         userInfo?.email ? 'email' : 'fallback'
        });

        // 🔧 检查并修复用户信息一致性
        const checkAndFixUserConsistency = (newUser: any) => {
          const existingUserData = localStorage.getItem('authing_user');
          if (existingUserData) {
            try {
              const existingUser = JSON.parse(existingUserData);

              // 如果是同一个用户但信息不一致，进行智能合并
              if (existingUser.id === newUser.id) {
                console.log('🔍 检测到同一用户的不同信息，进行智能合并:', {
                  existing: existingUser,
                  new: newUser
                });

                // 优先使用更完整的信息
                const mergedUserInfo = {
                  ...existingUser,
                  ...newUser,
                  // 昵称：优先使用非默认值
                  nickname: (newUser.nickname && newUser.nickname !== '用户') ? newUser.nickname :
                           (existingUser.nickname && existingUser.nickname !== '用户') ? existingUser.nickname :
                           newUser.nickname,
                  // 头像：优先使用有值的
                  avatar: newUser.avatar || existingUser.avatar,
                  // 用户名：优先使用有值的
                  username: newUser.username || existingUser.username,
                  // 更新时间戳
                  lastUpdated: Date.now()
                };

                console.log('🔧 合并后的用户信息:', mergedUserInfo);
                return mergedUserInfo;
              }
            } catch (e) {
              console.warn('解析现有用户数据失败:', e);
            }
          }

          // 添加时间戳
          return {
            ...newUser,
            lastUpdated: Date.now()
          };
        };

        const finalUser = checkAndFixUserConsistency(mergedUser);

        setProcessingStep('保存登录状态...');
        setProgress(80);

        // 处理两种模式
        if (window.opener && !window.opener.closed) {
          // 弹窗模式：通知父窗口登录成功
          logger.debug('📤 弹窗模式：通知父窗口登录成功');
          window.opener.postMessage({
            type: 'AUTHING_LOGIN_SUCCESS',
            userInfo: finalUser
          }, window.location.origin);
          window.close();
          return;
        } else {
          // 同窗口模式：直接处理登录状态
          logger.debug('🔄 同窗口模式：直接处理登录状态');
          localStorage.setItem('auth_token', token);
          localStorage.setItem('authing_user', JSON.stringify(finalUser));

          // 🔧 清除PKCE验证器（登录成功后不再需要）
          sessionStorage.removeItem('auth_pkce_verifier');
          localStorage.removeItem('auth_pkce_verifier_backup');

          window.dispatchEvent(new CustomEvent('auth-login-success', { detail: finalUser }));

          // 解析 state 中的 redirectTo 并跳转 - 处理可能的双重编码
          let finalRedirect = '/';
          try {
            if (state) {
              let stateObj: any = {};

              // 尝试多种解码方式处理state参数
              try {
                // 尝试直接解析
                stateObj = JSON.parse(state);
              } catch (e1) {
                try {
                  // 尝试单次解码后解析
                  stateObj = JSON.parse(decodeURIComponent(state));
                } catch (e2) {
                  try {
                    // 尝试双重解码后解析
                    stateObj = JSON.parse(decodeURIComponent(decodeURIComponent(state)));
                  } catch (e3) {
                    try {
                      // 尝试手动清理URL编码字符
                      const cleanedState = state.replace(/%22/g, '"').replace(/%7B/g, '{').replace(/%7D/g, '}').replace(/%3A/g, ':').replace(/%2C/g, ',');
                      stateObj = JSON.parse(cleanedState);
                    } catch (e4) {
                      console.error('🔍 State解析详细信息:', {
                        originalState: state,
                        stateLength: state.length,
                        statePreview: state.substring(0, 100),
                        errors: { e1: e1.message, e2: e2.message, e3: e3.message, e4: e4.message }
                      });
                      logger.warn('⚠️ 所有state解析方式都失败，使用默认值');
                      stateObj = { redirectTo: '/' }; // 使用默认值而不是抛出错误
                    }
                  }
                }
              }

              if (stateObj.redirectTo) {
                const redirectTo = stateObj.redirectTo;
                logger.debug('📍 从 state 解析到跳转目标:', redirectTo);

                // 如果是完整 URL，提取路径部分；如果是相对路径，直接使用
                if (redirectTo.startsWith('http')) {
                  try {
                    const url = new URL(redirectTo);
                    finalRedirect = url.pathname + url.search + url.hash;
                  } catch (e) {
                    logger.warn('⚠️ 解析 redirectTo URL 失败，使用默认跳转:', e);
                  }
                } else {
                  finalRedirect = redirectTo;
                }
              }

              // 检查是否是注册模式
              if (stateObj.mode === 'register') {
                logger.debug('🎯 检测到注册模式，确保跳转到首页');
                finalRedirect = '/';
              }
            }
          } catch (e) {
            logger.warn('⚠️ 解析 state 失败，使用默认跳转:', e);
          }

          setProcessingStep('登录成功，正在跳转...');
          setProgress(100);

          logger.debug('🎯 最终跳转到:', finalRedirect);

          // 添加短暂延迟，让用户看到成功状态
          setTimeout(() => {
            navigate(finalRedirect);
          }, 800);
        }

      } catch (error) {
        logger.error('❌ 处理登录回调时出错:', error);

        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : '登录处理失败');
        setProcessingStep('登录失败');
        setProgress(0);

        // 通知父窗口登录失败
        if (window.opener) {
          window.opener.postMessage({
            type: 'AUTHING_LOGIN_ERROR',
            error: '处理登录回调时出错'
          }, window.location.origin);

          // 延迟关闭，让用户看到错误信息
          setTimeout(() => {
            window.close();
          }, 3000);
          return;
        }

        // 延迟跳转，让用户看到错误信息
        setTimeout(() => {
          navigate('/?error=' + encodeURIComponent('登录处理失败'));
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  // 渲染时也输出调试信息
  console.log('🎨 CallbackPage 正在渲染，当前 URL:', window.location.href);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        {/* 进度指示器 */}
        <div className="mb-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{progress}%</span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-full bg-secondary rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 状态信息 */}
        <h2 className={`text-xl font-semibold mb-2 ${hasError ? 'text-red-600' : 'text-foreground'}`}>
          {hasError ? '登录失败' : '正在处理登录'}
        </h2>
        <p className="text-muted-foreground mb-4">{processingStep}</p>

        {/* 成功状态特殊显示 */}
        {progress === 100 && !hasError && (
          <div className="flex items-center justify-center text-green-600 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">登录成功</span>
          </div>
        )}

        {/* 错误状态显示 */}
        {hasError && (
          <div className="flex items-center justify-center text-red-600 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium">处理失败</span>
          </div>
        )}

        {/* 错误详情 */}
        {hasError && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
            <p className="text-xs text-red-600 mt-1">页面将在3秒后自动跳转...</p>
          </div>
        )}

        {/* 调试信息（仅开发环境显示） */}
        {import.meta.env.DEV && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              调试信息
            </summary>
            <div className="mt-2 p-2 bg-secondary rounded text-xs text-muted-foreground break-all">
              {window.location.href}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default CallbackPage;
