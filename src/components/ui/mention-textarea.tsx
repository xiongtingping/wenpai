/**
 * 支持@引用功能的文本输入组件
 * 用户输入@时可以弹出引用内容选择器
 */

import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AtSign, 
  Database, 
  Bookmark, 
  Radar, 
  FileText, 
  Link, 
  Image,
  Tag,
  Clock
} from "lucide-react";

interface MentionItem {
  id: string;
  title: string;
  content: string;
  type: 'brand' | 'library' | 'radar';
  format: 'text' | 'link' | 'image' | 'pdf';
  tags: string[];
  createdAt: string;
  summary?: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MentionTextarea({ 
  value, 
  onChange, 
  placeholder = "在此输入内容，输入 @ 可快速引用资料...",
  className,
  minHeight = "200px"
}: MentionTextareaProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionItems, setMentionItems] = useState<MentionItem[]>([]);

  // 初始化示例数据
  useEffect(() => {
    setMentionItems([
      {
        id: 'brand-1',
        title: '品牌核心价值观',
        content: '我们致力于为用户提供专业、可靠、创新的解决方案，以用户体验为中心，持续创新，追求卓越。',
        type: 'brand',
        format: 'text',
        tags: ['品牌价值', '核心理念'],
        createdAt: '2024-01-15T10:30:00Z',
        summary: '品牌核心价值观和理念描述'
      },
      {
        id: 'brand-2',
        title: '产品特色介绍',
        content: '🎯 核心卖点：\n• 高效便捷的操作体验\n• 专业可靠的技术支持\n• 性价比超高的解决方案\n• 7×24小时客户服务',
        type: 'brand',
        format: 'text',
        tags: ['产品特色', '卖点'],
        createdAt: '2024-01-14T14:20:00Z',
        summary: '产品核心特色和卖点总结'
      },
      {
        id: 'library-1',
        title: '小红书营销策略分析',
        content: '深度分析小红书平台的用户特征、内容偏好和营销机会，包括用户画像、内容形式、发布时机等关键要素...',
        type: 'library',
        format: 'text',
        tags: ['小红书', '营销策略', '社交媒体'],
        createdAt: '2024-01-15T10:30:00Z',
        summary: '小红书平台营销策略深度分析'
      },
      {
        id: 'library-2',
        title: '2024年内容营销趋势报告',
        content: '# 2024年内容营销趋势报告\n\n## 主要趋势\n1. AI辅助内容创作\n2. 短视频持续火热\n3. 互动式内容增长...',
        type: 'library',
        format: 'pdf',
        tags: ['内容营销', '趋势报告', '2024'],
        createdAt: '2024-01-13T09:15:00Z',
        summary: '2024年内容营销主要趋势和发展方向'
      },
      {
        id: 'radar-1',
        title: 'AI工具推荐：提升工作效率的10个神器',
        content: '分享10个能够显著提升工作效率的AI工具，包括写作助手、图像生成、数据分析等多个领域...',
        type: 'radar',
        format: 'link',
        tags: ['AI工具', '效率提升', '推荐'],
        createdAt: '2024-01-16T16:45:00Z',
        summary: '10个提升工作效率的AI工具推荐'
      },
      {
        id: 'radar-2',
        title: '2024年社交媒体营销新趋势',
        content: '最新的社交媒体营销趋势分析，包括短视频营销、直播带货、KOL合作等新兴模式的发展...',
        type: 'radar',
        format: 'text',
        tags: ['社交媒体', '营销趋势', '2024'],
        createdAt: '2024-01-12T11:20:00Z',
        summary: '2024年社交媒体营销的最新趋势和发展方向'
      }
    ]);
  }, []);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions || filteredMentions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex(prev =>
          prev < filteredMentions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex(prev =>
          prev > 0 ? prev - 1 : filteredMentions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredMentions[selectedMentionIndex]) {
          handleSelectMention(filteredMentions[selectedMentionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowMentions(false);
        setMentionQuery('');
        break;
    }
  };

  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // 检查是否输入了@符号
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@([^@\s]*)$/);
    
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentions(true);
      setSelectedMentionIndex(0); // 重置选中索引
      
      // 计算@符号的位置
      const textarea = e.target;
      const atPosition = textBeforeCursor.lastIndexOf('@');
      const textBeforeAt = textBeforeCursor.substring(0, atPosition);
      const lines = textBeforeAt.split('\n');
      const currentLine = lines.length - 1;
      const charInLine = lines[currentLine].length;
      
      // 简单的位置计算（实际项目中可能需要更精确的计算）
      const lineHeight = 24; // 假设行高
      const charWidth = 8; // 假设字符宽度
      
      setMentionPosition({
        top: currentLine * lineHeight + 30,
        left: charInLine * charWidth + 10
      });
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  // 过滤匹配的引用项
  const filteredMentions = mentionItems.filter(item =>
    item.title.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(mentionQuery.toLowerCase()))
  ).slice(0, 5); // 限制显示数量

  // 处理选择引用项
  const handleSelectMention = (item: MentionItem) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const atPosition = textBeforeCursor.lastIndexOf('@');
    
    const newText = 
      textBeforeCursor.substring(0, atPosition) + 
      `@${item.title} ` + 
      textAfterCursor;
    
    onChange(newText);
    setShowMentions(false);
    setMentionQuery('');
    
    // 重新聚焦到文本框
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = atPosition + item.title.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // 获取格式图标
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'link':
        return <Link className="h-3 w-3" />;
      case 'image':
        return <Image className="h-3 w-3" />;
      case 'pdf':
        return <FileText className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'brand':
        return <Database className="h-3 w-3" />;
      case 'library':
        return <Bookmark className="h-3 w-3" />;
      case 'radar':
        return <Radar className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'brand':
        return 'bg-blue-100 text-blue-800';
      case 'library':
        return 'bg-green-100 text-green-800';
      case 'radar':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        style={{ minHeight }}
      />
      
      {/* @引用下拉菜单 */}
      {showMentions && filteredMentions.length > 0 && (
        <Card
          className="absolute z-50 w-96 max-h-80 shadow-lg border"
          style={{
            top: mentionPosition.top,
            left: mentionPosition.left
          }}
        >
          <CardContent className="p-0">
            <ScrollArea className="h-full max-h-72">
              <div className="p-2 space-y-1">
                {filteredMentions.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded cursor-pointer transition-colors border-l-2 ${
                      index === selectedMentionIndex
                        ? 'bg-blue-50 border-blue-400'
                        : 'border-transparent hover:bg-gray-100 hover:border-blue-400'
                    }`}
                    onClick={() => handleSelectMention(item)}
                    tabIndex={0}
                    role="option"
                    aria-selected={index === selectedMentionIndex}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getTypeIcon(item.type)}
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      <Badge className={`${getTypeColor(item.type)} text-xs flex-shrink-0`}>
                        {item.type === 'brand' ? '品牌库' :
                         item.type === 'library' ? '资料库' : '雷达'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2 whitespace-pre-wrap">
                      {item.summary || (item.content ?
                        (item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content)
                        : '暂无内容')}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        {getFormatIcon(item.format)}
                        <span className="text-xs text-gray-500">
                          {item.format === 'text' ? '文本' :
                           item.format === 'link' ? '链接' :
                           item.format === 'image' ? '图片' : 'PDF'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
