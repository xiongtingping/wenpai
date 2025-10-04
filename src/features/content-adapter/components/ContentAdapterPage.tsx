/**
 * 内容适配器主页面组件
 * 集成所有子组件和Hook，提供完整的内容适配功能
 * 🔥 CACHE_BUST: 2025-01-09-21:45 - 8个关键修复已生效
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Copy } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { PageNavigation } from '@/components/layout/PageNavigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/compatibility-layer';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
// import { useUnifiedUsageStats } from '@/hooks/useUnifiedUsageStats'; // 🎯 已废弃
import { useUsageCount } from '@/hooks/useUsage'; // 🎯 新架构: Store-based Hook
import { getUserTier } from '@/utils/subscriptionUtils';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

// 导入统一Z-Index管理器
import { zIndexManager, ZIndexLayers } from '@/utils/zIndexManager';

// 导入工具函数和配置
import { getAvailableModelsForTier, getAllModels } from '@/config/aiModels';
import { getAvailablePlatforms } from '@/api/contentAdapter';

// 导入收藏系统
import { useFavoritesStore, favoritesUtils } from '@/stores/compatibility-layer';
import { useUserDataIsolation } from '@/utils/userDataIsolation';

// 导入增强历史记录组件 - 暂时使用原版避免循环引用
import { EnhancedHistoryDialog } from './EnhancedHistoryDialog';

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

// 历史记录类型定义
type ShareHistoryItem = {
  id: string;
  platformId: string;
  platformName: string;
  content: string;
  time: string;
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

  // 兼容旧代码
  const { usageCount, maxUsage, usageRemaining, decrementUsage, updateMaxUsage } = useAuthStore();
  const { primaryStatus, refresh: refreshSubscription } = useSubscriptionStatus();

  // 收藏系统
  const favoritesStore = useFavoritesStore();
  const favoritesDataManager = useUserDataIsolation({
    modulePrefix: 'adapt_favorites'
  });

  // 历史记录系统
  const historyDataManager = useUserDataIsolation({
    modulePrefix: 'adapt_history'
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

  // 🎯 新架构: 直接从Store获取,无需复杂的缓存逻辑
  // Store已经处理了缓存和一致性,组件只需消费数据
  const displayRemaining = propUsageRemaining !== undefined ? propUsageRemaining : remaining;

  // 🔍 调试日志
  React.useEffect(() => {
    console.log('🎯 ContentAdapterPage 使用次数状态:', {
      来源: 'useUsageCount Hook',
      used,
      available,
      remaining,
      displayRemaining,
      propUsageRemaining,
      兼容层数据: { usageCount, maxUsage, usageRemaining }
    });
  }, [used, available, remaining, displayRemaining, propUsageRemaining, usageCount, maxUsage, usageRemaining]);

  // 🔧 FIX: 监听Token使用量更新事件，自动刷新显示
  React.useEffect(() => {
    const handleTokenUsageUpdate = async (event: CustomEvent) => {
      console.log('📢 收到Token使用量更新事件:', event.detail);

      // 方法1: 强制刷新订阅状态
      refreshSubscription();

      // 方法2: 直接从Store刷新使用统计
      try {
        const { useUnifiedStore } = await import('@/stores/unified-state-store');
        const refreshUsageStats = useUnifiedStore.getState().refreshUsageStats;
        await refreshUsageStats();
        console.log('✅ 使用统计已刷新');
      } catch (error) {
        console.error('❌ 刷新使用统计失败:', error);
      }
    };

    window.addEventListener('tokenUsageUpdated', handleTokenUsageUpdate as EventListener);

    return () => {
      window.removeEventListener('tokenUsageUpdated', handleTokenUsageUpdate as EventListener);
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

  // 加载转发历史 - 移动到Hook使用之前
  const loadShareHistory = React.useCallback(() => {
    const history: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
    setShareHistory(history);
  }, []);

  // 保存到历史记录 - 移动到Hook使用之前
  const saveToHistory = React.useCallback((results: any[]) => {
    console.log('🔍 saving历史记录:', { userId: user?.id, isAuthenticated, resultsCount: results.length });
    const result = historyDataManager.loadData<unknown[]>();
    let list: unknown[] = result.data || [];
    console.log('🔍 current历史记录quantity:', list.length);

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
    console.log('✅ 历史记录saved，newquantity:', list.length);
  }, [historyDataManager, user?.id, isAuthenticated]);

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
    clearResults
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

            // 异步生成标题，不阻塞UI
            setTimeout(() => {
              generateTitle(content, r.platformId);
            }, 800); // 延迟800ms，确保UI渲染完成
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
  
  // 传统批量转发Dialog状态
  const [batchPublishOpen, setBatchPublishOpen] = React.useState(false);
  const [batchSelectedPlatforms, setBatchSelectedPlatforms] = React.useState<string[]>([]);
  const [batchQueue, setBatchQueue] = React.useState<{ platformId: string; content: string }[]>([]);
  const [batchCurrent, setBatchCurrent] = React.useState<{ platformId: string; content: string } | null>(null);

  // 自动化转发状态
  const [automationRunning, setAutomationRunning] = React.useState(false);
  const [automationProgress, setAutomationProgress] = React.useState<AutomationProgress | undefined>();

  // 历史记录状态
  const [showHistory, setShowHistory] = React.useState(false);
  const [shareHistory, setShareHistory] = React.useState<ShareHistoryItem[]>([]);

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

  // 加载历史记录
  React.useEffect(() => {
    if (showHistory) {
      loadShareHistory();
    }
  }, [showHistory, loadShareHistory]);

  // 🔧 FIX: 同步实际使用次数和最大使用次数 - 从原版完整迁移
  React.useEffect(() => {
    if (user?.id) {
      const syncUsageStats = async () => {
        try {
          // 获取用户当前等级 - 与其他组件保持一致的逻辑
          const calculatedTier = (() => {
            // 优先使用订阅状态中的等级信息
            if (primaryStatus?.status === 'active' && primaryStatus.tier) {
              return primaryStatus.tier;
            }

            // 如果订阅状态中没有等级信息，但有活跃订阅，根据状态标签推断等级
            if (primaryStatus?.status === 'active') {
              const statusLabel = primaryStatus.statusLabel?.toLowerCase() || '';
              if (statusLabel.includes(t('components.labels.高级版')) || statusLabel.includes('premium')) {
                return 'premium';
              } else if (statusLabel.includes(t('components.labels.专业版')) || statusLabel.includes('pro')) {
                return 'pro';
              }
            }

            // 回退到用户基本信息中的等级
            return getUserTier(user);
          })();

          // 🔧 FIX: 恢复正确的使用次数限制配置
          let newMaxUsage = -1; // 🔧 FIX: 默认设为无限制，避免闪烁
          if (calculatedTier === 'trial') {
            newMaxUsage = 10; // 体验版10次/月
          } else if (calculatedTier === 'pro') {
            newMaxUsage = 30; // 🔧 FIX: 专业版恢复为30次/月
          } else if (calculatedTier === 'premium') {
            newMaxUsage = -1; // 高级版无限制
          }

          // 🔧 FIX: 立即更新最大使用次数，避免状态闪烁
          if (newMaxUsage !== maxUsage) {
            console.log('🔄 updating使用countlimiting:', {
              currentTier: calculatedTier,
              oldMaxUsage: maxUsage,
              newMaxUsage,
              hasActiveSubscription: primaryStatus?.status === 'active'
            });
            updateMaxUsage(newMaxUsage);
          }

        } catch (error) {
          console.error('Failed to sync usage stats:', error);
        }
      };

      syncUsageStats();
    }
  }, [user?.id, primaryStatus?.status, updateMaxUsage, maxUsage]);

  // 🔧 FIX: 监听支付成功事件，立即更新使用次数状态 - 从原版完整迁移
  React.useEffect(() => {
    let paymentTimeoutId: NodeJS.Timeout | null = null;

    const handlePaymentSuccess = () => {
      console.log('🎉 收到支付successevent，refreshing使用countstate');
      // 强制刷新订阅状态
      refreshSubscription();
      // 延迟刷新
      paymentTimeoutId = setTimeout(() => {
        refreshSubscription();
      }, 1000);
    };

    const handleSubscriptionUpdated = (event: CustomEvent) => {
      console.log('🔄 收到subscribingupdatingevent，refreshing使用countstate', event.detail);
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
    // 🔧 FIX: 使用缓存的剩余次数，避免数据闪烁
    // 如果剩余次数为0或负数，阻止生成
    if (displayRemaining <= 0 && maxUsage !== -1) {
      console.log('❌ 使用countalready用完，阻止生成');
      toast({
        title: t('adapt.errors.usageExhausted'),
        description: t('adapt.messages.upgradeRequired'),
        variant: "destructive"
      });
      return false;
    }

    // 如果剩余次数较少（1-3次），显示提醒但允许继续生成
    if (displayRemaining <= 3 && displayRemaining > 0 && maxUsage !== -1) {
      console.log('⚠️ 使用count较少，display提醒但allowing生成');
      toast({
        title: t('adapt.errors.usageLow'),
        description: t("adapt.messages.usageReminder", { count: displayRemaining }),
        variant: "destructive"
      });
      // 不阻止生成，只是提醒
    }

    console.log('✅ 使用countchecking通过');
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
        const existingFavorites = favoritesStore.favorites.filter(fav =>
          fav.metadata?.platformId === platformId && 
          (versionId ? fav.metadata?.versionId === versionId : !fav.metadata?.versionId)
        );
        
        existingFavorites.forEach(fav => {
          favoritesStore.removeFavorite(fav.id);
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
        // 添加收藏
        const favoriteItem = favoritesUtils.createFavoriteItem(
          'content-generation',
          `${getPlatformName(platformId, availablePlatforms)}内容 - ${versionId || '主版本'}`,
          content,
          '内容适配器',
          {
            description: `来自${getPlatformName(platformId, availablePlatforms)}的适配内容`,
            tags: [], // TODO: 可以从结果中提取标签
            metadata: {
              platformId,
              versionId,
              originalContent: originalContent.slice(0, 100) + '...',
              charCount: content.length,
              createdBy: 'ai-adapter',
              userId: user.id
            }
          }
        );

        const favoriteId = favoritesStore.addFavorite(favoriteItem);
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


  // 清空转发历史
  const clearShareHistory = () => {
    localStorage.removeItem('shareHistory');
    setShareHistory([]);
    toast({
      title: t('adapt.messages.historyCleared'),
      description: t('adapt.messages.historyClearedDesc')
    });
  };

  // 删除单个历史记录
  const deleteHistoryItem = (id: string) => {
    const updatedHistory = shareHistory.filter(item => item.id !== id);
    setShareHistory(updatedHistory);
    localStorage.setItem('shareHistory', JSON.stringify(updatedHistory));
  };

  // 处理发布 - 一键转发功能
  const handlePublishToPlatform = (platformId: string, content: string) => {
    try {
      // 复制内容到剪贴板
      navigator.clipboard.writeText(content).then(() => {
        // 保存到转发历史
        const shareHistory = JSON.parse(localStorage.getItem('shareHistory') || '[]');
        shareHistory.unshift({
          id: Date.now().toString() + Math.random(),
          platformId,
          platformName: getPlatformName(platformId, availablePlatforms),
          content,
          time: new Date().toISOString()
        });
        localStorage.setItem('shareHistory', JSON.stringify(shareHistory.slice(0, 50)));

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
          title = version.title || `${content.substring(0, 30)}...`;
          tags = version.tags || [];
        } else if (result.content) {
          content = result.content;
          title = `${content.substring(0, 30)}...`;
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
      
      // 记录转发历史
      const historyItem = {
        id: Date.now().toString(),
        platformId: pendingPublish.platformId,
        platformName: getPlatformName(pendingPublish.platformId, availablePlatforms),
        content: pendingPublish.content,
        time: new Date().toISOString()
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('shareHistory') || '[]');
      existingHistory.push(historyItem);
      
      // 限制历史记录数量
      if (existingHistory.length > 100) {
        existingHistory.splice(0, existingHistory.length - 100);
      }
      
      localStorage.setItem('shareHistory', JSON.stringify(existingHistory));

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
      
      // 记录转发历史
      const historyItem = {
        id: Date.now().toString(),
        platformId: firstTask.platformId,
        platformName: getPlatformName(firstTask.platformId, availablePlatforms),
        content: firstTask.content,
        time: new Date().toISOString()
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('shareHistory') || '[]');
      existingHistory.push(historyItem);
      localStorage.setItem('shareHistory', JSON.stringify(existingHistory));

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
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              <span>历史记录</span>
            </Button>
          </div>
        }
      />

      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* 内容输入区域 */}
        <ContentInputSection
          originalContent={originalContent}
          onContentChange={setOriginalContent}
          usageRemaining={displayRemaining}
          currentTier={effectiveUserTier}
          useBrandLibrary={useBrandLibrary}
          onBrandLibraryChange={updateBrandLibrary}
          t={t}
        />

        {/* 平台选择区域 */}
        <PlatformSelector
          availablePlatforms={availablePlatforms}
          selectedPlatforms={selectedPlatforms}
          onPlatformToggle={(platformId) => {
            const newPlatforms = selectedPlatforms.includes(platformId)
              ? selectedPlatforms.filter(id => id !== platformId)
              : [...selectedPlatforms, platformId];
            updateSelectedPlatforms(newPlatforms);
          }}
          onBatchSelect={(platformIds) => {
            // 批量选择函数 - 直接设置选中的平台列表
            updateSelectedPlatforms(platformIds);
            console.log('批量选择平台:', { selected: platformIds.length, total: availablePlatforms.length });
          }}
          platformSettings={platformSettings}
          onPlatformSettingUpdate={handlePlatformSettingUpdate}
          settingsMode={settingsMode}
          onSettingsModeChange={updateSettingsMode}
          globalSettings={globalSettings}
          getPlatformIcon={getPlatformIcon}
          getPlatformName={(platformId: string) => getPlatformName(platformId, availablePlatforms)}
          getPlatformMaxCharCount={getPlatformMaxCharCount}
          getPlatformRecommendedCharCount={getPlatformRecommendedCharCount}
          t={t}
        />

        {/* 生成控制区域 */}
        <GenerationControls
          generating={generating}
          queueRunning={queueRunning}
          selectedFormId={selectedFormId}
          selectedStyle={selectedStyle}
          onFormChange={updateSelectedForm}
          onStyleChange={updateSelectedStyle}
          selectedModel={selectedModel}
          availableModels={availableModels}
          onModelChange={updateSelectedModel}
          useBrandLibrary={useBrandLibrary}
          brandProfile={brandProfile}
          onBrandLibraryChange={updateBrandLibrary}
          customPrompt={customPrompt}
          onCustomPromptChange={updateCustomPrompt}
          selectedPlatforms={selectedPlatforms}
          originalContent={originalContent}
          onGenerate={handleGenerate}
          onStopGeneration={() => {/* TODO: 实现停止生成 */}}
          onStartAutomation={handleStartAutomation}
          onStopAutomation={stopAutomation}
          onClearResults={clearResults}
          onBatchPublish={handleBatchPublish}
          validationErrors={validationErrors}
          t={t}
        />

        {/* 结果展示区域 */}
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

      {/* 增强历史记录弹窗 */}
      <EnhancedHistoryDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        shareHistory={shareHistory}
        onClearHistory={clearShareHistory}
        onDeleteItem={deleteHistoryItem}
        availablePlatforms={availablePlatforms}
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
