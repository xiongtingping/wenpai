/**
 * 平台选择组件测试
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlatformSelector from '../PlatformSelector';

// Mock dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardContent: ({ children }: any) => <div>{children}</div>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button onClick={onClick} className={`${variant} ${size} ${className}`}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  )
}));

vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, step, className }: any) => (
    <input
      type="range"
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      min={min}
      max={max}
      step={step}
      className={className}
      data-testid="slider"
    />
  )
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

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}));

describe('PlatformSelector', () => {
  const defaultProps = {
    selectedPlatforms: [],
    onPlatformsChange: vi.fn(),
    globalSettings: {
      charCount: 500,
      useEmoji: true,
      useMdFormat: false,
      useAutoFormat: true
    },
    platformSettings: {},
    onGlobalSettingsChange: vi.fn(),
    onPlatformSettingsChange: vi.fn(),
    settingsMode: {
      charCount: 'global' as const,
      emoji: 'global' as const,
      mdFormat: 'global' as const
    },
    onSettingsModeChange: vi.fn(),
    t: (key: string) => key
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染组件', () => {
    render(<PlatformSelector {...defaultProps} />);
    
    expect(screen.getByText('adapt.selectPlatforms')).toBeInTheDocument();
    expect(screen.getByText('adapt.platformSettings')).toBeInTheDocument();
  });

  it('应该显示所有平台选项', () => {
    render(<PlatformSelector {...defaultProps} />);
    
    // 检查主要平台是否显示
    expect(screen.getByText('小红书')).toBeInTheDocument();
    expect(screen.getByText('抖音')).toBeInTheDocument();
    expect(screen.getByText('微博')).toBeInTheDocument();
    expect(screen.getByText('知乎')).toBeInTheDocument();
    expect(screen.getByText('微信公众号')).toBeInTheDocument();
    expect(screen.getByText('B站')).toBeInTheDocument();
  });

  it('应该处理平台选择', () => {
    const onPlatformsChange = vi.fn();
    render(<PlatformSelector {...defaultProps} onPlatformsChange={onPlatformsChange} />);
    
    const xiaohongshuButton = screen.getByText('小红书').closest('button');
    fireEvent.click(xiaohongshuButton!);
    
    expect(onPlatformsChange).toHaveBeenCalledWith(['xiaohongshu']);
  });

  it('应该显示已选择的平台', () => {
    render(<PlatformSelector {...defaultProps} selectedPlatforms={['xiaohongshu', 'douyin']} />);
    
    const xiaohongshuButton = screen.getByText('小红书').closest('button');
    const douyinButton = screen.getByText('抖音').closest('button');
    
    expect(xiaohongshuButton).toHaveClass('ring-2');
    expect(douyinButton).toHaveClass('ring-2');
  });

  it('应该处理全选功能', () => {
    const onPlatformsChange = vi.fn();
    render(<PlatformSelector {...defaultProps} onPlatformsChange={onPlatformsChange} />);
    
    const selectAllButton = screen.getByText('全选');
    fireEvent.click(selectAllButton);
    
    expect(onPlatformsChange).toHaveBeenCalledWith([
      'xiaohongshu', 'douyin', 'weibo', 'zhihu', 'wechat', 'bilibili'
    ]);
  });

  it('应该处理取消全选功能', () => {
    const onPlatformsChange = vi.fn();
    render(<PlatformSelector 
      {...defaultProps} 
      selectedPlatforms={['xiaohongshu', 'douyin', 'weibo', 'zhihu', 'wechat', 'bilibili']}
      onPlatformsChange={onPlatformsChange} 
    />);
    
    const clearAllButton = screen.getByText('清空');
    fireEvent.click(clearAllButton);
    
    expect(onPlatformsChange).toHaveBeenCalledWith([]);
  });

  it('应该显示平台推荐设置', () => {
    render(<PlatformSelector {...defaultProps} selectedPlatforms={['xiaohongshu']} />);
    
    expect(screen.getByText('推荐设置')).toBeInTheDocument();
  });

  it('应该处理字符数设置', () => {
    const onGlobalSettingsChange = vi.fn();
    render(<PlatformSelector {...defaultProps} onGlobalSettingsChange={onGlobalSettingsChange} />);
    
    const slider = screen.getByTestId('slider');
    fireEvent.change(slider, { target: { value: '300' } });
    
    expect(onGlobalSettingsChange).toHaveBeenCalledWith({
      ...defaultProps.globalSettings,
      charCount: 300
    });
  });

  it('应该处理表情符号设置', () => {
    const onGlobalSettingsChange = vi.fn();
    render(<PlatformSelector {...defaultProps} onGlobalSettingsChange={onGlobalSettingsChange} />);
    
    const emojiSwitch = screen.getByTestId('switch-emoji');
    fireEvent.change(emojiSwitch, { target: { checked: false } });
    
    expect(onGlobalSettingsChange).toHaveBeenCalledWith({
      ...defaultProps.globalSettings,
      useEmoji: false
    });
  });

  it('应该处理Markdown格式设置', () => {
    const onGlobalSettingsChange = vi.fn();
    render(<PlatformSelector {...defaultProps} onGlobalSettingsChange={onGlobalSettingsChange} />);
    
    const mdSwitch = screen.getByTestId('switch-markdown');
    fireEvent.change(mdSwitch, { target: { checked: true } });
    
    expect(onGlobalSettingsChange).toHaveBeenCalledWith({
      ...defaultProps.globalSettings,
      useMdFormat: true
    });
  });

  it('应该显示设置模式切换', () => {
    render(<PlatformSelector {...defaultProps} />);
    
    expect(screen.getByText('全局')).toBeInTheDocument();
    expect(screen.getByText('平台')).toBeInTheDocument();
  });

  it('应该处理设置模式切换', () => {
    const onSettingsModeChange = vi.fn();
    render(<PlatformSelector {...defaultProps} onSettingsModeChange={onSettingsModeChange} />);
    
    const platformModeButton = screen.getByText('平台');
    fireEvent.click(platformModeButton);
    
    expect(onSettingsModeChange).toHaveBeenCalledWith({
      ...defaultProps.settingsMode,
      charCount: 'platform'
    });
  });

  it('应该显示平台特定设置', () => {
    render(<PlatformSelector 
      {...defaultProps} 
      selectedPlatforms={['xiaohongshu']}
      settingsMode={{
        charCount: 'platform',
        emoji: 'platform',
        mdFormat: 'platform'
      }}
    />);
    
    expect(screen.getByText('小红书设置')).toBeInTheDocument();
  });

  it('应该处理平台特定设置变更', () => {
    const onPlatformSettingsChange = vi.fn();
    render(<PlatformSelector 
      {...defaultProps} 
      selectedPlatforms={['xiaohongshu']}
      settingsMode={{
        charCount: 'platform',
        emoji: 'platform',
        mdFormat: 'platform'
      }}
      onPlatformSettingsChange={onPlatformSettingsChange}
    />);
    
    // 这里需要根据实际的平台设置UI来测试
    // 例如平台特定的字符数设置等
  });

  it('应该显示选中平台数量', () => {
    render(<PlatformSelector {...defaultProps} selectedPlatforms={['xiaohongshu', 'douyin']} />);
    
    expect(screen.getByText('已选择 2 个平台')).toBeInTheDocument();
  });

  it('应该在未选择平台时显示提示', () => {
    render(<PlatformSelector {...defaultProps} selectedPlatforms={[]} />);
    
    expect(screen.getByText('请至少选择一个平台')).toBeInTheDocument();
  });

  it('应该应用推荐设置', () => {
    const onGlobalSettingsChange = vi.fn();
    render(<PlatformSelector 
      {...defaultProps} 
      selectedPlatforms={['xiaohongshu']}
      onGlobalSettingsChange={onGlobalSettingsChange}
    />);
    
    const applyRecommendedButton = screen.getByText('应用推荐设置');
    fireEvent.click(applyRecommendedButton);
    
    expect(onGlobalSettingsChange).toHaveBeenCalled();
  });
});
