import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wand2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateNicknameOptions, validateNickname } from '@/lib/nickname-generator';

/**
 * 昵称选择器属性
 */
interface NicknameSelectorProps {
  /** 当前昵称 */
  currentNickname?: string;
  /** 昵称变化回调 */
  onNicknameChange?: (nickname: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 昵称选择器组件
 */
export function NicknameSelector({
  currentNickname = '',
  onNicknameChange,
  disabled = false
}: NicknameSelectorProps) {
  const [customNickname, setCustomNickname] = useState(currentNickname);
  const [suggestedNicknames, setSuggestedNicknames] = useState<string[]>([]);
  const [selectedNickname, setSelectedNickname] = useState(currentNickname);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  /**
   * 生成推荐昵称
   */
  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const nicknames = generateNicknameOptions(6);
      setSuggestedNicknames(nicknames);
      toast({
        title: "昵称生成成功",
        description: "已为您生成6个有趣的昵称",
      });
    } catch (error) {
      console.error('生成昵称失败:', error);
      toast({
        title: "生成失败",
        description: "昵称生成失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 选择昵称
   */
  const selectNickname = (nickname: string) => {
    setSelectedNickname(nickname);
    setCustomNickname(nickname);
    onNicknameChange?.(nickname);
  };

  /**
   * 处理自定义昵称输入
   */
  const handleCustomNicknameChange = (value: string) => {
    setCustomNickname(value);
    setSelectedNickname(value);
    onNicknameChange?.(value);
  };

  /**
   * 验证并保存自定义昵称
   */
  const validateAndSaveCustomNickname = () => {
    if (!customNickname.trim()) {
      toast({
        title: "昵称不能为空",
        description: "请输入一个昵称",
        variant: "destructive"
      });
      return;
    }

    if (!validateNickname(customNickname)) {
      toast({
        title: "昵称格式不正确",
        description: "昵称只能包含中文、英文、数字，长度2-20位",
        variant: "destructive"
      });
      return;
    }

    setSelectedNickname(customNickname);
    onNicknameChange?.(customNickname);
    toast({
      title: "昵称设置成功",
      description: "您的昵称已更新",
    });
  };

  /**
   * 初始化推荐昵称
   */
  useEffect(() => {
    if (suggestedNicknames.length === 0) {
      generateSuggestions();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* 自定义昵称输入 */}
      <div className="space-y-2">
        <Label htmlFor="custom-nickname">自定义昵称</Label>
        <div className="flex gap-2">
          <Input
            id="custom-nickname"
            value={customNickname}
            onChange={(e) => handleCustomNicknameChange(e.target.value)}
            placeholder="输入您喜欢的昵称"
            disabled={disabled}
            maxLength={20}
          />
          <Button
            onClick={validateAndSaveCustomNickname}
            disabled={disabled || !customNickname.trim()}
            size="sm"
          >
            <Check className="h-4 w-4 mr-1" />
            确定
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          支持中文、英文、数字，长度2-20位
        </p>
      </div>

      {/* 推荐昵称 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>推荐昵称</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={disabled || isGenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? '生成中...' : '换一批'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {suggestedNicknames.map((nickname, index) => (
            <Button
              key={index}
              variant={selectedNickname === nickname ? "default" : "outline"}
              size="sm"
              onClick={() => selectNickname(nickname)}
              disabled={disabled}
              className="justify-start"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              {nickname}
              {selectedNickname === nickname && (
                <Check className="h-3 w-3 ml-auto" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* 当前选择的昵称 */}
      {selectedNickname && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Badge variant="secondary">当前昵称</Badge>
          <span className="font-medium">{selectedNickname}</span>
        </div>
      )}
    </div>
  );
} 