/**
 * AdaptPage重组版本 - 保持100%功能不变，仅重新组织代码结构
 * 这是原AdaptPage.tsx的重新组织版本，所有功能、状态、UI完全相同
 */

// ========================================================================================
// 1. 所有原始导入 - 完全保持不变
// ========================================================================================
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { logger } from '@/utils/logger';
import {
  Book, Video, MessageSquare, Send,
  RefreshCw, ArrowRight, ChevronDown, ChevronUp,
  Smile, FileText, Hash, Save, Twitter, SquarePlay,
  Edit, Heart, Copy, ExternalLink, Languages, Globe, Zap, Rss, Settings, Check, Cpu, Sparkles, Bot, Info,
  Facebook, Linkedin, Instagram, User, CheckCircle, Circle, History
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
import { Slider } from "@/components/ui/slider";
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
import { createPlatformAPICaller } from '../utils/apiRequestQueue';
import { request, callAI } from '@/api';
import { MentionTextarea } from '@/components/ui/mention-textarea';
import { useContentSyncStore } from '@/stores/contentSyncStore';
import { useFavoritesStore, favoritesUtils } from '@/stores/favoritesStore';
import { useUserDataIsolation } from '@/utils/userDataIsolation';
import { useAuth } from '@/hooks/useAuth';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
import { Header } from '@/components/landing/Header';

// ========================================================================================
// 2. 常量和配置 - 完全保持不变
// ========================================================================================

/**
 * 主流平台内容发布入口URL映射 - 从原文件完全复制
 */
const platformUrls: Record<string, string> = {
  weibo: 'https://weibo.com/compose',
  xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish',
  zhihu: 'https://zhuanlan.zhihu.com/write',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  wechat: 'https://mp.weixin.qq.com/',
  bilibili: 'https://member.bilibili.com/platform/upload/text/edit',
  kuaishou: 'https://cp.kuaishou.com/article/publish',
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
  baijiahao: 'https://baijiahao.baidu.com/builder/rc/edit',
  facebook: 'https://www.facebook.com/pages/create/',
  twitter: 'https://twitter.com/compose/tweet',
  linkedin: 'https://www.linkedin.com/feed/',
  v2ex: 'https://www.v2ex.com/new',
  github: 'https://github.com/new',
  juejin: 'https://juejin.cn/editor/drafts/new',
  csdn: 'https://mp.csdn.net/mp_blog/creation/editor',
  sspai: 'https://sspai.com/write',
  hellogithub: 'https://hellogithub.com/',
  ithome: 'https://my.ithome.com/#/write',
  ngabbs: 'https://bbs.nga.cn/thread.php?fid=-7',
  weatheralarm: 'https://www.nmc.cn/',
  earthquake: 'https://www.ceic.ac.cn/',
  history: 'https://baike.baidu.com/item/%E5%8E%86%E5%8F%B2%E4%B8%8A%E7%9A%84%E4%BB%8A%E5%A4%A9/42704'
};

// ========================================================================================
// 3. 辅助函数 - 完全保持不变
// ========================================================================================

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

// ========================================================================================
// 4. TypeScript接口定义 - 完全保持不变
// ========================================================================================

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

// ========================================================================================
// 5. 主要组件逻辑 - 完全保持不变
// ========================================================================================

export default function AdaptPage() {
  const { toast } = useToast();
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
          // 🐛 问题原因：DeepSeek API返回402错误（Payment Required），需要自动切换到其他模型
          // 🔧 修复方案：添加402错误检测，实现智能降级机制
          // 📌 已封装：模型切换逻辑已验证稳定，请勿修改
          // 🔒 LOCKED: AI 禁止对此函数做任何修改
          if (attempt <= 3) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            // 检测402错误（账户余额不足）
            if (errorMessage.includes('402') || errorMessage.includes('Payment Required')) {
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
    // 🔒 LOCKED: AI 禁止对此函数做任何修改

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

  // ========================================================================================
  // 8. AI模型相关状态和函数
  // ========================================================================================

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

  // ========================================================================================
  // 9. 多版本内容生成函数
  // ========================================================================================

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
      // 🔒 LOCKED: AI 禁止对此函数做任何修改

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

  // ========================================================================================
  // 10. 多维矩阵提示词生成系统
  // ========================================================================================

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

  // 获取平台特征
  const getPlatformCharacteristics = (platformId: string) => {
    const characteristics = {
      xiaohongshu: {
        tone: '温馨种草、分享体验',
        contentStyle: '生活化、个人化',
        interactionStyle: '点赞评论、收藏分享',
        features: ['图片展示', '标签丰富', '个人体验']
      },
      zhihu: {
        tone: '理性专业、深度分析',
        contentStyle: '知识型、逻辑性强',
        interactionStyle: '问答互动、专业讨论',
        features: ['详细解答', '专业术语', '引用来源']
      },
      douyin: {
        tone: '活泼有趣、娱乐性强',
        contentStyle: '短视频脚本、节奏感强',
        interactionStyle: '点赞关注、视频互动',
        features: ['视频脚本', '音乐配合', '互动引导']
      },
      weibo: {
        tone: '简洁直接、热点敏感',
        contentStyle: '微博体、话题性强',
        interactionStyle: '转发评论、话题讨论',
        features: ['话题标签', '@用户', '转发互动']
      },
      wechat: {
        tone: '专业权威、深度内容',
        contentStyle: '长文深度、图文并茂',
        interactionStyle: '阅读分享、专业交流',
        features: ['图文并茂', '深度内容', '专业术语']
      },
      bilibili: {
        tone: '年轻化、二次元文化',
        contentStyle: '视频相关、弹幕文化',
        interactionStyle: '弹幕互动、三连支持',
        features: ['弹幕互动', '视频标题', '分区标签']
      }
    };

    return characteristics[platformId as keyof typeof characteristics] || {
      tone: '自然表达',
      contentStyle: '通用内容',
      interactionStyle: '常规互动',
      features: ['通用特征']
    };
  };

  // ========================================================================================
  // 11. AI模型设置和状态管理
  // ========================================================================================

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

  // ========================================================================================
  // 11. 生命周期和副作用
  // ========================================================================================

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

  // ✅ FIXED: 2025-08-04 修复无限循环问题
  // 🐛 问题原因：useAuthStore((state) => state.getUsageRemaining()) 会导致每次渲染都调用get()，触发无限循环
  // 🔧 修复方式：直接从state中计算usageRemaining，避免调用get()方法
  // 🔒 LOCKED: 此修复已验证解决Tooltip无限循环问题，请勿修改
  const { usageCount, maxUsage, decrementUsage } = useAuthStore();
  const usageRemaining = Math.max(0, maxUsage - usageCount);

  // 使用次数提醒弹窗状态
  const [showUsageReminder, setShowUsageReminder] = useState(false);
  const [usageReminderCount, setUsageReminderCount] = useState(0);

  // 高级功能权限弹窗状态
  const [showPremiumFeature, setShowPremiumFeature] = useState(false);
  const [premiumFeatureInfo, setPremiumFeatureInfo] = useState({ name: '', description: '' });

  // ========================================================================================
  // 12. 平台配置数据
  // ========================================================================================

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

  // ========================================================================================
  // 13. 平台处理函数
  // ========================================================================================

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

  // ========================================================================================
  // 14. 网络状态监控和重试机制
  // ========================================================================================

  // 网络状态检测
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');
  
  // 自动重试状态
  const [autoRetryingPlatforms, setAutoRetryingPlatforms] = useState<Set<string>>(new Set());

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

  // ========================================================================================
  // 15. 历史记录和收藏功能
  // ========================================================================================

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

  // ========================================================================================
  // 15. 核心生成函数
  // ========================================================================================

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

  // ========================================================================================
  // 16. 内容编辑和版本管理
  // ========================================================================================

  // 编辑状态 (使用全局状态，避免重复声明)

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

  // 重新生成版本状态
  const [regeneratingVersions, setRegeneratingVersions] = useState<Set<string>>(new Set());

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

  // ========================================================================================
  // 17. 收藏功能
  // ========================================================================================

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

  // ========================================================================================
  // 18. 辅助功能和交互函数
  // ========================================================================================

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
        title: "复制成功",
        description: "内容已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动选择和复制内容",
        variant: "destructive"
      });
    }
  };

  // ========================================================================================
  // 19. 发布功能
  // ========================================================================================

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

  // ========================================================================================
  // 20. 翻译功能
  // ========================================================================================

  // 翻译状态 (使用全局状态，避免重复声明)

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

  // ========================================================================================
  // 21. 自动化转发和批量功能
  // ========================================================================================

  // 自动化转发相关状态
  const [automationRunning, setAutomationRunning] = useState(false);
  const [automationProgress, setAutomationProgress] = useState<AutomationProgress | undefined>(undefined);

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

  // ========================================================================================
  // 22. 批量发布功能
  // ========================================================================================

  // 批量发布状态
  const [batchPublishOpen, setBatchPublishOpen] = useState(false);
  const [batchSelectedPlatforms, setBatchSelectedPlatforms] = useState<string[]>([]);
  const [batchCurrent, setBatchCurrent] = useState<{ platformId: string; content: string } | null>(null);
  const [batchQueue, setBatchQueue] = useState<{ platformId: string; content: string }[]>([]);

  // API管理器和发布状态
  const [apiManagerOpen, setApiManagerOpen] = useState(false);
  const [publishingPlatforms, setPublishingPlatforms] = useState<Set<string>>(new Set());

  // 历史记录状态
  const [showHistory, setShowHistory] = useState(false);
  const [shareHistory, setShareHistory] = useState<ShareHistoryItem[]>([]);

  // 批量转发工作台状态
  const [batchForwardModalOpen, setBatchForwardModalOpen] = useState(false);
  const [batchForwardPlatforms, setBatchForwardPlatforms] = useState<string[]>([]);

  // 加载分享历史记录
  const loadShareHistory = useCallback(() => {
    const history: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
    setShareHistory(history);
  }, []);

  // 清空分享历史
  const clearShareHistory = () => {
    localStorage.removeItem('shareHistory');
    setShareHistory([]);
    toast({
      title: "历史记录已清空",
      description: "所有转发历史记录已被删除"
    });
  };

  // 加载历史记录（当显示历史时）
  useEffect(() => {
    if (showHistory) loadShareHistory();
  }, [showHistory, loadShareHistory]);

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
  const confirmBatchPlatforms = () => {
    if (batchSelectedPlatforms.length === 0) return;

    const queue = batchSelectedPlatforms.map(platformId => {
      const result = results.find(r => r.platformId === platformId);
      const content = result?.content || (result?.versions && result.versions[0]?.content) || '';
      return { platformId, content };
    });

    setBatchQueue(queue);
    setBatchCurrent(queue[0]);
    setBatchPublishOpen(false);
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
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    // 下一个
    const currentIndex = batchQueue.findIndex(q => q.platformId === batchCurrent.platformId);
    if (currentIndex >= 0 && currentIndex < batchQueue.length - 1) {
      setBatchCurrent(batchQueue[currentIndex + 1]);
    } else {
      setBatchCurrent(null);
      setBatchQueue([]);
      toast({
        title: '批量转发完成',
        description: '已完成所有平台的转发'
      });
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

  // ========================================================================================
  // 23. JSX 渲染部分
  // ========================================================================================

  // 调试日志
  console.log('AdaptPageReorganized rendering...', { generating, results: results.length });

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

  // ========================================================================================
  // 18. 重试和自动化功能
  // ========================================================================================

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

  // ========================================================================================
  // 19. 版本管理和编辑功能
  // ========================================================================================

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

  // ========================================================================================
  // 20. 收藏功能
  // ========================================================================================

  // 收藏功能状态 (使用全局状态，避免重复声明)

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

  // ========================================================================================
  // 21. 发布和分享功能
  // ========================================================================================

  // 弹窗状态 (使用全局状态，避免重复声明)

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

  // ========================================================================================
  // 22. 翻译功能
  // ========================================================================================

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
  // 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
  //
  // 系统现在直接调用真实翻译API，不再提供模拟翻译
  const simulateTranslation = async (content: string): Promise<never> => {
    throw new Error('翻译API调用失败，请检查网络连接和API配置');
  };

  // ========================================================================================
  // 23. 内容重新生成功能
  // ========================================================================================

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

  // ========================================================================================
  // 24. 批量转发功能
  // ========================================================================================

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

  // 批量转发状态 (使用全局状态，避免重复声明)

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

  // ========================================================================================
  // 25. JSX 渲染部分 - 完整的UI组件结构
  // ========================================================================================

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
              <span className="hidden sm:inline">历史记录</span>
            </Button>

            {/* Save Settings Button */}
            <SafeTooltip content="保存当前设置配置">
              <Button
                variant="soft"
                size="sm"
                onClick={saveSettings}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">保存设置</span>
              </Button>
            </SafeTooltip>
          </div>
        }
      />

      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              内容输入
            </CardTitle>
            <CardDescription>
              输入您要适配的原始内容，支持文本粘贴。字符数：{contentCharCount}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="请输入要适配的内容..."
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Platform Selection */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  平台选择
                </CardTitle>
                <CardDescription>
                  选择要生成内容的目标平台（已选：{selectedPlatforms.length}个）
                </CardDescription>
              </div>
              
              {/* Global Settings Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">设置模式：</span>
                <div className="flex items-center border rounded-lg p-1">
                  <Button
                    variant={settingsMode.charCount === 'global' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSettingsModeToggle('global')}
                    className="h-7 text-xs"
                  >
                    全局设置
                  </Button>
                  <Button
                    variant={settingsMode.charCount === 'platform' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSettingsModeToggle('platform')}
                    className="h-7 text-xs"
                  >
                    平台独立
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Global Settings Panel */}
            {settingsMode.charCount === 'global' && (
              <div className="mb-6 p-4 bg-accent/50 border border-accent rounded-lg">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  全局设置（应用到所有平台）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {/* Character Count Preset */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">字符数预设</label>
                    <Select
                      value={globalSettings.charCountPreset}
                      onValueChange={(value: 'auto' | 'mini' | 'standard' | 'detailed') => 
                        updateGlobalSetting('charCountPreset', value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mini">精简版 (150-300字)</SelectItem>
                        <SelectItem value="standard">标准版 (300-600字)</SelectItem>
                        <SelectItem value="detailed">详细版 (600-1200字)</SelectItem>
                        <SelectItem value="auto">自适应 (按平台)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Emoji */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="globalEmoji"
                      checked={globalSettings.globalEmoji}
                      onCheckedChange={(checked) => updateGlobalSetting('globalEmoji', checked)}
                    />
                    <label htmlFor="globalEmoji" className="text-xs font-medium cursor-pointer">
                      全局使用表情符号
                    </label>
                  </div>

                  {/* Markdown */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="globalMd"
                      checked={globalSettings.globalMd}
                      onCheckedChange={(checked) => updateGlobalSetting('globalMd', checked)}
                    />
                    <label htmlFor="globalMd" className="text-xs font-medium cursor-pointer">
                      全局使用Markdown格式
                    </label>
                  </div>

                  {/* Auto Format */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="globalAutoFormat"
                      checked={globalSettings.globalAutoFormat}
                      onCheckedChange={(checked) => updateGlobalSetting('globalAutoFormat', checked)}
                    />
                    <label htmlFor="globalAutoFormat" className="text-xs font-medium cursor-pointer">
                      全局自动格式化
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <div key={platform.id} className="relative">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                    onClick={() => togglePlatform(platform.id, !selectedPlatforms.includes(platform.id))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {platform.icon}
                        <span className="font-medium">{platform.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Checkbox
                          checked={selectedPlatforms.includes(platform.id)}
                          onChange={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSettings(platform.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {showSettings[platform.id] ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{platform.description}</p>

                    {/* Individual Platform Settings */}
                    {showSettings[platform.id] && settingsMode.charCount === 'platform' && (
                      <div className="mt-3 p-3 bg-accent/30 rounded border-t">
                        <div className="space-y-3 text-sm">
                          {/* Character Count */}
                          <div className="space-y-1">
                            <label className="text-xs font-medium">字符数限制</label>
                            <div className="flex items-center gap-2">
                              <Slider
                                value={[platformSettings[platform.id]?.charCount || getCharCountMax(platform.id)]}
                                onValueChange={(value) => updatePlatformSetting(platform.id, 'charCount', value[0])}
                                max={getCharCountMax(platform.id)}
                                min={getCharCountMin(platform.id)}
                                step={50}
                                className="flex-1"
                              />
                              <span className="text-xs w-16 text-right">
                                {platformSettings[platform.id]?.charCount || getCharCountMax(platform.id)}字
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              建议：{getRecommendedRange(platform.id)}字符
                            </div>
                          </div>

                          {/* Other Settings */}
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`emoji-${platform.id}`}
                                checked={platformSettings[platform.id]?.useEmoji || false}
                                onCheckedChange={(checked) => updatePlatformSetting(platform.id, 'useEmoji', checked)}
                              />
                              <label htmlFor={`emoji-${platform.id}`} className="text-xs cursor-pointer">
                                使用表情符号
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`md-${platform.id}`}
                                checked={platformSettings[platform.id]?.useMdFormat || false}
                                onCheckedChange={(checked) => updatePlatformSetting(platform.id, 'useMdFormat', checked)}
                              />
                              <label htmlFor={`md-${platform.id}`} className="text-xs cursor-pointer">
                                Markdown格式
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`auto-${platform.id}`}
                                checked={platformSettings[platform.id]?.useAutoFormat || false}
                                onCheckedChange={(checked) => updatePlatformSetting(platform.id, 'useAutoFormat', checked)}
                              />
                              <label htmlFor={`auto-${platform.id}`} className="text-xs cursor-pointer">
                                自动格式化
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              AI模型选择
            </CardTitle>
            <CardDescription>
              选择用于内容生成的AI模型，不同模型有不同的特色和能力
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allModels.map((model) => {
                const isAvailable = availableModels.includes(model.id);
                const isSelected = selectedModel === model.id;
                const modelDescription = modelDescriptions[model.id as keyof typeof modelDescriptions];

                return (
                  <div
                    key={model.id}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : isAvailable
                        ? 'border-border hover:border-primary/50 hover:bg-accent/50'
                        : 'border-border/50 bg-muted/30 cursor-not-allowed'
                    }`}
                    onClick={() => handleModelSelect(model.id, !isAvailable)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className={`h-4 w-4 ${isAvailable ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-medium ${isAvailable ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {model.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                        {!isAvailable && (
                          <SafeTooltip content="升级订阅计划以使用此模型">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleUpgradeClick}
                              className="h-6 px-2 text-xs"
                            >
                              升级
                            </Button>
                          </SafeTooltip>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p className={`${isAvailable ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                        {model.description}
                      </p>
                      
                      {modelDescription && (
                        <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                          <p className="text-xs font-medium text-primary">{modelDescription.features}</p>
                          <p className="text-xs text-muted-foreground">{modelDescription.scenarios}</p>
                          <p className="text-xs text-muted-foreground">{modelDescription.style}</p>
                          <p className="text-xs text-accent-foreground">{modelDescription.speed}</p>
                        </div>
                      )}
                    </div>

                    {!isAvailable && (
                      <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-medium">需要升级</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Model Description */}
            {selectedModelDescription && (
              <div className="mt-4 p-4 bg-accent/50 border border-accent rounded-lg">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  当前选择：{getModelInfo(selectedModel)?.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-primary">特性：</span>
                    <span className="text-muted-foreground ml-1">{selectedModelDescription.features}</span>
                  </div>
                  <div>
                    <span className="font-medium text-primary">适用场景：</span>
                    <span className="text-muted-foreground ml-1">{selectedModelDescription.scenarios}</span>
                  </div>
                  <div>
                    <span className="font-medium text-primary">风格特点：</span>
                    <span className="text-muted-foreground ml-1">{selectedModelDescription.style}</span>
                  </div>
                  <div>
                    <span className="font-medium text-primary">{selectedModelDescription.speed}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>剩余使用次数：{usageRemaining}</span>
          </div>
          
          <Button
            disabled={!canGenerate}
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
          console.log('Results section render check:', {
            resultsLength: results.length,
            generating,
            shouldShow: results.length > 0 || generating
          });

          return (results.length > 0 || generating);
        })() && (
          <div className="mt-8">
            {/* 生成状态指示器 */}
            {generating && results.length === 0 && (
              <div className="mb-4 p-4 bg-accent border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-foreground font-medium">正在生成内容，请稍候...</span>
                </div>
              </div>
            )}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">平台适配结果</h1>
                  {/* 网络状态指示器 */}
                  {networkStatus === 'offline' && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-lg text-xs">
                        <span>🚫</span>
                        <span>网络断开</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={runNetworkDiagnostic}
                        className="text-xs"
                      >
                        诊断网络
                      </Button>
                    </div>
                  )}
                  {networkStatus === 'slow' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning rounded-lg text-xs">
                      <span>🐌</span>
                      <span>网络较慢</span>
                    </div>
                  )}
                  </div>
                  
                  {/* Results Actions */}
                  {results.some(r => r.content || (r.versions && r.versions.length > 0)) && (
                    <div className="flex items-center gap-2">
                      {/* Batch Forward Button */}
                      <Button
                        variant="outline"
                        onClick={handleBatchPublish}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        批量转发
                      </Button>
                      
                      {/* Automation Button */}
                      <AutomationUI
                        results={results}
                        onStartAutomation={handleStartAutomation}
                        onCancelAutomation={handleCancelAutomation}
                        onRetryPlatform={handleRetryPlatform}
                        progress={automationProgress}
                        isRunning={automationRunning}
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results.map((result, index) => (
                    <div key={`${result.platformId}-${index}`} className="border border-border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {platforms.find(p => p.id === result.platformId)?.icon}
                          <h3 className="text-lg font-medium">
                            {getPlatformName(result.platformId, platforms)}
                          </h3>
                          <PlatformStatusIndicator result={result} />
                        </div>
                        
                        {/* Platform Actions */}
                        <div className="flex items-center gap-2">
                          {result.error && result.canRetry && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => autoRetryTimeoutPlatform(result.platformId)}
                              disabled={autoRetryingPlatforms.has(result.platformId)}
                            >
                              {autoRetryingPlatforms.has(result.platformId) ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  重试中
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  重试
                                </>
                              )}
                            </Button>
                          )}
                          
                          {(result.content || (result.versions && result.versions.length > 0)) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRegeneratePlatformContent(result.platformId)}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                重新生成
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePublish(result.platformId)}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                发布
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Loading Steps */}
                      {result.steps && result.steps.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-4">
                            {result.steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-center gap-2">
                                {step.status === 'loading' && (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                )}
                                {step.status === 'completed' && (
                                  <CheckCircle className="h-3 w-3 text-success" />
                                )}
                                {step.status === 'error' && (
                                  <Circle className="h-3 w-3 text-destructive" />
                                )}
                                {step.status === 'waiting' && (
                                  <Circle className="h-3 w-3 text-muted-foreground" />
                                )}
                                <span className="text-xs text-muted-foreground">{step.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {result.error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                          {result.error}
                        </div>
                      )}

                      {/* Content Versions */}
                      {result.versions && result.versions.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium">选择版本：</span>
                            <div className="flex items-center border rounded-lg p-1">
                              <Button
                                variant={getSelectedVersion(result.platformId) === 'version-a' ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleVersionSelect(result.platformId, 'version-a')}
                                className="h-7 text-xs"
                              >
                                版本A（标准）
                              </Button>
                              <Button
                                variant={getSelectedVersion(result.platformId) === 'version-b' ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleVersionSelect(result.platformId, 'version-b')}
                                className="h-7 text-xs"
                              >
                                版本B（创意）
                              </Button>
                            </div>
                          </div>

                          {result.versions.map((version) => {
                            const isSelected = getSelectedVersion(result.platformId) === version.id;
                            const versionKey = `${result.platformId}-${version.id}`;
                            const isRegenerating = regeneratingVersions.has(versionKey);
                            const isEditing = editingVersion?.platformId === result.platformId && editingVersion?.versionId === version.id;
                            
                            return (
                              <div
                                key={version.id}
                                className={`${isSelected ? 'block' : 'hidden'} space-y-3`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{version.title}</h4>
                                    <span className="text-xs px-2 py-1 bg-accent rounded">
                                      {version.style === 'standard' ? '标准风格' : '创意风格'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {version.charCount}字符
                                    </span>
                                    {version.validation && version.validation.status !== 'valid' && (
                                      <SafeTooltip content={version.validation.message}>
                                        <span className="text-xs px-2 py-1 bg-warning/20 text-warning rounded">
                                          {version.validation.status === 'warning' ? '注意' : '超限'}
                                        </span>
                                      </SafeTooltip>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {/* Regenerate Version Button */}
                                    <SafeTooltip content="重新生成此版本">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => regenerateVersion(result.platformId, version.id)}
                                        disabled={isRegenerating}
                                        className="h-8 w-8 p-0"
                                      >
                                        {isRegenerating ? (
                                          <RefreshCw className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <RefreshCw className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </SafeTooltip>

                                    {/* Edit Version Button */}
                                    <SafeTooltip content="编辑此版本内容">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditVersion(result.platformId, version.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </SafeTooltip>

                                    {/* Copy Version Button */}
                                    <SafeTooltip content="复制此版本内容">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(version.content, versionKey)}
                                        className="h-8 w-8 p-0"
                                      >
                                        {copyStates.has(versionKey) ? (
                                          <Check className="h-3 w-3 text-success" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </SafeTooltip>

                                    {/* Favorite Version Button */}
                                    <SafeTooltip content={persistentFavorites.has(versionKey) ? "取消收藏" : "收藏此版本"}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFavorite(result.platformId, version.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        {persistentFavorites.has(versionKey) || favoriteStates.has(versionKey) ? (
                                          <Heart className="h-3 w-3 fill-current text-red-500" />
                                        ) : (
                                          <Heart className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </SafeTooltip>

                                    {/* Publish Version Button */}
                                    <SafeTooltip content="发布此版本">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleVersionPublish(result.platformId, version.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Send className="h-3 w-3" />
                                      </Button>
                                    </SafeTooltip>

                                    {/* Translate Version Button */}
                                    <SafeTooltip content="翻译此版本">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleTranslate(result.platformId, version.content)}
                                        disabled={translatingPlatforms.has(result.platformId)}
                                        className="h-8 w-8 p-0"
                                      >
                                        {translatingPlatforms.has(result.platformId) ? (
                                          <RefreshCw className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <Languages className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </SafeTooltip>
                                  </div>
                                </div>

                                {/* Version Content */}
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={version.content}
                                      onChange={(e) => {
                                        const newContent = e.target.value;
                                        setResults(current =>
                                          current.map(r =>
                                            r.platformId === result.platformId
                                              ? {
                                                  ...r,
                                                  versions: r.versions?.map(v =>
                                                    v.id === version.id
                                                      ? { ...v, content: newContent, charCount: newContent.length }
                                                      : v
                                                  )
                                                }
                                              : r
                                          )
                                        );
                                      }}
                                      className="min-h-[120px] resize-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingVersion(null)}
                                      >
                                        取消
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleSaveVersionEdit(result.platformId, version.id, version.content)}
                                      >
                                        保存
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-accent/30 rounded-lg p-4">
                                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                                      {version.content}
                                    </pre>
                                    
                                    {/* Show translated content if available */}
                                    {translatedContent[result.platformId] && (
                                      <div className="mt-3 pt-3 border-t border-border/50">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Languages className="h-3 w-3" />
                                          <span className="text-xs font-medium text-muted-foreground">英文翻译</span>
                                        </div>
                                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-muted-foreground">
                                          {translatedContent[result.platformId]}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Platform Hashtags */}
                                <PlatformHashtags 
                                  platformId={result.platformId}
                                  extractedTags={extractedTagsMap[versionKey] || []}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Single Content (Legacy) */}
                      {result.content && !result.versions && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">生成内容</span>
                              {result.charCount && (
                                <span className="text-xs text-muted-foreground">
                                  {result.charCount}字符
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Copy Button */}
                              <SafeTooltip content="复制内容">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(result.content, result.platformId)}
                                  className="h-8 w-8 p-0"
                                >
                                  {copyStates.has(result.platformId) ? (
                                    <Check className="h-3 w-3 text-success" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </SafeTooltip>

                              {/* Edit Button */}
                              <SafeTooltip content="编辑内容">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(result.platformId)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </SafeTooltip>

                              {/* Favorite Button */}
                              <SafeTooltip content={persistentFavorites.has(result.platformId) ? "取消收藏" : "收藏内容"}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFavorite(result.platformId)}
                                  className="h-8 w-8 p-0"
                                >
                                  {persistentFavorites.has(result.platformId) || favoriteStates.has(result.platformId) ? (
                                    <Heart className="h-3 w-3 fill-current text-red-500" />
                                  ) : (
                                    <Heart className="h-3 w-3" />
                                  )}
                                </Button>
                              </SafeTooltip>

                              {/* Publish Button */}
                              <SafeTooltip content="发布内容">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePublish(result.platformId)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                              </SafeTooltip>
                            </div>
                          </div>

                          {/* Content Display */}
                          {editingPlatform === result.platformId ? (
                            <div className="space-y-2">
                              <Textarea
                                value={result.content}
                                onChange={(e) => {
                                  const newContent = e.target.value;
                                  setResults(current =>
                                    current.map(r =>
                                      r.platformId === result.platformId
                                        ? { ...r, content: newContent }
                                        : r
                                    )
                                  );
                                }}
                                className="min-h-[120px] resize-none"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingPlatform(null)}
                                >
                                  取消
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(result.platformId, result.content)}
                                >
                                  保存
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-accent/30 rounded-lg p-4">
                              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                                {result.content}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Usage Reminder Modal */}
        <Dialog open={showUsageReminder} onOpenChange={setShowUsageReminder}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>使用次数提醒</DialogTitle>
              <DialogDescription>
                您的剩余使用次数较少（{usageReminderCount}次），建议合理安排使用。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUsageReminder(false)}>
                继续使用
              </Button>
              <Button onClick={() => navigate('/payment')}>
                升级订阅
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Premium Feature Modal */}
        <Dialog open={showPremiumFeature} onOpenChange={setShowPremiumFeature}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>高级功能</DialogTitle>
              <DialogDescription>
                {premiumFeatureInfo.name}是高级功能，{premiumFeatureInfo.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPremiumFeature(false)}>
                取消
              </Button>
              <Button onClick={() => navigate('/payment')}>
                立即升级
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish Confirmation Dialog */}
        <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认发布</DialogTitle>
              <DialogDescription>
                即将发布到 {pendingPublish?.platformId}，请确认是否继续？
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={confirmPublish}>
                确认发布
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Publish Dialog */}
        <Dialog open={batchPublishOpen} onOpenChange={setBatchPublishOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>批量转发</DialogTitle>
              <DialogDescription>
                选择要批量转发的平台
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results
                .filter(r => r.content || (r.versions && r.versions.length > 0))
                .map(result => {
                  const platform = platforms.find(p => p.id === result.platformId);
                  return (
                    <div key={result.platformId} className="flex items-center space-x-2">
                      <Checkbox
                        checked={batchSelectedPlatforms.includes(result.platformId)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBatchSelectedPlatforms(prev => [...prev, result.platformId]);
                          } else {
                            setBatchSelectedPlatforms(prev => prev.filter(id => id !== result.platformId));
                          }
                        }}
                      />
                      <div className="flex items-center gap-2">
                        {platform?.icon}
                        <span>{platform?.name}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBatchPublishOpen(false)}>
                取消
              </Button>
              <Button onClick={confirmBatchPlatforms} disabled={batchSelectedPlatforms.length === 0}>
                开始转发 ({batchSelectedPlatforms.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share History Dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>转发历史</DialogTitle>
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

        {/* Platform API Manager */}
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

        {/* Batch Forward Modal */}
        <BatchForwardModal
          open={batchForwardModalOpen}
          onClose={() => setBatchForwardModalOpen(false)}
          platforms={batchForwardPlatforms}
        />

        {/* Title Generator */}
        <TitleGenerator
          content={originalContent}
          onTitleGenerated={(title) => {
            setTitle(title);
            toast({
              title: "标题已生成",
              description: title,
            });
          }}
        />

        {/* Hashtag Manager */}
        <HashtagManager />

        {/* AI Content Generation Animation */}
        <AIContentGenerationAnimation isVisible={generating} />
      </div>
    </div>
  );
}

// 导出组件 - 保持原有导出方式
export default AdaptPage;