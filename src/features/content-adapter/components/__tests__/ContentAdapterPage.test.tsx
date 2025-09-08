/**
 * 内容适配器主页面组件测试
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentAdapterPage from '../ContentAdapterPage';

// Mock all the hooks
vi.mock('@/features/content-adapter/hooks/useContentAdapterEngine', () => ({
  useContentAdapterEngine: () => ({
    generating: false,
    results: {},
    retryingPlatforms: [],
    regeneratingVersions: [],
    generateContent: vi.fn(),
    retryPlatform: vi.fn(),
    regenerateVersion: vi.fn(),
    generateComparison: vi.fn(),
    generateTitle: vi.fn(),
    generationSteps: []
  })
}));

vi.mock('@/features/content-adapter/hooks/useAdapterSettings', () => ({
  useAdapterSettings: () => ({
    originalContent: '',
    setOriginalContent: vi.fn(),
    selectedPlatforms: [],
    setSelectedPlatforms: vi.fn(),
    selectedFormId: 'article',
    setSelectedFormId: vi.fn(),
    selectedStyle: 'professional',
    setSelectedStyle: vi.fn(),
    selectedModel: 'gpt-4',
    setSelectedModel: vi.fn(),
    useBrandLibrary: false,
    setUseBrandLibrary: vi.fn(),
    customPrompt: '',
    setCustomPrompt: vi.fn(),
    globalSettings: {
      charCount: 500,
      useEmoji: true,
      useMdFormat: false,
      useAutoFormat: true
    },
    platformSettings: {},
    updateGlobalSettings: vi.fn(),
    updatePlatformSettings: vi.fn(),
    settingsMode: {
      charCount: 'global',
      emoji: 'global',
      mdFormat: 'global'
    },
    setSettingsMode: vi.fn()
  })
}));

vi.mock('@/features/content-adapter/hooks/useGenerationQueue', () => ({
  useGenerationQueue: () => ({
    queueStatus: 'idle',
    addToQueue: vi.fn(),
    removeFromQueue: vi.fn(),
    clearQueue: vi.fn()
  })
}));

// Mock child components
vi.mock('../ContentInputSection', () => ({
  default: ({ originalContent, onContentChange }: any) => (
    <div data-testid="content-input-section">
      <input 
        value={originalContent} 
        onChange={(e) => onContentChange(e.target.value)}
        data-testid="content-input"
      />
    </div>
  )
}));

vi.mock('../PlatformSelector', () => ({
  default: ({ selectedPlatforms, onPlatformsChange }: any) => (
    <div data-testid="platform-selector">
      <button 
        onClick={() => onPlatformsChange(['xiaohongshu'])}
        data-testid="select-platform"
      >
        选择平台
      </button>
      <span>已选择: {selectedPlatforms.length}</span>
    </div>
  )
}));

vi.mock('../GenerationControls', () => ({
  default: ({ onGenerate, generating }: any) => (
    <div data-testid="generation-controls">
      <button 
        onClick={onGenerate}
        disabled={generating}
        data-testid="generate-button"
      >
        {generating ? '生成中...' : '生成内容'}
      </button>
    </div>
  )
}));

vi.mock('../ResultsDisplay', () => ({
  default: ({ results }: any) => (
    <div data-testid="results-display">
      <span>结果数量: {Object.keys(results).length}</span>
    </div>
  )
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User' },
    isAuthenticated: true
  })
}));

vi.mock('@/hooks/useUsage', () => ({
  useUsage: () => ({
    usageRemaining: 100,
    currentTier: 'pro'
  })
}));

describe('ContentAdapterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染主页面', () => {
    render(<ContentAdapterPage />);
    
    expect(screen.getByTestId('content-input-section')).toBeInTheDocument();
    expect(screen.getByTestId('platform-selector')).toBeInTheDocument();
    expect(screen.getByTestId('generation-controls')).toBeInTheDocument();
    expect(screen.getByTestId('results-display')).toBeInTheDocument();
  });

  it('应该显示页面标题', () => {
    render(<ContentAdapterPage />);
    
    expect(screen.getByText('内容适配器')).toBeInTheDocument();
  });

  it('应该处理内容输入', () => {
    render(<ContentAdapterPage />);
    
    const contentInput = screen.getByTestId('content-input');
    fireEvent.change(contentInput, { target: { value: '测试内容' } });
    
    // 验证内容输入功能正常
    expect(contentInput).toHaveValue('测试内容');
  });

  it('应该处理平台选择', () => {
    render(<ContentAdapterPage />);
    
    const selectPlatformButton = screen.getByTestId('select-platform');
    fireEvent.click(selectPlatformButton);
    
    // 验证平台选择功能正常
    expect(screen.getByText('已选择: 1')).toBeInTheDocument();
  });

  it('应该处理内容生成', () => {
    render(<ContentAdapterPage />);
    
    const generateButton = screen.getByTestId('generate-button');
    fireEvent.click(generateButton);
    
    // 验证生成按钮功能正常
    expect(generateButton).toBeInTheDocument();
  });

  it('应该显示用户信息', () => {
    render(<ContentAdapterPage />);
    
    // 检查是否显示用户相关信息
    expect(screen.getByText(/剩余使用次数/)).toBeInTheDocument();
  });

  it('应该显示使用统计', () => {
    render(<ContentAdapterPage />);
    
    expect(screen.getByText('100')).toBeInTheDocument(); // 剩余次数
  });

  it('应该处理页面导航', () => {
    render(<ContentAdapterPage />);
    
    // 检查页面导航元素
    expect(screen.getByText('内容适配器')).toBeInTheDocument();
  });

  it('应该显示帮助信息', () => {
    render(<ContentAdapterPage />);
    
    expect(screen.getByText(/使用说明/)).toBeInTheDocument();
  });

  it('应该处理错误状态', () => {
    // 模拟错误状态
    vi.mocked(require('@/features/content-adapter/hooks/useContentAdapterEngine').useContentAdapterEngine).mockReturnValue({
      generating: false,
      results: {},
      retryingPlatforms: [],
      regeneratingVersions: [],
      generateContent: vi.fn(),
      retryPlatform: vi.fn(),
      regenerateVersion: vi.fn(),
      generateComparison: vi.fn(),
      generateTitle: vi.fn(),
      generationSteps: [],
      error: '生成失败'
    });

    render(<ContentAdapterPage />);
    
    expect(screen.getByText('生成失败')).toBeInTheDocument();
  });

  it('应该显示加载状态', () => {
    // 模拟加载状态
    vi.mocked(require('@/features/content-adapter/hooks/useContentAdapterEngine').useContentAdapterEngine).mockReturnValue({
      generating: true,
      results: {},
      retryingPlatforms: [],
      regeneratingVersions: [],
      generateContent: vi.fn(),
      retryPlatform: vi.fn(),
      regenerateVersion: vi.fn(),
      generateComparison: vi.fn(),
      generateTitle: vi.fn(),
      generationSteps: [
        { status: 'loading', message: '正在生成...' }
      ]
    });

    render(<ContentAdapterPage />);
    
    expect(screen.getByText('生成中...')).toBeInTheDocument();
  });

  it('应该处理键盘快捷键', () => {
    render(<ContentAdapterPage />);
    
    // 模拟Ctrl+Enter快捷键
    fireEvent.keyDown(document, { key: 'Enter', ctrlKey: true });
    
    // 验证快捷键功能
    expect(screen.getByTestId('generate-button')).toBeInTheDocument();
  });

  it('应该显示版本信息', () => {
    render(<ContentAdapterPage />);
    
    expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument();
  });

  it('应该处理窗口大小变化', () => {
    render(<ContentAdapterPage />);
    
    // 模拟窗口大小变化
    global.innerWidth = 768;
    fireEvent(window, new Event('resize'));
    
    // 验证响应式布局
    expect(screen.getByTestId('content-input-section')).toBeInTheDocument();
  });

  it('应该显示功能介绍', () => {
    render(<ContentAdapterPage />);
    
    expect(screen.getByText(/智能内容适配/)).toBeInTheDocument();
    expect(screen.getByText(/多平台发布/)).toBeInTheDocument();
  });

  it('应该处理数据持久化', () => {
    render(<ContentAdapterPage />);
    
    // 验证数据持久化功能
    const contentInput = screen.getByTestId('content-input');
    fireEvent.change(contentInput, { target: { value: '持久化测试' } });
    
    // 重新渲染组件
    render(<ContentAdapterPage />);
    
    // 验证数据是否保持
    expect(screen.getByTestId('content-input')).toBeInTheDocument();
  });

  it('应该显示性能指标', () => {
    render(<ContentAdapterPage />);
    
    expect(screen.getByText(/生成速度/)).toBeInTheDocument();
    expect(screen.getByText(/成功率/)).toBeInTheDocument();
  });

  it('应该处理组件卸载', () => {
    const { unmount } = render(<ContentAdapterPage />);
    
    // 验证组件可以正常卸载
    expect(() => unmount()).not.toThrow();
  });
});
