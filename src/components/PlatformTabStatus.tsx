import React from 'react';
import { Check, Clock, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 平台Tab状态组件
 * 在平台Tab标签中显示生成状态，包括图标和简短状态词
 */
interface PlatformTabStatusProps {
  /** 平台ID */
  platformId: string;
  /** 状态类型 */
  status: 'waiting' | 'generating' | 'completed' | 'error';
  /** 状态消息 */
  message?: string;
  /** 是否正在生成中 */
  isGenerating?: boolean;
  /** 是否有错误 */
  hasError?: boolean;
  /** 是否有内容 */
  hasContent?: boolean;
  /** 自定义样式类 */
  className?: string;
}

/**
 * 获取状态图标
 */
const getStatusIcon = (status: PlatformTabStatusProps['status']) => {
  switch (status) {
    case 'completed':
      return <Check className="h-3 w-3 text-foreground" />;
    case 'generating':
      return <Clock className="h-3 w-3 text-foreground animate-spin" />;
    case 'error':
      return <X className="h-3 w-3 text-destructive" />;
    case 'waiting':
    default:
      return <AlertCircle className="h-3 w-3 text-muted-foreground" />;
  }
};

/**
 * 获取状态文本
 */
const getStatusText = (status: PlatformTabStatusProps['status']) => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'generating':
      return '生成中';
    case 'error':
      return '失败';
    case 'waiting':
    default:
      return '等待中';
  }
};

/**
 * 获取状态颜色
 */
const getStatusColor = (status: PlatformTabStatusProps['status']) => {
  switch (status) {
    case 'completed':
      return 'text-foreground';
    case 'generating':
      return 'text-foreground';
    case 'error':
      return 'text-destructive';
    case 'waiting':
    default:
      return 'text-muted-foreground';
  }
};

/**
 * 获取Tooltip内容
 */
const getTooltipContent = (status: PlatformTabStatusProps['status'], message?: string) => {
  switch (status) {
    case 'completed':
      return '内容生成成功，点击查看';
    case 'generating':
      return message || '正在生成内容，请稍候';
    case 'error':
      return message || '生成失败，点击重试';
    case 'waiting':
    default:
      return '等待生成内容';
  }
};

/**
 * 平台Tab状态组件
 * 在Tab标签中显示平台生成状态
 */
export const PlatformTabStatus: React.FC<PlatformTabStatusProps> = ({
  platformId,
  status,
  message,
  isGenerating = false,
  hasError = false,
  hasContent = false,
  className
}) => {
  // 根据实际状态确定显示状态
  const displayStatus = hasError ? 'error' : 
                       hasContent ? 'completed' : 
                       isGenerating ? 'generating' : 'waiting';

  return (
    <div className={cn(
      "flex items-center gap-1 ml-2",
      className
    )}>
      {getStatusIcon(displayStatus)}
      <span className={cn(
        "text-xs font-medium",
        getStatusColor(displayStatus)
      )}>
        {getStatusText(displayStatus)}
      </span>
    </div>
  );
};

/**
 * 带Tooltip的平台Tab状态组件
 */
export const PlatformTabStatusWithTooltip: React.FC<PlatformTabStatusProps> = (props) => {
  const { status, message } = props;
  const tooltipContent = getTooltipContent(status, message);

  return (
    <div className="group relative">
      <PlatformTabStatus {...props} />
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {tooltipContent}
        {/* 小三角 */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default PlatformTabStatus; 