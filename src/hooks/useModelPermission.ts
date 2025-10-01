/**
 * 统一的AI模型权限检查Hook
 * @description 提供模型权限检查、升级提示等功能
 */

import { useMemo, useCallback } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  hasModelPermission,
  getModelPermissionInfo,
  getUpgradeRecommendation,
  hasModelTierPermission,
  getUserTier
} from '@/utils/modelPermissions';
import { getModelInfo, getAvailableModelsForTier } from '@/config/aiModels';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 模型权限检查结果
 */
export interface ModelPermissionResult {
  // 权限状态
  hasPermission: boolean;
  isLoading: boolean;

  // 用户信息
  currentTier: SubscriptionTier;
  isAuthenticated: boolean;

  // 模型信息
  modelInfo: ReturnType<typeof getModelInfo>;
  requiredTier?: SubscriptionTier;
  needsUpgrade: boolean;

  // 操作方法
  checkModel: (modelId: string) => boolean;
  requestUpgrade: (modelId: string) => void;
  getAvailableModels: () => ReturnType<typeof getAvailableModelsForTier>;
}

/**
 * 使用AI模型权限检查Hook
 * @param modelId 可选的模型ID,如果提供则自动检查该模型的权限
 * @returns 权限检查结果和操作方法
 */
export function useModelPermission(modelId?: string): ModelPermissionResult {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 获取订阅层级权限
  const trialPermission = usePermission('tier:trial');
  const proPermission = usePermission('tier:pro');
  const premiumPermission = usePermission('tier:premium');

  // 判断权限系统是否加载完成
  const isLoading = trialPermission.isLoading || proPermission.isLoading || premiumPermission.isLoading;

  // 获取当前用户订阅层级
  const currentTier = useMemo((): SubscriptionTier => {
    if (isLoading) return 'trial'; // 加载中默认返回trial
    if (premiumPermission.pass) return 'premium';
    if (proPermission.pass) return 'pro';
    return 'trial';
  }, [isLoading, premiumPermission.pass, proPermission.pass]);

  // 获取模型信息
  const modelInfo = useMemo(() => {
    if (!modelId) return undefined;
    return getModelInfo(modelId);
  }, [modelId]);

  // 获取权限信息
  const permissionInfo = useMemo(() => {
    if (!modelId) return null;
    return getModelPermissionInfo(modelId);
  }, [modelId]);

  // 检查是否有权限
  const hasPermission = useMemo(() => {
    if (!modelId) return true; // 未指定模型ID,默认有权限
    if (isLoading) return false; // 加载中默认无权限
    return hasModelPermission(modelId);
  }, [modelId, isLoading]);

  // 检查指定模型的权限
  const checkModel = useCallback((checkModelId: string): boolean => {
    if (isLoading) return false;
    return hasModelPermission(checkModelId);
  }, [isLoading]);

  // 请求升级(显示升级提示)
  const requestUpgrade = useCallback((upgradeModelId: string) => {
    const recommendation = getUpgradeRecommendation(upgradeModelId);
    const model = getModelInfo(upgradeModelId);

    if (!recommendation || !model) {
      toast({
        title: '❌ 模型不存在',
        description: '无法找到该模型信息',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    const tierNames = {
      'trial': '体验版',
      'pro': '专业版',
      'premium': '高级版'
    };

    toast({
      title: `🔒 需要 ${tierNames[recommendation.to]} 权限`,
      description: `${model.name} 需要 ${tierNames[recommendation.to]} 订阅才能使用。点击右侧按钮立即升级。`,
      duration: 6000,
    });

    // 延迟导航,确保用户看到提示
    setTimeout(() => {
      navigate('/payment-center');
    }, 1500);
  }, [navigate, toast]);

  // 获取当前用户可用的所有模型
  const getAvailableModels = useCallback(() => {
    return getAvailableModelsForTier(currentTier);
  }, [currentTier]);

  return {
    // 权限状态
    hasPermission,
    isLoading,

    // 用户信息
    currentTier,
    isAuthenticated,

    // 模型信息
    modelInfo,
    requiredTier: permissionInfo?.requiredTier,
    needsUpgrade: permissionInfo?.needsUpgrade || false,

    // 操作方法
    checkModel,
    requestUpgrade,
    getAvailableModels,
  };
}

/**
 * 使用模型等级权限检查Hook
 * @param tier 模型等级 ('low' | 'mid' | 'high')
 * @returns 是否有该等级的权限
 */
export function useModelTierPermission(tier: 'low' | 'mid' | 'high') {
  const { isLoading, currentTier } = useModelPermission();

  const hasPermission = useMemo(() => {
    if (isLoading) return false;
    return hasModelTierPermission(tier);
  }, [tier, isLoading]);

  return {
    hasPermission,
    isLoading,
    currentTier,
  };
}

/**
 * 使用批量模型权限检查Hook
 * @param modelIds 模型ID列表
 * @returns 权限检查结果映射
 */
export function useBatchModelPermission(modelIds: string[]) {
  const { isLoading } = useModelPermission();

  const permissions = useMemo(() => {
    if (isLoading) {
      // 加载中,所有模型默认无权限
      return modelIds.reduce((acc, id) => {
        acc[id] = false;
        return acc;
      }, {} as Record<string, boolean>);
    }

    return modelIds.reduce((acc, id) => {
      acc[id] = hasModelPermission(id);
      return acc;
    }, {} as Record<string, boolean>);
  }, [modelIds, isLoading]);

  return {
    permissions,
    isLoading,
  };
}
