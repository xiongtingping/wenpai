/**
 * 统一订单状态机
 * 定义所有合法的订单状态和转换规则
 */

import { logger } from '@/utils/logger';

/**
 * 统一订单状态 - 合并旧版和新版所有状态
 */
export type UnifiedOrderStatus =
  | 'pending'    // 待支付
  | 'paid'       // 已支付
  | 'processed'  // 已处理(权限已发放)
  | 'failed'     // 支付失败
  | 'expired'    // 已过期
  | 'cancelled'  // 已取消
  | 'refunded';  // 已退款

/**
 * 订单状态元数据
 */
export interface OrderStatusMeta {
  label: string;
  description: string;
  color: string;
  isFinal: boolean; // 是否为最终状态
}

/**
 * 订单状态元信息映射
 */
export const ORDER_STATUS_META: Record<UnifiedOrderStatus, OrderStatusMeta> = {
  pending: {
    label: '待支付',
    description: '订单已创建,等待用户支付',
    color: 'yellow',
    isFinal: false
  },
  paid: {
    label: '已支付',
    description: '支付成功,等待权限发放',
    color: 'blue',
    isFinal: false
  },
  processed: {
    label: '已处理',
    description: '权限已发放,订单完成',
    color: 'green',
    isFinal: true
  },
  failed: {
    label: '支付失败',
    description: '支付未成功',
    color: 'red',
    isFinal: true
  },
  expired: {
    label: '已过期',
    description: '订单超时未支付',
    color: 'gray',
    isFinal: true
  },
  cancelled: {
    label: '已取消',
    description: '用户主动取消',
    color: 'gray',
    isFinal: true
  },
  refunded: {
    label: '已退款',
    description: '已退款给用户',
    color: 'orange',
    isFinal: true
  }
};

/**
 * 合法的状态转换规则
 */
export const VALID_TRANSITIONS: Record<UnifiedOrderStatus, UnifiedOrderStatus[]> = {
  pending: ['paid', 'failed', 'expired', 'cancelled'],
  paid: ['processed', 'refunded', 'failed'], // paid可能因为权限发放失败而变为failed
  processed: ['refunded'], // 已处理的订单仅允许退款
  failed: [], // 最终状态,不可转换
  expired: [], // 最终状态,不可转换
  cancelled: [], // 最终状态,不可转换
  refunded: [] // 最终状态,不可转换
};

/**
 * 订单状态转换事件类型
 */
export type OrderStatusEvent =
  | 'payment_received' // 收到支付
  | 'permission_granted' // 权限已发放
  | 'payment_failed' // 支付失败
  | 'order_expired' // 订单过期
  | 'user_cancelled' // 用户取消
  | 'refund_processed'; // 退款处理

/**
 * 状态转换历史记录
 */
export interface StatusTransitionRecord {
  orderId: string;
  fromStatus: UnifiedOrderStatus;
  toStatus: UnifiedOrderStatus;
  event: OrderStatusEvent;
  reason?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  operator?: string; // 操作人(系统/用户ID)
  isValid: boolean; // 转换是否合法
  error?: string; // 如果非法,错误信息
}

/**
 * 订单状态机类
 */
export class OrderStateMachine {
  /**
   * 验证状态转换是否合法
   */
  static isValidTransition(
    from: UnifiedOrderStatus,
    to: UnifiedOrderStatus
  ): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * 获取状态的合法后继状态列表
   */
  static getNextStates(current: UnifiedOrderStatus): UnifiedOrderStatus[] {
    return VALID_TRANSITIONS[current] || [];
  }

  /**
   * 检查状态是否为最终状态
   */
  static isFinalState(status: UnifiedOrderStatus): boolean {
    return ORDER_STATUS_META[status].isFinal;
  }

  /**
   * 验证并记录状态转换
   * 不抛出异常,而是返回验证结果
   */
  static validateAndLog(
    orderId: string,
    from: UnifiedOrderStatus,
    to: UnifiedOrderStatus,
    event: OrderStatusEvent,
    reason?: string
  ): StatusTransitionRecord {
    // 1. 验证转换合法性
    const isValid = this.isValidTransition(from, to);
    let error: string | undefined;

    if (!isValid) {
      error = `非法的状态转换: ${from} → ${to}`;
      logger.error(error, {
        orderId,
        from,
        to,
        event,
        validNextStates: this.getNextStates(from)
      });
    }

    // 2. 检查是否从最终状态转换
    if (isValid && this.isFinalState(from)) {
      logger.warn(`尝试从最终状态转换: ${from} → ${to} (订单: ${orderId})`);
    }

    // 3. 创建转换记录
    const record: StatusTransitionRecord = {
      orderId,
      fromStatus: from,
      toStatus: to,
      event,
      reason,
      timestamp: new Date(),
      operator: 'system',
      isValid,
      error
    };

    // 4. 记录日志
    if (isValid) {
      logger.info(`✅ 订单状态转换: ${from} → ${to}`, {
        orderId,
        event,
        reason
      });
    }

    return record;
  }

  /**
   * 根据事件推断目标状态
   */
  static inferTargetStatus(
    current: UnifiedOrderStatus,
    event: OrderStatusEvent
  ): UnifiedOrderStatus {
    const eventToStatusMap: Record<OrderStatusEvent, Partial<Record<UnifiedOrderStatus, UnifiedOrderStatus>>> = {
      payment_received: {
        pending: 'paid'
      },
      permission_granted: {
        paid: 'processed'
      },
      payment_failed: {
        pending: 'failed',
        paid: 'failed' // 支付后权限发放失败也标记为failed
      },
      order_expired: {
        pending: 'expired'
      },
      user_cancelled: {
        pending: 'cancelled'
      },
      refund_processed: {
        paid: 'refunded',
        processed: 'refunded'
      }
    };

    const targetStatus = eventToStatusMap[event]?.[current];

    if (!targetStatus) {
      throw new Error(`无法从当前状态 ${current} 根据事件 ${event} 推断目标状态`);
    }

    return targetStatus;
  }

  /**
   * 执行状态转换(带验证)
   */
  static transition(
    orderId: string,
    current: UnifiedOrderStatus,
    event: OrderStatusEvent,
    reason?: string
  ): StatusTransitionRecord {
    const target = this.inferTargetStatus(current, event);
    return this.validateAndLog(orderId, current, target, event, reason);
  }

  /**
   * 获取状态显示信息
   */
  static getStatusInfo(status: UnifiedOrderStatus): OrderStatusMeta {
    return ORDER_STATUS_META[status];
  }

  /**
   * 状态转换可视化(for debugging)
   */
  static visualizeTransitions(): string {
    let output = '订单状态转换图:\n\n';

    for (const [from, toList] of Object.entries(VALID_TRANSITIONS)) {
      if (toList.length > 0) {
        output += `${from} →\n`;
        toList.forEach(to => {
          const meta = ORDER_STATUS_META[to as UnifiedOrderStatus];
          output += `  ├─ ${to} (${meta.label})${meta.isFinal ? ' [最终]' : ''}\n`;
        });
      } else {
        output += `${from} → [最终状态,不可转换]\n`;
      }
    }

    return output;
  }
}

/**
 * 状态守卫 - 用于UI层判断操作权限
 */
export class OrderStatusGuard {
  /**
   * 是否可以取消订单
   */
  static canCancel(status: UnifiedOrderStatus): boolean {
    return status === 'pending';
  }

  /**
   * 是否可以申请退款
   */
  static canRefund(status: UnifiedOrderStatus): boolean {
    return status === 'paid' || status === 'processed';
  }

  /**
   * 是否可以重新支付
   */
  static canRetry(status: UnifiedOrderStatus): boolean {
    return status === 'failed' || status === 'expired' || status === 'cancelled';
  }

  /**
   * 是否应该显示支付二维码
   */
  static shouldShowQRCode(status: UnifiedOrderStatus): boolean {
    return status === 'pending';
  }

  /**
   * 是否应该显示成功消息
   */
  static shouldShowSuccess(status: UnifiedOrderStatus): boolean {
    return status === 'processed';
  }

  /**
   * 是否需要修复权限
   */
  static needsPermissionRepair(status: UnifiedOrderStatus): boolean {
    return status === 'paid'; // 已支付但未处理,可能需要修复
  }

  /**
   * 是否为最终状态
   */
  static isFinalStatus(status: UnifiedOrderStatus): boolean {
    return ORDER_STATUS_META[status].isFinal;
  }
}

/**
 * 导出便捷函数
 */
export function isValidOrderTransition(from: UnifiedOrderStatus, to: UnifiedOrderStatus): boolean {
  return OrderStateMachine.isValidTransition(from, to);
}

export function getOrderStatusText(status: UnifiedOrderStatus): string {
  return ORDER_STATUS_META[status].label;
}

export function getOrderStatusColor(status: UnifiedOrderStatus): string {
  return ORDER_STATUS_META[status].color;
}
