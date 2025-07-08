import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  /**
   * 处理自定义昵称输入
   */
  const handleCustomNicknameChange = (value: string) => {
    setCustomNickname(value);
    onNicknameChange?.(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="custom-nickname">昵称</Label>
      <Input
        id="custom-nickname"
        value={customNickname}
        onChange={(e) => handleCustomNicknameChange(e.target.value)}
        placeholder="输入您喜欢的昵称"
        disabled={disabled}
        maxLength={20}
      />
      <p className="text-xs text-gray-500">
        支持中文、英文、数字，长度2-20位
      </p>
    </div>
  );
} 