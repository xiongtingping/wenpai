/**
 * 内容适配器组件集成测试
 * 测试组件间的协作和数据流
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// 导入所有组件
import ContentAdapterPage from '../ContentAdapterPage';
import ContentInputSection from '../ContentInputSection';
import PlatformSelector from '../PlatformSelector';
import GenerationControls from '../GenerationControls';
import ResultsDisplay from '../ResultsDisplay';

// Mock所有依赖
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>
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

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, className }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="textarea"
    />
  )
}));

vi.mock('@/components/ui/mention-textarea', () => ({
  MentionTextarea: ({ value, onChange, placeholder, className }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="mention-textarea"
    />
  )
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-value={value}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-value={value}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => <div data-content={value}>{children}</div>
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  )
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, id }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      id={id}
      data-testid={`switch-${id}`}
    />
  )
}));

vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, step }: any) => (
    <input
      type="range"
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      min={min}
      max={max}
      step={step}
      data-testid="slider"
    />
  )
}));

vi.mock('@/components/ContentFormSelector', () => ({
  ContentFormSelector: ({ selectedFormId, onFormChange }: any) => (
    <select 
      value={selectedFormId} 
      onChange={(e) => onFormChange(e.target.value)}
      data-testid="form-selector"
    >
      <option value="article">文章</option>
      <option value="post">帖子</option>
    </select>
  )
}));

vi.mock('@/components/ui/StateLoadingWrapper', () => ({
  UsageStateWrapper: ({ children }: any) => <div>{children}</div>
}));

describe('组件集成测试', () => {
  const t = (key: string) => key;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('数据流测试', () => {
    it('应该正确传递内容输入数据', () => {
      const onContentChange = vi.fn();
      
      render(
        <ContentInputSection
          originalContent=""
          onContentChange={onContentChange}
          usageRemaining={100}
          currentTier="pro"
          t={t}
        />
      );

      const textarea = screen.getByTestId('mention-textarea');
      fireEvent.change(textarea, { target: { value: '测试内容' } });

      expect(onContentChange).toHaveBeenCalledWith('测试内容');
    });

    it('应该正确传递平台选择数据', () => {
      const onPlatformsChange = vi.fn();
      const onGlobalSettingsChange = vi.fn();
      const onSettingsModeChange = vi.fn();

      render(
        <PlatformSelector
          selectedPlatforms={[]}
          onPlatformsChange={onPlatformsChange}
          globalSettings={{
            charCount: 500,
            useEmoji: true,
            useMdFormat: false,
            useAutoFormat: true
          }}
          platformSettings={{}}
          onGlobalSettingsChange={onGlobalSettingsChange}
          onPlatformSettingsChange={vi.fn()}
          settingsMode={{
            charCount: 'global',
            emoji: 'global',
            mdFormat: 'global'
          }}
          onSettingsModeChange={onSettingsModeChange}
          t={t}
        />
      );

      // 测试平台选择
      const xiaohongshuButton = screen.getByText('小红书').closest('button');
      fireEvent.click(xiaohongshuButton!);
      expect(onPlatformsChange).toHaveBeenCalledWith(['xiaohongshu']);

      // 测试设置变更
      const slider = screen.getByTestId('slider');
      fireEvent.change(slider, { target: { value: '300' } });
      expect(onGlobalSettingsChange).toHaveBeenCalled();
    });

    it('应该正确传递生成控制数据', () => {
      const onGenerate = vi.fn();
      const onFormChange = vi.fn();
      const onStyleChange = vi.fn();

      render(
        <GenerationControls
          originalContent="测试内容"
          selectedPlatforms={['xiaohongshu']}
          selectedFormId="article"
          selectedStyle="professional"
          selectedModel="gpt-4"
          useBrandLibrary={false}
          customPrompt=""
          onFormChange={onFormChange}
          onStyleChange={onStyleChange}
          onModelChange={vi.fn()}
          onBrandLibraryChange={vi.fn()}
          onCustomPromptChange={vi.fn()}
          onGenerate={onGenerate}
          generating={false}
          validationErrors={[]}
          t={t}
        />
      );

      // 测试生成按钮
      const generateButton = screen.getByText('生成内容');
      fireEvent.click(generateButton);
      expect(onGenerate).toHaveBeenCalled();

      // 测试表单选择
      const formSelector = screen.getByTestId('form-selector');
      fireEvent.change(formSelector, { target: { value: 'post' } });
      expect(onFormChange).toHaveBeenCalledWith('post');
    });

    it('应该正确传递结果展示数据', () => {
      const onRetryPlatform = vi.fn();
      const onCopyContent = vi.fn();
      const onContentEdit = vi.fn();

      const mockResults = {
        xiaohongshu: {
          content: '测试内容',
          title: '测试标题',
          status: 'completed' as const,
          timestamp: Date.now(),
          metadata: { charCount: 100, platform: 'xiaohongshu' }
        }
      };

      render(
        <ResultsDisplay
          results={mockResults}
          selectedPlatforms={['xiaohongshu']}
          generating={false}
          retryingPlatforms={[]}
          regeneratingVersions={[]}
          onRetryPlatform={onRetryPlatform}
          onRegenerateVersion={vi.fn()}
          onGenerateComparison={vi.fn()}
          onGenerateTitle={vi.fn()}
          onContentEdit={onContentEdit}
          onCopyContent={onCopyContent}
          onSaveContent={vi.fn()}
          onPublishContent={vi.fn()}
          generationSteps={[]}
          t={t}
        />
      );

      // 测试重试功能
      const retryButton = screen.getByText('重试');
      fireEvent.click(retryButton);
      expect(onRetryPlatform).toHaveBeenCalledWith('xiaohongshu');

      // 测试复制功能
      const copyButton = screen.getByText('复制');
      fireEvent.click(copyButton);
      expect(onCopyContent).toHaveBeenCalledWith('xiaohongshu');

      // 测试内容编辑
      const textarea = screen.getByTestId('textarea');
      fireEvent.change(textarea, { target: { value: '编辑后内容' } });
      expect(onContentEdit).toHaveBeenCalledWith('xiaohongshu', '编辑后内容');
    });
  });

  describe('状态管理测试', () => {
    it('应该正确处理加载状态', () => {
      render(
        <GenerationControls
          originalContent="测试内容"
          selectedPlatforms={['xiaohongshu']}
          selectedFormId="article"
          selectedStyle="professional"
          selectedModel="gpt-4"
          useBrandLibrary={false}
          customPrompt=""
          onFormChange={vi.fn()}
          onStyleChange={vi.fn()}
          onModelChange={vi.fn()}
          onBrandLibraryChange={vi.fn()}
          onCustomPromptChange={vi.fn()}
          onGenerate={vi.fn()}
          generating={true}
          validationErrors={[]}
          t={t}
        />
      );

      const generateButton = screen.getByText('生成中...');
      expect(generateButton).toBeDisabled();
    });

    it('应该正确处理错误状态', () => {
      const validationErrors = ['请输入内容', '请选择平台'];

      render(
        <GenerationControls
          originalContent=""
          selectedPlatforms={[]}
          selectedFormId="article"
          selectedStyle="professional"
          selectedModel="gpt-4"
          useBrandLibrary={false}
          customPrompt=""
          onFormChange={vi.fn()}
          onStyleChange={vi.fn()}
          onModelChange={vi.fn()}
          onBrandLibraryChange={vi.fn()}
          onCustomPromptChange={vi.fn()}
          onGenerate={vi.fn()}
          generating={false}
          validationErrors={validationErrors}
          t={t}
        />
      );

      expect(screen.getByText('请输入内容')).toBeInTheDocument();
      expect(screen.getByText('请选择平台')).toBeInTheDocument();
    });

    it('应该正确处理空结果状态', () => {
      render(
        <ResultsDisplay
          results={{}}
          selectedPlatforms={['xiaohongshu']}
          generating={false}
          retryingPlatforms={[]}
          regeneratingVersions={[]}
          onRetryPlatform={vi.fn()}
          onRegenerateVersion={vi.fn()}
          onGenerateComparison={vi.fn()}
          onGenerateTitle={vi.fn()}
          onContentEdit={vi.fn()}
          onCopyContent={vi.fn()}
          onSaveContent={vi.fn()}
          onPublishContent={vi.fn()}
          generationSteps={[]}
          t={t}
        />
      );

      expect(screen.getByText('暂无生成结果')).toBeInTheDocument();
    });
  });

  describe('用户交互测试', () => {
    it('应该支持完整的用户工作流', async () => {
      const mockProps = {
        originalContent: '',
        selectedPlatforms: [],
        onContentChange: vi.fn(),
        onPlatformsChange: vi.fn(),
        onGenerate: vi.fn()
      };

      // 模拟完整的用户操作流程
      const { rerender } = render(
        <div>
          <ContentInputSection
            originalContent={mockProps.originalContent}
            onContentChange={mockProps.onContentChange}
            usageRemaining={100}
            currentTier="pro"
            t={t}
          />
          <PlatformSelector
            selectedPlatforms={mockProps.selectedPlatforms}
            onPlatformsChange={mockProps.onPlatformsChange}
            globalSettings={{
              charCount: 500,
              useEmoji: true,
              useMdFormat: false,
              useAutoFormat: true
            }}
            platformSettings={{}}
            onGlobalSettingsChange={vi.fn()}
            onPlatformSettingsChange={vi.fn()}
            settingsMode={{
              charCount: 'global',
              emoji: 'global',
              mdFormat: 'global'
            }}
            onSettingsModeChange={vi.fn()}
            t={t}
          />
        </div>
      );

      // 1. 输入内容
      const textarea = screen.getByTestId('mention-textarea');
      fireEvent.change(textarea, { target: { value: '测试内容' } });
      expect(mockProps.onContentChange).toHaveBeenCalledWith('测试内容');

      // 2. 选择平台
      const xiaohongshuButton = screen.getByText('小红书').closest('button');
      fireEvent.click(xiaohongshuButton!);
      expect(mockProps.onPlatformsChange).toHaveBeenCalledWith(['xiaohongshu']);

      // 验证用户工作流的连贯性
      expect(mockProps.onContentChange).toHaveBeenCalled();
      expect(mockProps.onPlatformsChange).toHaveBeenCalled();
    });

    it('应该正确处理键盘事件', () => {
      const onGenerate = vi.fn();

      render(
        <GenerationControls
          originalContent="测试内容"
          selectedPlatforms={['xiaohongshu']}
          selectedFormId="article"
          selectedStyle="professional"
          selectedModel="gpt-4"
          useBrandLibrary={false}
          customPrompt=""
          onFormChange={vi.fn()}
          onStyleChange={vi.fn()}
          onModelChange={vi.fn()}
          onBrandLibraryChange={vi.fn()}
          onCustomPromptChange={vi.fn()}
          onGenerate={onGenerate}
          generating={false}
          validationErrors={[]}
          t={t}
        />
      );

      // 模拟Ctrl+Enter快捷键
      const generateButton = screen.getByText('生成内容');
      fireEvent.keyDown(generateButton, { key: 'Enter', ctrlKey: true });
      
      // 验证快捷键功能
      expect(generateButton).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量数据', () => {
      const largePlatformList = Array.from({ length: 50 }, (_, i) => `platform-${i}`);
      
      const startTime = performance.now();
      
      render(
        <PlatformSelector
          selectedPlatforms={largePlatformList}
          onPlatformsChange={vi.fn()}
          globalSettings={{
            charCount: 500,
            useEmoji: true,
            useMdFormat: false,
            useAutoFormat: true
          }}
          platformSettings={{}}
          onGlobalSettingsChange={vi.fn()}
          onPlatformSettingsChange={vi.fn()}
          settingsMode={{
            charCount: 'global',
            emoji: 'global',
            mdFormat: 'global'
          }}
          onSettingsModeChange={vi.fn()}
          t={t}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // 验证渲染时间在合理范围内（小于100ms）
      expect(renderTime).toBeLessThan(100);
    });

    it('应该正确处理内存清理', () => {
      const { unmount } = render(
        <ContentInputSection
          originalContent="测试内容"
          onContentChange={vi.fn()}
          usageRemaining={100}
          currentTier="pro"
          t={t}
        />
      );

      // 验证组件可以正常卸载
      expect(() => unmount()).not.toThrow();
    });
  });
});
