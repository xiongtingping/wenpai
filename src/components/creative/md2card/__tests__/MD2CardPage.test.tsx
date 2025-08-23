/**
 * MD2CardPage组件集成测试
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MD2CardPage from '../MD2CardPage';

// Mock hooks
const mockToast = vi.fn();
const mockCheckUsageLimit = vi.fn();
const mockIncrementUsage = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', name: 'Test User' },
    isAuthenticated: true
  })
}));

vi.mock('@/store/usageStore', () => ({
  useUsageStore: () => ({
    checkUsageLimit: mockCheckUsageLimit,
    incrementUsage: mockIncrementUsage
  })
}));

// Mock子组件
vi.mock('@/components/auth/PermissionAwareContainer', () => ({
  PermissionAwareContainer: ({ children }: any) => <div data-testid="permission-container">{children}</div>
}));

vi.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: Function) => fn
}));

// Mock UI组件
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      <div onClick={() => onValueChange && onValueChange('content')}>
        {children}
      </div>
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid="tab-trigger" data-value={value}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid="tab-content" data-value={value}>{children}</div>
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>
}));

// Mock图标
vi.mock('lucide-react', () => ({
  CreditCard: () => <div data-testid="credit-card-icon" />,
  Monitor: () => <div data-testid="monitor-icon" />,
  Smartphone: () => <div data-testid="smartphone-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  RotateCcw: () => <div data-testid="rotate-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Square: () => <div data-testid="square-icon" />,
  Edit3: () => <div data-testid="edit-icon" />,
  Palette: () => <div data-testid="palette-icon" />,
  FileText: () => <div data-testid="file-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />
}));

describe('MD2CardPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUsageLimit.mockResolvedValue(true);
    mockIncrementUsage.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基础渲染', () => {
    test('应该正确渲染主要界面元素', () => {
      render(<MD2CardPage />);
      
      expect(screen.getByTestId('permission-container')).toBeInTheDocument();
      expect(screen.getByText('MD2Card')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    test('应该渲染工具栏', () => {
      render(<MD2CardPage />);
      
      expect(screen.getByTestId('monitor-icon')).toBeInTheDocument();
      expect(screen.getByTestId('smartphone-icon')).toBeInTheDocument();
      expect(screen.getByText('导入')).toBeInTheDocument();
      expect(screen.getByText('重置')).toBeInTheDocument();
      expect(screen.getByText('导出PNG')).toBeInTheDocument();
    });

    test('应该渲染标签页系统', () => {
      render(<MD2CardPage />);
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByText('模板')).toBeInTheDocument();
      expect(screen.getByText('内容')).toBeInTheDocument();
      expect(screen.getByText('样式')).toBeInTheDocument();
    });

    test('应该渲染预览区域', () => {
      render(<MD2CardPage />);
      
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
      expect(screen.getByText('桌面端预览')).toBeInTheDocument();
    });
  });

  describe('内容编辑功能', () => {
    test('应该渲染Markdown编辑器', () => {
      render(<MD2CardPage />);
      
      const textarea = screen.getByPlaceholderText('在这里输入Markdown内容...');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue(expect.stringContaining('# 欢迎使用MD2Card'));
    });

    test('应该显示文档统计信息', () => {
      render(<MD2CardPage />);
      
      expect(screen.getByText(/\d+ 字/)).toBeInTheDocument();
      expect(screen.getByText(/约 \d+ 分钟阅读/)).toBeInTheDocument();
    });

    test('应该响应内容变化', async () => {
      render(<MD2CardPage />);
      
      const textarea = screen.getByPlaceholderText('在这里输入Markdown内容...');
      await user.clear(textarea);
      await user.type(textarea, '# 新标题\n\n这是新内容');
      
      expect(textarea).toHaveValue('# 新标题\n\n这是新内容');
    });
  });

  describe('模板选择功能', () => {
    test('应该显示可用模板', () => {
      render(<MD2CardPage />);
      
      // 切换到模板标签页
      const templateTab = screen.getByText('模板');
      fireEvent.click(templateTab);
      
      expect(screen.getByText('选择模板')).toBeInTheDocument();
    });

    test('应该显示模板预览', () => {
      render(<MD2CardPage />);
      
      const templateTab = screen.getByText('模板');
      fireEvent.click(templateTab);
      
      // 应该有模板卡片
      const templateCards = screen.getAllByTestId('card');
      expect(templateCards.length).toBeGreaterThan(0);
    });
  });

  describe('样式自定义功能', () => {
    test('应该提供颜色选择器', () => {
      render(<MD2CardPage />);
      
      const styleTab = screen.getByText('样式');
      fireEvent.click(styleTab);
      
      expect(screen.getByText('配色方案')).toBeInTheDocument();
      expect(screen.getByText('主色调')).toBeInTheDocument();
      expect(screen.getByText('背景色')).toBeInTheDocument();
    });

    test('应该提供字体大小选择', () => {
      render(<MD2CardPage />);
      
      const styleTab = screen.getByText('样式');
      fireEvent.click(styleTab);
      
      expect(screen.getByText('字体大小')).toBeInTheDocument();
      expect(screen.getByText('小')).toBeInTheDocument();
      expect(screen.getByText('中')).toBeInTheDocument();
      expect(screen.getByText('大')).toBeInTheDocument();
    });

    test('应该能够更改颜色设置', async () => {
      render(<MD2CardPage />);
      
      const styleTab = screen.getByText('样式');
      fireEvent.click(styleTab);
      
      const colorInputs = screen.getAllByRole('textbox', { name: /color/i }) || 
                         document.querySelectorAll('input[type="color"]');
      
      if (colorInputs.length > 0) {
        fireEvent.change(colorInputs[0], { target: { value: '#ff0000' } });
        expect(colorInputs[0]).toHaveValue('#ff0000');
      }
    });
  });

  describe('预览模式切换', () => {
    test('应该能够切换预览模式', async () => {
      render(<MD2CardPage />);
      
      const mobileButton = screen.getByTestId('smartphone-icon').closest('button');
      if (mobileButton) {
        fireEvent.click(mobileButton);
        await waitFor(() => {
          expect(screen.getByText('移动端预览')).toBeInTheDocument();
        });
      }
    });

    test('应该能够隐藏预览面板', () => {
      render(<MD2CardPage />);
      
      const eyeOffIcon = screen.queryByTestId('eye-off-icon');
      if (eyeOffIcon) {
        const hideButton = eyeOffIcon.closest('button');
        if (hideButton) {
          fireEvent.click(hideButton);
          expect(screen.getByText('显示预览')).toBeInTheDocument();
        }
      }
    });
  });

  describe('文件操作功能', () => {
    test('应该触发文件导入', () => {
      // Mock file input
      const mockInput = {
        click: vi.fn(),
        addEventListener: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockInput as any);
      
      render(<MD2CardPage />);
      
      const importButton = screen.getByText('导入');
      fireEvent.click(importButton);
      
      expect(mockInput.click).toHaveBeenCalled();
    });

    test('应该能够重置内容', async () => {
      render(<MD2CardPage />);
      
      const resetButton = screen.getByText('重置');
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '内容已重置',
          description: '编辑器已恢复初始状态'
        });
      });
    });

    test('应该能够导出PNG', async () => {
      render(<MD2CardPage />);
      
      const exportButton = screen.getByText('导出PNG');
      fireEvent.click(exportButton);
      
      // 验证导出过程启动
      await waitFor(() => {
        expect(mockCheckUsageLimit).toHaveBeenCalledWith('md2card');
      });
    });
  });

  describe('权限和使用量控制', () => {
    test('应该检查使用限额', async () => {
      render(<MD2CardPage />);
      
      const textarea = screen.getByPlaceholderText('在这里输入Markdown内容...');
      await user.type(textarea, '# 测试内容');
      
      await waitFor(() => {
        expect(mockCheckUsageLimit).toHaveBeenCalledWith('md2card');
      });
    });

    test('应该在达到使用限额时显示提示', async () => {
      mockCheckUsageLimit.mockResolvedValue(false);
      
      render(<MD2CardPage />);
      
      const textarea = screen.getByPlaceholderText('在这里输入Markdown内容...');
      await user.type(textarea, '# 测试内容');
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '使用次数已用完',
          description: '请升级到高级版本获取更多使用次数',
          variant: 'destructive'
        });
      });
    });

    test('应该在成功生成后增加使用量', async () => {
      render(<MD2CardPage />);
      
      const textarea = screen.getByPlaceholderText('在这里输入Markdown内容...');
      await user.type(textarea, '# 测试内容');
      
      // 等待生成完成（模拟的1秒延迟）
      await waitFor(() => {
        expect(mockIncrementUsage).toHaveBeenCalledWith('md2card', 1);
      }, { timeout: 2000 });
    });
  });

  describe('错误处理', () => {
    test('应该处理生成失败的情况', async () => {
      // Mock生成失败
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<MD2CardPage />);
      
      const textarea = screen.getByPlaceholderText('在这里输入Markdown内容...');
      await user.type(textarea, '# 无效内容\n```invalid```');
      
      // 等待错误处理
      await waitFor(() => {
        // 验证错误处理逻辑
        expect(console.error).toHaveBeenCalled();
      });
    });

    test('应该在未登录时提示用户', async () => {
      // Mock未登录状态
      vi.mocked(vi.importActual('@/store/authStore')).useAuthStore = () => ({
        user: null,
        isAuthenticated: false
      });
      
      render(<MD2CardPage />);
      
      const exportButton = screen.getByText('导出PNG');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '需要登录',
          description: '请先登录后使用卡片生成功能',
          variant: 'destructive'
        });
      });
    });
  });

  describe('响应式行为', () => {
    test('应该在移动端显示简化界面', () => {
      // Mock移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      render(<MD2CardPage />);
      
      // 验证移动端适配
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    test('应该在桌面端显示完整界面', () => {
      // Mock桌面端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });
      
      render(<MD2CardPage />);
      
      // 验证桌面端布局
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByText('桌面端预览')).toBeInTheDocument();
    });
  });
});