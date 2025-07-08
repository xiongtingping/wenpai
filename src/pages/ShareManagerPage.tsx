/**
 * 一键转发管理页面
 * 支持内容批量分发到多个社交媒体平台
 */

import React from 'react';
import PageNavigation from '@/components/layout/PageNavigation';
import ShareManager from '@/components/creative/ShareManager';
import { Share2, Zap, TrendingUp } from 'lucide-react';

/**
 * 一键转发管理页面组件
 */
const ShareManagerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="一键转发"
        description="智能内容分发，一键发布到多个社交媒体平台"
        actions={
          <div className="flex gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>支持8个平台</span>
            </div>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <ShareManager />
      </div>
    </div>
  );
};

export default ShareManagerPage; 