/**
 * 简单按钮测试页面
 * 用于验证按钮样式是否正确应用
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Users } from 'lucide-react';

const ButtonTestSimplePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            按钮样式测试
          </h1>
          <p className="text-muted-foreground">
            验证渐变按钮样式是否正确应用
          </p>
        </div>

        <div className="space-y-6">
          {/* 解锁高级功能按钮 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">解锁高级功能按钮</h2>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">使用 btn-upgrade-force 类：</p>
              <Button
                variant="ghost"
                size="hero"
                className="w-full h-14 text-lg rounded-xl btn-upgrade-force"
              >
                <Crown className="w-5 h-5 mr-3" style={{ color: 'white' }} />
                解锁高级功能
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">直接内联样式：</p>
              <button
                className="w-full h-14 text-lg rounded-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3), 0 4px 16px rgba(255, 107, 53, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #e55a2b 0%, #de7f0f 50%, #e57a32 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 107, 53, 0.4), 0 6px 20px rgba(255, 107, 53, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 107, 53, 0.3), 0 4px 16px rgba(255, 107, 53, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Crown className="w-5 h-5 mr-3" style={{ color: 'white' }} />
                解锁高级功能（原生按钮）
              </button>
            </div>
          </div>

          {/* 立即邀请好友按钮 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">立即邀请好友按钮</h2>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">使用 btn-invite-force 类：</p>
              <Button
                variant="ghost"
                size="hero"
                className="w-full h-14 text-lg rounded-xl btn-invite-force"
              >
                <Users className="w-5 h-5 mr-3" style={{ color: 'white' }} />
                立即邀请好友
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">直接内联样式：</p>
              <button
                className="w-full h-14 text-lg rounded-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8b5fbf 100%)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(102, 126, 234, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 50%, #7d54ad 100%)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4), 0 6px 20px rgba(102, 126, 234, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8b5fbf 100%)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(102, 126, 234, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Users className="w-5 h-5 mr-3" style={{ color: 'white' }} />
                立即邀请好友（原生按钮）
              </button>
            </div>
          </div>

          {/* 调试信息 */}
          <div className="mt-8 p-4 bg-accent rounded-lg">
            <h3 className="font-semibold mb-2">调试信息</h3>
            <p className="text-sm text-muted-foreground mb-2">
              如果上面的按钮显示了渐变背景，说明样式正常工作。
            </p>
            <p className="text-sm text-muted-foreground">
              如果按钮仍然是单色，可能是CSS加载或优先级问题。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonTestSimplePage;
