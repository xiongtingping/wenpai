import React, { useState, useEffect } from "react";
import { 
  Book, Video, MessageSquare, Send, CheckIcon,
  AlertCircle, RefreshCw, ArrowRight, ChevronDown, ChevronUp,
  Smile, FileText, Hash, Save, Twitter, SquarePlay
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { generateAdaptedContent, regeneratePlatformContent, platformStyles, AIApiResponse } from "@/api/contentAdapter";
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
    case 'xiaohongshu': return 5000; // 小红书笔记有字数限制
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
  source?: "ai" | "simulation";
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
  id,
  icon,
  title,
  description,
  checked,
  onChange
}: {
  id: string;
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
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    charCountPreset: 'auto',
    globalEmoji: false,
    globalMd: false
  });
  
  // User store for usage tracking
  const { 
    usageRemaining, 
    decrementUsage 
  } = useUserStore();

  // Initialize platform settings
  useEffect(() => {
    // Try to load saved settings from localStorage
    const savedSettings = localStorage.getItem('platformSettings');
    const savedGlobalSettings = localStorage.getItem('globalSettings');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setPlatformSettings(parsedSettings);
      } catch (e) {
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
      } catch (e) {
        console.error("Failed to parse saved global settings");
      }
    }
    
    // Initialize showSettings
    const initialShowSettings: Record<string, boolean> = {};
    platforms.forEach(platform => {
      initialShowSettings[platform.id] = false;
    });
    setShowSettings(initialShowSettings);
  }, []);
  
  const initializeDefaultSettings = () => {
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
  };

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('platformSettings', JSON.stringify(platformSettings));
      localStorage.setItem('globalSettings', JSON.stringify(globalSettings));
      toast({
        title: "设置已保存",
        description: "您的平台设置已成功保存",
      });
    } catch (e) {
      toast({
        title: "保存设置失败",
        description: "无法保存您的设置，请稍后再试",
        variant: "destructive"
      });
    }
  };

  // Platform selection with custom settings
  const platforms = [
    {
      id: "xiaohongshu",
      title: "小红书",
      description: "适合生活方式、美妆、旅行等分享，强调个人体验和情感共鸣",
      icon: <Book className="h-4 w-4 text-rose-500" />
    },
    {
      id: "zhihu",
      title: "知乎",
      description: "适合专业知识分享和理性讨论，强调逻辑和论证",
      icon: <MessageSquare className="h-4 w-4 text-blue-500" />
    },
    {
      id: "douyin",
      title: "抖音脚本",
      description: "适合短视频脚本，活泼有趣，强调视听效果",
      icon: <Video className="h-4 w-4 text-black" />
    },
    {
      id: "weibo",
      title: "微博",
      description: "简短有力的观点表达，适合热点话题讨论",
      icon: <Send className="h-4 w-4 text-orange-500" />
    },
    {
      id: "wechat",
      title: "公众号",
      description: "深度内容，适合教程、观点和专业分析",
      icon: <MessageSquare className="h-4 w-4 text-green-500" />
    },
    {
      id: "bilibili",
      title: "B站",
      description: "适合视频脚本，兼具专业性和趣味性",
      icon: <Video className="h-4 w-4 text-blue-400" />
    },
    {
      id: "twitter",
      title: "X",
      description: "简短、直接的表达，支持多种语言和国际化视角",
      icon: <Twitter className="h-4 w-4 text-black" />
    },
    {
      id: "video",
      title: "视频号",
      description: "视频内容与互动引导并重，亲和力强",
      icon: <SquarePlay className="h-4 w-4 text-green-600" />
    }
  ];

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
  const updatePlatformSetting = (platformId: string, key: keyof PlatformSettings, value: any) => {
    setPlatformSettings(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [key]: value
      }
    }));
  };

  // Update global settings
  const updateGlobalSetting = (key: keyof GlobalSettings, value: any) => {
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

  // Generate content for selected platforms
  const generateContent = async () => {
    if (!canGenerate) return;
    
    // Check if user has enough usage credits
    if (usageRemaining <= 0) {
      toast({
        title: "使用次数已用完",
        description: "请通过邀请好友获取更多使用机会",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    
    // Apply global settings before generation
    applyGlobalSettings();
    
    // Initialize results with loading state
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
      const platformSettingsForAPI: Record<string, any> = {};
      selectedPlatforms.forEach(platformId => {
        const settings = platformSettings[platformId];
        platformSettingsForAPI[`${platformId}-charCount`] = settings?.charCount || getCharCountMax(platformId) * 0.6;
        platformSettingsForAPI[`${platformId}-emoji`] = settings?.useEmoji || false;
        platformSettingsForAPI[`${platformId}-mdFormat`] = settings?.useMdFormat || false;
        platformSettingsForAPI[`${platformId}-autoFormat`] = settings?.useAutoFormat || false;
        platformSettingsForAPI[`${platformId}-brandLibrary`] = useBrandLibrary;
      });
      
      // Call API to generate content for all selected platforms
      // This will call OpenAI for each platform
      const generatedContent = await generateAdaptedContent({
        originalContent,
        targetPlatforms: selectedPlatforms,
        platformSettings: platformSettingsForAPI
      });
      
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
        
        // Add the generated content to the results
        const adaptedContent = generatedContent[platformId];
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
      }
      
      // Decrement usage after successful generation
      decrementUsage();
      
      toast({
        title: "内容已生成",
        description: `已成功为${selectedPlatforms.length}个平台适配内容`,
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
          )
        }))
      );
      
      toast({
        title: "生成失败",
        description: "内容生成过程中发生错误，请稍后重试",
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
      const platformSettingsForAPI: Record<string, any> = {};
      const settings = platformSettings[platformId];
      platformSettingsForAPI[`${platformId}-charCount`] = settings?.charCount || getCharCountMax(platformId) * 0.6;
      platformSettingsForAPI[`${platformId}-emoji`] = settings?.useEmoji || false;
      platformSettingsForAPI[`${platformId}-mdFormat`] = settings?.useMdFormat || false;
      platformSettingsForAPI[`${platformId}-autoFormat`] = settings?.useAutoFormat || false;
      platformSettingsForAPI[`${platformId}-brandLibrary`] = useBrandLibrary;
      
      // Call OpenAI API to regenerate content for this specific platform
      const result = await regeneratePlatformContent({
        originalContent,
        targetPlatforms: [platformId],
        platformSettings: platformSettingsForAPI
      }, platformId);
      
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
        description: `已为${platformStyles[platformId as keyof typeof platformStyles]?.name || platformId}重新生成内容`,
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
                )
              }
            : result
        )
      );
      
      toast({
        title: "重新生成失败",
        description: `适配${platformStyles[platformId as keyof typeof platformStyles]?.name || platformId}内容时出错`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">内容适配器</h1>
        <p className="text-muted-foreground">
          一次创作，多平台适配，让您的内容在每个平台都能发挥最大效果
        </p>
      </div>

      {/* Usage Counter */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium mb-2">内容创作</h2>
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
                    onValueChange={(value) => updateGlobalSetting('charCountPreset', value as any)}
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

      {/* Platform Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">选择目标平台</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {platforms.map(platform => (
            <CheckboxCard
              key={platform.id}
              id={platform.id}
              icon={platform.icon}
              title={platform.title}
              description={platform.description}
              checked={selectedPlatforms.includes(platform.id)}
              onChange={(checked) => togglePlatform(platform.id, checked)}
            />
          ))}
        </div>
        
        {/* Individual Platform Settings */}
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
                      <CardTitle className="text-sm">{platform.title}设置</CardTitle>
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
          <h2 className="text-2xl font-bold mb-6">平台适配结果</h2>
          
          <Tabs defaultValue={results[0]?.platformId}>
            <TabsList className="mb-4">
              {results.map(result => (
                <TabsTrigger key={result.platformId} value={result.platformId}>
                  <div className="flex items-center">
                    {getPlatformIcon(result.platformId)}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {results.map(result => (
              <TabsContent key={result.platformId} value={result.platformId}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center">
                        {getPlatformIcon(result.platformId)}
                      </CardTitle>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={generating}
                          onClick={() => handleRegeneratePlatformContent(result.platformId)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          重新生成
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!result.content}
                          onClick={() => copyToClipboard(result.content)}
                        >
                          复制内容
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      适合字数: {getCharCountMin(result.platformId)}-{getCharCountMax(result.platformId)}字符
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Generation Steps */}
                    <div className="mb-4">
                      {result.steps.map((step, index) => (
                        <div key={index} className="flex items-center mb-2">
                          {step.status === "waiting" && (
                            <div className="h-5 w-5 rounded-full border mr-2 flex items-center justify-center">
                              <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
                            </div>
                          )}
                          {step.status === "loading" && (
                            <RefreshCw className="h-5 w-5 mr-2 text-primary animate-spin" />
                          )}
                          {step.status === "completed" && (
                            <div className="h-5 w-5 rounded-full bg-primary mr-2 flex items-center justify-center">
                              <CheckIcon className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {step.status === "error" && (
                            <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
                          )}
                          <span className={
                            step.status === "completed" ? "text-primary" : 
                            step.status === "error" ? "text-destructive" : 
                            step.status === "loading" ? "text-foreground" : 
                            "text-muted-foreground"
                          }>
                            {step.message}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Source indicator */}
                    {result.source && (
                      <div className={`mb-2 text-xs px-2 py-1 rounded-md inline-flex items-center ${
                        result.source === "ai" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        <span>
                          {result.source === "ai" ? "AI生成内容" : "模拟内容"}
                        </span>
                        {result.error && (
                          <span className="ml-2 text-destructive">
                            (错误: {result.error})
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Generated Content */}
                    {result.content ? (
                      <div className="whitespace-pre-wrap rounded-md border p-4 bg-muted/50 overflow-auto max-h-[500px]">
                        {result.content}
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed p-8 flex items-center justify-center">
                        <p className="text-muted-foreground">生成的内容将显示在这里...</p>
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