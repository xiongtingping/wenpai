import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@authing/guard-react/dist/esm/guard.min.css';

/**
 * 开发环境配置
 */
if (import.meta.env.DEV) {
  // 开发环境下的全局配置
  console.log('🚀 文派开发环境已启动');
  console.log('📱 当前环境:', import.meta.env.MODE);
  console.log('🔧 开发工具:', {
    reactDevTools: 'https://reactjs.org/link/react-devtools',
    viteDevTools: 'https://vitejs.dev/guide/features.html#dev-tools'
  });
  
  // 禁用某些开发环境警告
  const originalWarn = console.warn;
  console.warn = (...args) => {
    // 过滤掉React Router的未来标志警告
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('React Router Future Flag Warning') || 
         args[0].includes('v7_startTransition') || 
         args[0].includes('v7_relativeSplatPath'))) {
      return;
    }
    
    // 过滤掉Authing相关的警告
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('未找到Authing弹窗元素') || 
         args[0].includes('Authing服务响应超时') ||
         args[0].includes('检查初始登录状态失败') ||
         args[0].includes('从guard检查登录状态失败') ||
         args[0].includes('备用检查：从guard检查登录状态失败'))) {
      return;
    }
    
    // 过滤掉React重复创建root的警告
    if (args[0] && typeof args[0] === 'string' && 
        args[0].includes('You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot()')) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
}

/**
 * 错误边界组件
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('应用错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">😵 应用出现错误</h1>
            <p className="text-gray-600 mb-4">抱歉，应用遇到了一个意外错误</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              刷新页面
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">查看错误详情</summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 应用入口
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
