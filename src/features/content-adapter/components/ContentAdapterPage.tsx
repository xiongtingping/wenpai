/**
 * 内容适配器主页面组件
 * 集成所有子组件和Hook，提供完整的内容适配功能
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { PageNavigation } from '@/components/layout/PageNavigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useUnifiedUsageStats } from '@/hooks/useUnifiedUsageStats';
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
import ResultsDisplay from './ResultsDisplay';
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

// 导入工具函数和配置
import { getAvailableModelsForTier } from '@/config/aiModels';
import { getAvailablePlatforms } from '@/api/contentAdapter';

// 导入收藏系统
import { useFavoritesStore, favoritesUtils } from '@/stores/favoritesStore';
import { useUserDataIsolation } from '@/utils/userDataIsolation';

/**
 * 主流平台内容发布入口URL映射 - 从原版完整迁移
 * 用于一键转发跳转
 */
const platformUrls: Record<string, string> = {
  // 主流社交媒体平台
  weibo: 'https://weibo.com/compose',
  xiaohongshu: 'https://creator.xiaohongshu.com/publish/publish',
  zhihu: 'https://zhuanlan.zhihu.com/write',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  wechat: 'https://mp.weixin.qq.com/',
  
  // 视频平台
  bilibili: 'https://member.bilibili.com/platform/upload/text/edit',
  kuaishou: 'https://cp.kuaishou.com/article/publish',
  
  // 资讯平台
  toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
  baijiahao: 'https://baijiahao.baidu.com/builder/rc/edit',
  
  // 国际平台
  facebook: 'https://www.facebook.com/pages/create/',
  twitter: 'https://twitter.com/compose/tweet',
  linkedin: 'https://www.linkedin.com/feed/',
  
  // 技术社区
  v2ex: 'https://www.v2ex.com/new',
  github: 'https://github.com/new',
  juejin: 'https://juejin.cn/editor/drafts/new',
  csdn: 'https://mp.csdn.net/mp_blog/creation/editor',
  
  // 其他平台
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

// 国际化Hook (模拟)
const useTranslation = () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      'adapt.inputOriginalContent': '输入原始内容',
      'adapt.remainingUsage': '剩余使用次数',
      'adapt.selectPlatforms': '选择目标平台',
      'adapt.contentPlaceholder': '请输入要适配的原始内容...',
      'adapt.history': '历史记录'
    };
    return translations[key] || key;
  }
});

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // 使用真实的状态管理
  const { usageCount, maxUsage, usageRemaining, decrementUsage, updateMaxUsage } = useAuthStore();
  const { primaryStatus, refresh: refreshSubscription } = useSubscriptionStatus();
  const unifiedUsageInfo = useUnifiedUsageStats();

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

    // 2. 使用统一状态管理的等级信息
    if (!unifiedUsageInfo.loading && unifiedUsageInfo.userTier) {
      return unifiedUsageInfo.userTier;
    }

    // 3. 最后使用工具函数获取等级
    return getUserTier(user);
  };

  const effectiveUserTier = getCurrentTier();

  // 🔧 FIX: 使用统一状态管理的数据计算剩余次数
  const getEffectiveUsageRemaining = () => {
    if (propUsageRemaining !== undefined) return propUsageRemaining;

    // 优先使用统一状态管理的数据
    if (!unifiedUsageInfo.loading) {
      return unifiedUsageInfo.remainingUses;
    }

    // 回退到原有状态
    return usageRemaining;
  };

  const effectiveUsageRemaining = getEffectiveUsageRemaining();
  const { t } = useTranslation();

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
    autoSave: true,
    storageKey: 'content-adapter-settings'
  });

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

  // 使用生成队列Hook
  const {
    running: queueRunning,
    startAutomation,
    stopAutomation
  } = useGenerationQueue({
    maxConcurrency: 3,
    onTaskComplete: (task, result) => {
      console.log('任务完成:', task.platformId, result);
    },
    onQueueComplete: () => {
      toast({
        title: "批量生成完成",
        description: "所有平台内容已生成完毕",
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
  }, [initialPlatforms, updateSelectedPlatforms]);

  // 初始化收藏状态
  React.useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const favoriteKeys = favorites.map((fav: any) =>
        `${fav.metadata?.platformId || fav.source}${fav.metadata?.versionId ? `-${fav.metadata.versionId}` : ''}`
      );
      setPersistentFavorites(new Set(favoriteKeys));
    } catch (error) {
      console.error('加载收藏状态失败:', error);
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
              if (statusLabel.includes('高级版') || statusLabel.includes('premium')) {
                return 'premium';
              } else if (statusLabel.includes('专业版') || statusLabel.includes('pro')) {
                return 'pro';
              }
            }

            // 回退到用户基本信息中的等级
            return getUserTier(user);
          })();

          // 🔧 FIX: 恢复正确的使用次数限制配置
          let newMaxUsage = 10; // 默认体验版
          if (calculatedTier === 'pro') {
            newMaxUsage = 30; // 🔧 FIX: 专业版恢复为30次/月
          } else if (calculatedTier === 'premium') {
            newMaxUsage = -1; // 高级版无限制
          }

          // 🔧 FIX: 立即更新最大使用次数，避免状态闪烁
          if (newMaxUsage !== maxUsage) {
            console.log('🔄 更新使用次数限制:', {
              currentTier: calculatedTier,
              oldMaxUsage: maxUsage,
              newMaxUsage,
              hasActiveSubscription: primaryStatus?.status === 'active'
            });
            updateMaxUsage(newMaxUsage);
          }

        } catch (error) {
          console.error('同步使用次数失败:', error);
        }
      };

      syncUsageStats();
    }
  }, [user?.id, primaryStatus?.status, updateMaxUsage, maxUsage]);

  // 🔧 FIX: 监听支付成功事件，立即更新使用次数状态 - 从原版完整迁移
  React.useEffect(() => {
    let paymentTimeoutId: NodeJS.Timeout | null = null;

    const handlePaymentSuccess = () => {
      console.log('🎉 收到支付成功事件，刷新使用次数状态');
      // 强制刷新订阅状态
      refreshSubscription();
      // 延迟刷新
      paymentTimeoutId = setTimeout(() => {
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
      if (paymentTimeoutId) {
        clearTimeout(paymentTimeoutId);
      }
    };
  }, [refreshSubscription]);

  // 获取可用数据
  const availablePlatforms = getAvailablePlatforms();
  const availableModels = getAvailableModelsForTier(effectiveUserTier as any);

  // 验证设置
  const validation = validateSettings();
  const validationErrors = Array.from(new Set([
    ...validation.errors,
    ...(originalContent.trim().length === 0 ? ['请输入原始内容'] : []),
    ...(selectedPlatforms.length === 0 ? ['请选择至少一个目标平台'] : [])
  ]));

  // 检查使用次数并显示提醒 - 从原版完整迁移
  const checkUsageAndShowReminder = () => {
    // 如果剩余次数为0或负数，阻止生成
    if (effectiveUsageRemaining <= 0 && maxUsage !== -1) {
      console.log('❌ 使用次数已用完，阻止生成');
      toast({
        title: "使用次数已用完",
        description: "请升级套餐以继续使用",
        variant: "destructive"
      });
      return false;
    }

    // 如果剩余次数较少（1-3次），显示提醒但允许继续生成
    if (effectiveUsageRemaining <= 3 && effectiveUsageRemaining > 0 && maxUsage !== -1) {
      console.log('⚠️ 使用次数较少，显示提醒但允许生成');
      toast({
        title: "使用次数较少",
        description: `剩余${effectiveUsageRemaining}次使用机会，建议及时升级`,
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
        title: "无法开始生成",
        description: validationErrors[0],
        variant: "destructive"
      });
      return;
    }

    // 检查使用次数
    if (!checkUsageAndShowReminder()) {
      return;
    }

    // 扣减使用次数
    try {
      const { incrementUsage } = useAuthStore.getState();
      incrementUsage();
      console.log('✅ 使用次数已扣减，剩余:', Math.max(0, maxUsage - (usageCount + 1)));
    } catch (error) {
      console.error('❌ 扣减使用次数失败:', error);
    }

    const request = {
      originalContent: originalContent.trim(),
      formId: selectedFormId,
      style: selectedStyle,
      customPrompt: customPrompt.trim() || undefined,
      useBrandLibrary,
      brandProfile
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
      brandProfile
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
      brandProfile
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
        title: "无法启动自动化",
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
        title: "请先登录",
        description: "登录后才能收藏内容",
        variant: "destructive"
      });
      return;
    }

    if (!content || content.trim().length === 0) {
      toast({
        title: "无法收藏",
        description: "没有可收藏的内容",
        variant: "destructive"
      });
      return;
    }

    try {
      const favoriteKey = versionId ? `${platformId}-${versionId}` : platformId;

      // 检查是否已收藏
      if (persistentFavorites.has(favoriteKey)) {
        // 取消收藏
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
          title: "取消收藏",
          description: "已取消收藏该内容",
        });
      } else {
        // 添加收藏
        const favoriteItem = favoritesUtils.createFavoriteItem(
          'content-generation',
          `${getPlatformName(platformId)}内容 - ${versionId || '主版本'}`,
          content,
          '内容适配器',
          {
            description: `来自${getPlatformName(platformId)}的适配内容`,
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
        console.log('🔍 添加收藏:', { favoriteId, userId: user.id, platformId, versionId });

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
          title: "收藏成功 ❤️",
          description: "内容已添加到我的资料库 > 收藏夹",
        });
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      toast({
        title: "收藏失败",
        description: "收藏操作出现错误，请重试",
        variant: "destructive"
      });
    }
  };

  // 保存到历史记录 - 从原版AdaptPage完整迁移
  const saveToHistory = React.useCallback((results: any[]) => {
    console.log('🔍 保存历史记录:', { userId: user?.id, isAuthenticated, resultsCount: results.length });
    const result = historyDataManager.loadData<unknown[]>();
    let list: unknown[] = result.data || [];
    console.log('🔍 当前历史记录数量:', list.length);

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
    console.log('✅ 历史记录已保存，新数量:', list.length);
  }, [historyDataManager, user?.id, isAuthenticated]);

  // 加载转发历史
  const loadShareHistory = React.useCallback(() => {
    const history: ShareHistoryItem[] = JSON.parse(localStorage.getItem('shareHistory') || '[]');
    setShareHistory(history);
  }, []);

  // 清空转发历史
  const clearShareHistory = () => {
    localStorage.removeItem('shareHistory');
    setShareHistory([]);
    toast({
      title: '已清空',
      description: '转发历史已清空'
    });
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
            title: "内容已复制，正在跳转",
            description: `内容已复制到剪贴板，正在打开${getPlatformName(platformId, availablePlatforms)}官网`,
          });
        } else {
          toast({
            title: "内容已复制",
            description: `内容已复制到剪贴板，请手动前往${getPlatformName(platformId, availablePlatforms)}发布`,
          });
        }
      }).catch(() => {
        toast({
          title: "复制失败",
          description: "无法复制内容到剪贴板，请手动复制",
          variant: "destructive"
        });
      });
    } catch (error) {
      console.error('一键转发失败:', error);
      toast({
        title: "转发失败",
        description: "一键转发功能出现错误",
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
        title: "没有可转发的内容",
        description: "请先生成内容后再进行批量转发",
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
        const platform = platforms.find(p => p.id === pid);
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
        title: "没有有效的转发平台",
        description: "请检查平台配置",
        variant: "destructive"
      });
      return;
    }

    // 打开批量转发工作台
    setBatchForwardPlatforms(validPlatforms);
    setBatchForwardModalOpen(true);

    toast({
      title: "批量转发工作台已启动",
      description: `已为${validPlatforms.length}个平台准备好内容`,
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
        title: "启动自动化转发",
        description: `准备自动转发到 ${selectedPlatforms.length} 个平台`,
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
      await retryPlatform(platformId);
      toast({
        title: "重试成功",
        description: `${platformId} 平台内容已重新生成`,
      });
    } catch (error) {
      toast({
        title: "重试失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive"
      });
    }
  };


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
            <Button
              variant="soft"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>历史记录</span>
            </Button>
          </div>
        }
      />

      <div className="container mx-auto py-6 px-4">
        {/* 内容输入区域 */}
        <ContentInputSection
          originalContent={originalContent}
          onContentChange={setOriginalContent}
          usageRemaining={effectiveUsageRemaining}
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
            getPlatformName={getPlatformName}
            getEffectiveCharCount={(platformId) => getEffectiveSettings(platformId).charCount}
            t={t}
          />
        ) : generating && (
          <div className="rounded-lg border-2 border-dashed border-border bg-accent">
            <div className="p-6">
              <AIContentGenerationAnimation
                platforms={selectedPlatforms}
                message="多平台内容适配引擎运行中..."
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
                  hasContent: !!result.content || (result.versions && result.versions.length > 0),
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

      {/* 历史记录弹窗 - 从原版完整迁移 */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>内容生成记录</DialogTitle>
            <DialogDescription>
              查看您之前生成的内容适配记录
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-foreground max-h-[60vh] overflow-auto">
            {shareHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">暂无生成记录</div>
            ) : (
              <div className="space-y-6">
                {/* 按日期分组显示 */}
                {Object.entries(
                  shareHistory.reduce((groups: Record<string, any[]>, item) => {
                    const date = new Date(item.time).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    if (!groups[date]) groups[date] = [];
                    groups[date].push(item);
                    return groups;
                  }, {})
                ).map(([date, items]) => (
                  <div key={date}>
                    <h3 className="text-sm font-semibold text-primary mb-3 border-b pb-1">
                      {date}
                    </h3>
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="bg-accent/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {item.platformName || item.platformId}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.time).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(item.content);
                                toast({
                                  title: "已复制",
                                  description: "内容已复制到剪贴板"
                                });
                              }}
                              className="h-6 px-2"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-foreground line-clamp-3">
                            {item.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={clearShareHistory}
              disabled={shareHistory.length === 0}
            >
              清空历史
            </Button>
            <Button variant="default" onClick={() => setShowHistory(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 一键转发确认Dialog - 从原版完整迁移 */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>一键转发确认</DialogTitle>
            <DialogDescription>
              确认转发内容到选择的平台
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-foreground">
            <p className="mb-3">
              内容将被复制到剪贴板，然后跳转到{pendingPublish ? getPlatformName(pendingPublish.platformId, availablePlatforms) : ''}平台发布页面。
            </p>
            <div className="bg-accent rounded p-3 mt-2 text-sm break-all max-h-32 overflow-auto border">
              {pendingPublish?.content}
            </div>
            <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
              💡 提示：跳转后请登录对应平台，然后粘贴内容并发布
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
              取消
            </Button>
            <Button variant="default" onClick={confirmPublish}>
              跳转并发布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContentAdapterPage;
