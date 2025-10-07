/**
 * 支付进度指示器组件
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentStep } from '@/types/payment-modal';

interface PaymentProgressIndicatorProps {
  /** 当前步骤 (1-4) */
  currentStep: number;
  /** 自定义步骤配置 */
  steps?: PaymentStep[];
  /** 自定义类名 */
  className?: string;
}

/**
 * 默认步骤配置
 */
const defaultSteps: PaymentStep[] = [
  { label: '扫码', value: 1 },
  { label: '支付', value: 2 },
  { label: '验证', value: 3 },
  { label: '完成', value: 4 }
];

/**
 * 支付进度指示器组件
 */
export const PaymentProgressIndicator: React.FC<PaymentProgressIndicatorProps> = ({
  currentStep,
  steps = defaultSteps,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.value}>
          {/* 步骤圆圈 */}
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
              currentStep >= step.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground"
            )}
          >
            {currentStep > step.value ? (
              <Check className="w-4 h-4" />
            ) : (
              step.value
            )}
          </div>

          {/* 连接线 */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-1 w-12 transition-all duration-300 rounded-full",
                currentStep > step.value ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

