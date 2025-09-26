/**
 * 主题感知的升级说明卡片组件
 * 根据当前主题和所需版本自动调整视觉风格
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, ArrowRight, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';

interface ThemeAwareUpgradeCardProps {
  /** 所需版本等级 */
  requiredTier: 'pro' | 'premium';
  /** 功能区域名称 */
  featureName: string;
  /** 功能描述 */
  description?: string;
  /** 卡片大小 */
  size?: 'compact' | 'normal' | 'large';
  /** 是否显示动画效果 */
  animated?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 主题感知升级卡片组件
 */
export const ThemeAwareUpgradeCard: React.FC<any> = ({ requiredTier,
  featureName,
  description,
  size = 'normal',
  animated = true,
  className = '' }) => { const navigate = useNavigate();
  const { toast  } = useToast();
  const plan = getSubscriptionPlan(requiredTier);

  // 处理升级点击
  const handleUpgradeClick = () => {
    toast({
      title: `升级到${plan.name}`,
      description: `解锁${featureName}的全部功能，立即体验专业级内容创作`,
      action: (
        <ToastAction
          altText="升级"
          onClick={() => {
            localStorage.setItem("selectedPlan", requiredTier);
            navigate('/payment-center');
          }}
        >
          立即升级
        </ToastAction>
      )
    });
  };

  // 根据版本获取主题配置
  const getThemeConfig = () => {
    if (requiredTier === 'premium') {
      return {
        icon: Crown,
        primaryColor: 'from-purple-500 to-pink-500',
        secondaryColor: 'from-purple-100 to-pink-100',
        textColor: 'text-purple-700 dark:text-purple-300',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        buttonColor: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
        borderColor: 'border-purple-200 dark:border-purple-800',
        glowColor: 'shadow-purple-500/20',
        accentIcon: Star
      };
    } else {
      return {
        icon: Zap,
        primaryColor: 'from-blue-500 to-cyan-500',
        secondaryColor: 'from-blue-100 to-cyan-100',
        textColor: 'text-blue-700 dark:text-blue-300',
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        buttonColor: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
        borderColor: 'border-blue-200 dark:border-blue-800',
        glowColor: 'shadow-blue-500/20',
        accentIcon: Sparkles
      };
    }
  };

  const theme = getThemeConfig();
  const IconComponent = theme.icon;
  const AccentIcon = theme.accentIcon;

  // 根据大小调整样式
  const getSizeClasses = () => {
    switch (size) {
      case 'compact':
        return {
          card: 'p-4',
          title: 'text-sm font-semibold',
          description: 'text-xs',
          button: 'text-xs px-3 py-1.5',
          icon: 'h-4 w-4'
        };
      case 'large':
        return {
          card: 'p-8',
          title: 'text-xl font-bold',
          description: 'text-base',
          button: 'text-base px-6 py-3',
          icon: 'h-8 w-8'
        };
      default:
        return {
          card: 'p-6',
          title: 'text-lg font-semibold',
          description: 'text-sm',
          button: 'text-sm px-4 py-2',
          icon: 'h-6 w-6'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <Card 
      className={`
        ${className} 
        ${theme.borderColor} 
        ${theme.glowColor}
        ${animated ? 'transition-all duration-300 hover:shadow-lg hover:scale-105' : ''}
        relative overflow-hidden group
      `}
    >
      {/* 背景渐变装饰 */}
      <div 
        className={`
          absolute inset-0 opacity-5 bg-gradient-to-br ${theme.primaryColor}
          ${animated ? 'group-hover:opacity-10 transition-opacity duration-300' : ''}
        `} 
      />
      
      {/* 装饰性图标 */}
      <div className="absolute top-2 right-2 opacity-10">
        <AccentIcon className="h-8 w-8" />
      </div>

      <CardHeader className={`${sizeClasses.card} pb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-gradient-to-br ${theme.secondaryColor}`}>
              <IconComponent className={`${sizeClasses.icon} ${theme.textColor}`} />
            </div>
            <div>
              <CardTitle className={`${sizeClasses.title} ${theme.textColor}`}>
                {featureName}
              </CardTitle>
              <Badge variant="outline" className={`${theme.badgeColor} text-xs font-medium mt-1`}>
                {plan.name}专属
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-6 pb-6">
        <p className={`${sizeClasses.description} text-muted-foreground mb-4 leading-relaxed`}>
          {description || `该功能区为${plan.name}专属，解锁后可享受完整的专业级功能体验。`}
        </p>

        <Button
          onClick={handleUpgradeClick}
          className={`
            ${sizeClasses.button} 
            ${theme.buttonColor} 
            text-background font-medium w-full
            ${animated ? 'transform transition-all duration-200 hover:scale-105' : ''}
            shadow-lg
          `}
        >
          <IconComponent className="h-4 w-4 mr-2" />
          升级到{plan.name}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* 价格信息 */}
        <div className="mt-3 text-center">
          <span className="text-xs text-muted-foreground">
            {plan.monthly?.discountPrice ?? plan.yearly?.discountPrice ?? ''} • 随时可取消
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 紧凑版升级提示组件
 */
export const CompactUpgradePrompt: React.FC<Omit<ThemeAwareUpgradeCardProps, 'size'>> = (props) => {
  return <ThemeAwareUpgradeCard {...props} size="compact" />;
};

/**
 * 大尺寸升级提示组件
 */
export const LargeUpgradePrompt: React.FC<Omit<ThemeAwareUpgradeCardProps, 'size'>> = (props) => {
  return <ThemeAwareUpgradeCard {...props} size="large" />;
};

export default ThemeAwareUpgradeCard;
