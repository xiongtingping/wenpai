/**
 * Emoji展示组件
 * 简化版本，提供基本的展示、删除和重生功能
 */

import React from 'react';

interface EmojiGalleryProps {
  emojis: Array<{ emotion: string; url: string }>;
  onDelete: (emotion: string) => void;
  onRegenerate: (emotion: string) => void;
}

export default function EmojiGallery({ emojis, onDelete, onRegenerate }: EmojiGalleryProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {emojis.map(({ emotion, url }) => (
        <div key={emotion} className="text-center">
          <img
            src={url}
            alt={emotion}
            className="w-16 h-16 mx-auto cursor-pointer"
            onClick={() => navigator.clipboard.writeText(url)}
            title="点击复制链接"
          />
          <p className="text-xs">{emotion}</p>
          <div className="flex justify-center space-x-2 mt-1">
            <button 
              className="text-red-500 text-xs" 
              onClick={() => onDelete(emotion)}
            >
              删除
            </button>
            <button 
              className="text-blue-500 text-xs" 
              onClick={() => onRegenerate(emotion)}
            >
              重生
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 