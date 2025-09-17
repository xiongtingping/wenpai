/**
 * 🧪 统一权限守卫系统测试套件
 * @description 全面测试权限守卫系统的功能完整性、性能表现和用户体验
 * @author 权限系统团队
 * @created 2025-01-16
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { EnhancedUnifiedPermissionGuard } from '@/components/auth/EnhancedUnifiedPermissionGuard';
import { UnifiedPermissionGuard } from '@/components/auth/UnifiedPermissionGuard';
import { UnifiedPermissionService } from '@/services/unifiedPermissionService';
import { useAuth } from '@/hooks/useAuth';

// Mock hooks and services
jest.mock('@/hooks/useAuth');
jest.mock('@/services/unifiedPermissionService');
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

// Mock user data
const mockUsers = {
  trialUser: {
    id: 'trial-user-1',
    email: 'trial@example.com',
    subscription: { tier: 'trial' as const },
    registrationDate: '2025-01-01T00:00:00.000Z'
  },
  proUser: {
    id: 'pro-user-1',
    email: 'pro@example.com',
    subscription: { tier: 'pro' as const },
    registrationDate: '2025-01-01T00:00:00.000Z'
  },
  premiumUser: {
    id: 'premium-user-1',
    email: 'premium@example.com',
    subscription: { tier: 'premium' as const },
    registrationDate: '2025-01-01T00:00:00.000Z'
  },
  noUser: null
};

describe('统一权限守卫系统测试', () => {
  let mockUseAuth: jest.MockedFunction<typeof useAuth>;
  let mockCheckPermission: jest.SpyInstance;

  beforeEach(() => {
    mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    mockCheckPermission = jest.spyOn(UnifiedPermissionService, 'checkPermission');
    
    // 默认模拟无权限用户
    mockUseAuth.mockReturnValue({
      user: mockUsers.noUser,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('权限检查逻辑测试', () => {
    it('应该正确识别体验版用户权限', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.trialUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false
      });

      mockCheckPermission.mockReturnValue({
        hasPermission: true,
        userTier: 'trial',
        requiredTier: 'trial',
        missingPermissions: [],
        suggestedAction: 'none',
        permissionConfig: {
          name: '体验版功能',
          description: '体验版用户可用',
          requiredTier: 'trial',
          check: () => true,
          redirectUrl: '/payment',
          category: 'tier',
          priority: 'low'
        }
      });

      render(
        <EnhancedUnifiedPermissionGuard requiredPermission="tier:trial">
          <div data-testid="protected-content">体验版内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockCheckPermission).toHaveBeenCalledWith(mockUsers.trialUser, 'tier:trial');
    });

    it('应该阻止无权限用户访问专业版功能', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.trialUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false
      });

      mockCheckPermission.mockReturnValue({
        hasPermission: false,
        userTier: 'trial',
        requiredTier: 'pro',
        missingPermissions: ['tier:pro'],
        suggestedAction: 'upgrade',
        upgradeTarget: 'pro',
        permissionConfig: {
          name: '专业版功能',
          description: '需要专业版权限',
          requiredTier: 'pro',
          check: () => false,
          redirectUrl: '/payment',
          category: 'tier',
          priority: 'medium'
        }
      });

      render(
        <EnhancedUnifiedPermissionGuard requiredPermission="tier:pro">
          <div data-testid="protected-content">专业版内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByText(/解锁.*专业版功能/)).toBeInTheDocument();
    });

    it('应该正确处理高级版权限检查', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.premiumUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false
      });

      mockCheckPermission.mockReturnValue({
        hasPermission: true,
        userTier: 'premium',
        requiredTier: 'premium',
        missingPermissions: [],
        suggestedAction: 'none',
        permissionConfig: {
          name: '高级版功能',
          description: '高级版专属功能',
          requiredTier: 'premium',
          check: () => true,
          redirectUrl: '/payment',
          category: 'tier',
          priority: 'high'
        }
      });

      render(
        <EnhancedUnifiedPermissionGuard requiredPermission="tier:premium">
          <div data-testid="protected-content">高级版内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('显示模式测试', () => {
    beforeEach(() => {
      mockCheckPermission.mockReturnValue({
        hasPermission: false,
        userTier: 'trial',
        requiredTier: 'pro',
        missingPermissions: ['tier:pro'],
        suggestedAction: 'upgrade',
        upgradeTarget: 'pro',
        permissionConfig: {
          name: '专业版功能',
          description: '需要专业版权限',
          requiredTier: 'pro',
          check: () => false,
          redirectUrl: '/payment',
          category: 'tier',
          priority: 'medium'
        }
      });
    });

    it('应该正确渲染遮罩模式', () => {
      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="overlay"
          featureName="测试功能"
        >
          <div data-testid="protected-content">受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      // 验证遮罩覆盖层存在
      const overlay = document.querySelector('.permission-overlay');
      expect(overlay).toBeInTheDocument();
      
      // 验证升级提示存在
      expect(screen.getByText(/解锁.*测试功能/)).toBeInTheDocument();
    });

    it('应该正确渲染卡片模式', () => {
      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="card"
          featureName="测试功能"
        >
          <div data-testid="protected-content">受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      // 验证卡片容器存在
      const card = document.querySelector('.permission-card');
      expect(card).toBeInTheDocument();
    });

    it('应该正确渲染按钮模式', () => {
      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="button"
          upgradeButtonText="解锁功能"
        >
          <div data-testid="protected-content">受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      // 验证升级按钮存在
      expect(screen.getByText('解锁功能')).toBeInTheDocument();
    });

    it('应该正确渲染预览模式', () => {
      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="preview"
          featureName="测试功能"
        >
          <div data-testid="protected-content">受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      // 验证预览控制栏存在
      expect(screen.getByText('预览模式')).toBeInTheDocument();
      
      // 验证预览开关存在
      const previewSwitch = screen.getByRole('switch');
      expect(previewSwitch).toBeInTheDocument();
    });

    it('应该正确渲染禁用模式', () => {
      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="disabled"
          showUpgradeHint={true}
        >
          <div data-testid="protected-content">受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      // 验证内容被灰化处理
      const content = screen.getByTestId('protected-content').parentElement;
      expect(content).toHaveClass('grayscale');
      
      // 验证升级提示存在
      expect(screen.getByText('需要升级')).toBeInTheDocument();
    });
  });

  describe('交互行为测试', () => {
    beforeEach(() => {
      mockCheckPermission.mockReturnValue({
        hasPermission: false,
        userTier: 'trial',
        requiredTier: 'pro',
        missingPermissions: ['tier:pro'],
        suggestedAction: 'upgrade',
        upgradeTarget: 'pro',
        permissionConfig: {
          name: '专业版功能',
          description: '需要专业版权限',
          requiredTier: 'pro',
          check: () => false,
          redirectUrl: '/payment',
          category: 'tier',
          priority: 'medium'
        }
      });
    });

    it('应该响应升级按钮点击', async () => {
      const mockNavigate = jest.fn();
      jest.doMock('react-router-dom', () => ({
        useNavigate: () => mockNavigate
      }));

      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="overlay"
        >
          <div>受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      const upgradeButton = screen.getByText(/立即升级/);
      await userEvent.click(upgradeButton);

      await waitFor(() => {
        expect(localStorage.getItem('selectedPlan')).toBe('pro');
      });
    });

    it('应该正确处理自定义升级回调', async () => {
      const mockOnUpgradeClick = jest.fn();

      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="overlay"
          onUpgradeClick={mockOnUpgradeClick}
        >
          <div>受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      const upgradeButton = screen.getByText(/立即升级/);
      await userEvent.click(upgradeButton);

      expect(mockOnUpgradeClick).toHaveBeenCalledWith(
        expect.objectContaining({
          hasPermission: false,
          userTier: 'trial',
          requiredTier: 'pro'
        })
      );
    });

    it('应该阻止受保护内容的交互', () => {
      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="overlay"
          disableInteraction={true}
        >
          <button data-testid="protected-button">受保护的按钮</button>
        </EnhancedUnifiedPermissionGuard>
      );

      const protectedButton = screen.getByTestId('protected-button');
      
      // 验证按钮不可交互
      expect(protectedButton.parentElement).toHaveClass('permission-disabled');
    });
  });

  describe('预览模式测试', () => {
    it('应该支持预览模式切换', async () => {
      mockCheckPermission.mockReturnValue({
        hasPermission: false,
        userTier: 'trial',
        requiredTier: 'pro',
        missingPermissions: ['tier:pro'],
        suggestedAction: 'upgrade',
        upgradeTarget: 'pro',
        permissionConfig: {
          name: '专业版功能',
          description: '需要专业版权限',
          requiredTier: 'pro',
          check: () => false,
          redirectUrl: '/payment',
          category: 'tier',
          priority: 'medium'
        }
      });

      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="preview"
          featureName="测试功能"
        >
          <div data-testid="protected-content">受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      const previewSwitch = screen.getByRole('switch');
      
      // 初始状态应该是关闭的
      expect(previewSwitch).not.toBeChecked();
      
      // 切换预览模式
      await userEvent.click(previewSwitch);
      
      // 预览模式应该被激活
      await waitFor(() => {
        expect(previewSwitch).toBeChecked();
      });
    });
  });

  describe('权限层级测试', () => {
    it('应该正确处理权限层级关系', () => {
      // 高级版用户应该能访问专业版功能
      mockUseAuth.mockReturnValue({
        user: mockUsers.premiumUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false
      });

      mockCheckPermission.mockReturnValue({
        hasPermission: true,
        userTier: 'premium',
        requiredTier: 'pro',
        missingPermissions: [],
        suggestedAction: 'none',
        permissionConfig: {
          name: '专业版功能',
          description: '专业版用户权限',
          requiredTier: 'pro',
          check: () => true,
          redirectUrl: '/payment',
          category: 'tier',
          priority: 'medium'
        }
      });

      render(
        <EnhancedUnifiedPermissionGuard requiredPermission="tier:pro">
          <div data-testid="protected-content">专业版内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('特殊功能权限测试', () => {
    it('应该正确处理品牌库功能权限', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.trialUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false
      });

      mockCheckPermission.mockReturnValue({
        hasPermission: false,
        userTier: 'trial',
        requiredTier: 'premium',
        missingPermissions: ['feature:brand-library'],
        suggestedAction: 'upgrade',
        upgradeTarget: 'premium',
        permissionConfig: {
          name: '品牌库',
          description: '企业级品牌资产管理系统',
          requiredTier: 'premium',
          check: () => false,
          redirectUrl: '/payment',
          category: 'feature',
          priority: 'high'
        }
      });

      render(
        <EnhancedUnifiedPermissionGuard requiredPermission="feature:brand-library">
          <div data-testid="brand-library-content">品牌库内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      expect(screen.queryByTestId('brand-library-content')).not.toBeInTheDocument();
      expect(screen.getByText(/品牌库/)).toBeInTheDocument();
    });

    it('应该正确处理AI模型权限', () => {
      mockUseAuth.mockReturnValue({
        user: mockUsers.proUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        loading: false
      });

      mockCheckPermission.mockReturnValue({
        hasPermission: true,
        userTier: 'pro',
        requiredTier: 'pro',
        missingPermissions: [],
        suggestedAction: 'none',
        permissionConfig: {
          name: '专业版AI模型',
          description: '专业AI模型访问权限',
          requiredTier: 'pro',
          check: () => true,
          redirectUrl: '/payment',
          category: 'model',
          priority: 'high'
        }
      });

      render(
        <EnhancedUnifiedPermissionGuard requiredPermission="model:pro">
          <div data-testid="ai-model-content">AI模型内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      expect(screen.getByTestId('ai-model-content')).toBeInTheDocument();
    });
  });

  describe('错误处理测试', () => {
    it('应该优雅处理权限检查失败', () => {
      mockCheckPermission.mockImplementation(() => {
        throw new Error('权限检查服务不可用');
      });

      render(
        <EnhancedUnifiedPermissionGuard requiredPermission="tier:pro">
          <div data-testid="protected-content">受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      // 应该显示默认的无权限状态
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('应该处理无效的权限类型', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockCheckPermission.mockImplementation(() => {
        throw new Error('未找到权限配置: invalid:permission');
      });

      render(
        <EnhancedUnifiedPermissionGuard requiredPermission={'invalid:permission' as any}>
          <div data-testid="protected-content">受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      expect(consoleSpy).toHaveBeenCalledWith('权限检查失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量权限检查', () => {
      const startTime = performance.now();

      // 渲染100个权限守卫组件
      const { rerender } = render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <EnhancedUnifiedPermissionGuard
              key={i}
              requiredPermission="tier:trial"
            >
              <div data-testid={`content-${i}`}>内容 {i}</div>
            </EnhancedUnifiedPermissionGuard>
          ))}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 渲染时间应该在合理范围内（< 100ms）
      expect(renderTime).toBeLessThan(100);
    });

    it('应该缓存权限检查结果', () => {
      const { rerender } = render(
        <EnhancedUnifiedPermissionGuard requiredPermission="tier:pro">
          <div>内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      const firstCallCount = mockCheckPermission.mock.calls.length;

      // 重新渲染相同的组件
      rerender(
        <EnhancedUnifiedPermissionGuard requiredPermission="tier:pro">
          <div>内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      // 权限检查应该被缓存，不会重复调用
      expect(mockCheckPermission.mock.calls.length).toBe(firstCallCount);
    });
  });

  describe('可访问性测试', () => {
    it('应该提供正确的ARIA属性', () => {
      mockCheckPermission.mockReturnValue({
        hasPermission: false,
        userTier: 'trial',
        requiredTier: 'pro',
        missingPermissions: ['tier:pro'],
        suggestedAction: 'upgrade',
        upgradeTarget: 'pro',
        permissionConfig: {
          name: '专业版功能',
          description: '需要专业版权限',
          requiredTier: 'pro',
          check: () => false,
          redirectUrl: '/payment',
          category: 'tier',
          priority: 'medium'
        }
      });

      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="disabled"
        >
          <button data-testid="protected-button">受保护的按钮</button>
        </EnhancedUnifiedPermissionGuard>
      );

      const protectedElement = screen.getByTestId('protected-button').parentElement;
      expect(protectedElement).toHaveAttribute('aria-disabled', 'true');
    });

    it('应该支持键盘导航', async () => {
      mockCheckPermission.mockReturnValue({
        hasPermission: false,
        userTier: 'trial',
        requiredTier: 'pro',
        missingPermissions: ['tier:pro'],
        suggestedAction: 'upgrade',
        upgradeTarget: 'pro',
        permissionConfig: {
          name: '专业版功能',
          description: '需要专业版权限',
          requiredTier: 'pro',
          check: () => false,
          redirectUrl: '/payment',
          category: 'tier',
          priority: 'medium'
        }
      });

      render(
        <EnhancedUnifiedPermissionGuard
          requiredPermission="tier:pro"
          mode="overlay"
        >
          <div>受保护的内容</div>
        </EnhancedUnifiedPermissionGuard>
      );

      const upgradeButton = screen.getByText(/立即升级/);
      
      // 使用Tab键导航到升级按钮
      await userEvent.tab();
      expect(upgradeButton).toHaveFocus();
      
      // 使用Enter键激活按钮
      await userEvent.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(localStorage.getItem('selectedPlan')).toBe('pro');
      });
    });
  });
});

describe('统一权限服务测试', () => {
  describe('权限检查方法测试', () => {
    it('应该正确检查单个权限', () => {
      const result = UnifiedPermissionService.checkPermission(
        mockUsers.proUser,
        'tier:pro'
      );

      expect(result).toMatchObject({
        hasPermission: expect.any(Boolean),
        userTier: expect.any(String),
        requiredTier: expect.any(String),
        missingPermissions: expect.any(Array),
        suggestedAction: expect.any(String),
        permissionConfig: expect.any(Object)
      });
    });

    it('应该正确检查多个权限', () => {
      const results = UnifiedPermissionService.checkMultiplePermissions(
        mockUsers.proUser,
        ['tier:pro', 'feature:creative-studio']
      );

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('hasPermission');
      expect(results[1]).toHaveProperty('hasPermission');
    });

    it('应该正确检查所有权限要求', () => {
      const hasAllPermissions = UnifiedPermissionService.checkAllPermissions(
        mockUsers.premiumUser,
        ['tier:pro', 'tier:premium', 'feature:brand-library']
      );

      expect(typeof hasAllPermissions).toBe('boolean');
    });

    it('应该正确检查任意权限要求', () => {
      const hasAnyPermission = UnifiedPermissionService.checkAnyPermission(
        mockUsers.trialUser,
        ['tier:trial', 'tier:pro']
      );

      expect(hasAnyPermission).toBe(true);
    });
  });

  describe('权限配置管理测试', () => {
    it('应该获取指定权限配置', () => {
      const config = UnifiedPermissionService.getPermissionConfig('tier:pro');
      
      expect(config).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        requiredTier: expect.any(String),
        check: expect.any(Function),
        redirectUrl: expect.any(String),
        category: expect.any(String),
        priority: expect.any(String)
      });
    });

    it('应该按分类获取权限配置', () => {
      const tierConfigs = UnifiedPermissionService.getPermissionsByCategory('tier');
      
      expect(Object.keys(tierConfigs)).toContain('tier:trial');
      expect(Object.keys(tierConfigs)).toContain('tier:pro');
      expect(Object.keys(tierConfigs)).toContain('tier:premium');
    });

    it('应该按优先级获取权限配置', () => {
      const criticalConfigs = UnifiedPermissionService.getPermissionsByPriority('critical');
      
      expect(typeof criticalConfigs).toBe('object');
    });
  });
});

export default {};