/**
 * 磨砂效果测试页面
 * 展示各种磨砂背景效果的改进
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedPermissionGuard } from '@/components/auth/UnifiedPermissionGuard';
import { PermissionUpgradeDialog } from '@/components/auth/PermissionUpgradeDialog';
import { Lock, Crown, Sparkles, Zap } from 'lucide-react';

export const BlurEffectTestPage: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            磨砂效果测试页面
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            展示各种增强的磨砂背景效果
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 基础卡片 */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                基础磨砂效果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                使用 backdrop-blur-sm 和半透明背景
              </p>
            </CardContent>
          </Card>

          {/* 增强卡片 */}
          <Card 
            className="bg-white/90 border border-white/30"
            style={{
              backdropFilter: 'blur(12px) saturate(150%)',
              WebkitBackdropFilter: 'blur(12px) saturate(150%)'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                增强磨砂效果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                使用 blur(12px) 和饱和度增强
              </p>
            </CardContent>
          </Card>

          {/* 高级卡片 */}
          <Card 
            className="bg-white/95 border border-white/40"
            style={{
              backdropFilter: 'blur(20px) saturate(200%)',
              WebkitBackdropFilter: 'blur(20px) saturate(200%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                高级磨砂效果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                使用 blur(20px) 和高饱和度，加强阴影
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 权限守卫测试区域 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            权限守卫磨砂效果测试
          </h2>
          
          <UnifiedPermissionGuard
            permission="premium_features"
            featureName="高级内容生成"
            description="体验最先进的AI内容创作功能"
            className="rounded-lg"
          >
            <Card className="p-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="text-center">
                <Lock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">高级功能区域</h3>
                <p className="text-lg opacity-90">
                  这里是需要高级权限才能访问的内容区域
                </p>
                <Badge className="mt-4 bg-white/20 text-white">
                  需要 Premium 订阅
                </Badge>
              </div>
            </Card>
          </UnifiedPermissionGuard>
        </div>

        {/* 对话框测试按钮 */}
        <div className="text-center">
          <Button 
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
          >
            测试权限升级对话框
          </Button>
        </div>

        {/* 权限升级对话框 */}
        <PermissionUpgradeDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          featureName="高级内容生成"
          requiredTier="premium"
          description="解锁最先进的AI内容创作功能"
        />
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default BlurEffectTestPage;
