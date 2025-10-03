/**
 * Token使用量统计组件
 * @description 在个人资料页面显示详细的Token使用统计信息，集成使用次数统计和扩展功能
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Zap, 
  Crown,
  RefreshCw,
  Info,
  Timer,
  FileText,
  Target,
  Database
} from 'lucide-react';
import { useUnifiedUsageStats } from '@/hooks/useUnifiedUsageStats';
import { 
  formatRemainingUses, 
  formatUsageDisplay,
  shouldShowProgressBar,
  getUsageStatusColor,
  getProgressBarColor,
  formatTierName
} from '@/utils/usageDisplayUtils';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * Token使用量统计组件属性
 */
interface TokenUsageSectionProps {
  /** 用户套餐类型 */
  userTier?: SubscriptionTier;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否显示升级按钮 */
  showUpgradeButton?: boolean;
  /** 外部用户统计数据 */
  externalUserStats?: {
    availableUses: number;
    usedCount: number;
    tokenLimit: number;
    usedTokens: number;
  };
}

/**
 * 格式化数字显示
 */
function formatNumber(num: number): string { if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
   } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

/**
 * 信息提示组件
 */
function InfoTooltip({ title, content }: { title: string; content: string[] }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="bg-muted" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'help',
            transition: 'all 0.2s'
          }}>
            <span className="text-muted-foreground" style={{fontSize: '12px', fontWeight: 'bold'}}>ℹ️</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-popover border-border" style={{maxWidth: '300px', borderRadius: '8px', padding: '12px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <div className="text-foreground" style={{fontWeight: '600', fontSize: '14px'}}>{title}</div>
            <ul style={{fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0, padding: 0, listStyle: 'none'}}>
              {content.map((item, index) => (
                <li key={index} style={{display: 'flex', alignItems: 'flex-start', gap: '4px'}}>
                  <span className="text-primary" style={{marginTop: '2px', fontSize: '12px'}}>•</span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Token使用量统计组件
 */
export function TokenUsageSection({
  userTier = 'trial',
  showDetails = true,
  showUpgradeButton = true,
  className = '',
  externalUserStats
}: TokenUsageSectionProps) {
  const { t } = useTranslation(); // 🔧 FIX: 添加国际化函数初始化

  const {
    tokenStats,
    usageCountStats,
    extendedStats,
    loading,
    error,
    refreshStats
  } = useUnifiedUsageStats(userTier);

  // 如果有外部数据，使用外部数据覆盖
  const finalUsageCountStats = externalUserStats ? {
    usedCount: externalUserStats.usedCount,
    availableUses: externalUserStats.availableUses,
    remainingUses: externalUserStats.availableUses === -1 ? -1 : externalUserStats.availableUses - externalUserStats.usedCount,
    usagePercentage: externalUserStats.availableUses === -1 ? 0 : (externalUserStats.usedCount / externalUserStats.availableUses) * 100
  } : usageCountStats;

  const finalTokenStats = externalUserStats ? {
    monthlyUsed: externalUserStats.usedTokens,
    monthlyLimit: externalUserStats.tokenLimit,
    monthlyRemaining: externalUserStats.tokenLimit === -1 ? -1 : externalUserStats.tokenLimit - externalUserStats.usedTokens,
    usagePercentage: externalUserStats.tokenLimit === -1 ? 0 : (externalUserStats.usedTokens / externalUserStats.tokenLimit) * 100
  } : tokenStats;


  const [isRefreshing, setIsRefreshing] = useState(false);

  // 获取套餐名称
  const getPlanName = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'trial': return '体验版';
      case 'pro': return '专业版';
      case 'premium': return '高级版';
      default: return '体验版';
    }
  };

  const planName = getPlanName(userTier);

  // 手动刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshStats();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 处理升级操作
  // ✅ FIXED: 恢复按钮，修复于 2025-08-10
  // 
  const handleUpgrade = () => {
    window.location.href = '/payment';
  };

  return (
    <div className={`${className} bg-card border-border`} style={{
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      visibility: 'visible',
      opacity: 1
    }}>
      <div style={{marginBottom: '0.75rem'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'hsl(var(--primary) / 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-foreground" style={{fontSize: '1.125rem', fontWeight: '600', lineHeight: '1.5'}}>使用统计</div>
              <div className="text-muted-foreground" style={{fontSize: '0.8125rem', fontWeight: 'normal', lineHeight: '1.3'}}>{planName} - 查看您的使用情况</div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="ghost"
            className="shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && !finalTokenStats ? (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0'}}>
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="text-foreground" style={{marginLeft: '12px', fontSize: '18px', fontWeight: '500'}}>加载中...</span>
        </div>
      ) : (
        <>
          {/* 改为垂直布局：Token使用量和使用次数上下排列 */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {/* Token使用量统计卡片 */}
                <div className="bg-muted border-border" style={{
                  minWidth: '280px',
                  position: 'relative',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem', position: 'relative', zIndex: 10}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'hsl(var(--primary))',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}>
                        <Zap className="w-4 h-4 text-primary-foreground" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'}} />
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0}}>
                        <h3 className="text-foreground" style={{fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap'}}>Token使用量</h3>
                        <InfoTooltip
                          title="Token统计说明"
                          content={[
                            "统计范围：包含所有AI功能模块的输入+输出token",
                            "计算方式：中文字符按1.5个token，英文单词按1个token计算",
                            "重置周期：每月1日自动重置使用量"
                          ]}
                        />
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: finalTokenStats && finalTokenStats.monthlyLimit === -1
                        ? 'hsl(var(--primary))'
                        : finalTokenStats && finalTokenStats.usagePercentage > 80
                        ? 'hsl(var(--destructive))'
                        : finalTokenStats && finalTokenStats.usagePercentage > 60
                        ? 'hsl(var(--warning))'
                        : 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))'
                    }}>
                      {finalTokenStats?.monthlyLimit === -1 ? '无限制' : `${Math.round(finalTokenStats?.usagePercentage || 0)}%`}
                    </span>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 10}}>
                    {finalTokenStats?.monthlyLimit === -1 ? (
                      <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="text-xl font-bold text-primary mb-1">∞</div>
                        <div className="text-xs font-medium text-muted-foreground">无限制Token</div>
                      </div>
                    ) : (
                      <>
                        <div className="w-full h-2.5 bg-muted rounded-md overflow-hidden relative">
                          <div className="h-full bg-primary rounded-md transition-all duration-300 ease-out" style={{
                            width: `${Math.min(finalTokenStats?.usagePercentage || 0, 100)}%`
                          }} />
                        </div>
                        <div className="text-muted-foreground" style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: '500'}}>
                          <span>已使用 {formatNumber(finalTokenStats?.monthlyUsed || 0)} tokens</span>
                          <span>剩余 {formatNumber(finalTokenStats?.monthlyRemaining || 0)} tokens</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Token继承说明 - 单行显示 */}
                  <div className="bg-background border-border" style={{
                    marginTop: '8px',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%'
                  }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{fontSize: '11px', color: 'hsl(var(--primary-foreground))'}}>ℹ️</span>
                    </div>
                    <div className="text-foreground" style={{
                      fontSize: '13px',
                      lineHeight: '1.4',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      <span style={{fontWeight: '600'}}>重要说明：</span>
                      <span>tokens在会员有效期内可以继承到下个月续用，不会清零浪费。</span>
                    </div>
                  </div>
                </div>

                {/* 使用次数统计卡片 */}
                <div className="bg-muted border-border" style={{
                  minWidth: '280px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem', position: 'relative', zIndex: 10}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'hsl(var(--primary))',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}>
                        <Target className="w-4 h-4 text-primary-foreground" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'}} />
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0}}>
                        <h3 className="text-foreground" style={{fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap'}}>使用次数</h3>
                        <InfoTooltip
                          title="使用次数说明"
                          content={[
                            "统计规则：主要计算AI内容适配的调用次数",
                            "计量单位：每次调用AI内容适配计为1次使用",
                            "重置周期：每月1日自动重置使用次数",
                            "与Token的区别：使用次数按功能计量，Token按文字量计量"
                          ]}
                        />
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: finalUsageCountStats && finalUsageCountStats.availableUses === -1
                        ? 'hsl(var(--primary))'
                        : finalUsageCountStats && finalUsageCountStats.usagePercentage > 80
                        ? 'hsl(var(--destructive))'
                        : finalUsageCountStats && finalUsageCountStats.usagePercentage > 60
                        ? 'hsl(var(--warning))'
                        : 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))'
                    }}>
                      {(finalUsageCountStats && finalUsageCountStats.availableUses === -1) ? '无限制' :
                       `${finalUsageCountStats?.usedCount || 0}/${finalUsageCountStats?.availableUses || 0}`}
                    </span>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', zIndex: 10}}>
                    {finalUsageCountStats && finalUsageCountStats.availableUses !== -1 ? (
                      <>
                        <div className="w-full h-2.5 bg-muted rounded-md overflow-hidden relative">
                          <div className="h-full bg-primary rounded-md transition-all duration-300 ease-out" style={{
                            width: `${Math.min(finalUsageCountStats?.usagePercentage || 0, 100)}%`
                          }} />
                        </div>
                        <div className="text-muted-foreground" style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: '500'}}>
                          <span>已使用 {finalUsageCountStats?.usedCount || 0} 次</span>
                          <span>剩余 {formatRemainingUses(finalUsageCountStats?.remainingUses ?? 0, userTier)} 次</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="text-xl font-bold text-primary mb-1">∞</div>
                        <div className="text-xs font-medium text-muted-foreground">无限制使用</div>
                      </div>
                    )}
                  </div>
                </div>
          </div>

          {/* 升级按钮 - 仅在非高级版时显示 */}
          {/* ✅ FIXED: 恢复按钮，修复于 2025-08-10 */}
          {/* 升级按钮已注释
          {userTier !== 'premium' && showUpgradeButton && (
            <div className="mt-4">
              <Button
                onClick={handleUpgrade}
                className="w-full h-12 text-base font-bold rounded-xl btn-upgrade-force"
                size="lg"
              >
                <Crown className="w-5 h-5 text-background" />
                立即解锁高级功能
              </Button>
            </div>
          )}
          */}

        </>
      )}
    </div>
  );
}

export default TokenUsageSection;
