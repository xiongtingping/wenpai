/**
 * 订阅状态计算工具
 * @description 提供订阅到期提醒和状态计算功能
 */

export interface SubscriptionStatus {
  /** 订阅状态 */
  status: 'active' | 'expiring_soon' | 'expired' | 'inactive';
  /** 到期日期 */
  expiresAt: Date | null;
  /** 剩余天数 */
  daysRemaining: number;
  /** 需要提醒 */
  needsAlert: boolean;
  /** 提醒级别 */
  alertLevel: 'info' | 'warning' | 'danger';
  /** 提醒消息 */
  alertMessage: string;
  /** 状态标签文本 */
  statusLabel: string;
  /** 状态颜色 */
  statusColor: 'green' | 'yellow' | 'orange' | 'red' | 'gray';
  /** 订阅等级 */
  tier?: 'trial' | 'pro' | 'premium';
  /** 订阅周期 */
  period?: 'monthly' | 'yearly';
}

/**
 * 计算订阅状态
 */
export function calculateSubscriptionStatus(
  subscription: { expires_at: string; status: string } | null
): SubscriptionStatus {
  const now = new Date();
  
  // 没有订阅
  if (!subscription || subscription.status !== 'active') {
    return {
      status: 'inactive',
      expiresAt: null,
      daysRemaining: 0,
      needsAlert: false,
      alertLevel: 'info',
      alertMessage: '',
      statusLabel: i18n.t('common.status.notSubscribed'),
      statusColor: 'gray'
    };
  }

  const expiresAt = new Date(subscription.expires_at);
  const timeDiff = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // 已过期
  if (daysRemaining <= 0) {
    return {
      status: 'expired',
      expiresAt,
      daysRemaining: 0,
      needsAlert: true,
      alertLevel: 'danger',
      alertMessage: '您的订阅已过期，请立即续费以继续使用服务',
      statusLabel: i18n.t('common.status.expired'),
      statusColor: 'red'
    };
  }

  // 当天到期
  if (daysRemaining === 1) {
    return {
      status: 'expiring_soon',
      expiresAt,
      daysRemaining,
      needsAlert: true,
      alertLevel: 'danger',
      alertMessage: '您的订阅今天到期，立即续费避免服务中断',
      statusLabel: i18n.t('common.status.expirestoday'),
      statusColor: 'red'
    };
  }

  // 3天内到期
  if (daysRemaining <= 3) {
    return {
      status: 'expiring_soon',
      expiresAt,
      daysRemaining,
      needsAlert: true,
      alertLevel: 'warning',
      alertMessage: `您的订阅将在 ${daysRemaining} 天后到期，续费以避免服务中断`,
      statusLabel: `${daysRemaining}天后到期`,
      statusColor: 'orange'
    };
  }

  // 7天内到期
  if (daysRemaining <= 7) {
    return {
      status: 'expiring_soon',
      expiresAt,
      daysRemaining,
      needsAlert: true,
      alertLevel: 'info',
      alertMessage: `您的订阅将在 ${daysRemaining} 天后到期，立即升级可享受更多高级功能`,
      statusLabel: `${daysRemaining}天后到期`,
      statusColor: 'yellow'
    };
  }

  // 正常状态
  return {
    status: 'active',
    expiresAt,
    daysRemaining,
    needsAlert: false,
    alertLevel: 'info',
    alertMessage: '',
    statusLabel: i18n.t('utils.labels.有效'),
    statusColor: 'green'
  };
}

/**
 * 格式化到期时间显示
 */
export function formatExpiryDisplay(expiresAt: Date | null): string {
  if (!expiresAt) return '';
  
  const now = new Date();
  const timeDiff = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 0) {
    return i18n.t('common.status.expired');
  } else if (daysRemaining === 1) {
    return i18n.t('common.status.expirestoday');
  } else if (daysRemaining <= 7) {
    return `${daysRemaining}天后到期`;
  } else {
    return `${Math.floor(daysRemaining / 30)}个月后到期`;
  }
}

/**
 * 获取状态图标
 */
export function getStatusIcon(status: SubscriptionStatus['status']): string {
  switch (status) {
    case 'active':
      return '✅';
    case 'expiring_soon':
      return '⚠️';
    case 'expired':
      return '❌';
    case 'inactive':
      return '⭕';
    default:
      return '❓';
  }
}