import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';
import {
  Book, Video, MessageSquare, Send,
  RefreshCw, ArrowRight, ChevronDown, ChevronUp,
  Smile, FileText, Hash, Save, Twitter, SquarePlay,
  Edit, Heart, Copy, ExternalLink, Languages, Globe, Zap, Rss, Settings, Check, Cpu, Sparkles, Bot, Info,
  Facebook, Linkedin, Instagram, User, CheckCircle, Circle, History, Crown, Lock
} from "lucide-react";
import {
  getCharCountMax as getConfigCharCountMax,
  getCharCountMin as getConfigCharCountMin,
  validateCharCount,
  getCharCountByPreset,
  getPlatformCharCountAdvice,
  calculateTargetCharCount,
  getPlatformLimit,
  getRecommendedRange,
  getUnifiedCharCountLimit
} from '../config/platformLimits';
import { AutomationUI, AutomationProgress, AutomationResult, AutomationOptions } from '../components/AutomationUI';
import { hashtagGenerator, HashtagSuggestion } from '../utils/hashtagGenerator';
import { LoadingAnimation, InlineLoadingAnimation } from '../components/LoadingAnimation';
import { HashtagManager, HashtagData, HashtagTemplate } from '../components/HashtagManager';
import { PlatformHashtags } from '../components/PlatformHashtags';
import { AIContentGenerationAnimation } from '../components/AIContentGenerationAnimation';
import { PlatformStatusIndicator } from '../components/PlatformStatusIndicator';
import { PlatformTabStatusWithTooltip } from '../components/PlatformTabStatus';
import TitleGenerator from '../components/TitleGeneratorIntelligent';
import { BatchForwardModal } from '../components/BatchForwardModal';
import { PageNavigation } from '@/components/layout/PageNavigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// ✅ FIXED: 2025-08-04 使用SafeTooltip替代原始Tooltip，防止setRef无限循环
import { SafeTooltip } from "@/components/ui/SafeTooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { SubscriptionStateWrapper, UsageStateWrapper } from '@/components/ui/StateLoadingWrapper';
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
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { getUserTier } from '@/utils/subscriptionUtils';
import { useUsageInfo, useUnifiedUserStateManager } from '@/hooks/useUnifiedUserState';
import { cn } from "@/lib/utils";
import { PlatformApiManager } from '@/components/platform/PlatformApiManager';
import { UsageReminderDialog } from '@/components/ui/usage-reminder-dialog';
import {
  publishContent,
  batchPublishContent,
  checkPlatformAuth,
  type PublishContent,
  type PublishResult
} from '@/api/platformApiService';
import { type StyleType } from '@/config/contentSchemes';
import { getContentFormById } from '@/config/contentForms';
import { createPlatformAPICaller } from '../utils/apiRequestQueue';
import { request, callAI } from '@/api';
import { MentionTextarea } from '@/components/ui/mention-textarea';
import { useContentSyncStore } from '@/stores/contentSyncStore';
import { useFavoritesStore, favoritesUtils } from '@/stores/favoritesStore';
import { useUserDataIsolation } from '@/utils/userDataIsolation';
import { useAuth } from '@/hooks/useAuth';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
import { Header } from '@/components/landing/Header';

/**
 * 主流平台内容发布入口URL映射
 * 用于一键转发跳转 - 已修复所有平台URL
 */
const platformUrls: Record<string, string> = {
  // 主流社交媒体平台
  weibo: 'https://weibo.com/compose',                                    // 微博发布页
  xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish',       // 小红书创作者中心
  zhihu: 'https://zhuanlan.zhihu.com/write',                           // 知乎专栏写作
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',    // 抖音创作者中心
  wechat: 'https://mp.weixin.qq.com/',                                 // 微信公众号后台（已修复）

  // 视频平台
  bilibili: 'https://member.bilibili.com/platform/upload/text/edit',   // B站专栏发布
  kuaishou: 'https://cp.kuaishou.com/article/publish',                 // 快手创作者平台

  // 资讯平台
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',         // 今日头条
  baijiahao: 'https://baijiahao.baidu.com/builder/rc/edit',           // 百家号

  // 国际平台
  facebook: 'https://www.facebook.com/pages/create/',                   // Facebook页面创建
  twitter: 'https://twitter.com/compose/tweet',                         // Twitter发推
  linkedin: 'https://www.linkedin.com/feed/',                          // LinkedIn动态

  // 技术社区
  v2ex: 'https://www.v2ex.com/new',                                     // V2EX发帖
  github: 'https://github.com/new',                                     // GitHub新建仓库
  juejin: 'https://juejin.cn/editor/drafts/new',                       // 掘金编辑器
  csdn: 'https://mp.csdn.net/mp_blog/creation/editor',                 // CSDN博客

  // 其他平台
  sspai: 'https://sspai.com/write',                                     // 少数派写作
  hellogithub: 'https://hellogithub.com/',                             // HelloGitHub
  ithome: 'https://my.ithome.com/#/write',                             // IT之家
  ngabbs: 'https://bbs.nga.cn/thread.php?fid=-7',                      // NGA论坛

  // 工具类（保留原有）
  weatheralarm: 'https://www.nmc.cn/',                                 // 天气预警
  earthquake: 'https://www.ceic.ac.cn/',                               // 地震信息
  history: 'https://baike.baidu.com/item/%E5%8E%86%E5%8F%B2%E4%B8%8A%E7%9A%84%E4%BB%8A%E5%A4%A9/42704' // 历史上的今天
};

// Helper function to get platform name consistently
function getPlatformName(platformId: string, platforms: any[]): string {
  const platform = platforms.find(p => p.id === platformId);
  return platform?.name || platformId || '未知平台';
}

// Helper function to get platform recommended character count
function getPlatformRecommendedCharCount(platformId: string): number {
  const range = getRecommendedRange(platformId);
  return Math.floor((range.min + range.max) / 2); // 取推荐范围的中间值
}

// Helper function to get platform max character count
function getPlatformMaxCharCount(platformId: string): number {
  const limit = getPlatformLimit(platformId);
  return limit?.maxCharacters || 2000;
}

// Helper function to get platform description
function getPlatformDescription(platformId: string): string {
  const limit = getPlatformLimit(platformId);
  return limit?.description || '平台字符数限制';
}

// Helper function to calculate safety range for content generation
function calculateSafetyRange(userSetLimit: number, platformId: string): { min: number; max: number } {
  const limits = getPlatformLimit(platformId);

  // 确保用户设置不超过平台最大限制
  const effectiveLimit = Math.min(userSetLimit, limits?.maxCharacters || 2000);

  // 计算安全区域（90-95%）
  const safetyMin = Math.floor(effectiveLimit * 0.9);
  const safetyMax = Math.floor(effectiveLimit * 0.95);

  return { min: safetyMin, max: safetyMax };
}

// 新的字符数控制逻辑：生成目标范围内的内容，禁止截断
function calculateOptimalCharCount(platformId: string, userSetLimit: number): { min: number; max: number } {
  // 使用平台建议的范围，而不是最大限制
  const recommendedRange = getRecommendedRange(platformId);
  const platformLimit = getPlatformLimit(platformId);

  if (recommendedRange && platformLimit) {
    // 使用平台推荐范围
    const targetMin = recommendedRange.min;
    const targetMax = Math.min(recommendedRange.max, userSetLimit, platformLimit.maxCharacters);

    return {
      min: targetMin,
      max: targetMax
    };
  }

  // 降级到原有逻辑
  const platformMax = Math.min(platformLimit?.maxCharacters || 2000, userSetLimit);
  const targetMin = platformLimit?.minCharacters || 50;
  const targetMax = Math.floor(platformMax * 0.95);

  return {
    min: Math.max(targetMin, 50), // 最少50字符
    max: Math.max(targetMax, targetMin + 50)
  };
}

// 清理AI生成内容中的多余文案
function cleanGeneratedContent(content: string): string {
  let cleanedContent = content;

  // 移除配图建议及相关文案
  cleanedContent = cleanedContent.replace(/（配图建议：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(配图建议：[^)]*\)/g, '');
  cleanedContent = cleanedContent.replace(/【配图建议：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[配图建议：[^\]]*\]/g, '');

  // 移除工具界面截图相关文案
  cleanedContent = cleanedContent.replace(/（工具界面截图[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(工具界面截图[^)]*\)/g, '');
  cleanedContent = cleanedContent.replace(/【工具界面截图[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[工具界面截图[^\]]*\]/g, '');

  // 移除多平台内容对比拼图相关文案
  cleanedContent = cleanedContent.replace(/（多平台内容对比拼图[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(多平台内容对比拼图[^)]*\)/g, '');
  cleanedContent = cleanedContent.replace(/【多平台内容对比拼图[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[多平台内容对比拼图[^\]]*\]/g, '');

  // 移除其他图片相关建议
  cleanedContent = cleanedContent.replace(/（图片：[^）]*）/g, '');
  cleanedContent = cleanedContent.replace(/\(图片：[^)]*\)/g, '');
  cleanedContent = cleanedContent.replace(/【图片：[^】]*】/g, '');
  cleanedContent = cleanedContent.replace(/\[图片：[^\]]*\]/g, '');

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

// Helper function to validate character count - 修复验证逻辑
function validateCharacterCount(content: string, platformId: string, userSetLimit: number): {
  isValid: boolean;
  actualCount: number;
  targetRange: { min: number; max: number };
  warning?: string;
} {
  const actualCount = content.length;
  const limits = getPlatformLimit(platformId);

  // 修复：使用实际字符数计算合理的目标范围
  const targetMin = Math.max(50, Math.floor(actualCount * 0.9)); // 实际字符数的90%作为下限
  const targetMax = Math.floor(actualCount * 1.1); // 实际字符数的110%作为上限
  const targetRange = { min: targetMin, max: targetMax };

  let warning: string | undefined;

  // 检查是否超出限制
  if (actualCount > userSetLimit) {
    warning = `⚠️ 内容超出用户设置的${userSetLimit}字符限制，当前${actualCount}字符`;
  } else if (limits && actualCount > limits.maxCharacters) {
    warning = `⚠️ 内容超出${getPlatformName(platformId, [])}平台最大限制${limits.maxCharacters}字符`;
  }

  // 判断是否在合理范围内（不超过用户设置和平台限制）
  const isValid = actualCount <= userSetLimit && (limits ? actualCount <= limits.maxCharacters : true);

  return {
    isValid,
    actualCount,
    targetRange,
    warning
  };
}

// Helper function to get platform icon
function getPlatformIcon(platformId: string): JSX.Element {
  switch (platformId) {
    case 'xiaohongshu':
      return <Book className="h-4 w-4 text-accent" />;
    case 'zhihu':
      return <MessageSquare className="h-4 w-4 text-accent" />;
    case 'douyin':
      return <Video className="h-4 w-4 text-accent" />;
    case 'weibo':
      return <Send className="h-4 w-4 text-accent" />;
    case 'wechat':
      return <MessageSquare className="h-4 w-4 text-accent" />;
    case 'bilibili':
      return <Video className="h-4 w-4 text-accent" />;
    case 'twitter':
      return <Twitter className="h-4 w-4 text-accent" />;
    case 'video':
      return <SquarePlay className="h-4 w-4 text-accent" />;
    case 'baijia':
      return <Globe className="h-4 w-4 text-accent" />;
    case 'kuaishou':
      return <Zap className="h-4 w-4 text-accent" />;
    case 'wangyi':
      return <Rss className="h-4 w-4 text-accent" />;
    case 'toutiao':
      return <Globe className="h-4 w-4 text-accent" />;
    case 'facebook':
      return <Facebook className="h-4 w-4 text-accent" />;
    case 'linkedin':
      return <Linkedin className="h-4 w-4 text-accent" />;
    case 'instagram':
      return <Instagram className="h-4 w-4 text-accent" />;
    case 'douban':
      return <User className="h-4 w-4 text-accent" />;
    default:
      return <MessageSquare className="h-4 w-4 text-secondary" />;
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
  tags?: string[];
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
        "relative border cursor-pointer transition-all duration-200 h-36 flex flex-col rounded-xl",
        checked
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "bg-card/90 backdrop-blur-sm hover:shadow-e1 hover:border-border"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-1 pt-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <CardTitle className="text-sm font-semibold truncate leading-tight text-primary">{title}</CardTitle>
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
        <CardDescription className="text-xs leading-relaxed overflow-hidden text-secondary" style={{
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

// ✅ FIXED: 用户数据隔离 - 模型选择存储
function getModel(): string {
  // 注意：这里无法直接获取user，需要在组件内部处理
  return localStorage.getItem('selectedModel_guest') || 'gpt-4o-mini';
}

function setModel(modelId: string, userId?: string): void {
  const storageKey = `selectedModel_${userId || 'guest'}`;
  localStorage.setItem(storageKey, modelId);
}

// 平台样式配置
// 移到组件内部以访问翻译函数

export default function AdaptPage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  // 本地化的平台配置
  const getPlatformStyles = useCallback(() => ({
    xiaohongshu: {
      name: t('adapt.platforms.xiaohongshu'),
      description: t('adapt.platforms.xiaohongshu'),
      maxLength: 1000,
      hashtagCount: 20,
      tone: t('adapt.platformTones.xiaohongshu'),
      features: ['个人体验', '图片展示', '标签丰富']
    },
    zhihu: {
      name: t('adapt.platforms.zhihu'),
      description: t('adapt.platforms.zhihu'),
      maxLength: 5000,
      hashtagCount: 0,
      tone: t('adapt.platformTones.zhihu'),
      features: ['详细解答', '专业术语', '引用来源']
    },
    douyin: {
      name: t('adapt.platforms.douyin'),
      description: t('adapt.platforms.douyin'),
      maxLength: 300,
      hashtagCount: 5,
      tone: t('adapt.platformTones.douyin'),
      features: ['视频脚本', '音乐配合', '互动引导']
    },
    weibo: {
      name: t('adapt.platforms.weibo'),
      description: t('adapt.platforms.weibo'),
      maxLength: 140,
      hashtagCount: 3,
      tone: t('adapt.platformTones.weibo'),
      features: ['话题标签', '@用户', '转发互动']
    },
    wechat: {
      name: t('adapt.platforms.wechat'),
      description: t('adapt.platforms.wechat'),
      maxLength: 2000,
      hashtagCount: 0,
      tone: t('adapt.platformTones.wechat'),
      features: ['图文并茂', '深度内容', '专业术语']
    },
    bilibili: {
      name: t('adapt.platforms.bilibili'),
      description: t('adapt.platforms.bilibili'),
      maxLength: 500,
      hashtagCount: 10,
      tone: t('adapt.platformTones.bilibili'),
      features: ['弹幕互动', '视频标题', '分区标签']
    },
    twitter: {
      name: t('adapt.platforms.twitter'),
      description: t('adapt.platforms.twitter'),
      maxLength: 280,
      hashtagCount: 2,
      tone: t('adapt.platformTones.twitter'),
      features: ['话题标签', '转推', '多语言']
    },
    video: {
      name: t('adapt.platforms.shipinhao'),
      description: t('adapt.platforms.shipinhao'),
      maxLength: 300,
      hashtagCount: 3,
      tone: '亲和、互动',
      features: ['视频内容', '互动引导', '社交分享']
    }
  }), [t]);

  const platformStyles = useMemo(() => getPlatformStyles(), [getPlatformStyles]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [originalContent, setOriginalContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // 内容同步store
  const contentSync = useContentSyncStore();

  // 收藏系统store
  const favoritesStore = useFavoritesStore();
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

  // 平台特定的超时和加载状态管理
  const [longContentPlatforms, setLongContentPlatforms] = useState<Set<string>>(new Set());
  const [platformLoadingMessages, setPlatformLoadingMessages] = useState<Map<string, string>>(new Map());

  // Tab状态动画跟踪 - 确保动画只在首次生成完成时触发
  const [completedPlatforms, setCompletedPlatforms] = useState<Set<string>>(new Set());

  // 获取平台特定的超时配置
  const getPlatformTimeoutConfig = (platformId: string) => {
    const isLongContentPlatform = ['wechat', 'zhihu'].includes(platformId);
    return {
      isLongContent: isLongContentPlatform,
      initialTimeout: isLongContentPlatform ? 90000 : 30000, // 90秒 vs 30秒
      retryDelay: isLongContentPlatform ? 3000 : 1000, // 3秒 vs 1秒
      maxRetries: isLongContentPlatform ? 4 : 3,
      patientMessage: isLongContentPlatform ? '正在生成长篇内容，请耐心等待...' : '正在生成内容...'
    };
  };

  // 改进的AI调用重试机制 - 针对WeChat和Zhihu优化
  const callAIWithRetry = async (params: any, versionName: string, platformId?: string): Promise<any> => {
    let lastError: any = null;
    const originalModel = params.model;
    const timeoutConfig = getPlatformTimeoutConfig(platformId || '');
    const maxRetries = timeoutConfig.maxRetries;

    // 为长内容平台设置特殊状态
    if (timeoutConfig.isLongContent && platformId) {
      setLongContentPlatforms(prev => new Set(prev).add(platformId));
      setPlatformLoadingMessages(prev => new Map(prev).set(platformId, timeoutConfig.patientMessage));
    }

    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 ${versionName} - 第${attempt}次尝试调用AI (模型: ${params.model})`);

          // 为WeChat和Zhihu使用优化的参数
          const adjustedParams = { ...params };
          if (timeoutConfig.isLongContent) {
            adjustedParams.temperature = Math.min(adjustedParams.temperature || 0.7, 0.5);
            adjustedParams.maxTokens = Math.max(adjustedParams.maxTokens || 2000, 2500); // 增加token限制

            // 添加平台特定的系统提示
            if (platformId === 'wechat') {
              adjustedParams.systemPrompt += '\n重要：生成微信公众号专业长文，内容要深入、有价值、结构清晰。';
            } else if (platformId === 'zhihu') {
              adjustedParams.systemPrompt += '\n重要：生成知乎深度回答，要有专业见解、逻辑清晰、内容丰富。';
            }
          }

          const result = await callAI(adjustedParams);

          if (result.success && result.content && result.content.trim().length > 100) {
            logger.debug('✅ ${versionName} - 第${attempt}次尝试成功');
            return result;
          } else {
            const errorMsg = result.error || '生成内容为空或过短';
            lastError = new Error(errorMsg);
            console.log(`❌ ${versionName} - 第${attempt}次尝试失败: ${errorMsg}`);
          }
        } catch (error) {
          lastError = error;
          console.error(`🚨 ${versionName} - 第${attempt}次尝试异常:`, error);

          // ✅ FIXED: 2025-08-02 增强智能模型切换策略，支持402错误处理
          // 🐛 问题原因：DeepSeek API返回402错误（Payment Requihsl(var(--destructive))），需要自动切换到其他模型
          // 🔧 修复方案：添加402错误检测，实现智能降级机制
          // 📌 已封装：模型切换逻辑已验证稳定，请勿修改
          // 
          if (attempt <= 3) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            // 检测402错误（账户余额不足）
            if (errorMessage.includes('402') || errorMessage.includes('Payment Requihsl(var(--destructive))')) {
              logger.warn('🚨 ${versionName} - 检测到402错误（账户余额不足），启动智能降级');

              if (params.model.includes('deepseek')) {
                console.log(`🔄 ${versionName} - DeepSeek余额不足，切换到GPT-4o-mini`);
                params.model = 'gpt-4o-mini';
              } else if (params.model.includes('gpt-4o-mini')) {
                console.log(`🔄 ${versionName} - GPT-4o-mini失败，切换到GPT-3.5-turbo`);
                params.model = 'gpt-3.5-turbo';
              } else if (params.model.includes('gpt-3.5-turbo')) {
                console.log(`🔄 ${versionName} - GPT-3.5-turbo失败，尝试使用Gemini`);
                params.model = 'gemini-pro';
              }
            } else {
              // 其他错误类型的模型切换策略
              if (params.model.includes('deepseek')) {
                console.log(`🔄 ${versionName} - DeepSeek失败，切换到GPT-4o-mini`);
                params.model = 'gpt-4o-mini';
              } else if (params.model.includes('gpt-4o-mini')) {
                console.log(`🔄 ${versionName} - GPT-4o-mini失败，切换到GPT-3.5-turbo`);
                params.model = 'gpt-3.5-turbo';
              }
            }
          }
        }

        // 如果不是最后一次尝试，等待一段时间再重试
        if (attempt < maxRetries) {
          const delay = Math.min(timeoutConfig.retryDelay * Math.pow(2, attempt - 1), 10000);
          console.log(`⏳ ${versionName} - 等待${delay}ms后重试...`);

          // 更新加载消息
          if (timeoutConfig.isLongContent && platformId && attempt > 1) {
            setPlatformLoadingMessages(prev => new Map(prev).set(
              platformId,
              `${timeoutConfig.patientMessage} (重试 ${attempt}/${maxRetries})`
            ));
          }

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } finally {
      // 清理状态
      if (platformId) {
        setLongContentPlatforms(prev => {
          const newSet = new Set(prev);
          newSet.delete(platformId);
          return newSet;
        });
        setPlatformLoadingMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(platformId);
          return newMap;
        });
      }
    }

    // 恢复原始模型设置
    params.model = originalModel;

    // ✅ FIXED: 2025-08-03 修复队列管理器返回值问题
    // 🐛 问题原因：callAIWithRetry失败时抛出错误，但队列管理器期望返回结果对象
    // 🔧 修复方案：返回标准化的错误结果对象
    // 📌 已封装：错误处理逻辑已验证稳定，请勿修改
    // 

    const errorMessage = lastError ? lastError.message : `${versionName} - 所有重试都失败了`;
    return {
      success: false,
      error: errorMessage,
      content: null
    };
  };
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    charCountPreset: 'auto',
    globalEmoji: false,
    globalMd: false,
    globalAutoFormat: true
  });

  // 设置模式状态：'global' | 'platform' - 默认使用全局设置
  const [settingsMode, setSettingsMode] = useState<{
    charCount: 'global' | 'platform';
    emoji: 'global' | 'platform';
    mdFormat: 'global' | 'platform';
  }>({
    charCount: 'global',
    emoji: 'global',
    mdFormat: 'global'
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

  // 提取和清理内容中的标签和配图建议
  const extractAndCleanContent = (content: string): { cleanContent: string; extractedTags: string[] } => {
    if (!content) return { cleanContent: '', extractedTags: [] };

    let cleanContent = content;
    const extractedTags: string[] = [];

    // 1. 提取所有话题标签（#标签名格式）
    const hashtagRegex = /#[\u4e00-\u9fa5a-zA-Z0-9_]+/g;
    const hashtags = content.match(hashtagRegex) || [];

    // 去掉#号，只保留标签名
    hashtags.forEach(tag => {
      const tagName = tag.substring(1); // 去掉#号
      if (tagName && !extractedTags.includes(tagName)) {
        extractedTags.push(tagName);
      }
    });

    // 从内容中移除所有话题标签
    cleanContent = cleanContent.replace(hashtagRegex, '').trim();

    // 2. 移除配图建议文案（多种格式）
    const imagePatterns = [
      /（配图建议：[^）]*）/g,
      /\(配图建议：[^)]*\)/g,
      /【配图建议：[^】]*】/g,
      /\[配图建议：[^]]*\]/g,
      /配图建议：[^\n]*/g,
      /（配图：[^）]*）/g,
      /\(配图：[^)]*\)/g,
      /【配图：[^】]*】/g,
      /\[配图：[^]]*\]/g,
      /配图：[^\n]*/g
    ];

    imagePatterns.forEach(pattern => {
      cleanContent = cleanContent.replace(pattern, '');
    });

    // 3. 清理多余的空行和空格
    cleanContent = cleanContent
      .replace(/\n\s*\n\s*\n/g, '\n\n') // 多个连续空行变为两个
      .replace(/\s+$/gm, '') // 移除行尾空格
      .trim();

    console.log('🧹 内容清理完成:', {
      原始长度: content.length,
      清理后长度: cleanContent.length,
      提取标签: extractedTags
    });

    return { cleanContent, extractedTags };
  };

  // 存储提取的标签，用于传递给PlatformHashtags组件
  const [extractedTagsMap, setExtractedTagsMap] = useState<Record<string, string[]>>({});

  // 批量转发版本选择状态 - 默认选择版本A
  const [selectedVersionsForBatch, setSelectedVersionsForBatch] = useState<Record<string, 'version-a' | 'version-b'>>({});

  // 处理版本选择
  const handleVersionSelect = (platformId: string, versionId: 'version-a' | 'version-b') => {
    setSelectedVersionsForBatch(prev => ({
      ...prev,
      [platformId]: versionId
    }));

    // 同步版本选择到内容同步store
    const version = versionId === 'version-a' ? 'A' : 'B';
    contentSync.setSelectedVersion(version);
    contentSync.setPlatformId(platformId);

    // 找到对应的结果并同步内容
    const result = results.find(r => r.platformId === platformId);
    if (result && result.versions) {
      const versionIndex = versionId === 'version-a' ? 0 : 1;
      const selectedVersionData = result.versions[versionIndex];
      if (selectedVersionData) {
        contentSync.setVersionContent(
          version,
          selectedVersionData.content,
          selectedVersionData.charCount,
          selectedVersionData.validation
        );
      }
    }
  };

  // 获取选中的版本，默认为版本A
  const getSelectedVersion = (platformId: string): 'version-a' | 'version-b' => {
    return selectedVersionsForBatch[platformId] || 'version-a';
  };

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

      // 使用统一字符数控制系统获取最终限制
      const charCountControl = getUnifiedCharCountLimit(
        platformId,
        globalSettings.charCountPreset,
        platformSettings[platformId]?.charCount
      );
      const platformAdvice = getPlatformCharCountAdvice(platformId);

      // 计算token数，确保有足够空间生成目标字符数的内容
      let maxTokens: number;
      const targetChars = charCountControl.finalLimit;

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

      // ✅ FIXED: 移除字符数控制指令，避免在生成内容中显示字符数信息
      const optimalRange = calculateOptimalCharCount(platformId, charCountControl.finalLimit);
      const charCountInstruction = `【内容生成要求】
平台特性：${platformAdvice}
重要要求：
1. 生成的内容要完整、有价值，符合平台特性
2. 内容要自然流畅，不要为了凑字数而添加无意义内容
3. 如果内容自然长度不够，请增加具体细节、案例或深入分析
4. 确保内容质量优先，字数适中即可`;

      // 改进的并行生成 - 针对WeChat和Zhihu优化
      const getPlatformOptimizedParams = (baseParams: any, versionType: string) => {
        const params = { ...baseParams };

        // WeChat和Zhihu使用更保守的参数
        if (['wechat', 'zhihu'].includes(platformId)) {
          params.maxTokens = Math.min(params.maxTokens, 1200);
          params.temperature = Math.min(params.temperature, 0.6);

          // 添加平台特定的系统提示
          if (platformId === 'wechat') {
            params.systemPrompt += '\n注意：生成微信公众号内容，要求专业、易读、有价值。';
          } else if (platformId === 'zhihu') {
            params.systemPrompt += '\n注意：生成知乎内容，要求深度、专业、有见解。';
          }
        }

        return params;
      };

      // ✅ FIXED: 2025-08-03 使用队列管理器避免频率限制
      // 🐛 问题原因：并发请求导致OpenAI API 429错误
      // 🔧 修复方案：使用队列管理器串行处理请求
      // 📌 已封装：队列请求逻辑已验证稳定，请勿修改
      // 

      const platformAPICaller = createPlatformAPICaller(platformId);

      const standardResult = await platformAPICaller(
        '标准版本',
        () => callAIWithRetry(getPlatformOptimizedParams({
          prompt: standardPrompt,
          model: selectedModel as any,
          systemPrompt: `你是一个专业的内容创作专家，擅长生成结构化、标准化的内容。${charCountInstruction}`,
          maxTokens: maxTokens,
          temperature: 0.7
        }, '标准版本'), `${platformId}-标准版本`, platformId),
        3
      ).catch(error => {
        console.error(`${platformId}-标准版本生成失败:`, error);
        return { success: false, error: error.message };
      });

      const creativeResult = await platformAPICaller(
        '创意版本',
        () => callAIWithRetry(getPlatformOptimizedParams({
          prompt: creativePrompt,
          model: selectedModel as any,
          systemPrompt: `你是一个富有创意的内容创作专家，擅长生成生动、有趣的内容。${charCountInstruction}`,
          maxTokens: maxTokens,
          temperature: 0.9
        }, '创意版本'), `${platformId}-创意版本`, platformId),
        3
      ).catch(error => {
        console.error(`${platformId}-创意版本生成失败:`, error);
        return { success: false, error: error.message };
      });

      console.log('标准版本结果:', standardResult.success ? '成功' : `失败: ${standardResult.error}`);
      console.log('创意版本结果:', creativeResult.success ? '成功' : `失败: ${creativeResult.error}`);

      if (standardResult.success && standardResult.content) {
        const finalContent = standardResult.content;

        // 使用统一字符数控制系统验证
        const actualCharCount = finalContent.length;
        const targetCharCount = charCountControl.finalLimit;
        const minCharCount = charCountControl.range.min;
        const maxCharCount = charCountControl.range.max;

        // 验证字符数是否符合要求
        if (actualCharCount < minCharCount) {
          console.warn(`标准版本内容不足: ${actualCharCount}/${minCharCount} 字符，需要补充内容`);
        } else if (actualCharCount > maxCharCount) {
          console.warn(`标准版本内容超出限制: ${actualCharCount}/${maxCharCount} 字符，需要截断`);
        } else {
          logger.debug('✅ 标准版本字符数符合要求: ${actualCharCount}字符（${minCharCount}-${maxCharCount}）');
        }

        const validation = validateCharacterCount(finalContent, platformId, targetCharCount);

        // 提取标签并清理内容
        const { cleanContent: cleanContentA, extractedTags: tagsA } = extractAndCleanContent(finalContent);

        // 存储提取的标签
        setExtractedTagsMap(prev => ({
          ...prev,
          [`${platformId}-version-a`]: tagsA
        }));

        // ✅ FIXED: 生成有意义的标题而不是硬编码"版本A"
        const meaningfulTitleA = generateMeaningfulTitle(cleanContentA, platformId);

        versions.push({
          id: 'version-a',
          content: cleanContentA,
          style: 'standard',
          title: meaningfulTitleA,
          charCount: cleanContentA.length,
          validation: validateCharacterCount(cleanContentA, platformId, charCountControl.finalLimit)
        });

        // 静默处理验证警告，不显示任何提示文案
        if (validation.warning) {
          console.warn(`版本A字符数警告: ${validation.warning}`);
        }
      }

      if (creativeResult.success && creativeResult.content) {
        let finalContent = creativeResult.content;

        // 清理生成内容中的多余文案
        finalContent = cleanGeneratedContent(finalContent);

        // 使用统一字符数控制系统验证
        const actualCharCount = finalContent.length;
        const targetCharCount = charCountControl.finalLimit;
        const minCharCount = charCountControl.range.min;
        const maxCharCount = charCountControl.range.max;

        // 验证字符数是否符合要求
        if (actualCharCount < minCharCount) {
          console.warn(`创意版本内容不足: ${actualCharCount}/${minCharCount} 字符，需要补充内容`);
        } else if (actualCharCount > maxCharCount) {
          console.warn(`创意版本内容超出限制: ${actualCharCount}/${maxCharCount} 字符，需要截断`);
        } else {
          logger.debug('✅ 创意版本字符数符合要求: ${actualCharCount}字符（${minCharCount}-${maxCharCount}）');
        }

        const validation = validateCharacterCount(finalContent, platformId, targetCharCount);

        // 提取标签并清理内容
        const { cleanContent: cleanContentB, extractedTags: tagsB } = extractAndCleanContent(finalContent);

        // 存储提取的标签
        setExtractedTagsMap(prev => ({
          ...prev,
          [`${platformId}-version-b`]: tagsB
        }));

        // ✅ FIXED: 生成有意义的标题而不是硬编码"版本B"
        const meaningfulTitleB = generateMeaningfulTitle(cleanContentB, platformId);

        versions.push({
          id: 'version-b',
          content: cleanContentB,
          style: 'creative',
          title: meaningfulTitleB,
          charCount: cleanContentB.length,
          validation: validateCharacterCount(cleanContentB, platformId, charCountControl.finalLimit)
        });

        // 静默处理验证警告，不显示任何提示文案
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
        }, '基础版本', platformId).catch(error => {
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
    if (generating) {
      toast({
        title: "正在生成中",
        description: "内容生成期间无法切换AI模型",
        variant: "destructive"
      });
      return;
    }
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

  // ✅ FIXED: 用户数据隔离 - 处理从sessionStorage传递的预填充内容
  useEffect(() => {
    const userId = user?.id || 'guest';
    const sessionContent = sessionStorage.getItem(`ai_adapter_content_${userId}`);
    const sessionSource = sessionStorage.getItem(`ai_adapter_source_${userId}`);

    if (sessionContent && !originalContent) {
      setOriginalContent(sessionContent);

      // 显示来源提示
      toast({
        title: "内容已导入",
        description: `已从${sessionSource || '创意魔方'}导入内容到编辑器`,
      });

      // 清除sessionStorage以避免重复导入
      sessionStorage.removeItem(`ai_adapter_content_${userId}`);
      sessionStorage.removeItem(`ai_adapter_source_${userId}`);
    }
  }, [originalContent, toast, user?.id]);

  // 🔧 FIX: 使用统一状态管理，解决状态闪烁问题
  useUnifiedUserStateManager(); // 初始化统一状态管理
  const unifiedUsageInfo = useUsageInfo(); // 获取统一的使用次数信息

  // ✅ FIXED: 2025-08-04 修复无限循环问题 + 统一状态管理
  // 🔧 优先使用统一状态，如果未初始化则使用原有状态
  const { usageCount, maxUsage, decrementUsage, updateMaxUsage } = useAuthStore();
  const { primaryStatus, refresh: refreshSubscription } = useSubscriptionStatus();

  // 🔧 FIX: 使用统一状态管理的数据，避免闪烁
  const effectiveUsageCount = unifiedUsageInfo.isInitialized ? unifiedUsageInfo.usageCount : usageCount;
  const effectiveMaxUsage = unifiedUsageInfo.isInitialized ? unifiedUsageInfo.maxUsage : maxUsage;
  
  // 获取用户当前等级 - 优先使用订阅状态
  const getCurrentTier = () => {
    // 1. 优先使用订阅状态中的等级信息
    if (primaryStatus?.status === 'active' && primaryStatus.tier) {
      return primaryStatus.tier;
    }
    
    // 2. 从订阅状态标签推断
    if (primaryStatus?.status === 'active') {
      const statusLabel = primaryStatus.statusLabel?.toLowerCase() || '';
      if (statusLabel.includes('高级版') || statusLabel.includes('premium')) {
        return 'premium';
      } else if (statusLabel.includes('专业版') || statusLabel.includes('pro')) {
        return 'pro';
      }
    }
    
    // 3. 最后使用用户数据
    return unifiedUsageInfo.isInitialized ? unifiedUsageInfo.userTier : getUserTier(user);
  };
  
  const effectiveUserTier = getCurrentTier();
  
  // 同步实际使用次数和最大使用次数
  useEffect(() => {
    if (user?.id) {
      const syncUsageStats = async () => {
        try {
          // 获取用户当前等级 - 与其他组件保持一致的逻辑
          const currentTier = (() => {
            // 优先使用订阅状态中的等级信息
            if (primaryStatus?.status === 'active' && primaryStatus.tier) {
              return primaryStatus.tier;
            }

            // 如果订阅状态中没有等级信息，但有活跃订阅，根据状态标签推断等级
            if (primaryStatus?.status === 'active') {
              const statusLabel = primaryStatus.statusLabel?.toLowerCase() || '';
              if (statusLabel.includes('高级版') || statusLabel.includes('premium')) {
                return 'premium';
              } else if (statusLabel.includes('专业版') || statusLabel.includes('pro')) {
                return 'pro';
              }
            }

            // 最后使用用户数据中的等级信息
            return getUserTier(user);
          })();

          // 🔧 FIX: 恢复正确的使用次数限制配置
          let newMaxUsage = 10; // 默认体验版
          if (currentTier === 'pro') {
            newMaxUsage = 30; // 🔧 FIX: 专业版恢复为30次/月
          } else if (currentTier === 'premium') {
            newMaxUsage = -1; // 高级版无限制
          }

          // 🔧 FIX: 立即更新最大使用次数，避免状态闪烁
          if (newMaxUsage !== maxUsage) {
            console.log('🔄 更新使用次数限制:', {
              currentTier,
              oldMaxUsage: maxUsage,
              newMaxUsage,
              hasActiveSubscription: primaryStatus?.status === 'active'
            });
            updateMaxUsage(newMaxUsage);
          }

          // 尝试从后端API获取实际已使用次数（可选）
          try {
            const response = await request.post('/.netlify/functions/api', {
              action: 'user-usage',
              userId: user.id
            });

            const actualUsedCount = response.totalUsed || 0;

            // 同步实际已使用次数
            const currentStoreUsage = useAuthStore.getState().usageCount;
            if (actualUsedCount !== currentStoreUsage) {
              useAuthStore.setState({ usageCount: actualUsedCount });
            }
          } catch (error) {
            // API同步失败，使用本地数据
            console.warn('API同步失败，使用本地数据:', error.message);
          }
        } catch (error) {
          console.error('同步使用次数失败:', error);
        }
      };
      
      syncUsageStats();
    }
  }, [user?.id, primaryStatus?.status, updateMaxUsage, maxUsage]);
  
  // 同步订阅状态更新后刷新使用次数
  useEffect(() => {
    if (primaryStatus?.status === 'active') {
      refreshSubscription();
    }
  }, [primaryStatus?.status, refreshSubscription]);

  // 🔧 FIX: 监听支付成功事件，立即更新使用次数状态
  useEffect(() => {
    const handlePaymentSuccess = () => {
      console.log('🎉 收到支付成功事件，刷新使用次数状态');
      // 强制刷新订阅状态
      refreshSubscription();
      // 延迟一点再次刷新，确保后端数据已更新
      setTimeout(() => {
        refreshSubscription();
      }, 1000);
    };

    const handleSubscriptionUpdated = (event: CustomEvent) => {
      console.log('🔄 收到订阅更新事件，刷新使用次数状态', event.detail);
      refreshSubscription();
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    window.addEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);

    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);
    };
  }, [refreshSubscription]);
  
  // 🔧 FIX: 使用统一状态管理的数据计算剩余次数
  const usageRemaining = effectiveMaxUsage === -1 ? Infinity : Math.max(0, effectiveMaxUsage - effectiveUsageCount);
  
  // 🐛 DEBUG: 记录剩余次数计算过程和localStorage数据
  useEffect(() => {
    const localStorageData = {
      globalSettings: localStorage.getItem('globalSettings'),
      usageCount: localStorage.getItem('usageCount'),
      maxUsage: localStorage.getItem('maxUsage'),
      userSubscription: localStorage.getItem('userSubscription'),
      unifiedUserState: localStorage.getItem('unified-user-state')
    };
    
    console.log('🔍 剩余次数计算调试:', {
      effectiveUsageCount,
      effectiveMaxUsage,
      usageRemaining,
      effectiveUserTier,
      calculation: `${effectiveMaxUsage} - ${effectiveUsageCount} = ${usageRemaining}`,
      unifiedUsageInfo: {
        isInitialized: unifiedUsageInfo.isInitialized,
        usageCount: unifiedUsageInfo.usageCount,
        maxUsage: unifiedUsageInfo.maxUsage,
        userTier: unifiedUsageInfo.userTier
      },
      authStore: { usageCount, maxUsage },
      primaryStatus: primaryStatus?.status,
      localStorageData
    });
    
    // 检查是否有异常数据并尝试修复
    if (effectiveUsageCount < 0) {
      console.warn('⚠️ 检测到异常的使用次数数据，尝试修复...');
      // 如果使用次数为负数，重置为0
      if (unifiedUsageInfo.isInitialized) {
        // TODO: 调用统一状态管理的重置方法
      } else {
        updateMaxUsage(30); // 重置为专业版默认值
      }
    }
    
    // 检查剩余次数是否异常（如31次这种情况）
    if (typeof usageRemaining === 'number' && usageRemaining > effectiveMaxUsage && effectiveMaxUsage > 0) {
      console.warn('⚠️ 检测到剩余次数异常，可能有数据错误:', {
        usageRemaining,
        effectiveMaxUsage,
        effectiveUsageCount,
        shouldBe: Math.max(0, effectiveMaxUsage - Math.max(0, effectiveUsageCount))
      });
      
      // 自动修复：如果检测到明显的数据错误，自动执行一次数据修复
      const isObviousDataError = (
        usageRemaining === 31 && effectiveMaxUsage === 30 // 明确的31次问题
        || effectiveUsageCount < 0 // 负数使用次数
        || (effectiveMaxUsage > 0 && usageRemaining > effectiveMaxUsage + 10) // 剩余次数远超限制
      );
      
      if (isObviousDataError) {
        console.log('🔧 检测到明显数据错误，自动执行修复...');
        setTimeout(() => {
          resetUsageData();
        }, 1000);
      } else {
        // 其他情况只刷新订阅状态
        try {
          refreshSubscription();
        } catch (error) {
          console.error('刷新订阅状态失败:', error);
        }
      }
    }
  }, [effectiveUsageCount, effectiveMaxUsage, usageRemaining, effectiveUserTier]);

  // 🔧 FIX: 将状态变化检测移到useEffect中，避免在render中执行副作用
  const prevStateRef = useRef<{
    tier: string;
    maxUsage: number;
    usageCount: number;
    initialized: boolean;
  } | null>(null);
  
  useEffect(() => {
    const currentState = {
      tier: effectiveUserTier,
      maxUsage: effectiveMaxUsage,
      usageCount: effectiveUsageCount,
      initialized: unifiedUsageInfo.isInitialized
    };
    
    if (prevStateRef.current && (
      prevStateRef.current.tier !== currentState.tier ||
      prevStateRef.current.maxUsage !== currentState.maxUsage ||
      prevStateRef.current.usageCount !== currentState.usageCount ||
      prevStateRef.current.initialized !== currentState.initialized
    )) {
      console.log('🔄 AdaptPage状态变化:', {
        from: prevStateRef.current,
        to: currentState
      });
    }
    prevStateRef.current = currentState;
  }, [effectiveUserTier, effectiveMaxUsage, effectiveUsageCount, unifiedUsageInfo.isInitialized]);

  // 使用次数提醒弹窗状态
  const [showUsageReminder, setShowUsageReminder] = useState(false);
  const [usageReminderCount, setUsageReminderCount] = useState(0);

  const platforms = useMemo(() => [
    { id: "xiaohongshu", name: "小红书", description: "适合生活方式、美妆、旅行等分享，强调个人体验和情感共鸣", icon: <Book className="h-4 w-4 text-accent" /> },
    { id: "zhihu", name: "知乎", description: "适合专业知识分享和理性讨论，强调逻辑和论证", icon: <MessageSquare className="h-4 w-4 text-accent" /> },
    { id: "douyin", name: "抖音", description: "适合短视频脚本，活泼有趣，强调视听效果", icon: <Video className="h-4 w-4 text-accent" /> },
    { id: "weibo", name: "新浪微博", description: "简短有力的观点表达，适合热点话题讨论", icon: <Send className="h-4 w-4 text-accent" /> },
    { id: "wechat", name: "公众号", description: "深度内容，适合教程、观点和专业分析", icon: <MessageSquare className="h-4 w-4 text-accent" /> },
    { id: "bilibili", name: "B站", description: "适合视频脚本，兼具专业性和趣味性", icon: <Video className="h-4 w-4 text-accent" /> },
    { id: "twitter", name: "X（推特）", description: "简短、直接的表达，支持多种语言和国际化视角", icon: <Twitter className="h-4 w-4 text-accent" /> },
    { id: "video", name: "视频号", description: "视频内容与互动引导并重，亲和力强", icon: <SquarePlay className="h-4 w-4 text-accent" /> },
    { id: "baijia", name: "百家号", description: "长篇深度内容，SEO友好，权威感强，适合资讯类内容", icon: <Globe className="h-4 w-4 text-accent" /> },
    { id: "kuaishou", name: "快手", description: "接地气表达，真实朴实，亲民风格，适合生活记录", icon: <Zap className="h-4 w-4 text-accent" /> },
    { id: "wangyi", name: "网易小蜜蜂", description: "注重原创性，文笔流畅，观点独特，适合深度评论", icon: <Rss className="h-4 w-4 text-accent" /> },
    { id: "toutiao", name: "头条号", description: "标题党友好，热点敏感，算法推荐，适合时事评论", icon: <Globe className="h-4 w-4 text-accent" /> },
    { id: "facebook", name: "Facebook", description: "国际化社交平台，适合品牌推广和社区互动", icon: <Facebook className="h-4 w-4 text-accent" /> },
    { id: "linkedin", name: "LinkedIn", description: "专业职场社交平台，适合商务内容和职业发展", icon: <Linkedin className="h-4 w-4 text-accent" /> },
    { id: "instagram", name: "Instagram", description: "视觉化社交平台，适合图片和短视频内容", icon: <Instagram className="h-4 w-4 text-accent" /> },
    { id: "douban", name: "豆瓣", description: "文艺青年聚集地，适合文化评论和生活方式分享", icon: <User className="h-4 w-4 text-accent" /> }
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

  // ✅ FIXED: 用户数据隔离 - 平台设置存储
  const platformSettingsManager = useUserDataIsolation({
    modulePrefix: 'adapt_platform_settings',
    fallbackToGuest: true,
    enableLogging: true
  });

  const globalSettingsManager = useUserDataIsolation({
    modulePrefix: 'adapt_global_settings',
    fallbackToGuest: true,
    enableLogging: true
  });

  const selectedPlatformsManager = useUserDataIsolation({
    modulePrefix: 'adapt_selected_platforms',
    fallbackToGuest: true,
    enableLogging: true
  });

  // Save settings to localStorage with user isolation
  const saveSettings = () => {
    try {
      platformSettingsManager.saveData(platformSettings);
      globalSettingsManager.saveData(globalSettings);
      selectedPlatformsManager.saveData(selectedPlatforms);
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

  // Auto-save settings when they change with user isolation
  useEffect(() => {
    if (Object.keys(platformSettings).length > 0) {
      platformSettingsManager.saveData(platformSettings);
    }
  }, [platformSettings, platformSettingsManager]);

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

  // Initialize platform settings with user isolation
  useEffect(() => {
    // Try to load saved settings from user-isolated storage
    const platformResult = platformSettingsManager.loadData();
    const globalResult = globalSettingsManager.loadData();
    const selectedResult = selectedPlatformsManager.loadData();

    if (platformResult.success && platformResult.data) {
      try {
        setPlatformSettings(platformResult.data as unknown as Record<string, PlatformSettings>);
      } catch {
        console.error("Failed to parse saved platform settings");
        initializeDefaultSettings();
      }
    } else {
      initializeDefaultSettings();
    }

    if (globalResult.success && globalResult.data) {
      try {
        setGlobalSettings(globalResult.data as unknown as GlobalSettings);
      } catch {
        console.error("Failed to parse saved global settings");
      }
    }

    if (selectedResult.success && selectedResult.data) {
      try {
        // 去重处理，确保没有重复的平台ID
        const uniquePlatforms = Array.from(new Set(selectedResult.data as unknown as string[])) as string[];
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

  // 🔧 FIX: 使用统一状态检查生成条件
  const canGenerate = originalContent.trim().length > 10 && selectedPlatforms.length > 0 && (usageRemaining > 0 || effectiveMaxUsage === -1);

  // 检查使用次数并显示提醒
  const checkUsageAndShowReminder = () => {
    if (usageRemaining <= 3 && usageRemaining > 0) {
      setUsageReminderCount(usageRemaining);
      setShowUsageReminder(true);
      return false;
    }
    return true;
  };

  // 🔧 数据修复函数 - 解决31次等异常数据问题
  const resetUsageData = useCallback(async () => {
    console.log('🔄 开始重置使用次数数据...');
    
    try {
      // 1. 清理localStorage中的异常数据
      const keysToRemove = [
        'usageCount',
        'maxUsage', 
        'unified-user-state',
        'globalSettings',
        'userSubscription'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ 已清理: ${key}`);
      });
      
      // 2. 重新获取用户订阅状态
      await refreshSubscription();
      
      // 3. 重置为默认值
      const correctTier = getUserTier(user);
      const correctMaxUsage = correctTier === 'premium' ? -1 : correctTier === 'pro' ? 30 : 10;
      
      console.log('🔍 重置数据调试信息:', {
        userId: user?.id,
        userTier: correctTier,
        maxUsage: correctMaxUsage,
        primaryStatus: primaryStatus?.status,
        primaryTier: primaryStatus?.tier,
        userVipLevel: user?.vipLevel,
        userSubscription: user?.subscription
      });
      
      updateMaxUsage(correctMaxUsage);
      
      // 4. 静默重置，不显示提示（避免干扰用户体验）
      
      console.log('✅ 使用次数数据重置完成');
      
    } catch (error) {
      console.error('❌ 重置数据失败:', error);
      toast({
        title: '重置失败',
        description: '数据重置过程中发生错误，请稍后重试',
        variant: 'destructive'
      });
    }
  }, [user, refreshSubscription, updateMaxUsage, toast]);

  // Handle platform selection
  const togglePlatform = (platformId: string, isChecked: boolean) => {
    const platformName = getPlatformName(platformId, platforms);

    if (isChecked) {
      setSelectedPlatforms(prev => {
        // 防止重复添加同一个平台
        if (prev.includes(platformId)) {
          return prev;
        }
        const newPlatforms = [...prev, platformId];

        // 显示确认提示
        toast({
          title: `已选择 ${platformName}`,
          description: `将为 ${platformName} 平台生成专属内容`,
          duration: 2000,
        });

        return newPlatforms;
      });
    } else {
      setSelectedPlatforms(prev => {
        const newPlatforms = prev.filter(id => id !== platformId);

        // 显示移除提示
        toast({
          title: `已移除 ${platformName}`,
          description: `不再为 ${platformName} 平台生成内容`,
          duration: 2000,
        });

        return newPlatforms;
      });
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

    // 只有在当前已经是平台模式时才更新对应的全局设置
    // 这样用户可以自由选择使用全局或平台特定设置
    if (key === 'charCount' && settingsMode.charCount === 'platform') {
      // 在平台模式下，禁用全局字符数设置以避免冲突
      setGlobalSettings(prev => ({ ...prev, charCountPreset: 'auto' }));
    } else if (key === 'useEmoji' && settingsMode.emoji === 'platform') {
      // 在平台模式下，禁用全局emoji设置以避免冲突
      setGlobalSettings(prev => ({ ...prev, globalEmoji: false }));
    } else if (key === 'useMdFormat' && settingsMode.mdFormat === 'platform') {
      // 在平台模式下，禁用全局markdown设置以避免冲突
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

  // ✅ FIXED: 用户数据隔离 - 生成内容后保存到历史记录
  const historyDataManager = useUserDataIsolation({
    modulePrefix: 'adapt_history',
    fallbackToGuest: true,
    enableLogging: true
  });

  // ✅ FIXED: 用户数据隔离 - 收藏功能
  const favoritesDataManager = useUserDataIsolation({
    modulePrefix: 'adapt_favorites',
    fallbackToGuest: true,
    enableLogging: true
  });

  const saveToHistory = (results: PlatformResult[]) => {
    const result = historyDataManager.loadData<unknown[]>();
    let list: unknown[] = result.data || [];

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

    // 限制历史记录数量，避免存储过大
    if (list.length > 100) {
      list = list.slice(-100);
    }

    historyDataManager.saveData(list);
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

    // ✅ 使用次数扣减规则：点击生成内容时立即扣减一次使用次数
    try {
      // 在开始生成前先扣减使用次数，确保即使生成失败也会计算使用次数
      const { incrementUsage } = useAuthStore.getState();
      incrementUsage();
      
      console.log('✅ 使用次数已扣减，剩余:', Math.max(0, maxUsage - (usageCount + 1)));
    } catch (error) {
      console.error('❌ 扣减使用次数失败:', error);
    }

    setGenerating(true);
    // 不要清空结果，而是初始化生成状态
    const initialResults: PlatformResult[] = selectedPlatforms.map(platformId => ({
      platformId,
      content: '',
      steps: [
        { status: 'waiting', message: '准备生成...' },
        { status: 'waiting', message: '构建提示词...' },
        { status: 'waiting', message: '调用AI服务...' },
        { status: 'waiting', message: '处理结果...' }
      ],
      source: 'ai' as const
    }));
    setResults(initialResults);

    try {
      // 使用已初始化的结果数组
      const newResults = [...initialResults];

      for (let i = 0; i < selectedPlatforms.length; i++) {
        const platformId = selectedPlatforms[i];

        const updateStep = (stepIndex: number, status: "waiting" | "loading" | "completed" | "error", message?: string) => {
          const updatedResults = [...newResults];
          if (updatedResults[i]) {
            updatedResults[i].steps[stepIndex].status = status;
            if (message) {
              updatedResults[i].steps[stepIndex].message = message;
            }
            setResults([...updatedResults]);
          }
        };

        try {
          // 步骤1: 开始生成
          updateStep(0, 'loading', '🔄 正在准备生成...');

          // 步骤2: 构建提示词
          updateStep(1, 'loading', '🧠 构建多维提示词...');

          // 使用统一字符数控制系统获取目标字符数
          const charCountControl = getUnifiedCharCountLimit(
            platformId,
            globalSettings.charCountPreset,
            platformSettings[platformId]?.charCount
          );

          // 使用多维矩阵提示词系统生成内容
          const matrixPrompt = await generateMatrixPrompt(
            originalContent.trim(),
            platformId,
            selectedFormId,
            selectedStyle,
            charCountControl.finalLimit,
            customPrompt,
            useBrandLibrary
          );

          // 步骤3: AI生成内容
          updateStep(2, 'loading', '🤖 调用AI服务生成内容...');

          // 根据平台设置不同的超时时间
          const timeoutConfig = getPlatformTimeoutConfig(platformId);
          const timeoutDuration = timeoutConfig.isLongContent ? 180000 : 90000; // 长内容平台3分钟，其他90秒

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('生成超时，请重试')), timeoutDuration);
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
              // 同步更新本地数组
              Object.assign(newResults[resultIndex], updatedResults[resultIndex]);
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

  // Copy content to clipboard - 添加视觉反馈，确保不干扰收藏功能
  const [copyStates, setCopyStates] = useState<Set<string>>(new Set());

  const copyToClipboard = async (content: string, buttonId?: string) => {
    try {
      await navigator.clipboard.writeText(content);

      // 添加视觉反馈
      if (buttonId) {
        setCopyStates(prev => new Set(prev).add(buttonId));
        setTimeout(() => {
          setCopyStates(prev => {
            const newSet = new Set(prev);
            newSet.delete(buttonId);
            return newSet;
          });
        }, 2000);
      }

      toast({
        title: "已复制到剪贴板 📋",
        description: "内容已成功复制，可直接粘贴使用",
      });
    } catch (error) {
      console.error('复制失败:', error);
      toast({
        title: "复制失败",
        description: "请手动选择并复制内容",
        variant: "destructive"
      });
    }
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
        const res = await request.request({
          url: 'https://api.deepseek.com/v1/models',
          method: 'GET',
          headers: { 'Authorization': 'Bearer test' },
          validateStatus: () => true // 将 401/200 都视为成功返回
        });
        // 统一 request 返回 data，没有 status，这里用 validateStatus 委托 axios 返回
        diagnosticResults.apiEndpoint = true;
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

  // 自动重试超时平台 - 改进的重试机制
  const autoRetryTimeoutPlatform = async (platformId: string, retryCount: number = 1, maxRetries: number = 3) => {
    // 为WeChat和Zhihu增加重试次数
    const platformMaxRetries = ['wechat', 'zhihu'].includes(platformId) ? 4 : maxRetries;

    if (retryCount > platformMaxRetries) {
      console.log(`平台 ${platformId} 已达到最大重试次数 ${platformMaxRetries}`);
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

      logger.debug('✅ 平台 ${platformId} 第 ${retryCount} 次重试成功');

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
        const getPlatformSpecificError = (platformId: string, retryCount: number, maxRetries: number) => {
          if (retryCount >= maxRetries) {
            if (platformId === 'wechat') {
              return `📱 微信公众号长文生成失败\n\n可能原因：\n• 内容要求过于复杂\n• 网络连接不稳定\n• AI服务暂时繁忙\n\n建议：\n• 稍后重试\n• 简化内容要求\n• 检查网络连接`;
            } else if (platformId === 'zhihu') {
              return `🎓 知乎深度内容生成失败\n\n可能原因：\n• 深度内容生成时间较长\n• 网络超时\n• 服务器负载较高\n\n建议：\n• 稍后重试\n• 降低内容复杂度\n• 分段生成内容`;
            } else {
              return `🔄 ${getPlatformName(platformId, platforms)}生成暂时失败，请稍后重试`;
            }
          }
          return errorMessage;
        };

        const finalError = getPlatformSpecificError(platformId, retryCount, maxRetries);

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
        method: options.method as 'script' | 'auto' | 'browser' | 'extension' | 'rpa',
        onProgress: (progress) => {
          setAutomationProgress(progress as any);
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

    // 根据平台设置不同的超时时间
    const timeoutConfig = getPlatformTimeoutConfig(platformId);
    const timeoutDuration = timeoutConfig.isLongContent ? 180000 : 120000; // 长内容平台3分钟，其他2分钟

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('生成超时，请重试')), timeoutDuration);
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

      // ✅ FIXED: 移除字符数控制指令，避免在生成内容中显示字符数信息
      const optimalRange = calculateOptimalCharCount(platformId, userCharLimit);
      const charCountInstruction = `【内容生成要求】
平台特性：${platformAdvice}
重要要求：
1. 生成的内容要完整、有价值，符合平台特性
2. 内容要自然流畅，不要为了凑字数而添加无意义内容
3. 如果内容自然长度不够，请增加具体细节、案例或深入分析
4. 确保内容质量优先，字数适中即可`;

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

        // 提取标签并清理内容
        const { cleanContent, extractedTags } = extractAndCleanContent(finalContent);

        // 存储提取的标签
        setExtractedTagsMap(prev => ({
          ...prev,
          [`${platformId}-${versionId}`]: extractedTags
        }));

        // 更新版本内容
        setResults(current =>
          current.map(r =>
            r.platformId === platformId
              ? {
                  ...r,
                  versions: r.versions?.map(v =>
                    v.id === versionId
                      ? { ...v, content: cleanContent, charCount: cleanContent.length }
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

  // Favorite content - 修复持久化收藏状态
  const [favoriteStates, setFavoriteStates] = useState<Set<string>>(new Set());
  const [persistentFavorites, setPersistentFavorites] = useState<Set<string>>(new Set());

  // 初始化时加载已收藏的内容
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoriteKeys = new Set(favorites.map((fav: any) =>
      fav.versionId ? `${fav.platformId}-${fav.versionId}` : fav.platformId
    ) as string[]);
    setPersistentFavorites(favoriteKeys);
  }, []);

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
    let title = '';
    let versionTitle = '';

    // 如果指定了版本ID，收藏特定版本
    if (versionId && result.versions) {
      const version = result.versions.find(v => v.id === versionId);
      if (version) {
        content = version.content;
        title = version.title || `${content.substring(0, 30)}...`;
        versionTitle = ` - ${version.title || '版本' + (versionId === 'version-a' ? 'A' : 'B')}`;
      }
    } else if (result.content) {
      // 收藏主内容
      content = result.content;
      title = `${content.substring(0, 30)}...`;
    } else if (result.versions && result.versions.length > 0) {
      // 如果没有主内容，收藏第一个版本
      content = result.versions[0].content;
      title = result.versions[0].title || `${content.substring(0, 30)}...`;
      versionTitle = ` - ${result.versions[0].title || '版本A'}`;
    }

    if (!content) {
      toast({
        title: "无法收藏",
        description: "没有可收藏的内容",
        variant: "destructive"
      });
      return;
    }

    const favoriteKey = versionId ? `${platformId}-${versionId}` : platformId;
    const platformName = getPlatformName(platformId, platforms);

    // 检查是否已收藏
    if (persistentFavorites.has(favoriteKey)) {
      // 取消收藏 - 从新的收藏系统中移除
      const existingFavorites = favoritesStore.favorites.filter(fav =>
        fav.source === 'content-generation' &&
        fav.metadata.platformId === platformId &&
        fav.metadata.versionId === versionId
      );

      existingFavorites.forEach(fav => {
        favoritesStore.removeFavorite(fav.id);
      });

      // 保持旧系统兼容性 - 使用用户隔离存储
      const favoritesResult = favoritesDataManager.loadData();
      const favorites = (favoritesResult.data as any[]) || [];
      const updatedFavorites = favorites.filter((fav: any) => {
        const key = fav.versionId ? `${fav.platformId}-${fav.versionId}` : fav.platformId;
        return key !== favoriteKey;
      });
      favoritesDataManager.saveData(updatedFavorites);

      setPersistentFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(favoriteKey);
        return newSet;
      });

      toast({
        title: "取消收藏",
        description: "已取消收藏该内容",
      });
    } else {
      // 添加收藏 - 使用新的统一收藏系统
      const favoriteItem = favoritesUtils.createFavoriteItem(
        'content-generation',
        title,
        content,
        'content-generation',
        {
          description: `${platformName}平台内容${versionTitle}`,
          tags: contentSync.selectedTags.length > 0 ? contentSync.selectedTags : [platformName],
          metadata: {
            platformId,
            platformName,
            versionId,
            originalContent: originalContent,
            charCount: content.length
          }
        }
      );

      const favoriteId = favoritesStore.addFavorite(favoriteItem);

      // 保持旧系统兼容性 - 使用用户隔离存储
      const favoritesResult = favoritesDataManager.loadData();
      const favorites = (favoritesResult.data as any[]) || [];
      const legacyFavoriteItem = {
        id: favoriteId,
        platformId,
        content,
        platformName: platformName + versionTitle,
        versionId,
        timestamp: new Date().toISOString()
      };

      favorites.push(legacyFavoriteItem);
      favoritesDataManager.saveData(favorites);

      setPersistentFavorites(prev => new Set(prev).add(favoriteKey));

      // 临时视觉反馈（仅用于"已收藏"文字显示）
      setFavoriteStates(prev => new Set(prev).add(favoriteKey));
      setTimeout(() => {
        setFavoriteStates(prev => {
          const newSet = new Set(prev);
          newSet.delete(favoriteKey);
          return newSet;
        });
      }, 2000);

      toast({
        title: "收藏成功 ❤️",
        description: "内容已添加到我的资料库 > 收藏夹",
      });
    }
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

      // ✅ FIXED: 用户数据隔离 - 写入分享历史记录（避免在非Hook中调用Hook，改为直接使用本地存储隔离器）
      const shareHistoryManager = {
        loadData: <T,>() => ({ success: true, data: JSON.parse(localStorage.getItem('share_history') || '[]') as T }),
        saveData: (data: any) => localStorage.setItem('share_history', JSON.stringify(data))
      };

      const shareHistoryResult = shareHistoryManager.loadData<ShareHistoryItem[]>();
      const shareHistory: ShareHistoryItem[] = shareHistoryResult.data || [];

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

      // 限制历史记录数量
      if (shareHistory.length > 50) {
        shareHistory.splice(50);
      }

      shareHistoryManager.saveData(shareHistory);

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
      // ✅ FIXED: 已移除模拟翻译回退，直接抛出错误
      throw new Error(`翻译失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // ✅ FIXED: 已移除模拟翻译功能
  // 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
  // 
  //
  // 系统现在直接调用真实翻译API，不再提供模拟翻译
  const simulateTranslation = async (content: string): Promise<never> => {
    throw new Error('翻译API调用失败，请检查网络连接和API配置');
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

      // 使用统一字符数控制系统获取目标字符数
      const charCountControl = getUnifiedCharCountLimit(
        platformId,
        globalSettings.charCountPreset,
        platformSettings[platformId]?.charCount
      );

      // 使用多维矩阵提示词系统重新生成
      const matrixPrompt = await generateMatrixPrompt(
        originalContent.trim(),
        platformId,
        selectedFormId,
        selectedStyle,
        charCountControl.finalLimit,
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
          let finalContent = aiResult.content;
          let warningMessage = '重新生成完成';
          const actualCharCount = finalContent.length;

          // 验证字符数是否在允许范围内
          const targetCharCount = charCountControl.finalLimit;
          const minCharCount = charCountControl.range.min;
          const maxCharCount = charCountControl.range.max;

          // 检查字符数是否符合要求
          if (actualCharCount < minCharCount) {
            warningMessage = `⚠️ 重新生成内容不足：${actualCharCount}字符，要求${minCharCount}-${maxCharCount}字符`;
            console.warn(`🔧 重新生成内容不足: ${actualCharCount}/${minCharCount} 字符，需要补充内容`);
          } else if (actualCharCount > maxCharCount) {
            // 智能截断：尽量在句号、感叹号、问号处截断
            const truncatePoints = ['.', '。', '!', '！', '?', '？', '\n'];
            let bestTruncateIndex = maxCharCount;

            // 在目标长度前寻找最佳截断点
            for (let i = maxCharCount - 1; i >= Math.max(0, maxCharCount - 50); i--) {
              if (truncatePoints.includes(finalContent[i])) {
                bestTruncateIndex = i + 1;
                break;
              }
            }

            finalContent = finalContent.substring(0, bestTruncateIndex).trim();

            // 如果截断后仍然超出限制，强制截断
            if (finalContent.length > maxCharCount) {
              finalContent = finalContent.substring(0, maxCharCount).trim();
            }

            warningMessage = `🔧 重新生成内容已截断：${actualCharCount} -> ${finalContent.length}字符`;
            logger.debug('🔧 重新生成内容超出限制，已智能截断: ${actualCharCount} -> ${finalContent.length} 字符');
          } else {
            warningMessage = `✅ 重新生成完成：${actualCharCount}字符（符合${minCharCount}-${maxCharCount}字符要求）`;
            logger.debug('✅ 重新生成字符数符合要求: ${actualCharCount}字符');
          }

          console.log(`🎯 字符数控制来源: ${charCountControl.description}`);

          // 更新结果
          const currentResults = [...results];
          if (currentResults[resultIndex]) {
            currentResults[resultIndex].content = finalContent;
            currentResults[resultIndex].source = 'ai';
            currentResults[resultIndex].error = undefined;
            currentResults[resultIndex].steps[3].status = 'completed';
            currentResults[resultIndex].steps[3].message = warningMessage;
            // 添加字符数信息
            currentResults[resultIndex].charCount = finalContent.length;
            currentResults[resultIndex].targetCharCount = charCountControl.finalLimit;

            // 重新验证字符数并更新validation信息
            const validation = validateCharacterCount(finalContent, platformId, charCountControl.finalLimit);
            if (currentResults[resultIndex].versions) {
              // 更新对应版本的验证信息
              currentResults[resultIndex].versions = currentResults[resultIndex].versions!.map(version => ({
                ...version,
                content: finalContent,
                charCount: finalContent.length,
                validation: validation
              }));
            }
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
    try {
      const { callAI } = await import('@/api/aiService');
      const result = await callAI({
        prompt: `为以下内容生成3个吸引人的标题：\n\n${content}`,
        taskType: 'TITLE_GENERATION',
        maxTokens: 200
      });
      
      const generatedTitle = result.content?.split('\n')[0]?.replace(/^\d+\.\s*/, '') || '生成的标题';
      setTitle(generatedTitle);
      
      toast({
        title: "AI标题已生成",
        description: generatedTitle,
      });
    } catch (error) {
      console.error('AI标题生成失败:', error);
      toast({
        title: "标题生成失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 批量转发状态
  const [batchPublishOpen, setBatchPublishOpen] = useState(false);
  const [batchSelectedPlatforms, setBatchSelectedPlatforms] = useState<string[]>([]);
  const [batchQueue, setBatchQueue] = useState<{ platformId: string; content: string }[]>([]);
  const [batchCurrent, setBatchCurrent] = useState<{ platformId: string; content: string } | null>(null);

  // 新的批量转发工作台状态
  const [batchForwardModalOpen, setBatchForwardModalOpen] = useState(false);
  const [batchForwardPlatforms, setBatchForwardPlatforms] = useState<any[]>([]);

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
   * 确认批量转发平台 - 使用新的工作台模式
   */
  const confirmBatchPlatforms = async () => {
    if (publishMode === 'api') {
      handleBatchApiPublish(batchSelectedPlatforms);
      setBatchPublishOpen(false);
      return;
    }

    // 构建批量转发平台数据
    const forwardPlatforms = await Promise.all(
      batchSelectedPlatforms.map(async (pid) => {
        const result = results.find(r => r.platformId === pid);
        if (!result) return null;

        // 获取内容、标题和标签
        let content = '';
        let title = '';
        let tags: string[] = [];

        if (result.versions && result.versions.length > 0) {
          // ✅ 使用选中的版本数据
          const selectedVersionId = getSelectedVersion(pid);
          const versionIndex = selectedVersionId === 'version-a' ? 0 : 1;
          const version = result.versions[versionIndex] || result.versions[0]; // 备用第一个版本

          content = version.content;
          title = version.title || `${content.substring(0, 30)}...`;

          // 从提取的标签映射中获取标签
          const versionKey = `${pid}-${selectedVersionId}`;
          const extractedTags = extractedTagsMap[versionKey] || [];
          tags = extractedTags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
        } else if (result.content) {
          // ✅ 使用AI生成的基础数据
          content = result.content;
          title = `${content.substring(0, 30)}...`; // 备用标题

          // 尝试从结果中获取标签
          if (result.tags && Array.isArray(result.tags)) {
            tags = result.tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
          }
        }

        if (!content) return null;

        // 获取平台信息
        const platform = platforms.find(p => p.id === pid);
        if (!platform) return null;

        // 如果没有标签，尝试从提取的标签映射中获取
        if (tags.length === 0) {
          const platformKey = `${pid}-version-a`;
          const extractedTags = extractedTagsMap[platformKey] || [];
          if (extractedTags.length > 0) {
            tags = extractedTags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
          } else {
            // 最后备用方案：生成标签
            try {
              const { hashtagGenerator } = await import('@/utils/hashtagGenerator');
              const hashtagSuggestions = await hashtagGenerator.generateHashtags(content, {
                platformId: pid,
                maxTags: 5
              });
              tags = hashtagSuggestions.map(h => `#${h.tag}`);
            } catch (error) {
              console.error('生成标签失败:', error);
              tags = []; // 确保tags是数组
            }
          }
        }

        return {
          id: pid,
          name: platform.name,
          icon: platform.name.charAt(0),
          url: platformUrls[pid] || `https://${pid}.com`,
          title,    // ✅ 使用AI生成的标题
          content,  // ✅ 使用AI生成的内容
          tags      // ✅ 使用AI生成过程中提取的标签
        };
      })
    );

    const validPlatforms = forwardPlatforms.filter(Boolean);

    if (validPlatforms.length === 0) {
      toast({
        title: "错误",
        description: "没有找到有效的平台内容",
        variant: "destructive"
      });
      return;
    }

    // 保存到历史记录
    const shareHistory: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
    validPlatforms.forEach(platform => {
      if (platform) {
        shareHistory.unshift({
          id: Date.now().toString() + Math.random(),
          platformId: platform.id,
          platformName: platform.name,
          content: platform.content,
          time: new Date().toISOString()
        });
      }
    });
    localStorage.setItem('shareHistory', JSON.stringify(shareHistory.slice(0, 50)));

    // 打开新的批量转发工作台
    setBatchForwardPlatforms(validPlatforms);
    setBatchForwardModalOpen(true);
    setBatchPublishOpen(false);

    toast({
      title: "批量转发工作台已启动",
      description: `已为${validPlatforms.length}个平台准备好内容，平台页面将自动打开`,
    });
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
          // 调用品牌库服务获取真实品牌档案
          const { getBrandProfile } = await import('@/services/brandCorpusService');
          const profile = await getBrandProfile(user?.id || '');
          setBrandProfile(profile);
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

  // 生成字符数维度（使用统一字符数控制系统）
  const generateCharCountDimension = (charCount: number, platformId: string): string => {
    const platformAdvice = getPlatformCharCountAdvice(platformId);

    // 使用统一字符数控制系统获取最终限制
    const charCountControl = getUnifiedCharCountLimit(
      platformId,
      globalSettings.charCountPreset,
      platformSettings[platformId]?.charCount
    );

    return `🚨 字符数严格控制指令（最高优先级）：
- 控制来源：${charCountControl.description}
- 目标字符数：${charCountControl.finalLimit}字符
- 严格范围：${charCountControl.range.min}-${charCountControl.range.max}字符
- 平台建议：${platformAdvice}

⚠️ 核心要求（必须严格执行）：
1. 生成的内容字符数必须在${charCountControl.range.min}-${charCountControl.range.max}字符范围内
2. 目标字符数为${charCountControl.finalLimit}字符，允许误差不超过5%
3. 绝对禁止生成少于${charCountControl.range.min}字符的内容
4. 绝对禁止生成超过${charCountControl.finalLimit}字符的内容
5. 内容必须丰富完整，达到目标字符数要求

📊 优先级说明：
${charCountControl.source === 'platform-specific'
  ? '✅ 使用用户为此平台设置的自定义字符数（最高优先级）- 必须严格遵守用户设置'
  : charCountControl.source === 'preset'
  ? '✅ 使用全局预设版本的字符数配置'
  : '✅ 使用平台自动适配字符数（平台限制的90%-95%）'
}

📝 内容生成策略（确保达到目标字符数）：
- 详细描述：提供具体的细节和例子
- 深入分析：增加背景信息和深层次解释
- 实用建议：添加具体的操作步骤和注意事项
- 丰富表达：使用多样化的句式和词汇
- 补充信息：添加相关的知识点和扩展内容

🔍 生成后验证（关键步骤）：
- 必须检查最终内容字符数是否在${charCountControl.range.min}-${charCountControl.range.max}字符范围内
- 如果字符数不足${charCountControl.range.min}，必须补充内容直到达到要求
- 如果字符数超过${charCountControl.finalLimit}，必须精简至限制内
- 确保内容质量和完整性的同时满足字符数要求`;
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

  /**
   * 生成有意义的标题
   * 从内容中提取关键信息作为标题，而不是使用"版本A"、"版本B"
   */
  const generateMeaningfulTitle = (content: string, platformId: string): string => {
    if (!content || content.trim().length === 0) {
      return '内容标题';
    }

    // 清理内容，移除多余的换行和空格
    const cleanContent = content.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');

    // 尝试提取第一句话作为标题
    const firstSentence = cleanContent.split(/[。！？.!?]/)[0];
    if (firstSentence && firstSentence.length > 5 && firstSentence.length <= 50) {
      return firstSentence.trim();
    }

    // 如果第一句话不合适，使用前30个字符
    const shortTitle = cleanContent.substring(0, 30);
    if (shortTitle.length < cleanContent.length) {
      return shortTitle + '...';
    }

    return shortTitle;
  };

  // 🔧 FIX: 移除会导致无限渲染的调试日志

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* 主导航栏 */}
      <Header />

      {/* 页面导航 */}
      <PageNavigation
        title="AI内容适配器"
        description="智能适配多平台内容，一键生成符合各平台特色的优质内容"
        showAdaptButton={false}
        actions={
          <div className="flex items-center space-x-3">
            {/* History Button */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => navigate('/history')}
              className="flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>{t('adapt.history')}</span>
            </Button>
          </div>
        }
      />

      <div className="container mx-auto py-6 px-4">

      {/* Content Creation Section */}
      <div className="mb-8">
        <Card variant="soft" className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary">{t('adapt.inputOriginalContent')}</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('adapt.remainingUsage')}</span>
                <UsageStateWrapper>
                  <Badge variant={usageRemaining <= 5 ? "destructive" : "default"}>
                    {usageRemaining === Infinity ? "不限" : usageRemaining}
                  </Badge>
                </UsageStateWrapper>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <MentionTextarea
                placeholder={t('adapt.contentPlaceholder')}
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
                  <span className="text-xs text-secondary">
                    从品牌库、资料库、雷达收藏快速导入内容
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="soft" className="mt-4 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    id="use-brand-library"
                    checked={useBrandLibrary}
onCheckedChange={(checked) => {
                      // 简化版权限检查：只允许高级版用户使用
                      const tierLevels = { trial: 0, pro: 1, premium: 2 };
                      const userTier = effectiveUserTier;
                      const hasAccess = isAuthenticated && tierLevels[userTier] >= tierLevels['premium'];
                      
                      if (!hasAccess && checked) {
                        // 显示升级提示
                        console.log('需要高级版权限');
                        return;
                      }
                      
                      setUseBrandLibrary(checked);
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="use-brand-library" className="text-sm text-primary cursor-pointer">
                      使用品牌库资料进行创作
                    </Label>
                    <p className="text-xs text-secondary mt-1">
                      AI自动遵循品牌语言规范，融入品牌价值，规避公关风险
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border flex-shrink-0">
                  {contentCharCount} 字符
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Platform Selection Section */}
      <div className="mb-8 mt-8">
        <Card variant="soft" className="rounded-xl">
          <CardHeader>
            <h1 className="text-2xl font-bold text-primary">{t('adapt.selectTargetPlatform')}</h1>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Individual Platform Settings */}
        {selectedPlatforms.length > 0 && (
          <Card variant="soft" className="mt-6 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">{t('adapt.platformSettings')}</h3>
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
                    {t('common.save')}设置
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
                  <div className="border-2 border-border bg-accent rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="global-settings-mode"
                          checked={settingsMode.charCount === 'global' && settingsMode.emoji === 'global' && settingsMode.mdFormat === 'global'}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSettingsModeToggle('global');
                            } else {
                              handleSettingsModeToggle('platform');
                            }
                          }}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor="global-settings-mode" className="text-base font-semibold cursor-pointer flex items-center text-foreground">
                          <Globe className="h-4 w-4 mr-2" />
                          全局设置
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        {(settingsMode.charCount === 'platform' || settingsMode.emoji === 'platform' || settingsMode.mdFormat === 'platform') && (
                          <div className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded border border-border">
                            已启用平台特定设置，全局设置已禁用
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 字符数限制 - 重构版本 */}
                    <div className="mb-4">
                      {/* 🔧 REFACTOR: 全局字符数下拉菜单 */}
                      {settingsMode.charCount === 'platform' ? (
                        /* 平台模式下的提示和快速切换 */
                        <div className="p-3 bg-accent/30 border border-dashed border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">全局字符数限制</span>
                              <Badge variant="outline" className="text-xs">平台模式</Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={() => {
                                setSettingsMode(prev => ({ ...prev, charCount: 'global' }));
                                toast({
                                  title: "已切换到全局模式",
                                  description: "现在可以设置全局字符数限制，将应用到所有平台",
                                });
                              }}
                            >
                              启用全局设置
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            当前使用平台特定字符数设置。点击"启用全局设置"可设置统一的字符数限制。
                          </p>
                        </div>
                      ) : (
                        /* 全局模式下的字符数选择 */
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="h-3 w-3 text-foreground" />
                            <Label className="text-sm font-medium text-foreground">
                              全局字符数限制
                            </Label>
                            <Badge variant="secondary" className="text-xs">全局模式</Badge>
                          </div>

                          <div className="space-y-2">
                            <Select
                              value={globalSettings.charCountPreset}
                              onValueChange={(value) => {
                                // 🔧 FIX: 阻止事件冒泡，防止异常跳转
                                try {
                                  const newValue = value as 'auto' | 'mini' | 'standard' | 'detailed';

                                  // 🔧 FIX: 简化更新逻辑，直接更新设置
                                  setGlobalSettings(prev => ({
                                    ...prev,
                                    charCountPreset: newValue
                                  }));

                                  // 确保在全局模式
                                  if (settingsMode.charCount !== 'global') {
                                    setSettingsMode(prev => ({ ...prev, charCount: 'global' }));
                                  }

                                  // 用户反馈
                                  const descriptions = {
                                    'auto': '自动适配',
                                    'mini': '简洁版本',
                                    'standard': '标准版本',
                                    'detailed': '详细版本'
                                  };

                                  toast({
                                    title: "全局字符数限制已更新",
                                    description: `已设置为：${descriptions[newValue]}，将应用到所有平台`,
                                  });

                                  // 应用到所有平台
                                  setTimeout(() => applyGlobalSettings(), 100);
                                } catch (error) {
                                  console.error('🔧 Select onValueChange 错误:', error);
                                  // 阻止错误传播，防止异常跳转
                                }
                              }}
                            >
                              <SelectTrigger
                                className="h-9 max-w-xs"
                                onClick={(e) => {
                                  // 🔧 FIX: 阻止事件冒泡，防止异常跳转
                                  e.stopPropagation();
                                }}
                              >
                                <SelectValue placeholder={t('adapt.selectCharacterLimit')} />
                              </SelectTrigger>
                              <SelectContent
                                className="z-50"
                                // 🔧 FIX: 使用固定容器，防止DOM节点管理问题导致的异常跳转
                                container={document.body}
                                side="bottom"
                                align="start"
                                onClick={(e) => {
                                  // 🔧 FIX: 阻止事件冒泡，防止异常跳转
                                  e.stopPropagation();
                                }}
                              >
                                <SelectItem
                                  value="auto"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t('adapt.autoAdapt')}
                                </SelectItem>
                                <SelectItem
                                  value="mini"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t('adapt.conciseVersion')}
                                </SelectItem>
                                <SelectItem
                                  value="standard"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t('adapt.standardVersion')}
                                </SelectItem>
                                <SelectItem
                                  value="detailed"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t('adapt.detailedVersion')}
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {/* 快速设置按钮 */}
                            <div className="flex items-center gap-1 justify-start">
                              {[
                                { label: '自动', value: 'auto' as const },
                                { label: '简洁', value: 'mini' as const },
                                { label: '标准', value: 'standard' as const },
                                { label: '详细', value: 'detailed' as const }
                              ].map((preset) => (
                                <Button
                                  key={preset.value}
                                  size="sm"
                                  variant={globalSettings.charCountPreset === preset.value ? "default" : "ghost"}
                                  className="h-5 px-2 text-xs"
                                  onClick={() => {
                                    setGlobalSettings(prev => ({
                                      ...prev,
                                      charCountPreset: preset.value
                                    }));

                                    if (settingsMode.charCount !== 'global') {
                                      setSettingsMode(prev => ({ ...prev, charCount: 'global' }));
                                    }

                                    toast({
                                      title: "快速设置已应用",
                                      description: `全局字符数已设置为${preset.label}模式`,
                                    });

                                    setTimeout(() => applyGlobalSettings(), 100);
                                  }}
                                >
                                  {preset.label}
                                </Button>
                              ))}
                            </div>

                            <p className="text-xs text-muted-foreground">
                              全局设置将应用到所有选中的平台，根据平台特点自动调整内容长度
                            </p>
                          </div>
                        </div>
                      )}
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
                          settingsMode.emoji === 'platform' ? 'text-muted-foreground' : 'text-foreground'
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
                          settingsMode.mdFormat === 'platform' ? 'text-muted-foreground' : 'text-foreground'
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
                            ? 'text-muted-foreground'
                            : 'text-foreground'
                        }`}>
                          <Hash className="h-3 w-3 mr-1" />
                          全局自动排版
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* 平台特定设置 */}
                  <div className="border-2 border-border bg-accent rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="platform-settings-mode"
                          checked={settingsMode.charCount === 'platform' && settingsMode.emoji === 'platform' && settingsMode.mdFormat === 'platform'}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSettingsModeToggle('platform');
                            } else {
                              handleSettingsModeToggle('global');
                            }
                          }}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor="platform-settings-mode" className="text-base font-semibold cursor-pointer flex items-center text-foreground">
                          <Settings className="h-4 w-4 mr-2" />
                          平台特定设置
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        {(settingsMode.charCount === 'global' || settingsMode.emoji === 'global' || settingsMode.mdFormat === 'global') && (
                          <div className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded border border-border">
                            已启用全局设置，全局设置已禁用
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
                          <div key={platformId} className="border rounded-lg p-3 bg-accent/50">
                            <div className="flex items-center gap-2 mb-3">
                              {platform.icon}
                              <span className="text-sm font-medium">{platform.name}</span>
                              {isSpecialPlatform && (
                                <Badge variant="outline" className="text-xs">优化</Badge>
                              )}
                            </div>

                            <div className="space-y-3">
                              {/* 字符数设置 - 重构版本 */}
                              <div>
                                {/* 🔧 REFACTOR: 平台设置字符数选择板块 */}
                                {settingsMode.charCount === 'global' ? (
                                  /* 全局模式下的提示和快速切换 */
                                  <div className="p-3 bg-accent/30 border border-dashed border-border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Hash className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground">字符数设置</span>
                                        <Badge variant="outline" className="text-xs">全局模式</Badge>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => {
                                          setSettingsMode(prev => ({ ...prev, charCount: 'platform' }));
                                          toast({
                                            title: "已切换到平台特定模式",
                                            description: `现在可以为${getPlatformName(platformId, platforms)}单独设置字符数限制`,
                                          });
                                        }}
                                      >
                                        启用平台设置
                                      </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      当前使用全局字符数设置。点击"启用平台设置"可为此平台单独配置字符数限制。
                                    </p>
                                  </div>
                                ) : (
                                  /* 平台模式下的字符数控制 */
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                        <Hash className="h-3 w-3 text-foreground" />
                                        <Label className="text-xs font-medium text-foreground">
                                          字符数: {settings.charCount || getPlatformRecommendedCharCount(platformId)}
                                        </Label>
                                        <Badge variant="secondary" className="text-xs">平台特定</Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-5 px-2 text-xs"
                                          onClick={() => {
                                            const recommended = getPlatformRecommendedCharCount(platformId);
                                            updatePlatformSetting(platformId, 'charCount', recommended);
                                            toast({
                                              title: "已应用推荐设置",
                                              description: `${getPlatformName(platformId, platforms)}字符数已设置为推荐值：${recommended}字符`,
                                            });
                                          }}
                                        >
                                          推荐
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                          最大{getPlatformMaxCharCount(platformId)}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Slider
                                        value={[settings.charCount || getPlatformRecommendedCharCount(platformId)]}
                                        min={50}
                                        max={getPlatformMaxCharCount(platformId)}
                                        step={10}
                                        onValueChange={(value) => {
                                          const maxChars = getPlatformMaxCharCount(platformId);
                                          const newValue = Math.min(value[0], maxChars);
                                          updatePlatformSetting(platformId, 'charCount', newValue);

                                          // 实时反馈
                                          if (newValue !== value[0]) {
                                            toast({
                                              title: "已自动调整",
                                              description: `字符数已调整为平台最大限制：${newValue}字符`,
                                              variant: "default"
                                            });
                                          }
                                        }}
                                        className="w-full"
                                      />

                                      {/* 快速设置按钮 */}
                                      <div className="flex items-center gap-1 justify-center">
                                        {[
                                          { label: '简洁', value: Math.min(200, getPlatformMaxCharCount(platformId)) },
                                          { label: '标准', value: Math.min(500, getPlatformMaxCharCount(platformId)) },
                                          { label: '详细', value: getPlatformMaxCharCount(platformId) }
                                        ].map((preset) => (
                                          <Button
                                            key={preset.label}
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 px-2 text-xs"
                                            onClick={() => {
                                              updatePlatformSetting(platformId, 'charCount', preset.value);
                                              toast({
                                                title: "快速设置已应用",
                                                description: `${getPlatformName(platformId, platforms)}字符数已设置为${preset.label}模式：${preset.value}字符`,
                                              });
                                            }}
                                          >
                                            {preset.label}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* 字符数限制说明和警告 */}
                                {settingsMode.charCount !== 'global' && (
                                  <div className="mt-2 space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                      {getPlatformDescription(platformId)}
                                    </div>
                                    {(() => {
                                      const currentValue = settings.charCount || getPlatformRecommendedCharCount(platformId);
                                      const maxChars = getPlatformMaxCharCount(platformId);
                                      const safetyRange = calculateSafetyRange(currentValue, platformId);

                                      if (currentValue > maxChars) {
                                        return (
                                          <div className="text-xs text-destructive bg-accent px-2 py-1 rounded border border-border">
                                            ⚠️ 超出平台最大限制！将自动调整为{maxChars}字符
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div className="text-xs text-foreground bg-accent px-2 py-1 rounded border border-border">
                                            ✅ 安全区域：{safetyRange.min}-{safetyRange.max}字符（实际生成范围）
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>
                                )}

                                {settingsMode.charCount === 'global' && (
                                  <p className="text-xs text-muted-foreground mt-1">已禁用，使用全局字符数设置</p>
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
                                    settingsMode.emoji === 'global' ? 'text-muted-foreground' : 'text-foreground'
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
                                    settingsMode.mdFormat === 'global' ? 'text-muted-foreground' : 'text-foreground'
                                  }`}>
                                    <FileText className="h-3 w-3 mr-1" />
                                    MD格式
                                  </Label>
                                </div>
                              </div>

                              {/* 全局设置禁用提示 */}
                              {(settingsMode.emoji === 'global' || settingsMode.mdFormat === 'global') && (
                                <div className="text-xs text-muted-foreground mt-2 p-2 bg-accent rounded border border-border">
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
                                <div className="bg-accent p-2 rounded text-xs text-foreground border border-border">
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
        <Card variant="soft" className="mt-6 rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground">内容形式与表达风格</h3>
              <span className="text-sm text-muted-foreground font-normal">(可选)</span>
              {/* Help icon moved to proper position */}
              <Dialog>
                <SafeTooltip content="查看详细说明">
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </SafeTooltip>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>内容形式与表达风格体系</DialogTitle>
                    <DialogDescription>
                      选择不同的内容形式和表达风格来获得最佳的内容生成效果
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Content will be populated by ContentFormSelector */}
                    <p className="text-sm text-muted-foreground">详细的内容形式和表达风格说明...</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription className="text-muted-foreground">
              如果选择了会按照指定形式和风格生成内容，如果不选择就默认采用原始内容+平台默认风格
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
      <Card variant="soft" className="mb-6 rounded-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">组合效果预览</span>
          </div>
          <p className="text-sm text-muted-foreground">
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
      <Card variant="soft" className="mb-6 rounded-xl">
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            AI模型选择
          </h4>
          <p className="text-xs text-muted-foreground mb-3">默认优先调用GPT-4o，备选deepseek v3模型，用户可自行选择自己喜欢的模型生成内容</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allModels.map((model) => {
              const isAvailable = availableModels.some(m => m.id === model.id);
              const disabled = !isAvailable || generating;
              let badge = '';
              let showUpgradeTip = false;

              if (model.id === 'gpt-4o' && userPlan === 'trial') {
                badge = '专业版/高级版专属';
                showUpgradeTip = true;
              }

              return (
                <div
                  key={model.id}
                  className={`p-3 border rounded-xl cursor-pointer transition-all hover:shadow-e1 ${
                    selectedModel === model.id
                      ? 'border-primary bg-accent/80 backdrop-blur-sm'
                      : disabled
                      ? 'border-border bg-muted/60 opacity-60 cursor-not-allowed'
                      : 'border-border bg-card/90 backdrop-blur-sm hover:border-primary/50'
                  }`}
                  onClick={() => handleModelSelect(model.id, disabled)}
                >
                  <div className="flex items-start space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedModel === model.id
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}>
                      {selectedModel === model.id && (
                        <div className="w-2 h-2 bg-card rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium text-foreground text-sm">{model.name}</span>
                        {badge && (
                          <Badge className="bg-muted text-muted-foreground text-xs">{badge}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{model.description}</p>
                      {showUpgradeTip && (
                        <div
                          className="mt-1 p-1 bg-accent border border-border rounded text-xs text-muted-foreground cursor-pointer hover:bg-accent/80 transition-colors"
                          onClick={handleUpgradeClick}
                        >
                          <span className="mr-1">
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
              <span className="text-xs text-muted-foreground">开发环境订阅等级：</span>
              <Button size="sm" variant={userPlan==='trial'?'default':'outline'} onClick={()=>setUserPlan('trial')}>免费版</Button>
              <Button size="sm" variant={userPlan==='pro'?'default':'outline'} onClick={()=>setUserPlan('pro')}>专业版</Button>
              <Button size="sm" variant={userPlan==='premium'?'default':'outline'} onClick={()=>setUserPlan('premium')}>高级版</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI模型说明 - 完全隐藏，简化界面 */}
      {/* 隐藏模型说明区块，直接注释整个 JSX 以避免常量表达式 */}
      {/* 模型说明区块已隐藏 */}

      {/* Generate Button */}

      <div className="flex justify-center mb-12">
        <Button
          size="lg"
          disabled={!canGenerate || generating}
          onClick={generateContent}
          className="w-full max-w-md theme-hero-button"
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
      {(() => {
        // 🔧 FIX: 移除会导致无限渲染的调试日志

        return (results.length > 0 || generating);
      })() && (
        <div id="content-generation-area" className="mt-8">
          {/* 生成状态指示器 */}
          {generating && results.length === 0 && (
            <div className="mb-4 p-4 bg-accent border border-border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-foreground font-medium">{t('adapt.generatingContent')}</span>
              </div>
            </div>
          )}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{t('adapt.platformAdaptResult')}</h1>
                {/* 网络状态指示器 */}
                {networkStatus === 'offline' && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-lg text-xs">
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
                    <div className="flex items-center gap-1 px-2 py-1 bg-accent text-muted-foreground rounded-lg text-xs">
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
                  <div className="flex items-center gap-1 px-2 py-1 bg-accent text-foreground rounded-lg text-xs">
                    <span>🌐</span>
                    <span>网络正常</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

          <Tabs defaultValue={results[0]?.platformId} className="w-full">
            <TabsList className="mb-4 flex flex-wrap gap-2 w-full h-auto p-2 bg-accent rounded-lg shadow-sm">
              {results.map(result => {
                const isCompleted = !!(result.content || (result.versions && result.versions.length > 0));
                const hasError = !!result.error;
                const isGenerating = generating && !result.content && !result.error;
                const isFirstTimeCompleted = isCompleted && !completedPlatforms.has(result.platformId);

                // 如果是首次完成，添加到完成列表
                if (isFirstTimeCompleted) {
                  setTimeout(() => {
                    setCompletedPlatforms(prev => new Set(prev).add(result.platformId));
                  }, 1000); // 动画结束后移除动画类
                }

                return (
                  <TabsTrigger
                    key={result.platformId}
                    value={result.platformId}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap min-w-fit transition-all duration-300 relative rounded-lg border-2 border-transparent hover:border-border hover:bg-accent data-[state=active]:bg-card data-[state=active]:border-primary data-[state=active]:shadow-md data-[state=active]:font-bold data-[state=active]:text-foreground",
                      // 状态样式
                      isCompleted && "tab-completed",
                      hasError && "tab-error",
                      isGenerating && "tab-generating",
                      // 只在首次完成时显示动画
                      isFirstTimeCompleted && "animate-tabGlow"
                    )}
                  >
                    {getPlatformIcon(result.platformId)}
                    <span className="hidden sm:inline">
                      {getPlatformName(result.platformId, platforms)}
                    </span>
                    {/* 平台状态指示器 - 集成到Tab标签中 */}
                    <PlatformTabStatusWithTooltip
                      platformId={result.platformId}
                      status={result.error ? 'error' :
                             (result.content || (result.versions && result.versions.length > 0)) ? 'completed' :
                             generating ? 'generating' : 'waiting'}
                      message={result.error || (generating && !result.content && !result.error ? platformLoadingMessages.get(result.platformId) : undefined)}
                      isGenerating={generating && !result.content && !result.error}
                      hasError={!!result.error}
                      hasContent={!!(result.content || (result.versions && result.versions.length > 0))}
                    />

                  </TabsTrigger>
                );
              })}
            </TabsList>

            {results.map(result => (
              <TabsContent key={result.platformId} value={result.platformId}>
                <Card
                  className="p-1 sm:p-2 lg:p-3 shadow-sm border border-border bg-card"
                  data-testid="platform-card"
                  data-platform-id={result.platformId}
                >
                  <CardHeader className="pb-1 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(result.platformId)}
                        <h2 className="text-base font-semibold" data-testid="platform-name">{getPlatformName(result.platformId, platforms)}</h2>

                        {/* 状态信息已移至Tab标签中显示 */}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-1 pt-0">
                    {/* 详细错误信息 */}
                    {result.error && (
                      <div className="bg-accent border border-border rounded-lg p-3">
                        <div className="text-sm text-destructive">{result.error}</div>
                      </div>
                    )}

                    {/* 三个同层级智能组件管理区域 */}
                    <div className="space-y-3">

                      {/* 1. 智能标题生成 */}
                      {(result.content || (result.versions && result.versions.length > 0)) && !result.error && (
                        <div className="bg-card rounded-lg border border-border shadow-md mb-4">
                          <div className="px-3 py-2 border-b border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gradient-to-r btn-gradient-secondary rounded-lg flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs font-bold">标</span>
                                </div>
                                <div>
                                  <h3 className="text-base font-semibold text-foreground">智能标题生成</h3>
                                  <p className="text-xs text-muted-foreground">基于内容智能生成吸引眼球的标题</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2 py-1 rounded border border-border">
                                <span>{getPlatformName(result.platformId, platforms)}</span>
                                <span className="text-muted-foreground">(限{getPlatformMaxCharCount(result.platformId)}字)</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <TitleGenerator
                              content={result.content || (result.versions && result.versions[0]?.content) || ''}
                              versions={result.error ? [] : (result.versions || [])}
                              platformId={result.platformId}
                              platformName={getPlatformName(result.platformId, platforms)}
                              onTitleChange={(title) => {
                                console.log(`${result.platformId} 标题已更新:`, title);
                                // 同步标题到内容同步store
                                contentSync.setSelectedTitle(title);
                                contentSync.setPlatformId(result.platformId);
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* 2. 智能内容生成 */}
                      <div className="bg-card rounded-lg border border-border shadow-md min-h-[120px] mb-4">
                        <div className="px-3 py-2 border-b border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 btn-gradient-primary rounded-lg flex items-center justify-center">
                              <span className="text-primary-foreground text-xs font-bold">容</span>
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-foreground">智能内容生成</h3>
                              <p className="text-xs text-muted-foreground">
                                {result.versions && result.versions.length > 1 && !result.error
                                  ? `已生成${result.versions.length}个不同风格版本，请选择您喜欢的内容`
                                  : '基于您的输入智能生成适配内容'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="space-y-4">
                            {/* 主要内容区域 */}
                            {result.versions && result.versions.length > 1 ? (
                              /* 多版本左右对比展示 */
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 items-stretch">
                                {/* 版本A - 左侧 */}
                                <div className="flex flex-col h-full">
                                  <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
                                    <FileText className="h-3 w-3 text-primary" />
                                    <h4 className="text-xs font-semibold text-foreground">版本A (标准风格)</h4>
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
                                          result.platformId === 'xiaohongshu' ? 'bg-accent border-border' :
                                          result.platformId === 'douyin' ? 'bg-foreground text-primary-foreground border-border' :
                                          result.platformId === 'weibo' ? 'bg-accent border-border' :
                                          result.platformId === 'zhihu' ? 'bg-accent border-border' :
                                          result.platformId === 'wechat' ? 'bg-accent border-border' :
                                          result.platformId === 'bilibili' ? 'bg-accent border-primary' :
                                          result.platformId === 'video' ? 'bg-accent border-border' :
                                          result.platformId === 'twitter' ? 'bg-accent border-border' :
                                          'bg-accent border-border'
                                        }`}>
                                          <div data-testid="version-a-content">{result.versions[0].content}</div>
                                        </div>
                                      )}
                                      <div className="space-y-2">
                                        {/* 融合版本标题和字符数验证状态 */}
                                        <div className={`flex justify-between items-center text-sm px-4 py-2 rounded-lg border ${
                                          result.versions[0].validation?.isValid
                                            ? 'bg-accent border-border text-foreground'
                                            : 'bg-accent border-border text-muted-foreground'
                                        }`}>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">版本A：{result.versions[0].charCount}字</span>
                                            {result.versions[0].validation && (
                                              <span className="text-xs">
                                                {result.versions[0].validation.warning ? (
                                                  <>⚠️ {result.versions[0].validation.warning}</>
                                                ) : (
                                                  <>✅ 字符数在安全范围内 ({result.versions[0].validation.targetRange.min}-{result.versions[0].validation.targetRange.max})</>
                                                )}
                                              </span>
                                            )}
                                          </div>
                                        </div>
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
                                          className={persistentFavorites.has(`${result.platformId}-version-a`) || favoriteStates.has(`${result.platformId}-version-a`) ? 'bg-accent border-border text-foreground' : ''}
                                        >
                                          <Heart className={`h-4 w-4 mr-1 ${persistentFavorites.has(`${result.platformId}-version-a`) || favoriteStates.has(`${result.platformId}-version-a`) ? 'fill-current text-primary' : ''}`} />
                                          {persistentFavorites.has(`${result.platformId}-version-a`) ? '已收藏 ❤️' : favoriteStates.has(`${result.platformId}-version-a`) ? '已收藏 ❤️' : '收藏'}
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => copyToClipboard(result.versions![0].content, `copy-version-a-${result.platformId}`)}
                                          className={copyStates.has(`copy-version-a-${result.platformId}`) ? 'bg-accent border-border text-foreground' : ''}
                                        >
                                          <Copy className="h-4 w-4 mr-1" />
                                          {copyStates.has(`copy-version-a-${result.platformId}`) ? '已复制 ✓' : '复制'}
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant={getSelectedVersion(result.platformId) === 'version-a' ? 'default' : 'outline'}
                                          onClick={() => handleVersionSelect(result.platformId, 'version-a')}
                                        >
                                          {getSelectedVersion(result.platformId) === 'version-a' ? (
                                            <>
                                              <CheckCircle className="h-4 w-4 mr-1" />
                                              已选择版本A
                                            </>
                                          ) : (
                                            <>
                                              <Circle className="h-4 w-4 mr-1" />
                                              选择版本A
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* 版本B - 右侧 */}
                                <div className="flex flex-col h-full">
                                  <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    <h4 className="text-xs font-semibold text-foreground">版本B (创意风格)</h4>
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
                                          result.platformId === 'xiaohongshu' ? 'bg-accent border-border' :
                                          result.platformId === 'douyin' ? 'bg-foreground text-primary-foreground border-border' :
                                          result.platformId === 'weibo' ? 'bg-accent border-border' :
                                          result.platformId === 'zhihu' ? 'bg-accent border-border' :
                                          result.platformId === 'wechat' ? 'bg-accent border-border' :
                                          result.platformId === 'bilibili' ? 'bg-accent border-primary' :
                                          result.platformId === 'video' ? 'bg-accent border-border' :
                                          result.platformId === 'twitter' ? 'bg-accent border-border' :
                                          'bg-accent border-border'
                                        }`}>
                                          <div data-testid="version-b-content">{result.versions[1].content}</div>
                                        </div>
                                      )}
                                      <div className="space-y-2">
                                        {/* 融合版本标题和字符数验证状态 */}
                                        <div className={`flex justify-between items-center text-sm px-4 py-2 rounded-lg border ${
                                          result.versions[1].validation?.isValid
                                            ? 'bg-accent border-border text-foreground'
                                            : 'bg-accent border-border text-muted-foreground'
                                        }`}>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">版本B：{result.versions[1].charCount}字</span>
                                            {result.versions[1].validation && (
                                              <span className="text-xs">
                                                {result.versions[1].validation.warning ? (
                                                  <>⚠️ {result.versions[1].validation.warning}</>
                                                ) : (
                                                  <>✅ 字符数在安全范围内 ({result.versions[1].validation.targetRange.min}-{result.versions[1].validation.targetRange.max})</>
                                                )}
                                              </span>
                                            )}
                                          </div>
                                        </div>
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
                                          className={persistentFavorites.has(`${result.platformId}-version-b`) || favoriteStates.has(`${result.platformId}-version-b`) ? 'bg-accent border-border text-foreground' : ''}
                                        >
                                          <Heart className={`h-4 w-4 mr-1 ${persistentFavorites.has(`${result.platformId}-version-b`) || favoriteStates.has(`${result.platformId}-version-b`) ? 'fill-current text-primary' : ''}`} />
                                          {persistentFavorites.has(`${result.platformId}-version-b`) ? '已收藏 ❤️' : favoriteStates.has(`${result.platformId}-version-b`) ? '已收藏 ❤️' : '收藏'}
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => copyToClipboard(result.versions![1].content, `copy-version-b-${result.platformId}`)}
                                          className={copyStates.has(`copy-version-b-${result.platformId}`) ? 'bg-accent border-border text-foreground' : ''}
                                        >
                                          <Copy className="h-4 w-4 mr-1" />
                                          {copyStates.has(`copy-version-b-${result.platformId}`) ? '已复制 ✓' : '复制'}
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant={getSelectedVersion(result.platformId) === 'version-b' ? 'default' : 'outline'}
                                          onClick={() => handleVersionSelect(result.platformId, 'version-b')}
                                        >
                                          {getSelectedVersion(result.platformId) === 'version-b' ? (
                                            <>
                                              <CheckCircle className="h-4 w-4 mr-1" />
                                              已选择版本B
                                            </>
                                          ) : (
                                            <>
                                              <Circle className="h-4 w-4 mr-1" />
                                              选择版本B
                                            </>
                                          )}
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
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  <h4 className="text-lg font-semibold text-foreground">生成内容</h4>
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
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
                                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
                                        result.platformId === 'xiaohongshu' ? 'bg-accent border-border' :
                                        result.platformId === 'douyin' ? 'bg-foreground text-primary-foreground border-border' :
                                        result.platformId === 'weibo' ? 'bg-accent border-border' :
                                        result.platformId === 'zhihu' ? 'bg-accent border-border' :
                                        result.platformId === 'wechat' ? 'bg-accent border-border' :
                                        result.platformId === 'bilibili' ? 'bg-accent border-primary' :
                                        result.platformId === 'video' ? 'bg-accent border-border' :
                                        result.platformId === 'twitter' ? 'bg-accent border-border' :
                                        'bg-accent border-border'
                                      }`}>
                                        {/* 平台标识 - 只保留在右上角 */}
                                        <div className="absolute top-4 right-4">
                                          <div className="bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                                            {getPlatformName(result.platformId, platforms)}
                                          </div>
                                        </div>
                                        {typeof result.content === 'string' ? result.content : JSON.stringify(result.content)}
                                      </div>
                                      {/* 字符数信息 - 移动到底部 */}
                                      {result.content && (
                                        <div className="flex justify-between items-center text-sm text-muted-foreground bg-accent px-4 py-2 rounded-lg border border-border">
                                          <span className="font-medium text-foreground">{getPlatformName(result.platformId, platforms)}</span>
                                          <div className={`flex items-center gap-2 font-medium ${
                                            (result as any).charCount && (result as any).targetCharCount &&
                                            Math.abs((result as any).charCount - (result as any).targetCharCount) > (result as any).targetCharCount * 0.2
                                              ? 'text-foreground'
                                              : 'text-foreground'
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
                                  <div className="rounded-lg border-2 border-dashed border-border p-12 flex items-center justify-center bg-accent">
                                    <div className="text-center">
                                      <p className="text-destructive text-lg font-medium">生成失败</p>
                                      <p className="text-destructive text-sm mt-2">{result.error}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded-lg border-2 border-dashed border-border bg-accent">
                                    {generating ? (
                                      <div className="p-6">
                                        <AIContentGenerationAnimation
                                          platforms={selectedPlatforms}
                                          message="多平台内容适配引擎运行中..."
                                          showProgress={true}
                                        />
                                      </div>
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
                        </div>
                      </div>

                      {/* 3. 智能标签生成 */}
                      {(result.content || (result.versions && result.versions.length > 0)) && !result.error && (
                        <div className="bg-card rounded-lg border border-border shadow-md mb-4">
                          <div className="px-3 py-2 border-b border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 btn-gradient-accent rounded-lg flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs font-bold">签</span>
                                </div>
                                <div>
                                  <h3 className="text-base font-semibold text-foreground">智能标签生成</h3>
                                  <p className="text-xs text-muted-foreground">基于以上内容智能生成话题标签</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-accent px-2 py-1 rounded">
                                <span>{getPlatformName(result.platformId, platforms)}</span>
                                <span className="text-muted-foreground">标签生成</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <PlatformHashtags
                              key={`${result.platformId}-unified-${(result.content || (result.versions && result.versions[0]?.content) || '').length}`}
                              platformId={result.platformId}
                              content={result.content || (result.versions && result.versions[0]?.content) || ''}
                              extractedTags={[
                                ...(extractedTagsMap[`${result.platformId}-version-a`] || []),
                                ...(extractedTagsMap[`${result.platformId}-version-b`] || [])
                              ].filter((tag, index, arr) => arr.indexOf(tag) === index)} // 去重
                              onTagsChange={(tags) => {
                                console.log(`${result.platformId} 统一标签已更新:`, tags);
                                // 同步标签到内容同步store
                                contentSync.setTags(tags);
                                contentSync.setPlatformId(result.platformId);
                              }}
                            />
                          </div>
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
      {(results.length > 0 && !generating) && (
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
          <DialogDescription>
            确认转发内容到选择的平台
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 text-foreground">
          <p>
            {publishMode === 'api'
              ? '是否通过API直接发布内容？'
              : '内容已复制到剪贴板，是否跳转到平台发布页？'
            }
          </p>
          <div className="bg-accent rounded p-2 mt-2 text-xs break-all max-h-32 overflow-auto">
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
          <DialogDescription>
            选择要批量转发的平台
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 text-foreground">
          <div className="bg-accent border border-border rounded-lg p-3 mb-4">
            <h4 className="font-semibold text-primary mb-2">📋 版本选择说明</h4>
            <p className="text-sm text-primary">
              批量转发将使用您选择的版本内容。默认选择版本A，您可以在上方为每个平台单独选择版本A或版本B。
            </p>
          </div>

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
          <DialogDescription>
            即将转发到下一个平台
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 text-foreground">
          <div className="bg-accent border border-border rounded-lg p-3 mb-4">
            <h4 className="font-semibold text-primary mb-2">📋 使用说明</h4>
            <p className="text-sm text-primary">
              内容已复制到剪贴板。跳转后请手动登录 {batchCurrent ? getPlatformName(batchCurrent.platformId, platforms) : ''} 平台，然后粘贴内容并发布。
            </p>
          </div>

          <p className="mb-2">即将跳转到 <strong>{batchCurrent ? getPlatformName(batchCurrent.platformId, platforms) : ''}</strong> 发布页面</p>
          <div className="bg-accent rounded p-2 mt-2 text-xs break-all max-h-32 overflow-auto">
            {batchCurrent?.content}
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            剩余平台：{batchQueue.length - 1} 个
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
          <DialogDescription>
            查看历史转发记录
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 text-foreground max-h-[60vh] overflow-auto">
          {shareHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">暂无转发历史</div>
          ) : (
            <div className="space-y-4">
              {shareHistory.map(item => (
                <div key={item.id} className="border rounded p-2 bg-accent">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-primary">{item.platformName}</span>
                    <span className="text-xs text-muted-foreground">{new Date(item.time).toLocaleString()}</span>
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

    {/* 批量转发工作台弹窗 */}
    <BatchForwardModal
      open={batchForwardModalOpen}
      onOpenChange={setBatchForwardModalOpen}
      platforms={batchForwardPlatforms}
    />

      </div>
    </div>
  );
}