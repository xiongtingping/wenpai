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
import { LogOut, Crown, Copy as CopyIcon } from 'lucide-react';
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-0">
          {/* 账号信息卡片 */}
          <div className="p-6 rounded-xl shadow-sm bg-white flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">账号信息</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">用户ID</span>
                <span className="font-mono text-gray-700">temp-user-id</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">账户类型</span>
                <span className="inline-flex items-center bg-gray-100 text-blue-600 px-2 py-0.5 rounded font-semibold">体验版</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">可用次数</span>
                <span className="font-bold text-lg text-green-600">10 次</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">Token限制</span>
                <span className="bg-gray-100 text-blue-600 px-2 py-0.5 rounded font-semibold">100,000 tokens</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">注册时间</span>
                <span>2025/7/12</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full bg-red-100 text-red-600 py-2 rounded-lg font-semibold mt-2 hover:bg-red-200 transition-colors"
            >
              退出登录
            </button>
          </div>

          {/* 使用统计卡片 */}
          <div className="p-6 rounded-xl shadow-sm bg-white flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">使用统计</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">使用次数</span>
                <span className="font-bold text-lg text-blue-700">3/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">Token使用量</span>
                <span className="font-bold text-lg text-purple-700">25,000 / 100,000</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-purple-100 text-purple-800 rounded-lg flex flex-col items-center justify-center py-6">
                <div className="text-2xl font-bold mb-1">45分钟</div>
                <div className="text-xs">已节省时间</div>
              </div>
              <div className="bg-green-100 text-green-800 rounded-lg flex flex-col items-center justify-center py-6">
                <div className="text-2xl font-bold mb-1">3份</div>
                <div className="text-xs">已生成内容</div>
              </div>
            </div>
            <button 
              onClick={handleUpgrade}
              className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-md hover:opacity-90 active:opacity-80 transition-opacity inline-flex items-center justify-center"
            >
              升级专业版
            </button>
          </div>
        </div>

        {/* 邀请好友模块 */}
        <div className="mt-10">
          {/* 顶部Banner */}
          <div className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 p-6 text-white shadow-md flex items-center space-x-4">
            <div className="flex-shrink-0 text-3xl">🎁</div>
            <div>
              <div className="text-xl font-bold">邀请好友，轻松得奖励</div>
              <div className="text-sm opacity-80">每邀请 1 人注册，双方各得 20 次机会</div>
            </div>
          </div>

          {/* 中部三项数据 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-100 text-blue-700 rounded-lg p-4 text-center">
              <div className="text-xs">双方各得</div>
              <div className="text-2xl font-bold">20 次</div>
            </div>
            <div className="bg-green-100 text-green-700 rounded-lg p-4 text-center">
              <div className="text-xs">有效期</div>
              <div className="text-2xl font-bold">永久</div>
            </div>
            <div className="bg-purple-100 text-purple-700 rounded-lg p-4 text-center">
              <div className="text-xs">成功邀请</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>

          {/* 邀请方式区 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">推荐码</label>
              <div className="flex items-center border rounded px-2 py-1 bg-white">
                <input readOnly className="flex-1 text-sm truncate bg-transparent outline-none" value="temp-user-id" />
                <button className="flex items-center text-blue-600 hover:underline text-xs ml-2">
                  <CopyIcon className="w-4 h-4 mr-1" />复制
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">邀请链接</label>
              <div className="flex items-center border rounded px-2 py-1 bg-white">
                <input readOnly className="flex-1 text-sm truncate bg-transparent outline-none" value="https://xxx.netlify.app?ref=xxx" />
                <button className="flex items-center text-blue-600 hover:underline text-xs ml-2">
                  <CopyIcon className="w-4 h-4 mr-1" />复制
                </button>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <button className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-md hover:opacity-90 active:opacity-80 transition-opacity">
            立即邀请好友
          </button>
        </div>
      </div>
    </div>
  );
} 