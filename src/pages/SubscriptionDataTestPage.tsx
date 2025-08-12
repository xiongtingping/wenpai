/**
 * 订阅数据测试页面
 * @description 验证不同付费版本的Token量、使用次数等数据配置是否正确
 * @author 权限系统团队
 * @created 2025-08-12
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Crown, Zap, Star, CheckCircle, XCircle } from 'lucide-react';
import { getAllSubscriptionPlans } from '@/config/subscriptionPlans';
import { subscriptionDataService } from '@/services/subscriptionDataService';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import PageNavigation from '@/components/layout/PageNavigation';

export default function SubscriptionDataTestPage() {
  const { user } = useUnifiedAuth();
  const allPlans = getAllSubscriptionPlans();

  // 模拟不同等级的用户数据
  const mockUsers = {
    trial: { id: 'trial_user', vipLevel: null, isVip: false, permissions: [] },
    pro: { id: 'pro_user', vipLevel: 'pro', isVip: true, permissions: ['tier:pro'] },
    premium: { id: 'premium_user', vipLevel: 'premium', isVip: true, permissions: ['tier:premium'] }
  };

  const formatNumber = (num: number): string => {
    if (num === -1) return '不限制';
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'trial': return <Star className="h-5 w-5 text-gray-500" />;
      case 'pro': return <Zap className="h-5 w-5 text-blue-500" />;
      case 'premium': return <Crown className="h-5 w-5 text-purple-500" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'trial': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <PageNavigation 
        title="订阅数据测试"
        description="验证不同付费版本的Token量、使用次数等数据配置"
      />

      {/* 当前用户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>当前用户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">用户ID</div>
              <div className="font-medium">{user?.id || '未登录'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">检测到的等级</div>
              <Badge className={getTierColor(subscriptionDataService.getUserTier(user))}>
                {subscriptionDataService.mapTierToAccountType(subscriptionDataService.getUserTier(user))}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">VIP等级</div>
              <div className="font-medium">{user?.vipLevel || 'null'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">权限数量</div>
              <div className="font-medium">{user?.permissions?.length || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订阅计划配置验证 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">订阅计划配置验证</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allPlans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTierIcon(plan.tier)}
                  {plan.name}
                  {plan.recommended && (
                    <Badge variant="secondary" className="text-xs">推荐</Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 价格信息 */}
                <div className="space-y-2">
                  <h4 className="font-medium">价格配置</h4>
                  <div className="text-sm space-y-1">
                    <div>月付: ¥{plan.monthly.discountPrice}/月</div>
                    <div>年付: ¥{plan.yearly.discountPrice}/年</div>
                    {plan.monthly.discountPercentage > 0 && (
                      <div className="text-green-600">
                        优惠: {plan.monthly.discountPercentage}%
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 使用限制 */}
                <div className="space-y-2">
                  <h4 className="font-medium">使用限制</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>适配次数:</span>
                      <span className="font-medium">
                        {formatNumber(plan.limits.adaptUsageLimit)}/月
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token额度:</span>
                      <span className="font-medium">
                        {formatNumber(plan.limits.tokenLimit)}/月
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 可用模型 */}
                <div className="space-y-2">
                  <h4 className="font-medium">可用模型</h4>
                  <div className="flex flex-wrap gap-1">
                    {plan.limits.availableModels.map((model) => (
                      <Badge key={model} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 可用功能 */}
                <div className="space-y-2">
                  <h4 className="font-medium">可用功能</h4>
                  <div className="space-y-1">
                    {plan.limits.availableFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 用户数据生成测试 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">用户数据生成测试</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(mockUsers).map(([tier, mockUser]) => {
            const userStats = subscriptionDataService.generateUserStats(mockUser);
            const tierInfo = subscriptionDataService.getTierDisplayInfo(tier as any);
            
            return (
              <Card key={tier}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTierIcon(tier)}
                    {tierInfo.name} 用户数据
                  </CardTitle>
                  <CardDescription>模拟 {tierInfo.name} 用户的数据生成</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 基础信息 */}
                  <div className="space-y-2">
                    <h4 className="font-medium">基础信息</h4>
                    <div className="text-sm space-y-1">
                      <div>用户ID: {userStats.userId}</div>
                      <div>账户类型: {userStats.accountType}</div>
                      <div>注册日期: {userStats.registrationDate}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* 使用统计 */}
                  <div className="space-y-2">
                    <h4 className="font-medium">使用统计</h4>
                    <div className="space-y-3">
                      {/* 适配次数 */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>适配次数</span>
                          <span>
                            {subscriptionDataService.formatUsageDisplay(
                              userStats.usedCount, 
                              userStats.availableUses
                            )}
                          </span>
                        </div>
                        <Progress 
                          value={subscriptionDataService.calculateUsagePercentage(
                            userStats.usedCount, 
                            userStats.availableUses
                          )} 
                          className="h-2"
                        />
                      </div>

                      {/* Token使用 */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Token使用</span>
                          <span>
                            {subscriptionDataService.formatTokenDisplay(
                              userStats.usedTokens, 
                              userStats.tokenLimit
                            )}
                          </span>
                        </div>
                        <Progress 
                          value={subscriptionDataService.calculateUsagePercentage(
                            userStats.usedTokens, 
                            userStats.tokenLimit
                          )} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 数据验证 */}
                  <div className="space-y-2">
                    <h4 className="font-medium">数据验证</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {userStats.availableUses === tierInfo.limits.adaptUsageLimit ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>适配次数限制匹配</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {userStats.tokenLimit === tierInfo.limits.tokenLimit ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Token限制匹配</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {userStats.accountType === tierInfo.name ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>账户类型匹配</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 数据一致性检查 */}
      <Card>
        <CardHeader>
          <CardTitle>数据一致性检查结果</CardTitle>
          <CardDescription>检查所有组件使用的数据是否一致</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allPlans.map((plan) => {
              const mockUser = mockUsers[plan.tier as keyof typeof mockUsers];
              const userStats = subscriptionDataService.generateUserStats(mockUser);
              const tierInfo = subscriptionDataService.getTierDisplayInfo(plan.tier as any);
              
              const isConsistent = 
                userStats.availableUses === plan.limits.adaptUsageLimit &&
                userStats.tokenLimit === plan.limits.tokenLimit &&
                userStats.accountType === plan.name;

              return (
                <div key={plan.tier} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTierIcon(plan.tier)}
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">
                        适配: {formatNumber(plan.limits.adaptUsageLimit)}/月 | 
                        Token: {formatNumber(plan.limits.tokenLimit)}/月
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConsistent ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-600 font-medium">数据一致</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-600 font-medium">数据不一致</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
