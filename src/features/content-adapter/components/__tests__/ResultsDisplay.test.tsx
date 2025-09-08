/**
 * 结果展示组件测试
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultsDisplay from '../ResultsDisplay';

// Mock dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-value={value} onChange={onValueChange}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button onClick={onClick} data-value={value}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => <div data-content={value}>{children}</div>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: any) => (
    <button 
      onClick={onClick} 
      className={`${variant} ${size} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  )
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, className }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      className={className}
      data-testid="content-textarea"
    />
  )
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={`progress ${className}`} data-value={value}>
      <div style={{ width: `${value}%` }}></div>
    </div>
  )
}));

describe('ResultsDisplay', () => {
  const mockResults = {
    xiaohongshu: {
      content: '🌟 今天要给大家分享一个超实用的小技巧！\n\n相信很多小伙伴都遇到过这样的问题...',
      title: '实用技巧分享',
      status: 'completed' as const,
      timestamp: Date.now(),
      metadata: { charCount: 150, platform: 'xiaohongshu' }
    },
    douyin: {
      content: '🔥 这个技巧太实用了！\n\n#实用技巧 #生活小窍门 #必看',
      title: '实用技巧',
      status: 'completed' as const,
      timestamp: Date.now(),
      metadata: { charCount: 80, platform: 'douyin' }
    }
  };

  const defaultProps = {
    results: mockResults,
    selectedPlatforms: ['xiaohongshu', 'douyin'],
    generating: false,
    retryingPlatforms: [],
    regeneratingVersions: [],
    onRetryPlatform: vi.fn(),
    onRegenerateVersion: vi.fn(),
    onGenerateComparison: vi.fn(),
    onGenerateTitle: vi.fn(),
    onContentEdit: vi.fn(),
    onCopyContent: vi.fn(),
    onSaveContent: vi.fn(),
    onPublishContent: vi.fn(),
    generationSteps: [
      { status: 'completed' as const, message: '分析原始内容' },
      { status: 'completed' as const, message: '生成平台适配内容' },
      { status: 'completed' as const, message: '优化内容质量' },
      { status: 'completed' as const, message: '生成完成' }
    ],
    t: (key: string) => key
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染组件', () => {
    render(<ResultsDisplay {...defaultProps} />);
    
    expect(screen.getByText('adapt.results')).toBeInTheDocument();
    expect(screen.getByText('生成步骤')).toBeInTheDocument();
  });

  it('应该显示生成步骤', () => {
    render(<ResultsDisplay {...defaultProps} />);
    
    expect(screen.getByText('分析原始内容')).toBeInTheDocument();
    expect(screen.getByText('生成平台适配内容')).toBeInTheDocument();
    expect(screen.getByText('优化内容质量')).toBeInTheDocument();
    expect(screen.getByText('生成完成')).toBeInTheDocument();
  });

  it('应该显示平台标签页', () => {
    render(<ResultsDisplay {...defaultProps} />);
    
    expect(screen.getByText('小红书')).toBeInTheDocument();
    expect(screen.getByText('抖音')).toBeInTheDocument();
  });

  it('应该显示生成结果内容', () => {
    render(<ResultsDisplay {...defaultProps} />);
    
    expect(screen.getByText('🌟 今天要给大家分享一个超实用的小技巧！')).toBeInTheDocument();
    expect(screen.getByText('实用技巧分享')).toBeInTheDocument();
  });

  it('应该显示字符数统计', () => {
    render(<ResultsDisplay {...defaultProps} />);
    
    expect(screen.getByText('150 字符')).toBeInTheDocument();
    expect(screen.getByText('80 字符')).toBeInTheDocument();
  });

  it('应该处理内容编辑', () => {
    const onContentEdit = vi.fn();
    render(<ResultsDisplay {...defaultProps} onContentEdit={onContentEdit} />);
    
    const textarea = screen.getAllByTestId('content-textarea')[0];
    fireEvent.change(textarea, { target: { value: '编辑后的内容' } });
    
    expect(onContentEdit).toHaveBeenCalledWith('xiaohongshu', '编辑后的内容');
  });

  it('应该处理复制内容', () => {
    const onCopyContent = vi.fn();
    render(<ResultsDisplay {...defaultProps} onCopyContent={onCopyContent} />);
    
    const copyButton = screen.getAllByText('复制')[0];
    fireEvent.click(copyButton);
    
    expect(onCopyContent).toHaveBeenCalledWith('xiaohongshu');
  });

  it('应该处理重试平台', () => {
    const onRetryPlatform = vi.fn();
    render(<ResultsDisplay {...defaultProps} onRetryPlatform={onRetryPlatform} />);
    
    const retryButton = screen.getAllByText('重试')[0];
    fireEvent.click(retryButton);
    
    expect(onRetryPlatform).toHaveBeenCalledWith('xiaohongshu');
  });

  it('应该处理重新生成版本', () => {
    const onRegenerateVersion = vi.fn();
    render(<ResultsDisplay {...defaultProps} onRegenerateVersion={onRegenerateVersion} />);
    
    const regenerateButton = screen.getAllByText('重新生成')[0];
    fireEvent.click(regenerateButton);
    
    expect(onRegenerateVersion).toHaveBeenCalledWith('xiaohongshu');
  });

  it('应该处理生成对比', () => {
    const onGenerateComparison = vi.fn();
    render(<ResultsDisplay {...defaultProps} onGenerateComparison={onGenerateComparison} />);
    
    const compareButton = screen.getAllByText('对比')[0];
    fireEvent.click(compareButton);
    
    expect(onGenerateComparison).toHaveBeenCalledWith('xiaohongshu');
  });

  it('应该处理生成标题', () => {
    const onGenerateTitle = vi.fn();
    render(<ResultsDisplay {...defaultProps} onGenerateTitle={onGenerateTitle} />);
    
    const titleButton = screen.getAllByText('生成标题')[0];
    fireEvent.click(titleButton);
    
    expect(onGenerateTitle).toHaveBeenCalledWith('xiaohongshu');
  });

  it('应该处理保存内容', () => {
    const onSaveContent = vi.fn();
    render(<ResultsDisplay {...defaultProps} onSaveContent={onSaveContent} />);
    
    const saveButton = screen.getAllByText('收藏')[0];
    fireEvent.click(saveButton);
    
    expect(onSaveContent).toHaveBeenCalledWith('xiaohongshu');
  });

  it('应该处理发布内容', () => {
    const onPublishContent = vi.fn();
    render(<ResultsDisplay {...defaultProps} onPublishContent={onPublishContent} />);
    
    const publishButton = screen.getAllByText('发布')[0];
    fireEvent.click(publishButton);
    
    expect(onPublishContent).toHaveBeenCalledWith('xiaohongshu');
  });

  it('应该显示生成中状态', () => {
    render(<ResultsDisplay {...defaultProps} generating={true} />);
    
    expect(screen.getByText('正在生成内容...')).toBeInTheDocument();
  });

  it('应该显示重试中状态', () => {
    render(<ResultsDisplay {...defaultProps} retryingPlatforms={['xiaohongshu']} />);
    
    expect(screen.getByText('重试中...')).toBeInTheDocument();
  });

  it('应该显示重新生成中状态', () => {
    render(<ResultsDisplay {...defaultProps} regeneratingVersions={['douyin']} />);
    
    expect(screen.getByText('重新生成中...')).toBeInTheDocument();
  });

  it('应该显示空结果状态', () => {
    render(<ResultsDisplay {...defaultProps} results={{}} />);
    
    expect(screen.getByText('暂无生成结果')).toBeInTheDocument();
    expect(screen.getByText('请先生成内容')).toBeInTheDocument();
  });

  it('应该显示错误状态', () => {
    const errorResults = {
      xiaohongshu: {
        content: '',
        title: '',
        status: 'error' as const,
        timestamp: Date.now(),
        metadata: { error: '生成失败', platform: 'xiaohongshu' }
      }
    };
    
    render(<ResultsDisplay {...defaultProps} results={errorResults} />);
    
    expect(screen.getByText('生成失败')).toBeInTheDocument();
  });

  it('应该显示生成进度', () => {
    const loadingSteps = [
      { status: 'completed' as const, message: '分析原始内容' },
      { status: 'loading' as const, message: '生成平台适配内容' },
      { status: 'waiting' as const, message: '优化内容质量' },
      { status: 'waiting' as const, message: '生成完成' }
    ];
    
    render(<ResultsDisplay {...defaultProps} generationSteps={loadingSteps} />);
    
    expect(screen.getByText('生成平台适配内容')).toBeInTheDocument();
  });

  it('应该显示平台特定信息', () => {
    render(<ResultsDisplay {...defaultProps} />);
    
    // 检查平台图标和名称
    expect(screen.getByText('小红书')).toBeInTheDocument();
    expect(screen.getByText('抖音')).toBeInTheDocument();
  });

  it('应该处理标签页切换', () => {
    render(<ResultsDisplay {...defaultProps} />);
    
    const douyinTab = screen.getByText('抖音');
    fireEvent.click(douyinTab);
    
    // 检查是否切换到抖音内容
    expect(screen.getByText('🔥 这个技巧太实用了！')).toBeInTheDocument();
  });

  it('应该显示操作按钮组', () => {
    render(<ResultsDisplay {...defaultProps} />);
    
    expect(screen.getAllByText('复制').length).toBeGreaterThan(0);
    expect(screen.getAllByText('重试').length).toBeGreaterThan(0);
    expect(screen.getAllByText('重新生成').length).toBeGreaterThan(0);
    expect(screen.getAllByText('对比').length).toBeGreaterThan(0);
    expect(screen.getAllByText('收藏').length).toBeGreaterThan(0);
    expect(screen.getAllByText('发布').length).toBeGreaterThan(0);
  });
});
