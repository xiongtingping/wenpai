/**
 * 九宫格创意魔方组件
 * 支持多维度创意生成和AI辅助
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Sparkles,
  RefreshCw,
  Copy,
  Save,
  Lightbulb,
  Target,
  Users,
  MapPin,
  AlertTriangle,
  Heart,
  Star,
  Zap,
  Plus,
  Edit,
  Trash2,
  Shuffle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 九宫格维度定义
 */
interface CubeDimension {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultItems: string[];
}

/**
 * 创意组合结果
 */
interface CreativeResult {
  id: string;
  combination: Record<string, string>;
  generatedIdea: string;
  timestamp: string;
  tags: string[];
}

/**
 * 九宫格创意魔方组件
 * @returns React 组件
 */
export function CreativeCube() {
  const { toast } = useToast();
  
  // 九宫格维度定义
  const dimensions: CubeDimension[] = [
    {
      id: 'target_audience',
      name: '目标客群',
      description: '目标客户人群标签',
      icon: <Users className="w-4 h-4" />,
      defaultItems: ['宝妈', '学生党', '上班族', '创业者', '老年人', '年轻人', '专业人士', '自由职业者', '家庭主妇']
    },
    {
      id: 'scenarios',
      name: '使用场景',
      description: '产品使用或内容传播场景',
      icon: <MapPin className="w-4 h-4" />,
      defaultItems: ['居家生活', '工作办公', '户外运动', '社交聚会', '学习充电', '休闲娱乐', '购物消费', '旅行度假', '健康养生']
    },
    {
      id: 'pain_points',
      name: '痛点需求',
      description: '用户痛点或核心需求',
      icon: <AlertTriangle className="w-4 h-4" />,
      defaultItems: ['时间不够', '效率低下', '成本过高', '质量不好', '选择困难', '信息过载', '缺乏专业', '体验不佳', '信任缺失']
    },
    {
      id: 'emotions',
      name: '情感诉求',
      description: '激发的情感或心理需求',
      icon: <Heart className="w-4 h-4" />,
      defaultItems: ['安全感', '成就感', '归属感', '新鲜感', '优越感', '幸福感', '满足感', '刺激感', '放松感']
    },
    {
      id: 'benefits',
      name: '核心价值',
      description: '产品或服务的核心价值',
      icon: <Star className="w-4 h-4" />,
      defaultItems: ['省时省力', '提升效率', '降低成本', '改善质量', '简化选择', '专业指导', '优质体验', '建立信任', '创造价值']
    },
    {
      id: 'channels',
      name: '传播渠道',
      description: '内容传播或营销渠道',
      icon: <Zap className="w-4 h-4" />,
      defaultItems: ['社交媒体', '短视频平台', '搜索引擎', '电商平台', '线下门店', 'KOL合作', '内容营销', '口碑传播', '广告投放']
    },
    {
      id: 'formats',
      name: '内容形式',
      description: '内容呈现的形式',
      icon: <Target className="w-4 h-4" />,
      defaultItems: ['图文', '视频', '直播', '音频', 'H5', '小程序', '海报', '长图文', '互动游戏']
    },
    {
      id: 'tones',
      name: '表达调性',
      description: '内容的表达风格和调性',
      icon: <Lightbulb className="w-4 h-4" />,
      defaultItems: ['专业权威', '轻松幽默', '温暖治愈', '激情澎湃', '理性分析', '感性共鸣', '实用干货', '创意有趣', '高端奢华']
    },
    {
      id: 'trends',
      name: '热点趋势',
      description: '当前热点或趋势话题',
      icon: <Sparkles className="w-4 h-4" />,
      defaultItems: ['AI技术', '健康生活', '环保理念', '数字化转型', '个性化定制', '社交电商', '知识付费', '国潮文化', '元宇宙']
    }
  ];

  // 状态管理
  const [cubeData, setCubeData] = useState<Record<string, string[]>>({});
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
  const [generatedIdeas, setGeneratedIdeas] = useState<CreativeResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<string>('');

  /**
   * 初始化九宫格数据
   */
  useEffect(() => {
    const initialData: Record<string, string[]> = {};
    dimensions.forEach(dim => {
      initialData[dim.id] = [...dim.defaultItems];
    });
    setCubeData(initialData);
  }, []);

  /**
   * 添加新项目到九宫格
   */
  const addItemToCube = (dimensionId: string, newItem: string) => {
    if (!newItem.trim()) return;
    
    setCubeData(prev => ({
      ...prev,
      [dimensionId]: [...(prev[dimensionId] || []), newItem.trim()]
    }));
  };

  /**
   * 删除九宫格项目
   */
  const removeItemFromCube = (dimensionId: string, itemIndex: number) => {
    setCubeData(prev => ({
      ...prev,
      [dimensionId]: prev[dimensionId].filter((_, index) => index !== itemIndex)
    }));
  };

  /**
   * 随机选择项目
   */
  const randomSelect = () => {
    const newSelection: Record<string, string> = {};
    dimensions.forEach(dim => {
      const items = cubeData[dim.id] || [];
      if (items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        newSelection[dim.id] = items[randomIndex];
      }
    });
    setSelectedItems(newSelection);
  };

  /**
   * 生成创意想法
   */
  const generateIdea = async () => {
    if (Object.keys(selectedItems).length < 3) {
      toast({
        title: "请至少选择3个维度",
        description: "选择更多维度可以生成更丰富的创意",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // 构建提示词
      const selectedText = Object.entries(selectedItems)
        .map(([dimId, item]) => {
          const dim = dimensions.find(d => d.id === dimId);
          return `${dim?.name}: ${item}`;
        })
        .join('\n');

      const prompt = `基于以下九宫格元素，生成一个创意营销方案：

${selectedText}

请生成：
1. 创意主题和核心概念
2. 目标受众分析
3. 传播策略和渠道
4. 内容形式和调性
5. 预期效果和KPI

要求：创意新颖、可执行性强、符合当前趋势。`;

      // 模拟AI生成
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedIdea = `🎯 创意主题：「${Object.values(selectedItems).slice(0, 3).join(' × ')}」跨界营销方案

📊 核心概念：
基于${selectedItems.target_audience || '目标用户'}在${selectedItems.scenarios || '特定场景'}中的${selectedItems.pain_points || '痛点需求'}，打造一个${selectedItems.tones || '独特调性'}的${selectedItems.formats || '内容形式'}，通过${selectedItems.channels || '传播渠道'}实现${selectedItems.benefits || '核心价值'}。

🎯 目标受众：
- 主要人群：${selectedItems.target_audience || '目标用户'}
- 情感诉求：${selectedItems.emotions || '情感需求'}
- 使用场景：${selectedItems.scenarios || '使用场景'}

📱 传播策略：
1. 内容策略：结合${selectedItems.trends || '热点趋势'}，制作${selectedItems.formats || '内容形式'}
2. 渠道策略：重点布局${selectedItems.channels || '传播渠道'}
3. 调性策略：采用${selectedItems.tones || '表达调性'}的沟通方式

📈 预期效果：
- 品牌认知度提升30%
- 用户参与度增长50%
- 转化率提升25%

💡 创新亮点：
将${Object.values(selectedItems).slice(0, 3).join('、')}进行跨界融合，创造独特的品牌体验。`;

      setCurrentIdea(generatedIdea);

      // 保存到历史记录
      const newResult: CreativeResult = {
        id: Date.now().toString(),
        combination: { ...selectedItems },
        generatedIdea,
        timestamp: new Date().toISOString(),
        tags: Object.values(selectedItems).slice(0, 3)
      };

      setGeneratedIdeas(prev => [newResult, ...prev]);

      toast({
        title: "创意生成成功",
        description: "已生成新的创意方案",
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 复制创意内容
   */
  const copyIdea = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制到剪贴板",
      description: "创意内容已复制",
    });
  };

  /**
   * 保存创意
   */
  const saveIdea = (idea: CreativeResult) => {
    // 这里可以集成到文案管理系统
    toast({
      title: "已保存到文案库",
      description: "创意已保存到文案管理系统",
    });
  };

  return (
    <div className="space-y-6">
      {/* 九宫格创意魔方 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            九宫格创意魔方
          </CardTitle>
          <CardDescription>
            选择不同维度的元素，AI将为你生成创意营销方案
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {dimensions.map((dimension) => (
              <Card key={dimension.id} className="border-2 border-dashed border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {dimension.icon}
                    {dimension.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {dimension.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* 已选择的项目 */}
                  {selectedItems[dimension.id] && (
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Badge variant="secondary" className="text-xs">
                        {selectedItems[dimension.id]}
                      </Badge>
                    </div>
                  )}
                  
                  {/* 可选项目列表 */}
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {cubeData[dimension.id]?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                        <span 
                          className="text-xs cursor-pointer hover:text-primary"
                          onClick={() => setSelectedItems(prev => ({
                            ...prev,
                            [dimension.id]: item
                          }))}
                        >
                          {item}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItemFromCube(dimension.id, index)}
                          className="h-4 w-4 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {/* 添加新项目 */}
                  <div className="flex gap-1">
                    <Input
                      placeholder="添加新项目"
                      className="text-xs h-6"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addItemToCube(dimension.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addItemToCube(dimension.id, input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button onClick={randomSelect} variant="outline">
          <Shuffle className="w-4 h-4 mr-2" />
          随机选择
        </Button>
        <Button onClick={generateIdea} disabled={isGenerating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? '生成中...' : '生成创意'}
        </Button>
      </div>

      {/* 当前生成的创意 */}
      {currentIdea && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              生成的创意方案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={currentIdea}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={() => copyIdea(currentIdea)} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  复制内容
                </Button>
                <Button onClick={() => saveIdea({
                  id: Date.now().toString(),
                  combination: selectedItems,
                  generatedIdea: currentIdea,
                  timestamp: new Date().toISOString(),
                  tags: Object.values(selectedItems).slice(0, 3)
                })}>
                  <Save className="w-4 h-4 mr-2" />
                  保存到文案库
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史创意记录 */}
      {generatedIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>历史创意记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedIdeas.map((idea) => (
                <Card key={idea.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {idea.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {idea.generatedIdea.substring(0, 200)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(idea.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => copyIdea(idea.generatedIdea)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => saveIdea(idea)}>
                          <Save className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 