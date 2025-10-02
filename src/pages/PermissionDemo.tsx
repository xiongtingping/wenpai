/**
 * 权限系统演示页面
 * @description 展示OptimizedPermissionGuard和CompactPermissionCard的使用方法
 * @created 2025-10-02
 */

import React from 'react';
import { OptimizedPermissionGuard } from '@/components/auth/OptimizedPermissionGuard';
import { CompactPermissionCard } from '@/components/auth/CompactPermissionCard';

export const PermissionDemo: React.FC = () => {
  return (
    <div className="permission-demo-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>订阅权限系统演示</h1>

      {/* 示例1: 保护按钮 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>示例1: 保护单个按钮</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          免费用户点击时会看到升级提示，Pro用户可以正常使用
        </p>

        <OptimizedPermissionGuard
          requiredPermission="feature:creative-studio"
          featureName="创意工作室"
          showOverlay={false}
        >
          <button
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🎨 打开创意工作室
          </button>
        </OptimizedPermissionGuard>
      </section>

      {/* 示例2: 保护功能区域 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>示例2: 保护整个功能区域</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          免费用户看到模糊内容 + 升级卡片覆盖层
        </p>

        <OptimizedPermissionGuard
          requiredPermission="tier:pro"
          featureName="高级分析面板"
          showOverlay={true}
        >
          <div
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <h3>📊 数据分析面板</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>1,234</div>
                <div style={{ color: '#666', marginTop: '0.5rem' }}>总访问量</div>
              </div>
              <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#764ba2' }}>567</div>
                <div style={{ color: '#666', marginTop: '0.5rem' }}>活跃用户</div>
              </div>
              <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f093fb' }}>89%</div>
                <div style={{ color: '#666', marginTop: '0.5rem' }}>转化率</div>
              </div>
            </div>
          </div>
        </OptimizedPermissionGuard>
      </section>

      {/* 示例3: Premium功能 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>示例3: Premium专属功能</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          需要Premium版本才能访问
        </p>

        <OptimizedPermissionGuard
          requiredPermission="tier:premium"
          featureName="品牌资源库"
          showOverlay={true}
        >
          <div
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <h3>🎨 品牌资源库</h3>
            <p style={{ marginTop: '1rem', color: '#333' }}>
              管理您的品牌素材、Logo、配色方案和设计规范...
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#ff6b6b', color: 'white' }}>
                上传Logo
              </button>
              <button style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#4ecdc4', color: 'white' }}>
                管理色板
              </button>
              <button style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#ffe66d', color: '#333' }}>
                设计规范
              </button>
            </div>
          </div>
        </OptimizedPermissionGuard>
      </section>

      {/* 示例4: 独立使用CompactPermissionCard */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>示例4: 独立升级卡片</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          CompactPermissionCard可以单独使用在任何需要升级提示的地方
        </p>

        <CompactPermissionCard
          featureName="AI内容生成"
          description="使用先进的AI模型生成高质量营销文案"
          requiredTier="pro"
          showDiscount={true}
          discountCountdown={1800000} // 30分钟倒计时
          onUpgrade={() => {
            console.log('用户点击了升级按钮');
            alert('跳转到升级页面...');
          }}
        />
      </section>

      {/* 使用说明 */}
      <section style={{
        marginTop: '3rem',
        padding: '2rem',
        background: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }}>
        <h2>💡 使用说明</h2>

        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>基础用法</h3>
          <pre style={{
            background: '#fff',
            padding: '1rem',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '0.9rem'
          }}>
{`<OptimizedPermissionGuard
  requiredPermission="tier:pro"
  featureName="功能名称"
  showOverlay={true}
>
  <YourComponent />
</OptimizedPermissionGuard>`}
          </pre>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>可用权限类型</h3>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><code>tier:trial</code> - 体验版</li>
            <li><code>tier:pro</code> - 专业版</li>
            <li><code>tier:premium</code> - 高级版</li>
            <li><code>feature:creative-studio</code> - 创意工作室</li>
            <li><code>feature:brand-library</code> - 品牌资源库</li>
            <li><code>feature:advanced-models</code> - 高级AI模型</li>
          </ul>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>参数说明</h3>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><code>requiredPermission</code> - 必需，所需权限类型</li>
            <li><code>featureName</code> - 必需，功能名称（显示在升级卡片中）</li>
            <li><code>showOverlay</code> - 可选，是否显示覆盖层（默认true）</li>
            <li><code>description</code> - 可选，功能描述</li>
            <li><code>onUpgrade</code> - 可选，升级按钮点击回调</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default PermissionDemo;
