/**
 * 个人中心页面 - 简洁设计版
 * 采用左右两栏布局：账号信息 + 使用统计
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/userStore';
import { LogOut, Crown } from 'lucide-react';
import PageNavigation from '@/components/layout/PageNavigation';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const { usageRemaining } = useUserStore();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    try { 
      await logout(); 
      navigate('/'); 
    } catch (err) {
      toast({ title: "登出失败", description: "请重试", variant: "destructive" });
    }
  };

  const handleUpgrade = () => {
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation title="个人中心" description="管理您的账户信息和使用统计" showAdaptButton={false} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')} 
            className="hover:bg-gray-100 text-gray-600 -ml-2"
          >
            返回首页
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* 左边 - 账号信息 */}
          <div className="rounded-xl bg-white shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold">账号信息</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>用户ID</span>
                <span className="font-mono">temp-user-id</span>
              </div>
              <div className="flex justify-between">
                <span>账户类型</span>
                <span className="badge">体验版</span>
              </div>
              <div className="flex justify-between">
                <span>可用次数</span>
                <span className="text-green-600 font-bold">{usageRemaining} 次</span>
              </div>
              <div className="flex justify-between">
                <span>Token限制</span>
                <span className="bg-gray-100 text-blue-600 px-2 py-1 rounded">100,000 tokens</span>
              </div>
              <div className="flex justify-between">
                <span>注册时间</span>
                <span>2025/7/12</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 transition-colors"
            >
              退出登录
            </button>
          </div>

          {/* 右边 - 使用统计 */}
          <div className="rounded-xl bg-white shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold">使用统计</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>使用次数</span>
                <span>3/10</span>
              </div>
              <div className="flex justify-between">
                <span>Token使用量</span>
                <span>25,000 / 100,000</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-purple-100 text-purple-800 text-center py-4">
                <div className="text-2xl font-bold">45分钟</div>
                <div className="text-xs">已节省时间</div>
              </div>
              <div className="rounded-lg bg-green-100 text-green-800 text-center py-4">
                <div className="text-2xl font-bold">3份</div>
                <div className="text-xs">已生成内容</div>
              </div>
            </div>
            <button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded shadow-md hover:opacity-90 transition-opacity"
            >
              升级专业版
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 