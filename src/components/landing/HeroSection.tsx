/**
 * 首页主视觉区块（极简大标题风格）
 * 参考用户最新设计，纯白背景，大号主标题，圆润按钮，紧凑留白
 * 底部添加渐变过渡层，实现与TrustSection的自然过渡
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';

export const HeroSection: React.FC = () => {
  const { login, isAuthenticated } = useUnifiedAuthContext();
  const navigate = useNavigate();
  
  return (
    <section className="bg-white pt-32 pb-32 text-center relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* 主标题区域 */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
            让内容创作更 <span className="text-blue-600 font-extrabold">智能</span>、更 <span className="text-pink-500 font-extrabold">高效</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI驱动的智能内容适配、创意生成与多平台分发工具
          </p>
        </div>

        {/* 按钮区域 */}
        <div className="mb-16">
          <button 
            onClick={() => {
              console.log('Hero开始创作按钮被点击');
              console.log('当前认证状态:', isAuthenticated);
              
              // 简化跳转逻辑
              if (isAuthenticated) {
                console.log('用户已登录，跳转到适配页面');
                navigate('/adapt');
              } else {
                console.log('用户未登录，保存跳转目标并跳转到登录页面');
                localStorage.setItem('login_redirect_to', '/adapt');
                navigate('/login');
              }
            }}
            className="px-12 py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xl font-semibold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-3xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
          >
            🚀 开始创作
          </button>
        </div>

        {/* 图标区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI智能适配</h3>
            <p className="text-gray-600">一键适配多平台内容格式</p>
          </div>
          <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">创意生成</h3>
            <p className="text-gray-600">智能生成高质量创意内容</p>
          </div>
          <div className="p-8 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border border-pink-200">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">多平台分发</h3>
            <p className="text-gray-600">一键发布到各大社交平台</p>
          </div>
        </div>
      </div>
      
      {/* 渐变过渡层 - 从白色过渡到浅灰色 */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)'
        }}
      />
    </section>
  );
};