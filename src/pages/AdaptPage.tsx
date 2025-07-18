import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Book, Video, MessageSquare, Send,
  RefreshCw, ArrowRight, ChevronDown, ChevronUp,
  Smile, FileText, Hash, Save, Twitter, SquarePlay,
  Edit, Heart, Copy, ExternalLink, Languages, Globe, Zap, Rss, Settings, Check
} from "lucide-react";
import PageNavigation from '@/components/layout/PageNavigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Slider
} from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  generateAdaptedContent, 
  regeneratePlatformContent, 
  platformStyles,
  setApiProvider,
  getApiProvider,
  setModel,
  getModel,
  getAvailableModels
} from "@/api/contentAdapter";
import { 
  getAvailableModelsForTier, 
  getModelInfo, 
  isModelAvailableForTier,
  getAllModels,
  getModelProvider,
  type AIModel 
} from "@/config/aiModels";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlatformApiManager } from '@/components/platform/PlatformApiManager';
import { UsageReminderDialog } from '@/components/ui/usage-reminder-dialog';
import { PremiumFeatureDialog } from '@/components/ui/premium-feature-dialog';
import { 
  publishContent, 
  batchPublishContent, 
  checkPlatformAuth,
  type PublishContent,
  type PublishResult
} from '@/api/platformApiService';

/**
 * 主流平台内容发布入口URL映射
 * 用于一键转发跳转
 */
const platformUrls: Record<string, string> = {
  weibo: 'https://weibo.com/newpost',
  xiaohongshu: 'https://creator.xiaohongshu.com/publish',
  zhihu: 'https://zhuanlan.zhihu.com/write',
  bilibili: 'https://member.bilibili.com/platform/upload/text',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
  baijiahao: 'https://baijiahao.baidu.com/builder/rc/edit',
  kuaishou: 'https://cp.kuaishou.com/article/publish',
  wechat: 'https://mp.weixin.qq.com/',
  facebook: 'https://www.facebook.com/',
  twitter: 'https://twitter.com/compose/tweet',
  linkedin: 'https://www.linkedin.com/feed/',
  v2ex: 'https://www.v2ex.com/new',
  github: 'https://github.com/new',
  sspai: 'https://sspai.com/write',
  juejin: 'https://juejin.cn/editor/drafts/new',
  csdn: 'https://mp.csdn.net/mp_blog/creation/editor',
  hellogithub: 'https://hellogithub.com/',
  ithome: 'https://my.ithome.com/#/write',
  ngabbs: 'https://bbs.nga.cn/thread.php?fid=-7',
  weatheralarm: 'https://www.nmc.cn/',
  earthquake: 'https://www.ceic.ac.cn/',
  history: 'https://baike.baidu.com/item/%E5%8E%86%E5%8F%B2%E4%B8%8A%E7%9A%84%E4%BB%8A%E5%A4%A9/42704'
};

// Helper function to get platform icon
function getPlatformIcon(platformId: string): JSX.Element {
  const platformData = platformStyles[platformId as keyof typeof platformStyles];
  const platformName = platformData?.name || platformId;
  
  switch (platformId) {
    case 'zhihu':
      return (
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 text-blue-500 mr-1" />
          <span className="text-xs">{platformName}</span>
        </div>
      );
    case 'weibo':
      return (
        <div className="flex items-center">
          <Send className="h-4 w-4 text-orange-500 mr-1" />
          <span className="text-xs">{platformName}</span>
        </div>
      );
    case 'xiaohongshu':
      return (
        <div className="flex items-center">
          <Book className="h-4 w-4 text-rose-500 mr-1" />
          <span className="text-xs">{platformName}</span>
        </div>
      );
    case 'wechat':
      return (
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-xs">{platformName}</span>
        </div>
      );
    case 'douyin':
      return (
        <div className="flex items-center">
          <Video className="h-4 w-4 text-black mr-1" />
          <span className="text-xs">{platformName}</span>
        </div>
      );
    case 'video':
      return (
        <div className="flex items-center">
          <SquarePlay className="h-4 w-4 text-green-600 mr-1" />
          <span className="text-xs">{platformName}</span>
        </div>
      );
    case 'twitter':
      return (
        <div className="flex items-center">
          <Twitter className="h-4 w-4 text-black mr-1" />
          <span className="text-xs">{platformName}</span>
        </div>
      );
    case 'bilibili':
      return (
        <div className="flex items-center">
          <Video className="h-4 w-4 text-blue-400 mr-1" />
          <span className="text-xs">{platformName}</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span className="text-xs">{platformName}</span>
        </div>
      );
  }
}

// Helper functions for character count ranges based on platform requirements
function getCharCountMin(platformId: string): number {
  switch (platformId) {
    case 'zhihu': return 200;    // 知乎内容通常较长，要求细致
    case 'douyin': return 50;    // 抖音短视频脚本简短
    case 'xiaohongshu': return 100;  // 小红书笔记有一定长度要求
    case 'wechat': return 300;   // 公众号文章通常较长
    case 'weibo': return 20;     // 微博简短内容
    case 'twitter': return 10;   // Twitter(X)发文限制较短
    case 'video': return 50;     // 视频号脚本简短
    case 'bilibili': return 100; // B站视频脚本通常较详细
    default: return 50;
  }
}

function getCharCountMax(platformId: string): number {
  switch (platformId) {
    case 'zhihu': return 10000;      // 知乎回答可以很长
    case 'douyin': return 1000;      // 抖音脚本通常较短
    case 'xiaohongshu': return 1000; // 小红书笔记字数限制1000字
    case 'wechat': return 20000;     // 公众号文章可以很长
    case 'weibo': return 2000;       // 微博有2000字上限
    case 'twitter': return 280;      // Twitter(X)有280字符限制
    case 'video': return 1000;       // 视频号脚本通常简短
    case 'bilibili': return 5000;    // B站视频脚本可以较长
    default: return 2000;
  }
}

// Progress step
interface ProgressStep {
  status: "waiting" | "loading" | "completed" | "error";
  message: string;
}

interface PlatformResult {
  platformId: string;
  content: string;
  steps: ProgressStep[];
  source?: "ai";
  error?: string;
}

// Platform settings
interface PlatformSettings {
  charCount?: number;
  useEmoji?: boolean;
  useMdFormat?: boolean;
  useAutoFormat?: boolean;
}

// Global settings
interface GlobalSettings {
  charCountPreset: 'auto' | 'mini' | 'standard' | 'detailed';
  globalEmoji: boolean;
  globalMd: boolean;
}

/**
 * 平台选择卡片组件 - 优化后的版本
 * @param icon 平台图标
 * @param title 平台名称
 * @param description 平台描述
 * @param checked 是否选中
 * @param onChange 选中状态变化回调
 */
function CheckboxCard({
  icon,
  title,
  description,
  checked,
  onChange
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Card 
      className={cn(
        "relative border cursor-pointer transition-all duration-200 h-36 flex flex-col", 
        checked 
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" 
          : "bg-background hover:shadow-sm hover:border-gray-300"
      )}
      onClick={() => onChange(!checked)}
    >
      <CardHeader className="pb-1 pt-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <CardTitle className="text-sm font-semibold truncate leading-tight">{title}</CardTitle>
          </div>
          <div className="flex-shrink-0">
            <Checkbox 
              checked={checked}
              onCheckedChange={onChange}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4 flex-grow flex items-start">
        <CardDescription className="text-xs leading-relaxed overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical' as const,
          maxHeight: '4.8rem'
        }}>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

/**
 * 转发历史记录项类型
 */
type ShareHistoryItem = {
  id: string;
  platformId: string;
  platformName: string;
  content: string;
  time: string;
};

export default function AdaptPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [originalContent, setOriginalContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [generating, setGenerating] = useState(false);
  const [useBrandLibrary, setUseBrandLibrary] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<Record<string, PlatformSettings>>({});
  const [showSettings, setShowSettings] = useState<Record<string, boolean>>({});
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  const [translatingPlatforms, setTranslatingPlatforms] = useState<Set<string>>(new Set());
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    charCountPreset: 'auto',
    globalEmoji: false,
    globalMd: false
  });
  
  // AI Model settings
  const [apiProvider, setCurrentApiProvider] = useState<'openai' | 'gemini' | 'deepseek'>('openai');
  const [selectedModel, setSelectedModel] = useState(getModel());
  
  // 订阅等级本地状态，后续可全局提升
  const [userPlan, setUserPlan] = useState<'trial' | 'pro' | 'premium'>('trial');
  
  // 获取可用模型
  const availableModels = getAvailableModelsForTier(userPlan);
  
  // 所有模型
  const allModels = getAllModels();
  
  // 处理模型选择
  const handleModelSelect = (modelId: string, disabled: boolean) => {
    if (disabled) return;
    setSelectedModel(modelId);
    setModel(modelId);
    // 自动切换API提供商
    const provider = getModelProvider(modelId);
    if (provider === 'OpenAI') setCurrentApiProvider('openai');
    if (provider === 'DeepSeek') setCurrentApiProvider('deepseek');
  };
  
  // User store for usage tracking
  const { 
    usageRemaining, 
    decrementUsage 
  } = useUserStore();

  // 使用次数提醒弹窗状态
  const [showUsageReminder, setShowUsageReminder] = useState(false);
  const [usageReminderCount, setUsageReminderCount] = useState(0);
  
  // 高级功能权限弹窗状态
  const [showPremiumFeature, setShowPremiumFeature] = useState(false);
  const [premiumFeatureInfo, setPremiumFeatureInfo] = useState({ name: '', description: '' });

  const platforms = useMemo(() => [
    { id: "xiaohongshu", name: "小红书", description: "适合生活方式、美妆、旅行等分享，强调个人体验和情感共鸣", icon: <Book className="h-4 w-4 text-rose-500" /> },
    { id: "zhihu", name: "知乎", description: "适合专业知识分享和理性讨论，强调逻辑和论证", icon: <MessageSquare className="h-4 w-4 text-blue-500" /> },
    { id: "douyin", name: "抖音脚本", description: "适合短视频脚本，活泼有趣，强调视听效果", icon: <Video className="h-4 w-4 text-black" /> },
    { id: "weibo", name: "新浪微博", description: "简短有力的观点表达，适合热点话题讨论", icon: <Send className="h-4 w-4 text-orange-500" /> },
    { id: "wechat", name: "公众号", description: "深度内容，适合教程、观点和专业分析", icon: <MessageSquare className="h-4 w-4 text-green-500" /> },
    { id: "bilibili", name: "B站", description: "适合视频脚本，兼具专业性和趣味性", icon: <Video className="h-4 w-4 text-blue-400" /> },
    { id: "twitter", name: "X（推特）", description: "简短、直接的表达，支持多种语言和国际化视角", icon: <Twitter className="h-4 w-4 text-black" /> },
    { id: "video", name: "视频号", description: "视频内容与互动引导并重，亲和力强", icon: <SquarePlay className="h-4 w-4 text-green-600" /> },
    { id: "baijia", name: "百家号", description: "长篇深度内容，SEO友好，权威感强，适合资讯类内容", icon: <Globe className="h-4 w-4 text-blue-700" /> },
    { id: "kuaishou", name: "快手", description: "接地气表达，真实朴实，亲民风格，适合生活记录", icon: <Zap className="h-4 w-4 text-yellow-600" /> },
    { id: "wangyi", name: "网易小蜜蜂", description: "注重原创性，文笔流畅，观点独特，适合深度评论", icon: <Rss className="h-4 w-4 text-red-500" /> },
    { id: "toutiao", name: "头条号", description: "标题党友好，热点敏感，算法推荐，适合时事评论", icon: <Globe className="h-4 w-4 text-purple-600" /> }
  ], []);

  const initializeDefaultSettings = useCallback(() => {
    const initialSettings: Record<string, PlatformSettings> = {};
    platforms.forEach(platform => {
      initialSettings[platform.id] = {
        charCount: Math.floor(getCharCountMax(platform.id) * 0.6), // Default to 60% of max
        useEmoji: platform.id === 'xiaohongshu' || platform.id === 'weibo',
        useMdFormat: platform.id === 'zhihu' || platform.id === 'wechat',
        useAutoFormat: true
      };
    });
    setPlatformSettings(initialSettings);
    const initialShowSettings: Record<string, boolean> = {};
    platforms.forEach(platform => {
      initialShowSettings[platform.id] = false;
    });
    setShowSettings(initialShowSettings);
  }, [platforms]);

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('platformSettings', JSON.stringify(platformSettings));
      localStorage.setItem('globalSettings', JSON.stringify(globalSettings));
      localStorage.setItem('selectedPlatforms', JSON.stringify(selectedPlatforms));
      toast({
        title: "设置已保存",
        description: "您的平台设置已成功保存",
      });
    } catch {
      toast({
        title: "保存设置失败",
        description: "无法保存您的设置，请稍后再试",
        variant: "destructive"
      });
    }
  };

  // Auto-save settings when they change
  useEffect(() => {
    if (Object.keys(platformSettings).length > 0) {
      localStorage.setItem('platformSettings', JSON.stringify(platformSettings));
    }
  }, [platformSettings]);

  useEffect(() => {
    if (Object.keys(globalSettings).length > 0) {
      localStorage.setItem('globalSettings', JSON.stringify(globalSettings));
    }
  }, [globalSettings]);

  useEffect(() => {
    if (selectedPlatforms.length > 0) {
      localStorage.setItem('selectedPlatforms', JSON.stringify(selectedPlatforms));
    }
  }, [selectedPlatforms]);

  // Initialize platform settings
  useEffect(() => {
    // Try to load saved settings from localStorage
    const savedSettings = localStorage.getItem('platformSettings');
    const savedGlobalSettings = localStorage.getItem('globalSettings');
    const savedSelectedPlatforms = localStorage.getItem('selectedPlatforms');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setPlatformSettings(parsedSettings);
      } catch {
        console.error("Failed to parse saved platform settings");
        initializeDefaultSettings();
      }
    } else {
      initializeDefaultSettings();
    }
    
    if (savedGlobalSettings) {
      try {
        const parsedGlobalSettings = JSON.parse(savedGlobalSettings);
        setGlobalSettings(parsedGlobalSettings);
      } catch {
        console.error("Failed to parse saved global settings");
      }
    }

    if (savedSelectedPlatforms) {
      try {
        const parsedSelectedPlatforms = JSON.parse(savedSelectedPlatforms);
        setSelectedPlatforms(parsedSelectedPlatforms);
      } catch {
        console.error("Failed to parse saved selected platforms");
      }
    }
    
    // Initialize showSettings
    const initialShowSettings: Record<string, boolean> = {};
    platforms.forEach(platform => {
      initialShowSettings[platform.id] = false;
    });
    setShowSettings(initialShowSettings);
  }, [initializeDefaultSettings, platforms]);

  useEffect(() => {
    initializeDefaultSettings();
  }, [initializeDefaultSettings]);

  // Character count display
  const contentCharCount = originalContent.length;
  
  // Check if content meets requirements for selected platforms
  const canGenerate = originalContent.trim().length > 10 && selectedPlatforms.length > 0 && usageRemaining > 0;

  // 检查使用次数并显示提醒
  const checkUsageAndShowReminder = () => {
    if (usageRemaining <= 3 && usageRemaining > 0) {
      setUsageReminderCount(usageRemaining);
      setShowUsageReminder(true);
      return false;
    }
    return true;
  };

  // 检查高级功能权限
  const checkPremiumFeature = (featureName: string, featureDescription: string) => {
    if (userPlan === 'trial') {
      setPremiumFeatureInfo({ name: featureName, description: featureDescription });
      setShowPremiumFeature(true);
      return false;
    }
    return true;
  };

  // Handle platform selection
  const togglePlatform = (platformId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPlatforms(prev => [...prev, platformId]);
    } else {
      setSelectedPlatforms(prev => prev.filter(id => id !== platformId));
    }
  };

  // Toggle platform settings visibility
  const toggleSettings = (platformId: string) => {
    setShowSettings(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
  };

  // Update platform settings
  const updatePlatformSetting = (platformId: string, key: keyof PlatformSettings, value: unknown) => {
    setPlatformSettings(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [key]: value
      }
    }));
  };

  // Update global settings
  const updateGlobalSetting = (key: keyof GlobalSettings, value: unknown) => {
    setGlobalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply global settings to all platforms
  const applyGlobalSettings = () => {
    const updatedSettings = {...platformSettings};
    
    // Apply emoji setting if enabled globally
    if (globalSettings.globalEmoji) {
      Object.keys(updatedSettings).forEach(platformId => {
        updatedSettings[platformId].useEmoji = true;
      });
    }
    
    // Apply markdown setting if enabled globally
    if (globalSettings.globalMd) {
      Object.keys(updatedSettings).forEach(platformId => {
        updatedSettings[platformId].useMdFormat = true;
      });
    }
    
    // Apply character count based on preset
    if (globalSettings.charCountPreset !== 'auto') {
      Object.keys(updatedSettings).forEach(platformId => {
        switch (globalSettings.charCountPreset) {
          case 'mini':
            updatedSettings[platformId].charCount = Math.min(200, getCharCountMax(platformId));
            break;
          case 'standard':
            updatedSettings[platformId].charCount = Math.min(800, getCharCountMax(platformId));
            break;
          case 'detailed':
            updatedSettings[platformId].charCount = getCharCountMax(platformId);
            break;
        }
      });
    }
    
    setPlatformSettings(updatedSettings);
  };

  // 生成内容后保存到历史记录
  const saveToHistory = (results: PlatformResult[]) => {
    const username = 'anonymous'; // 简化处理，使用固定用户名
    const historyKey = `history_${username}`;
    
    const old = localStorage.getItem(historyKey);
    let list: unknown[] = [];
    if (old) {
      try {
        list = JSON.parse(old);
      } catch {
        // 忽略JSON解析错误
      }
    }
    const now = new Date().toISOString();
    results.forEach(r => {
      if (r.content) {
        list.push({
          platformId: r.platformId,
          content: r.content,
          timestamp: now
        });
      }
    });
    localStorage.setItem(historyKey, JSON.stringify(list));
  };

  // 修改generateContent，在内容生成成功后调用saveToHistory
  const generateContent = async () => {
    if (!canGenerate) return;
    
    // 检查使用次数并显示提醒
    if (!checkUsageAndShowReminder()) {
      return;
    }
    
    if (usageRemaining <= 0) {
      toast({
        title: "使用次数已用完",
        description: "请通过邀请好友获取更多使用机会",
        variant: "destructive"
      });
      return;
    }
    setGenerating(true);
    applyGlobalSettings();
    const initialResults: PlatformResult[] = selectedPlatforms.map(platformId => ({
      platformId,
      content: "",
      steps: [
        { status: "loading", message: "分析原始内容..." },
        { status: "waiting", message: "提取核心信息..." },
        { status: "waiting", message: "进行平台适配..." },
        { status: "waiting", message: "优化输出结果..." }
      ]
    }));
    setResults(initialResults);
    try {
      // Prepare the settings for each platform
      const platformSettingsForAPI: Record<string, unknown> = {};
      selectedPlatforms.forEach(platformId => {
        const settings = platformSettings[platformId];
        platformSettingsForAPI[`${platformId}-charCount`] = settings?.charCount || getCharCountMax(platformId) * 0.6;
        platformSettingsForAPI[`${platformId}-emoji`] = settings?.useEmoji || false;
        platformSettingsForAPI[`${platformId}-mdFormat`] = settings?.useMdFormat || false;
        platformSettingsForAPI[`${platformId}-autoFormat`] = settings?.useAutoFormat || false;
        platformSettingsForAPI[`${platformId}-brandLibrary`] = useBrandLibrary;
      });
      
      // Call API to generate content for all selected platforms
      const generatedContent = await generateAdaptedContent(
        originalContent,
        selectedPlatforms,
        platformSettingsForAPI
      );
      
      // Process each platform sequentially for better UX
      for (let i = 0; i < selectedPlatforms.length; i++) {
        const platformId = selectedPlatforms[i];
        
        // Update steps progressively
        const updateStep = (stepIndex: number, status: "waiting" | "loading" | "completed" | "error") => {
          setResults(current => 
            current.map(result => 
              result.platformId === platformId 
                ? {
                    ...result,
                    steps: result.steps.map((step, idx) => 
                      idx === stepIndex ? { ...step, status } : step
                    )
                  }
                : result
            )
          );
        };
        
        // Simulate progressive steps (in real app, these would map to actual processing stages)
        updateStep(0, "completed");
        await new Promise(r => setTimeout(r, 300));
        
        updateStep(1, "loading");
        await new Promise(r => setTimeout(r, 300));
        updateStep(1, "completed");
        
        updateStep(2, "loading");
        await new Promise(r => setTimeout(r, 300));
        updateStep(2, "completed");
        
        updateStep(3, "loading");
        await new Promise(r => setTimeout(r, 300));
        
        // Update content for each platform
        for (const platformId of selectedPlatforms) {
          const adaptedContent = generatedContent[platformId];
          if (adaptedContent && adaptedContent.content) {
            updateStep(3, "completed");
            
            // Update content in results
            setResults(current => 
              current.map(result => 
                result.platformId === platformId 
                  ? { 
                      ...result, 
                      content: adaptedContent.content,
                      source: adaptedContent.source,
                      error: adaptedContent.error 
                    }
                  : result
              )
            );
          } else {
            // Handle case where adaptedContent is undefined or has no content
            updateStep(3, "error");
            setResults(current => 
              current.map(result => 
                result.platformId === platformId 
                  ? { 
                      ...result, 
                      error: "生成失败：无法获取适配内容"
                    }
                  : result
              )
            );
          }
        }
      }
      
      // Decrement usage after successful generation
      decrementUsage();
      
      // 生成完成后保存历史
      saveToHistory(results);
      toast({
        title: "内容已生成",
        description: `已成功为${selectedPlatforms.length}个平台生成内容`,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      
      // Update all platforms with error status
      setResults(current => 
        current.map(result => ({
          ...result,
          steps: result.steps.map(step => 
            step.status === "loading" 
              ? { ...step, status: "error" }
              : step
          ),
          error: error instanceof Error ? error.message : "生成失败"
        }))
      );
      
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "内容生成过程中发生错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  // Copy content to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制到剪贴板",
      description: "内容已成功复制，可直接粘贴使用",
    });
  };

  // Edit content
  const handleEdit = (platformId: string) => {
    setEditingPlatform(editingPlatform === platformId ? null : platformId);
  };

  const handleSaveEdit = (platformId: string, newContent: string) => {
    setResults(current => 
      current.map(result => 
        result.platformId === platformId 
          ? { ...result, content: newContent }
          : result
      )
    );
    setEditingPlatform(null);
    toast({
      title: "保存成功",
      description: "内容已更新",
    });
  };

  // Favorite content
  const handleFavorite = (platformId: string) => {
    const result = results.find(r => r.platformId === platformId);
    if (!result || !result.content) {
      toast({
        title: "无法收藏",
        description: "没有可收藏的内容",
        variant: "destructive"
      });
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoriteItem = {
      id: Date.now().toString(),
      platformId,
      content: result.content,
      platformName: platformId,
      timestamp: new Date().toISOString()
    };
    
    favorites.push(favoriteItem);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    toast({
      title: "收藏成功",
      description: "内容已添加到收藏，可在我的页面查看",
    });
  };

  // 弹窗状态
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [pendingPublish, setPendingPublish] = useState<{ platformId: string; content: string } | null>(null);

  /**
   * 打开一键转发确认弹窗
   * @param platformId 平台ID
   */
  const handlePublish = (platformId: string) => {
    const result = results.find(r => r.platformId === platformId);
    if (!result || !result.content) {
      toast({
        title: "无法发布",
        description: "没有可发布的内容",
        variant: "destructive"
      });
      return;
    }
    setPendingPublish({ platformId, content: result.content });
    setPublishDialogOpen(true);
  };

  /**
   * 处理API直发
   * @param platformId 平台ID
   * @param content 发布内容
   */
  const handleApiPublish = async (platformId: string, content: string) => {
    if (!checkPlatformAuth(platformId)) {
      toast({
        title: "未授权",
        description: "请先配置平台API授权信息",
        variant: "destructive"
      });
      setApiManagerOpen(true);
      return;
    }

    setPublishingPlatforms(prev => new Set(prev).add(platformId));
    
    try {
      const publishData: PublishContent = {
        text: content,
        title: `AI生成内容 - ${new Date().toLocaleString()}`,
        hashtags: []
      };

      const result = await publishContent(platformId, publishData);
      
      if (result.success) {
        // 写入历史记录
        const shareHistory: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
        shareHistory.unshift({
          id: Date.now().toString(),
          platformId,
          platformName: platformId,
          content,
          time: new Date().toISOString()
        });
        localStorage.setItem('shareHistory', JSON.stringify(shareHistory));

        toast({
          title: "发布成功",
          description: `内容已成功发布到${platformId}`,
        });

        if (result.publishUrl) {
          window.open(result.publishUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        toast({
          title: "发布失败",
          description: result.error || '发布过程中出现错误',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "发布失败",
        description: error instanceof Error ? error.message : '网络错误',
        variant: "destructive"
      });
    } finally {
      setPublishingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platformId);
        return newSet;
      });
    }
  };

  /**
   * 批量API直发
   * @param platforms 平台ID数组
   */
  const handleBatchApiPublish = async (platforms: string[]) => {
    const unauthorizedPlatforms = platforms.filter(p => !checkPlatformAuth(p));
    
    if (unauthorizedPlatforms.length > 0) {
      toast({
        title: "部分平台未授权",
        description: `请先配置 ${unauthorizedPlatforms.join(', ')} 的API授权信息`,
        variant: "destructive"
      });
      setApiManagerOpen(true);
      return;
    }

    const availablePlatforms = platforms.filter(p => checkPlatformAuth(p));
    if (availablePlatforms.length === 0) {
      toast({
        title: "无可用平台",
        description: "请先配置至少一个平台的API授权信息",
        variant: "destructive"
      });
      return;
    }

    // 获取第一个平台的内容作为模板
    const firstResult = results.find(r => r.platformId === availablePlatforms[0]);
    if (!firstResult?.content) {
      toast({
        title: "无内容可发布",
        description: "请先生成内容",
        variant: "destructive"
      });
      return;
    }

    setPublishingPlatforms(new Set(availablePlatforms));

    try {
          const publishData: PublishContent = {
      text: firstResult.content,
      title: `AI生成内容 - ${new Date().toLocaleString()}`,
      hashtags: []
    };

    const results = await batchPublishContent(availablePlatforms, publishData);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      // 写入历史记录
      const shareHistory: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
      results.forEach((result, index) => {
        if (result.success) {
          shareHistory.unshift({
            id: Date.now().toString() + index,
            platformId: availablePlatforms[index],
            platformName: availablePlatforms[index],
            content: firstResult.content,
            time: new Date().toISOString()
          });
        }
      });
      localStorage.setItem('shareHistory', JSON.stringify(shareHistory));

      toast({
        title: "批量发布完成",
        description: `成功: ${successCount}个平台，失败: ${failCount}个平台`,
      });

      // 打开成功的发布链接
      results.forEach((result, index) => {
        if (result.success && result.publishUrl) {
          setTimeout(() => {
            window.open(result.publishUrl, '_blank', 'noopener,noreferrer');
          }, index * 500);
        }
      });
    } catch (error) {
      toast({
        title: "批量发布失败",
        description: error instanceof Error ? error.message : '网络错误',
        variant: "destructive"
      });
    } finally {
      setPublishingPlatforms(new Set());
    }
  };

  /**
   * 确认一键转发
   */
  const confirmPublish = () => {
    if (!pendingPublish) return;
    const { platformId, content } = pendingPublish;
    
    if (publishMode === 'api') {
      handleApiPublish(platformId, content);
    } else {
      // 传统跳转模式
      navigator.clipboard.writeText(content);
      // 写入历史记录
      const shareHistory: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
      shareHistory.unshift({
        id: Date.now().toString(),
        platformId,
        platformName: platformId,
        content,
        time: new Date().toISOString()
      });
      localStorage.setItem('shareHistory', JSON.stringify(shareHistory));
      // 跳转
      const url = platformUrls[platformId];
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        toast({
          title: "内容已复制，正在跳转",
          description: `内容已复制到剪贴板，正在打开${platformId}官网`,
        });
      } else {
        toast({
          title: "内容已复制",
          description: "内容已复制到剪贴板，但该平台的发布链接暂未配置",
        });
      }
    }
    
    setPublishDialogOpen(false);
    setPendingPublish(null);
  };

  /**
   * 处理一键翻译，防止3秒内重复点击
   * @param platformId 平台ID
   * @param content 待翻译内容
   */
  const handleTranslate = async (platformId: string, content: string) => {
    if (translatingPlatforms.has(platformId)) {
      toast({
        title: "请勿频繁点击",
        description: "翻译进行中，请稍候...",
        variant: "destructive"
      });
      return;
    }
    setTranslatingPlatforms(prev => new Set(prev).add(platformId));
    try {
      // 优先调用翻译API
      const translatedText = await callTranslationAPI(content);
      setTranslatedContent(prev => ({
        ...prev,
        [platformId]: translatedText
      }));
      toast({
        title: "翻译完成",
        description: "内容已翻译为英文",
      });
    } catch {
      toast({
        title: "翻译失败",
        description: "翻译过程中出现错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setTranslatingPlatforms(prev => {
          const newSet = new Set(prev);
          newSet.delete(platformId);
          return newSet;
        });
      }, 3000);
    }
  };

  // 调用翻译API
  const callTranslationAPI = async (content: string): Promise<string> => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          targetLang: 'en',
          sourceLang: 'zh'
        })
      });

      if (!response.ok) {
        throw new Error('Translation API failed');
      }

      const data = await response.json();
      return data.translatedText || content;
    } catch {
      console.error('Translation API error');
      // 如果API调用失败，回退到模拟翻译
      return simulateTranslation(content);
    }
  };

  // 模拟翻译（作为备用方案）
  const simulateTranslation = async (content: string): Promise<string> => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的翻译模拟
    const translations: Record<string, string> = {
      '小红书': 'Xiaohongshu',
      '抖音': 'TikTok',
      '微博': 'Weibo',
      '知乎': 'Zhihu',
      '公众号': 'WeChat Official Account',
      'B站': 'Bilibili',
      '视频号': 'Video Account',
      '试了': 'tried',
      '味道': 'taste',
      '治愈': 'healing',
      '小时候': 'childhood',
      '牛奶糖': 'milk candy',
      '甜而不腻': 'sweet but not cloying',
      '质地': 'texture',
      '冰淇淋': 'ice cream',
      '慕斯': 'mousse',
      '水润': 'moisturizing',
      '吸收': 'absorption',
      '粘腻': 'sticky',
      '秋冬': 'autumn and winter',
      '干皮': 'dry skin',
      '姐妹们': 'sisters',
      '闭眼冲': 'go for it blindly',
      '身体乳': 'body lotion',
      '护肤': 'skincare',
      '救星': 'savior',
      '推荐': 'recommend',
      '真的': 'really',
      '超级': 'super',
      '好用': 'good to use',
      '喜欢': 'like',
      '分享': 'share',
      '体验': 'experience',
      '感觉': 'feel',
      '效果': 'effect',
      '产品': 'product',
      '品牌': 'brand',
      '购买': 'buy',
      '价格': 'price',
      '优惠': 'discount',
      '活动': 'activity',
      '限时': 'limited time',
      '抢购': 'rush to buy',
      '赶紧': 'hurry up',
      '不要': "don't",
      '错过': 'miss',
      '机会': 'opportunity',
      '最后': 'last',
      '一次': 'once',
      '时间': 'time',
      '结束': 'end',
      '开始': 'start',
      '立刻': 'immediately',
      '今天': 'today',
      '明天': 'tomorrow',
      '昨天': 'yesterday',
      '这周': 'this week',
      '下周': 'next week',
      '本月': 'this month',
      '下月': 'next month',
      '今年': 'this year',
      '明年': 'next year'
    };
    
    let translatedContent = content;
    Object.entries(translations).forEach(([chinese, english]) => {
      translatedContent = translatedContent.replace(new RegExp(chinese, 'g'), english);
    });
    
    // 添加一些英文连接词和语法
    translatedContent = translatedContent
      .replace(/。/g, '. ')
      .replace(/，/g, ', ')
      .replace(/！/g, '! ')
      .replace(/？/g, '? ')
      .replace(/：/g, ': ')
      .replace(/；/g, '; ');
    
    return translatedContent;
  };

  // Regenerate content for a specific platform
  const handleRegeneratePlatformContent = async (platformId: string) => {
    if (generating) return;
    
    // Show loading state
    setResults(current => 
      current.map(result => 
        result.platformId === platformId 
          ? {
              ...result,
              steps: [
                { status: "loading", message: "重新分析内容..." },
                { status: "waiting", message: "提取核心信息..." },
                { status: "waiting", message: "进行平台适配..." },
                { status: "waiting", message: "优化输出结果..." }
              ]
            }
          : result
      )
    );
    
    try {
      // Prepare settings for the specific platform
      const platformSettingsForAPI: Record<string, unknown> = {};
      const settings = platformSettings[platformId];
      platformSettingsForAPI[`${platformId}-charCount`] = settings?.charCount || getCharCountMax(platformId) * 0.6;
      platformSettingsForAPI[`${platformId}-emoji`] = settings?.useEmoji || false;
      platformSettingsForAPI[`${platformId}-mdFormat`] = settings?.useMdFormat || false;
      platformSettingsForAPI[`${platformId}-autoFormat`] = settings?.useAutoFormat || false;
      platformSettingsForAPI[`${platformId}-brandLibrary`] = useBrandLibrary;
      
      // Call API to regenerate content for this specific platform
      const result = await regeneratePlatformContent(
        platformId,
        originalContent,
        platformSettingsForAPI
      );
      
      // Update steps progressively
      const updateStep = (stepIndex: number, status: "waiting" | "loading" | "completed" | "error") => {
        setResults(current => 
          current.map(result => 
            result.platformId === platformId 
              ? {
                  ...result,
                  steps: result.steps.map((step, idx) => 
                    idx === stepIndex ? { ...step, status } : step
                  )
                }
              : result
          )
        );
      };
      
      // Simulate progressive steps
      updateStep(0, "completed");
      await new Promise(r => setTimeout(r, 300));
      
      updateStep(1, "loading");
      await new Promise(r => setTimeout(r, 300));
      updateStep(1, "completed");
      
      updateStep(2, "loading");
      await new Promise(r => setTimeout(r, 300));
      updateStep(2, "completed");
      
      updateStep(3, "loading");
      await new Promise(r => setTimeout(r, 300));
      
      // Update content with regenerated result
      const adaptedContent = result[platformId];
      updateStep(3, "completed");
      
      // Update content in results
      setResults(current => 
        current.map(r => 
          r.platformId === platformId 
            ? { 
                ...r, 
                content: adaptedContent.content,
                source: adaptedContent.source,
                error: adaptedContent.error 
              }
            : r
        )
      );
      
      toast({
        title: "重新生成成功",
        description: `已为${platformId}重新生成内容`,
      });
    } catch (error) {
      console.error(`Error regenerating content for ${platformId}:`, error);
      
      // Handle errors
      setResults(current => 
        current.map(result => 
          result.platformId === platformId 
            ? {
                ...result,
                steps: result.steps.map(step => 
                  step.status === "loading" 
                    ? { ...step, status: "error" }
                    : step
                ),
                error: error instanceof Error ? error.message : "重新生成失败"
              }
            : result
        )
      );
      
      toast({
        title: "重新生成失败",
        description: error instanceof Error ? error.message : `适配${platformId}内容时出错`,
        variant: "destructive"
      });
    }
  };

  const [title, setTitle] = useState('');

  const handleAIGenerateTitle = async () => {
    // 模拟AI标题生成
    const mockTitles = ["AI生成的标题1", "AI生成的标题2", "AI生成的标题3"];
    setTitle(mockTitles[0]);
    // 新增：同步到分发区
    toast({
      title: "AI标题已生成",
      description: mockTitles[0],
    });
  };

  // 批量转发状态
  const [batchPublishOpen, setBatchPublishOpen] = useState(false);
  const [batchSelectedPlatforms, setBatchSelectedPlatforms] = useState<string[]>([]);
  const [batchQueue, setBatchQueue] = useState<{ platformId: string; content: string }[]>([]);
  const [batchCurrent, setBatchCurrent] = useState<{ platformId: string; content: string } | null>(null);

  /**
   * 打开批量一键转发弹窗
   */
  const handleBatchPublish = () => {
    // 只展示有内容的平台
    const available = results.filter(r => r.content).map(r => r.platformId);
    setBatchSelectedPlatforms(available);
    setBatchPublishOpen(true);
  };

  /**
   * 确认批量转发平台
   */
  const confirmBatchPlatforms = () => {
    // 构建转发队列
    const queue = batchSelectedPlatforms.map(pid => {
      const result = results.find(r => r.platformId === pid);
      return result && result.content ? { platformId: pid, content: result.content } : null;
    }).filter(Boolean) as { platformId: string; content: string }[];
    
    if (publishMode === 'api') {
      handleBatchApiPublish(batchSelectedPlatforms);
      setBatchPublishOpen(false);
    } else {
      setBatchQueue(queue);
      setBatchPublishOpen(false);
      if (queue.length > 0) {
        setBatchCurrent(queue[0]);
      }
    }
  };

  /**
   * 处理批量转发中的单个平台
   */
  const handleBatchPublishConfirm = () => {
    if (!batchCurrent) return;
    const { platformId, content } = batchCurrent;
    navigator.clipboard.writeText(content);
    // 写入历史
    const shareHistory: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
    shareHistory.unshift({
      id: Date.now().toString(),
      platformId,
      platformName: platformId,
      content,
      time: new Date().toISOString()
    });
    localStorage.setItem('shareHistory', JSON.stringify(shareHistory));
    // 跳转
    const url = platformUrls[platformId];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    // 进入下一个
    const idx = batchQueue.findIndex(q => q.platformId === platformId);
    if (idx >= 0 && idx < batchQueue.length - 1) {
      setBatchCurrent(batchQueue[idx + 1]);
    } else {
      setBatchCurrent(null);
      setBatchQueue([]);
      toast({ title: '批量转发完成', description: '已完成所有平台的转发' });
    }
  };

  /**
   * 跳过当前批量转发
   */
  const handleBatchPublishSkip = () => {
    if (!batchCurrent) return;
    const idx = batchQueue.findIndex(q => q.platformId === batchCurrent.platformId);
    if (idx >= 0 && idx < batchQueue.length - 1) {
      setBatchCurrent(batchQueue[idx + 1]);
    } else {
      setBatchCurrent(null);
      setBatchQueue([]);
      toast({ title: '批量转发完成', description: '已完成所有平台的转发' });
    }
  };

  // 历史Tab状态
  const [showHistory, setShowHistory] = useState(false);
  const [shareHistory, setShareHistory] = useState<ShareHistoryItem[]>([]);

  /**
   * 加载转发历史
   */
  const loadShareHistory = useCallback(() => {
    const history: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
    setShareHistory(history);
  }, []);

  /**
   * 清空转发历史
   */
  const clearShareHistory = () => {
    localStorage.removeItem('shareHistory');
    setShareHistory([]);
    toast({ title: '已清空', description: '转发历史已清空' });
  };

  useEffect(() => {
    if (showHistory) loadShareHistory();
  }, [showHistory, loadShareHistory]);

  // API直发状态
  const [apiManagerOpen, setApiManagerOpen] = useState(false);
  const [publishMode, setPublishMode] = useState<'jump' | 'api'>('jump');
  const [publishingPlatforms, setPublishingPlatforms] = useState<Set<string>>(new Set());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="AI内容适配器"
        description="智能分析内容，一键适配多平台格式"
        actions={
          <>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/history"}
            >
              <FileText className="h-4 w-4 mr-1" />
              历史记录
            </Button>
          </>
        }
      />

      <div className="container mx-auto py-6 px-4">

      {/* Usage Counter */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium mb-2">内容创作</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">剩余次数:</span>
                <Badge variant={usageRemaining <= 5 ? "destructive" : "default"}>
                  {usageRemaining}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>每次多平台内容生成消耗1次使用额度</p>
              <p>每月自动获得20次免费使用机会</p>
              <p>通过邀请好友可获得额外使用次数</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Content Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">输入原始内容</CardTitle>
          <CardDescription>
            请输入您想要进行多平台适配的原始内容
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="在此输入您的原始内容，我们将为您适配到不同平台..." 
            className="min-h-[200px]"
            value={originalContent}
            onChange={(e) => setOriginalContent(e.target.value)}
          />
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Checkbox 
                id="use-brand-library" 
                checked={useBrandLibrary}
                onCheckedChange={(checked) => {
                  if (checked && !checkPremiumFeature('品牌库功能', '使用品牌库资料进行创作，AI会自动遵循您的品牌语言规范')) {
                    return;
                  }
                  setUseBrandLibrary(!!checked);
                }}
              />
              <div>
                <Label htmlFor="use-brand-library" className="text-sm cursor-pointer">
                  使用品牌库资料进行创作
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  上传您的品牌资料库，AI在创作时会自动遵循您的语言规范，融入品牌价值，规避公关风险。分发再多平台，品牌形象始终如一。
                  <span className="text-xs text-amber-500 ml-1">（需开通高级功能）</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvancedSettings(prev => !prev)}
                className="text-xs rounded-lg shadow-sm border border-blue-200"
              >
                适配设置
                {showAdvancedSettings ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
              </Button>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {contentCharCount} 字符
              </Badge>
            </div>
          </div>
          
          {/* 适配设置 - 重新调整布局 */}
          {showAdvancedSettings && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  内容适配设置
                </h4>
                <p className="text-xs text-blue-700 mt-1">自定义内容生成参数，让AI更好地理解您的需求</p>
              </div>
              
              <div className="space-y-4">
                {/* 字符数限制 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    字符数限制
                  </Label>
                  <Select 
                    value={globalSettings.charCountPreset}
                    onValueChange={(value) => updateGlobalSetting('charCountPreset', value as 'auto' | 'mini' | 'standard' | 'detailed')}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择字符数限制" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">自动适配</SelectItem>
                      <SelectItem value="mini">精简版 (50-200字)</SelectItem>
                      <SelectItem value="standard">标准版 (200-800字)</SelectItem>
                      <SelectItem value="detailed">详细版 (800字+)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">根据平台特点自动调整内容长度</p>
                </div>
                
                {/* 内容格式 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    内容格式
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="global-emoji" 
                        checked={globalSettings.globalEmoji}
                        onCheckedChange={(checked) => updateGlobalSetting('globalEmoji', !!checked)}
                      />
                      <Label htmlFor="global-emoji" className="text-sm cursor-pointer flex items-center gap-2">
                        <Smile className="h-3 w-3" />
                        启用表情符号
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="global-md"
                        checked={globalSettings.globalMd}
                        onCheckedChange={(checked) => updateGlobalSetting('globalMd', !!checked)}
                      />
                      <Label htmlFor="global-md" className="text-sm cursor-pointer flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        启用Markdown格式
                      </Label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">增强内容的可读性和视觉效果</p>
                </div>
                
                {/* 智能优化 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    智能优化
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-100 px-3 py-2 rounded">
                      <Check className="h-3 w-3" />
                      <span>自动排版优化</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-100 px-3 py-2 rounded">
                      <Check className="h-3 w-3" />
                      <span>平台特色适配</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-100 px-3 py-2 rounded">
                      <Check className="h-3 w-3" />
                      <span>关键词优化</span>
                    </div>
                  </div>
                </div>
                
                {/* 保存按钮 */}
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={saveSettings}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    保存设置
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Model Selection */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">AI 模型选择</CardTitle>
              <CardDescription>
                选择您喜欢的AI模型生成内容，默认优先推荐GPT-4o
              </CardDescription>
            </div>
            {userPlan === 'trial' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/payment')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                去解锁
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allModels.map((model) => {
                const isAvailable = availableModels.some(m => m.id === model.id);
                let disabled = !isAvailable;
                let badge = '';
                let showUpgradeTip = false;
                
                if (model.id === 'gpt-4o' && userPlan === 'trial') {
                  badge = '专业版/高级版专属';
                  showUpgradeTip = true;
                }
                
                return (
                  <div
                    key={model.id}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedModel === model.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : disabled
                        ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleModelSelect(model.id, disabled)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedModel === model.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedModel === model.id && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-blue-600 text-base">{model.name}</span>
                          {badge && (
                            <Badge className="bg-gray-200 text-gray-600 text-xs">{badge}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{model.description}</p>
                        {showUpgradeTip && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-xs text-yellow-700 flex items-center">
                              <span className="mr-1">🔒</span>
                              去解锁高级功能
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedModel && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p className="font-medium">{getModelInfo(selectedModel)?.name}</p>
                <p>{getModelInfo(selectedModel)?.description}</p>
              </div>
            )}
            {/* 开发环境订阅等级切换 */}
            {import.meta.env.DEV && (
              <div className="mt-4 flex gap-2 items-center">
                <span className="text-xs text-gray-500">开发环境订阅等级：</span>
                <Button size="sm" variant={userPlan==='trial'?'default':'outline'} onClick={()=>setUserPlan('trial')}>免费版</Button>
                <Button size="sm" variant={userPlan==='pro'?'default':'outline'} onClick={()=>setUserPlan('pro')}>专业版</Button>
                <Button size="sm" variant={userPlan==='premium'?'default':'outline'} onClick={()=>setUserPlan('premium')}>高级版</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">选择目标平台</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
          {platforms.map(platform => (
            <CheckboxCard
              key={platform.id}
              icon={platform.icon}
              title={platform.name}
              description={platform.description}
              checked={selectedPlatforms.includes(platform.id)}
              onChange={(checked) => togglePlatform(platform.id, checked)}
            />
          ))}
        </div>
        
        {/* Individual Platform Settings */}
        {selectedPlatforms.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <CardTitle className="text-base">平台设置</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {selectedPlatforms.length}个平台
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={saveSettings}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    保存设置
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  >
                    {showAdvancedSettings ? '收起' : '展开'}
                    {showAdvancedSettings ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {showAdvancedSettings && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* 全局设置 */}
                  <div className="border-b pb-4">
                    <h4 className="text-sm font-medium mb-3 text-gray-700">全局设置</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="global-emoji"
                          checked={globalSettings.globalEmoji}
                          onCheckedChange={(checked) => updateGlobalSetting('globalEmoji', !!checked)}
                        />
                        <Label htmlFor="global-emoji" className="text-sm cursor-pointer flex items-center">
                          <Smile className="h-3 w-3 mr-1" />
                          全局添加emoji表情
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="global-md"
                          checked={globalSettings.globalMd}
                          onCheckedChange={(checked) => updateGlobalSetting('globalMd', !!checked)}
                        />
                        <Label htmlFor="global-md" className="text-sm cursor-pointer flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          全局MD格式
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="global-auto"
                          checked={true}
                          disabled
                        />
                        <Label htmlFor="global-auto" className="text-sm cursor-pointer flex items-center text-gray-500">
                          <Hash className="h-3 w-3 mr-1" />
                          全局自动排版
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* 平台特定设置 */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-700">平台特定设置</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {selectedPlatforms.map(platformId => {
                        const platform = platforms.find(p => p.id === platformId);
                        const settings = platformSettings[platformId] || {};
                        const isSpecialPlatform = ['zhihu', 'wechat', 'weibo', 'xiaohongshu'].includes(platformId);
                        
                        if (!platform) return null;
                        
                        return (
                          <div key={platformId} className="border rounded-lg p-3 bg-gray-50/50">
                            <div className="flex items-center gap-2 mb-3">
                              {platform.icon}
                              <span className="text-sm font-medium">{platform.name}</span>
                              {isSpecialPlatform && (
                                <Badge variant="outline" className="text-xs">优化</Badge>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              {/* 字符数设置 */}
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <Label className="text-xs">字符数: {settings.charCount || getCharCountMax(platformId)}</Label>
                                  <span className="text-xs text-muted-foreground">
                                    {getCharCountMin(platformId)}-{getCharCountMax(platformId)}
                                  </span>
                                </div>
                                <Slider 
                                  value={[settings.charCount || getCharCountMax(platformId)]}
                                  min={getCharCountMin(platformId)}
                                  max={getCharCountMax(platformId)}
                                  step={10}
                                  onValueChange={(value) => updatePlatformSetting(platformId, 'charCount', value[0])}
                                  className="w-full"
                                />
                              </div>
                              
                              {/* 选项设置 */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`${platformId}-emoji`}
                                    checked={settings.useEmoji}
                                    onCheckedChange={(checked) => updatePlatformSetting(platformId, 'useEmoji', !!checked)}
                                  />
                                  <Label htmlFor={`${platformId}-emoji`} className="text-xs cursor-pointer flex items-center">
                                    <Smile className="h-3 w-3 mr-1" />
                                    emoji
                                  </Label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`${platformId}-md`}
                                    checked={settings.useMdFormat}
                                    onCheckedChange={(checked) => updatePlatformSetting(platformId, 'useMdFormat', !!checked)}
                                  />
                                  <Label htmlFor={`${platformId}-md`} className="text-xs cursor-pointer flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    MD格式
                                  </Label>
                                </div>
                              </div>
                              
                              {/* 特殊平台提示 */}
                              {isSpecialPlatform && (
                                <div className="bg-blue-50 p-2 rounded text-xs text-blue-600">
                                  {platformId === 'zhihu' && '知乎: MD格式优化专业排版，自动排版添加分割线'}
                                  {platformId === 'wechat' && '公众号: MD格式适合深度阅读，专业排版'}
                                  {platformId === 'weibo' && '微博: emoji提升互动性，字数限制2000字'}
                                  {platformId === 'xiaohongshu' && '小红书: emoji增加亲和力，自动排版优化视觉效果'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-12">
        <Button 
          size="lg"
          disabled={!canGenerate || generating}
          onClick={generateContent}
          className="w-full max-w-md"
        >
          {generating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              正在生成中...
            </>
          ) : (
            <>
              开始生成
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">平台适配结果</h2>
            <Button
              size="lg"
              variant="default"
              onClick={handleBatchPublish}
              disabled={results.filter(r => r.content).length === 0}
            >
              {publishMode === 'api' ? (
                <Zap className="h-5 w-5 mr-2" />
              ) : (
                <ExternalLink className="h-5 w-5 mr-2" />
              )}
              {publishMode === 'api' ? '批量API直发' : '批量一键转发'}
            </Button>
          </div>
          
          <Tabs defaultValue={results[0]?.platformId} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 h-12 overflow-x-auto">
              {results.map(result => (
                <TabsTrigger key={result.platformId} value={result.platformId} className="text-xs sm:text-sm font-medium min-w-0">
                  <div className="flex items-center">
                    {getPlatformIcon(result.platformId)}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {results.map(result => (
              <TabsContent key={result.platformId} value={result.platformId}>
                <Card className="p-8 shadow-lg border-2">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl flex items-center">
                        {getPlatformIcon(result.platformId)}
                        <span className="ml-3">{platformStyles[result.platformId as keyof typeof platformStyles]?.name || result.platformId}</span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Progress Steps */}
                    <div className="space-y-3">
                      {result.steps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            step.status === "completed" ? "bg-green-500 text-white" :
                            step.status === "loading" ? "bg-blue-500 text-white animate-spin" :
                            step.status === "error" ? "bg-red-500 text-white" :
                            "bg-gray-200 text-gray-600"
                          }`}>
                            {step.status === "completed" ? "✓" :
                             step.status === "loading" ? "⟳" :
                             step.status === "error" ? "✗" :
                             index + 1}
                          </div>
                          <span className={`text-sm ${
                            step.status === "completed" ? "text-green-600" :
                            step.status === "loading" ? "text-blue-600" :
                            step.status === "error" ? "text-red-600" :
                            "text-gray-500"
                          }`}>
                            {step.message}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Error Display */}
                    {result.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✗</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              生成失败
                            </h3>
                            <div className="mt-1 text-sm text-red-700">
                              {result.error}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Success Indicator */}
                    {result.content && !result.error && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                              AI生成内容
                            </h3>
                            <div className="mt-1 text-sm text-green-700">
                              内容已成功生成，您可以编辑、复制或收藏
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Generated Content */}
                    <div className="space-y-6">
                      {/* 内容展示区域标题 */}
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">生成结果</h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
                      </div>
                      
                      {/* 主要内容区域 */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                        {/* 原始/编辑内容 - 左侧 */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-center xl:justify-start gap-2 mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <h4 className="text-lg font-semibold text-gray-900">生成内容</h4>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          {result.content ? (
                            editingPlatform === result.platformId ? (
                              <div className="space-y-3">
                                <Textarea
                                  value={result.content}
                                  onChange={(e) => {
                                    setResults(current => 
                                      current.map(r => 
                                        r.platformId === result.platformId 
                                          ? { ...r, content: e.target.value }
                                          : r
                                      )
                                    );
                                  }}
                                  className="min-h-[300px] text-base resize-none"
                                />
                                <div className="flex gap-3 justify-center lg:justify-start">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(result.platformId, result.content)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    保存
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingPlatform(null)}
                                  >
                                    取消
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className={`whitespace-pre-wrap rounded-lg border-2 p-6 overflow-auto max-h-[600px] text-base leading-relaxed shadow-sm ${
                                  result.platformId === 'xiaohongshu' ? 'bg-rose-50 border-rose-200' :
                                  result.platformId === 'douyin' ? 'bg-black text-white border-gray-800' :
                                  result.platformId === 'weibo' ? 'bg-orange-50 border-orange-200' :
                                  result.platformId === 'zhihu' ? 'bg-blue-50 border-blue-200' :
                                  result.platformId === 'wechat' ? 'bg-green-50 border-green-200' :
                                  result.platformId === 'bilibili' ? 'bg-pink-50 border-pink-200' :
                                  result.platformId === 'video' ? 'bg-emerald-50 border-emerald-200' :
                                  result.platformId === 'twitter' ? 'bg-sky-50 border-sky-200' :
                                  'bg-gray-50 border-gray-200'
                                }`}>
                                  {result.content}
                                </div>
                                {/* 平台标识 */}
                                <div className="absolute top-4 right-4">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                                    {platformStyles[result.platformId as keyof typeof platformStyles]?.name || result.platformId}
                                  </div>
                                </div>
                              </div>
                            )
                          ) : result.error ? (
                            <div className="rounded-lg border-2 border-dashed border-red-200 p-12 flex items-center justify-center bg-red-50">
                              <div className="text-center">
                                <p className="text-red-600 text-lg font-medium">生成失败</p>
                                <p className="text-red-500 text-sm mt-2">{result.error}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 flex items-center justify-center bg-gray-50">
                              <p className="text-muted-foreground text-lg">生成的内容将显示在这里...</p>
                            </div>
                          )}
                        </div>

                        {/* 视觉连接线 */}
                        {translatedContent[result.platformId] && (
                          <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-white"></div>
                            </div>
                          </div>
                        )}

                        {/* 翻译内容 - 右侧 */}
                        {translatedContent[result.platformId] && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <h4 className="text-lg font-semibold text-gray-900">翻译内容</h4>
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                            <div className="relative">
                              <div className="whitespace-pre-wrap rounded-lg border-2 border-blue-200 p-6 bg-blue-50 overflow-auto max-h-[600px] text-base leading-relaxed shadow-sm">
                                {translatedContent[result.platformId]}
                              </div>
                              {/* 翻译标识 */}
                              <div className="absolute top-4 right-4">
                                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-blue-700 shadow-sm">
                                  翻译版本
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {result.content && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleRegeneratePlatformContent(result.platformId)}
                          disabled={generating}
                        >
                          <RefreshCw className="h-5 w-5 mr-2" />
                          重新生成
                        </Button>
                        
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleEdit(result.platformId)}
                        >
                          <Edit className="h-5 w-5 mr-2" />
                          {editingPlatform === result.platformId ? '取消编辑' : '编辑'}
                        </Button>
                        
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleFavorite(result.platformId)}
                        >
                          <Heart className="h-5 w-5 mr-2" />
                          收藏
                        </Button>
                        
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => copyToClipboard(result.content)}
                        >
                          <Copy className="h-5 w-5 mr-2" />
                          一键复制
                        </Button>
                        
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleTranslate(result.platformId, result.content)}
                          disabled={translatingPlatforms.has(result.platformId)}
                        >
                          <Languages className="h-5 w-5 mr-2" />
                          一键翻译
                        </Button>
                        
                        <Button
                          size="lg"
                          variant="default"
                          onClick={() => handlePublish(result.platformId)}
                          disabled={publishingPlatforms.has(result.platformId)}
                        >
                          {publishingPlatforms.has(result.platformId) ? (
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          ) : publishMode === 'api' ? (
                            <Zap className="h-5 w-5 mr-2" />
                          ) : (
                            <ExternalLink className="h-5 w-5 mr-2" />
                          )}
                          {publishingPlatforms.has(result.platformId) 
                            ? '发布中...' 
                            : publishMode === 'api' 
                              ? 'API直发' 
                              : '立刻发布'
                          }
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
    <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>一键转发确认</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-gray-700">
          <p>
            {publishMode === 'api' 
              ? '是否通过API直接发布内容？' 
              : '内容已复制到剪贴板，是否跳转到平台发布页？'
            }
          </p>
          <div className="bg-gray-100 rounded p-2 mt-2 text-xs break-all max-h-32 overflow-auto">
            {pendingPublish?.content}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>取消</Button>
          <Button variant="default" onClick={confirmPublish}>
            {publishMode === 'api' ? '确认发布' : '跳转并发布'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={batchPublishOpen} onOpenChange={setBatchPublishOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量一键转发</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-gray-700">
          <p>请选择要批量转发的平台：</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {results.filter(r => r.content).map(r => (
              <Button
                key={r.platformId}
                variant={batchSelectedPlatforms.includes(r.platformId) ? 'default' : 'outline'}
                onClick={() => setBatchSelectedPlatforms(prev => prev.includes(r.platformId) ? prev.filter(p => p !== r.platformId) : [...prev, r.platformId])}
              >
                {r.platformId}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setBatchPublishOpen(false)}>取消</Button>
          <Button variant="default" onClick={confirmBatchPlatforms} disabled={batchSelectedPlatforms.length === 0}>开始批量转发</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={!!batchCurrent} onOpenChange={open => { if (!open) setBatchCurrent(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量一键转发</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-gray-700">
          <p>内容已复制到剪贴板，是否跳转到 {batchCurrent?.platformId} 发布页？</p>
          <div className="bg-gray-100 rounded p-2 mt-2 text-xs break-all max-h-32 overflow-auto">
            {batchCurrent?.content}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleBatchPublishSkip}>跳过</Button>
          <Button variant="default" onClick={handleBatchPublishConfirm}>跳转并发布</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={showHistory} onOpenChange={setShowHistory}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>转发历史</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-gray-700 max-h-[60vh] overflow-auto">
          {shareHistory.length === 0 ? (
            <div className="text-center text-gray-400 py-8">暂无转发历史</div>
          ) : (
            <div className="space-y-4">
              {shareHistory.map(item => (
                <div key={item.id} className="border rounded p-2 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-600">{item.platformName}</span>
                    <span className="text-xs text-gray-400">{new Date(item.time).toLocaleString()}</span>
                  </div>
                  <div className="text-xs break-all mb-1">{item.content}</div>
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(item.content)}>复制内容</Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={clearShareHistory} disabled={shareHistory.length === 0}>清空历史</Button>
          <Button variant="default" onClick={() => setShowHistory(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <PlatformApiManager 
      open={apiManagerOpen} 
      onOpenChange={setApiManagerOpen} 
    />

    {/* 使用次数提醒弹窗 */}
    <UsageReminderDialog
      isOpen={showUsageReminder}
      onClose={() => setShowUsageReminder(false)}
      onUpgrade={() => {
        setShowUsageReminder(false);
        navigate('/payment');
      }}
      remainingCount={usageReminderCount}
      userType={userPlan === 'trial' ? 'trial' : 'pro'}
    />

    {/* 高级功能权限弹窗 */}
    <PremiumFeatureDialog
      isOpen={showPremiumFeature}
      onClose={() => setShowPremiumFeature(false)}
      onUpgrade={() => {
        setShowPremiumFeature(false);
        navigate('/payment');
      }}
      featureName={premiumFeatureInfo.name}
      featureDescription={premiumFeatureInfo.description}
    />
    </div>
  );
}