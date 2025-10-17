/**
 * 内容适配器主页面组件
 * 集成所有子组件和Hook，提供完整的内容适配功能
 * 🔥 CACHE_BUST: 2025-01-09-21:45 - 8个关键修复已生效
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Copy, Zap } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { PageNavigation } from '@/components/layout/PageNavigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
// import { useUnifiedUsageStats } from '@/hooks/useUnifiedUsageStats'; // 🎯 已废弃
import { useUsageCount } from '@/hooks/useUsage'; // 🎯 新架构: Store-based Hook
import { getUserTier } from '@/utils/subscriptionUtils';
import { useUserSettings } from '@/hooks/useUserSettings';
import { SETTING_KEYS } from '@/services/userSettingsService';

// 导入Hook
import {
  useContentAdapterEngine,
  useAdapterSettings,
  useGenerationQueue
} from '../hooks';

// 导入组件
import ContentInputSection from './ContentInputSection';
import PlatformSelector from './PlatformSelector';
import GenerationControls from './GenerationControls';
import { ResultsDisplay } from './ResultsDisplay'; // 🔧 FIX: 使用命名导入确保获取正确的组件
import { BatchForwardModal } from '@/components/BatchForwardModal';
import { AutomationUI, AutomationProgress, AutomationResult, AutomationOptions } from '@/components/AutomationUI';
import { AIContentGenerationAnimation } from '@/components/AIContentGenerationAnimation';
import { EnhancedHistoryDialog, ShareHistoryItem as AdapterShareHistoryItem } from './EnhancedHistoryDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { BRAND_MESSAGES } from '../constants/messages';

// 导入统一Z-Index管理器
import { zIndexManager, ZIndexLayers } from '@/utils/zIndexManager';
import { useUnifiedStore } from '@/stores/unified-state-store';
import type { SubscriptionTier } from '@/types/subscription';

// 导入工具函数和配置
import { getAvailableModelsForTier, getAllModels } from '@/config/aiModels';
import { getAvailablePlatforms } from '@/api/contentAdapter';

// 收藏系统改为统一Store
import { useUnifiedStore } from '@/stores/unified-state-store';
import { useUserDataIsolation } from '@/utils/userDataIsolation';
import { globalDataManager } from '@/services/unifiedDataManager';


/**
 * 浏览器扩展集成工具函数
 */
// ✅ FIX: 从环境变量读取扩展ID，避免硬编码占位符
const EXTENSION_ID = import.meta.env.VITE_CHROME_EXTENSION_ID || '';

// 检测扩展是否已安装
const checkExtensionInstalled = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // ✅ FIX: 如果没有配置扩展ID，直接返回false，不尝试调用API
      if (!EXTENSION_ID || EXTENSION_ID === 'your-extension-id-here') {
        console.log('Chrome扩展ID未配置，跳过扩展检测');
        resolve(false);
        return;
      }

      // 方法1: 使用 chrome.runtime.sendMessage
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { action: 'ping' },
          (response: any) => {
            if (chrome.runtime.lastError) {
              console.log('扩展未安装:', chrome.runtime.lastError.message);
              resolve(false);
            } else {
              console.log('扩展已安装:', response);
              resolve(true);
            }
          }
        );
      } else {
        // 方法2: 检测扩展注入的标记
        const checkMarker = () => {
          return document.documentElement.hasAttribute('data-wenpai-extension');
        };

        if (checkMarker()) {
          resolve(true);
        } else {
          // 等待一段时间后再检查
          setTimeout(() => {
            resolve(checkMarker());
          }, 1000);
        }
      }
    } catch (error) {
      console.error('检测扩展失败:', error);
      resolve(false);
    }
  });
};

// 调用扩展进行批量转发
const callExtensionBatchForward = async (platforms: Array<{
  platformId: string;
  platformName: string;
  content: string;
  title?: string;
  tags?: string[];
}>): Promise<{ success: boolean; results?: any[]; error?: string }> => {
  try {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            action: 'batchPublish',
            data: {
              platforms: platforms.map(p => p.platformId),
              contents: platforms.reduce((acc, p) => ({
                ...acc,
                [p.platformId]: {
                  title: p.title || '',
                  text: p.content,
                  hashtags: p.tags || []
                }
              }), {})
            }
          },
          (response: any) => {
            if (chrome.runtime.lastError) {
              resolve({
                success: false,
                error: chrome.runtime.lastError.message
              });
            } else {
              resolve({
                success: true,
                results: response?.results || []
              });
            }
          }
        );
      } else {
        resolve({
          success: false,
          error: '浏览器不支持扩展通信'
        });
      }
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 主流平台内容发布入口URL映射 - 从原版完整迁移
 * 用于一键转发跳转
 */
const platformUrls: Record<string, string> = {
  // Main social media platforms
  weibo: 'https://weibo.com/compose',
  xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish',
  zhihu: 'https://zhuanlan.zhihu.com/write',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  wechat: 'https://mp.weixin.qq.com/',

  // Video platforms
  bilibili: 'https://member.bilibili.com/platform/upload/text/edit',
  kuaishou: 'https://cp.kuaishou.com/article/publish',

  // News platforms
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
  baijiahao: 'https://baijiahao.baidu.com/builder/rc/edit',

  // International platforms
  facebook: 'https://www.facebook.com/pages/create/',
  twitter: 'https://twitter.com/compose/tweet',
  linkedin: 'https://www.linkedin.com/feed/',

  // Tech communities
  v2ex: 'https://www.v2ex.com/new',
  github: 'https://github.com/new',
  juejin: 'https://juejin.cn/editor/drafts/new',
  csdn: 'https://mp.csdn.net/mp_blog/creation/editor',

  // Other platforms
  sspai: 'https://sspai.com/write',
  video: 'https://channels.weixin.qq.com/', // 视频号
  wangyi: 'https://mp.163.com/nb2.html' // 网易号
};

// 平台URL映射 - 从platformUtils导入
import {
  getPlatformIcon,
  getPlatformName,
  getPlatformMaxCharCount,
  getPlatformRecommendedCharCount
} from '@/utils/platformUtils';

interface ContentAdapterPageProps {
  // 用户状态
  usageRemaining?: number;
  currentTier?: string;

  // 可选的初始配置
  initialContent?: string;
  initialPlatforms?: string[];
}

function HistoryLauncher({ availablePlatforms }: { availablePlatforms: any[] }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<AdapterShareHistoryItem[]>([]);
  const { user } = useAuth();

  const mapItems = React.useCallback((list: any[]): AdapterShareHistoryItem[] => {
    return (list || []).map((it: any, idx: number) => ({
      id: it.id || `${it.platformId}-${it.time || it.timestamp || Date.now()}-${idx}`,
      platformId: it.platformId,
      platformName: it.platformName || getPlatformName(it.platformId, availablePlatforms),
      content: it.content || '',
      time: it.time || it.timestamp || new Date().toISOString()
    }));
  }, [availablePlatforms]);

  const load = React.useCallback(async () => {
    try {
      const list = await globalDataManager.getData<any[]>('user_history') || [];
      setItems(mapItems(list));
    } catch (e) {
      try {
        const localKey = `user_history_${user?.id || 'guest'}`;
        const list = JSON.parse(localStorage.getItem(localKey) || '[]');
        setItems(mapItems(list));
      } catch {}
    }
  }, [mapItems, user?.id]);

  const handleClear = React.useCallback(async () => {
    await globalDataManager.setData('user_history', []);
    setItems([]);
  }, []);

  const handleDelete = React.useCallback(async (id: string) => {
    const list = (await globalDataManager.getData<any[]>('user_history')) || [];
    const filtered = list.filter((it: any) => (it.id && it.id !== id) || (!it.id));
    await globalDataManager.setData('user_history', filtered);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <History className="w-4 h-4 mr-1" /> 历史记录
        </Button>
      </div>
      <EnhancedHistoryDialog
        open={open}
        onOpenChange={setOpen}
        shareHistory={items}
        onClearHistory={handleClear}
        onDeleteItem={handleDelete}
        availablePlatforms={availablePlatforms}
      />
    </>
  );
}


/**
 * 内容适配器主页面组件
 */
export function ContentAdapterPage({
  usageRemaining: propUsageRemaining,
  currentTier: propCurrentTier,
  initialContent = '',
  initialPlatforms = []
}: ContentAdapterPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // 🎯 新架构: 使用Store-based Hook
  const { used, available, remaining, loading: usageLoading, consumeUsage, canUse } = useUsageCount();

  // 与统一状态对齐订阅等级与使用统计（确保 premium 无限使用生效）
  const unifiedUserId = useUnifiedStore(state => state.user.id);
  const updateUserSubscriptionInStore = useUnifiedStore(state => state.updateUserSubscription);
  const initializeUsageStatsInStore = useUnifiedStore(state => state.initializeUsageStats);

  // 兼容旧代码

  const { primaryStatus, refresh: refreshSubscription } = useSubscriptionStatus();

  // 用户设置Hook - 用于加载保存的模型偏好
  const { getSetting } = useUserSettings();

  // 收藏系统（统一Store）
  const addFavorite = useUnifiedStore(state => state.addFavorite);
  const removeFavorite = useUnifiedStore(state => state.removeFavorite);
  const favoritesDataManager = useUserDataIsolation({
    modulePrefix: 'adapt_favorites'
  });



  // 🔧 FIX: 获取用户当前等级 - 优先使用订阅状态
  const getCurrentTier = () => {
    if (propCurrentTier) return propCurrentTier;

    // 1. 优先使用订阅状态中的等级信息
    if (primaryStatus?.status === 'active' && primaryStatus.tier) {
      return primaryStatus.tier;
    }

    // 2. 使用工具函数获取等级
    return getUserTier(user);
  };

  const effectiveUserTier = getCurrentTier();

  // 将订阅等级同步到统一状态，并用正确的等级初始化/刷新使用统计
  React.useEffect(() => {
    if (unifiedUserId && effectiveUserTier) {
      try {
        updateUserSubscriptionInStore(effectiveUserTier as SubscriptionTier);
        initializeUsageStatsInStore(unifiedUserId as string, effectiveUserTier as SubscriptionTier);
      } catch (e) {
        console.warn('sync subscription to unified store failed:', e);
      }
    }
  }, [unifiedUserId, effectiveUserTier, updateUserSubscriptionInStore, initializeUsageStatsInStore]);

  // 🎯 新架构: 直接从Store获取,无需复杂的缓存逻辑
  // Store已经处理了缓存和一致性,组件只需消费数据
  const displayRemaining = propUsageRemaining !== undefined ? propUsageRemaining : remaining;

  // 🔍 调试日志（统一Store）
  React.useEffect(() => {
    console.log('🎯 ContentAdapterPage 使用次数状态:', {
      来源: 'useUsageCount Hook',
      used,
      available,
      remaining,
      displayRemaining,
      propUsageRemaining
    });
  }, [used, available, remaining, displayRemaining, propUsageRemaining]);

  // 🔧 FIX: 监听Token使用量更新事件，自动刷新显示
  React.useEffect(() => {
    const handleTokenUsageUpdate = async (event: CustomEvent) => {
      // 方法1: 强制刷新订阅状态
      refreshSubscription();

      // 方法2: 直接从Store刷新使用统计
      try {
        const { useUnifiedStore } = await import('@/stores/unified-state-store');
        const refreshUsageStats = useUnifiedStore.getState().refreshUsageStats;
        await refreshUsageStats();
      } catch (error) {
        console.error('❌ 刷新使用统计失败:', error);
      }
    };

    window.addEventListener('tokenUsageUpdated', handleTokenUsageUpdate as unknown as EventListener);

    return () => {
      window.removeEventListener('tokenUsageUpdated', handleTokenUsageUpdate as unknown as EventListener);
    };
  }, [refreshSubscription]);

  // 使用设置管理Hook
  const {
    globalSettings,
    platformSettings,
    settingsMode,
    selectedPlatforms,
    selectedFormId,
    selectedStyle,
    selectedModel,
    useBrandLibrary,
    brandProfile,
    customPrompt,
    updateSelectedPlatforms,
    updateSelectedForm,
    updateSelectedStyle,
    updateSelectedModel,
    updatePlatformSettings,
    updateSettingsMode,
    updateBrandLibrary,
    updateCustomPrompt,
    getEffectiveSettings,
    validateSettings
  } = useAdapterSettings({
    autoSave: false, // 🔧 临时禁用自动保存，避免页面加载时误触发Toast
    storageKey: 'content-adapter-settings'
  });


  const saveToHistory = React.useCallback(async (results: any[]) => {
    try {
      console.log('🔍 保存历史记录:', { userId: user?.id, isAuthenticated, resultsCount: results.length });

      // 从云端获取现有历史记录
      const existingHistory = await globalDataManager.getData<unknown[]>('user_history') || [];
      console.log('🔍 当前历史记录数量:', existingHistory.length);

      const now = new Date().toISOString();
      const newItems: unknown[] = [];

      results.forEach(r => {
        if (r.content) {
          newItems.push({
            platformId: r.platformId,
            content: r.content,
            timestamp: now
          });
        }
      });

      // 合并新旧数据,保留最新100条
      const mergedHistory = [...newItems, ...existingHistory].slice(0, 100);

      // 保存到云端
      await globalDataManager.setData('user_history', mergedHistory);
      console.log('✅ 历史记录已保存到云端，新数量:', mergedHistory.length);
    } catch (error) {
      console.error('❌ 保存历史记录失败:', error);
      // 降级到localStorage
      try {
        const localKey = `user_history_${user?.id || 'guest'}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        const now = new Date().toISOString();
        const newItems = results.filter(r => r.content).map(r => ({
          platformId: r.platformId,
          content: r.content,
          timestamp: now
        }));
        const merged = [...newItems, ...existing].slice(0, 100);
        localStorage.setItem(localKey, JSON.stringify(merged));
        console.log('⚠️ 已降级保存到localStorage');
      } catch (fallbackError) {
        console.error('❌ localStorage降级保存也失败:', fallbackError);
      }
    }
  }, [user?.id, isAuthenticated]);

  // 使用内容生成引擎Hook
  const {
    generating,
    results,
    retryingPlatforms,
    generatingComparison,
    comparisonContent,
    showComparison,
    titleStates,
    extractedTagsMap,
    generateContent,
    retryPlatform,
    generateComparison,
    generateTitle,
    updatePlatformContent,
    clearResults,
    restoreResults
  } = useContentAdapterEngine({
    globalSettings,
    platformSettings,
    selectedModel,
    useBrandLibrary,
    brandProfile,
    onGenerationComplete: saveToHistory
  });

  // 🔧 FIX: 内容生成完成后自动生成标题 - 改进版
  const prevResultsLengthRef = React.useRef(0);
  const titleGeneratedRef = React.useRef<Set<string>>(new Set());


  // 结果区定位与自动滚动
  const resultsSectionRef = React.useRef<HTMLDivElement | null>(null);
  const scrollToResults = React.useCallback(() => {
    try {
      const el = resultsSectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const headerOffset = 72; // 固定头部高度 + 少量间距
      const top = Math.max(0, window.scrollY + rect.top - headerOffset);
      window.scrollTo({ top, behavior: 'smooth' });
    } catch (e) {
      // 兜底
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  React.useEffect(() => {
    // 只在新内容生成时触发（results 数组长度增加）
    if (results.length > prevResultsLengthRef.current && results.length > 0) {
      console.log('🔍 检测到新内容生成，准备自动生成标题');

      results.forEach(r => {
        // 检查是否已经为该平台生成过标题
        if (!titleGeneratedRef.current.has(r.platformId)) {
          const content = r.content || (r.versions && r.versions[0]?.content);

          if (content && content.length > 10) {
            console.log(`🎯 为平台 ${r.platformId} 自动生成标题`);
            titleGeneratedRef.current.add(r.platformId);

            // 统一在 Hook 内自动触发标题生成，页面层不再二次触发以避免竞态/重复请求
          }
        }
      });
    }


    prevResultsLengthRef.current = results.length;
  }, [results, generateTitle]);

  // 🔧 当results清空时，重置已生成标题的记录
  React.useEffect(() => {
    if (results.length === 0) {
      titleGeneratedRef.current.clear();
    }
  }, [results.length]);

  // 使用生成队列Hook
  const {
    running: queueRunning,
    startAutomation,
    stopAutomation
  } = useGenerationQueue({
    maxConcurrency: 3,
    onTaskComplete: (task, result) => {
      console.log('Task completed:', task.platformId, result);
    },
    onQueueComplete: () => {
      toast({
        title: t('adapt.messages.batchGenerateCompleted'),
        description: t('adapt.messages.allPlatformsGenerated'),
      });
    }
  });

  // 原始内容状态
  const [originalContent, setOriginalContent] = React.useState(initialContent);

  // 版本选择状态
  const [selectedVersions, setSelectedVersions] = React.useState<Record<string, string>>({});

  // 批量转发状态 - 从原版完整迁移
  const [batchForwardModalOpen, setBatchForwardModalOpen] = React.useState(false);
  const [batchForwardPlatforms, setBatchForwardPlatforms] = React.useState<any[]>([]);
  // 临时保存最近一次生成结果（离开再回来自动恢复）
  const lastResultsKey = React.useMemo(() => `content_adapter:last_results:${user?.id || 'guest'}`, [user?.id]);

  // 保存最近一次生成结果
  React.useEffect(() => {
    try {
      if (!generating && results && results.length > 0) {
        const hasAnyContent = results.some(r => r.content || (r.versions && r.versions.length > 0));
        if (hasAnyContent) {
          // 🔧 FIX: 同时保存titleStates，避免恢复时重新生成标题
          const payload = { timestamp: Date.now(), results, titleStates };
          localStorage.setItem(lastResultsKey, JSON.stringify(payload));
          console.log('✅ 保存结果和标题状态:', { resultsCount: results.length, titleStatesCount: Object.keys(titleStates).length });
        }
      }
    } catch (err) {
      console.warn('保存最近一次生成结果失败:', err);
    }
  }, [results, generating, lastResultsKey, titleStates]);

  // 初次挂载或用户切换时尝试恢复
  React.useEffect(() => {
    try {
      if (!results || results.length === 0) {
        const raw = localStorage.getItem(lastResultsKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const within24h = parsed?.timestamp && (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000);
          if (within24h && Array.isArray(parsed.results) && parsed.results.length > 0) {
            // 🔧 FIX: 同时恢复titleStates，避免重新生成标题
            restoreResults(parsed.results, parsed.titleStates || {});
            // 🔧 FIX: 恢复内容后，初始化 prevResultsLengthRef 以防止触发自动标题生成
            prevResultsLengthRef.current = parsed.results.length;
            console.log('✅ 恢复结果和标题状态:', {
              resultsCount: parsed.results.length,
              titleStatesCount: Object.keys(parsed.titleStates || {}).length
            });
            toast({ title: '已为你恢复上次生成内容', duration: 2500 });
          }
        }
      }
    } catch (err) {
      console.warn('恢复最近一次生成内容失败:', err);
    }
    // 仅在初次挂载或用户切换时尝试恢复
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResultsKey]);


  // 传统批量转发Dialog状态
  const [batchPublishOpen, setBatchPublishOpen] = React.useState(false);
  const [batchSelectedPlatforms, setBatchSelectedPlatforms] = React.useState<string[]>([]);
  const [batchQueue, setBatchQueue] = React.useState<{ platformId: string; content: string }[]>([]);
  const [batchCurrent, setBatchCurrent] = React.useState<{ platformId: string; content: string } | null>(null);

  // 自动化转发状态
  const [automationRunning, setAutomationRunning] = React.useState(false);
  const [automationProgress, setAutomationProgress] = React.useState<AutomationProgress | undefined>();


  // 浏览器扩展状态
  const [extensionInstalled, setExtensionInstalled] = React.useState<boolean | null>(null);
  const [showExtensionPrompt, setShowExtensionPrompt] = React.useState(false);

  // 发布Dialog状态 - 从原版完整迁移
  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false);
  const [pendingPublish, setPendingPublish] = React.useState<{ platformId: string; content: string } | null>(null);

  // 收藏功能状态
  const [favoriteStates, setFavoriteStates] = React.useState<Set<string>>(new Set());
  const [persistentFavorites, setPersistentFavorites] = React.useState<Set<string>>(new Set());
  const favoriteTimeoutsRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 初始化选中平台
  React.useEffect(() => {
    if (initialPlatforms.length > 0) {
      updateSelectedPlatforms(initialPlatforms);
    }
  }, [initialPlatforms]); // 🔧 FIX: 移除updateSelectedPlatforms依赖，避免无限循环


  // 初始化收藏状态
  React.useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const favoriteKeys = favorites.map((fav: any) =>
        `${fav.metadata?.platformId || fav.source}${fav.metadata?.versionId ? `-${fav.metadata.versionId}` : ''}`
      );
      setPersistentFavorites(new Set(favoriteKeys));
    } catch (error) {
      console.error('Failed to load favorite states:', error);
    }
  }, []);

  // 清理收藏相关的timeout
  React.useEffect(() => {
    return () => {
      favoriteTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
      favoriteTimeoutsRef.current.clear();
    };
  }, []);


  // 检测浏览器扩展是否已安装
  React.useEffect(() => {
    const detectExtension = async () => {
      const installed = await checkExtensionInstalled();
      setExtensionInstalled(installed);
      console.log('🔍 扩展检测结果:', installed ? '已安装' : '未安装');
    };

    detectExtension();

    // 定期检测扩展状态（用户可能在使用过程中安装）
    const intervalId = setInterval(detectExtension, 30000); // 每30秒检测一次

    return () => clearInterval(intervalId);
  }, []);

  // ⛔ 旧兼容层用量同步逻辑已移除：统一由 unified-state-store 管理（见上方订阅同步 + initializeUsageStats）
  React.useEffect(() => {
    // no-op
  }, []);

  // 🔧 FIX: 监听支付成功事件，立即更新使用次数状态 - 从原版完整迁移
  React.useEffect(() => {
    let paymentTimeoutId: NodeJS.Timeout | null = null;

    const handlePaymentSuccess = () => {
      // 强制刷新订阅状态
      refreshSubscription();
      // 延迟刷新
      paymentTimeoutId = setTimeout(() => {
        refreshSubscription();
      }, 1000);
    };

    const handleSubscriptionUpdated = (event: CustomEvent) => {
      refreshSubscription();
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    window.addEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);

    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);
      if (paymentTimeoutId) {
        clearTimeout(paymentTimeoutId);
      }
    };
  }, [refreshSubscription]);

  // 获取可用数据

  const availablePlatforms = getAvailablePlatforms();
  let accessibleModels = getAvailableModelsForTier(effectiveUserTier as any);

  // 备用方案：如果没有获取到模型，使用默认的体验版模型
  if (!accessibleModels || accessibleModels.length === 0) {

    console.warn('⚠️ notgetting到模型data，使用default体验版模型');
    accessibleModels = getAvailableModelsForTier('trial');
  }

  const accessibleModelIds = new Set(accessibleModels.map(model => model.id));
  const availableModels = getAllModels().map(model => ({
    ...model,
    isAccessible: accessibleModelIds.has(model.id),
  }));

  // 🔧 FIX: 加载保存的模型偏好（包含订阅过期检查）
  const [hasLoadedModelPreference, setHasLoadedModelPreference] = React.useState(false);

  React.useEffect(() => {
    // 只在初始加载时执行一次，避免覆盖用户的手动选择
    if (hasLoadedModelPreference || !isAuthenticated || availableModels.length === 0) {
      return;
    }

    const loadSavedModelPreference = async () => {
      try {
        console.log('🔍 开始加载保存的模型偏好...');

        // 🔒 检查订阅状态是否过期
        const isSubscriptionExpired = primaryStatus?.status === 'expired' || primaryStatus?.status === 'cancelled';
        if (isSubscriptionExpired) {
          console.warn('⚠️ 订阅已过期，不加载保存的模型偏好');
          setHasLoadedModelPreference(true);
          return;
        }

        const savedModelId = await getSetting(SETTING_KEYS.DEFAULT_MODEL);

        if (savedModelId) {
          console.log('📦 找到保存的模型ID:', savedModelId);

          // 检查该模型是否在可用模型列表中且可访问
          const savedModel = availableModels.find(m => m.id === savedModelId && m.isAccessible);

          if (savedModel) {
            // 🔒 再次验证用户当前等级是否有权限访问该模型
            const modelTier = savedModel.tier;
            const canAccessModel =
              (modelTier === 'low') ||
              (modelTier === 'mid' && (effectiveUserTier === 'pro' || effectiveUserTier === 'premium')) ||
              (modelTier === 'high' && effectiveUserTier === 'premium');

            if (canAccessModel) {
              console.log('✅ 自动选择保存的模型:', savedModel.name);
              updateSelectedModel(savedModelId);


              toast({
                title: "已恢复模型选择",
                description: `自动选择了您上次使用的模型：${savedModel.name}`,
                duration: 3000,
              });
            } else {
              console.warn('⚠️ 用户等级不足，无法访问保存的模型:', savedModelId, '需要等级:', modelTier, '当前等级:', effectiveUserTier);
              toast({
                title: "无法恢复模型选择",
                description: "您保存的模型需要更高的订阅等级才能使用",
                variant: "destructive",
                duration: 4000,
              });
            }
          } else {
            console.warn('⚠️ 保存的模型不可用或无权限访问:', savedModelId);
          }
        } else {
          console.log('ℹ️ 未找到保存的模型偏好');
        }
      } catch (error) {
        console.error('❌ 加载模型偏好失败:', error);
      } finally {
        setHasLoadedModelPreference(true);
      }
    };

    loadSavedModelPreference();
  }, [isAuthenticated, availableModels, hasLoadedModelPreference, getSetting, updateSelectedModel, toast, primaryStatus, effectiveUserTier]);

  // 调试信息
  // console.log('🔍 ContentAdapterPage - 模型datadebugging:', {
  //   effectiveUserTier,
  //   availableModelsCount: availableModels.length,
  //   sampleModels: availableModels.slice(0, 3).map(m => ({
  //     id: m?.id,
  //     name: m?.name,
  //     tier: m?.tier,
  //     company: m?.company,
  //     description: m?.description,
  //     fullModel: m
  //   }))
  // });

  // 验证设置
  const validation = validateSettings();
  const validationErrors = Array.from(new Set([
    ...validation.errors,
    ...(originalContent.trim().length === 0 ? [t('adapt.validation.enterContent')] : []),
    ...(selectedPlatforms.length === 0 ? [t('adapt.validation.selectPlatforms')] : []),
    ...(selectedModel.trim().length === 0 ? [t('adapt.validation.selectModel')] : [])
  ]));

  // 检查使用次数并显示提醒 - 从原版完整迁移
  const checkUsageAndShowReminder = () => {
    // 🔧 FIX: Premium用户无限制判断 - available为-1表示无限制
    const isPremiumUnlimited = available === -1;

    // Premium用户无限制，直接通过检查
    if (isPremiumUnlimited) {
      console.log('✅ Premium用户无限制，跳过使用次数检查');
      return true;
    }

    // 🔧 FIX: 使用缓存的剩余次数，避免数据闪烁
    // 如果剩余次数为0或负数，阻止生成
    if (displayRemaining <= 0) {
      console.log('❌ 使用次数已用完，阻止生成');
      toast({
        title: t('adapt.errors.usageExhausted'),
        description: t('adapt.messages.upgradeRequired'),
        variant: "destructive"
      });
      return false;
    }

    // 如果剩余次数较少（1-3次），显示提醒但允许继续生成
    if (displayRemaining <= 3 && displayRemaining > 0) {
      console.log('⚠️ 使用次数较少，显示提醒但允许生成');
      toast({
        title: t('adapt.errors.usageLow'),
        description: t("adapt.messages.usageReminder", { count: displayRemaining }),
        variant: "destructive"
      });
      // 不阻止生成，只是提醒
    }

    console.log('✅ 使用次数检查通过');
    return true;
  };

  // 处理内容生成
  const handleGenerate = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: t('adapt.errors.cannotStart'),
        description: validationErrors[0],
        variant: "destructive"
      });
      return;
    }

    // 检查使用次数
    if (!checkUsageAndShowReminder()) {
      return;
    }

    // 🎯 新架构: 扣减使用次数(乐观更新+自动回滚)
    try {
      console.log('🔄 准备扣减使用次数，当前状态:', { used, available, remaining });
      const consumed = await consumeUsage(1);
      if (!consumed) {
        console.error('❌ 使用次数不足，扣减失败');

        // 显示升级提示
        const isPremium = effectiveUserTier === 'premium';

        toast({
          title: isPremium ? t('adapt.errors.usageLimitReached') : t('adapt.errors.usageDeductionFailed'),
          description: isPremium
            ? t('adapt.messages.premiumLimitReached')
            : `${t('adapt.messages.trialLimitReached')} (${remaining}/${available})`,
          variant: "destructive",
          duration: 5000,
          action: isPremium ? undefined : (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                window.location.href = '/upgrade';
              }}
            >
              {t('common.upgrade')}
            </Button>
          )
        });
        return;
      }
      console.log('✅ 使用次数扣减成功，新状态:', { used: used + 1, remaining: remaining - 1 });
    } catch (error) {
      console.error('❌ 扣减使用次数异常:', error);
      toast({
        title: t('adapt.errors.usageDeductionError'),
        description: t('adapt.messages.systemError'),
        variant: "destructive"
      });
      return;
    }

    const request = {
      originalContent: originalContent.trim(),
      formId: selectedFormId,
      style: selectedStyle,
      customPrompt: customPrompt.trim() || undefined,
      useBrandLibrary,
      brandProfile,
      platform: selectedPlatforms[0] || 'default' // 添加必需的platform属性
    };

    //
    //
    //
    scrollToResults();
    await generateContent(request, selectedPlatforms);
  };

  // 处理重试
  const handleRetry = async (platformId: string) => {
    const request = {
      originalContent: originalContent.trim(),
      formId: selectedFormId,
      style: selectedStyle,
      customPrompt: customPrompt.trim() || undefined,
      useBrandLibrary,
      brandProfile,
      platform: platformId // 添加必需的platform属性
    };

    await retryPlatform(platformId, request);
  };

  // 处理对比生成
  const handleGenerateComparison = async (platformId: string) => {
    const request = {
      originalContent: originalContent.trim(),
      formId: selectedFormId,
      style: selectedStyle,
      customPrompt: customPrompt.trim() || undefined,
      useBrandLibrary,
      brandProfile,
      platform: platformId // 添加必需的platform属性
    };

    await generateComparison(platformId, request);
  };

  // 处理标题生成
  const handleGenerateTitle = async (platformId: string, content: string) => {
    await generateTitle(content, platformId);
  };

  // 处理自动化
  const handleStartAutomation = () => {
    if (validationErrors.length > 0) {
      toast({
        title: t('adapt.errors.cannotStartAutomation'),
        description: validationErrors[0],
        variant: "destructive"
      });
      return;
    }

    const request = {
      originalContent: originalContent.trim(),
      formId: selectedFormId,
      style: selectedStyle,
      customPrompt: customPrompt.trim() || undefined,
      useBrandLibrary,
      brandProfile
    };

    startAutomation(selectedPlatforms, request);
  };

  // 处理复制
  const handleCopyContent = (content: string, platformId: string) => {
    // 复制逻辑已在ResultsDisplay组件中处理
  };

  // 处理收藏 - 从原版AdaptPage完整迁移
  const handleSaveToFavorites = async (platformId: string, content: string, versionId?: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: t('adapt.errors.loginRequired'),
        description: t('adapt.messages.loginToFavorite'),
        variant: "destructive"
      });
      return;
    }

    if (!content || content.trim().length === 0) {
      toast({
        title: t('adapt.errors.cannotFavorite'),
        description: t('adapt.errors.noContentToFavorite'),
        variant: "destructive"
      });
      return;
    }

    try {
      const favoriteKey = versionId ? `${platformId}-${versionId}` : platformId;

      // 检查是否已收藏
      if (persistentFavorites.has(favoriteKey)) {
        // $收藏
        const existingFavorites = (favoritesStore as any).favorites?.filter((fav: any) =>
          fav.metadata?.platformId === platformId &&
          (versionId ? fav.metadata?.versionId === versionId : !fav.metadata?.versionId)
        ) || [];

        existingFavorites.forEach((fav: any) => {
          removeFavorite(fav.id);
        });

        // 从本地存储中移除
        const favoritesResult = favoritesDataManager.loadData();
        const favorites = (favoritesResult.data as any[]) || [];
        const updatedFavorites = favorites.filter((fav: any) => {
          const key = `${fav.metadata?.platformId || fav.source}${fav.metadata?.versionId ? `-${fav.metadata.versionId}` : ''}`;
          return key !== favoriteKey;
        });
        favoritesDataManager.saveData(updatedFavorites);

        setPersistentFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(favoriteKey);
          return newSet;
        });

        toast({
          title: t('adapt.messages.favoriteRemoved'),
          description: t('adapt.messages.favoriteRemovedDescription'),
        });
      } else {
        // 添加收藏（统一Store）
        const favoriteId = (() => {
          const id = `fav_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
          const item = {
            id,
            type: 'content' as const,
            title: `${getPlatformName(platformId, availablePlatforms)}内容 - ${versionId || '主版本'}`,
            content,
            tags: [] as string[],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          addFavorite(item);
          return id;
        })();
        console.log('🔍 adding收藏:', { favoriteId, userId: user.id, platformId, versionId });

        // 同时保存到本地存储（向后兼容）
        const favoritesResult = favoritesDataManager.loadData();
        const favorites = (favoritesResult.data as any[]) || [];
        const legacyFavoriteItem = {
          id: favoriteId,
          title: favoriteItem.title,
          content: favoriteItem.content,
          description: favoriteItem.description,
          tags: favoriteItem.tags,
          source: favoriteItem.source,
          metadata: favoriteItem.metadata,
          createdAt: Date.now()
        };
        favorites.push(legacyFavoriteItem);
        favoritesDataManager.saveData(favorites);

        setPersistentFavorites(prev => new Set(prev).add(favoriteKey));

        // 临时视觉反馈
        setFavoriteStates(prev => new Set(prev).add(favoriteKey));

        // 设置自动清除视觉反馈
        const existingTimeout = favoriteTimeoutsRef.current.get(favoriteKey);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeoutId = setTimeout(() => {
          setFavoriteStates(prev => {
            const newSet = new Set(prev);
            newSet.delete(favoriteKey);
            return newSet;
          });
          favoriteTimeoutsRef.current.delete(favoriteKey);
        }, 3000);

        favoriteTimeoutsRef.current.set(favoriteKey, timeoutId);

        toast({
          title: t('adapt.messages.favoriteSuccess'),
          description: t('adapt.messages.favoriteAdded'),
        });
      }
    } catch (error) {
      console.error('Favorite operation failed:', error);
      toast({
        title: t('adapt.errors.favoriteFailed'),
        description: t('adapt.messages.favoriteError'),
        variant: "destructive"
      });
    }
  };




  // 处理发布 - 一键转发功能
  const handlePublishToPlatform = (platformId: string, content: string) => {
    try {
      // 复制内容到剪贴板
      navigator.clipboard.writeText(content).then(() => {
        // 保存到转发历史

        // 跳转到平台
        const url = platformUrls[platformId];
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
          toast({
            title: t('adapt.messages.contentCopiedAndRedirecting'),
            description: t('adapt.messages.contentCopiedToClipboard', { platform: getPlatformName(platformId, availablePlatforms) }),
          });
        } else {
          toast({
            title: t('adapt.messages.contentCopied'),
            description: t('adapt.messages.contentCopiedManual', { platform: getPlatformName(platformId, availablePlatforms) }),
          });
        }
      }).catch(() => {
        toast({
          title: t('adapt.errors.copyFailed'),
          description: t('adapt.messages.copyToClipboardFailed'),
          variant: "destructive"
        });
      });
    } catch (error) {
      console.error('One-click forward failed:', error);
      toast({
        title: t('adapt.errors.forwardFailed'),
        description: t('adapt.messages.oneClickForwardFailed'),
        variant: "destructive"
      });
    }
  };

  // 平台设置更新
  const handlePlatformSettingUpdate = (
    platformId: string,
    key: keyof typeof platformSettings[string],
    value: any
  ) => {
    updatePlatformSettings(platformId, { [key]: value });
  };

  // 处理版本选择
  const handleVersionSelect = (platformId: string, versionId: string) => {
    setSelectedVersions(prev => ({
      ...prev,
      [platformId]: versionId
    }));
  };

  // 处理批量转发
  const handleBatchPublish = async () => {
    // 只展示有内容的平台（包括版本内容）
    const available = results.filter(r => {
      return r.content || (r.versions && r.versions.length > 0);
    }).map(r => r.platformId);

    if (available.length === 0) {
      toast({
        title: t('adapt.errors.noContentToForward'),
        description: t('adapt.messages.generateContentFirst'),
        variant: "destructive"
      });
      return;
    }

    // 构建批量转发平台数据
    const forwardPlatforms = await Promise.all(
      available.map(async (pid) => {
        const result = results.find(r => r.platformId === pid);
        if (!result) return null;

        // 获取内容、标题和标签
        let content = '';
        let title = '';
        let tags: string[] = [];

        if (result.versions && result.versions.length > 0) {
          // 使用选中的版本数据
          const selectedVersionId = selectedVersions[pid] || 'version-a';
          const version = result.versions.find(v => v.id === selectedVersionId) || result.versions[0];

          content = version.content;
          // 🔧 FIX: 从titleStates获取真实生成的标题，而不是version.title的占位符
          const titleState = titleStates[pid];
          title = titleState?.title || `${content.substring(0, 30)}...`;
          tags = version.tags || [];
        } else if (result.content) {
          content = result.content;
          // 🔧 FIX: 从titleStates获取真实生成的标题
          const titleState = titleStates[pid];
          title = titleState?.title || `${content.substring(0, 30)}...`;
          tags = [];
        }

        if (!content) return null;

        // 获取平台信息
        const platform = availablePlatforms.find((p: any) => p.id === pid);
        if (!platform) return null;

        return {
          id: pid,
          name: platform.name,
          icon: platform.name.charAt(0),
          url: platformUrls[pid] || `https://${pid}.com`,
          title,
          content,
          tags: tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        };
      })
    );

    const validPlatforms = forwardPlatforms.filter(Boolean);

    if (validPlatforms.length === 0) {
      toast({
        title: t('adapt.errors.noValidPlatforms'),
        description: t('adapt.messages.checkPlatformConfig'),
        variant: "destructive"
      });
      return;
    }

    // 打开批量转发工作台
    setBatchForwardPlatforms(validPlatforms);
    setBatchForwardModalOpen(true);

    toast({
      title: t('adapt.messages.batchForwardStarted'),
      description: t("adapt.messages.platformPrepared", { count: validPlatforms.length }),
    });
  };

  // 使用扩展进行批量转发
  const handleExtensionBatchForward = async () => {
    // 检查扩展是否已安装
    if (extensionInstalled === false) {
      setShowExtensionPrompt(true);
      toast({
        title: '需要安装浏览器扩展',
        description: '请先安装"文派一键转发助手"扩展以使用自动填充功能',
        variant: "destructive"
      });
      return;
    }

    // 收集所有平台的内容
    const platformContents: Array<{
      platformId: string;
      platformName: string;
      content: string;
      title?: string;
      tags?: string[];
    }> = [];

    for (const result of results) {
      let content = '';
      let title = '';
      let tags: string[] = [];

      if (result.versions && result.versions.length > 0) {
        const selectedVersionId = selectedVersions[result.platformId] || 'version-a';
        const version = result.versions.find(v => v.id === selectedVersionId) || result.versions[0];
        content = version.content;
        title = version.title || '';
        tags = version.tags || [];
      } else if (result.content) {
        content = result.content;
        const titleState = titleStates[result.platformId];
        title = titleState?.title || '';
        tags = extractedTagsMap[result.platformId] || [];
      }

      if (content) {
        platformContents.push({
          platformId: result.platformId,
          platformName: getPlatformName(result.platformId, availablePlatforms),
          content,
          title,
          tags
        });
      }
    }

    if (platformContents.length === 0) {
      toast({
        title: '无可转发内容',
        description: '请先生成内容',
        variant: "destructive"
      });
      return;
    }

    // 调用扩展
    toast({
      title: '🚀 启动扩展自动填充',
      description: `正在准备 ${platformContents.length} 个平台的内容...`,
    });

    const result = await callExtensionBatchForward(platformContents);

    if (result.success) {
      toast({
        title: '✅ 扩展调用成功',
        description: '扩展将自动打开各平台并填充内容',
      });
    } else {
      toast({
        title: '❌ 扩展调用失败',
        description: result.error || '未知错误',
        variant: "destructive"
      });
    }
  };

  // 新的自动化转发处理函数 - 从原版完整迁移
  const handleStartAutomationUI = async (selectedPlatforms: string[], options: AutomationOptions) => {
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
        title: t('adapt.messages.startingAutomation'),
        description: t("adapt.messages.preparingAutomation", { count: selectedPlatforms.length }),
      });

      // 动态导入自动化模块
      const { executeBatchForward } = await import('@/automation/batchForward');

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

      // 显示结果
      const successCount = convertedResults.filter(r => r.success).length;
      const failureCount = convertedResults.length - successCount;

      if (successCount > 0) {
        toast({
          title: t('adapt.messages.automationCompleted'),
          description: t("adapt.messages.automationSuccess", { success: successCount, failure: failureCount }),
        });
      } else {
        toast({
          title: t('adapt.errors.automationFailed'),
          description: t('adapt.messages.automationAllFailed'),
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Automation forward failed:', error);
      setAutomationProgress(prev => prev ? {
        ...prev,
        status: 'error'
      } : undefined);

      toast({
        title: t('adapt.errors.automationFailed'),
        description: error instanceof Error ? error.message : t('common.unknownError'),
        variant: "destructive"
      });
    } finally {
      setAutomationRunning(false);
    }
  };

  // 自动化转发
  const handleCancelAutomation = () => {
    setAutomationRunning(false);
    setAutomationProgress(prev => prev ? {
      ...prev,
      status: 'cancelled'
    } : undefined);

    toast({
      title: t('adapt.messages.automationCancelled'),
      description: t('adapt.messages.automationCancelledByUser'),
    });
  };

  // 重试单个平台
  const handleRetryPlatform = async (platformId: string) => {
    try {
      const request = {
        originalContent: originalContent.trim(),
        formId: selectedFormId,
        style: selectedStyle,
        customPrompt: customPrompt.trim() || undefined,
        useBrandLibrary,
        brandProfile,
        platform: platformId
      };
      await retryPlatform(platformId, request);
      toast({
        title: t('adapt.messages.retrySuccess'),
        description: t('adapt.messages.retrySuccess', { platform: platformId }),
      });
    } catch (error) {
      toast({
        title: t('adapt.errors.retryFailed'),
        description: error instanceof Error ? error.message : t('common.unknownError'),
        variant: "destructive"
      });
    }
  };

  // 确认发布函数 - 一键转发确认Dialog的处理函数
  const confirmPublish = async () => {
    if (!pendingPublish) return;

    try {
      // 复制内容到剪贴板
      await navigator.clipboard.writeText(pendingPublish.content);

      const historyItem = {
        id: Date.now().toString(),
        platformId: pendingPublish.platformId,
        platformName: getPlatformName(pendingPublish.platformId, availablePlatforms),
        content: pendingPublish.content,
        time: new Date().toISOString()
      };

      // 保存到历史记录
      const existingHistory = await globalDataManager.getData<any[]>('user_history') || [];
      existingHistory.push(historyItem);

      if (existingHistory.length > 100) {
        existingHistory.splice(0, existingHistory.length - 100);
      }

      await globalDataManager.setData('user_history', existingHistory);


      // 打开对应平台
      const platformUrl = platformUrls[pendingPublish.platformId];
      if (platformUrl) {
        window.open(platformUrl, '_blank', 'noopener,noreferrer');
      }

      // 关闭Dialog
      setPublishDialogOpen(false);
      setPendingPublish(null);

      toast({
        title: t('adapt.messages.forwardSuccess'),
        description: t('adapt.messages.forwardSuccessDesc', { platform: getPlatformName(pendingPublish.platformId, availablePlatforms) }),
      });

    } catch (error) {
      console.error('Forward failed:', error);
      toast({
        title: t('adapt.errors.forwardFailed'),
        description: t('adapt.messages.copyContentAndOpenPage'),
        variant: "destructive"
      });
    }
  };

  // 批量发布Dialog相关函数
  const handleBatchPublishConfirm = async () => {
    if (batchQueue.length === 0) return;

    try {
      // 开始处理队列中的第一个任务
      const firstTask = batchQueue[0];
      setBatchCurrent(firstTask);
      setBatchQueue(prev => prev.slice(1));

      // 复制内容到剪贴板
      await navigator.clipboard.writeText(firstTask.content);

      const historyItem = {
        id: Date.now().toString(),
        platformId: firstTask.platformId,
        platformName: getPlatformName(firstTask.platformId, availablePlatforms),
        content: firstTask.content,

        time: new Date().toISOString()
      };

      // 保存到历史记录
      const existingHistory = await globalDataManager.getData<any[]>('user_history') || [];
      existingHistory.push(historyItem);
      await globalDataManager.setData('user_history', existingHistory);

      // 打开对应平台
      const platformUrl = platformUrls[firstTask.platformId];
      if (platformUrl) {
        window.open(platformUrl, '_blank', 'noopener,noreferrer');
      }

      toast({
        title: t('adapt.messages.batchPublishStarted'),
        description: t("adapt.messages.processingPlatform", { platform: getPlatformName(firstTask.platformId, availablePlatforms), remaining: batchQueue.length }),
      });

      // 如果还有更多任务，等待一段时间后继续
      if (batchQueue.length > 0) {
        setTimeout(() => {
          handleBatchPublishConfirm();
        }, 3000); // 3秒间隔
      } else {
        // 所有任务完成
        setBatchPublishOpen(false);
        setBatchCurrent(null);
        toast({
          title: t('adapt.messages.batchPublishCompleted'),
          description: t('adapt.messages.allTasksCompleted'),
        });
      }

    } catch (error) {
      console.error('Batch publish failed:', error);
      toast({
        title: t('adapt.errors.batchPublishFailed'),
        description: t('adapt.messages.batchPublishProcessError'),
        variant: "destructive"
      });
    }
  };

  // 批量发布
  const handleBatchPublishCancel = () => {
    setBatchPublishOpen(false);
    setBatchQueue([]);
    setBatchCurrent(null);
    setBatchSelectedPlatforms([]);
    toast({
      title: t('adapt.messages.batchPublishCancelled'),
      description: t('adapt.messages.batchPublishOperationCancelled'),
    });
  };


  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: '64px' }}>
      {/* 主导航栏 */}
      <Header />

      {/* 页面导航 */}
      <PageNavigation
        title="AI内容适配"
        description="智能多平台内容适配，一键生成适合不同平台的优质内容"
        showAdaptButton={false}
      />

      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* 历史记录按钮（右侧） */}
        <HistoryLauncher availablePlatforms={availablePlatforms} />

        {/* 内容输入区域 */}
        <ContentInputSection
          {...{
            originalContent,
            onContentChange: setOriginalContent,
            usageRemaining: displayRemaining,
            currentTier: effectiveUserTier,
            useBrandLibrary,
            onBrandLibraryChange: updateBrandLibrary,
            t
          } as any}
        />
        {/* 品牌库为空的非阻断提示 */}
        {useBrandLibrary && !brandProfile && (
          <Alert className="mt-2">
            <AlertDescription>{BRAND_MESSAGES.EMPTY}</AlertDescription>
          </Alert>
        )}

        {/* 平台选择区域 */}
        <PlatformSelector
          {...{
            availablePlatforms,
            selectedPlatforms,
            onPlatformToggle: (platformId: string) => {
              const newPlatforms = selectedPlatforms.includes(platformId)
                ? selectedPlatforms.filter(id => id !== platformId)
                : [...selectedPlatforms, platformId];
              updateSelectedPlatforms(newPlatforms);
            },
            onBatchSelect: (platformIds: string[]) => {
              updateSelectedPlatforms(platformIds);
              console.log('批量选择平台:', { selected: platformIds.length, total: availablePlatforms.length });
            },
            platformSettings,
            onPlatformSettingUpdate: handlePlatformSettingUpdate,
            settingsMode,
            onSettingsModeChange: updateSettingsMode,
            globalSettings,
            getPlatformIcon,
            getPlatformName: (platformId: string) => getPlatformName(platformId, availablePlatforms),
            getPlatformMaxCharCount,
            getPlatformRecommendedCharCount,
            t
          } as any}
        />

        {/* 生成控制区域 */}
        <GenerationControls
          {...{
            generating,
            queueRunning,
            selectedFormId,
            selectedStyle,
            onFormChange: updateSelectedForm,
            onStyleChange: updateSelectedStyle,
            selectedModel,
            availableModels,
            onModelChange: updateSelectedModel,
            useBrandLibrary,
            brandProfile,
            onBrandLibraryChange: updateBrandLibrary,
            customPrompt,
            onCustomPromptChange: updateCustomPrompt,
            selectedPlatforms,
            originalContent,
            onGenerate: handleGenerate,
            onStopGeneration: () => {/* TODO: 实现停止生成 */},
            onStartAutomation: handleStartAutomation,
            onStopAutomation: stopAutomation,
            onClearResults: clearResults,
            onBatchPublish: handleBatchPublish,
            validationErrors,
            t
          } as any}
        />

        {/* 结果展示区域 */}
        <div ref={resultsSectionRef} />
        {results.length > 0 ? (
          <ResultsDisplay
            results={results}
            retryingPlatforms={retryingPlatforms}
            generatingComparison={generatingComparison}
            titleStates={titleStates}
            comparisonContent={comparisonContent}
            showComparison={showComparison}
            extractedTagsMap={extractedTagsMap}
            selectedVersions={selectedVersions}
            favoriteStates={favoriteStates}
            persistentFavorites={persistentFavorites}
            onContentUpdate={updatePlatformContent}
            onRetry={handleRetry}
            onGenerateComparison={handleGenerateComparison}
            onGenerateTitle={handleGenerateTitle}
            onCopyContent={handleCopyContent}
            onSaveToFavorites={handleSaveToFavorites}
            onPublishToPlatform={handlePublishToPlatform}
            onVersionSelect={handleVersionSelect}
            getPlatformIcon={getPlatformIcon}
            getPlatformName={(platformId: string) => getPlatformName(platformId, availablePlatforms)}
            getEffectiveCharCount={(platformId) => getEffectiveSettings(platformId).charCount}
          />
        ) : generating && (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30">
            <div className="p-6">
              <AIContentGenerationAnimation
                platforms={selectedPlatforms}
                message={t('components.labels.消息')}
                showProgress={true}
              />
            </div>
          </div>
        )}


        {/* 扩展快捷操作按钮 */}
        {extensionInstalled && results.length > 0 && !generating && (
          <div className="mt-6">
            <Button
              onClick={handleExtensionBatchForward}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Zap className="w-5 h-5 mr-2" />
              🔥 使用扩展一键填充所有平台（推荐）
            </Button>
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
                  contentLength = result.versions[0].content.length;
                }

                const titleState = titleStates[result.platformId];
                return {
                  id: result.platformId,
                  name: getPlatformName(result.platformId, availablePlatforms),
                  hasContent: !!(result.content || (result.versions && result.versions.length > 0)),
                  contentLength,
                  hasTitle: titleState?.hasTitle || false,
                  isTitleGenerating: titleState?.isGenerating || false
                };
              })}
              onStartAutomation={handleStartAutomationUI}
              onCancelAutomation={handleCancelAutomation}
              onRetryPlatform={handleRetryPlatform}
              progress={automationProgress}
              isRunning={automationRunning}
              onBatchPublish={handleBatchPublish}
            />
          </div>
        )}
      </div>

      {/* 批量转发工作台弹窗 */}
      <BatchForwardModal
        open={batchForwardModalOpen}
        onOpenChange={setBatchForwardModalOpen}
        platforms={batchForwardPlatforms}
      />


      {/* 一键转发确认Dialog - 从原版完整迁移 */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent style={zIndexManager.createModalStyles('DIALOG_CONTENT')}>
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription>

            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-foreground">
            <p className="mb-3">
              {t('adapt.dialogs.forwardConfirm.contentWillBeCopied', { platform: pendingPublish ? getPlatformName(pendingPublish.platformId, availablePlatforms) : '' })}
            </p>
            <div className="bg-muted/50 rounded p-3 mt-2 text-sm break-all max-h-32 overflow-auto border">
              {pendingPublish?.content}
            </div>
            <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">

            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>

            </Button>
            <Button variant="default" onClick={confirmPublish}>

            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量发布Dialog - 传统批量转发功能 */}
      <Dialog open={batchPublishOpen} onOpenChange={setBatchPublishOpen}>
        <DialogContent
          className="max-w-2xl"
          style={zIndexManager.createModalStyles('DIALOG_CONTENT')}
        >
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription>
              {batchCurrent ?
                t("adapt.dialogs.batchPublishProcessing", { platform: getPlatformName(batchCurrent.platformId, availablePlatforms) }) :
                t("adapt.dialogs.batchPublishDescription", { count: batchSelectedPlatforms.length })
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {batchCurrent ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-medium">
                    {t('adapt.dialogs.batchPublish.processing', { platform: getPlatformName(batchCurrent.platformId, availablePlatforms) })}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">

                  </div>
                </div>
                <div className="bg-muted/50 rounded p-3 text-sm max-h-32 overflow-auto">
                  {batchCurrent.content}
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">

                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm">

                </div>
                <div className="grid grid-cols-2 gap-2">
                  {batchSelectedPlatforms.map(platformId => (
                    <Badge key={platformId} variant="outline" className="justify-center">
                      {getPlatformName(platformId, availablePlatforms)}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  {t('adapt.dialogs.batchPublish.systemWillProcess')}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleBatchPublishCancel}>

            </Button>
            {!batchCurrent && (
              <Button onClick={handleBatchPublishConfirm} disabled={batchSelectedPlatforms.length === 0}>
                {t('adapt.buttons.startBatchPublish')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContentAdapterPage;
