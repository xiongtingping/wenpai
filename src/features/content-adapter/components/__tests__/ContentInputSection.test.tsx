/**
 * 内容输入区域组件测试
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentInputSection from '../ContentInputSection';

// Mock dependencies
vi.mock('@/components/ui/StateLoadingWrapper', () => ({
  UsageStateWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/components/ui/mention-textarea', () => ({
  MentionTextarea: ({ value, onChange, placeholder, className, ...props }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  )
}));

describe('ContentInputSection', () => {
  const defaultProps = {
    originalContent: '',
    onContentChange: vi.fn(),
    usageRemaining: 100,
    currentTier: 'pro',
    t: (key: string) => key
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染组件', () => {
    render(<ContentInputSection {...defaultProps} />);
    
    expect(screen.getByText('adapt.inputOriginalContent')).toBeInTheDocument();
    expect(screen.getByText('adapt.remainingUsage')).toBeInTheDocument();
    expect(screen.getByTestId('original-content-input')).toBeInTheDocument();
  });

  it('应该显示正确的使用次数', () => {
    render(<ContentInputSection {...defaultProps} usageRemaining={50} />);
    
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('应该在使用次数不足时显示警告样式', () => {
    render(<ContentInputSection {...defaultProps} usageRemaining={3} />);
    
    const badge = screen.getByText('3').closest('.badge');
    expect(badge).toHaveClass('destructive');
  });

  it('应该显示无限使用次数', () => {
    render(<ContentInputSection {...defaultProps} usageRemaining={-1} />);
    
    expect(screen.getByText('∞')).toBeInTheDocument();
  });

  it('应该处理内容变更', () => {
    const onContentChange = vi.fn();
    render(<ContentInputSection {...defaultProps} onContentChange={onContentChange} />);
    
    const textarea = screen.getByTestId('original-content-input');
    fireEvent.change(textarea, { target: { value: '测试内容' } });
    
    expect(onContentChange).toHaveBeenCalledWith('测试内容');
  });

  it('应该显示字符数统计', () => {
    render(<ContentInputSection {...defaultProps} originalContent="测试内容123" />);
    
    expect(screen.getByText(/字符数: 6/)).toBeInTheDocument();
  });

  it('应该显示预计生成时间', () => {
    const longContent = 'a'.repeat(200);
    render(<ContentInputSection {...defaultProps} originalContent={longContent} />);

    expect(screen.getByText(/预计生成时间:/)).toBeInTheDocument();
  });

  it('应该在内容过长时显示警告', () => {
    const veryLongContent = 'a'.repeat(6000);
    render(<ContentInputSection {...defaultProps} originalContent={veryLongContent} />);

    expect(screen.getByText('内容较长，建议分段处理')).toBeInTheDocument();
  });

  it('应该在内容为空时显示提示信息', () => {
    render(<ContentInputSection {...defaultProps} originalContent="" />);
    
    expect(screen.getByText('💡 内容输入建议：')).toBeInTheDocument();
    expect(screen.getByText('快速模板:')).toBeInTheDocument();
  });

  it('应该处理快速模板点击', () => {
    const onContentChange = vi.fn();
    render(<ContentInputSection {...defaultProps} onContentChange={onContentChange} originalContent="" />);
    
    const templateButton = screen.getByText('产品推荐');
    fireEvent.click(templateButton);
    
    expect(onContentChange).toHaveBeenCalledWith('产品推荐: 今天要给大家推荐一个超好用的...');
  });

  it('应该使用自定义占位符', () => {
    render(<ContentInputSection {...defaultProps} placeholder="自定义占位符" />);
    
    const textarea = screen.getByTestId('original-content-input');
    expect(textarea).toHaveAttribute('placeholder', '自定义占位符');
  });

  it('应该应用自定义最小高度', () => {
    render(<ContentInputSection {...defaultProps} minHeight="300px" />);
    
    const textarea = screen.getByTestId('original-content-input');
    expect(textarea).toHaveClass('min-h-[300px]');
  });
});
