/**
 * 支付模态框组件
 * 提供锁定式支付体验，防止用户误操作导致支付失败
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UnifiedDialog } from '@/components/ui/UnifiedDialog/UnifiedDialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  QrCode, 
  Smartphone, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentModalProps, PaymentModalState, PaymentStatusMessage } from '@/types/payment-modal';
import { PaymentProgressIndicator } from './PaymentProgressIndicator';
import { AlipayLogo, AlipayBanner } from './AlipayLogo';
import { BufPayService } from '@/services/bufpayService';
import { toast } from 'sonner';
import { useUnifiedStore } from '@/stores/unified-state-store';
import { getUserTier } from '@/utils/subscriptionUtils';
import supabase from '@/config/supabase';

/**
 * 状态消息配置
 */
const statusMessages: Record<PaymentModalState, PaymentStatusMessage> = {
  waiting_scan: {
    title: '请使用支付宝扫码支付',
    description: '支付验证中，请勿离开此页面',
    icon: 'QrCode',
    showLoading: false
  },
  scanning: {
    title: '检测到扫码',
    description: '请在手机上完成支付',
    icon: 'Smartphone',
    showLoading: true
  },
  verifying: {
    title: '正在确认支付结果',
    description: '请稍候，验证中...',
    icon: 'Loader2',
    showLoading: true
  },
  success: {
    title: '支付成功！',
    description: '即将跳转...',
    icon: 'CheckCircle',
    showLoading: false
  },
  failed: {
    title: '支付失败',
    description: '请重试或联系客服',
    icon: 'XCircle',
    showLoading: false
  },
  timeout: {
    title: '二维码已过期',
    description: '请刷新后重新支付',
    icon: 'Clock',
    showLoading: false
  },
  cancelled: {
    title: '已取消支付',
    description: '您可以随时返回继续支付',
    icon: 'AlertCircle',
    showLoading: false
  }
};

/**
 * 获取状态图标组件
 */
const getStatusIcon = (state: PaymentModalState, className?: string) => {
  const iconProps = { className: cn('w-6 h-6', className) };
  
  switch (state) {
    case 'waiting_scan':
      return <QrCode {...iconProps} />;
    case 'scanning':
      return <Smartphone {...iconProps} />;
    case 'verifying':
      return <Loader2 {...iconProps} className={cn(iconProps.className, 'animate-spin')} />;
    case 'success':
      return <CheckCircle {...iconProps} className={cn(iconProps.className, 'text-green-500')} />;
    case 'failed':
      return <XCircle {...iconProps} className={cn(iconProps.className, 'text-red-500')} />;
    case 'timeout':
      return <Clock {...iconProps} className={cn(iconProps.className, 'text-orange-500')} />;
    case 'cancelled':
      return <AlertCircle {...iconProps} className={cn(iconProps.className, 'text-gray-500')} />;
    default:
      return <QrCode {...iconProps} />;
  }
};

/**
 * 格式化倒计时
 */
const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 支付模态框组件
 */
export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  paymentData,
  onPaymentSuccess,
  onPaymentFailed,
  onPaymentTimeout,
  onCancel
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 🎯 获取Store方法用于刷新用户订阅和使用统计
  const updateUserSubscription = useUnifiedStore(state => state.updateUserSubscription);
  const initializeUsageStats = useUnifiedStore(state => state.initializeUsageStats);
  const userId = useUnifiedStore(state => state.user.id);
  
  // 状态管理
  const [currentState, setCurrentState] = useState<PaymentModalState>(paymentData.state);
  const [timeLeft, setTimeLeft] = useState(paymentData.timeLeft);
  const [retryCount, setRetryCount] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Refs
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 最大重试次数
  const MAX_RETRIES = 10;

  /**
   * 🎯 刷新用户订阅和使用统计
   */
  const refreshUserSubscriptionAndStats = async () => {
    try {
      console.log('🔄 支付成功，刷新用户订阅和使用统计...');

      if (!userId) {
        console.warn('⚠️ 用户ID不存在，跳过刷新');
        return;
      }

      // 1. 从数据库重新查询用户订阅
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ 查询订阅失败:', error);
        return;
      }

      if (subscription && subscription.tier) {
        console.log('✅ 查询到新订阅等级:', subscription.tier);

        // 2. 更新Store中的订阅等级
        updateUserSubscription(subscription.tier);

        // 3. 重新初始化使用统计（会自动重置使用次数和Token限额）
        await initializeUsageStats(userId, subscription.tier);

        console.log('✅ 订阅和使用统计刷新完成');
      } else {
        console.warn('⚠️ 未查询到订阅信息');
      }
    } catch (error) {
      console.error('❌ 刷新订阅和使用统计失败:', error);
    }
  };

  /**
   * 浏览器刷新/后退拦截
   */
  useEffect(() => {
    if (!open) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentState === 'verifying' || currentState === 'waiting_scan' || currentState === 'scanning') {
        e.preventDefault();
        e.returnValue = '支付验证中，确定要离开吗？';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [open, currentState]);
  
  /**
   * 倒计时
   */
  useEffect(() => {
    if (!open || currentState === 'success' || currentState === 'cancelled') {
      return;
    }
    
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCurrentState('timeout');
          onPaymentTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [open, currentState, onPaymentTimeout]);
  
  /**
   * 支付状态轮询
   */
  useEffect(() => {
    if (!open || !paymentData.orderId || currentState === 'success' || currentState === 'cancelled' || currentState === 'timeout' || currentState === 'failed') {
      // 清理轮询
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const pollPaymentStatus = async () => {
      try {
        // 双重查询机制：
        // 1. 查询数据库订单状态（依赖webhook）
        // 2. 主动查询Bufpay接口（不依赖webhook，更可靠）

        console.log('🔍 开始轮询支付状态...', { orderId: paymentData.orderId, aoid: paymentData.aoid });

        // 方法1: 查询数据库订单状态
        const dbStatus = await BufPayService.checkOrderStatus(paymentData.orderId);
        console.log('📊 数据库订单状态:', dbStatus);

        // 方法2: 主动查询Bufpay接口（双保险）
        let bufpayStatus: string | null = null;
        if (paymentData.aoid) {
          try {
            bufpayStatus = await BufPayService.queryBufPayStatus(paymentData.aoid);
            console.log('💳 Bufpay接口状态:', bufpayStatus);
          } catch (bufpayError) {
            console.warn('⚠️ Bufpay查询失败，继续使用数据库状态:', bufpayError);
          }
        }

        // 判断支付是否成功
        const isPaidInDB = dbStatus.isPaid;
        const isPaidInBufpay = bufpayStatus === 'payed' || bufpayStatus === 'success';

        console.log('🔎 支付状态判断:', {
          isPaidInDB,
          isPaidInBufpay,
          dbOrderStatus: dbStatus.order?.status,
          bufpayStatus
        });

        // 如果Bufpay显示已支付，但数据库未更新，触发手动处理
        if (isPaidInBufpay && !isPaidInDB) {
          console.log('⚠️ 检测到支付成功但订单未更新，触发手动处理...');

          try {
            // 调用手动处理接口
            const repairResponse = await fetch('/.netlify/functions/repair-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: paymentData.orderId,
                aoid: paymentData.aoid
              })
            });

            if (repairResponse.ok) {
              const repairResult = await repairResponse.json();
              console.log('✅ 订单手动处理成功:', repairResult);

              // 重新查询订单状态
              const updatedStatus = await BufPayService.checkOrderStatus(paymentData.orderId);
              if (updatedStatus.isPaid) {
                setCurrentState('success');
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                  pollingIntervalRef.current = null;
                }

                // 🎯 刷新用户订阅和使用统计
                await refreshUserSubscriptionAndStats();

                setTimeout(() => {
                  onPaymentSuccess();
                  toast.success('支付成功！', { description: '您的订阅已激活' });
                  navigate('/');
                }, 1500);
                return;
              }
            } else {
              console.error('❌ 订单手动处理失败:', await repairResponse.text());
            }
          } catch (repairError) {
            console.error('❌ 调用手动处理接口失败:', repairError);
          }
        }

        // 正常流程：数据库已更新
        if (isPaidInDB) {
          setCurrentState('success');

          // 清理轮询
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // 🎯 刷新用户订阅和使用统计
          await refreshUserSubscriptionAndStats();

          // 延迟1.5秒后执行成功回调和跳转
          setTimeout(() => {
            onPaymentSuccess();
            toast.success('支付成功！', {
              description: '您的订阅已激活'
            });
            navigate('/');
          }, 1500);
        } else if (dbStatus.order?.status === 'failed') {
          setCurrentState('failed');

          // 清理轮询
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          onPaymentFailed?.('支付失败');
        }

        // 重置重试计数
        setRetryCount(0);
      } catch (error: any) {
        console.error('轮询支付状态失败:', error);

        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);

        if (newRetryCount >= MAX_RETRIES) {
          setCurrentState('failed');

          // 清理轮询
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          onPaymentFailed?.('网络异常，请联系客服确认支付状态');
        }
      }
    };

    // 立即执行一次
    pollPaymentStatus();

    // 设置轮询间隔 (3秒)
    pollingIntervalRef.current = setInterval(pollPaymentStatus, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [open, paymentData.orderId, currentState, retryCount, onPaymentSuccess, onPaymentFailed, navigate]);
  
  /**
   * 保存支付状态到localStorage
   */
  useEffect(() => {
    if (open && paymentData.orderId) {
      localStorage.setItem('pending_payment', JSON.stringify({
        orderId: paymentData.orderId,
        timestamp: Date.now()
      }));
    }
    
    return () => {
      if (currentState === 'success' || currentState === 'cancelled') {
        localStorage.removeItem('pending_payment');
      }
    };
  }, [open, paymentData.orderId, currentState]);
  
  /**
   * 处理取消支付
   */
  const handleCancel = () => {
    setShowCancelConfirm(true);
  };
  
  /**
   * 确认取消支付
   */
  const confirmCancel = () => {
    console.log('🔴 确认取消支付');

    // 立即清理所有定时器
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('✅ 清理轮询定时器');
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      console.log('✅ 清理倒计时定时器');
    }

    // 关闭二次确认对话框
    setShowCancelConfirm(false);

    // 执行取消回调
    if (onCancel) {
      console.log('📞 执行取消回调');
      onCancel();
    }

    // 立即关闭模态框（先关闭再更新状态，避免状态变化影响open属性）
    console.log('🚪 关闭模态框');
    onClose();

    // 延迟更新状态，确保模态框已完全关闭
    setTimeout(() => {
      setCurrentState('cancelled');
    }, 100);
  };
  
  /**
   * 获取当前进度步骤
   */
  const getCurrentStep = (): number => {
    switch (currentState) {
      case 'waiting_scan':
        return 1;
      case 'scanning':
        return 2;
      case 'verifying':
        return 3;
      case 'success':
        return 4;
      default:
        return 1;
    }
  };
  
  const statusMessage = statusMessages[currentState];
  const canClose = currentState === 'success' || currentState === 'cancelled';
  
  /**
   * 组件卸载时清理所有定时器和恢复页面滚动
   */
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      // 确保恢复页面滚动
      document.body.style.overflow = '';
      console.log('🔓 恢复页面滚动');
    };
  }, []);

  /**
   * 监听open状态变化，确保关闭时恢复滚动
   */
  useEffect(() => {
    if (!open) {
      // 模态框关闭时，确保恢复页面滚动
      document.body.style.overflow = '';
      console.log('🔓 模态框关闭，恢复页面滚动');
    }
  }, [open]);

  return (
    <>
      <UnifiedDialog
        open={open}
        onOpenChange={(isOpen) => {
          console.log('🔄 UnifiedDialog onOpenChange:', isOpen, 'canClose:', canClose, 'currentState:', currentState);

          if (!isOpen) {
            // 清理定时器
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }

            // 如果是可以关闭的状态，允许关闭
            if (canClose) {
              onClose();
            }
          }
        }}
        size="medium"
        variant="elevated"
        animation="scale"
        closeOnOverlayClick={canClose}
        closeOnEscape={canClose}
        aria-label="支付二维码"
      >
        <div className="flex flex-col max-h-[80vh] overflow-hidden">
          {/* 标题栏 - 固定不滚动 */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              {getStatusIcon(currentState, 'text-primary')}
              <h2 className="text-xl font-semibold text-foreground">
                {statusMessage.title}
              </h2>
            </div>
            {canClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 可滚动内容区域 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 内容区域开始 */}
          
          {/* 支付宝品牌横幅 + 支付金额 */}
          <div className="flex flex-col items-center gap-4">
            <AlipayBanner size="lg" />

            {/* 支付金额 - 突出显示 */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950 px-6 py-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <div className="text-base mb-2">
                请使用
                <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded font-bold text-white bg-blue-600 dark:bg-blue-500">
                  支付宝
                </span>
                扫码支付
              </div>
              <div className="flex items-baseline justify-center gap-2 mt-2">
                <span className="text-lg font-medium text-muted-foreground">支付金额</span>
                <span className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent animate-pulse">
                  ¥{paymentData.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 二维码区域 */}
          {(currentState === 'waiting_scan' || currentState === 'scanning' || currentState === 'verifying') && (
            <div className="flex flex-col items-center gap-4">
              {/* 二维码图片 */}
              <div className="relative">
                <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary/20">
                  {paymentData.qrImage ? (
                    <img
                      src={paymentData.qrImage}
                      alt="支付二维码"
                      className="w-64 h-64 object-contain"
                    />
                  ) : paymentData.qrCode ? (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-muted-foreground" />
                    </div>
                  ) : null}
                </div>

                {/* 支付宝Logo覆盖 */}
                <div className="absolute bottom-2 right-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-500">
                    <AlipayLogo size={24} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 成功状态 */}
          {currentState === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-2">支付成功！</div>
                <div className="text-muted-foreground">您的订阅已激活，即将跳转...</div>
              </div>
            </div>
          )}

          {/* 失败状态 */}
          {currentState === 'failed' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-2">支付失败</div>
                <div className="text-muted-foreground">
                  {paymentData.errorMessage || '请重试或联系客服'}
                </div>
              </div>
            </div>
          )}

          {/* 超时状态 */}
          {currentState === 'timeout' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Clock className="w-12 h-12 text-orange-500" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-2">二维码已过期</div>
                <div className="text-muted-foreground">请刷新后重新支付</div>
              </div>
            </div>
          )}

          {/* 状态提示 */}
          <Alert className="border-primary/20 bg-primary/5">
            <AlertDescription className="flex items-center gap-2 text-center justify-center">
              {statusMessage.showLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              <span className="text-foreground">{statusMessage.description}</span>
            </AlertDescription>
          </Alert>

          {/* 进度指示器 */}
          {currentState !== 'failed' && currentState !== 'timeout' && currentState !== 'cancelled' && (
            <PaymentProgressIndicator currentStep={getCurrentStep()} />
          )}

          {/* 倒计时显示 */}
          {currentState !== 'success' && currentState !== 'cancelled' && timeLeft > 0 && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  剩余时间: <span className="font-mono font-semibold text-foreground">{formatCountdown(timeLeft)}</span>
                </span>
              </div>
            </div>
          )}

          {/* 网络重试提示 */}
          {retryCount > 0 && retryCount < MAX_RETRIES && (
            <Alert className="border-orange-500/20 bg-orange-500/5">
              <AlertDescription className="flex items-center gap-2 text-center justify-center text-orange-700 dark:text-orange-300">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>网络不稳定，正在重试... ({retryCount}/{MAX_RETRIES})</span>
              </AlertDescription>
            </Alert>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            {currentState === 'failed' || currentState === 'timeout' ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  关闭
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新重试
                </Button>
              </>
            ) : currentState !== 'success' && currentState !== 'cancelled' ? (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={handleCancel}
              >
                取消支付
              </Button>
            ) : null}
          </div>
          {/* 内容区域结束 */}
          </div>
        </div>
      </UnifiedDialog>

      {/* 取消确认对话框 */}
      {showCancelConfirm && (
        <UnifiedDialog
          open={showCancelConfirm}
          onOpenChange={setShowCancelConfirm}
          size="small"
          variant="default"
          animation="scale"
          aria-label="确认取消支付"
        >
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-foreground">确认取消支付？</h3>
            </div>

            <p className="text-muted-foreground">
              取消后需要重新创建订单，确定要取消吗？
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelConfirm(false)}
              >
                继续支付
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmCancel}
              >
                确认取消
              </Button>
            </div>
          </div>
        </UnifiedDialog>
      )}
    </>
  );
};

