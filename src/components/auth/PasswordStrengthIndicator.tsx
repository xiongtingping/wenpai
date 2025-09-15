/**
 * 🔐 密码强度指示器组件
 * 实时显示密码强度和安全建议
 */

import React from 'react';
import { validatePassword, getPasswordStrengthDisplay, PasswordStrength } from '@/utils/passwordSecurity';
import { CheckCircle, AlertCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PasswordStrengthIndicatorProps {
  password: string;
  showPassword?: boolean;
  onTogglePasswordVisibility?: () => void;
  className?: string;
  showSuggestions?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showPassword = false,
  onTogglePasswordVisibility,
  className = '',
  showSuggestions = true,
}: PasswordStrengthIndicatorProps) {
  const strength = validatePassword(password);
  const display = getPasswordStrengthDisplay(strength);

  if (!password) return null;

  return (
    <div className={`password-strength-indicator space-y-3 ${className}`}>
      {/* 强度条和标签 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">密码强度</span>
            <span 
              className="text-sm font-semibold inline-style-converted" 
            >
              {display.label}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-300 ease-in-out rounded-full"
              style={{ 
                width: `${display.percentage}%`,
                backgroundColor: display.color,
              }}
            />
          </div>
        </div>
        
        {/* 密码可见性切换 */}
        {onTogglePasswordVisibility && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onTogglePasswordVisibility}
            className="h-8 w-8 p-0 shrink-0"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* 安全要求检查列表 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">安全要求：</h4>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <RequirementItem
            met={strength.requirements.minLength}
            text="至少8位字符"
          />
          <RequirementItem
            met={strength.requirements.hasUppercase}
            text="包含大写字母(A-Z)"
          />
          <RequirementItem
            met={strength.requirements.hasLowercase}
            text="包含小写字母(a-z)"
          />
          <RequirementItem
            met={strength.requirements.hasDigit}
            text="包含数字(0-9)"
          />
          <RequirementItem
            met={strength.requirements.hasSpecial}
            text="包含特殊字符(!@#$%^&*等)"
          />
          <RequirementItem
            met={strength.requirements.noCommonPatterns}
            text="避免常见弱密码模式"
          />
        </div>
      </div>

      {/* 反馈信息和建议 */}
      {showSuggestions && strength.feedback.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">建议：</h4>
          <div className="space-y-1">
            {strength.feedback.map((feedback, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <div className="mt-0.5 shrink-0">
                  {strength.isValid ? (
                    <CheckCircle className="h-3 w-3 text-success" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                  )}
                </div>
                <span className="text-muted-foreground">{feedback}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 安全提示 */}
      {strength.level === 'very-strong' && (
        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md">
          <CheckCircle className="h-4 w-4 text-success shrink-0" />
          <span className="text-xs text-green-700 dark:text-green-300">
            密码强度优秀，请妥善保管您的账户信息
          </span>
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle className="h-3 w-3 text-success shrink-0" />
      ) : (
        <XCircle className="h-3 w-3 text-destructive shrink-0" />
      )}
      <span 
        className={`text-xs ${
          met ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
        }`}
      >
        {text}
      </span>
    </div>
  );
}

export default PasswordStrengthIndicator;