/**
 * 按钮样式测试页面
 * 用于验证底部两个按钮的样式一致性
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Users } from 'lucide-react';

const ButtonStyleTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            按钮样式一致性测试
          </h1>
          <p className="text-muted-foreground">
            验证"解锁高级功能"和"立即邀请好友"按钮是否使用统一的设计令牌
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 解锁高级功能按钮测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                解锁高级功能按钮
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">使用专用设计令牌的新样式：</p>
                <Button
                  variant="upgradePremium"
                  size="hero"
                  className="w-full h-14 text-lg rounded-xl"
                >
                  <Crown className="w-5 h-5 mr-3 text-white" />
                  解锁高级功能
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">原始样式（对比）：</p>
                <Button
                  variant="outline"
                  size="hero"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                >
                  <Crown className="w-5 h-5 mr-3" style={{color: '#ffffff !important', fill: '#ffffff !important'}} />
                  解锁高级功能（旧样式）
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 立即邀请好友按钮测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                立即邀请好友按钮
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">使用专用设计令牌的新样式：</p>
                <Button
                  variant="invitePremium"
                  size="hero"
                  className="w-full h-14 text-lg rounded-xl"
                >
                  <Users className="w-5 h-5 mr-3 text-white" />
                  立即邀请好友
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">原始样式（对比）：</p>
                <Button
                  variant="default"
                  size="hero"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  <Users className="w-6 h-6 mr-3" style={{color: '#ffffff !important', fill: '#ffffff !important'}} />
                  立即邀请好友（旧样式）
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 设计令牌说明 */}
        <Card>
          <CardHeader>
            <CardTitle>新的专用设计令牌系统</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">解锁高级功能按钮</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><code className="bg-muted px-2 py-1 rounded">variant="upgradePremium"</code> - 专用升级变体</li>
                  <li><code className="bg-muted px-2 py-1 rounded">--btn-gradient-upgrade</code> - 橙色渐变背景</li>
                  <li><code className="bg-muted px-2 py-1 rounded">--btn-shadow-upgrade</code> - 专用阴影效果</li>
                  <li><code className="bg-muted px-2 py-1 rounded">hover:translateY(-2px)</code> - 悬停上移效果</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">立即邀请好友按钮</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><code className="bg-muted px-2 py-1 rounded">variant="invitePremium"</code> - 专用邀请变体</li>
                  <li><code className="bg-muted px-2 py-1 rounded">--btn-gradient-invite</code> - 紫蓝渐变背景</li>
                  <li><code className="bg-muted px-2 py-1 rounded">--btn-shadow-invite</code> - 专用阴影效果</li>
                  <li><code className="bg-muted px-2 py-1 rounded">hover:translateY(-2px)</code> - 悬停上移效果</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">设计理念</h4>
              <p className="text-sm text-muted-foreground">
                为重要的行动按钮设计了专用的视觉样式，使用渐变背景和增强的阴影效果来提升视觉吸引力和用户体验。
                每个按钮都有独特的颜色主题，但保持一致的交互效果和尺寸规范。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 验证结果 */}
        <Card>
          <CardHeader>
            <CardTitle>新设计系统特性</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">统一高度：h-14 (56px)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">专用渐变背景：橙色系 & 紫蓝系</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">增强阴影效果：带颜色的发光阴影</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">统一圆角：rounded-xl (12px)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">悬停动效：translateY(-2px) + 阴影增强</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">平滑过渡：cubic-bezier(0.4, 0, 0.2, 1)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">白色图标和文字：更好的对比度</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border">
              <h4 className="font-semibold text-foreground mb-2">✨ 视觉提升</h4>
              <p className="text-sm text-muted-foreground">
                新的按钮设计更具视觉吸引力，使用渐变背景和增强的阴影效果，
                同时保持了设计系统的一致性和可维护性。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ButtonStyleTestPage;
