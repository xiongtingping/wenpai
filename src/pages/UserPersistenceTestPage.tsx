import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

/**
 * 🧪 用户信息持久化测试页面
 * 用于测试头像和昵称的持久化存储
 */
export default function UserPersistenceTestPage() {
  const { user, updateUser, isAuthenticated } = useUnifiedAuth();
  const { toast } = useToast();
  const [testNickname, setTestNickname] = useState('');
  const [testAvatar, setTestAvatar] = useState('');
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  // 读取localStorage数据
  const refreshLocalStorage = () => {
    const stored = localStorage.getItem('authing_user');
    if (stored) {
      try {
        setLocalStorageData(JSON.parse(stored));
      } catch (error) {
        setLocalStorageData({ error: '解析失败' });
      }
    } else {
      setLocalStorageData(null);
    }
  };

  useEffect(() => {
    refreshLocalStorage();
    if (user) {
      setTestNickname(user.nickname || '');
      setTestAvatar(user.avatar || '');
    }
  }, [user]);

  const handleUpdateNickname = () => {
    if (!testNickname.trim()) {
      toast({
        title: "请输入昵称",
        variant: "destructive"
      });
      return;
    }

    updateUser({ nickname: testNickname });
    toast({
      title: "昵称已更新",
      description: `新昵称: ${testNickname}`
    });
    
    // 延迟刷新localStorage显示
    setTimeout(refreshLocalStorage, 100);
  };

  const handleUpdateAvatar = () => {
    if (!testAvatar.trim()) {
      toast({
        title: "请输入头像URL",
        variant: "destructive"
      });
      return;
    }

    updateUser({ avatar: testAvatar });
    toast({
      title: "头像已更新",
      description: "头像URL已更新"
    });
    
    // 延迟刷新localStorage显示
    setTimeout(refreshLocalStorage, 100);
  };

  const handleClearStorage = () => {
    localStorage.removeItem('authing_user');
    refreshLocalStorage();
    toast({
      title: "存储已清除",
      description: "localStorage中的用户数据已清除"
    });
  };

  const handleReloadPage = () => {
    window.location.reload();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">🧪 用户持久化测试</h1>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-600">请先登录以测试用户信息持久化</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 用户信息持久化测试</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 当前用户信息 */}
          <Card>
            <CardHeader>
              <CardTitle>当前用户信息 (Context)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">用户ID:</label>
                <p className="text-sm text-gray-600">{user?.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">昵称:</label>
                <p className="text-sm text-gray-600">{user?.nickname || '未设置'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">头像:</label>
                <p className="text-sm text-gray-600 break-all">{user?.avatar || '未设置'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">邮箱:</label>
                <p className="text-sm text-gray-600">{user?.email || '未设置'}</p>
              </div>
            </CardContent>
          </Card>

          {/* localStorage数据 */}
          <Card>
            <CardHeader>
              <CardTitle>localStorage数据</CardTitle>
              <Button onClick={refreshLocalStorage} size="sm" variant="outline">
                刷新
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {localStorageData ? JSON.stringify(localStorageData, null, 2) : '无数据'}
              </pre>
            </CardContent>
          </Card>

          {/* 测试操作 */}
          <Card>
            <CardHeader>
              <CardTitle>测试昵称更新</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={testNickname}
                onChange={(e) => setTestNickname(e.target.value)}
                placeholder="输入新昵称"
              />
              <Button onClick={handleUpdateNickname} className="w-full">
                更新昵称
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>测试头像更新</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={testAvatar}
                onChange={(e) => setTestAvatar(e.target.value)}
                placeholder="输入头像URL"
              />
              <Button onClick={handleUpdateAvatar} className="w-full">
                更新头像
              </Button>
            </CardContent>
          </Card>

          {/* 系统操作 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>系统操作</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={handleClearStorage} variant="destructive">
                清除localStorage
              </Button>
              <Button onClick={handleReloadPage} variant="outline">
                重新加载页面
              </Button>
              <Button onClick={refreshLocalStorage} variant="secondary">
                刷新显示
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 头像持久化专项测试 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🖼️ 头像持久化专项测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                <h4 className="font-semibold text-yellow-800">关键测试步骤</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700 mt-2">
                  <li><strong>设置头像</strong>：在上方输入框中输入头像URL并点击"更新头像"</li>
                  <li><strong>检查同步</strong>：确认localStorage中包含新的头像URL</li>
                  <li><strong>模拟登出</strong>：点击"清除localStorage"模拟登出</li>
                  <li><strong>重新加载</strong>：点击"重新加载页面"模拟重新登录</li>
                  <li><strong>验证恢复</strong>：检查头像是否正确恢复</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800">测试用头像URL</h4>
                <div className="space-y-2 text-sm text-blue-700 mt-2">
                  <p><strong>示例1:</strong> https://api.dicebear.com/7.x/avataaars/svg?seed=test1</p>
                  <p><strong>示例2:</strong> https://api.dicebear.com/7.x/initials/svg?seed=TestUser</p>
                  <p><strong>示例3:</strong> https://files.authing.co/authing-console/default-user-avatar.png</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                <h4 className="font-semibold text-green-800">预期结果</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-700 mt-2">
                  <li>✅ 头像更新后立即在页面显示</li>
                  <li>✅ localStorage同步包含新头像URL</li>
                  <li>✅ 页面重载后头像正确恢复</li>
                  <li>✅ 不会被默认头像覆盖</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded border-l-4 border-red-400">
                <h4 className="font-semibold text-red-800">常见问题</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700 mt-2">
                  <li>❌ 头像更新后重载页面变回默认头像</li>
                  <li>❌ localStorage中头像URL正确但页面显示错误</li>
                  <li>❌ 服务器数据覆盖本地自定义头像</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
