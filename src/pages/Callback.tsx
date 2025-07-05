import { useEffect } from 'react';
import { Guard } from '@authing/guard-react';

/**
 * Authing 应用 ID
 */
const appId = '6867fdc88034eb95ae86167d';

/**
 * Authing 配置
 */
const config = {
  host: 'https://qutkgzkfaezk-demo.authing.cn', // 你的 Authing 域名
  redirectUri: window.location.origin + '/callback',
};

/**
 * Callback 页面组件
 * 处理 Authing 授权回调，获取用户信息并跳转到首页
 * @returns React 组件
 */
export default function Callback() {
  useEffect(() => {
    /**
     * 处理 Authing 重定向回调
     */
    const guard = new Guard({
      appId,
      ...config
    });
    guard.handleRedirectCallback().then(userInfo => {
      console.log('登录成功:', userInfo);
      // 这里你可以存储 token 或用户信息
      localStorage.setItem('authing_user', JSON.stringify(userInfo));
      // 跳转到首页
      window.location.href = '/';
    }).catch(err => {
      console.error('登录失败:', err);
      // 跳转到登录页或显示错误
      window.location.href = '/authing-login';
    });
  }, []);

  return <div>正在登录中...</div>;
} 