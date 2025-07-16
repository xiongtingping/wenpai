import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Authing 认证回调页面组件
 * 处理 Authing 认证完成后的回调逻辑
 */
const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    /**
     * 处理认证回调
     */
    const handleCallback = async () => {
      try {
        // 获取 URL 参数
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('认证失败:', error, errorDescription);
          setStatus('error');
          // 3秒后跳转到主页
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }

        if (code) {
          console.log('收到认证码:', code);
          // 这里可以调用后端 API 交换用户信息
          // const userInfo = await exchangeCodeForUserInfo(code);
          
          // 模拟成功处理
          setStatus('success');
          
          // 2秒后跳转到主页
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          console.error('未收到认证码');
          setStatus('error');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } catch (error) {
        console.error('处理回调时出错:', error);
        setStatus('error');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  /**
   * 渲染加载状态
   */
  const renderLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在处理认证回调...</p>
      </div>
    </div>
  );

  /**
   * 渲染成功状态
   */
  const renderSuccess = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">认证成功！</h2>
        <p className="mt-2 text-gray-600">正在跳转到主页...</p>
      </div>
    </div>
  );

  /**
   * 渲染错误状态
   */
  const renderError = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">认证失败</h2>
        <p className="mt-2 text-gray-600">正在跳转到登录页面...</p>
      </div>
    </div>
  );

  // 根据状态渲染不同内容
  switch (status) {
    case 'success':
      return renderSuccess();
    case 'error':
      return renderError();
    default:
      return renderLoading();
  }
};

export default AuthCallbackPage; 