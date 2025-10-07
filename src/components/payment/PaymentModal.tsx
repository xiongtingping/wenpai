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
    if (!open || !paymentData.orderId || currentState === 'success' || currentState === 'cancelled' || currentState === 'timeout') {
      return;
    }
    
    const pollPaymentStatus = async () => {
      try {
        const status = await BufPayService.checkOrderStatus(paymentData.orderId);

        if (status.isPaid) {
          setCurrentState('success');

          // 延迟1.5秒后执行成功回调和跳转
          setTimeout(() => {
            onPaymentSuccess();
            toast.success('支付成功！', {
              description: '您的订阅已激活'
            });
            navigate('/');
          }, 1500);
        } else if (status.order?.status === 'failed') {
          setCurrentState('failed');
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
    setCurrentState('cancelled');
    setShowCancelConfirm(false);
    onCancel?.();
    onClose();
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
  
  return (
    <>
      <UnifiedDialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen && canClose) {
            onClose();
          }
        }}
        size="medium"
        variant="elevated"
        animation="scale"
        closeOnOverlayClick={false}
        closeOnEscape={false}
        aria-label="支付二维码"
      >
        <div className="space-y-6 p-2">
          {/* 标题栏 */}
          <div className="flex items-center justify-between">
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
          
          {/* 支付宝品牌横幅 */}
          <div className="flex justify-center">
            <AlipayBanner size="lg" />
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

              {/* 支付金额 */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">支付金额</div>
                <div className="text-3xl font-bold text-foreground">
                  ¥{paymentData.amount.toFixed(2)}
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

