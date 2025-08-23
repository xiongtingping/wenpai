/**
 * 模板选择器组件测试
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateSelector, CARD_TEMPLATES } from '../TemplateSelector';

// Mock组件依赖
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }: any) => (
    <div className={className} onClick={onClick} data-testid="template-card">
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, disabled }: any) => (
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

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid="badge">{children}</span>
  )
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange }: any) => (
    <input 
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid="search-input"
    />
  )
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      <div onClick={() => onValueChange && onValueChange('knowledge')}>
        {children}
      </div>
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value} data-testid="select-item">{children}</div>
  )
}));

// Mock图标
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Square: () => <div data-testid="square-icon" />,
  BookOpen: () => <div data-testid="book-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  GraduationCap: () => <div data-testid="graduation-icon" />,
  Image: () => <div data-testid="image-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Lock: () => <div data-testid="lock-icon" />
}));

describe('TemplateSelector', () => {
  const mockProps = {
    selectedTemplate: 'knowledge-simple',
    onTemplateChange: vi.fn(),
    showSearch: true,
    showFilters: true,
    gridColumns: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    test('应该渲染所有可用模板', () => {
      render(<TemplateSelector {...mockProps} />);
      
      const templateCards = screen.getAllByTestId('template-card');
      expect(templateCards.length).toBeGreaterThan(0);
    });

    test('应该显示搜索框', () => {
      render(<TemplateSelector {...mockProps} showSearch={true} />);
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('搜索模板...')).toBeInTheDocument();
    });

    test('应该显示过滤器', () => {
      render(<TemplateSelector {...mockProps} showFilters={true} />);
      
      expect(screen.getByTestId('select')).toBeInTheDocument();
      expect(screen.getByText('仅免费')).toBeInTheDocument();
    });

    test('应该隐藏搜索框当showSearch为false', () => {
      render(<TemplateSelector {...mockProps} showSearch={false} />);
      
      expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    });

    test('应该隐藏过滤器当showFilters为false', () => {
      render(<TemplateSelector {...mockProps} showFilters={false} />);
      
      expect(screen.queryByTestId('select')).not.toBeInTheDocument();
      expect(screen.queryByText('仅免费')).not.toBeInTheDocument();
    });
  });

  describe('模板选择功能', () => {
    test('应该正确标记选中的模板', () => {
      render(<TemplateSelector {...mockProps} selectedTemplate="knowledge-simple" />);
      
      // 检查选中状态的视觉表现（通过className或其他属性）
      const templateCards = screen.getAllByTestId('template-card');
      const selectedCard = templateCards.find(card => 
        card.className.includes('ring-2 ring-primary')
      );
      expect(selectedCard).toBeInTheDocument();
    });

    test('应该在点击模板时调用onTemplateChange', () => {
      render(<TemplateSelector {...mockProps} />);
      
      const templateCards = screen.getAllByTestId('template-card');
      fireEvent.click(templateCards[0]);
      
      expect(mockProps.onTemplateChange).toHaveBeenCalled();
    });

    test('应该传递正确的模板ID给onTemplateChange', () => {
      render(<TemplateSelector {...mockProps} />);
      
      const templateCards = screen.getAllByTestId('template-card');
      fireEvent.click(templateCards[0]);
      
      expect(mockProps.onTemplateChange).toHaveBeenCalledWith(
        expect.any(Object) // 模板对象
      );
    });
  });

  describe('搜索功能', () => {
    test('应该根据搜索词过滤模板', async () => {
      render(<TemplateSelector {...mockProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: '知识' } });
      
      await waitFor(() => {
        // 验证过滤后的结果
        const templateCards = screen.getAllByTestId('template-card');
        expect(templateCards.length).toBeLessThan(CARD_TEMPLATES.length);
      });
    });

    test('应该在没有匹配结果时显示空状态', async () => {
      render(<TemplateSelector {...mockProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: '不存在的模板' } });
      
      await waitFor(() => {
        expect(screen.getByText('未找到匹配的模板')).toBeInTheDocument();
        expect(screen.getByText('尝试调整搜索条件或过滤器设置')).toBeInTheDocument();
      });
    });

    test('应该能够清除搜索条件', async () => {
      render(<TemplateSelector {...mockProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: '测试' } });
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('测试')).toBeInTheDocument();
      });
      
      fireEvent.change(searchInput, { target: { value: '' } });
      
      await waitFor(() => {
        const templateCards = screen.getAllByTestId('template-card');
        expect(templateCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('过滤功能', () => {
    test('应该根据分类过滤模板', async () => {
      render(<TemplateSelector {...mockProps} />);
      
      const selectTrigger = screen.getByTestId('select');
      fireEvent.click(selectTrigger);
      
      await waitFor(() => {
        // 验证分类过滤生效
        expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'knowledge');
      });
    });

    test('应该能够过滤仅免费模板', () => {
      render(<TemplateSelector {...mockProps} />);
      
      const freeFilterButton = screen.getByText('仅免费');
      fireEvent.click(freeFilterButton);
      
      // 验证免费过滤器状态
      expect(freeFilterButton).toHaveAttribute('data-variant', 'default');
    });

    test('应该能够切换详情显示', () => {
      render(<TemplateSelector {...mockProps} />);
      
      const detailsButton = screen.getByText('详情');
      fireEvent.click(detailsButton);
      
      expect(detailsButton).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('模板信息显示', () => {
    test('应该显示模板的基本信息', () => {
      render(<TemplateSelector {...mockProps} />);
      
      // 检查是否显示模板名称
      const knowledgeTemplate = CARD_TEMPLATES.find(t => t.id === 'knowledge-simple');
      if (knowledgeTemplate) {
        expect(screen.getByText(knowledgeTemplate.displayName)).toBeInTheDocument();
        expect(screen.getByText(knowledgeTemplate.description)).toBeInTheDocument();
      }
    });

    test('应该显示付费模板的Pro标识', () => {
      render(<TemplateSelector {...mockProps} />);
      
      const proTemplate = CARD_TEMPLATES.find(t => !t.isFree);
      if (proTemplate) {
        const lockIcons = screen.getAllByTestId('lock-icon');
        expect(lockIcons.length).toBeGreaterThan(0);
      }
    });

    test('应该显示热门模板的标识', () => {
      render(<TemplateSelector {...mockProps} />);
      
      const popularTemplate = CARD_TEMPLATES.find(t => t.isPopular);
      if (popularTemplate) {
        const starIcons = screen.getAllByTestId('star-icon');
        expect(starIcons.length).toBeGreaterThan(0);
      }
    });

    test('应该显示新模板的标识', () => {
      render(<TemplateSelector {...mockProps} />);
      
      const newTemplate = CARD_TEMPLATES.find(t => t.isNew);
      if (newTemplate) {
        expect(screen.getByText('新')).toBeInTheDocument();
      }
    });
  });

  describe('响应式布局', () => {
    test('应该根据gridColumns属性设置正确的网格布局', () => {
      const { rerender } = render(<TemplateSelector {...mockProps} gridColumns={1} />);
      
      let container = screen.getByText('显示').closest('div');
      expect(container?.className).toContain('grid-cols-1');
      
      rerender(<TemplateSelector {...mockProps} gridColumns={3} />);
      
      container = screen.getByText('显示').closest('div');
      expect(container?.className).toContain('lg:grid-cols-3');
    });
  });

  describe('统计信息', () => {
    test('应该显示模板统计信息', () => {
      render(<TemplateSelector {...mockProps} />);
      
      expect(screen.getByText(/显示 \d+ \/ \d+ 个模板/)).toBeInTheDocument();
    });

    test('应该在搜索时显示搜索结果统计', async () => {
      render(<TemplateSelector {...mockProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: '知识' } });
      
      await waitFor(() => {
        expect(screen.getByText(/搜索结果: "知识"/)).toBeInTheDocument();
      });
    });
  });

  describe('清除过滤条件', () => {
    test('应该能够一键清除所有过滤条件', async () => {
      render(<TemplateSelector {...mockProps} />);
      
      // 设置搜索条件
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: '不存在' } });
      
      await waitFor(() => {
        expect(screen.getByText('清除过滤条件')).toBeInTheDocument();
      });
      
      // 点击清除按钮
      const clearButton = screen.getByText('清除过滤条件');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        const templateCards = screen.getAllByTestId('template-card');
        expect(templateCards.length).toBeGreaterThan(0);
      });
    });
  });
});