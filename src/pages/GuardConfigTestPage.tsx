import React, { useEffect, useState } from 'react';
import { getAuthingConfig } from '@/config/authing';
import { createSafeGuardConfig } from '@/utils/authingGuardSafeWrapper'; // FIXME: 若无该封装，请创建占位安全封装模块或调整导入

/**
 * Guard 配置测试页面
 * 用于验证 Authing Guard 配置是否正确
 */
export const GuardConfigTestPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [safeConfig, setSafeConfig] = useState<any>(null);
  const [guardInstance, setGuardInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // 获取原始配置
      const originalConfig = getAuthingConfig();
      setConfig(originalConfig);

      // 创建安全配置
      const safe = createSafeGuardConfig({
        appId: originalConfig.appId,
        host: originalConfig.host,
        redirectUri: originalConfig.redirectUri,
        // 仅透传必要字段，避免额外属性
        // 其余 UI 配置请在实际 Guard 初始化处进行
        // 这里不包含 mode/lang，以避免类型不匹配
      });
      setSafeConfig(safe);

      // 尝试创建 Guard 实例
      import('@authing/guard').then(({ Guard }) => {
        try {
          const guard = new Guard(safe as any);
          setGuardInstance(guard);
          console.log('✅ Guard 实例创建成功:', guard);
        } catch (guardError) {
          console.error('❌ Guard 实例创建失败:', guardError);
          const msg = guardError instanceof Error ? guardError.message : String(guardError);
          setError(`Guard 实例创建失败: ${msg}`);
        }
      }).catch(importError => {
        console.error('❌ Guard 模块导入失败:', importError);
        const msg = importError instanceof Error ? importError.message : String(importError);
        setError(`Guard 模块导入失败: ${msg}`);
      });

    } catch (err) {
      console.error('❌ 配置测试失败:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`配置测试失败: ${msg}`);
    }
  }, []);

  const testGuardShow = () => {
    if (guardInstance && typeof guardInstance.show === 'function') {
      try {
        guardInstance.show();
        console.log('✅ Guard 弹窗显示成功');
      } catch (showError) {
        console.error('❌ Guard 弹窗显示失败:', showError);
        const msg = showError instanceof Error ? showError.message : String(showError);
        setError(`Guard 弹窗显示失败: ${msg}`);
      }
    } else {
      setError('Guard 实例不存在或 show 方法不可用');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Guard 配置测试</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">错误信息</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 原始配置 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">原始配置</h2>
            <pre className="bg-gray-100 rounded p-4 text-sm overflow-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>

          {/* 安全配置 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">安全配置</h2>
            <pre className="bg-gray-100 rounded p-4 text-sm overflow-auto">
              {JSON.stringify(safeConfig, null, 2)}
            </pre>
          </div>

          {/* Guard 实例状态 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Guard 实例状态</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">实例存在:</span>{' '}
                <span className={guardInstance ? 'text-green-600' : 'text-red-600'}>
                  {guardInstance ? '✅ 是' : '❌ 否'}
                </span>
              </p>
              {guardInstance && (
                <>
                  <p>
                    <span className="font-medium">show 方法:</span>{' '}
                    <span className={typeof guardInstance.show === 'function' ? 'text-green-600' : 'text-red-600'}>
                      {typeof guardInstance.show === 'function' ? '✅ 可用' : '❌ 不可用'}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">可用方法:</span>{' '}
                    <span className="text-gray-600">
                      {Object.getOwnPropertyNames(guardInstance).filter(name => typeof guardInstance[name] === 'function').join(', ')}
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 测试按钮 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">功能测试</h2>
            <div className="space-y-4">
              <button
                onClick={testGuardShow}
                disabled={!guardInstance}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                测试 Guard 弹窗显示
              </button>
              
              <div className="text-sm text-gray-600">
                <p>点击按钮测试 Guard 弹窗是否能正常显示。</p>
                <p>如果弹窗是空白的，说明配置有问题。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardConfigTestPage;
