import React from 'react';
import { Button } from '../components/ui/button';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';

/**
 * 备用登录测试页面
 */
const BackupLoginTestPage: React.FC = () => {
  const { login, isAuthenticated, user } = useUnifiedAuth();

  const handleTestLogin = (target: string) => {
    console.log('🔍 测试备用登录:', target);
    login(target);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">备用登录测试</h1>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">当前状态</p>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isAuthenticated ? '已登录' : '未登录'}
            </div>
          </div>
          
          {user && (
            <div className="text-center">
              <p className="text-sm text-gray-600">用户: {user.nickname || user.username || user.email || user.id}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Button 
              onClick={() => handleTestLogin('/adapt')}
              className="w-full"
              variant="outline"
            >
              测试AI内容适配器
            </Button>
            
            <Button 
              onClick={() => handleTestLogin('/creative-studio')}
              className="w-full"
              variant="outline"
            >
              测试创意魔方
            </Button>
            
            <Button 
              onClick={() => handleTestLogin('/hot-topics')}
              className="w-full"
              variant="outline"
            >
              测试热点话题
            </Button>
            
            <Button 
              onClick={() => handleTestLogin('/library')}
              className="w-full"
              variant="outline"
            >
              测试资料库
            </Button>
            
            <Button 
              onClick={() => handleTestLogin('/brand-library')}
              className="w-full"
              variant="outline"
            >
              测试品牌库
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={() => handleTestLogin('')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              直接登录（无跳转）
            </Button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            这个页面测试备用登录功能，不依赖Authing Guard
          </p>
          <a 
            href="/" 
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            返回首页测试
          </a>
        </div>
      </div>
    </div>
  );
};

export default BackupLoginTestPage; 