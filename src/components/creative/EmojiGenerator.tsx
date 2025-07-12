/**
 * Emoji生成组件
 * 调用AI接口生成个性化Emoji图像
 */

import React, { useState } from 'react';
import { buildEmotionPrompts } from '@/lib/emoji-prompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface EmojiGeneratorProps {
  character: string;
  brand: string;
  uploadedImage?: File | null;
}

export default function EmojiGenerator({ character, brand, uploadedImage }: EmojiGeneratorProps) {
  const [results, setResults] = useState<Array<{ emotion: string; url: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const { toast } = useToast();

  /**
   * 创建SVG占位符图片
   */
  const createPlaceholderImage = (emotion: string, text: string = '生成失败') => {
    const svgContent = `
      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill="#f3f4f6"/>
        <text x="32" y="32" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="8">${emotion}</text>
        <text x="32" y="44" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="6">${text}</text>
      </svg>
    `;
    // 使用encodeURIComponent避免btoa编码问题
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
  };

  /**
   * 调用图像生成API（带重试机制）
   */
  const generateImage = async (prompt: string): Promise<string> => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`尝试生成图像 (第${attempt}次): ${prompt.substring(0, 30)}...`);
        
        // 准备请求数据
        const requestData: any = {
          provider: 'openai',
          action: 'generate-image',
          prompt: prompt,
          n: 1,
          size: '512x512',
          response_format: 'url'
        };

        // 如果有参考图片，添加图片上传
        if (uploadedImage) {
          // 将图片转换为base64
          const base64Image = await fileToBase64(uploadedImage);
          requestData.reference_image = base64Image;
          requestData.prompt = `基于参考图片的风格和特征，${prompt}`;
        }

        const response = await fetch('/.netlify/functions/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.data?.images?.[0]?.url) {
          console.log(`图像生成成功 (第${attempt}次尝试)`);
          return data.data.images[0].url;
        } else {
          throw new Error(data.error || data.message || '图像生成失败');
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`图像生成失败 (第${attempt}次尝试):`, lastError.message);
        
        if (attempt < maxRetries) {
          // 等待一段时间后重试
          const delay = attempt * 1000; // 1秒, 2秒, 3秒
          console.log(`等待${delay}ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // 所有重试都失败了
    throw new Error(`图像生成失败，已重试${maxRetries}次: ${lastError?.message}`);
  };

  /**
   * 将文件转换为base64，并压缩图片
   */
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const base64 = reader.result as string;
        
        // 如果文件小于1MB，直接使用
        if (file.size < 1024 * 1024) {
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
          return;
        }
        
        // 压缩图片
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 计算压缩后的尺寸，最大512x512
          let { width, height } = img;
          const maxSize = 512;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // 绘制压缩后的图片
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 转换为base64，使用较低的质量
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          const base64Data = compressedBase64.split(',')[1];
          resolve(base64Data);
        };
        
        img.onerror = () => {
          // 如果压缩失败，使用原始图片
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        
        img.src = base64;
      };
      reader.onerror = error => reject(error);
    });
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResults([]);
    setProgress(0);
    setCurrentEmotion('');
    setCurrentCount(0);

    try {
      const prompts = buildEmotionPrompts(character, brand, uploadedImage);
      setTotalCount(prompts.length);

      // 串行处理，避免并发请求导致的问题
      const emojis = [];
      const totalPrompts = prompts.length;
      
      for (let i = 0; i < totalPrompts; i++) {
        const { prompt, emotion } = prompts[i];
        try {
          console.log(`正在生成${emotion}表情... (${i + 1}/${totalPrompts})`);
          setCurrentEmotion(emotion);
          setCurrentCount(i + 1);
          setProgress(((i + 1) / totalPrompts) * 100);
          
          // 调用图像生成API
          const imageUrl = await generateImage(prompt);
          emojis.push({ emotion, url: imageUrl });
          console.log(`${emotion}表情生成成功 (${i + 1}/${totalPrompts})`);
          
          // 每生成3个表情后稍作停顿，避免API限制
          if ((i + 1) % 3 === 0 && i < totalPrompts - 1) {
            console.log('暂停3秒，避免API限制...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`生成${emotion}表情失败:`, error);
          // 返回错误占位符
          emojis.push({ 
            emotion, 
            url: createPlaceholderImage(emotion, '生成失败')
          });
          
          // 如果连续失败2次，暂停更长时间
          const recentFailures = emojis.slice(-2).filter(e => e.url.includes('生成失败')).length;
          if (recentFailures >= 2) {
            console.log('检测到连续失败，暂停8秒...');
            await new Promise(resolve => setTimeout(resolve, 8000));
          }
        }
      }

      setResults(emojis);
      toast({
        title: "生成完成",
        description: `成功生成 ${emojis.length} 个个性化Emoji`,
      });
    } catch (error) {
      console.error('批量生成失败:', error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentEmotion('');
      setCurrentCount(0);
      setTotalCount(0);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Step 3：AI 生成品牌 Emoji</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isGenerating ? '生成中...' : '开始生成'}
        </Button>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>生成进度</span>
              <span>{currentCount}/{totalCount} ({Math.round(progress)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {currentEmotion && (
              <p className="text-sm text-gray-600 text-center">
                正在生成: {currentEmotion}
              </p>
            )}
            <p className="text-xs text-gray-500 text-center">
              预计剩余时间: {Math.ceil((totalCount - currentCount) * 8)} 秒
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-5 gap-4 mt-4">
            {results.map(({ emotion, url }) => (
              <div key={emotion} className="text-center">
                <img 
                  src={url} 
                  alt={emotion} 
                  className="w-16 h-16 object-contain mx-auto border rounded-lg" 
                />
                <p className="text-xs mt-1 text-gray-600">{emotion}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 