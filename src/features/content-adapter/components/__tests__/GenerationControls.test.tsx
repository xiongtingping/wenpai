/**
 * 生成控制组件测试
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GenerationControls from '../GenerationControls';

// Mock dependencies
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
      data-testid="generate-button"
    >
      {children}
    </button>
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

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, className }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      data-testid="custom-prompt-textarea"
    />
  )
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: any) => <div className={`alert ${variant}`}>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>
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
      <option value="story">故事</option>
    </select>
  )
}));

describe('GenerationControls', () => {
  const defaultProps = {
    originalContent: '这是一个测试内容',
    selectedPlatforms: ['xiaohongshu', 'douyin'],
    selectedFormId: 'article',
    selectedStyle: 'professional',
    selectedModel: 'gpt-4',
    useBrandLibrary: false,
    customPrompt: '',
    onFormChange: vi.fn(),
    onStyleChange: vi.fn(),
    onModelChange: vi.fn(),
    onBrandLibraryChange: vi.fn(),
    onCustomPromptChange: vi.fn(),
    onGenerate: vi.fn(),
    generating: false,
    validationErrors: [],
    t: (key: string) => key
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染组件', () => {
    render(<GenerationControls {...defaultProps} />);
    
    expect(screen.getByText('adapt.generationSettings')).toBeInTheDocument();
    expect(screen.getByText('adapt.generateContent')).toBeInTheDocument();
  });

  it('应该显示生成信息', () => {
    render(<GenerationControls {...defaultProps} />);
    
    expect(screen.getByText('目标平台: 2 个平台')).toBeInTheDocument();
    expect(screen.getByText('内容长度: 7 字符')).toBeInTheDocument();
    expect(screen.getByText(/预计时间:/)).toBeInTheDocument();
  });

  it('应该处理内容形式选择', () => {
    const onFormChange = vi.fn();
    render(<GenerationControls {...defaultProps} onFormChange={onFormChange} />);
    
    const formSelector = screen.getByTestId('form-selector');
    fireEvent.change(formSelector, { target: { value: 'post' } });
    
    expect(onFormChange).toHaveBeenCalledWith('post');
  });

  it('应该处理风格选择', () => {
    const onStyleChange = vi.fn();
    render(<GenerationControls {...defaultProps} onStyleChange={onStyleChange} />);
    
    const styleSelect = screen.getByDisplayValue('professional');
    fireEvent.change(styleSelect, { target: { value: 'casual' } });
    
    expect(onStyleChange).toHaveBeenCalledWith('casual');
  });

  it('应该处理AI模型选择', () => {
    const onModelChange = vi.fn();
    render(<GenerationControls {...defaultProps} onModelChange={onModelChange} />);
    
    const modelSelect = screen.getByDisplayValue('gpt-4');
    fireEvent.change(modelSelect, { target: { value: 'gpt-3.5-turbo' } });
    
    expect(onModelChange).toHaveBeenCalledWith('gpt-3.5-turbo');
  });

  it('应该处理品牌库开关', () => {
    const onBrandLibraryChange = vi.fn();
    render(<GenerationControls {...defaultProps} onBrandLibraryChange={onBrandLibraryChange} />);
    
    const brandSwitch = screen.getByTestId('switch-brand-library');
    fireEvent.change(brandSwitch, { target: { checked: true } });
    
    expect(onBrandLibraryChange).toHaveBeenCalledWith(true);
  });

  it('应该处理自定义提示词', () => {
    const onCustomPromptChange = vi.fn();
    render(<GenerationControls {...defaultProps} onCustomPromptChange={onCustomPromptChange} />);
    
    const promptTextarea = screen.getByTestId('custom-prompt-textarea');
    fireEvent.change(promptTextarea, { target: { value: '自定义提示词' } });
    
    expect(onCustomPromptChange).toHaveBeenCalledWith('自定义提示词');
  });

  it('应该处理生成按钮点击', () => {
    const onGenerate = vi.fn();
    render(<GenerationControls {...defaultProps} onGenerate={onGenerate} />);
    
    const generateButton = screen.getByTestId('generate-button');
    fireEvent.click(generateButton);
    
    expect(onGenerate).toHaveBeenCalled();
  });

  it('应该在生成中时禁用按钮', () => {
    render(<GenerationControls {...defaultProps} generating={true} />);
    
    const generateButton = screen.getByTestId('generate-button');
    expect(generateButton).toBeDisabled();
  });

  it('应该显示生成中状态', () => {
    render(<GenerationControls {...defaultProps} generating={true} />);
    
    expect(screen.getByText('生成中...')).toBeInTheDocument();
  });

  it('应该显示验证错误', () => {
    const validationErrors = ['请输入原始内容', '请选择至少一个平台'];
    render(<GenerationControls {...defaultProps} validationErrors={validationErrors} />);
    
    expect(screen.getByText('请输入原始内容')).toBeInTheDocument();
    expect(screen.getByText('请选择至少一个平台')).toBeInTheDocument();
  });

  it('应该在有验证错误时禁用生成按钮', () => {
    const validationErrors = ['请输入原始内容'];
    render(<GenerationControls {...defaultProps} validationErrors={validationErrors} />);
    
    const generateButton = screen.getByTestId('generate-button');
    expect(generateButton).toBeDisabled();
  });

  it('应该显示品牌库状态', () => {
    render(<GenerationControls {...defaultProps} useBrandLibrary={true} />);
    
    expect(screen.getByText('已启用品牌库')).toBeInTheDocument();
  });

  it('应该显示自定义提示词字符数', () => {
    render(<GenerationControls {...defaultProps} customPrompt="这是自定义提示词" />);
    
    expect(screen.getByText('字符数: 8')).toBeInTheDocument();
  });

  it('应该在内容为空时显示警告', () => {
    render(<GenerationControls {...defaultProps} originalContent="" />);
    
    expect(screen.getByText('请先输入要适配的原始内容')).toBeInTheDocument();
  });

  it('应该在未选择平台时显示警告', () => {
    render(<GenerationControls {...defaultProps} selectedPlatforms={[]} />);
    
    expect(screen.getByText('请先选择目标平台')).toBeInTheDocument();
  });

  it('应该显示高级设置', () => {
    render(<GenerationControls {...defaultProps} />);
    
    expect(screen.getByText('高级设置')).toBeInTheDocument();
  });

  it('应该处理高级设置展开/收起', () => {
    render(<GenerationControls {...defaultProps} />);
    
    const advancedToggle = screen.getByText('高级设置');
    fireEvent.click(advancedToggle);
    
    // 检查高级设置内容是否显示
    expect(screen.getByText('自定义提示词')).toBeInTheDocument();
  });

  it('应该显示生成预览', () => {
    render(<GenerationControls {...defaultProps} />);
    
    expect(screen.getByText('生成预览')).toBeInTheDocument();
    expect(screen.getByText('将为以下平台生成内容:')).toBeInTheDocument();
    expect(screen.getByText('小红书')).toBeInTheDocument();
    expect(screen.getByText('抖音')).toBeInTheDocument();
  });

  it('应该显示模型配置信息', () => {
    render(<GenerationControls {...defaultProps} />);
    
    expect(screen.getByText('当前模型: GPT-4')).toBeInTheDocument();
    expect(screen.getByText('生成质量: 高')).toBeInTheDocument();
  });

  it('应该处理快速设置', () => {
    render(<GenerationControls {...defaultProps} />);
    
    const quickSettingButton = screen.getByText('营销推广');
    fireEvent.click(quickSettingButton);
    
    // 检查是否应用了快速设置
    expect(defaultProps.onStyleChange).toHaveBeenCalledWith('marketing');
  });
});
