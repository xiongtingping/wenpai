import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Book, Video, MessageSquare, Send,
  RefreshCw, ArrowRight, ChevronDown, ChevronUp,
  Smile, FileText, Hash, Save, Twitter, SquarePlay,
  Edit, Heart, Copy, ExternalLink, Languages, Globe, Zap, Rss, Settings, Check, Cpu, Sparkles, Bot
} from "lucide-react";
import {
  getCharCountMax as getConfigCharCountMax,
  getCharCountMin as getConfigCharCountMin,
  validateCharCount,
  getCharCountByPreset,
  getPlatformCharCountAdvice,
  calculateTargetCharCount
} from '../config/platformLimits';
import { AutomationUI, AutomationProgress, AutomationResult, AutomationOptions } from '../components/AutomationUI';
import { hashtagGenerator, HashtagSuggestion } from '../utils/hashtagGenerator';
import { LoadingAnimation, InlineLoadingAnimation } from '../components/LoadingAnimation';
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
import { useNavigate, useLocation } from "react-router-dom";
import { 
  generateAdaptedContent, 
  regenerateAdaptedContent,
  getAvailablePlatforms,
  getAvailableStyles,
  type ContentAdaptationRequest
} from "@/api/contentAdapter";
import ContentFormSelector from '@/components/creative/ContentFormSelector';
import QuickReferenceSelector from '@/components/creative/QuickReferenceSelector';
import { 
  getAvailableModelsForTier, 
  getModelInfo, 
  isModelAvailableForTier,
  getAllModels,
  getModelProvider,
  type AIModel 
} from "@/config/aiModels";
import { useAuthStore } from "@/store/authStore";
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
import { type StyleType } from '@/config/contentSchemes';
import { getContentFormById } from '@/config/contentForms';
import { request, callAI } from '@/api';
import { MentionTextarea } from '@/components/ui/mention-textarea';

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

/**
 * 平台字符数限制配置（基于官方规定的真实数据）
 * 包含推荐值、最大值和安全区域计算
 */
interface PlatformCharacterLimits {
  recommended: number;  // 推荐字符数
  maximum: number;      // 平台最大限制
  safetyMin: number;    // 安全区域最小值（90%）
  safetyMax: number;    // 安全区域最大值（95%）
  description: string;  // 限制说明
}

const platformCharacterLimits: Record<string, PlatformCharacterLimits> = {
  weibo: {
    recommended: 140,
    maximum: 140,
    safetyMin: 126,  // 90%
    safetyMax: 133,  // 95%
    description: '微博单条内容限制140字符'
  },
  xiaohongshu: {
    recommended: 800,
    maximum: 1000,
    safetyMin: 720,  // 90%
    safetyMax: 760,  // 95%
    description: '小红书笔记正文限制1000字符'
  },
  zhihu: {
    recommended: 1500,
    maximum: 2000,
    safetyMin: 1350, // 90%
    safetyMax: 1425, // 95%
    description: '知乎回答建议1500-2000字符'
  },
  bilibili: {
    recommended: 800,
    maximum: 1000,
    safetyMin: 720,  // 90%
    safetyMax: 760,  // 95%
    description: 'B站动态限制1000字符'
  },
  douyin: {
    recommended: 100,
    maximum: 120,
    safetyMin: 90,   // 90%
    safetyMax: 95,   // 95%
    description: '抖音视频文案限制120字符'
  },
  kuaishou: {
    recommended: 100,
    maximum: 120,
    safetyMin: 90,   // 90%
    safetyMax: 95,   // 95%
    description: '快手视频文案限制120字符'
  },
  wechat: {
    recommended: 1500,
    maximum: 2000,
    safetyMin: 1350, // 90%
    safetyMax: 1425, // 95%
    description: '微信公众号文章建议1500-2000字符'
  },
  baijiahao: {
    recommended: 1200,
    maximum: 1500,
    safetyMin: 1080, // 90%
    safetyMax: 1140, // 95%
    description: '百家号文章建议1200-1500字符'
  },
  toutiao: {
    recommended: 1000,
    maximum: 1200,
    safetyMin: 900,  // 90%
    safetyMax: 950,  // 95%
    description: '头条号文章建议1000-1200字符'
  },
  twitter: {
    recommended: 250,
    maximum: 280,
    safetyMin: 225,  // 90%
    safetyMax: 238,  // 95%
    description: 'Twitter推文限制280字符'
  }
};

// Helper function to get platform name consistently
function getPlatformName(platformId: string, platforms: any[]): string {
  const platform = platforms.find(p => p.id === platformId);
  return platform?.name || platformId;
}

// Helper function to get platform character limits
function getPlatformCharacterLimits(platformId: string): PlatformCharacterLimits {
  return platformCharacterLimits[platformId] || {
    recommended: 500,
    maximum: 1000,
    safetyMin: 450,
    safetyMax: 475,
    description: '默认字符数限制'
  };
}

// Helper function to calculate safety range for content generation
function calculateSafetyRange(userSetLimit: number, platformId: string): { min: number; max: number } {
  const limits = getPlatformCharacterLimits(platformId);

  // 确保用户设置不超过平台最大限制
  const effectiveLimit = Math.min(userSetLimit, limits.maximum);

  // 计算安全区域（90-95%）
  const safetyMin = Math.floor(effectiveLimit * 0.9);
  const safetyMax = Math.floor(effectiveLimit * 0.95);

  return { min: safetyMin, max: safetyMax };
}

// 新的字符数控制逻辑：生成目标范围内的内容，禁止截断
function calculateOptimalCharCount(platformId: string, userSetLimit: number): { min: number; max: number } {
  const limits = getPlatformCharCountAdvice(platformId);

  // 目标范围：平台建议最低字符数 到 平台最高字符数的90%-95%
  const platformMax = Math.min(limits.maximum, userSetLimit);
  const targetMin = limits.minimum;
  const targetMax = Math.floor(platformMax * 0.95); // 95%的平台最高限制

  return {
    min: Math.max(targetMin, 100), // 最少100字符
    max: Math.max(targetMax, targetMin + 50) // 确保max > min
  };
}

// 清理AI生成内容中的多余文案
function cleanGeneratedContent(content: string): string {
  let cleanedContent = content;

  // 移除配图建议文案
  cleanedContent = cleanedContent.replace(/（配图建议：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(配图建议：[^)]*\)/g, '');
  cleanedContent = cleanedContent.replace(/【配图建议：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[配图建议：[^\]]*\]/g, '');

  // 移除字符数统计文案
  cleanedContent = cleanedContent.replace(/👉字符数：\d+[^。！？\n]*/g, '');
  cleanedContent = cleanedContent.replace(/字符数：\d+[^。！？\n]*/g, '');
  cleanedContent = cleanedContent.replace(/\d+字符[^。！？\n]*/g, '');
  cleanedContent = cleanedContent.replace(/（\d+字符）/g, '');
  cleanedContent = cleanedContent.replace(/\(\d+字符\)/g, '');

  // 移除其他元数据文案
  cleanedContent = cleanedContent.replace(/【注意：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[注意：[^\]]*\]/g, '');
  cleanedContent = cleanedContent.replace(/（注意：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(注意：[^)]*\)/g, '');

  // 移除建议类文案
  cleanedContent = cleanedContent.replace(/【建议：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[建议：[^\]]*\]/g, '');
  cleanedContent = cleanedContent.replace(/（建议：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(建议：[^)]*\)/g, '');

  // 移除提示类文案
  cleanedContent = cleanedContent.replace(/【提示：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[提示：[^\]]*\]/g, '');
  cleanedContent = cleanedContent.replace(/（提示：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(提示：[^)]*\)/g, '');

  // 移除多余的空行和空格
  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');
  cleanedContent = cleanedContent.replace(/\s+$/gm, '');
  cleanedContent = cleanedContent.trim();

  return cleanedContent;
}

// Helper function to validate character count
function validateCharacterCount(content: string, platformId: string, userSetLimit: number): {
  isValid: boolean;
  actualCount: number;
  targetRange: { min: number; max: number };
  warning?: string;
} {
  const actualCount = content.length;
  const limits = getPlatformCharacterLimits(platformId);

  // 计算目标范围（基于用户设置）
  const targetMin = Math.floor(userSetLimit * 0.8);
  const targetMax = Math.floor(userSetLimit * 0.9);
  const targetRange = { min: targetMin, max: targetMax };

  let warning: string | undefined;

  // 只在超过限制时显示警告，移除字符数建议提示
  if (actualCount > userSetLimit) {
    warning = `⚠️ 内容超出用户设置的${userSetLimit}字符限制，当前${actualCount}字符`;
  } else if (actualCount > limits.maximum) {
    warning = `⚠️ 内容超出${getPlatformName(platformId, [])}平台最大限制${limits.maximum}字符`;
  }
  // 移除了字符数建议提示，只保留超过限制时的警告

  return {
    isValid: actualCount <= userSetLimit && actualCount <= limits.maximum,
    actualCount,
    targetRange,
    warning
  };
}

// Helper function to get platform icon
function getPlatformIcon(platformId: string): JSX.Element {
  
  switch (platformId) {
    case 'zhihu':
      return (
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 text-blue-500 mr-1" />
        </div>
      );
    case 'weibo':
      return <Send className="h-4 w-4 text-orange-500" />;
    case 'xiaohongshu':
      return <Book className="h-4 w-4 text-rose-500" />;
    case 'wechat':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'douyin':
      return <Video className="h-4 w-4 text-black" />;
    case 'video':
      return <SquarePlay className="h-4 w-4 text-green-600" />;
    case 'twitter':
      return <Twitter className="h-4 w-4 text-black" />;
    case 'bilibili':
      return <Video className="h-4 w-4 text-blue-400" />;
    case 'kuaishou':
      return <Video className="h-4 w-4 text-yellow-500" />;
    case 'wangyi':
      return <Rss className="h-4 w-4 text-red-500" />;
    case 'toutiao':
      return <Globe className="h-4 w-4 text-purple-600" />;
    default:
      return <MessageSquare className="h-4 w-4 text-gray-500" />;
  }
}

// Helper functions for character count ranges based on platform requirements
// 使用统一的平台限制配置
function getCharCountMin(platformId: string): number {
  return getConfigCharCountMin(platformId);
}

function getCharCountMax(platformId: string): number {
  return getConfigCharCountMax(platformId);
}

// Progress step
interface ProgressStep {
  status: "waiting" | "loading" | "completed" | "error";
  message: string;
}

interface ContentVersion {
  id: string;
  content: string;
  style: 'standard' | 'creative';
  title: string;
  charCount: number;
  validation?: {
    isValid: boolean;
    actualCount: number;
    targetRange: { min: number; max: number };
    warning?: string;
  };
}

interface PlatformResult {
  platformId: string;
  content: string;
  steps: ProgressStep[];
  source?: "ai";
  error?: string;
  charCount?: number;
  targetCharCount?: number;
  versions?: ContentVersion[];
  canRetry?: boolean;
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
  globalAutoFormat: boolean;
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
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是checkbox，不处理card的点击事件
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    onChange(!checked);
  };

  return (
    <Card
      className={cn(
        "relative border cursor-pointer transition-all duration-200 h-36 flex flex-col",
        checked
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "bg-background hover:shadow-sm hover:border-gray-300"
      )}
      onClick={handleCardClick}
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
              onCheckedChange={(checked) => {
                // 防止事件冒泡导致重复触发
                onChange(!!checked);
              }}
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

// 添加缺失的函数
function getModel(): string {
  return localStorage.getItem('selectedModel') || 'gpt-4o-mini';
}

function setModel(modelId: string): void {
  localStorage.setItem('selectedModel', modelId);
}

// 平台样式配置
const platformStyles: Record<string, { name: string; description: string; maxLength?: number; hashtagCount?: number; tone?: string; features?: string[] }> = {
  xiaohongshu: {
    name: '小红书',
    description: '小红书笔记',
    maxLength: 1000,
    hashtagCount: 20,
    tone: '种草、分享',
    features: ['个人体验', '图片展示', '标签丰富']
  },
  zhihu: {
    name: '知乎',
    description: '知乎问答',
    maxLength: 5000,
    hashtagCount: 0,
    tone: '专业、深度',
    features: ['详细解答', '专业术语', '引用来源']
  },
  douyin: {
    name: '抖音',
    description: '抖音短视频',
    maxLength: 300,
    hashtagCount: 5,
    tone: '轻松、有趣',
    features: ['视频脚本', '音乐配合', '互动引导']
  },
  weibo: {
    name: '微博',
    description: '新浪微博',
    maxLength: 140,
    hashtagCount: 3,
    tone: '简洁、热点',
    features: ['话题标签', '@用户', '转发互动']
  },
  wechat: {
    name: '微信',
    description: '微信公众号、朋友圈',
    maxLength: 2000,
    hashtagCount: 0,
    tone: '专业、权威',
    features: ['图文并茂', '深度内容', '专业术语']
  },
  bilibili: {
    name: '哔哩哔哩',
    description: 'B站视频',
    maxLength: 500,
    hashtagCount: 10,
    tone: '年轻、活力',
    features: ['弹幕互动', '视频标题', '分区标签']
  },
  twitter: {
    name: '推特',
    description: 'X（推特）',
    maxLength: 280,
    hashtagCount: 2,
    tone: '简洁、国际化',
    features: ['话题标签', '转推', '多语言']
  },
  video: {
    name: '视频号',
    description: '微信视频号',
    maxLength: 300,
    hashtagCount: 3,
    tone: '亲和、互动',
    features: ['视频内容', '互动引导', '社交分享']
  },
  baijia: {
    name: '百家号',
    description: '百度百家号',
    maxLength: 3000,
    hashtagCount: 5,
    tone: '权威、专业',
    features: ['长篇内容', 'SEO优化', '资讯类']
  },
  kuaishou: {
    name: '快手',
    description: '快手短视频',
    maxLength: 300,
    hashtagCount: 5,
    tone: '真实、朴实',
    features: ['生活记录', '接地气', '亲民风格']
  },
  wangyi: {
    name: '网易号',
    description: '网易小蜜蜂',
    maxLength: 2000,
    hashtagCount: 3,
    tone: '原创、深度',
    features: ['原创内容', '文笔流畅', '观点独特']
  },
  toutiao: {
    name: '今日头条',
    description: '头条号',
    maxLength: 1500,
    hashtagCount: 5,
    tone: '热点、时效',
    features: ['标题党', '热点敏感', '算法推荐']
  }
};

export default function AdaptPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [originalContent, setOriginalContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [generating, setGenerating] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<Record<string, PlatformSettings>>({});
  const [showSettings, setShowSettings] = useState<Record<string, boolean>>({});
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editingVersion, setEditingVersion] = useState<{platformId: string, versionId: string} | null>(null);
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  const [translatingPlatforms, setTranslatingPlatforms] = useState<Set<string>>(new Set());

  // 对比内容相关状态
  const [comparisonContent, setComparisonContent] = useState<Record<string, string>>({});
  const [generatingComparison, setGeneratingComparison] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState<Record<string, boolean>>({});

  // 多维矩阵提示词系统状态
  const [customPrompt, setCustomPrompt] = useState('');
  const [useBrandLibrary, setUseBrandLibrary] = useState(false);

  // AI调用重试机制
  const callAIWithRetry = async (params: any, versionName: string, maxRetries: number = 3): Promise<any> => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 ${versionName} - 第${attempt}次尝试调用AI (模型: ${params.model})`);

        const result = await callAI(params);

        if (result.success) {
          console.log(`✅ ${versionName} - 第${attempt}次尝试成功`);
          return result;
        } else {
          lastError = new Error(result.error || '未知错误');
          console.log(`❌ ${versionName} - 第${attempt}次尝试失败: ${result.error}`);
        }
      } catch (error) {
        lastError = error;
        console.error(`🚨 ${versionName} - 第${attempt}次尝试异常:`, error);

        // 如果是DeepSeek模型失败，尝试切换到备用模型
        if (params.model.includes('deepseek') && attempt === 1) {
          console.log(`🔄 ${versionName} - DeepSeek失败，尝试切换到GPT-4o-mini`);
          params.model = 'gpt-4o-mini';
        }
      }

      // 如果不是最后一次尝试，等待一段时间再重试
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 指数退避，最大5秒
        console.log(`⏳ ${versionName} - 等待${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error(`${versionName} - 所有重试都失败了`);
  };
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    charCountPreset: 'auto',
    globalEmoji: false,
    globalMd: false,
    globalAutoFormat: true
  });

  // 设置模式状态：'global' | 'platform'
  const [settingsMode, setSettingsMode] = useState<{
    charCount: 'global' | 'platform';
    emoji: 'global' | 'platform';
    mdFormat: 'global' | 'platform';
  }>({
    charCount: 'platform',
    emoji: 'platform',
    mdFormat: 'platform'
  });

  // AI模型说明数据
  const modelDescriptions = {
    'gpt-4o': {
      features: 'GPT-4o模型',
      scenarios: '通用内容创作',
      style: '准确表达',
      speed: '响应速度：中等'
    },
    'deepseek-v3': {
      features: '国产大模型，中文优化',
      scenarios: '适合中文内容、本土化表达',
      style: '自然流畅、符合中文习惯',
      speed: '响应速度：较快'
    },
    'claude-3.5-sonnet': {
      features: 'Anthropic最新模型，创意能力强',
      scenarios: '适合创意写作、文学创作',
      style: '富有创意、表达生动',
      speed: '响应速度：中等'
    }
  };

  // 当前选中模型的说明状态
  const [selectedModelDescription, setSelectedModelDescription] = useState<any>(null);

  // 生成多个版本的内容
  const generateMultipleVersions = async (basePrompt: string, platformId: string): Promise<ContentVersion[]> => {
    const versions: ContentVersion[] = [];

    // 版本A：标准风格，结构化表达
    const standardPrompt = `${basePrompt}\n\n【版本要求】请生成标准风格的内容，要求：\n- 结构清晰，逻辑严谨\n- 表达准确，用词规范\n- 重点突出，层次分明`;

    // 版本B：创新风格，灵活化表达
    const creativePrompt = `${basePrompt}\n\n【版本要求】请生成创新风格的内容，要求：\n- 表达生动，富有创意\n- 语言灵活，贴近用户\n- 情感丰富，引人入胜`;

    try {
      console.log(`开始为平台 ${platformId} 生成多版本内容`);
      console.log('使用模型:', selectedModel);
      console.log('提示词长度:', basePrompt.length);

      // 使用新的配置系统计算字符数限制和token数
      const userCharLimit = platformSettings[platformId]?.charCount || getCharCountMax(platformId);
      const charCountConfig = getCharCountByPreset(platformId, globalSettings.charCountPreset);
      const platformAdvice = getPlatformCharCountAdvice(platformId);

      // 计算token数，确保有足够空间生成目标字符数的内容
      let maxTokens: number;
      const targetChars = charCountConfig.target;

      if (globalSettings.charCountPreset === 'detailed') {
        const minTokensFor800Chars = 800;
        const targetTokens = Math.max(minTokensFor800Chars, Math.floor(targetChars / 0.8));
        maxTokens = Math.min(targetTokens, 6000);
      } else if (globalSettings.charCountPreset === 'standard') {
        maxTokens = Math.min(Math.floor(targetChars / 1.0), 4000);
      } else if (globalSettings.charCountPreset === 'mini') {
        maxTokens = Math.min(Math.floor(targetChars / 1.2), 2000);
      } else {
        maxTokens = Math.min(Math.floor(targetChars / 1.0), 3000);
      }

      // 使用新的字符数控制逻辑
      const optimalRange = calculateOptimalCharCount(platformId, userCharLimit);
      const charCountInstruction = `【字符数精确控制】目标范围：${optimalRange.min}-${optimalRange.max}字符（平台建议最低${optimalRange.min}字符到平台最高限制的95%）。${platformAdvice}。请生成在此范围内的完整内容，确保内容完整性和质量。`;

      // 并行生成两个版本
      const [standardResult, creativeResult] = await Promise.all([
        callAIWithRetry({
          prompt: standardPrompt,
          model: selectedModel as any,
          systemPrompt: `你是一个专业的内容创作专家，擅长生成结构化、标准化的内容。${charCountInstruction}`,
          maxTokens: maxTokens,
          temperature: 0.7
        }, '标准版本').catch(error => {
          console.error('标准版本生成失败:', error);
          return { success: false, error: error.message };
        }),
        callAIWithRetry({
          prompt: creativePrompt,
          model: selectedModel as any,
          systemPrompt: `你是一个富有创意的内容创作专家，擅长生成生动、有趣的内容。${charCountInstruction}`,
          maxTokens: maxTokens,
          temperature: 0.9
        }, '创意版本').catch(error => {
          console.error('创意版本生成失败:', error);
          return { success: false, error: error.message };
        })
      ]);

      console.log('标准版本结果:', standardResult.success ? '成功' : `失败: ${standardResult.error}`);
      console.log('创意版本结果:', creativeResult.success ? '成功' : `失败: ${creativeResult.error}`);

      if (standardResult.success && standardResult.content) {
        const userSetLimit = platformSettings[platformId]?.charCount || getCharCountMax(platformId);
        let finalContent = standardResult.content;

        // 使用新的配置系统验证字符数
        const charCountConfig = getCharCountByPreset(platformId, globalSettings.charCountPreset);
        if (finalContent.length < charCountConfig.min) {
          console.warn(`标准版本内容不足 ${finalContent.length}/${charCountConfig.min}字`);
          finalContent = finalContent + `\n\n[注意：此内容为${finalContent.length}字符，未达到${globalSettings.charCountPreset}版${charCountConfig.min}字要求]`;
        }

        // 禁止截断：如果内容超出限制，记录警告但保持内容完整
        if (finalContent.length > userSetLimit) {
          console.warn(`标准版本内容超出限制 ${finalContent.length}/${userSetLimit}，保持内容完整`);
        }

        const validation = validateCharacterCount(finalContent, platformId, userSetLimit);

        // 生成智能话题标签
        let contentWithTags = finalContent;
        try {
          const hashtags = await hashtagGenerator.generateHashtags(finalContent, {
            maxTags: 5,
            platformId: platformId
          });

          if (hashtags.length > 0) {
            const topTags = hashtags.slice(0, 3).map(h => h.tag);
            const formattedTags = hashtagGenerator.formatTagsForPlatform(topTags, platformId);
            contentWithTags = finalContent + '\n\n' + formattedTags;
          }
        } catch (error) {
          console.warn('话题标签生成失败:', error);
        }

        versions.push({
          id: 'version-a',
          content: contentWithTags,
          style: 'standard',
          title: '版本A',
          charCount: contentWithTags.length,
          validation: validation
        });

        if (validation.warning) {
          console.warn(`版本A字符数警告: ${validation.warning}`);
        }
      }

      if (creativeResult.success && creativeResult.content) {
        const userSetLimit = platformSettings[platformId]?.charCount || getCharCountMax(platformId);
        let finalContent = creativeResult.content;

        // 使用新的配置系统验证字符数
        const charCountConfig = getCharCountByPreset(platformId, globalSettings.charCountPreset);
        if (finalContent.length < charCountConfig.min) {
          console.warn(`创意版本内容不足 ${finalContent.length}/${charCountConfig.min}字`);
          finalContent = finalContent + `\n\n[注意：此内容为${finalContent.length}字符，未达到${globalSettings.charCountPreset}版${charCountConfig.min}字要求]`;
        }

        // 清理生成内容中的多余文案
        finalContent = cleanGeneratedContent(finalContent);

        // 禁止截断：如果内容超出限制，记录警告但保持内容完整
        if (finalContent.length > userSetLimit) {
          console.warn(`创意版本内容超出限制 ${finalContent.length}/${userSetLimit}，保持内容完整`);
        }

        const validation = validateCharacterCount(finalContent, platformId, userSetLimit);

        // 生成智能话题标签
        let contentWithTags = finalContent;
        try {
          const hashtags = await hashtagGenerator.generateHashtags(finalContent, {
            maxTags: 5,
            platformId: platformId,
            includeRecommended: true,
            includeTrending: true
          });

          if (hashtags.length > 0) {
            const topTags = hashtags.slice(0, 3).map(h => h.tag);
            const formattedTags = hashtagGenerator.formatTagsForPlatform(topTags, platformId);
            contentWithTags = finalContent + '\n\n' + formattedTags;
          }
        } catch (error) {
          console.warn('话题标签生成失败:', error);
        }

        versions.push({
          id: 'version-b',
          content: contentWithTags,
          style: 'creative',
          title: '版本B',
          charCount: contentWithTags.length,
          validation: validation
        });

        if (validation.warning) {
          console.warn(`版本B字符数警告: ${validation.warning}`);
        }
      }

      // 如果两个版本都失败了，尝试生成一个基础版本
      if (versions.length === 0) {
        console.log('两个版本都失败，尝试生成基础版本');
        const fallbackResult = await callAIWithRetry({
          prompt: basePrompt,
          model: selectedModel as any,
          systemPrompt: '你是一个内容创作专家，请生成高质量的内容。',
          maxTokens: 2000,
          temperature: 0.8
        }, '基础版本').catch(error => {
          console.error('基础版本生成失败:', error);
          return { success: false, error: error.message };
        });

        if (fallbackResult.success && fallbackResult.content) {
          versions.push({
            id: 'version-fallback',
            content: fallbackResult.content,
            style: 'standard',
            title: '生成版本',
            charCount: fallbackResult.content.length
          });
        }
      }

      console.log(`平台 ${platformId} 最终生成了 ${versions.length} 个版本`);
      return versions;
    } catch (error) {
      console.error('生成多版本内容失败:', error);
      return [];
    }
  };
  
  // AI Model settings
  const [apiProvider, setCurrentApiProvider] = useState<'openai' | 'gemini' | 'deepseek'>('openai');
  const [selectedModel, setSelectedModel] = useState(getModel());
  
  // 订阅等级本地状态，后续可全局提升
  const [userPlan, setUserPlan] = useState<'trial' | 'pro' | 'premium'>('trial');
  
  // 内容形式和风格选择
  const [selectedFormId, setSelectedFormId] = useState<string | undefined>(undefined);
  const [selectedStyle, setSelectedStyle] = useState<StyleType | undefined>(undefined);
  
  // 获取可用模型
  const availableModels = getAvailableModelsForTier(userPlan);
  
  // 所有模型
  const allModels = getAllModels();
  
  // 处理模型选择
  const handleModelSelect = (modelId: string, disabled: boolean) => {
    if (disabled) {
      toast({
        title: "模型不可用",
        description: "该模型需要升级订阅计划才能使用",
        variant: "destructive"
      });
      return;
    }
    setSelectedModel(modelId);
    setModel(modelId);
    // 更新模型说明
    setSelectedModelDescription(modelDescriptions[modelId as keyof typeof modelDescriptions] || null);
    // 自动切换API提供商
    const provider = getModelProvider(modelId);
    if (provider === 'OpenAI') setCurrentApiProvider('openai');
    if (provider === 'DeepSeek') setCurrentApiProvider('deepseek');
    toast({
      title: "模型已切换",
      description: `已切换到 ${getModelInfo(modelId)?.name}`,
    });
  };

  // 处理升级功能点击
  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    navigate('/payment');
  };

  // 处理从其他页面传递的预填充内容
  useEffect(() => {
    if (location.state?.prefilledContent) {
      const { prefilledContent, source, sourceTitle } = location.state;
      setOriginalContent(prefilledContent);

      // 显示来源提示
      toast({
        title: "内容已导入",
        description: `已从${sourceTitle || source || '外部来源'}导入内容到编辑器`,
      });

      // 清除state以避免重复导入
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);
  
  // User store for usage tracking
  const usageRemaining = useAuthStore((state) => state.getUsageRemaining());
  const { decrementUsage } = useAuthStore();

  // 使用次数提醒弹窗状态
  const [showUsageReminder, setShowUsageReminder] = useState(false);
  const [usageReminderCount, setUsageReminderCount] = useState(0);
  
  // 高级功能权限弹窗状态
  const [showPremiumFeature, setShowPremiumFeature] = useState(false);
  const [premiumFeatureInfo, setPremiumFeatureInfo] = useState({ name: '', description: '' });

  const platforms = useMemo(() => [
    { id: "xiaohongshu", name: "小红书", description: "适合生活方式、美妆、旅行等分享，强调个人体验和情感共鸣", icon: <Book className="h-4 w-4 text-rose-500" /> },
    { id: "zhihu", name: "知乎", description: "适合专业知识分享和理性讨论，强调逻辑和论证", icon: <MessageSquare className="h-4 w-4 text-blue-500" /> },
    { id: "douyin", name: "抖音", description: "适合短视频脚本，活泼有趣，强调视听效果", icon: <Video className="h-4 w-4 text-black" /> },
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
        // 去重处理，确保没有重复的平台ID
        const uniquePlatforms = Array.from(new Set(parsedSelectedPlatforms)) as string[];
        setSelectedPlatforms(uniquePlatforms);
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

  // 清理重复的平台选择
  const cleanupDuplicatePlatforms = useCallback(() => {
    setSelectedPlatforms(prev => {
      const uniquePlatforms = Array.from(new Set(prev));
      if (uniquePlatforms.length !== prev.length) {
        return uniquePlatforms;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    initializeDefaultSettings();
    // 清理可能存在的重复平台选择
    cleanupDuplicatePlatforms();
  }, [initializeDefaultSettings, cleanupDuplicatePlatforms]);

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
      setSelectedPlatforms(prev => {
        // 防止重复添加同一个平台
        if (prev.includes(platformId)) {
          return prev;
        }
        return [...prev, platformId];
      });
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

    // 当调整平台特定设置时，自动禁用对应的全局设置并切换模式
    if (key === 'charCount') {
      setSettingsMode(prev => ({ ...prev, charCount: 'platform' }));
      setGlobalSettings(prev => ({ ...prev, charCountPreset: 'auto' }));
    } else if (key === 'useEmoji') {
      setSettingsMode(prev => ({ ...prev, emoji: 'platform' }));
      setGlobalSettings(prev => ({ ...prev, globalEmoji: false }));
    } else if (key === 'useMdFormat') {
      setSettingsMode(prev => ({ ...prev, mdFormat: 'platform' }));
      setGlobalSettings(prev => ({ ...prev, globalMd: false }));
    }
  };

  // Update global settings
  const updateGlobalSetting = (key: keyof GlobalSettings, value: unknown) => {
    setGlobalSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // 只有在当前是平台模式且启用全局设置时，才切换到全局模式
    // 如果已经在全局模式，则保持在全局模式，只更新设置值
    const isCurrentlyInGlobalMode =
      settingsMode.charCount === 'global' &&
      settingsMode.emoji === 'global' &&
      settingsMode.mdFormat === 'global';

    if (value && !isCurrentlyInGlobalMode) {
      // 只有在平台模式下启用全局设置时才切换模式
      if (key === 'charCountPreset' && value !== 'auto') {
        setSettingsMode(prev => ({ ...prev, charCount: 'global' }));
      } else if (key === 'globalEmoji') {
        setSettingsMode(prev => ({ ...prev, emoji: 'global' }));
      } else if (key === 'globalMd') {
        setSettingsMode(prev => ({ ...prev, mdFormat: 'global' }));
      } else if (key === 'globalAutoFormat') {
        // globalAutoFormat 不影响模式切换，只是一个功能开关
      }
    }
    // 移除了禁用时自动切换到平台模式的逻辑
    // 用户在全局模式下取消勾选选项时，应该保持在全局模式
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

    // Apply auto format setting if enabled globally
    if (globalSettings.globalAutoFormat) {
      Object.keys(updatedSettings).forEach(platformId => {
        updatedSettings[platformId].useAutoFormat = true;
      });
    }

    // Apply character count based on preset using new configuration system
    if (globalSettings.charCountPreset !== 'auto') {
      Object.keys(updatedSettings).forEach(platformId => {
        const charCountConfig = getCharCountByPreset(platformId, globalSettings.charCountPreset);
        updatedSettings[platformId].charCount = charCountConfig.target;
      });
    }

    setPlatformSettings(updatedSettings);
  };

  // 处理设置模式切换的互斥逻辑
  const handleSettingsModeToggle = (mode: 'global' | 'platform') => {
    if (mode === 'global') {
      setSettingsMode({
        charCount: 'global',
        emoji: 'global',
        mdFormat: 'global'
      });
      // 重新启用全局设置的默认值
      setGlobalSettings(prev => ({
        ...prev,
        charCountPreset: prev.charCountPreset === 'auto' ? 'standard' : prev.charCountPreset,
        globalEmoji: true,
        globalMd: true,
        globalAutoFormat: true
      }));
      // 应用全局设置到所有平台
      setTimeout(() => applyGlobalSettings(), 100);
    } else {
      setSettingsMode({
        charCount: 'platform',
        emoji: 'platform',
        mdFormat: 'platform'
      });
      // 禁用全局设置
      setGlobalSettings(prev => ({
        ...prev,
        charCountPreset: 'auto',
        globalEmoji: false,
        globalMd: false,
        globalAutoFormat: false
      }));
    }
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
    if (!checkUsageAndShowReminder()) return;
    
    if (!originalContent.trim()) {
      toast({
        title: "请输入内容",
        description: "请先输入要适配的原始内容",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "请选择平台",
        description: "请至少选择一个目标平台",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    setResults([]);

    try {
      // 为每个选中的平台生成内容
      const newResults: PlatformResult[] = [];
      
      for (const platformId of selectedPlatforms) {
        const platformResult: PlatformResult = {
          platformId,
          content: '',
          steps: [
            { status: 'waiting', message: '🔄 正在准备生成...' },
            { status: 'waiting', message: '🧠 构建多维提示词...' },
            { status: 'waiting', message: '🤖 调用AI服务生成内容...' },
            { status: 'waiting', message: '⚡ 处理生成结果...' }
          ]
        };
        
        newResults.push(platformResult);
        setResults([...newResults]);

        const updateStep = (stepIndex: number, status: "waiting" | "loading" | "completed" | "error", message?: string) => {
          const updatedResults = [...newResults];
          if (updatedResults[updatedResults.length - 1]) {
            updatedResults[updatedResults.length - 1].steps[stepIndex].status = status;
            if (message) {
              updatedResults[updatedResults.length - 1].steps[stepIndex].message = message;
            }
            setResults([...updatedResults]);
          }
        };

        try {
          // 步骤1: 开始生成
          updateStep(0, 'loading', '🔄 正在准备生成...');

          // 步骤2: 构建提示词
          updateStep(1, 'loading', '🧠 构建多维提示词...');

          // 使用多维矩阵提示词系统生成内容
          const matrixPrompt = await generateMatrixPrompt(
            originalContent.trim(),
            platformId,
            selectedFormId,
            selectedStyle,
            platformSettings[platformId]?.charCount || getCharCountMax(platformId),
            customPrompt,
            useBrandLibrary
          );

          // 步骤3: AI生成内容
          updateStep(2, 'loading', '🤖 调用AI服务生成内容...');

          // 添加60秒超时处理
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('生成超时，请重试')), 60000);
          });

          // 生成多个版本的内容（带超时）
          const versions = await Promise.race([
            generateMultipleVersions(matrixPrompt, platformId),
            timeoutPromise
          ]) as any;

          if (versions.length > 0) {
              // 更新结果，包含多个版本
              const updatedResults = [...newResults];
              const resultIndex = updatedResults.findIndex(r => r.platformId === platformId);
              if (resultIndex !== -1) {
                updatedResults[resultIndex].versions = versions;
                updatedResults[resultIndex].content = versions[0].content; // 默认显示第一个版本
                updatedResults[resultIndex].source = 'ai';

                // 更新所有步骤为完成状态
                updatedResults[resultIndex].steps[0].status = 'completed';
                updatedResults[resultIndex].steps[0].message = '✓ 准备生成完成';
                updatedResults[resultIndex].steps[1].status = 'completed';
                updatedResults[resultIndex].steps[1].message = '✓ 多维提示词构建完成';
                updatedResults[resultIndex].steps[2].status = 'completed';
                updatedResults[resultIndex].steps[2].message = '✓ AI服务调用成功';
                updatedResults[resultIndex].steps[3].status = 'completed';
                updatedResults[resultIndex].steps[3].message = versions.length > 1
                  ? `✓ 已生成${versions.length}个不同风格版本`
                  : '✓ 内容生成完成';

                // 添加字符数信息
                updatedResults[resultIndex].charCount = versions[0].content.length;
                updatedResults[resultIndex].targetCharCount = platformSettings[platformId]?.charCount || getCharCountMax(platformId);
              }
              setResults([...updatedResults]);
              newResults[resultIndex] = updatedResults[resultIndex];
          } else {
            throw new Error('生成版本失败');
          }
        } catch (error) {
          console.error(`生成 ${platformId} 内容失败:`, error);

          const updatedResults = [...newResults];
          const resultIndex = updatedResults.findIndex(r => r.platformId === platformId);
          if (resultIndex !== -1) {
            // 提供用户友好的错误信息
            let userFriendlyError = '生成失败，请重试';
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes('超时') || errorMessage.includes('timeout')) {
              userFriendlyError = '⏰ 网络超时，启动智能重试...';
              // 立即触发自动重试
              setTimeout(() => {
                autoRetryTimeoutPlatform(platformId);
              }, 1000);
            } else if (errorMessage.includes('API') || errorMessage.includes('401') || errorMessage.includes('403')) {
              userFriendlyError = '🔑 AI服务认证失败，请联系管理员';
            } else if (errorMessage.includes('429')) {
              userFriendlyError = '🚦 请求过于频繁，请稍后重试';
            } else if (errorMessage.includes('网络') || errorMessage.includes('network')) {
              userFriendlyError = '🌐 网络连接失败，请检查网络设置';
            }

            updatedResults[resultIndex].error = userFriendlyError;
            updatedResults[resultIndex].steps.forEach((step, stepIndex) => {
              if (step.status === 'loading') {
                step.status = 'error';
                // 更新错误状态的消息
                if (stepIndex === 0) step.message = '❌ 准备生成失败';
                else if (stepIndex === 1) step.message = '❌ 构建提示词失败';
                else if (stepIndex === 2) step.message = '❌ AI服务调用失败';
                else if (stepIndex === 3) step.message = '❌ 处理结果失败';
              }
            });

            // 添加重试按钮数据
            updatedResults[resultIndex].canRetry = true;
          }
          setResults([...updatedResults]);
        }
      }

      // 保存到历史记录
      saveToHistory(newResults);
      
      toast({
        title: "生成完成",
        description: `已为 ${selectedPlatforms.length} 个平台生成内容`,
      });
    } catch (error) {
      console.error('生成内容失败:', error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : '生成内容时发生错误',
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

  // 版本重新生成状态
  const [regeneratingVersions, setRegeneratingVersions] = useState<Set<string>>(new Set());

  // 自动重试状态
  const [autoRetryingPlatforms, setAutoRetryingPlatforms] = useState<Set<string>>(new Set());

  // 自动化转发状态
  const [automationRunning, setAutomationRunning] = useState(false);
  const [automationProgress, setAutomationProgress] = useState<AutomationProgress | undefined>();

  // 网络状态检测
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');

  // 网络状态监听
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      console.log('🌐 网络已连接');
    };

    const handleOffline = () => {
      setNetworkStatus('offline');
      console.log('🚫 网络已断开');
      toast({
        title: "网络连接断开",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    };

    // 检测网络速度
    const checkNetworkSpeed = async () => {
      try {
        const startTime = Date.now();
        await fetch('/favicon.ico', { cache: 'no-cache' });
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (duration > 3000) {
          setNetworkStatus('slow');
          console.log('🐌 网络连接较慢');
        } else {
          setNetworkStatus('online');
        }
      } catch (error) {
        setNetworkStatus('offline');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始检测
    if (!navigator.onLine) {
      setNetworkStatus('offline');
    } else {
      checkNetworkSpeed();
    }

    // 定期检测网络状态
    const interval = setInterval(checkNetworkSpeed, 30000); // 每30秒检测一次

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // 网络诊断工具
  const runNetworkDiagnostic = async () => {
    console.log('🔍 开始网络诊断...');

    const diagnosticResults = {
      basicConnectivity: false,
      dnsResolution: false,
      apiEndpoint: false,
      latency: 0
    };

    try {
      // 1. 基础连接测试
      const startTime = Date.now();
      await fetch('/favicon.ico', { cache: 'no-cache' });
      diagnosticResults.basicConnectivity = true;
      diagnosticResults.latency = Date.now() - startTime;

      // 2. DNS解析测试
      await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        cache: 'no-cache'
      });
      diagnosticResults.dnsResolution = true;

      // 3. AI API端点测试
      try {
        const response = await fetch('https://api.deepseek.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test'
          }
        });
        // 即使返回401，也说明端点可达
        diagnosticResults.apiEndpoint = response.status === 401 || response.status === 200;
      } catch (error) {
        diagnosticResults.apiEndpoint = false;
      }

    } catch (error) {
      console.error('网络诊断失败:', error);
    }

    // 输出诊断结果
    console.log('📊 网络诊断结果:', diagnosticResults);

    let message = '网络诊断完成:\n';
    message += `• 基础连接: ${diagnosticResults.basicConnectivity ? '✅ 正常' : '❌ 失败'}\n`;
    message += `• DNS解析: ${diagnosticResults.dnsResolution ? '✅ 正常' : '❌ 失败'}\n`;
    message += `• AI服务端点: ${diagnosticResults.apiEndpoint ? '✅ 可达' : '❌ 不可达'}\n`;
    message += `• 网络延迟: ${diagnosticResults.latency}ms`;

    if (diagnosticResults.latency > 2000) {
      message += '\n\n建议: 网络延迟较高，建议切换网络环境';
    }

    toast({
      title: "网络诊断结果",
      description: message,
      duration: 8000
    });

    return diagnosticResults;
  };

  // 自动重试超时平台
  const autoRetryTimeoutPlatform = async (platformId: string, retryCount: number = 1, maxRetries: number = 2) => {
    if (retryCount > maxRetries) {
      console.log(`平台 ${platformId} 已达到最大重试次数 ${maxRetries}`);
      return;
    }

    console.log(`🔄 平台 ${platformId} 开始第 ${retryCount} 次自动重试...`);
    setAutoRetryingPlatforms(prev => new Set(prev).add(platformId));

    // 更新UI显示重试状态
    setResults(current =>
      current.map(result =>
        result.platformId === platformId
          ? {
              ...result,
              error: `🔄 智能重试中... (${retryCount}/${maxRetries}) - 正在切换到备用模型`,
              steps: result.steps.map(step => ({ ...step, status: 'loading' as const }))
            }
          : result
      )
    );

    try {
      // 智能延迟策略：第一次重试2秒，第二次重试5秒
      const delay = retryCount === 1 ? 2000 : 5000;
      await new Promise(resolve => setTimeout(resolve, delay));

      // 重新生成内容
      await generateSinglePlatformContent(platformId);

      console.log(`✅ 平台 ${platformId} 第 ${retryCount} 次重试成功`);

      // 显示成功消息
      toast({
        title: "自动重试成功",
        description: `${getPlatformName(platformId, platforms)} 内容已重新生成`,
      });

    } catch (error) {
      console.error(`❌ 平台 ${platformId} 第 ${retryCount} 次重试失败:`, error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      if ((errorMessage.includes('超时') || errorMessage.includes('timeout')) && retryCount < maxRetries) {
        // 继续重试，使用更长的延迟
        setTimeout(() => {
          autoRetryTimeoutPlatform(platformId, retryCount + 1, maxRetries);
        }, 3000);
      } else {
        // 最终失败，提供用户友好的错误信息
        const finalError = retryCount >= maxRetries
          ? `⏰ 网络不稳定，已重试 ${maxRetries} 次。建议：1) 检查网络连接 2) 稍后手动重试 3) 尝试切换网络环境`
          : errorMessage;

        setResults(current =>
          current.map(result =>
            result.platformId === platformId
              ? {
                  ...result,
                  error: finalError
                }
              : result
          )
        );

        // 显示错误提示
        if (retryCount >= maxRetries) {
          toast({
            title: "自动重试失败",
            description: `${getPlatformName(platformId, platforms)} 生成失败，请检查网络后手动重试`,
            variant: "destructive"
          });
        }
      }
    } finally {
      setAutoRetryingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platformId);
        return newSet;
      });
    }
  };

  // 新的自动化转发处理函数
  const handleStartAutomation = async (selectedPlatforms: string[], options: AutomationOptions) => {
    try {
      setAutomationRunning(true);
      setAutomationProgress({
        total: selectedPlatforms.length,
        completed: 0,
        current: '',
        status: 'preparing',
        results: []
      });

      toast({
        title: "启动自动化转发",
        description: `准备自动转发到 ${selectedPlatforms.length} 个平台`,
      });

      // 动态导入自动化模块
      const { executeBatchForward } = await import('../automation/batchForward');

      // 执行自动化转发
      const automationResults = await executeBatchForward({
        baseUrl: window.location.origin,
        platforms: selectedPlatforms,
        headless: false,
        timeout: options.retryCount * 10000,
        retryCount: options.retryCount,
        enablePreview: options.enablePreview,
        enableConfirmation: options.enableConfirmation,
        method: options.method,
        onProgress: (progress) => {
          setAutomationProgress(progress);
        }
      });

      // 转换结果格式
      const convertedResults: AutomationResult[] = automationResults.map(result => ({
        platformId: result.platform,
        platformName: result.platform,
        success: result.success,
        error: result.error,
        url: result.url,
        method: 'automation' as const,
        timestamp: Date.now(),
        retryCount: 0
      }));

      setAutomationProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        results: convertedResults
      } : undefined);

      // 统计结果
      const successCount = convertedResults.filter(r => r.success).length;
      const failureCount = convertedResults.length - successCount;

      if (successCount > 0) {
        toast({
          title: "自动化转发完成",
          description: `成功: ${successCount}个, 失败: ${failureCount}个`,
        });
      } else {
        toast({
          title: "自动化转发失败",
          description: "所有平台转发都失败了，请检查网络连接和平台状态",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('自动化转发失败:', error);
      setAutomationProgress(prev => prev ? {
        ...prev,
        status: 'error'
      } : undefined);

      toast({
        title: "自动化转发失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive"
      });
    } finally {
      setAutomationRunning(false);
    }
  };

  // 取消自动化转发
  const handleCancelAutomation = () => {
    setAutomationRunning(false);
    setAutomationProgress(prev => prev ? {
      ...prev,
      status: 'cancelled'
    } : undefined);

    toast({
      title: "已取消自动化转发",
      description: "自动化转发操作已被用户取消",
    });
  };

  // 重试单个平台
  const handleRetryPlatform = async (platformId: string) => {
    try {
      toast({
        title: "重试转发",
        description: `正在重试 ${platformId} 平台的转发`,
      });

      // 这里可以实现单个平台的重试逻辑
      // 暂时显示提示信息
      toast({
        title: "重试功能",
        description: "单个平台重试功能正在开发中",
      });

    } catch (error) {
      console.error('重试失败:', error);
      toast({
        title: "重试失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive"
      });
    }
  };

  // 生成单个平台内容（用于重试）
  const generateSinglePlatformContent = async (platformId: string) => {
    const matrixPrompt = await generateMatrixPrompt(
      originalContent.trim(),
      platformId,
      selectedFormId,
      selectedStyle,
      platformSettings[platformId]?.charCount || getCharCountMax(platformId),
      customPrompt,
      useBrandLibrary
    );

    // 添加90秒超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('生成超时，请重试')), 90000);
    });

    // 生成多个版本的内容（带超时）
    const versions = await Promise.race([
      generateMultipleVersions(matrixPrompt, platformId),
      timeoutPromise
    ]) as any;

    if (versions.length > 0) {
      // 更新结果，包含多个版本
      setResults(current =>
        current.map(result =>
          result.platformId === platformId
            ? {
                ...result,
                versions,
                error: undefined,
                steps: result.steps.map(step => ({ ...step, status: 'completed' as const }))
              }
            : result
        )
      );
    } else {
      throw new Error('生成的版本为空');
    }
  };

  // 重新生成特定版本
  const regenerateVersion = async (platformId: string, versionId: string) => {
    const result = results.find(r => r.platformId === platformId);
    if (!result || !result.versions) return;

    const version = result.versions.find(v => v.id === versionId);
    if (!version) return;

    const versionKey = `${platformId}-${versionId}`;
    setRegeneratingVersions(prev => new Set(prev).add(versionKey));

    try {
      // 构建提示词
      const matrixPrompt = await generateMatrixPrompt(
        originalContent.trim(),
        platformId,
        selectedFormId,
        selectedStyle,
        platformSettings[platformId]?.charCount || getCharCountMax(platformId),
        customPrompt,
        useBrandLibrary
      );

      // 根据版本类型生成新内容
      const prompt = version.style === 'standard'
        ? `${matrixPrompt}\n\n【版本要求】请生成标准风格的内容，要求：\n- 结构清晰，逻辑严谨\n- 表达准确，用词规范\n- 重点突出，层次分明`
        : `${matrixPrompt}\n\n【版本要求】请生成创新风格的内容，要求：\n- 表达生动，富有创意\n- 语言灵活，贴近用户\n- 情感丰富，引人入胜`;

      // 使用新的配置系统计算字符数和token限制
      const userCharLimit = platformSettings[platformId]?.charCount || getCharCountMax(platformId);
      const charCountConfig = getCharCountByPreset(platformId, globalSettings.charCountPreset);
      const platformAdvice = getPlatformCharCountAdvice(platformId);

      // 计算token数，确保有足够空间生成目标字符数的内容
      let maxTokens: number;
      const targetChars = charCountConfig.target;

      if (globalSettings.charCountPreset === 'detailed') {
        // 详细版需要更多token，确保能生成800+字符
        const minTokensFor800Chars = 800;
        const targetTokens = Math.max(minTokensFor800Chars, Math.floor(targetChars / 0.8));
        maxTokens = Math.min(targetTokens, 6000);
      } else if (globalSettings.charCountPreset === 'standard') {
        maxTokens = Math.min(Math.floor(targetChars / 1.0), 4000);
      } else if (globalSettings.charCountPreset === 'mini') {
        maxTokens = Math.min(Math.floor(targetChars / 1.2), 2000);
      } else {
        maxTokens = Math.min(Math.floor(targetChars / 1.0), 3000);
      }

      // 使用新的字符数控制逻辑
      const optimalRange = calculateOptimalCharCount(platformId, userCharLimit);
      const charCountInstruction = `【字符数精确控制】目标范围：${optimalRange.min}-${optimalRange.max}字符（平台建议最低${optimalRange.min}字符到平台最高限制的95%）。${platformAdvice}。请生成在此范围内的完整内容，确保内容完整性和质量。`;

      const aiResult = await callAI({
        prompt,
        model: selectedModel as any,
        systemPrompt: version.style === 'standard'
          ? `你是一个专业的内容创作专家，擅长生成结构化、标准化的内容。${charCountInstruction}`
          : `你是一个富有创意的内容创作专家，擅长生成生动、有趣的内容。${charCountInstruction}`,
        maxTokens: maxTokens,
        temperature: version.style === 'standard' ? 0.7 : 0.9
      });

      if (aiResult.success && aiResult.content) {
        let finalContent = aiResult.content;

        // 使用新的配置系统验证字符数
        const validation = validateCharCount(platformId, finalContent.length);
        const charCountConfig = getCharCountByPreset(platformId, globalSettings.charCountPreset);

        // 清理生成内容中的多余文案
        finalContent = cleanGeneratedContent(finalContent);

        // 检查是否达到最低字符数要求（仅记录日志，不添加建议文案）
        if (finalContent.length < charCountConfig.min) {
          console.warn(`内容不足 ${finalContent.length}/${charCountConfig.min}字，需要补充内容`);
          // 移除了建议文案的添加，保持内容原样
        }

        // 清理生成内容中的多余文案
        finalContent = cleanGeneratedContent(finalContent);

        // 禁止截断：如果内容超出限制，记录警告但保持内容完整
        if (finalContent.length > userCharLimit) {
          console.warn(`内容超出限制 ${finalContent.length}/${userCharLimit}，保持内容完整`);
        }

        // 生成智能话题标签
        let contentWithTags = finalContent;
        try {
          const hashtags = await hashtagGenerator.generateHashtags(finalContent, {
            maxTags: 5,
            platformId: platformId
          });

          if (hashtags.length > 0) {
            const topTags = hashtags.slice(0, 3).map(h => h.tag);
            const formattedTags = hashtagGenerator.formatTagsForPlatform(topTags, platformId);
            contentWithTags = finalContent + '\n\n' + formattedTags;
          }
        } catch (error) {
          console.warn('话题标签生成失败:', error);
        }

        // 更新版本内容
        setResults(current =>
          current.map(r =>
            r.platformId === platformId
              ? {
                  ...r,
                  versions: r.versions?.map(v =>
                    v.id === versionId
                      ? { ...v, content: contentWithTags, charCount: contentWithTags.length }
                      : v
                  )
                }
              : r
          )
        );

        toast({
          title: "重新生成完成",
          description: `${version.title}已更新`,
        });
      }
    } catch (error) {
      toast({
        title: "重新生成失败",
        description: error instanceof Error ? error.message : '生成失败',
        variant: "destructive"
      });
    } finally {
      setRegeneratingVersions(prev => {
        const newSet = new Set(prev);
        newSet.delete(versionKey);
        return newSet;
      });
    }
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

  // Edit version content
  const handleEditVersion = (platformId: string, versionId: string) => {
    const currentEditing = editingVersion;
    if (currentEditing && currentEditing.platformId === platformId && currentEditing.versionId === versionId) {
      setEditingVersion(null);
    } else {
      setEditingVersion({ platformId, versionId });
    }
  };

  const handleSaveVersionEdit = (platformId: string, versionId: string, newContent: string) => {
    setResults(current =>
      current.map(result =>
        result.platformId === platformId
          ? {
              ...result,
              versions: result.versions?.map(version =>
                version.id === versionId
                  ? { ...version, content: newContent, charCount: newContent.length }
                  : version
              )
            }
          : result
      )
    );
    setEditingVersion(null);
    toast({
      title: "保存成功",
      description: "版本内容已更新",
    });
  };

  // Favorite content
  const handleFavorite = (platformId: string, versionId?: string) => {
    const result = results.find(r => r.platformId === platformId);
    if (!result) {
      toast({
        title: "无法收藏",
        description: "没有可收藏的内容",
        variant: "destructive"
      });
      return;
    }

    let content = '';
    let versionTitle = '';

    // 如果指定了版本ID，收藏特定版本
    if (versionId && result.versions) {
      const version = result.versions.find(v => v.id === versionId);
      if (version) {
        content = version.content;
        versionTitle = ` - ${version.title}`;
      }
    } else if (result.content) {
      // 收藏主内容
      content = result.content;
    } else if (result.versions && result.versions.length > 0) {
      // 如果没有主内容，收藏第一个版本
      content = result.versions[0].content;
      versionTitle = ` - ${result.versions[0].title}`;
    }

    if (!content) {
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
      content,
      platformName: platformId + versionTitle,
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
    let content = '';

    // 支持版本内容和主内容
    if (result?.content) {
      content = result.content;
    } else if (result?.versions && result.versions.length > 0) {
      content = result.versions[0].content; // 使用第一个版本
    }

    if (!content) {
      toast({
        title: "无法发布",
        description: "没有可发布的内容",
        variant: "destructive"
      });
      return;
    }
    setPendingPublish({ platformId, content });
    setPublishDialogOpen(true);
  };

  /**
   * 版本特定的发布函数
   * @param platformId 平台ID
   * @param versionId 版本ID
   */
  const handleVersionPublish = (platformId: string, versionId: string) => {
    const result = results.find(r => r.platformId === platformId);
    if (!result?.versions) {
      toast({
        title: "无法发布",
        description: "没有可发布的内容",
        variant: "destructive"
      });
      return;
    }

    const version = result.versions.find(v => v.id === versionId);
    if (!version?.content) {
      toast({
        title: "无法发布",
        description: "没有可发布的内容",
        variant: "destructive"
      });
      return;
    }

    setPendingPublish({ platformId, content: version.content });
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
      // 使用统一的 API 模块
      const response = await request.post('/api/translate', {
        text: content,
        targetLang: 'en',
        sourceLang: 'zh'
      });

      return response.translatedText || content;
    } catch (error) {
      console.error('Translation API error:', error);
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
    if (!checkUsageAndShowReminder()) return;
    
    const platformResult = results.find(r => r.platformId === platformId);
    if (!platformResult) return;

    // 更新状态为重新生成中
    const updatedResults = [...results];
    const resultIndex = updatedResults.findIndex(r => r.platformId === platformId);
    if (resultIndex === -1) return;

    updatedResults[resultIndex].steps = [
      { status: 'loading', message: '重新生成中...' },
      { status: 'loading', message: '构建提示词...' },
      { status: 'loading', message: '调用AI服务...' },
      { status: 'loading', message: '处理响应...' }
    ];
    setResults([...updatedResults]);

    const updateStep = (stepIndex: number, status: "waiting" | "loading" | "completed" | "error") => {
      const currentResults = [...results];
      if (currentResults[resultIndex]) {
        currentResults[resultIndex].steps[stepIndex].status = status;
        setResults([...currentResults]);
      }
    };

    try {
      // 步骤1: 开始重新生成
      updateStep(0, 'completed');
      
      // 步骤2: 构建提示词
      updateStep(1, 'loading');
      
      // 调用新的重新生成API
      const request: ContentAdaptationRequest = {
        originalContent: originalContent.trim(),
        platform: platformId,
        formId: selectedFormId,
        style: selectedStyle,
        charCount: platformSettings[platformId]?.charCount || getCharCountMax(platformId)
      };
      
      const response = await regenerateAdaptedContent(request);
      
      // 步骤3: 调用AI服务
      updateStep(2, 'completed');
      
      // 步骤4: 处理响应
      updateStep(3, 'loading');
      
      // 使用多维矩阵提示词系统重新生成
      const matrixPrompt = await generateMatrixPrompt(
        originalContent.trim(),
        platformId,
        selectedFormId,
        selectedStyle,
        platformSettings[platformId]?.charCount || getCharCountMax(platformId),
        customPrompt,
        useBrandLibrary
      );

      // 使用统一AI服务重新生成内容
      const aiResult = await callAI({
        prompt: matrixPrompt,
        model: selectedModel as any,
        systemPrompt: '你是一个专业的多维度内容创作专家，严格按照多维矩阵要求重新生成内容。',
        maxTokens: 2000,
        temperature: 0.9 // 重新生成时增加更多随机性
      });

      if (aiResult.success && aiResult.content) {
          // 验证字符数是否符合设定
          const targetCharCount = platformSettings[platformId]?.charCount || getCharCountMax(platformId);
          const actualCharCount = aiResult.content.length;
          const charCountDiff = Math.abs(actualCharCount - targetCharCount);
          const charCountTolerance = targetCharCount * 0.2; // 20%容差

          let finalContent = aiResult.content;
          let warningMessage = '重新生成完成';

          if (charCountDiff > charCountTolerance) {
            warningMessage = `重新生成完成 (字符数: ${actualCharCount}/${targetCharCount})`;
            console.warn(`平台${platformId}重新生成字符数偏差较大: 目标${targetCharCount}, 实际${actualCharCount}`);
          }

          // 更新结果
          const currentResults = [...results];
          if (currentResults[resultIndex]) {
            currentResults[resultIndex].content = finalContent;
            currentResults[resultIndex].source = 'ai';
            currentResults[resultIndex].error = undefined;
            currentResults[resultIndex].steps[3].status = 'completed';
            currentResults[resultIndex].steps[3].message = warningMessage;
            // 添加字符数信息
            currentResults[resultIndex].charCount = actualCharCount;
            currentResults[resultIndex].targetCharCount = targetCharCount;
          }
          setResults([...currentResults]);
      } else {
        throw new Error(aiResult.error || 'AI服务调用失败');
      }
    } catch (error) {
      console.error(`重新生成 ${platformId} 内容失败:`, error);
      
      const currentResults = [...results];
      if (currentResults[resultIndex]) {
        currentResults[resultIndex].error = error instanceof Error ? error.message : '重新生成失败';
        currentResults[resultIndex].steps.forEach(step => {
          if (step.status === 'loading') {
            step.status = 'error';
          }
        });
      }
      setResults([...currentResults]);
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
    // 只展示有内容的平台（包括版本内容）
    const available = results.filter(r => {
      return r.content || (r.versions && r.versions.length > 0 && r.versions[0].content);
    }).map(r => r.platformId);
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
      if (!result) return null;

      // 优先使用版本内容，如果没有版本则使用主内容
      let content = '';
      if (result.versions && result.versions.length > 0) {
        // 使用第一个版本的内容
        content = result.versions[0].content;
      } else if (result.content) {
        content = result.content;
      }

      return content ? { platformId: pid, content } : null;
    }).filter(Boolean) as { platformId: string; content: string }[];
    
    if (publishMode === 'api') {
      handleBatchApiPublish(batchSelectedPlatforms);
      setBatchPublishOpen(false);
    } else {
      // 批量复制所有内容并同时跳转到所有平台
      const allContent = queue.map(item => {
        const platformName = getPlatformName(item.platformId, platforms);
        return `【${platformName}】\n${item.content}`;
      }).join('\n\n---\n\n');

      // 复制合并后的内容到剪贴板
      navigator.clipboard.writeText(allContent);

      // 保存到历史记录
      const shareHistory: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
      queue.forEach(item => {
        shareHistory.unshift({
          id: Date.now().toString() + Math.random(),
          platformId: item.platformId,
          platformName: getPlatformName(item.platformId, platforms),
          content: item.content,
          time: new Date().toISOString()
        });
      });
      localStorage.setItem('shareHistory', JSON.stringify(shareHistory.slice(0, 50)));

      // 同时打开所有平台的发布页面
      queue.forEach(item => {
        const url = platformUrls[item.platformId];
        if (url) {
          window.open(url, '_blank');
        }
      });

      const platformNames = queue.map(item => getPlatformName(item.platformId, platforms)).join('、');

      toast({
        title: "批量转发成功",
        description: `已复制内容并跳转到 ${platformNames} 发布页面`,
      });

      setBatchPublishOpen(false);
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

  // 调用AI生成内容
  const callAIGenerate = async (prompt: string, platformId: string): Promise<string> => {
    try {
      // 使用统一的 AI API
      const result = await callAI({
        prompt,
        model: selectedModel as any, // 类型转换
        systemPrompt: `你是一个专业的${platformId}内容创作者，请根据用户的需求生成高质量的内容。`,
        temperature: 0.7,
        maxTokens: 1000
      });

      if (result.success) {
        return result.content;
      } else {
        throw new Error(result.error || 'AI生成失败');
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      throw error;
    }
  };

  // 生成对比内容
  const generateComparisonContent = async (platformId: string) => {
    if (!originalContent.trim()) {
      toast({
        title: "无原始内容",
        description: "请先输入原始内容",
        variant: "destructive"
      });
      return;
    }

    setGeneratingComparison(prev => new Set(prev).add(platformId));

    try {
      // 使用不同的内容策略生成对比版本
      const alternativeFormId = getAlternativeContentForm(platformId, selectedFormId);
      const alternativeStyle = getAlternativeStyle(selectedStyle || 'professional');

      // 使用多维矩阵提示词系统生成对比内容
      const matrixPrompt = await generateMatrixPrompt(
        originalContent.trim(),
        platformId,
        alternativeFormId,
        alternativeStyle,
        platformSettings[platformId]?.charCount || getCharCountMax(platformId),
        customPrompt,
        useBrandLibrary
      );

      // 使用统一AI服务生成对比内容
      const aiResult = await callAI({
        prompt: matrixPrompt,
        model: selectedModel as any,
        systemPrompt: '你是一个专业的多维度内容创作专家，请生成与主要版本不同风格的替代内容。',
        maxTokens: 2000,
        temperature: 0.9 // 增加随机性以获得不同的结果
      });

        if (aiResult.success && aiResult.content) {
          // 验证对比内容的字符数
          const targetCharCount = platformSettings[platformId]?.charCount || getCharCountMax(platformId);
          const actualCharCount = aiResult.content.length;
          const charCountDiff = Math.abs(actualCharCount - targetCharCount);
          const charCountTolerance = targetCharCount * 0.2; // 20%容差

          setComparisonContent(prev => ({
            ...prev,
            [platformId]: aiResult.content
          }));

          setShowComparison(prev => ({
            ...prev,
            [platformId]: true
          }));

          const successMessage = charCountDiff > charCountTolerance
            ? `已生成替代版本 (字符数: ${actualCharCount}/${targetCharCount})`
            : `已为${getPlatformName(platformId, platforms)}生成替代版本`;

          toast({
            title: "对比内容生成成功",
            description: successMessage,
          });
      } else {
        throw new Error(aiResult.error || '对比内容生成失败');
      }
    } catch (error) {
      console.error(`生成${platformId}对比内容失败:`, error);
      toast({
        title: "对比内容生成失败",
        description: error instanceof Error ? error.message : '生成对比内容时发生错误',
        variant: "destructive"
      });
    } finally {
      setGeneratingComparison(prev => {
        const newSet = new Set(prev);
        newSet.delete(platformId);
        return newSet;
      });
    }
  };

  // 获取替代内容形式
  const getAlternativeContentForm = (platformId: string, currentFormId?: string): string | undefined => {
    const platformAlternatives: Record<string, string[]> = {
      'douyin': ['comedy-reversal', 'drama-script', 'tutorial-guide'],
      'xiaohongshu': ['product-review', 'lifestyle-sharing', 'tutorial-guide'],
      'weibo': ['hot-topic', 'emotional-resonance', 'trend-opinion'],
      'zhihu': ['trend-opinion', 'emotional-resonance', 'deep-analysis'],
      'wechat': ['trend-opinion', 'deep-analysis', 'emotional-resonance'],
      'bilibili': ['drama-script', 'comedy-reversal', 'tutorial-guide']
    };

    const alternatives = platformAlternatives[platformId] || ['lifestyle-sharing', 'hot-topic'];
    return alternatives.find(alt => alt !== currentFormId) || alternatives[0];
  };

  // 获取替代风格
  const getAlternativeStyle = (currentStyle: StyleType): StyleType => {
    const styleAlternatives: Record<StyleType, StyleType> = {
      'professional': 'real',
      'funny': 'professional',
      'real': 'funny',
      'hook': 'professional'
    };
    return styleAlternatives[currentStyle] || 'real';
  };

  // 加载品牌库资料
  useEffect(() => {
    const loadBrandProfile = async () => {
      if (useBrandLibrary) {
        try {
          // 这里应该调用品牌库服务获取当前品牌档案
          // 暂时使用模拟数据
          const mockProfile = {
            name: '示例品牌',
            tone: '专业友好',
            keywords: ['创新', '品质', '服务'],
            forbiddenWords: ['便宜', '劣质'],
            values: ['用户至上', '持续创新'],
            slogans: ['品质成就未来'],
            targetAudience: ['年轻专业人士', '科技爱好者'],
            brandStory: ['专注技术创新', '服务用户需求'],
            competitiveAdvantage: ['技术领先', '服务优质']
          };
          setBrandProfile(mockProfile);
        } catch (error) {
          console.error('加载品牌档案失败:', error);
          setBrandProfile(null);
        }
      } else {
        setBrandProfile(null);
      }
    };

    loadBrandProfile();
  }, [useBrandLibrary]);



  // 获取平台特色和差异化要求
  const getPlatformCharacteristics = (platform: string): {
    tone: string;
    features: string[];
    contentStyle: string;
    interactionStyle: string;
  } => {
    const characteristics: Record<string, any> = {
      'douyin': {
        tone: '轻松有趣、节奏感强',
        features: ['短视频脚本格式', '音乐节拍配合', '视觉冲击力', '15-60秒时长'],
        contentStyle: '快节奏、高密度信息、强视觉效果',
        interactionStyle: '引导点赞、评论、转发，使用热门话题和挑战'
      },
      'xiaohongshu': {
        tone: '真实分享、种草推荐',
        features: ['个人体验感', '图片配文', '标签丰富', '实用性强'],
        contentStyle: '生活化、实用性、美学化表达',
        interactionStyle: '鼓励收藏、分享，使用emoji和话题标签'
      },
      'weibo': {
        tone: '简洁有力、热点敏感',
        features: ['140字精炼', '话题标签', '@用户互动', '转发评论'],
        contentStyle: '新闻性、时效性、观点鲜明',
        interactionStyle: '引发讨论、转发传播，关注热点话题'
      },
      'zhihu': {
        tone: '专业深度、逻辑清晰',
        features: ['长文深度', '专业术语', '数据支撑', '逻辑论证'],
        contentStyle: '知识性、专业性、思辨性强',
        interactionStyle: '引发思考、专业讨论，提供价值观点'
      },
      'wechat': {
        tone: '权威专业、深度解读',
        features: ['图文并茂', '深度内容', '专业表达', '价值输出'],
        contentStyle: '权威性、深度性、实用性',
        interactionStyle: '引导关注、分享转发，建立专业形象'
      },
      'bilibili': {
        tone: '年轻活力、创意十足',
        features: ['视频脚本', '弹幕互动', '二次元文化', '创意表达'],
        contentStyle: '娱乐性、创意性、互动性强',
        interactionStyle: '引导三连、弹幕互动，融入B站文化'
      }
    };

    return characteristics[platform] || {
      tone: '自然真实',
      features: ['内容适配'],
      contentStyle: '平台化表达',
      interactionStyle: '引导互动'
    };
  };

  // 多维矩阵提示词生成系统
  const generateMatrixPrompt = async (
    originalContent: string,
    platform: string,
    formId?: string,
    style?: StyleType,
    charCount?: number,
    customPromptText?: string,
    useBrand: boolean = false
  ): Promise<string> => {
    const dimensions: string[] = [];

    // 🔺 品牌库内容（最高优先级）
    if (useBrand && brandProfile) {
      const brandDimension = await generateBrandDimension(brandProfile, originalContent);
      dimensions.push(`【品牌维度 - 最高优先级】\n${brandDimension}`);
    }

    // ✅ 原始内容维度
    const contentDimension = generateContentDimension(originalContent, useBrand ? brandProfile : null);
    dimensions.push(`【原始内容维度】\n${contentDimension}`);

    // ✅ 目标平台维度
    const platformDimension = generatePlatformDimension(platform);
    dimensions.push(`【目标平台维度】\n${platformDimension}`);

    // ⭕ 内容形式维度
    if (formId) {
      const formDimension = generateContentFormDimension(formId);
      dimensions.push(`【内容形式维度】\n${formDimension}`);
    }

    // ⭕ 表达风格维度
    const styleDimension = generateStyleDimension(style, useBrand ? brandProfile : null);
    dimensions.push(`【表达风格维度】\n${styleDimension}`);

    // ⭕ 用户自定义维度
    if (customPromptText?.trim()) {
      const customDimension = generateCustomDimension(customPromptText);
      dimensions.push(`【用户自定义维度】\n${customDimension}`);
    }

    // ⭕ 字符数控制维度
    if (charCount) {
      const charDimension = generateCharCountDimension(charCount, platform);
      dimensions.push(`【字符数控制维度】\n${charDimension}`);
    }

    // ⭕ 格式化要求维度
    const formatDimension = generateFormatDimension(platform);
    dimensions.push(`【格式化要求维度】\n${formatDimension}`);

    // ⭕ 差异化维度（防止模板化）
    const differentiationDimension = generateDifferentiationDimension();
    dimensions.push(`【差异化维度】\n${differentiationDimension}`);

    // 组合所有维度
    const finalPrompt = `你是一位专业的多维度内容创作专家，请根据以下多维矩阵要求生成高质量内容：

${dimensions.join('\n\n')}

【优先级机制】
1. 品牌库 > 用户选择 > 平台默认
2. 维度越多，内容越个性化且具辨识度
3. 禁止静态模板，必须动态适应输入维度

【最终要求】
- 严格按照所有维度要求生成内容
- 确保内容具有强烈的差异化特色
- 避免模板化表达，每次生成都要有独特性
- 所有维度必须在最终内容中得到体现
- 直接输出最终内容，不要包含任何说明文字

请开始生成：`;

    return finalPrompt;
  };

  // 生成品牌维度
  const generateBrandDimension = async (profile: any, content: string): Promise<string> => {
    return `品牌调性覆盖所有默认设定，拥有最高权重：
- 品牌名称：${profile.name || '未设置'}
- 品牌语调：${profile.tone || '专业友好'}
- 品牌关键词：${profile.keywords?.join('、') || '暂无'}
- 禁用词汇：${profile.forbiddenWords?.join('、') || '无'}
- 品牌价值观：${profile.values?.join('、') || '暂无'}
- 品牌口号：${profile.slogans?.join('、') || '暂无'}
- 目标受众：${profile.targetAudience?.join('、') || '暂无'}
- 品牌故事要素：${profile.brandStory?.join('、') || '暂无'}
- 竞争优势：${profile.competitiveAdvantage?.join('、') || '暂无'}

要求：所有内容必须严格遵循品牌调性，避免公关风险，保持品牌形象一致性。`;
  };

  // 生成内容维度
  const generateContentDimension = (content: string, profile?: any): string => {
    const brandContext = profile ? `\n- 品牌背景融入：将品牌核心要素自然融入原始内容` : '';
    return `原始内容作为创作基础：
- 核心内容：${content}
- 内容类型：${content.length > 500 ? '长文内容' : content.length > 100 ? '中等内容' : '短文内容'}
- 关键信息提取：保持原始内容的核心价值和关键信息${brandContext}`;
  };

  // 生成平台维度
  const generatePlatformDimension = (platform: string): string => {
    const platformChar = getPlatformCharacteristics(platform);
    return `平台差异化要求（必须体现强烈平台特色）：
- 目标平台：${platform}
- 语调风格：${platformChar.tone}
- 内容风格：${platformChar.contentStyle}
- 互动方式：${platformChar.interactionStyle}
- 平台特征：${platformChar.features.join('、')}
- 用户习惯：符合${platform}用户的阅读和互动习惯
- 平台算法：适应${platform}的内容推荐机制`;
  };

  // 生成内容形式维度
  const generateContentFormDimension = (formId: string): string => {
    const contentForm = getContentFormById(formId);
    if (!contentForm) return '';

    return `内容形式结构要求：
- 形式名称：${contentForm.name}
- 形式描述：${contentForm.description}
- 输出类型：${contentForm.outputType}
- 内容特征：${contentForm.characteristics.join('、')}
- 结构要求：${contentForm.structure.join(' → ')}
- 格式规范：严格按照${contentForm.name}的标准结构输出`;
  };

  // 生成风格维度
  const generateStyleDimension = (style?: StyleType, profile?: any): string => {
    const styleMap = {
      'professional': '专业权威 - 用词准确、逻辑清晰、可信度高',
      'funny': '幽默风趣 - 轻松活泼、妙语连珠、娱乐性强',
      'real': '真实自然 - 贴近生活、真情实感、亲和力强',
      'hook': '吸引眼球 - 标题党风格、强烈冲击、引人注目'
    };

    // 如果没有选择风格，使用自然表达
    if (!style) {
      const brandOverride = profile ? `\n- 品牌风格覆盖：${profile.tone}风格为主导风格` : '';
      return `表达风格要求：
- 选择风格：自然表达 - 根据内容特点自然选择最合适的表达方式
- 风格特点：不强制特定风格，让内容本身决定最佳表达方式
- 语言特色：自然流畅、符合内容调性${brandOverride}`;
    }

    const brandOverride = profile ? `\n- 品牌风格覆盖：${profile.tone}风格优先于选择的${style}风格` : '';

    return `表达风格要求：
- 选择风格：${styleMap[style]}
- 风格特点：确保内容完全符合${style}风格的表达特征
- 语言特色：用词、句式、节奏都要体现${style}风格${brandOverride}`;
  };

  // 生成自定义维度
  const generateCustomDimension = (customText: string): string => {
    return `用户个性化要求：
- 自定义内容：${customText}
- 优先级：用户自定义要求具有高优先级
- 融合要求：将用户要求自然融入到内容中
- 创意发挥：在满足用户要求基础上进行创意扩展`;
  };

  // 生成字符数维度（使用新的配置系统）
  const generateCharCountDimension = (charCount: number, platformId: string): string => {
    const limits = getPlatformCharacterLimits(platformId);
    const charCountConfig = getCharCountByPreset(platformId, globalSettings.charCountPreset);
    const platformAdvice = getPlatformCharCountAdvice(platformId);

    // 使用配置系统的字符数要求
    const targetMin = charCountConfig.min;
    const targetMax = charCountConfig.max;
    const targetChar = charCountConfig.target;

    let description: string;
    switch (globalSettings.charCountPreset) {
      case 'mini':
        description = '精简版要求：内容简洁明了，重点突出';
        break;
      case 'standard':
        description = '标准版要求：内容详实完整，结构清晰';
        break;
      case 'detailed':
        description = '详细版要求：内容必须达到800字以上，丰富深入，信息全面';
        break;
      default:
        description = '自动适配：根据平台特性优化字符数';
    }

    return `字符数严格控制指令：
- 目标设置：${targetChar}字符（${description}）
- 必须范围：${targetMin} - ${targetMax}字符（绝对不能少于${targetMin}字符）
- 平台限制：最大${limits.maximum}字符（${limits.description}）
- 平台建议：${platformAdvice}
- 核心要求：生成的内容字符数必须达到${targetMin}字符以上，这是硬性要求
- 内容策略：通过以下方式确保达到目标字符数：
  * 增加具体案例和详细说明
  * 提供更多实用技巧和建议
  * 丰富背景信息和相关知识
  * 添加具体的操作步骤和注意事项
  * 包含更多细节描述和深入分析
- 验证指令：生成完成后必须检查字符数，如不足${targetMin}字符则继续补充内容
- 质量保证：在满足字符数要求的前提下确保内容质量和价值`;
  };

  // 生成格式化维度
  const generateFormatDimension = (platform: string): string => {
    const formatRequirements = {
      'xiaohongshu': 'emoji丰富、分段清晰、话题标签、视觉美观',
      'douyin': '短句为主、节奏感强、视觉提示、音乐配合提示',
      'weibo': '简洁明了、话题标签、@互动、转发引导',
      'zhihu': '逻辑清晰、分段明确、专业术语、数据支撑',
      'wechat': '图文并茂、标题醒目、段落分明、专业排版',
      'bilibili': '弹幕友好、分P提示、互动引导、二次元元素'
    };

    return `格式化和排版要求：
- 平台格式：${formatRequirements[platform as keyof typeof formatRequirements] || '标准格式'}
- 视觉效果：适当使用emoji、换行、分段提升可读性
- 互动元素：融入平台特有的互动方式和表达习惯
- 标签使用：合理使用话题标签和关键词标签`;
  };

  // 生成差异化维度
  const generateDifferentiationDimension = (): string => {
    const differentiationStrategies = [
      '使用同义词替换常见表达',
      '调整句式结构和段落顺序',
      '融入时下热点和流行元素',
      '采用独特的比喻和类比',
      '变换开头和结尾的表达方式',
      '加入个人化的观点和见解'
    ];

    const randomStrategies = differentiationStrategies
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return `防模板化差异化要求：
- 差异化策略：${randomStrategies.join('、')}
- 创新要求：避免使用常见的模板化表达
- 独特性：确保内容具有独特的表达方式和视角
- 随机性：在保持质量的前提下增加内容的随机性和新鲜感`;
  };

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

      {/* Content Creation Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">输入原始内容</h1>
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
        <Card>
        <CardContent>
          <div className="space-y-3">
            <MentionTextarea
              placeholder="在此输入您的原始内容，输入 @ 可快速引用品牌库、资料库、雷达收藏的内容..."
              className="min-h-[200px]"
              value={originalContent}
              onChange={setOriginalContent}
            />

            {/* 快速引用功能 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QuickReferenceSelector
                  multiSelect={true}
                  onSelect={(content) => {
                    // 在当前内容后追加引用内容
                    const newContent = originalContent ?
                      `${originalContent}\n\n${content}` :
                      content;
                    setOriginalContent(newContent);
                  }}
                />
                <span className="text-xs text-gray-500">
                  从品牌库、资料库、雷达收藏快速导入内容
                </span>
              </div>
            </div>
          </div>
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
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {contentCharCount} 字符
              </Badge>
            </div>
          </div>

        </CardContent>
        </Card>
      </div>

      {/* Platform Selection Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">选择目标平台</h1>
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
                  <h3 className="text-lg font-semibold">平台设置</h3>
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="global-settings-mode"
                          checked={settingsMode.charCount === 'global' && settingsMode.emoji === 'global' && settingsMode.mdFormat === 'global'}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSettingsModeToggle('global');
                            }
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="global-settings-mode" className="text-sm font-medium cursor-pointer flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          全局设置
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        {(settingsMode.charCount === 'platform' || settingsMode.emoji === 'platform' || settingsMode.mdFormat === 'platform') && (
                          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            已启用平台特定设置，全局设置已禁用
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 字符数限制 */}
                    <div className="mb-4">
                      <Label className={`text-sm font-medium flex items-center gap-2 mb-2 ${
                        settingsMode.charCount === 'platform' ? 'text-gray-400' : 'text-gray-700'
                      }`}>
                        <Hash className="h-3 w-3" />
                        字符数限制
                      </Label>
                      <Select
                        value={globalSettings.charCountPreset}
                        onValueChange={(value) => updateGlobalSetting('charCountPreset', value as 'auto' | 'mini' | 'standard' | 'detailed')}
                        disabled={settingsMode.charCount === 'platform'}
                      >
                        <SelectTrigger className={`h-9 max-w-xs ${
                          settingsMode.charCount === 'platform' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                        }`}>
                          <SelectValue placeholder="选择字符数限制" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">自动适配</SelectItem>
                          <SelectItem value="mini">精简版 (50-200字)</SelectItem>
                          <SelectItem value="standard">标准版 (200-800字)</SelectItem>
                          <SelectItem value="detailed">详细版 (800字+)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className={`text-xs mt-1 ${
                        settingsMode.charCount === 'platform' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {settingsMode.charCount === 'platform' ? '已禁用，使用平台特定设置' : '根据平台特点自动调整内容长度'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="global-emoji"
                          checked={globalSettings.globalEmoji}
                          onCheckedChange={(checked) => updateGlobalSetting('globalEmoji', !!checked)}
                          disabled={settingsMode.emoji === 'platform'}
                        />
                        <Label htmlFor="global-emoji" className={`text-sm cursor-pointer flex items-center ${
                          settingsMode.emoji === 'platform' ? 'text-gray-400' : ''
                        }`}>
                          <Smile className="h-3 w-3 mr-1" />
                          全局添加emoji表情
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="global-md"
                          checked={globalSettings.globalMd}
                          onCheckedChange={(checked) => updateGlobalSetting('globalMd', !!checked)}
                          disabled={settingsMode.mdFormat === 'platform'}
                        />
                        <Label htmlFor="global-md" className={`text-sm cursor-pointer flex items-center ${
                          settingsMode.mdFormat === 'platform' ? 'text-gray-400' : ''
                        }`}>
                          <FileText className="h-3 w-3 mr-1" />
                          全局MD格式
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="global-auto"
                          checked={globalSettings.globalAutoFormat}
                          onCheckedChange={(checked) => updateGlobalSetting('globalAutoFormat', checked)}
                          disabled={settingsMode.charCount === 'platform' || settingsMode.emoji === 'platform' || settingsMode.mdFormat === 'platform'}
                        />
                        <Label htmlFor="global-auto" className={`text-sm cursor-pointer flex items-center ${
                          settingsMode.charCount === 'platform' || settingsMode.emoji === 'platform' || settingsMode.mdFormat === 'platform'
                            ? 'text-gray-500'
                            : 'text-gray-700'
                        }`}>
                          <Hash className="h-3 w-3 mr-1" />
                          全局自动排版
                        </Label>
                      </div>
                    </div>
                  </div>



                  {/* 平台特定设置 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="platform-settings-mode"
                          checked={settingsMode.charCount === 'platform' && settingsMode.emoji === 'platform' && settingsMode.mdFormat === 'platform'}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSettingsModeToggle('platform');
                            }
                          }}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="platform-settings-mode" className="text-sm font-medium cursor-pointer flex items-center">
                          <Settings className="h-3 w-3 mr-1" />
                          平台特定设置
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        {(settingsMode.charCount === 'global' || settingsMode.emoji === 'global' || settingsMode.mdFormat === 'global') && (
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            已启用全局设置，平台特定设置已禁用
                          </div>
                        )}
                      </div>
                    </div>
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
                              {/* 字符数设置 - 智能推荐版本 */}
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <Label className={`text-xs ${
                                    settingsMode.charCount === 'global' ? 'text-gray-400' : ''
                                  }`}>
                                    字符数: {settings.charCount || getPlatformCharacterLimits(platformId).recommended}
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-5 px-2 text-xs"
                                      onClick={() => {
                                        const limits = getPlatformCharacterLimits(platformId);
                                        updatePlatformSetting(platformId, 'charCount', limits.recommended);
                                      }}
                                      disabled={settingsMode.charCount === 'global'}
                                    >
                                      推荐
                                    </Button>
                                    <span className={`text-xs ${
                                      settingsMode.charCount === 'global' ? 'text-gray-400' : 'text-muted-foreground'
                                    }`}>
                                      最大{getPlatformCharacterLimits(platformId).maximum}
                                    </span>
                                  </div>
                                </div>

                                <Slider
                                  value={[settings.charCount || getPlatformCharacterLimits(platformId).recommended]}
                                  min={50}
                                  max={getPlatformCharacterLimits(platformId).maximum}
                                  step={10}
                                  onValueChange={(value) => {
                                    const limits = getPlatformCharacterLimits(platformId);
                                    const newValue = Math.min(value[0], limits.maximum);
                                    updatePlatformSetting(platformId, 'charCount', newValue);
                                  }}
                                  className={`w-full ${
                                    settingsMode.charCount === 'global' ? 'opacity-50 pointer-events-none' : ''
                                  }`}
                                  disabled={settingsMode.charCount === 'global'}
                                />

                                {/* 字符数限制说明和警告 */}
                                {settingsMode.charCount !== 'global' && (
                                  <div className="mt-2 space-y-1">
                                    <div className="text-xs text-gray-600">
                                      {getPlatformCharacterLimits(platformId).description}
                                    </div>
                                    {(() => {
                                      const currentValue = settings.charCount || getPlatformCharacterLimits(platformId).recommended;
                                      const limits = getPlatformCharacterLimits(platformId);
                                      const safetyRange = calculateSafetyRange(currentValue, platformId);

                                      if (currentValue > limits.maximum) {
                                        return (
                                          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                            ⚠️ 超出平台最大限制！将自动调整为{limits.maximum}字符
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                            ✅ 安全区域：{safetyRange.min}-{safetyRange.max}字符（实际生成范围）
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>
                                )}

                                {settingsMode.charCount === 'global' && (
                                  <p className="text-xs text-gray-400 mt-1">已禁用，使用全局字符数设置</p>
                                )}
                              </div>

                              {/* 选项设置 */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${platformId}-emoji`}
                                    checked={settings.useEmoji}
                                    onCheckedChange={(checked) => updatePlatformSetting(platformId, 'useEmoji', !!checked)}
                                    disabled={settingsMode.emoji === 'global'}
                                  />
                                  <Label htmlFor={`${platformId}-emoji`} className={`text-xs cursor-pointer flex items-center ${
                                    settingsMode.emoji === 'global' ? 'text-gray-400' : ''
                                  }`}>
                                    <Smile className="h-3 w-3 mr-1" />
                                    emoji
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${platformId}-md`}
                                    checked={settings.useMdFormat}
                                    onCheckedChange={(checked) => updatePlatformSetting(platformId, 'useMdFormat', !!checked)}
                                    disabled={settingsMode.mdFormat === 'global'}
                                  />
                                  <Label htmlFor={`${platformId}-md`} className={`text-xs cursor-pointer flex items-center ${
                                    settingsMode.mdFormat === 'global' ? 'text-gray-400' : ''
                                  }`}>
                                    <FileText className="h-3 w-3 mr-1" />
                                    MD格式
                                  </Label>
                                </div>
                              </div>

                              {/* 全局设置禁用提示 */}
                              {(settingsMode.emoji === 'global' || settingsMode.mdFormat === 'global') && (
                                <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
                                  {settingsMode.emoji === 'global' && settingsMode.mdFormat === 'global'
                                    ? '已启用全局emoji和MD格式设置'
                                    : settingsMode.emoji === 'global'
                                    ? '已启用全局emoji设置'
                                    : '已启用全局MD格式设置'
                                  }
                                </div>
                              )}

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

        {/* Content Form Selection */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold mb-2">内容形式与表达风格</h3>
            <CardDescription>
              选择不同的内容形式和表达风格来获得最佳的内容生成效果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentFormSelector
              selectedFormId={selectedFormId}
              selectedStyle={selectedStyle}
              onFormChange={setSelectedFormId}
              onStyleChange={setSelectedStyle}
              selectedPlatforms={selectedPlatforms}
              useBrandLibrary={useBrandLibrary}
              customPrompt={customPrompt}
              onCustomPromptChange={setCustomPrompt}
            />
          </CardContent>
        </Card>
      </div>



      {/* 组合效果预览 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">组合效果预览</span>
          </div>
          <p className="text-sm text-gray-600">
            <strong>当前配置：</strong>
            原始内容
            {useBrandLibrary && ' + 品牌库'}
            {selectedPlatforms.length > 0 && ` + ${selectedPlatforms.map(id => getPlatformName(id, platforms)).join('、')}`}
            {selectedFormId && ` + ${getContentFormById(selectedFormId)?.name || '内容形式'}`}
            {selectedStyle && ` + ${getAvailableStyles().find(s => s.id === selectedStyle)?.name}`}
            {customPrompt.trim() && ' + 自定义要求'}
          </p>
        </CardContent>
      </Card>

      {/* AI模型选择 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            AI模型选择
          </h4>
          <p className="text-xs text-gray-500 mb-3">默认优先调用GPT-4o，备选deepseek v3模型，用户可自行选择自己喜欢的模型生成内容</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                    selectedModel === model.id
                      ? 'border-blue-500 bg-blue-50'
                      : disabled
                      ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleModelSelect(model.id, disabled)}
                >
                  <div className="flex items-start space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedModel === model.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedModel === model.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium text-blue-600 text-sm">{model.name}</span>
                        {badge && (
                          <Badge className="bg-gray-200 text-gray-600 text-xs">{badge}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{model.description}</p>
                      {showUpgradeTip && (
                        <div
                          className="mt-1 p-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 cursor-pointer hover:bg-yellow-100 transition-colors"
                          onClick={handleUpgradeClick}
                        >
                          <span className="mr-1">🔒</span>
                          去解锁高级功能
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
              <p className="font-medium">当前选择：{getModelInfo(selectedModel)?.name}</p>
              <p>{getModelInfo(selectedModel)?.description}</p>
            </div>
          )}

          {/* 开发环境订阅等级切换 */}
          {import.meta.env.DEV && (
            <div className="mt-3 flex gap-2 items-center">
              <span className="text-xs text-gray-500">开发环境订阅等级：</span>
              <Button size="sm" variant={userPlan==='trial'?'default':'outline'} onClick={()=>setUserPlan('trial')}>免费版</Button>
              <Button size="sm" variant={userPlan==='pro'?'default':'outline'} onClick={()=>setUserPlan('pro')}>专业版</Button>
              <Button size="sm" variant={userPlan==='premium'?'default':'outline'} onClick={()=>setUserPlan('premium')}>高级版</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI模型说明 - 完全隐藏，简化界面 */}
      {false && selectedModelDescription && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 mb-3">模型详细说明</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-gray-500 min-w-[60px]">特点：</span>
                    <span className="text-xs text-gray-700">{selectedModelDescription.features}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-gray-500 min-w-[60px]">场景：</span>
                    <span className="text-xs text-gray-700">{selectedModelDescription.scenarios}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-gray-500 min-w-[60px]">风格：</span>
                    <span className="text-xs text-gray-700">{selectedModelDescription.style}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-gray-500 min-w-[60px]">速度：</span>
                    <span className="text-xs text-gray-700">{selectedModelDescription.speed}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">平台适配结果</h1>
                {/* 网络状态指示器 */}
                {networkStatus === 'offline' && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs">
                      <span>🚫</span>
                      <span>网络断开</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={runNetworkDiagnostic}
                      className="h-6 px-2 text-xs"
                    >
                      诊断
                    </Button>
                  </div>
                )}
                {networkStatus === 'slow' && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs">
                      <span>🐌</span>
                      <span>网络较慢</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={runNetworkDiagnostic}
                      className="h-6 px-2 text-xs"
                    >
                      诊断
                    </Button>
                  </div>
                )}
                {networkStatus === 'online' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                    <span>🌐</span>
                    <span>网络正常</span>
                  </div>
                )}
              </div>




            </div>
          </div>



          <Tabs defaultValue={results[0]?.platformId} className="w-full">
            <TabsList className="mb-6 flex w-full h-auto p-1 bg-muted rounded-lg overflow-x-auto">
              {results.map(result => (
                <TabsTrigger
                  key={result.platformId}
                  value={result.platformId}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap min-w-fit"
                >
                  {getPlatformIcon(result.platformId)}
                  <span className="hidden sm:inline">
                    {getPlatformName(result.platformId, platforms)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {results.map(result => (
              <TabsContent key={result.platformId} value={result.platformId}>
                <Card
                  className="p-3 sm:p-4 lg:p-5 shadow-lg border-2 bg-white"
                  data-testid="platform-card"
                  data-platform-id={result.platformId}
                >
                  <CardHeader className="pb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getPlatformIcon(result.platformId)}
                        <h2 className="text-xl font-semibold" data-testid="platform-name">{getPlatformName(result.platformId, platforms)}</h2>

                        {/* 内联状态显示 */}
                        {generating && !result.content && !result.error && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center animate-spin text-xs">
                              ⟳
                            </div>
                            <span className="text-sm text-blue-600">正在生成...</span>
                          </div>
                        )}

                        {result.error && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✗</span>
                            </div>
                            <span className="text-sm text-red-600">生成失败</span>
                          </div>
                        )}

                        {(result.content || (result.versions && result.versions.length > 0)) && !result.error && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-sm text-green-600">生成完成</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* 详细错误信息 */}
                    {result.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-sm text-red-700">{result.error}</div>
                      </div>
                    )}
                    
                    {/* Generated Content */}
                    <div className="space-y-4">
                      {/* 内容展示区域标题 */}
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {result.versions && result.versions.length > 1 ? '多版本生成结果' : '生成结果'}
                        </h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
                        {result.versions && result.versions.length > 1 && (
                          <p className="text-sm text-gray-600 mt-1">已生成{result.versions.length}个不同风格版本，请选择您喜欢的内容</p>
                        )}
                      </div>
                      
                      {/* 主要内容区域 */}
                      {result.versions && result.versions.length > 1 ? (
                        /* 多版本左右对比展示 */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
                          {/* 版本A - 左侧 */}
                          <div className="flex flex-col h-full">
                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <h4 className="text-lg font-semibold text-gray-900">版本A (标准风格)</h4>
                            </div>
                            {result.versions[0] && (
                              <div className="flex flex-col flex-1 space-y-2">
                                {editingVersion?.platformId === result.platformId && editingVersion?.versionId === 'version-a' ? (
                                  <div className="space-y-3">
                                    <Textarea
                                      value={result.versions[0].content}
                                      onChange={(e) => {
                                        setResults(current =>
                                          current.map(r =>
                                            r.platformId === result.platformId
                                              ? {
                                                  ...r,
                                                  versions: r.versions?.map(v =>
                                                    v.id === 'version-a'
                                                      ? { ...v, content: e.target.value, charCount: e.target.value.length }
                                                      : v
                                                  )
                                                }
                                              : r
                                          )
                                        );
                                      }}
                                      className="min-h-[300px] text-base leading-relaxed"
                                      placeholder="编辑版本A内容..."
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveVersionEdit(result.platformId, 'version-a', result.versions![0].content)}
                                      >
                                        保存
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingVersion(null)}
                                      >
                                        取消
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className={`whitespace-pre-wrap rounded-lg border-2 p-6 overflow-auto max-h-[600px] text-base leading-relaxed shadow-sm relative ${
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
                                    <div className="absolute top-4 right-4">
                                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                                        版本A
                                      </div>
                                    </div>
                                    <div data-testid="version-a-content">{result.versions[0].content}</div>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border">
                                    <span className="font-medium">版本A</span>
                                    <span className="font-medium text-blue-600">{result.versions[0].charCount}字</span>
                                  </div>
                                  {/* 字符数验证信息 */}
                                  {result.versions[0].validation && (
                                    <div className={`text-xs px-3 py-2 rounded-lg border ${
                                      result.versions[0].validation.isValid
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                    }`}>
                                      {result.versions[0].validation.warning ? (
                                        <div className="flex items-center gap-1">
                                          <span>⚠️</span>
                                          <span>{result.versions[0].validation.warning}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <span>✅</span>
                                          <span>字符数在安全范围内 ({result.versions[0].validation.targetRange.min}-{result.versions[0].validation.targetRange.max})</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => regenerateVersion(result.platformId, 'version-a')}
                                    disabled={regeneratingVersions.has(`${result.platformId}-version-a`)}
                                  >
                                    <RefreshCw className={`h-4 w-4 mr-1 ${regeneratingVersions.has(`${result.platformId}-version-a`) ? 'animate-spin' : ''}`} />
                                    {regeneratingVersions.has(`${result.platformId}-version-a`) ? '生成中...' : '重新生成'}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditVersion(result.platformId, 'version-a')}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    {editingVersion?.platformId === result.platformId && editingVersion?.versionId === 'version-a' ? '取消编辑' : '编辑'}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleFavorite(result.platformId, 'version-a')}
                                  >
                                    <Heart className="h-4 w-4 mr-1" />
                                    收藏
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(result.versions![0].content)}
                                  >
                                    <Copy className="h-4 w-4 mr-1" />
                                    一键复制
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleVersionPublish(result.platformId, 'version-a')}
                                    disabled={publishingPlatforms.has(result.platformId)}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    {publishingPlatforms.has(result.platformId)
                                      ? '发布中...'
                                      : publishMode === 'api'
                                        ? 'API直发'
                                        : '立刻发布'
                                    }
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 版本B - 右侧 */}
                          <div className="flex flex-col h-full">
                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                              <Sparkles className="h-4 w-4 text-purple-500" />
                              <h4 className="text-lg font-semibold text-gray-900">版本B (创意风格)</h4>
                            </div>
                            {result.versions[1] && (
                              <div className="flex flex-col flex-1 space-y-2">
                                {editingVersion?.platformId === result.platformId && editingVersion?.versionId === 'version-b' ? (
                                  <div className="space-y-3">
                                    <Textarea
                                      value={result.versions[1].content}
                                      onChange={(e) => {
                                        setResults(current =>
                                          current.map(r =>
                                            r.platformId === result.platformId
                                              ? {
                                                  ...r,
                                                  versions: r.versions?.map(v =>
                                                    v.id === 'version-b'
                                                      ? { ...v, content: e.target.value, charCount: e.target.value.length }
                                                      : v
                                                  )
                                                }
                                              : r
                                          )
                                        );
                                      }}
                                      className="min-h-[300px] text-base leading-relaxed"
                                      placeholder="编辑版本B内容..."
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveVersionEdit(result.platformId, 'version-b', result.versions![1].content)}
                                      >
                                        保存
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingVersion(null)}
                                      >
                                        取消
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className={`whitespace-pre-wrap rounded-lg border-2 p-6 overflow-auto max-h-[600px] text-base leading-relaxed shadow-sm relative ${
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
                                    <div className="absolute top-4 right-4">
                                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                                        版本B
                                      </div>
                                    </div>
                                    <div data-testid="version-b-content">{result.versions[1].content}</div>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border">
                                    <span className="font-medium">版本B</span>
                                    <span className="font-medium text-purple-600">{result.versions[1].charCount}字</span>
                                  </div>
                                  {/* 字符数验证信息 */}
                                  {result.versions[1].validation && (
                                    <div className={`text-xs px-3 py-2 rounded-lg border ${
                                      result.versions[1].validation.isValid
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                    }`}>
                                      {result.versions[1].validation.warning ? (
                                        <div className="flex items-center gap-1">
                                          <span>⚠️</span>
                                          <span>{result.versions[1].validation.warning}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <span>✅</span>
                                          <span>字符数在安全范围内 ({result.versions[1].validation.targetRange.min}-{result.versions[1].validation.targetRange.max})</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => regenerateVersion(result.platformId, 'version-b')}
                                    disabled={regeneratingVersions.has(`${result.platformId}-version-b`)}
                                  >
                                    <RefreshCw className={`h-4 w-4 mr-1 ${regeneratingVersions.has(`${result.platformId}-version-b`) ? 'animate-spin' : ''}`} />
                                    {regeneratingVersions.has(`${result.platformId}-version-b`) ? '生成中...' : '重新生成'}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditVersion(result.platformId, 'version-b')}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    {editingVersion?.platformId === result.platformId && editingVersion?.versionId === 'version-b' ? '取消编辑' : '编辑'}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleFavorite(result.platformId, 'version-b')}
                                  >
                                    <Heart className="h-4 w-4 mr-1" />
                                    收藏
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(result.versions![1].content)}
                                  >
                                    <Copy className="h-4 w-4 mr-1" />
                                    一键复制
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleVersionPublish(result.platformId, 'version-b')}
                                    disabled={publishingPlatforms.has(result.platformId)}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    {publishingPlatforms.has(result.platformId)
                                      ? '发布中...'
                                      : publishMode === 'api'
                                        ? 'API直发'
                                        : '立刻发布'
                                    }
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* 单版本展示 */
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
                              <div className="space-y-3">
                                <div className={`whitespace-pre-wrap rounded-lg border-2 p-6 overflow-auto max-h-[600px] text-base leading-relaxed shadow-sm relative ${
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
                                  {/* 平台标识 - 只保留在右上角 */}
                                  <div className="absolute top-4 right-4">
                                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                                      {getPlatformName(result.platformId, platforms)}
                                    </div>
                                  </div>
                                  {typeof result.content === 'string' ? result.content : JSON.stringify(result.content)}
                                </div>
                                {/* 字符数信息 - 移动到底部 */}
                                {result.content && (
                                  <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border">
                                    <span className="font-medium">{getPlatformName(result.platformId, platforms)}</span>
                                    <div className={`flex items-center gap-2 font-medium ${
                                      (result as any).charCount && (result as any).targetCharCount &&
                                      Math.abs((result as any).charCount - (result as any).targetCharCount) > (result as any).targetCharCount * 0.2
                                        ? 'text-orange-600'
                                        : 'text-green-600'
                                    }`}>
                                      <span>{result.content.length}</span>
                                      {(result as any).targetCharCount && (
                                        <>
                                          <span>/</span>
                                          <span>{(result as any).targetCharCount}</span>
                                        </>
                                      )}
                                      <span>字符</span>
                                    </div>
                                  </div>
                                )}
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
                            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                              {isGenerating ? (
                                <InlineLoadingAnimation message="AI正在为您生成精彩内容..." />
                              ) : (
                                <div className="p-12 flex items-center justify-center">
                                  <p className="text-muted-foreground text-lg">生成的内容将显示在这里...</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}

                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>



        </div>
      )}

      {/* 自动化转发区域 - 独立的主要功能区域 */}
      {results.length > 0 && (
        <div className="mt-8">
          <AutomationUI
            availablePlatforms={results.map(result => {
              // 获取内容长度 - 优先使用主内容，然后是版本内容
              let contentLength = 0;
              if (result.content) {
                contentLength = result.content.length;
              } else if (result.versions && result.versions.length > 0) {
                // 使用第一个版本的内容长度
                contentLength = result.versions[0].content?.length || 0;
              }

              return {
                id: result.platformId,
                name: getPlatformName(result.platformId, platforms),
                hasContent: !!(result.content || (result.versions && result.versions.length > 0)),
                contentLength
              };
            })}
            onStartAutomation={handleStartAutomation}
            onCancelAutomation={handleCancelAutomation}
            onRetryPlatform={handleRetryPlatform}
            progress={automationProgress}
            isRunning={automationRunning}
            onBatchPublish={handleBatchPublish}
          />
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

          {/* 全选/全不选按钮 */}
          <div className="flex gap-2 mt-3 mb-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const availablePlatforms = results.filter(r => r.content).map(r => r.platformId);
                setBatchSelectedPlatforms(availablePlatforms);
              }}
            >
              全选
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBatchSelectedPlatforms([])}
            >
              全不选
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {results.filter(r => r.content).map(r => (
              <Button
                key={r.platformId}
                variant={batchSelectedPlatforms.includes(r.platformId) ? 'default' : 'outline'}
                onClick={() => setBatchSelectedPlatforms(prev => prev.includes(r.platformId) ? prev.filter(p => p !== r.platformId) : [...prev, r.platformId])}
                className="flex items-center gap-2"
              >
                {getPlatformIcon(r.platformId)}
                {getPlatformName(r.platformId, platforms)}
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
          <p>内容已复制到剪贴板，是否跳转到 {batchCurrent ? getPlatformName(batchCurrent.platformId, platforms) : ''} 发布页？</p>
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

      {/* 全屏加载动画 */}
      <LoadingAnimation
        isVisible={isGenerating && (generateMode === 'multi' || generateMode === 'batch')}
        message="AI正在为多个平台生成精彩内容，请稍候..."
      />
    </div>
  );
}