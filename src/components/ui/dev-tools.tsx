/**
 * 开发工具组件
 * 仅在开发环境下显示，提供调试和开发辅助功能
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Settings, 
  Database, 
  Network, 
  Monitor, 
  Zap,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * 开发工具面板组件
 */
const DevTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'auth' | 'permissions' | 'storage' | 'network' | 'tests'>('info');
  
  // 安全地使用 useAuth hook
  let authData = { user: null, isAuthenticated: false };
  try {
    const { user, isAuthenticated } = useUnifiedAuth();
    authData = { user, isAuthenticated };
  } catch (error) {
    console.warn('DevTools: useAuth hook not available, auth data will be empty');
  }
  
  // 安全地使用 usePermissions hook
  let permissionData = { hasRole: (role: string) => false, loading: false };
  try {
    const { hasRole, loading: permissionLoading } = usePermissions();
    permissionData = { hasRole, loading: permissionLoading };
  } catch (error) {
    console.warn('DevTools: usePermissions hook not available, permission data will be empty');
  }

  // 仅在开发环境下显示
  if (!import.meta.env.DEV) {
    return null;
  }

  /**
   * 获取本地存储信息
   */
  const getStorageInfo = () => {
    const storage = {
      localStorage: {} as Record<string, any>,
      sessionStorage: {} as Record<string, any>,
    };

    // 获取localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          storage.localStorage[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          storage.localStorage[key] = localStorage.getItem(key);
        }
      }
    }

    // 获取sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          storage.sessionStorage[key] = JSON.parse(sessionStorage.getItem(key) || '');
        } catch {
          storage.sessionStorage[key] = sessionStorage.getItem(key);
        }
      }
    }

    return storage;
  };

  /**
   * 清除所有存储
   */
  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  /**
   * 获取网络信息
   */
  const getNetworkInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      connection: (navigator as any).connection || 'Not supported',
    };
  };

  const storageInfo = getStorageInfo();
  const networkInfo = getNetworkInfo();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 开发工具按钮 */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
        size="sm"
      >
        <Bug className="w-4 h-4 mr-2" />
        DEV
        {isOpen ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronUp className="w-4 h-4 ml-2" />}
      </Button>

      {/* 开发工具面板 */}
      {isOpen && (
        <Card className="w-96 max-h-96 overflow-hidden shadow-xl border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-200 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="w-4 h-4" />
                开发工具
                <Badge variant="destructive" className="text-xs">DEV</Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* 标签页导航 */}
            <div className="flex border-b">
              {[
                { key: 'info', label: '信息', icon: Monitor },
                { key: 'auth', label: '认证', icon: Database },
                { key: 'permissions', label: '权限', icon: Settings },
                { key: 'storage', label: '存储', icon: Database },
                { key: 'network', label: '网络', icon: Network },
                { key: 'tests', label: '测试', icon: Zap },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-3 h-3 mx-auto mb-1" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 标签页内容 */}
            <div className="p-3 max-h-64 overflow-y-auto">
              {activeTab === 'info' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">环境:</span>
                    <Badge variant="outline" className="text-xs">开发环境</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">版本:</span>
                    <span>v1.0.0-dev</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">时间:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">URL:</span>
                    <span className="truncate">{window.location.href}</span>
                  </div>
                </div>
              )}

              {activeTab === 'auth' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">登录状态:</span>
                    <Badge variant={authData.isAuthenticated ? "default" : "secondary"} className="text-xs">
                      {authData.isAuthenticated ? '已登录' : '未登录'}
                    </Badge>
                  </div>
                  {authData.user && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">用户ID:</span>
                        <span className="font-mono text-xs">{authData.user.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">用户名:</span>
                        <span>{authData.user.username || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">昵称:</span>
                        <span>{authData.user.nickname || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">权限加载:</span>
                    <Badge variant={permissionData.loading ? "secondary" : "default"} className="text-xs">
                      {permissionData.loading ? '加载中' : '已加载'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">专业版:</span>
                    <Badge variant={permissionData.hasRole('pro') ? "default" : "secondary"} className="text-xs">
                      {permissionData.hasRole('pro') ? '是' : '否'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">高级版:</span>
                    <Badge variant={permissionData.hasRole('premium') ? "default" : "secondary"} className="text-xs">
                      {permissionData.hasRole('premium') ? '是' : '否'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">管理员:</span>
                    <Badge variant={permissionData.hasRole('admin') ? "default" : "secondary"} className="text-xs">
                      {permissionData.hasRole('admin') ? '是' : '否'}
                    </Badge>
                  </div>
                </div>
              )}

              {activeTab === 'storage' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">存储管理:</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearAllStorage}
                      className="h-6 px-2 text-xs"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      清空
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-700">LocalStorage ({Object.keys(storageInfo.localStorage).length}):</div>
                    {Object.entries(storageInfo.localStorage).map(([key, value]) => (
                      <div key={key} className="pl-2 text-xs text-gray-600">
                        <span className="font-mono">{key}:</span> {JSON.stringify(value).slice(0, 50)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'network' && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">在线状态:</span>
                    <Badge variant={networkInfo.onLine ? "default" : "destructive"} className="text-xs">
                      {networkInfo.onLine ? '在线' : '离线'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">语言:</span>
                    <span>{networkInfo.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平台:</span>
                    <span>{networkInfo.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cookie:</span>
                    <Badge variant={networkInfo.cookieEnabled ? "default" : "secondary"} className="text-xs">
                      {networkInfo.cookieEnabled ? '启用' : '禁用'}
                    </Badge>
                  </div>
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-2 text-xs">
                  <div className="font-medium text-gray-700 mb-2">测试页面:</div>
                  <div className="space-y-1">
                    <a 
                      href="/functionality-test" 
                      className="block px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      🧪 功能测试
                    </a>
                    <a 
                      href="/api-config-test" 
                      className="block px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                    >
                      ⚙️ API配置测试
                    </a>
                    <a 
                      href="/creem-api-test" 
                      className="block px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                    >
                      💳 Creem支付测试
                    </a>
                    <a 
                      href="/qrcode-test" 
                      className="block px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
                    >
                      📱 二维码生成测试
                    </a>
                    <a 
                      href="/checkout-test" 
                      className="block px-2 py-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors"
                    >
                      💳 完整支付流程测试
                    </a>
                    <a 
                      href="/direct-link-qrcode-test" 
                      className="block px-2 py-1 bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100 transition-colors"
                    >
                      🔗 直接链接二维码测试
                    </a>
                    <a 
                      href="/simple-qrcode" 
                      className="block px-2 py-1 bg-teal-50 text-teal-700 rounded hover:bg-teal-100 transition-colors"
                    >
                      📱 简单二维码页面
                    </a>
                    <a 
                      href="/creem-api-fix-test" 
                      className="block px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors"
                    >
                      🔧 Creem API修复测试
                    </a>
                    <a 
                      href="/simple-creem-test" 
                      className="block px-2 py-1 bg-lime-50 text-lime-700 rounded hover:bg-lime-100 transition-colors"
                    >
                      🧪 简单Creem API测试
                    </a>
                    <a 
                      href="/creem-debug" 
                      className="block px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                    >
                      🐛 Creem API调试
                    </a>
                    <a 
                      href="/authing-system-test" 
                      className="block px-2 py-1 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
                    >
                      🔐 Authing系统测试
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DevTools; 