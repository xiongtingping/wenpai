import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Book, Video, MessageSquare, Send,
  RefreshCw, ArrowRight, ChevronDown, ChevronUp,
  Smile, FileText, Hash, Save, Twitter, SquarePlay,
  Edit, Heart, Copy, ExternalLink, Languages
} from "lucide-react";
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
import { 
  generateAdaptedContent, 
  regeneratePlatformContent, 
  platformStyles,
  setApiProvider,
  getApiProvider,
  setModel,
  getModel,
  getAvailableModels,
  modelDescriptions
} from "@/api/contentAdapter";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

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

// Platform URL mapping for external links
const platformUrls: Record<string, string> = {
  'xiaohongshu': 'https://www.xiaohongshu.com',
  'wechat': 'https://mp.weixin.qq.com',
  'zhihu': 'https://www.zhihu.com',
  'weibo': 'https://weibo.com',
  'douyin': 'https://www.douyin.com',
  'bilibili': 'https://www.bilibili.com',
  'video': 'https://channels.weixin.qq.com',
  'twitter': 'https://twitter.com'
};

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

// Checkbox Card Component
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
        "relative border cursor-pointer transition-all duration-200", 
        checked 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "bg-background"
      )}
      onClick={() => onChange(!checked)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {icon}
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <Checkbox 
            checked={checked}
            onCheckedChange={onChange}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export default function AdaptPage() {
  const { toast } = useToast();
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
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  
  // User store for usage tracking
  const { 
    usageRemaining, 
    decrementUsage 
  } = useUserStore();

  const platforms = useMemo(() => [
    { id: "xiaohongshu", name: "小红书", description: "适合生活方式、美妆、旅行等分享，强调个人体验和情感共鸣", icon: <Book className="h-4 w-4 text-rose-500" /> },
    { id: "zhihu", name: "知乎", description: "适合专业知识分享和理性讨论，强调逻辑和论证", icon: <MessageSquare className="h-4 w-4 text-blue-500" /> },
    { id: "douyin", name: "抖音脚本", description: "适合短视频脚本，活泼有趣，强调视听效果", icon: <Video className="h-4 w-4 text-black" /> },
    { id: "weibo", name: "新浪微博", description: "简短有力的观点表达，适合热点话题讨论", icon: <Send className="h-4 w-4 text-orange-500" /> },
    { id: "wechat", name: "公众号", description: "深度内容，适合教程、观点和专业分析", icon: <MessageSquare className="h-4 w-4 text-green-500" /> },
    { id: "bilibili", name: "B站", description: "适合视频脚本，兼具专业性和趣味性", icon: <Video className="h-4 w-4 text-blue-400" /> },
    { id: "twitter", name: "X（推特）", description: "简短、直接的表达，支持多种语言和国际化视角", icon: <Twitter className="h-4 w-4 text-black" /> },
    { id: "video", name: "视频号", description: "视频内容与互动引导并重，亲和力强", icon: <SquarePlay className="h-4 w-4 text-green-600" /> }
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

  // Share content


  // Publish to platform
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

    // 先复制内容到剪贴板
    navigator.clipboard.writeText(result.content);
    
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">内容适配器</h1>
        <p className="text-muted-foreground">
          一次创作，多平台适配，让您的内容在每个平台都能发挥最大效果
        </p>
      </div>

      {/* Usage Counter and History */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium mb-2">内容创作</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = "/history";
            }}
          >
            <FileText className="h-4 w-4 mr-1" />
            历史记录
          </Button>
        </div>
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
            <div className="flex items-center gap-2">
              <Checkbox 
                id="use-brand-library" 
                checked={useBrandLibrary}
                onCheckedChange={(checked) => setUseBrandLibrary(!!checked)}
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
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvancedSettings(prev => !prev)}
                className="text-xs"
              >
                适配设置
                {showAdvancedSettings ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
              </Button>
              <Badge variant="outline">
                {contentCharCount} 字符
              </Badge>
            </div>
          </div>
          
          {/* Advanced Options */}
          {showAdvancedSettings && (
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs mb-2 block">全局字符数限制</Label>
                  <Select 
                    value={globalSettings.charCountPreset}
                    onValueChange={(value) => updateGlobalSetting('charCountPreset', value as 'auto' | 'mini' | 'standard' | 'detailed')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择字符数限制" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">根据平台自动设置</SelectItem>
                      <SelectItem value="mini">精简版 (50-200字)</SelectItem>
                      <SelectItem value="standard">标准版 (200-800字)</SelectItem>
                      <SelectItem value="detailed">详细版 (800以上)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="global-emoji" 
                    checked={globalSettings.globalEmoji}
                    onCheckedChange={(checked) => updateGlobalSetting('globalEmoji', !!checked)}
                  />
                  <Label htmlFor="global-emoji" className="text-xs cursor-pointer">
                    全局启用表情符号
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="global-md"
                    checked={globalSettings.globalMd}
                    onCheckedChange={(checked) => updateGlobalSetting('globalMd', !!checked)}
                  />
                  <Label htmlFor="global-md" className="text-xs cursor-pointer">
                    全局启用Markdown格式
                  </Label>
                </div>
              </div>


              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={saveSettings}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  保存设置
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Model Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">AI 模型选择</CardTitle>
          <CardDescription>
            选择适合您需求的AI模型，不同模型适合不同的内容类型
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm mb-2 block">API 提供商</Label>
              <Select 
                value={apiProvider}
                onValueChange={(value: 'openai' | 'gemini' | 'deepseek') => {
                  setCurrentApiProvider(value);
                  setApiProvider(value as 'openai' | 'deepseek' | 'gemini');
                  // 重置模型为第一个可用模型
                  const available = getAvailableModels()[apiProvider] || [];
                  if (available.length > 0) {
                    setSelectedModel(available[0]);
                    setModel(available[0]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择API提供商" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-600">OpenAI</span>
                      <span className="text-xs text-gray-500">GPT-3.5/4系列</span>
                    </div>
                  </SelectItem>

                  <SelectItem value="deepseek">
                    <div className="flex flex-col">
                      <span className="font-medium text-orange-600">DeepSeek</span>
                      <span className="text-xs text-gray-500">DeepSeek系列</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm mb-2 block">用户计划</Label>
              <Select 
                value={userPlan}
                onValueChange={(value: 'free' | 'pro') => setUserPlan(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择用户计划" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">免费版 (基础模型)</SelectItem>
                  <SelectItem value="pro">专业版 (所有模型)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm mb-2 block">AI 模型</Label>
              <Select 
                value={selectedModel}
                onValueChange={(value) => {
                  setSelectedModel(value);
                  setModel(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择AI模型" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableModels()[apiProvider]?.map((model) => {
                    const modelInfo = modelDescriptions[model];
                    return (
                      <SelectItem key={model} value={model}>
                        <div className="flex flex-col">
                          <span className="font-medium">{modelInfo?.name || model}</span>
                          <span className="text-xs text-gray-500">{modelInfo?.name || '模型描述'}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {userPlan === 'free' && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-amber-800 font-medium">免费版限制</p>
                      <p className="text-xs text-amber-700 mt-1">
                        免费版只能使用基础模型，升级专业版可解锁所有高级模型
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-2 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                      onClick={() => window.location.href = '/payment'}
                    >
                      立即开通
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {selectedModel && modelDescriptions[selectedModel] && (
            <div className="mt-4 bg-blue-50 p-4 rounded-md">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-blue-900">
                    {modelDescriptions[selectedModel]?.name || selectedModel}
                  </h5>
                  <p className="text-xs text-blue-700 mt-1">
                    模型描述
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    高性能
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    稳定可靠
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">选择目标平台</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <div className="mt-6 space-y-4">
            {selectedPlatforms.map(platformId => {
              const platform = platforms.find(p => p.id === platformId);
              const settings = platformSettings[platformId] || {};
              const isSettingsVisible = showSettings[platformId];
              const isSpecialPlatform = ['zhihu', 'wechat', 'weibo', 'xiaohongshu'].includes(platformId);
              
              if (!platform) return null;
              
              return (
                <Card key={platformId} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {platform.icon}
                        <CardTitle className="text-sm">{platform.name}设置</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleSettings(platformId)}
                      >
                        {isSettingsVisible ? '收起' : '展开'}
                        {isSettingsVisible ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {isSettingsVisible && (
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-xs">字符数限制: {settings.charCount}</Label>
                            <span className="text-xs text-muted-foreground">
                              推荐: {getCharCountMin(platformId)}-{getCharCountMax(platformId)}
                            </span>
                          </div>
                          <Slider 
                            value={[settings.charCount || getCharCountMax(platformId)]}
                            min={getCharCountMin(platformId)}
                            max={getCharCountMax(platformId)}
                            step={10}
                            onValueChange={(value) => updatePlatformSetting(platformId, 'charCount', value[0])}
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${platformId}-emoji`}
                              checked={settings.useEmoji}
                              onCheckedChange={(checked) => updatePlatformSetting(platformId, 'useEmoji', !!checked)}
                            />
                            <Label htmlFor={`${platformId}-emoji`} className="text-xs cursor-pointer flex items-center">
                              <Smile className="h-3 w-3 mr-1" />
                              加入emoji表情
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
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${platformId}-auto`}
                              checked={settings.useAutoFormat}
                              onCheckedChange={(checked) => updatePlatformSetting(platformId, 'useAutoFormat', !!checked)}
                            />
                            <Label htmlFor={`${platformId}-auto`} className="text-xs cursor-pointer flex items-center">
                              <Hash className="h-3 w-3 mr-1" />
                              自动排版
                            </Label>
                          </div>
                        </div>
                        
                        {isSpecialPlatform && (
                          <div className="bg-blue-50 p-3 rounded-md mt-2">
                            <p className="text-xs text-blue-600">
                              {platformId === 'zhihu' && '知乎平台特有优化: "MD格式"将优化知乎专业文章排版，"自动排版"将添加分割线和标题格式'}
                              {platformId === 'wechat' && '公众号平台特有优化: "MD格式"将为文章添加专业排版格式，适合深度阅读'}
                              {platformId === 'weibo' && '微博平台特有优化: "加入emoji表情"将添加活泼表情符号，提升互动性，字数限制2000字'}
                              {platformId === 'xiaohongshu' && '小红书平台特有优化: "加入emoji表情"增加亲和力，"自动排版"优化视觉效果'}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
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
          <h2 className="text-3xl font-bold mb-8 text-center">平台适配结果</h2>
          
          <Tabs defaultValue={results[0]?.platformId} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-4 lg:grid-cols-8 h-12">
              {results.map(result => (
                <TabsTrigger key={result.platformId} value={result.platformId} className="text-sm font-medium">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Original/Edited Content */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3">生成内容</h4>
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
                                className="min-h-[300px] text-base"
                              />
                              <div className="flex gap-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(result.platformId, result.content)}
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
                            <div className={`whitespace-pre-wrap rounded-lg border-2 p-6 overflow-auto max-h-[600px] text-base leading-relaxed ${
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
                          )
                        ) : result.error ? (
                          <div className="rounded-lg border-2 border-dashed border-red-200 p-12 flex items-center justify-center bg-red-50">
                            <div className="text-center">
                              <p className="text-red-600 text-lg font-medium">生成失败</p>
                              <p className="text-red-500 text-sm mt-2">{result.error}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border-2 border-dashed p-12 flex items-center justify-center">
                            <p className="text-muted-foreground text-lg">生成的内容将显示在这里...</p>
                          </div>
                        )}
                      </div>

                      {/* Translated Content */}
                      {translatedContent[result.platformId] && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3">翻译内容</h4>
                          <div className="whitespace-pre-wrap rounded-lg border-2 p-6 bg-blue-50 overflow-auto max-h-[600px] text-base leading-relaxed">
                            {translatedContent[result.platformId]}
                          </div>
                        </div>
                      )}
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
                        >
                          <ExternalLink className="h-5 w-5 mr-2" />
                          立刻发布
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
  );
}