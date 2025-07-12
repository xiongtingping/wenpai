/**
 * 品牌Emoji生成器 - 第二步提示词构建组件
 * 基于角色描述和品牌信息生成多种表情的提示词
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Palette, 
  Settings, 
  Check, 
  Copy, 
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 基础表情列表
 */
export const baseEmotions = [
  '开心微笑', '大笑', '生气', '哭泣', '惊讶', '疑惑', '睡觉', '吐舌',
  '鼓掌', '比心', '点赞', 'OK 手势', '拒绝', '拍头', '举手提问', '加油',
  '挑眉', '害羞', '眨眼', '黑脸', '鼻涕泡', '流口水', '咀嚼', '偷笑',
  '吓到', '打喷嚏', '爱心眼', '庆祝', '拿红包', '举杯微笑'
];

/**
 * 提示词数据接口
 */
interface PromptData {
  emotion: string;
  prompt: string;
  selected: boolean;
}

/**
 * 提示词构建器属性
 */
interface BrandEmojiPromptBuilderProps {
  /** 角色描述 */
  characterDesc: string;
  /** 品牌名称 */
  brand: string;
  /** 上传的图片文件 */
  uploadedImage?: File | null;
  /** 确认回调函数 */
  onConfirm: (prompts: PromptData[]) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 构建提示词
 */
export function buildPrompts(characterDesc: string, brand: string, uploadedImage?: File | null): PromptData[] {
  // 基础品牌描述增强
  const enhancedDesc = characterDesc.trim() || '可爱的卡通形象';
  
  // 构建更详细的提示词模板
  const basePrompt = `一个${brand}品牌的${enhancedDesc}，`;
  
  return baseEmotions.map((emotion) => {
    // 根据不同表情类型构建更具体的描述
    let emotionDesc = '';
    switch (emotion) {
      case '开心微笑':
        emotionDesc = '面带温暖微笑，眼睛弯弯的，表情友好亲切';
        break;
      case '大笑':
        emotionDesc = '开怀大笑，眼睛眯成一条线，露出整齐的牙齿';
        break;
      case '生气':
        emotionDesc = '眉头紧皱，嘴巴抿成一条线，表情严肃但不可怕';
        break;
      case '哭泣':
        emotionDesc = '眼角含泪，嘴巴微微下垂，表情委屈但可爱';
        break;
      case '惊讶':
        emotionDesc = '眼睛睁大，嘴巴微微张开，表情惊讶但有趣';
        break;
      case '疑惑':
        emotionDesc = '歪着头，眉毛微微上扬，表情困惑但可爱';
        break;
      case '睡觉':
        emotionDesc = '闭着眼睛，嘴巴微微张开，表情安详可爱';
        break;
      case '吐舌':
        emotionDesc = '调皮地吐着舌头，眼睛眨着，表情俏皮可爱';
        break;
      case '鼓掌':
        emotionDesc = '双手鼓掌，脸上带着赞许的笑容';
        break;
      case '比心':
        emotionDesc = '双手比心，脸上带着温暖的笑容';
        break;
      case '点赞':
        emotionDesc = '竖起大拇指，脸上带着赞许的表情';
        break;
      case 'OK 手势':
        emotionDesc = '做出OK手势，脸上带着自信的笑容';
        break;
      case '拒绝':
        emotionDesc = '摇头摆手，表情坚定但友好';
        break;
      case '拍头':
        emotionDesc = '轻拍头部，表情恍然大悟';
        break;
      case '举手提问':
        emotionDesc = '举手提问，表情好奇认真';
        break;
      case '加油':
        emotionDesc = '握拳加油，表情充满干劲';
        break;
      case '挑眉':
        emotionDesc = '单边挑眉，表情俏皮有趣';
        break;
      case '害羞':
        emotionDesc = '脸颊微红，低头害羞，表情可爱';
        break;
      case '眨眼':
        emotionDesc = '单眼眨眼，表情俏皮可爱';
        break;
      case '黑脸':
        emotionDesc = '表情严肃，但保持可爱风格';
        break;
      case '鼻涕泡':
        emotionDesc = '鼻子冒泡，表情呆萌可爱';
        break;
      case '流口水':
        emotionDesc = '嘴角流口水，表情馋嘴可爱';
        break;
      case '咀嚼':
        emotionDesc = '嘴巴咀嚼，表情满足可爱';
        break;
      case '偷笑':
        emotionDesc = '偷偷笑着，表情俏皮可爱';
        break;
      case '吓到':
        emotionDesc = '被吓到，表情惊讶但可爱';
        break;
      case '打喷嚏':
        emotionDesc = '打喷嚏，表情可爱';
        break;
      case '爱心眼':
        emotionDesc = '眼睛变成爱心，表情迷恋可爱';
        break;
      case '庆祝':
        emotionDesc = '庆祝动作，表情开心兴奋';
        break;
      case '拿红包':
        emotionDesc = '拿着红包，表情开心满足';
        break;
      case '举杯微笑':
        emotionDesc = '举杯微笑，表情优雅友好';
        break;
      default:
        emotionDesc = `正在${emotion}`;
    }
    
    // 构建完整的提示词
    const fullPrompt = `${basePrompt}${emotionDesc}，表情风格为 emoji，扁平卡通风，透明背景，高质量，细节丰富`;
    
    return {
      emotion,
      prompt: fullPrompt,
      selected: true
    };
  });
}

/**
 * 品牌Emoji提示词构建器组件
 */
export default function BrandEmojiPromptBuilder({
  characterDesc,
  brand,
  onConfirm,
  className = '',
  uploadedImage
}: BrandEmojiPromptBuilderProps) {
  const [customBrand, setCustomBrand] = useState(brand);
  const [customDesc, setCustomDesc] = useState(characterDesc);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [styleOptions, setStyleOptions] = useState({
    flatStyle: true,
    transparentBg: true,
    emojiStyle: true,
    cartoonStyle: true
  });
  const [selectedPrompts, setSelectedPrompts] = useState<PromptData[]>([]);
  
  const { toast } = useToast();

  /**
   * 生成提示词列表
   */
  const prompts = useMemo(() => {
    const basePrompts = buildPrompts(customDesc, customBrand, uploadedImage);
    
    // 应用样式选项
    const styleSuffix = [
      styleOptions.emojiStyle && '表情风格为 emoji',
      styleOptions.cartoonStyle && '扁平卡通风',
      styleOptions.transparentBg && '透明背景'
    ].filter(Boolean).join('，');
    
    return basePrompts.map(prompt => ({
      ...prompt,
      prompt: prompt.prompt.replace(/，表情风格为 emoji，扁平卡通风，透明背景/, `，${styleSuffix}`)
    }));
  }, [customDesc, customBrand, styleOptions, uploadedImage]);

  /**
   * 处理选择状态变化
   */
  const handleSelectionChange = (emotion: string, selected: boolean) => {
    setSelectedPrompts(prev => {
      const updated = prev.map(p => 
        p.emotion === emotion ? { ...p, selected } : p
      );
      return updated;
    });
  };

  /**
   * 全选/取消全选
   */
  const handleSelectAll = (selected: boolean) => {
    setSelectedPrompts(prompts.map(p => ({ ...p, selected })));
  };

  /**
   * 复制提示词
   */
  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "复制成功",
      description: "提示词已复制到剪贴板",
    });
  };

  /**
   * 导出提示词
   */
  const exportPrompts = () => {
    const selectedPrompts = prompts.filter(p => p.selected);
    const data = {
      brand: customBrand,
      characterDesc: customDesc,
      prompts: selectedPrompts.map(p => ({
        emotion: p.emotion,
        prompt: p.prompt
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customBrand}-品牌emoji提示词.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "导出成功",
      description: "提示词已导出为JSON文件",
    });
  };

  /**
   * 处理确认
   */
  const handleConfirm = () => {
    const selected = prompts.filter(p => p.selected);
    if (selected.length === 0) {
      toast({
        title: "请选择表情",
        description: "至少选择一个表情进行生成",
        variant: "destructive"
      });
      return;
    }
    onConfirm(selected);
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="w-6 h-6" />
          Step 2：配置品牌emoji提示词
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基础配置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">品牌名称</Label>
            <Input
              value={customBrand}
              onChange={(e) => setCustomBrand(e.target.value)}
              placeholder="例如：文派、小米、华为"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">角色描述</Label>
            <Input
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="例如：穿汉服的小狐狸，戴眼镜"
              className="mt-1"
            />
          </div>
        </div>

        {/* 高级设置 */}
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? '隐藏' : '显示'}高级设置
          </Button>
          
          {showAdvanced && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emojiStyle"
                  checked={styleOptions.emojiStyle}
                  onCheckedChange={(checked) => 
                    setStyleOptions(prev => ({ ...prev, emojiStyle: !!checked }))
                  }
                />
                <Label htmlFor="emojiStyle" className="text-sm">Emoji风格</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cartoonStyle"
                  checked={styleOptions.cartoonStyle}
                  onCheckedChange={(checked) => 
                    setStyleOptions(prev => ({ ...prev, cartoonStyle: !!checked }))
                  }
                />
                <Label htmlFor="cartoonStyle" className="text-sm">卡通风格</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flatStyle"
                  checked={styleOptions.flatStyle}
                  onCheckedChange={(checked) => 
                    setStyleOptions(prev => ({ ...prev, flatStyle: !!checked }))
                  }
                />
                <Label htmlFor="flatStyle" className="text-sm">扁平化</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transparentBg"
                  checked={styleOptions.transparentBg}
                  onCheckedChange={(checked) => 
                    setStyleOptions(prev => ({ ...prev, transparentBg: !!checked }))
                  }
                />
                <Label htmlFor="transparentBg" className="text-sm">透明背景</Label>
              </div>
            </div>
          )}
        </div>

        {/* 提示词列表 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">表情提示词列表</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(true)}
              >
                全选
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(false)}
              >
                取消全选
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportPrompts}
              >
                <Download className="w-4 h-4 mr-1" />
                导出
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-96 border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prompts.map((prompt, index) => (
                <div
                  key={prompt.emotion}
                  className={`p-4 border rounded-lg transition-colors ${
                    prompt.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={prompt.selected}
                        onCheckedChange={(checked) => 
                          handleSelectionChange(prompt.emotion, !!checked)
                        }
                      />
                      <Badge variant="secondary" className="text-xs">
                        {prompt.emotion}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrompt(prompt.prompt)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {prompt.prompt}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            已选择 {prompts.filter(p => p.selected).length} / {prompts.length} 个表情
          </div>
          <Button
            onClick={handleConfirm}
            disabled={prompts.filter(p => p.selected).length === 0}
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            ✅ 确认并开始生成
          </Button>
        </div>

        {/* 提示信息 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 提示：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>系统预设了30种常用表情，您可以选择需要的表情进行生成</li>
            <li>提示词会自动包含品牌名称和角色描述</li>
            <li>支持自定义品牌名称和角色描述</li>
            <li>可以导出提示词用于其他AI工具</li>
            <li>建议选择10-20个表情进行批量生成</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 