/**
 * 支付模态框相关类型定义
 */

/**
 * 支付模态框状态类型
 */
export type PaymentModalState = 
  | 'waiting_scan'      // 等待扫码
  | 'scanning'          // 扫码中
  | 'verifying'         // 支付验证中
  | 'success'           // 支付成功
  | 'failed'            // 支付失败
  | 'timeout'           // 支付超时
  | 'cancelled';        // 用户取消

/**
 * 支付模态框数据接口
 */
export interface PaymentModalData {
  /** 当前状态 */
  state: PaymentModalState;
  /** 订单ID */
  orderId: string;
  /** 二维码数据URL */
  qrCode?: string;
  /** 二维码图片URL */
  qrImage?: string;
  /** 支付金额 */
  amount: number;
  /** 剩余时间(秒) */
  timeLeft: number;
  /** 重试次数 */
  retryCount: number;
  /** 错误信息 */
  errorMessage?: string;
  /** 支付信息 */
  paymentInfo?: any;
}

/**
 * 支付进度步骤
 */
export interface PaymentStep {
  /** 步骤标签 */
  label: string;
  /** 步骤值 */
  value: number;
  /** 步骤图标 */
  icon?: string;
}

/**
 * 支付状态消息配置
 */
export interface PaymentStatusMessage {
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 图标名称 */
  icon: string;
  /** 是否显示加载动画 */
  showLoading?: boolean;
}

/**
 * 支付模态框Props
 */
export interface PaymentModalProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 支付数据 */
  paymentData: PaymentModalData;
  /** 支付成功回调 */
  onPaymentSuccess: () => void;
  /** 支付失败回调 */
  onPaymentFailed?: (error: string) => void;
  /** 支付超时回调 */
  onPaymentTimeout?: () => void;
  /** 用户取消回调 */
  onCancel?: () => void;
}

