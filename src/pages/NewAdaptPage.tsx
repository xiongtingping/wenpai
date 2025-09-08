/**
 * 新版内容适配器页面
 * 使用模块化组件架构
 */

import React from 'react';
import ContentAdapterPage from '@/features/content-adapter/components/ContentAdapterPage';

const NewAdaptPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <ContentAdapterPage />
    </div>
  );
};

export default NewAdaptPage;
