/**
 * 九宫格创意魔方组件 - 优化版
 * 支持多维度深度融合，生成可用创意内容
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { logger } from '@/utils/logger';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
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
  Trash2,
  Shuffle,
  Download,
  FileText,
  Video,
  Music,
  Camera,
  Clock,
  Building2,
  AlertCircle,
  Palette,
  TrendingUp,
  Pin,
  X,
  Eye,
  RotateCcw,
  ArrowRight,
  BookOpen,
  MoreHorizontal,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MarketingCalendar from './MarketingCalendar';
import { MomentsTextGenerator } from './MomentsTextGenerator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/stores/compatibility-layer';
import { callUnifiedAI } from '@/api/unifiedAIService';
import { AITaskType } from '@/api/aiService';
import { Label as UILabel } from '@/components/ui/label';
import { useUserDataIsolation } from '@/utils/userDataIsolation';
import {
  getCreativeCubeDimensions,
  getRequiredDimensionIds,
  getRecommendedDimensionIds,
  getOptionalDimensionIds,
  selectDimensionCombination,
  buildCreativeCubePrompt,
  type CreativeCubeDimension,
  type CreativeCubeSelection,
  type CreativeCubeConfig
} from '@/prompts/PromptSystem';

/**
 * 九宫格维度定义
 */
interface CubeDimension {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultItems: string[];
  isPinnable: boolean; // 是否可固定
}

/**
 * 创意组合结果
 */
interface CreativeResult {
  id: string;
  combination: Record<string, string>;
  generatedContent: string;
  contentType: 'text' | 'video';
  timestamp: string;
  tags: string[];
}

/**
 * 短视频分镜脚本
 */
interface VideoScript {
  sceneNumber: string;
  sceneDescription: string;
  dialogue: string;
  tone: string;
  emotion: string;
  bgm: string;
  soundEffect: string;
  shotType: string;
  duration: number;
  notes?: string;
}

/**
 * 维度卡片组件
 */
interface DimensionCardProps {
  dimension: CubeDimension;
  selectedItems: string[];
  onSelect: (item: string) => void;
  onDeselect: (item: string) => void;
  onPin: () => void;
  isPinned: boolean;
  cubeData: string[];
  onAddCustomItem: (item: string) => void;
  onRemoveItem?: (item: string) => void;
  onPinItem?: (item: string) => void;
  onUnpinItem?: (item: string) => void;
  pinnedItems?: string[];
  hiddenItems?: string[];
  isRequired: boolean;
  onRestoreDefaults?: (dimensionId: string) => void;
  customDimensionsManager?: any;
}

function DimensionCard({
  dimension,
  selectedItems,
  onSelect,
  onDeselect,
  onPin,
  isPinned,
  cubeData,
  onAddCustomItem,
  onRemoveItem,
  onPinItem,
  onUnpinItem,
  pinnedItems = [],
  hiddenItems = [],
  isRequired,
  onRestoreDefaults,
  customDimensionsManager
}: DimensionCardProps) {
  const [newItem, setNewItem] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const selectedItem = Array.isArray(selectedItems) ? selectedItems[0] : selectedItems;

  const handleAddItem = () => {
    if (newItem.trim()) {
      onAddCustomItem(newItem.trim());
      setNewItem('');
      setShowAddInput(false);
    }
  };

  // 检查是否有被隐藏的默认项
  const hasHiddenDefaultItems = dimension.defaultItems.some(item =>
    hiddenItems.includes(item)
  );

  return (
    <Card className={`relative overflow-hidden ${isRequired ? 'border-primary' : ''} ${selectedItem ? 'ring-2 ring-primary/20' : ''}`}>
      
      <CardHeader className="pb-2 p-3 bg-gradient-to-r from-muted/50 to-muted border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dimension.icon}
            <CardTitle className="text-sm font-semibold">{dimension.name}</CardTitle>
            {isRequired && <Badge variant="destructive" className="text-xs px-1.5 py-0.5">必选</Badge>}
          </div>

          {hasHiddenDefaultItems && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRestoreDefaults?.(dimension.id)}
              className="h-6 px-2 text-xs hover:bg-primary/10 hover:border-primary/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              还原
            </Button>
          )}
        </div>
        {dimension.description && (
          <p className="text-xs text-muted-foreground mt-1">{dimension.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="p-3 bg-card">
        {selectedItem && (
          <div className="mb-2 p-2 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-between">
            <span className="text-xs font-medium text-primary truncate">{selectedItem}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeselect(selectedItem)}
              className="h-4 w-4 p-0 hover:bg-primary/20 flex-shrink-0 ml-1"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1 text-center">
          
          {dimension.defaultItems
            .filter(item => !hiddenItems.includes(item))
            .map((item, index) => {
              const isPinned = pinnedItems.includes(item);
              return (
                <div key={`default-${item}-${index}`} className="relative group">
                  <Button
                    size="sm"
                    variant={selectedItem === item ? "default" : "outline"}
                    className={`text-xs h-6 px-1.5 justify-center w-full transition-all ${
                      isPinned
                        ? 'border-amber-400 bg-amber-50 hover:bg-amber-100 shadow-sm'
                        : 'hover:shadow-sm'
                    }`}
                    onClick={() => selectedItem === item ? onDeselect(item) : onSelect(item)}
                    disabled={!!selectedItem && selectedItem !== item}
                  >
                    <span className="truncate text-center text-xs">{isPinned ? '📌 ' : ''}{item}</span>
                  </Button>

                  
                  <div className="absolute -top-0.5 -right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onPinItem && onUnpinItem && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-3.5 w-3.5 p-0 rounded-full text-xs ${
                          isPinned
                            ? 'bg-warning/30 hover:bg-warning/40 text-warning'
                            : 'bg-primary/20 hover:bg-primary/30 text-primary'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPinned) {
                            onUnpinItem(item);
                          } else {
                            onPinItem(item);
                          }
                        }}
                      >
                        📌
                      </Button>
                    )}
                    {onRemoveItem && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-3.5 w-3.5 p-0 rounded-full bg-destructive/20 hover:bg-destructive/30 text-destructive text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item);
                        }}
                      >
                        ❌
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

          
          {cubeData.map((item, index) => {
            const isPinned = pinnedItems.includes(item);
            return (
              <div key={`custom-${dimension.id}-${index}-${item}`} className="relative group">
                <Button
                  size="sm"
                  variant={selectedItem === item ? "default" : "outline"}
                  className={`text-xs h-6 px-1.5 justify-center w-full transition-all ${
                    isPinned
                      ? 'border-warning bg-warning/10 hover:bg-warning/20 shadow-sm'
                      : 'bg-primary/10 border-primary/30 hover:bg-primary/20 hover:shadow-sm'
                  }`}
                  onClick={() => selectedItem === item ? onDeselect(item) : onSelect(item)}
                  disabled={!!selectedItem && selectedItem !== item}
                >
                  <span className="truncate text-center text-xs">{isPinned ? '📌 ' : ''}🔧 {item}</span>
                </Button>

                
                <div className="absolute -top-0.5 -right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onPinItem && onUnpinItem && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-3.5 w-3.5 p-0 rounded-full text-xs ${
                        isPinned
                          ? 'bg-warning/30 hover:bg-warning/40 text-warning'
                          : 'bg-primary/20 hover:bg-primary/30 text-primary'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPinned) {
                          onUnpinItem(item);
                        } else {
                          onPinItem(item);
                        }
                      }}
                    >
                      📌
                    </Button>
                  )}
                  {onRemoveItem && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-3.5 w-3.5 p-0 rounded-full bg-destructive/20 hover:bg-destructive/30 text-destructive text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item);
                      }}
                    >
                      ❌
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          
          {!showAddInput ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-6 border border-dashed border-border hover:border-border/80 hover:bg-muted/50 w-full"
              onClick={() => setShowAddInput(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          ) : null}
        </div>

        
        {showAddInput && (
          <div className="mt-1.5 flex gap-1">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="输入自定义选项..."
              className="text-xs h-6 flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleAddItem}
              className="h-6 w-6 p-0"
              disabled={!newItem.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddInput(false);
                setNewItem('');
              }}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 九宫格创意魔方组件
 * @returns React 组件
 */
export function CreativeCube() {
  const { t } = useTranslation(); // 🔧 修复：添加缺失的翻译函数
  const { toast } = useToast();
  const { decrementUsage } = useAuthStore();
  const usageRemaining = useAuthStore((state) => state.getUsageRemaining());
  
  // 使用统一的维度定义系统
  const dimensions: CubeDimension[] = getCreativeCubeDimensions().map(dim => ({
    id: dim.id,
    name: dim.name,
    description: dim.description,
    icon: getDimensionIcon(dim.id),
    defaultItems: getDimensionDefaultItems(dim.id),
    isPinnable: Boolean(dim.isRequired || dim.isRecommended) // 必选和推荐维度可固定
  }));

  // 获取维度图标
  function getDimensionIcon(dimensionId: string) {
    const iconMap: Record<string, React.ReactNode> = {
      'target_audience': <Users className="w-4 h-4" />,
      'use_case': <MapPin className="w-4 h-4" />,
      'pain_point': <AlertCircle className="w-4 h-4" />,
      'industry': <Building2 className="w-4 h-4" />,
      'core_value': <Star className="w-4 h-4" />,
      'tone_style': <Palette className="w-4 h-4" />,
      'content_format': <FileText className="w-4 h-4" />,
      'emotional_need': <Heart className="w-4 h-4" />,
      'platform_or_trend': <TrendingUp className="w-4 h-4" />
    };
    return iconMap[dimensionId] || <Star className="w-4 h-4" />;
  }

  // 获取维度默认选项 - 完善版
  function getDimensionDefaultItems(dimensionId: string): string[] {
    const itemsMap: Record<string, string[]> = {
      'target_audience': [
        // 年龄分层
        'Z世代', '千禧一代', '银发族', '中年群体', '青少年',
        // 身份角色
        '宝妈', '奶爸', 'K12家长', '职场人', '大学生', '新手创业者', '自由职业者', '退休人群',
        // 兴趣标签
        '宠物主', '健身人群', '二次元', '科技控', '美食爱好者', '旅行达人', '读书人', '音乐发烧友',
        // 消费特征
        '中产女性', '精致妈妈', '品质生活者', '性价比追求者', '尝鲜族', '理性消费者',
        // 生活状态
        '单身贵族', '新婚夫妇', '空巢老人', '北漂族', '斜杠青年', '居家办公者'
      ],
      'use_case': [
        // 时间场景
        '通勤路上', '午休时间', '睡前时光', '周末休闲', '节假日', '碎片时间', '深夜时刻',
        // 地点场景
        '居家生活', '办公室', '健身房', '咖啡厅', '旅途中', '户外活动', '商场购物', '餐厅用餐',
        // 活动场景
        '工作学习', '娱乐放松', '社交聚会', '家庭聚餐', '约会时光', '独处思考', '运动健身', '护肤保养',
        // 特殊场景
        '出差商旅', '带娃时光', '照顾老人', '宠物陪伴', '备考冲刺', '创业初期', '搬家装修', '换季整理'
      ],
      'pain_point': [
        // 时间相关
        '时间不够用', '效率太低', '拖延症严重', '时间管理混乱', '工作生活失衡',
        // 金钱相关
        '预算有限', '性价比不高', '隐形消费多', '理财困难', '收入不稳定',
        // 选择相关
        '选择困难症', '信息过载', '不知道买什么', '品牌太多眼花缭乱', '担心踩雷',
        // 技能相关
        '操作太复杂', '学习成本高', '不会使用', '缺乏专业知识', '跟不上潮流',
        // 情感相关
        '缺乏动力', '焦虑压力大', '孤独感强', '缺乏认同', '自信心不足', '社交恐惧',
        // 服务相关
        '服务态度差', '售后无保障', '响应速度慢', '专业度不够', '信任度低'
      ],
      'industry': [
        // 生活服务
        '母婴育儿', '美妆护肤', '服装时尚', '食品饮料', '家居生活', '宠物用品',
        // 健康医疗
        '健康养生', '医疗保健', '心理健康', '运动健身', '营养保健', '医美整形',
        // 教育培训
        '在线教育', '职业培训', '语言学习', '兴趣培养', '亲子教育', '老年教育',
        // 科技数码
        '智能硬件', '软件应用', '游戏娱乐', '人工智能', '新能源', '区块链',
        // 金融服务
        '银行理财', '保险服务', '投资理财', '消费金融', '支付服务', '财税服务',
        // 出行旅游
        '旅游度假', '交通出行', '酒店住宿', '租车服务', '户外运动', '文化娱乐',
        // 商业服务
        '电商零售', '本地生活', '企业服务', '营销推广', '设计创意', '法律咨询'
      ],
      'core_value': [
        // 效率提升
        '提升效率', '节省时间', '简化流程', '自动化处理', '一站式解决',
        // 体验改善
        '改善体验', '提高舒适度', '增强便利性', '优化使用感受', '个性化定制',
        // 成本控制
        '节约成本', '性价比高', '减少浪费', '长期省钱', '投资回报高',
        // 品质保障
        '提高品质', '专业可靠', '安全保障', '品牌信誉', '质量承诺',
        // 情感价值
        '情感陪伴', '心理安慰', '社交连接', '身份认同', '成就感满足',
        // 成长发展
        '促进成长', '技能提升', '知识增长', '视野拓展', '能力培养',
        // 创新突破
        '创新突破', '差异化优势', '独特价值', '前沿技术', '颠覆传统'
      ],
      'tone_style': [
        // 情感调性
        '轻松幽默', '温暖治愈', '激励正能量', '情感共鸣', '怀旧情怀', '浪漫温馨',
        // 专业调性
        '专业权威', '科学严谨', '数据说话', '理性分析', '客观中立', '学术风格',
        // 表达方式
        '极简干练', '详细解析', '故事叙述', '对话互动', '第一人称', '旁白解说',
        // 创意风格
        '反差反转', '悬疑烧脑', '热梗混剪', '小剧场', '角色扮演', '情景再现',
        // 互动风格
        '访谈对话', '问答形式', '挑战测试', '教学指导', '分享心得', '经验总结',
        // 平台特色
        '小红书风', '抖音节奏', '知乎深度', '微博热点', 'B站二创', '朋友圈风格'
      ],
      'content_format': [
        // 图文类
        '单图文案', '多图轮播', '长图海报', '信息图表', '漫画条漫', '手绘插画',
        // 视频类
        '短视频', '中视频', '直播', 'Vlog', '教程视频', '产品展示', '用户测评',
        // 互动类
        'H5互动', '小程序', '问卷调研', '投票活动', '打卡挑战', '话题讨论',
        // 内容形式
        '清单合集', '榜单排行', '对比评测', '案例分析', '经验分享', '新闻资讯',
        // 创意形式
        '故事接龙', '角色扮演', '情景剧', '分镜脚本', '音频播客', '图文直播',
        // 工具类
        '模板工具', '计算器', '测试题', '指南手册', '资源合集', '工具推荐'
      ],
      'emotional_need': [
        // 基础需求
        '安全感', '归属感', '被理解', '被认可', '被关爱', '被尊重',
        // 成就需求
        '成就感', '掌控感', '优越感', '自豪感', '满足感', '胜利感',
        // 社交需求
        '陪伴感', '连接感', '分享欲', '表达欲', '展示欲', '互动感',
        // 情感体验
        '愉悦感', '兴奋感', '惊喜感', '新鲜感', '怀念感', '温暖感',
        // 心理状态
        '放松感', '平静感', '专注感', '自信感', '希望感', '治愈感',
        // 生活态度
        '仪式感', '品质感', '精致感', '自由感', '独立感', '个性感'
      ],
      'platform_or_trend': [
        // 主流平台
        '小红书', '抖音', '快手', '微博', '知乎', '公众号', 'B站', '视频号',
        // 新兴平台
        '小宇宙', '即刻', '豆瓣', '什么值得买', '得到', '喜马拉雅', '网易云音乐',
        // 热门趋势
        '搭子经济', 'City Walk', '反向旅游', '高质量独居', '精神内耗', '情绪价值',
        // 生活方式
        '无糖生活', '极简主义', '可持续生活', '慢生活', '数字断舍离', '正念生活',
        // 科技趋势
        'AI助理', '元宇宙', 'Web3', '数字藏品', '虚拟偶像', '智能家居',
        // 消费趋势
        '国潮复兴', '新中式', '悦己消费', '理性消费', '绿色消费', '体验消费',
        // 社会现象
        '低欲望生活', '躺平文化', '内卷焦虑', '社交恐惧', '独居经济', '银发经济'
      ]
    };
    return itemsMap[dimensionId] || [];
  }

  // 九宫格状态
  const [cubeData, setCubeData] = useState<Record<string, string[]>>({});
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
  const [pinnedDimensions, setPinnedDimensions] = useState<Set<string>>(new Set()); // 固定维度
  const [pinnedItems, setPinnedItems] = useState<Record<string, string[]>>({}); // 钉住的选项
  const [hiddenItems, setHiddenItems] = useState<Record<string, string[]>>({}); // 隐藏的默认选项
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [currentContentType, setCurrentContentType] = useState<'text' | 'video'>('text');

  // 用户数据隔离 - 历史记录持久化
  const historyDataManager = useUserDataIsolation({
    modulePrefix: 'creative_cube_history',
    fallbackToGuest: true,
    enableLogging: true
  });

  // 用户数据隔离 - 自定义维度持久化
  const customDimensionsManager = useUserDataIsolation({
    modulePrefix: 'creative_cube_custom_dimensions',
    fallbackToGuest: true,
    enableLogging: true
  });

  // 用户数据隔离 - 钉住选项持久化
  const pinnedItemsManager = useUserDataIsolation({
    modulePrefix: 'creative_cube_pinned_items',
    fallbackToGuest: true,
    enableLogging: true
  });

  const [generatedIdeas, setGeneratedIdeas] = useState<CreativeResult[]>([]); // 历史创意记录
  const [selectedDimensionCount, setSelectedDimensionCount] = useState<number>(6); // 选择的维度总数量 (4-9)
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<any[]>([]);

  // 内联{t('creativeCube.actions.edit')}状态
  const [editingState, setEditingState] = useState<{
    isEditing: boolean;
    type: 'title' | 'content' | null;
    value: string;
  }>({
    isEditing: false,
    type: null,
    value: ''
  });

  // 使用统一的维度定义系统
  const requiredDimensions = getRequiredDimensionIds();
  const recommendedDimensions = getRecommendedDimensionIds();
  const optionalDimensions = getOptionalDimensionIds();

  // 加载用户历史记录
  useEffect(() => {
    const loadHistory = () => {
      const result = historyDataManager.loadData<CreativeResult[]>();
      if (result.success && result.data) {
        setGeneratedIdeas(result.data);
        console.log(`📚 alreadyloading${result.data.length}items创意历史记录`);
      }
    };

    loadHistory();
  }, [historyDataManager.user?.id]); // 当用户ID变化时重新加载

  // 加载用户自定义维度和隐藏项
  useEffect(() => {
    const loadCustomData = () => {
      const result = customDimensionsManager.loadData<Record<string, any>>();
      if (result.success && result.data) {
        // 加载自定义选项
        const customItems = result.data.customItems || result.data; // 兼容旧数据格式
        if (customItems && typeof customItems === 'object') {
          setCubeData(prev => {
            const merged = { ...prev };
            Object.keys(customItems).forEach(dimensionId => {
              if (customItems[dimensionId] && Array.isArray(customItems[dimensionId]) && customItems[dimensionId].length > 0) {
                merged[dimensionId] = [...(merged[dimensionId] || []), ...customItems[dimensionId]];
              }
            });
            return merged;
          });
          logger.debug('🔧 已加载用户自定义维度选项:', customItems);
        }

        // 加载隐藏项
        const hiddenItems = result.data.hiddenItems || {};
        if (hiddenItems && typeof hiddenItems === 'object') {
          setHiddenItems(hiddenItems);
          console.log(`🙈 alreadyloadinguserhidden的option:`, hiddenItems);
        }
      }
    };

    loadCustomData();
  }, [customDimensionsManager.user?.id]); // 当用户ID变化时重新加载

  // 加载用户钉住的选项
  useEffect(() => {
    const loadPinnedItems = () => {
      const result = pinnedItemsManager.loadData<Record<string, string[]>>();
      if (result.success && result.data) {
        setPinnedItems(result.data);
        console.log(`📌 alreadyloadinguser钉住的option:`, result.data);
      }
    };

    loadPinnedItems();
  }, [pinnedItemsManager.user?.id]); // 当用户ID变化时重新加载
  
  // 验证生成条件
  const isValidGeneration = useMemo(() => {
    return requiredDimensions.every(dim => selectedItems[dim] && selectedItems[dim].trim() !== '');
  }, [selectedItems, requiredDimensions]);
  
  /**
   * 检查必选维度是否已选择
   */
  const checkRequiredDimensions = () => {
    const missingDimensions = requiredDimensions.filter(dim => !selectedItems[dim]);
    return {
      isValid: missingDimensions.length === 0,
      missing: missingDimensions
    };
  };

  /**
   * 获取维度选择状态
   */
  const getDimensionStatus = (dimensionId: string) => {
    const isRequired = requiredDimensions.includes(dimensionId);
    const isSelected = !!selectedItems[dimensionId];
    const isRecommended = recommendedDimensions.includes(dimensionId);
    const isOptional = optionalDimensions.includes(dimensionId);

    return {
      isRequired,
      isSelected,
      isRecommended,
      isOptional,
      status: isRequired ? (isSelected ? 'required-selected' : 'required-missing') :
              isRecommended ? (isSelected ? 'recommended-selected' : 'recommended') :
              isOptional ? (isSelected ? 'optional-selected' : 'optional') : 'optional'
    };
  };

  /**
   * 初始化九宫格数据 - 只在组件首次加载时运行
   */
  useEffect(() => {
    const initialData: Record<string, string[]> = {};
    dimensions.forEach(dim => {
      initialData[dim.id] = []; // 只初始化空数组，不包含默认项
    });
    setCubeData(initialData);
  }, []); // 移除dimensions依赖，只在组件首次加载时运行

  /**
   * 添加新项目到九宫格
   */
  const addItemToCube = (dimensionId: string, newItem: string) => {
    if (!newItem.trim()) return;

    setCubeData(prev => {
      const currentItems = prev[dimensionId] || [];
      const newData = {
        ...prev,
        [dimensionId]: [...currentItems, newItem.trim()]
      };
      return newData;
    });
  };

  /**
   * 选择维度项目
   */
  const selectItem = (dimensionId: string, item: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [dimensionId]: item
    }));
  };

  /**
   * {t('creativeCube.actions.cancel')}选择维度项目
   */
  const deselectItem = (dimensionId: string, item: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (newItems[dimensionId] === item) {
        delete newItems[dimensionId];
      }
      return newItems;
    });
  };

  /**
   * 切换固定状态
   */
  const togglePin = (dimensionId: string) => {
    setPinnedDimensions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dimensionId)) {
        newSet.delete(dimensionId);
      } else {
        newSet.add(dimensionId);
      }
      return newSet;
    });
  };

  /**
   * 添加自定义项目并持久化
   */
  const addCustomItem = (dimensionId: string, item: string) => {
    if (!item.trim()) return;

    // 更新本地状态
    addItemToCube(dimensionId, item);

    // 持久化到用户专属存储
    const result = customDimensionsManager.loadData<Record<string, any>>();
    const currentData = result.data || {};
    const customItems = currentData.customItems || {};

    const updatedCustomItems = {
      ...customItems,
      [dimensionId]: [...(customItems[dimensionId] || []), item.trim()]
    };

    const updatedData = {
      ...currentData,
      customItems: updatedCustomItems
    };

    customDimensionsManager.saveData(updatedData);
    console.log(`💾 already{t('creativeCube.actions.save')}custom维度option: ${dimensionId} -> ${item}`);

    toast({
      title: "自定义选项已{t('creativeCube.actions.save')}",
      description: `"${item}" 已添加到 ${dimensions.find(d => d.id === dimensionId)?.name || dimensionId} 维度`,
    });
  };

  /**
   * 随机选择选择
   */
  const randomizeSelection = () => {
    const newSelection: Record<string, string> = {};
    
    dimensions.forEach(dimension => {
      // 跳过已固定的维度
      if (pinnedDimensions.has(dimension.id)) {
        return;
      }
      
      const items = cubeData[dimension.id] || dimension.defaultItems;
      if (items.length > 0) {
        const randomIndex = Math.floor(Math.random() * items.length);
        newSelection[dimension.id] = items[randomIndex];
      }
    });
    
    setSelectedItems(prev => ({ ...prev, ...newSelection }));
    
    toast({
      title: "🎲 随机选择选择完成",
      description: `已为${Object.keys(newSelection).length}{t('creativeCube.currentSelection.count')}生成随机选择选择`,
    });
  };

  /**
   * 清空所有选择
   */
  const clearAllSelections = () => {
    setSelectedItems({});
    toast({
      title: "已清空",
      description: "所有维度选择已清空",
    });
  };

  /**
   * 删除维度选项（包括默认项和自定义项）
   */
  const removeItem = (dimensionId: string, item: string) => {
    const dimension = dimensions.find(d => d.id === dimensionId);
    const isDefaultItem = dimension?.defaultItems.includes(item);

    if (isDefaultItem) {
      // 删除默认项：将其添加到隐藏列表
      const result = customDimensionsManager.loadData<Record<string, any>>();
      const currentData = result.data || {};

      const hiddenItems = currentData.hiddenItems || {};
      const updatedHiddenItems = {
        ...hiddenItems,
        [dimensionId]: [...(hiddenItems[dimensionId] || []), item]
      };

      const updatedData = {
        ...currentData,
        hiddenItems: updatedHiddenItems
      };

      customDimensionsManager.saveData(updatedData);

      // 更新本地显示状态
      setHiddenItems(prev => ({
        ...prev,
        [dimensionId]: [...(prev[dimensionId] || []), item]
      }));

      console.log(`🗑️ alreadyhiddendefaultoption: ${dimensionId} -> ${item}`);

      toast({
        title: "选项已删除",
        description: `"${item}" 已从 ${dimension?.name || dimensionId} 维度中移除`,
      });
    } else {
      // 删除自定义项：从自定义列表中移除
      setCubeData(prev => {
        const currentItems = prev[dimensionId] || [];
        const newData = {
          ...prev,
          [dimensionId]: currentItems.filter(i => i !== item)
        };
        return newData;
      });

      // 更新持久化存储
      const result = customDimensionsManager.loadData<Record<string, any>>();
      const currentData = result.data || {};
      const customItems = currentData.customItems || {};

      const updatedCustomItems = {
        ...customItems,
        [dimensionId]: (customItems[dimensionId] || []).filter((i: string) => i !== item)
      };

      // 如果维度下没有自定义选项了，删除该维度
      if (updatedCustomItems[dimensionId] && updatedCustomItems[dimensionId].length === 0) {
        delete updatedCustomItems[dimensionId];
      }

      const updatedData = {
        ...currentData,
        customItems: updatedCustomItems
      };

      customDimensionsManager.saveData(updatedData);
      console.log(`🗑️ deletedcustomoption: ${dimensionId} -> ${item}`);

      toast({
        title: "自定义选项已删除",
        description: `"${item}" 已从 ${dimension?.name || dimensionId} 维度中移除`,
      });
    }
  };

  /**
   * 清空所有自定义维度选项
   */
  const clearAllCustomItems = (showToast = true) => {
    // 重置本地状态为默认项
    const initialData: Record<string, string[]> = {};
    dimensions.forEach(dim => {
      initialData[dim.id] = [];
    });
    setCubeData(initialData);

    // 清空持久化存储
    customDimensionsManager.removeData();

    if (showToast) {
      toast({
        title: "已清空所有自定义选项",
        description: "所有自定义维度选项已清空，恢复为默认选项",
      });
    }
  };

  /**
   * 恢复所有隐藏的默认选项
   */
  const restoreAllHiddenItems = (showToast = true) => {
    setHiddenItems({});

    // 更新持久化存储
    const result = customDimensionsManager.loadData<Record<string, any>>();
    const currentData = result.data || {};
    const updatedData = {
      ...currentData,
      hiddenItems: {}
    };

    customDimensionsManager.saveData(updatedData);

    if (showToast) {
      toast({
        title: "已恢复所有删除的选项",
        description: "所有被删除的默认选项已恢复显示",
      });
    }
  };

  /**
   * 恢复单{t('creativeCube.currentSelection.count')}的默认选项
   */
  const restoreDimensionDefaults = (dimensionId: string) => {
    const dimension = dimensions.find(d => d.id === dimensionId);
    if (!dimension) return;

    // 从隐藏项中移除该维度的所有默认项
    const updatedHiddenItems = { ...hiddenItems };

    // 如果该维度有隐藏项，则清空该维度的隐藏项
    if (updatedHiddenItems[dimensionId]) {
      delete updatedHiddenItems[dimensionId];
    }

    setHiddenItems(updatedHiddenItems);

    // 更新持久化存储
    const result = customDimensionsManager.loadData<Record<string, any>>();
    const currentData = result.data || {};
    const updatedData = {
      ...currentData,
      hiddenItems: updatedHiddenItems
    };

    customDimensionsManager.saveData(updatedData);

    toast({
      title: "已恢复默认选项",
      description: `"${dimension.name}" 的默认选项已恢复显示`,
    });
  };

  /**
   * 钉住选项
   */
  const pinItem = (dimensionId: string, item: string) => {
    setPinnedItems(prev => {
      const currentPinned = prev[dimensionId] || [];
      if (currentPinned.includes(item)) return prev;

      const updated = {
        ...prev,
        [dimensionId]: [...currentPinned, item]
      };

      // 持久化存储
      pinnedItemsManager.saveData(updated);
      console.log(`📌 already钉住option: ${dimensionId} -> ${item}`);

      return updated;
    });

    toast({
      title: "选项已钉住",
      description: `"${item}" 已标记为必用选项`,
    });
  };

  /**
   * {t('creativeCube.actions.cancel')}钉住选项
   */
  const unpinItem = (dimensionId: string, item: string) => {
    setPinnedItems(prev => {
      const currentPinned = prev[dimensionId] || [];
      const updated = {
        ...prev,
        [dimensionId]: currentPinned.filter(i => i !== item)
      };

      // 如果维度下没有钉住的选项了，删除该维度
      if (updated[dimensionId].length === 0) {
        delete updated[dimensionId];
      }

      // 持久化存储
      pinnedItemsManager.saveData(updated);
      console.log(`📌 already{t('creativeCube.actions.cancel')}钉住option: ${dimensionId} -> ${item}`);

      return updated;
    });

    toast({
      title: "{t('creativeCube.actions.cancel')}钉住",
      description: `"${item}" 已{t('creativeCube.actions.cancel')}必用标记`,
    });
  };

  /**
   * 操作的包装函数
   */
  const handleGenerateContent = () => {
    if (!isValidGeneration) {
      const requiredCheck = checkRequiredDimensions();
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      toast({
        title: "关键维度缺失",
        description: `请确保已选择【${missingNames.join('】【')}】后再生成内容`,
        variant: "destructive"
      });
      return;
    }
    
    generateIdea();
  };

  /**
   * 控制随机选择生成
   * 根据用户选择的维度数量，智能选择维度组合
   */
  const controlledRandomGenerate = () => {
    // 确保必选维度总是被包含
    const coreRequiredDimensions = ['target_audience', 'use_case', 'pain_point', 'industry'];

    console.log('🎲 starts随机选择，current选择的维度quantity:', selectedDimensionCount);
    console.log('🎲 current固定的维度:', Array.from(pinnedDimensions));
    console.log('🎲 available的dimensionsarray:', dimensions.map(d => ({ id: d.id, name: d.name, itemCount: d.defaultItems.length })));

    // 直接构建维度选择，确保包含所有必选维度
    const selectedDimensionIds: string[] = [...coreRequiredDimensions];
    console.log('🎲 first先adding必选维度:', selectedDimensionIds);

    // 添加已固定的维度（如果不在必选维度中）
    pinnedDimensions.forEach(pinnedDim => {
      if (!selectedDimensionIds.includes(pinnedDim)) {
        selectedDimensionIds.push(pinnedDim);
        console.log('🎲 adding固定维度:', pinnedDim);
      }
    });

    // 获取所有可用的维度ID
    const allDimensionIds = dimensions.map(d => d.id);
    console.log('🎲 所hasavailable维度:', allDimensionIds);

    // 添加其他维度直到达到目标数量
    const remainingDimensions = allDimensionIds.filter(dimId =>
      !selectedDimensionIds.includes(dimId)
    );
    console.log('🎲 剩余可选维度:', remainingDimensions);

    // 随机选择选择剩余维度
    const shuffledRemaining = [...remainingDimensions].sort(() => Math.random() - 0.5);
    const neededCount = Math.max(0, selectedDimensionCount - selectedDimensionIds.length);
    selectedDimensionIds.push(...shuffledRemaining.slice(0, neededCount));

    console.log('🎲 最终选择的维度:', selectedDimensionIds);

    const newSelection: Record<string, string> = {};

    // 为选中的维度随机选择选择值
    selectedDimensionIds.forEach(dimId => {
      // 如果维度已固定，保持原值
      if (pinnedDimensions.has(dimId) && selectedItems[dimId]) {
        newSelection[dimId] = selectedItems[dimId];
        console.log('🎲 保持固定维度value:', dimId, '=', selectedItems[dimId]);
        return;
      }

      const dimension = dimensions.find(d => d.id === dimId);
      console.log('🎲 find维度:', dimId, '找到:', dimension ? `${dimension.name} (${dimension.defaultItems.length}项)` : '未找到');

      if (dimension && dimension.defaultItems.length > 0) {
        const cubeItems = cubeData[dimId] || [];
        const items = cubeItems.length > 0 ? cubeItems : dimension.defaultItems;
        console.log('🎲 可option:', dimId, '自定义项:', cubeItems.length, '默认项:', dimension.defaultItems.length, '使用:', items.length);
        console.log('🎲 具体option:', items);

        const randomIndex = Math.floor(Math.random() * items.length);
        const selectedValue = items[randomIndex];
        newSelection[dimId] = selectedValue;
        console.log('🎲 随机选择维度value:', dimId, '=', selectedValue, '(索引:', randomIndex, ')');
      } else {
        console.log('🎲 warning：维度没has可option:', dimId, '维度对象:', dimension);
      }
    });

    console.log('🎲 最终选择result:', newSelection);
    console.log('🎲 checking必选维度是否都hasvalue:');
    coreRequiredDimensions.forEach(dim => {
      console.log(`  ${dim}:`, newSelection[dim] || '❌ 缺失');
    });

    setSelectedItems(newSelection);

    const selectedCount = Object.keys(newSelection).length;
    const fixedCount = pinnedDimensions.size;
    const requiredCount = coreRequiredDimensions.filter(dim => selectedDimensionIds.includes(dim)).length;
    const recommendedCount = recommendedDimensions.filter(dim => selectedDimensionIds.includes(dim)).length;
    const optionalCount = selectedDimensionIds.length - requiredCount - recommendedCount;

    toast({
      title: "🎲 随机选择选择完成",
      description: `已选择${selectedCount}{t('creativeCube.currentSelection.count')}（必选${requiredCount}个，推荐${recommendedCount}个，可选${optionalCount}个，固定${fixedCount}个）`,
    });

    // 使用 setTimeout 确保状态更新后再生成
    setTimeout(() => {
      console.log('🎲 准备生成content，传入的选择:', newSelection);
      generateIdea(newSelection);
    }, 100);
  };

  /**
   * 固定维度
   */
  const pinDimension = (dimensionId: string) => {
    setPinnedDimensions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dimensionId)) {
        newSet.delete(dimensionId);
      } else {
        newSet.add(dimensionId);
      }
      return newSet;
    });
  };

  /**
   * {t('creativeCube.actions.cancel')}固定维度
   */
  const unpinDimension = (dimensionId: string) => {
    setPinnedDimensions(prev => {
      const newSet = new Set(prev);
      newSet.delete(dimensionId);
      return newSet;
    });
  };

  /**
   * 构建AI Prompt - 使用统一提示词系统
   */
  const buildPrompt = () => {
    // 获取当前选择的维度ID列表
    const selectedDimensionIds = Object.keys(selectedItems).filter(key => selectedItems[key]);

    // 构建配置对象
    const config: CreativeCubeConfig = {
      selectedItems: selectedItems as CreativeCubeSelection,
      pinnedDimensions: Array.from(pinnedDimensions),
      selectedDimensionIds
    };

    // 使用统一的提示词构建函数
    return buildCreativeCubePrompt(config);
  };

  /**
   * 生成图文内容
   */
  const generateTextContent = () => {
    const { tone_style } = selectedItems;
    
    // 只检查必选维度
    const requiredCheck = checkRequiredDimensions();
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      return `❌ 请确保选择了所有必要维度：${missingNames.join('、')}`;
    }
    
    // 根据调性生成不同风格的内容
    if (tone_style === '轻松幽默') {
      return generateHumorousContent();
    } else {
      return generateStandardContent();
    }
  };

  /**
   * 生成轻松幽默风格内容
   */
  const generateHumorousContent = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
    // 生成标题
    const title = generateHumorousTitle();
    
    // 生成正文
    const body = generateHumorousBody();
    
    // 生成互动引导
    const callToAction = generateHumorousCallToAction();
    
    // 生成短视频建议
    const videoSuggestions = generateVideoSuggestions();
    
    // 生成延展建议
    const extensions = generateExtensionSuggestions();

    return `🎯 内容营销文案（图文/短视频均适用）

【标题】
${title}

【正文文案】
${body}

【结尾互动】
${callToAction}

⸻

🧠 延展建议（短视频内容结构）
${videoSuggestions}

${extensions}`;
  };

  /**
   * 生成轻松幽默标题
   */
  const generateHumorousTitle = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
    const titleTemplates: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `🏃‍♀️健身没时间？这款美妆神器让${target_audience}也能一秒出门自带光！`,
        '通勤': `🚇通勤路上补妆难？${target_audience}专属美妆神器，地铁上也能精致在线！`,
        '夜宵': `🌙夜宵后卸妆累？这款神器让${target_audience}告别"卸妆恐惧症"！`,
        '独处时刻': `💄独处也要精致！${target_audience}的美妆仪式感，从这款神器开始！`
      },
      '母婴': {
        '带娃时': `👶带娃没时间护肤？这款神器让${target_audience}也能"偷懒"变美！`,
        '家庭聚会': `🎉聚会装备太多？${target_audience}的便携神器，一包搞定所有！`,
        '睡前': `😴睡前哄娃累？这款神器让${target_audience}也能精致入睡！`
      },
      '旅游': {
        '通勤': `🚇通勤路上想旅游？${target_audience}的省钱神器，让梦想不再遥远！`,
        '旅游途中': `✈️旅游途中预算超？${target_audience}的省钱攻略，让旅行更轻松！`,
        '出差': `💼出差回来钱包瘦？${target_audience}的出差神器，让商务旅行更省心！`
      },
      '健康': {
        '健身': `💪健身没时间？${target_audience}的健康神器，让运动更高效！`,
        '碎片时间': `⏰碎片时间养生难？${target_audience}的便携神器，让健康无处不在！`,
        '睡前': `😴睡前养生太复杂？${target_audience}的简单神器，让养生更轻松！`
      }
    };
    
    return titleTemplates[industry]?.[use_case] || 
      `💡${pain_point}太崩溃？这款${core_value}神器让${target_audience}告别烦恼！`;
  };

  /**
   * 生成轻松幽默正文
   */
  const generateHumorousBody = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
    // 开场痛点
    const openingPain = generateOpeningPain();
    
    // 解决方案
    const solution = generateSolution();
    
    // 产品亮点
    const highlights = generateProductHighlights();
    
    return `${openingPain}

别急，这款${core_value}神器，专为${target_audience}准备：
${highlights}`;
  };

  /**
   * 生成开场痛点
   */
  const generateOpeningPain = () => {
    const { target_audience, use_case, pain_point, industry } = selectedItems;
    
    const painTemplates: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `作为${target_audience}，每天上课、打工、健身三点一线，哪还有时间化妆？\n尤其健完身还要赶图书馆、见朋友，时间根本不够用！`,
        '通勤': `作为${target_audience}，每天地铁公交来回奔波，哪有时间精致化妆？\n尤其早晚高峰，连补妆的时间都没有！`,
        '夜宵': `作为${target_audience}，夜宵后还要卸妆，简直比上班还累！\n时间不够用，皮肤还要遭罪！`
      },
      '母婴': {
        '带娃时': `作为${target_audience}，带娃就是24小时待机，哪有时间护肤？\n尤其宝宝哭闹时，连洗脸的时间都没有！`,
        '家庭聚会': `作为${target_audience}，家庭聚会就是大型装备现场，哪有时间精致？\n尤其带娃出门，装备比搬家还多！`
      },
      '旅游': {
        '通勤': `作为${target_audience}，每天通勤路上都在想旅游，但预算根本不够！\n时间不够用，钱包也不够用！`,
        '旅游途中': `作为${target_audience}，旅游途中预算总是超支，选择困难症发作！\n时间不够用，钱也不够用！`
      },
      '健康': {
        '健身': `作为${target_audience}，每天健身打卡，但时间总是不够用！\n尤其工作学习忙，连运动的时间都要挤！`,
        '碎片时间': `作为${target_audience}，碎片时间很多，但养生太难坚持！\n时间不够用，健康也要打折！`
      }
    };
    
    return painTemplates[industry]?.[use_case] || 
      `作为${target_audience}，在${use_case}中遇到${pain_point}，简直让人崩溃！`;
  };

  /**
   * 生成解决方案
   */
  const generateSolution = () => {
    const { core_value, target_audience } = selectedItems;
    return `这款${core_value}神器，专为${target_audience}准备：`;
  };

  /**
   * 生成产品亮点
   */
  const generateProductHighlights = () => {
    const { industry, use_case, core_value } = selectedItems;
    
    const highlightTemplates: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `💨 5秒上妆，零卡粉、不脱妆，健身完照样在线状态！\n🌿 养肤级底妆，汗后肌肤也不崩，提升气色不假面。\n🎒 迷你便携，一支搞定出门妆 + 补妆 + 气场加持！`,
        '通勤': `⚡ 3秒补妆，地铁上也能精致在线！\n🌿 持久不脱妆，早晚高峰也不怕！\n🎒 口袋大小，通勤路上随时补妆！`,
        '夜宵': `🌙 一键卸妆，夜宵后也能轻松入睡！\n🌿 温和不刺激，敏感肌也能安心用！\n⏰ 省时省力，告别"卸妆恐惧症"！`
      },
      '母婴': {
        '带娃时': `👶 带娃也能护肤，5分钟搞定基础护理！\n🌿 温和配方，哺乳期也能安心用！\n🎒 便携设计，带娃出门也能精致！`,
        '家庭聚会': `🎉 聚会装备精简，一包搞定所有需求！\n🌿 多功能设计，带娃聚会也能轻松！\n⏰ 省时省力，聚会准备不再手忙脚乱！`
      },
      '旅游': {
        '通勤': `✈️ 通勤路上也能规划旅行，省钱攻略一键获取！\n🌍 全球目的地推荐，让梦想不再遥远！\n💰 预算管理，让旅行更轻松！`,
        '旅游途中': `🎯 旅游途中省钱攻略，预算超支不再怕！\n🌍 本地推荐，让旅行更深度！\n💰 实时预算提醒，让旅行更省心！`
      },
      '健康': {
        '健身': `💪 健身效率提升，时间不够也能练出好身材！\n��‍♀️ 科学训练计划，让运动更高效！\n⏰ 时间管理，让健身更轻松！`,
        '碎片时间': `⏰ 碎片时间养生，随时随地都能健康！\n🌿 简单易坚持，让养生更轻松！\n💪 科学指导，让健康更有效！`
      }
    };
    
    return highlightTemplates[industry]?.[use_case] || 
      `✨ ${core_value}功能，让问题迎刃而解！\n🌿 专业品质，让体验更升级！\n⏰ 省时省力，让生活更轻松！`;
  };

  /**
   * 生成短视频建议
   */
  const generateVideoSuggestions = () => {
    const { target_audience, use_case, industry } = selectedItems;
    
    const videoTemplates: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `• 镜头1：${target_audience}宿舍，闹钟响起，时间紧张\n• 镜头2：健身房镜头，快速出汗、看表\n• 镜头3：快速上妆镜头（BGM轻快节奏感）\n• 镜头4：见朋友状态在线，画面定格品牌产品`,
        '通勤': `• 镜头1：${target_audience}匆忙起床，时间不够\n• 镜头2：地铁站镜头，人潮拥挤\n• 镜头3：快速补妆镜头（BGM都市节奏）\n• 镜头4：精致妆容，自信走出地铁`,
        '夜宵': `• 镜头1：${target_audience}吃夜宵，妆容开始脱妆\n• 镜头2：回家路上，疲惫不堪\n• 镜头3：快速卸妆镜头（BGM轻松舒缓）\n• 镜头4：清爽入睡，皮肤状态好`
      },
      '母婴': {
        '带娃时': `• 镜头1：${target_audience}带娃日常，手忙脚乱\n• 镜头2：宝宝哭闹，没时间护肤\n• 镜头3：快速护肤镜头（BGM温馨轻快）\n• 镜头4：带娃出门，依然精致`,
        '家庭聚会': `• 镜头1：${target_audience}准备聚会，装备太多\n• 镜头2：带娃出门，手忙脚乱\n• 镜头3：精简装备镜头（BGM欢快节奏）\n• 镜头4：聚会现场，轻松自在`
      },
      '旅游': {
        '通勤': `• 镜头1：${target_audience}通勤路上，看着旅游广告\n• 镜头2：查看旅游攻略，预算不够\n• 镜头3：省钱规划镜头（BGM旅行音乐）\n• 镜头4：梦想成真，开始旅行`,
        '旅游途中': `• 镜头1：${target_audience}旅游途中，预算超支\n• 镜头2：选择困难，不知道去哪\n• 镜头3：省钱攻略镜头（BGM轻松愉快）\n• 镜头4：享受旅行，预算充足`
      },
      '健康': {
        '健身': `• 镜头1：${target_audience}忙碌工作，没时间健身\n• 镜头2：健身房，时间不够用\n• 镜头3：高效训练镜头（BGM动感节奏）\n• 镜头4：身材变好，自信满满`,
        '碎片时间': `• 镜头1：${target_audience}碎片时间，不知道做什么\n• 镜头2：工作间隙，想要养生\n• 镜头3：简单养生镜头（BGM舒缓音乐）\n• 镜头4：健康状态，精神饱满`
      }
    };
    
    return videoTemplates[industry]?.[use_case] || 
      `• 镜头1：${target_audience}遇到问题，表情困扰\n• 镜头2：使用产品，问题解决\n• 镜头3：效果展示，满意表情\n• 镜头4：推荐产品，画面定格`;
  };

  /**
   * 生成延展建议
   */
  const generateExtensionSuggestions = () => {
    const { target_audience, use_case, industry } = selectedItems;
    
    return `📝 文案/配音：同步上面内容，调性自然、真实、有代入感

🎬 拍摄建议：
• 画面风格：生活化、真实感强
• 色调：明亮温暖，符合${target_audience}审美
• 节奏：轻快有节奏感，符合${use_case}场景
• 互动：鼓励用户分享自己的${use_case}经验

🏷️ 标签建议：
${getIndustryTags().join(' ')} #${target_audience} #${use_case} #${industry}`;
  };

  /**
   * 生成行业特色标签
   */
  const getIndustryTags = () => {
    const { industry } = selectedItems;
    const industryTags: Record<string, string[]> = {
      '母婴': ['#宝妈日常', '#育儿经验', '#省钱妙招', '#亲子时光'],
      '美妆': ['#美妆分享', '#护肤心得', '#变美秘籍', '#美妆测评'],
      '旅游': ['#旅行攻略', '#省钱旅游', '#旅行日记', '#穷游风也能很美'],
      '健康': ['#健康生活', '#养生心得', '#健康管理', '#科学养生'],
      '教育': ['#学习充电', '#提分秘籍', '#家长必看', '#教育投资'],
      '职场': ['#职场心得', '#工作效率', '#职场技能', '#职业发展'],
      '电商': ['#购物分享', '#省钱攻略', '#好物推荐', '#购物清单'],
      '本地生活': ['#本地美食', '#生活服务', '#城市探索', '#生活便利'],
      '宠物': ['#萌宠日常', '#铲屎官必看', '#宠物健康', '#宠物互动'],
      '数码': ['#数码测评', '#科技分享', '#数码生活', '#智能设备'],
      '食品饮料': ['#美食分享', '#吃货日常', '#健康饮食', '#美食测评'],
      '健身': ['#健身打卡', '#运动装备', '#健康塑形', '#燃脂计划'],
      '金融理财': ['#理财规划', '#投资理财', '#财富管理', '#理财心得']
    };
    
    return industryTags[industry] || ['#生活分享', '#实用技巧', '#经验分享'];
  };

  /**
   * 生成轻松幽默互动引导
   */
  const generateHumorousCallToAction = () => {
    const { target_audience, use_case, pain_point, industry } = selectedItems;
    
    const callToActions: Record<string, Record<string, string>> = {
      '美妆': {
        '健身': `⌛ 谁说健身和精致不能兼得？快评论区告诉我你的 #健身速妆秘籍 吧！`,
        '通勤': `🚇 通勤路上有什么补妆妙招？快来分享你的 #通勤美妆秘籍 ！`,
        '夜宵': `🌙 夜宵后有什么卸妆神器？快来安利你的 #夜宵卸妆秘籍 ！`,
        '独处时刻': `💄 独处时有什么护肤仪式？快来分享你的 #独处美妆秘籍 ！`
      },
      '母婴': {
        '带娃时': `👶 带娃时有什么护肤妙招？宝妈们快来分享你的 #带娃护肤秘籍 ！`,
        '家庭聚会': `🎉 家庭聚会有什么装备妙招？快来分享你的 #聚会装备秘籍 ！`,
        '睡前': `😴 睡前有什么护肤仪式？快来分享你的 #睡前护肤秘籍 ！`
      },
      '旅游': {
        '通勤': `✈️ 通勤路上有什么省钱妙招？快来分享你的 #通勤省钱秘籍 ！`,
        '旅游途中': `🎯 旅游途中有什么省钱攻略？快来分享你的 #旅游省钱秘籍 ！`,
        '出差': `💼 出差有什么省钱妙招？快来分享你的 #出差省钱秘籍 ！`
      },
      '健康': {
        '健身': `💪 健身有什么时间管理妙招？快来分享你的 #健身时间秘籍 ！`,
        '碎片时间': `⏰ 碎片时间有什么养生妙招？快来分享你的 #碎片养生秘籍 ！`,
        '睡前': `😴 睡前有什么养生仪式？快来分享你的 #睡前养生秘籍 ！`
      }
    };
    
    return callToActions[industry]?.[use_case] || 
      `💡 你在${use_case}中遇到过${pain_point}吗？快来分享你的 #${use_case}秘籍 吧！`;
  };

  /**
   * 生成标准风格内容
   */
  const generateStandardContent = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
    // 只检查必选维度
    const requiredCheck = checkRequiredDimensions();
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      return `❌ 请确保选择了所有必要维度：${missingNames.join('、')}`;
    }
    
    return `📱 ${target_audience}专属文案

【标题】
${generateStandardTitle()}

【正文】
在${use_case}中，${target_audience}常常面临${pain_point}的困扰。

${selectedItems.emotional_need ? `这种挑战不仅影响日常体验，更让人感到${selectedItems.emotional_need}。` : ''}

${core_value ? `然而，通过${core_value}，我们可以有效解决这些问题。` : '我们可以提供有效的解决方案。'}

${generateIndustrySpecificContent()}

【互动引导】
${generateStandardCallToAction()}

#${target_audience} #${use_case} #${industry}`;
  };

  /**
   * 生成标准标题
   */
  const generateStandardTitle = () => {
    const { target_audience, use_case, pain_point, core_value } = selectedItems;
    return `${target_audience}的${use_case}新选择：用${core_value}解决${pain_point}`;
  };

  /**
   * 生成行业特定内容
   */
  const generateIndustrySpecificContent = () => {
    const { industry, target_audience, core_value } = selectedItems;
    
    const industryContent: Record<string, string> = {
      '母婴': `在育儿过程中，${core_value}为${target_audience}提供贴心的服务和解决方案。`,
      '美妆': `在个人形象塑造中，${core_value}帮助${target_audience}展现最佳状态。`,
      '旅游': `无论是家庭出游还是商务出行，${core_value}都能为${target_audience}提供更优质的旅行体验。`,
      '健康': `在健康管理中，${core_value}为${target_audience}提供科学的健康指导。`,
      '教育': `在学习和成长的道路上，${core_value}为${target_audience}提供专业支持和指导。`,
      '职场': `在职业发展中，${core_value}帮助${target_audience}提升工作效率和职业竞争力。`,
      '电商': `在购物体验中，${core_value}为${target_audience}提供便捷的购物服务。`,
      '本地生活': `在日常生活中，${core_value}为${target_audience}提供便利的生活服务。`,
      '宠物': `在宠物护理中，${core_value}为${target_audience}提供贴心的宠物服务。`,
      '数码': `在数字化时代，${core_value}帮助${target_audience}提升科技生活品质。`,
      '食品饮料': `从日常饮食到社交聚会，${core_value}让${target_audience}享受更美好的用餐体验。`,
      '健身': `在健康塑形中，${core_value}帮助${target_audience}实现健身目标。`,
      '金融理财': `在理财规划中，${core_value}为${target_audience}提供专业的金融服务。`
    };
    
    return industryContent[industry] || 
      `通过${core_value}，${target_audience}能够获得更好的体验和服务。`;
  };

  /**
   * 生成标准互动引导
   */
  const generateStandardCallToAction = () => {
    const { target_audience, use_case, core_value } = selectedItems;
    return `你是否也在${use_case}中遇到过类似问题？欢迎分享你的经验和想法，让我们一起探讨如何通过${core_value}改善生活品质。`;
  };

  /**
   * 生成短视频脚本
   */
  const generateVideoScript = (prompt: string) => {
    const { target_audience, use_case, pain_point, tone_style, core_value, emotional_need, industry } = selectedItems;
    
    // 只检查必选维度
    const requiredCheck = checkRequiredDimensions();
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      return `❌ 请确保选择了所有必要维度：${missingNames.join('、')}`;
    }
    
    // 根据调性生成不同风格的脚本
    if (tone_style === '轻松幽默') {
      return generateHumorousVideoScript();
    } else {
      return generateStandardVideoScript();
    }
  };

  /**
   * 生成轻松幽默短视频脚本
   */
  const generateHumorousVideoScript = () => {
    const { target_audience, use_case, pain_point, core_value, emotional_need, industry } = selectedItems;
    
    // 场景设定
    const getVideoSetting = () => {
      const settings: Record<string, Record<string, string>> = {
        '旅游': {
          '通勤': '地铁车厢，上班族对着手机屏幕叹气',
          '旅游途中': '旅游景点，游客们排队等待拍照',
          '出差': '机场，出差人士拖着行李箱赶飞机'
        },
        '母婴': {
          '带娃时': '婴儿房，宝妈抱着宝宝哄睡',
          '家庭聚会': '客厅，家庭成员围坐聊天',
          '睡前': '卧室，宝妈和宝宝一起躺在床上'
        },
        '美妆': {
          '通勤': '地铁站，白领们匆忙补妆',
          '夜宵': '夜市，年轻人吃夜宵卸妆',
          '独处时刻': '卧室，女生对着镜子护肤'
        },
        '健康': {
          '健身': '健身房，健身人士在跑步机上挥汗如雨',
          '碎片时间': '公交车上，乘客们低头看手机',
          '睡前': '卧室，学生或职场人士在床上看书'
        }
      };
      
      return settings[industry]?.[use_case] || `${use_case}场景，${target_audience}在忙碌`;
    };

    // 镜头脚本
    const getShotScript = () => {
      const shots: Record<string, string[]> = {
        '旅游': [
          '镜头1：特写手机屏幕，显示机票价格，表情震惊',
          '镜头2：全景地铁车厢，上班族瘫在座位上叹气',
          '镜头3：特写钱包，里面只有几张零钱',
          '镜头4：中景，上班族拿起手机，表情从沮丧到惊喜',
          '镜头5：特写手机屏幕，显示省钱攻略',
          '镜头6：全景，上班族开心地规划旅行'
        ],
        '母婴': [
          '镜头1：特写婴儿用品，价格标签昂贵',
          '镜头2：中景，宝妈抱着宝宝，表情疲惫',
          '镜头3：特写手机，显示育儿省钱攻略',
          '镜头4：中景，宝妈开心地购物',
          '镜头5：特写宝宝，表情可爱',
          '镜头6：全景，温馨的亲子时光'
        ],
        '美妆': [
          '镜头1：特写化妆品价格标签，价格昂贵',
          '镜头2：中景，女生对着镜子化妆，表情无奈',
          '镜头3：特写手机，显示美妆省钱APP',
          '镜头4：中景，女生开心地挑选化妆品',
          '镜头5：特写化妆过程，效果展示',
          '镜头6：全景，女生自信地展示妆容'
        ],
        '健康': [
          '镜头1：特写健身房价格表，费用昂贵',
          '镜头2：中景，健身人士在跑步机上，表情疲惫',
          '镜头3：特写手机，显示健康管理APP',
          '镜头4：中景，健身人士开心地运动',
          '镜头5：特写运动效果，身材变化',
          '镜头6：全景，健康活力的生活状态'
        ]
      };
      
      return shots[industry] || [
        '镜头1：特写问题场景，表现痛点',
        '镜头2：中景，用户表情困扰',
        '镜头3：特写解决方案，手机屏幕',
        '镜头4：中景，用户表情转变',
        '镜头5：特写效果展示',
        '镜头6：全景，问题解决后的满足感'
      ];
    };

    // 台词脚本
    const getDialogueScript = () => {
      const dialogues: Record<string, string[]> = {
        '旅游': [
          '旁白：通勤路上，钱包瘦了一圈💸',
          '上班族：旅游途中，消费比工资还高😵‍💫',
          '旁白：好在——发现了省钱旅游神器✨',
          '上班族：出差也能省下一大笔💰',
          '旁白：省下的钱，拿来享受生活，不香吗？！',
          '上班族：省钱小妙招，告别"旅游破产"，旅行梦我们慢慢来🌟'
        ],
        '母婴': [
          '旁白：带娃日常，奶粉尿布比黄金还贵💰',
          '宝妈：家庭聚会，装备比搬家还多🎒',
          '旁白：好在——发现了育儿省钱神器✨',
          '宝妈：睡前哄娃，比加班还累😴',
          '旁白：省下的钱，拿来买更多玩具，不香吗？！',
          '宝妈：省钱小妙招，告别"育儿破产"，带娃梦我们慢慢来🌟'
        ],
        '美妆': [
          '旁白：通勤化妆，地铁上补妆像杂技表演🎭',
          '女生：夜宵后卸妆，比上班还认真🧴',
          '旁白：好在——发现了美妆省钱神器✨',
          '女生：独处时刻护肤，比约会还精致💄',
          '旁白：省下的钱，拿来买更多化妆品，不香吗？！',
          '女生：省钱小妙招，告别"美妆破产"，变美梦我们慢慢来🌟'
        ],
        '健康': [
          '旁白：健身打卡，肌肉比钱包还瘦💪',
          '健身人士：碎片时间养生，比工作还忙🏃‍♀️',
          '旁白：好在——发现了健康管理神器✨',
          '健身人士：睡前养生，比考试还紧张😰',
          '旁白：省下的钱，拿来买更多健康产品，不香吗？！',
          '健身人士：省钱小妙招，告别"健康破产"，养生梦我们慢慢来🌟'
        ]
      };
      
      return dialogues[industry] || [
        '旁白：在' + use_case + '中遇到' + pain_point + '，简直让人崩溃😫',
        target_audience + '：' + pain_point + '？钱包在哭泣，心在滴血💸',
        '旁白：好在——发现了' + core_value + '神器✨',
        target_audience + '：通过' + core_value + '，钱包终于不用哭泣了💰',
        '旁白：省下的钱，拿来享受生活，不香吗？！',
        target_audience + '：省钱小妙招，告别"开销恐惧症"，生活梦我们慢慢来🌟'
      ];
    };

    // BGM建议
    const getBGM = () => {
      const bgm: Record<string, string> = {
        '旅游': '轻快旅行音乐，营造轻松愉快的氛围',
        '母婴': '温馨亲子音乐，营造温馨有爱的氛围',
        '美妆': '时尚美妆音乐，营造精致优雅的氛围',
        '健康': '活力健身音乐，营造积极向上的氛围'
      };
      
      return bgm[industry] || '轻快背景音乐，营造积极向上的氛围';
    };

    const setting = getVideoSetting();
    const shots = getShotScript();
    const dialogues = getDialogueScript();
    const bgm = getBGM();

    return `📹 ${target_audience}专属短视频脚本

【场景设定】
${setting}

【镜头脚本】
${shots.join('\n')}

【台词脚本】
${dialogues.join('\n')}

【BGM建议】
${bgm}

【互动引导】
${generateHumorousCallToAction()}

【标签】
${getIndustryTags().join(' ')}`;
  };

  /**
   * 生成标准短视频脚本
   */
  const generateStandardVideoScript = () => {
    const { target_audience, use_case, pain_point, core_value, industry } = selectedItems;
    
    // 只检查必选维度
    const requiredCheck = checkRequiredDimensions();
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      return `❌ 请确保选择了所有必要维度：${missingNames.join('、')}`;
    }
    
    return `📹 ${target_audience}专属短视频脚本

【场景设定】
${use_case}场景，${target_audience}在面临${pain_point}的困扰

【镜头脚本】
镜头1：特写问题场景，表现痛点
镜头2：中景，${target_audience}表情困扰
镜头3：特写解决方案，手机屏幕显示${core_value || '解决方案'}
镜头4：中景，${target_audience}表情转变
镜头5：特写效果展示
镜头6：全景，问题解决后的满足感

【台词脚本】
旁白：在${use_case}中，${target_audience}常常面临${pain_point}的困扰
${target_audience}：这种挑战不仅影响日常体验${selectedItems.emotional_need ? `，更让人感到${selectedItems.emotional_need}` : ''}
旁白：然而，${core_value ? `通过${core_value}，我们可以有效解决这些问题` : '我们可以提供有效的解决方案'}
${target_audience}：${generateIndustrySpecificContent()}
旁白：让我们一起，为${target_audience}创造更好的${use_case}体验

【BGM建议】
温馨背景音乐，营造积极向上的氛围

【互动引导】
${generateStandardCallToAction()}

【标签】
#${target_audience} #${use_case} #${industry}`;
  };

  /**
   * 操作（支持传入自定义selectedItems）
   */
  const generateIdea = async (customSelectedItems?: Record<string, string>) => {
    const useItems = customSelectedItems || selectedItems;
    const { target_audience, use_case, pain_point, content_format, tone_style, core_value, emotional_need, industry, platform_or_trend } = useItems;
    
    // 检查必选维度 - 使用统一的核心必选维度定义
    const requiredCheck = (() => {
      const coreRequiredDimensions = ['target_audience', 'use_case', 'pain_point', 'industry'];
      const missingDimensions = coreRequiredDimensions.filter(dim => {
        const value = useItems[dim];
        return !value || value.trim() === '';
      });
      return {
        isValid: missingDimensions.length === 0,
        missing: missingDimensions
      };
    })();
    
    if (!requiredCheck.isValid) {
      const missingNames = requiredCheck.missing.map(dim => {
        const dimension = dimensions.find(d => d.id === dim);
        return dimension?.name || dim;
      });
      toast({
        title: "关键维度缺失",
        description: `请确保已选择【${missingNames.join('】【')}】后再生成内容`,
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      // 构建AI提示词
      const prompt = buildPrompt();
      
      // 确定内容类型
      const format = content_format || '图文';
      const isVideo = format.includes('视频') || format.includes('短视频');
      const contentType = isVideo ? 'video' : 'text';
      
      // 调用统一AI服务操作
      console.log('🎨 starts调用统一AI创意生成service');
      
      // 构建创意生成提示词
      const creativityPrompt = `请为以下维度操作：

**目标受众**：${selectedItems.target_audience || '通用用户'}
**使用场景**：${selectedItems.use_case || '日常使用'}
**痛点需求**：${selectedItems.pain_point || '需求痛点'}
**内容类型**：${contentType === 'text' ? '图文内容' : '视频脚本'}
**行业领域**：${selectedItems.industry || '通用'}
**附加要求**：${prompt || '无特殊要求'}

请生成符合以上维度要求的高质量创意内容，确保内容具有吸引力、实用性和传播性。

如果是图文内容，请生成完整的文案；
如果是视频脚本，请包含场景描述、对白和转场提示。`;

      const aiResponse = await callUnifiedAI({
        prompt: creativityPrompt,
        taskType: AITaskType.CREATIVE_GENERATION,
        model: 'gpt-5-mini', // 使用中级模型
        maxTokens: contentType === 'video' ? 2000 : 1500,
        temperature: 0.9, // 高创意度
        context: {
          targetAudience: selectedItems.target_audience,
          useCase: selectedItems.use_case,
          painPoint: selectedItems.pain_point,
          contentType,
          industry: selectedItems.industry
        }
      });
      
      if (aiResponse.success && aiResponse.content) {
        setCurrentContent(aiResponse.content);
        setCurrentContentType(contentType);
        
        // {t('creativeCube.actions.save')}到历史记录
        const newResult: CreativeResult = {
          id: Date.now().toString(),
          combination: useItems,
          generatedContent: aiResponse.content,
          contentType,
          timestamp: new Date().toISOString(),
          tags: getIndustryTags()
        };

        // 更新本地状态
        const updatedIdeas = [newResult, ...generatedIdeas.slice(0, 19)]; // 保留最近20条
        setGeneratedIdeas(updatedIdeas);

        // 持久化到用户专属存储
        historyDataManager.saveData(updatedIdeas);
        console.log(`💾 already{t('creativeCube.actions.save')}创意记录到userstorage: ${historyDataManager.getStorageKey()}`);
        
        toast({
          title: "生成成功",
          description: `已生成${contentType === 'video' ? '短视频脚本' : '图文内容'}`,
        });
      } else {
        toast({
          title: "生成失败",
          description: aiResponse.error || 'AI生成内容失败',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : 'AI生成内容失败',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * {t('creativeCube.actions.regenerate')}内容 - 使用相同的维度选择和参数
   */
  const regenerateContent = async () => {
    if (!currentContent) {
      toast({
        title: "无法{t('creativeCube.actions.regenerate')}",
        description: "请先生成内容",
        variant: "destructive"
      });
      return;
    }

    // 检查是否有选择的维度
    const hasSelectedItems = Object.keys(selectedItems).length > 0;
    if (!hasSelectedItems) {
      toast({
        title: "无法{t('creativeCube.actions.regenerate')}",
        description: "请先选择维度",
        variant: "destructive"
      });
      return;
    }

    // 使用相同的参数重新调用生成函数
    await regenerateContent();
  };

  // 旧的AI调用函数已移除，现在使用统一的callCreativeGeneration接口

  /**
   * 解析视频脚本
   */
  const parseVideoScript = (content: string): VideoScript[] => {
    try {
      // 尝试从内容中提取分镜脚本
      const scriptMatch = content.match(/【分镜脚本】([\s\S]*?)(?=\n\n|$)/);
      if (scriptMatch) {
        const scriptText = scriptMatch[1];
        const scenes = scriptText.split('\n').filter(line => line.trim().startsWith('•'));
        
        return scenes.map((scene, index) => ({
          sceneNumber: `镜头${index + 1}`,
          sceneDescription: scene.replace('•', '').trim(),
          dialogue: '',
          tone: '自然',
          emotion: '真实',
          bgm: '轻快背景音乐',
          soundEffect: '',
          shotType: '中景',
          duration: 3
        }));
      }
      
      // 如果没有找到分镜脚本，返回默认结构
      return [
        {
          sceneNumber: '镜头1',
          sceneDescription: '问题场景展示',
          dialogue: '',
          tone: '自然',
          emotion: '困扰',
          bgm: '轻快背景音乐',
          soundEffect: '',
          shotType: '中景',
          duration: 3
        },
        {
          sceneNumber: '镜头2',
          sceneDescription: '解决方案展示',
          dialogue: '',
          tone: '积极',
          emotion: '满意',
          bgm: '轻快背景音乐',
          soundEffect: '',
          shotType: '特写',
          duration: 3
        }
      ];
    } catch (error) {
      console.error('parsingvideo脚本failed:', error);
      return [];
    }
  };

  /**
   * 导出Excel
   */
  const exportToExcel = () => {
    if (currentContentType !== 'video' || !currentContent) {
      toast({
        title: "无法导出",
        description: "只有短视频脚本才能导出Excel",
        variant: "destructive"
      });
      return;
    }

    // 创建CSV内容
    const headers = ['脚本内容'];
    const csvContent = [
      headers.join(','),
      currentContent.replace(/\n/g, '\\n') // 转义换行符
    ].join('\n');

    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `短视频脚本_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "导出成功",
      description: "短视频脚本已导出为CSV文件",
    });
  };

  /**
   * {t('creativeCube.actions.copy')}创意内容
   */
  const copyIdea = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已{t('creativeCube.actions.copy')}到剪贴板",
      description: "创意内容已{t('creativeCube.actions.copy')}",
    });
  };

  /**
   * {t('creativeCube.actions.save')}创意到用户历史记录
   */
  const saveIdea = () => {
    if (!currentContent) {
      toast({
        title: "无内容可{t('creativeCube.actions.save')}",
        description: "请先操作",
        variant: "destructive"
      });
      return;
    }

    // 创建新的历史记录项
    const newResult: CreativeResult = {
      id: `manual_${Date.now()}`,
      combination: selectedItems,
      generatedContent: currentContent,
      contentType: currentContentType,
      timestamp: new Date().toISOString(),
      tags: getIndustryTags()
    };

    // 更新本地状态
    const updatedIdeas = [newResult, ...generatedIdeas.slice(0, 19)]; // 保留最近20条
    setGeneratedIdeas(updatedIdeas);

    // 持久化到用户专属存储
    historyDataManager.saveData(updatedIdeas);

    toast({
      title: "已{t('creativeCube.actions.save')}到创意库",
      description: `创意已{t('creativeCube.actions.save')}到您的专属历史记录 (${historyDataManager.isLoggedIn ? '用户' : '访客'}模式)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 九宫格创意魔方 */}
      <Card>
        <CardHeader className="pb-2 p-4">
          <CardTitle className="flex items-center gap-2 text-lg mb-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">{t('creativeCube.title')}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t('creativeCube.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* 九宫格网格 - 紧凑布局 */}
          <div className="grid grid-cols-3 gap-3">
            {dimensions.map((dimension) => (
              <DimensionCard
                key={dimension.id}
                dimension={dimension}
                selectedItems={selectedItems[dimension.id] ? [selectedItems[dimension.id]] : []}
                onSelect={(item) => selectItem(dimension.id, item)}
                onDeselect={(item) => deselectItem(dimension.id, item)}
                onPin={() => togglePin(dimension.id)}
                isPinned={pinnedDimensions.has(dimension.id)}
                cubeData={cubeData[dimension.id] || []}
                onAddCustomItem={(item) => addCustomItem(dimension.id, item)}
                onRemoveItem={(item) => removeItem(dimension.id, item)}
                onPinItem={(item) => pinItem(dimension.id, item)}
                onUnpinItem={(item) => unpinItem(dimension.id, item)}
                pinnedItems={pinnedItems[dimension.id] || []}
                hiddenItems={hiddenItems[dimension.id] || []}
                isRequired={requiredDimensions.includes(dimension.id)}
                onRestoreDefaults={restoreDimensionDefaults}
                customDimensionsManager={customDimensionsManager}
              />
            ))}
          </div>

          {/* 当前选择的维度显示 */}
          {Object.keys(selectedItems).length > 0 && (
            <div className="py-4 border-t bg-muted/30 rounded-lg">
              <div className="px-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{t('creativeCube.currentSelection.title')}</span>
                  <Badge variant="secondary" className="text-xs">
                    {Object.keys(selectedItems).length}{t('creativeCube.currentSelection.count')}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(selectedItems).map(([dimensionId, value]) => {
                    const dimension = dimensions.find(d => d.id === dimensionId);
                    const status = getDimensionStatus(dimensionId);

                    if (!dimension || !value) return null;

                    return (
                      <div
                        key={dimensionId}
                        className={`flex items-center gap-2 p-2 rounded-md border text-xs ${
                          status.isRequired
                            ? 'bg-destructive/10 border-destructive/30 text-destructive'
                            : status.isRecommended
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-muted border-border text-muted-foreground'
                        }`}
                      >
                        {dimension.icon}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{dimension.name}</div>
                          <div className="text-xs opacity-75 truncate">{value}</div>
                        </div>
                        {pinnedDimensions.has(dimensionId) && (
                          <Pin className="w-3 h-3 text-primary flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t">
            <div className="flex items-center gap-4 flex-wrap">
              
              <div className="flex items-center gap-2 relative flex-wrap">
                <UILabel className="text-sm font-medium whitespace-nowrap">操作</UILabel>
                <div className="relative">
                  <Select
                    value={selectedDimensionCount.toString()}
                    onValueChange={(value) => setSelectedDimensionCount(parseInt(value))}
                  >
                    <SelectTrigger className="w-20 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">{t('creativeCube.dimensionCounts.4')}</SelectItem>
                      <SelectItem value="5">{t('creativeCube.dimensionCounts.5')}</SelectItem>
                      <SelectItem value="6">{t('creativeCube.dimensionCounts.6')}</SelectItem>
                      <SelectItem value="7">{t('creativeCube.dimensionCounts.7')}</SelectItem>
                      <SelectItem value="8">{t('creativeCube.dimensionCounts.8')}</SelectItem>
                      <SelectItem value="9">{t('creativeCube.dimensionCounts.9')}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="absolute inset-0 pointer-events-none">
                    <PermissionLockedButton
                      requiredTier="pro"
                      featureName={t('creativeCube.permissions.dimensionControl')}
                      variant="ghost"
                      className="w-full h-full opacity-0 pointer-events-auto"
                      onClick={() => {}}
                    >
                      <span></span>
                    </PermissionLockedButton>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {requiredDimensions.length}操作+{selectedDimensionCount - requiredDimensions.length}随机选择
                </span>
              </div>

              <div className="flex items-center gap-2">
                <PermissionLockedButton
                  requiredTier="pro"
                  featureName={t('creativeCube.permissions.randomGenerate')}
                  variant="outline"
                  size="sm"
                  onClick={controlledRandomGenerate}
                  disabled={isGenerating}
                  className="border-primary text-primary hover:bg-accent h-9"
                >
                  🎲 随机选择一键生成
                </PermissionLockedButton>

                <PermissionLockedButton
                  requiredTier="pro"
                  featureName={t('creativeCube.permissions.clearSelection')}
                  variant="outline"
                  size="sm"
                  onClick={clearAllSelections}
                  disabled={isGenerating}
                  className="h-9"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清空
                </PermissionLockedButton>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <PermissionLockedButton
                requiredTier="pro"
                featureName="操作"
                onClick={handleGenerateContent}
                disabled={!isValidGeneration || isGenerating}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    操作
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    操作
                  </>
                )}
              </PermissionLockedButton>
            </div>
          </div>

          
          {currentContent && (
            <Card className="border-2 border-primary bg-accent">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    生成结果
                  </CardTitle>

                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  // 解析生成内容，分离标题、正文、互动引导 - 增强清理版
                  const parseGeneratedContent = (content: string) => {
                    // 第一步：移除格式化标记和前缀
                    let cleanContent = content
                      // 移除标题相关标记
                      .replace(/\*\*标题\*\*/g, '')
                      .replace(/\*\*标题：\*\*/g, '')
                      .replace(/【标题】/g, '')
                      .replace(/标题：/g, '')
                      // 移除正文相关标记
                      .replace(/\*\*正文\*\*/g, '')
                      .replace(/\*\*正文：\*\*/g, '')
                      .replace(/【正文】/g, '')
                      .replace(/正文：/g, '')
                      // 移除互动引导相关标记
                      .replace(/\*\*互动引导\*\*/g, '')
                      .replace(/\*\*互动引导：\*\*/g, '')
                      .replace(/【互动引导】/g, '')
                      .replace(/互动引导：/g, '')
                      // 移除其他格式化标记
                      .replace(/\*\*内容\*\*/g, '')
                      .replace(/\*\*文案\*\*/g, '')
                      .replace(/\*\*梗点\*\*/g, '')
                      .replace(/\*\*梗点：\*\*/g, '')
                      .replace(/【梗点】/g, '')
                      .replace(/梗点：/g, '');

                    // 第二步：移除emoji节奏说明
                    cleanContent = cleanContent
                      .replace(/✨emoji节奏：[^\n]*/g, '')
                      .replace(/emoji节奏：[^\n]*/g, '')
                      .replace(/✨[^：]*节奏：[^\n]*/g, '');

                    // 第三步：移除配图建议
                    cleanContent = cleanContent
                      .replace(/（配图建议：[^）]*）/g, '')
                      .replace(/\(配图建议：[^)]*\)/g, '')
                      .replace(/【配图建议：[^】]*】/g, '')
                      .replace(/配图建议：[^\n]*/g, '');

                    // 第四步：移除字数统计和策略说明
                    cleanContent = cleanContent
                      .replace(/（全文\d+字[^）]*）/g, '')
                      .replace(/\(全文\d+字[^)]*\)/g, '')
                      .replace(/【全文\d+字[^】]*】/g, '')
                      .replace(/全文\d+字[^\n]*/g, '')
                      .replace(/（字数：\d+[^）]*）/g, '')
                      .replace(/\(字数：\d+[^)]*\)/g, '')
                      .replace(/字数：\d+[^\n]*/g, '');

                    // 第五步：移除策略说明和创作思路
                    cleanContent = cleanContent
                      .replace(/（策略说明：[^）]*）/g, '')
                      .replace(/\(策略说明：[^)]*\)/g, '')
                      .replace(/【策略说明：[^】]*】/g, '')
                      .replace(/策略说明：[^\n]*/g, '')
                      .replace(/（创作思路：[^）]*）/g, '')
                      .replace(/\(创作思路：[^)]*\)/g, '')
                      .replace(/【创作思路：[^】]*】/g, '')
                      .replace(/创作思路：[^\n]*/g, '');

                    // 第六步：移除文案技巧和元信息提示
                    cleanContent = cleanContent
                      .replace(/（文案技巧：[^）]*）/g, '')
                      .replace(/\(文案技巧：[^)]*\)/g, '')
                      .replace(/【文案技巧：[^】]*】/g, '')
                      .replace(/文案技巧：[^\n]*/g, '')
                      .replace(/（技巧说明：[^）]*）/g, '')
                      .replace(/\(技巧说明：[^)]*\)/g, '')
                      .replace(/【技巧说明：[^】]*】/g, '')
                      .replace(/技巧说明：[^\n]*/g, '')
                      .replace(/（创作技巧：[^）]*）/g, '')
                      .replace(/\(创作技巧：[^)]*\)/g, '')
                      .replace(/【创作技巧：[^】]*】/g, '')
                      .replace(/创作技巧：[^\n]*/g, '');

                    // 第七步：移除其他无效内容
                    cleanContent = cleanContent
                      .replace(/（注：[^）]*）/g, '')
                      .replace(/\(注：[^)]*\)/g, '')
                      .replace(/【注：[^】]*】/g, '')
                      .replace(/注：[^\n]*/g, '')
                      .replace(/（备注：[^）]*）/g, '')
                      .replace(/\(备注：[^)]*\)/g, '')
                      .replace(/【备注：[^】]*】/g, '')
                      .replace(/备注：[^\n]*/g, '');

                    // 第八步：清理多余的空行和空格
                    cleanContent = cleanContent
                      .replace(/\n\s*\n\s*\n/g, '\n\n') // 多个空行合并为两个
                      .replace(/^\s+|\s+$/g, '') // 去除首尾空格
                      .trim();

                    // 尝试分离不同部分
                    const sections = cleanContent.split('\n\n').filter(section => section.trim());

                    if (sections.length >= 2) {
                      // 如果有多个段落，第一个作为标题，其余作为正文
                      const title = sections[0].trim();
                      const mainContent = sections.slice(1).join('\n\n').trim();

                      return {
                        hasStructure: true,
                        title,
                        mainContent,
                        interaction: '' // 互动引导通常在最后，这里暂时为空
                      };
                    } else {
                      // 如果只有一个段落，全部作为正文
                      return {
                        hasStructure: false,
                        title: '',
                        mainContent: cleanContent,
                        interaction: ''
                      };
                    }
                  };

                  const parsed = parseGeneratedContent(currentContent);

                  return (
                    <div className="space-y-4">
                      
                      {parsed.hasStructure && parsed.title && (
                        <div className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-muted-foreground font-medium">{t('creativeCube.result.creativeTitle')}</div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  setEditingState({
                                    isEditing: true,
                                    type: 'title',
                                    value: parsed.title
                                  });
                                }}
                              >
                                {t('creativeCube.actions.edit')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  navigator.clipboard.writeText(parsed.title);
                                  toast({ title: "标题已{t('creativeCube.actions.copy')}", description: "创意标题已{t('creativeCube.actions.copy')}到剪贴板" });
                                }}
                              >
                                {t('creativeCube.actions.copy')}
                              </Button>
                            </div>
                          </div>
                          <div className="text-base font-semibold text-primary leading-relaxed">
                            {editingState.isEditing && editingState.type === 'title' ? (
                              <div className="flex gap-2 items-center">
                                <Input
                                  value={editingState.value}
                                  onChange={(e) => setEditingState(prev => ({ ...prev, value: e.target.value }))}
                                  className="flex-1"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const updatedContent = currentContent.replace(parsed.title, editingState.value);
                                      setCurrentContent(updatedContent);
                                      setEditingState({ isEditing: false, type: null, value: '' });
                                    } else if (e.key === 'Escape') {
                                      setEditingState({ isEditing: false, type: null, value: '' });
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  className="h-8 px-3"
                                  onClick={() => {
                                    const updatedContent = currentContent.replace(parsed.title, editingState.value);
                                    setCurrentContent(updatedContent);
                                    setEditingState({ isEditing: false, type: null, value: '' });
                                  }}
                                >
                                  {t('creativeCube.actions.save')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3"
                                  onClick={() => {
                                    setEditingState({ isEditing: false, type: null, value: '' });
                                  }}
                                >
                                  {t('creativeCube.actions.cancel')}
                                </Button>
                              </div>
                            ) : (
                              parsed.title
                            )}
                          </div>
                        </div>
                      )}

                      
                      <div className="p-4 bg-card rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-muted-foreground font-medium">
                            {parsed.hasStructure ? '主要内容' : '创意内容'}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => {
                                setEditingState({
                                  isEditing: true,
                                  type: 'content',
                                  value: parsed.mainContent
                                });
                              }}
                            >
                              {t('creativeCube.actions.edit')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(parsed.mainContent);
                                toast({ title: "内容已{t('creativeCube.actions.copy')}", description: "创意内容已{t('creativeCube.actions.copy')}到剪贴板" });
                              }}
                            >
                              {t('creativeCube.actions.copy')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs bg-primary/10 hover:bg-primary/20"
                              onClick={() => {
                                // {t('creativeCube.actions.copy')}内容并跳转到AI内容适配
                                const contentToTransfer = parsed.mainContent;

                                // 使用React Router的navigate方式跳转，并传递预填充内容
                                window.location.href = '/new-adapt';

                                // 同时将内容存储到sessionStorage作为备用
                                sessionStorage.setItem('ai_adapter_content', contentToTransfer);
                                sessionStorage.setItem('ai_adapter_source', '创意魔方');

                                toast({
                                  title: "正在跳转至AI内容适配",
                                  description: "内容已准备好，即将自动填入适配器"
                                });
                              }}
                            >
                              一键{t('creativeCube.actions.copy')}至AI内容适配
                            </Button>
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {editingState.isEditing && editingState.type === 'content' ? (
                            <Textarea
                              value={editingState.value}
                              onChange={(e) => setEditingState(prev => ({ ...prev, value: e.target.value }))}
                              className="w-full min-h-[200px] resize-none border-2 border-primary/20 focus:border-primary/50 rounded-lg p-3"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  setEditingState({ isEditing: false, type: null, value: '' });
                                } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                  // Ctrl+Enter 或 Cmd+Enter {t('creativeCube.actions.save')}
                                  const updatedContent = currentContent.replace(parsed.mainContent, editingState.value);
                                  setCurrentContent(updatedContent);
                                  setEditingState({ isEditing: false, type: null, value: '' });
                                }
                              }}
                              onBlur={() => {
                                // 失去焦点时自动{t('creativeCube.actions.save')}
                                const updatedContent = currentContent.replace(parsed.mainContent, editingState.value);
                                setCurrentContent(updatedContent);
                                setEditingState({ isEditing: false, type: null, value: '' });
                              }}
                              placeholder="{t('creativeCube.actions.edit')}内容... (Ctrl+Enter{t('creativeCube.actions.save')}，Escape{t('creativeCube.actions.cancel')}，失去焦点自动{t('creativeCube.actions.save')})"
                            />
                          ) : (
                            parsed.mainContent
                          )}
                        </div>
                      </div>

                      
                      {parsed.interaction && (
                        <div className="p-3 bg-accent/30 rounded-lg border">
                          <div className="text-xs text-muted-foreground mb-1 font-medium">{t('creativeCube.result.interactionGuide')}</div>
                          <div className="text-sm text-accent-foreground leading-relaxed">
                            {parsed.interaction}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* {t('creativeCube.actions.regenerate')}按钮 */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateContent}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('creativeCube.actions.regenerating')}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('creativeCube.actions.regenerate')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* {t('creativeCube.history.title')} */}
          {generatedIdeas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('creativeCube.history.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {generatedIdeas.map((idea) => (
                    <Card key={idea.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground mb-2">{idea.timestamp}</div>
                            <div className="text-sm line-clamp-3">{idea.generatedContent}</div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyIdea(idea.generatedContent)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentContent(idea.generatedContent)}
                            >
                              <Eye className="w-4 h-4" />
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
        </CardContent>
      </Card>

    </div>
  );
}