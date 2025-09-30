/**
 * Emoji头像系统组件
 * 基于统一emoji管理系统，提供头像选择功能
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shuffle } from 'lucide-react';
import UnifiedEmojiManager from '@/components/shared/UnifiedEmojiManager';
import type { UnifiedEmojiItem } from '@/services/unifiedEmojiSystem';

interface EmojiAvatarSystemProps {
  onEmojiSelect?: (emoji: UnifiedEmojiItem) => void;
  showDownload?: boolean;
  showCopy?: boolean;
  compact?: boolean;
  maxHeight?: string;
}

const EmojiAvatarSystem: React.FC<EmojiAvatarSystemProps> = ({ onEmojiSelect,
  showDownload = true,
  showCopy = true,
  compact = false,
  maxHeight = '600px'
 }) => {
  const [selectedEmoji, setSelectedEmoji] = useState<UnifiedEmojiItem | null>(null);
  const { toast } = useToast();

  // 处理emoji选择
  const handleEmojiSelect = (emoji: UnifiedEmojiItem) => {
    setSelectedEmoji(emoji);
    onEmojiSelect?.(emoji);

    toast({
      title: t('components.labels.头像已选择'),
      description: `选择了${emoji.name} ${emoji.emoji}`,
    });
  };

  // 随机选择emoji
  const handleRandomSelect = async () => {
    try {
      const { getRandomEmojis } = await import('@/services/unifiedEmojiSystem');
      const randomEmojis = getRandomEmojis(1);
      if (randomEmojis.length > 0) {
        handleEmojiSelect(randomEmojis[0]);
      }
    } catch (error) {
      console.error('随机选择emoji失败:', error);
      toast({
        title: "随机选择失败",
        description: "请手动选择emoji",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部控制区 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Emoji头像系统</h3>
          <p className="text-sm text-muted-foreground">从500个精美emoji中选择或随机生成</p>
        </div>
        <Button onClick={handleRandomSelect} className="flex items-center gap-2">
          <Shuffle className="w-4 h-4" />
          随机选择
        </Button>
      </div>

      {/* 当前选中的emoji */}
      {selectedEmoji && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl inline-style-converted" 
              >
                {selectedEmoji.emoji}
              </div>
              <div>
                <h4 className="text-lg">{selectedEmoji.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedEmoji.category} 类别
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* 统一emoji管理器 */}
      <UnifiedEmojiManager
        mode="selector"
        showSearch={true}
        showCategories={true}
        showStats={false}
        showActions={true}
        gridCols={compact ? 12 : 8}
        maxHeight={maxHeight}
        compact={compact}
        allowMultiSelect={false}

        allowCopy={showCopy}
        allowRandom={true}
        source="system"
        onEmojiSelect={handleEmojiSelect}
        className="bg-card rounded-lg"
      />
    </div>
  );
};

export default EmojiAvatarSystem;
