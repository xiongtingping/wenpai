/**
 * 🔒 安全输入组件
 * 
 * 功能：
 * - 集成输入验证和过滤
 * - 实时安全检查
 * - 风险等级指示
 * - 威胁检测提示
 * - 用户友好的错误显示
 */

import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import useInputValidation, { UseInputValidationOptions } from '@/hooks/useInputValidation';
import { ValidationRule } from '@/utils/inputValidator';

export interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  validationRules?: ValidationRule[];
  validationOptions?: UseInputValidationOptions;
  showSecurityIndicator?: boolean;
  showThreatDetails?: boolean;
  variant?: 'input' | 'textarea';
  rows?: number;
  securityLevel?: 'standard' | 'strict';
}

export const SecureInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, SecureInputProps>(
  ({
    label,
    description,
    validationRules,
    validationOptions = {},
    showSecurityIndicator = true,
    showThreatDetails = false,
    variant = 'input',
    rows = 4,
    securityLevel = 'standard',
    className,
    value: controlledValue,
    onChange: controlledOnChange,
    onBlur: controlledOnBlur,
    ...props
  }, ref) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = props.type === 'password';
    
    const validation = useInputValidation(
      controlledValue as string || '',
      {
        rules: validationRules,
        validateOnChange: true,
        validateOnBlur: true,
        debounceMs: 300,
        autoSanitize: true,
        showRealTimeErrors: securityLevel === 'strict',
        ...validationOptions,
      }
    );

    // 处理受控组件
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      validation.handleChange(newValue);
      controlledOnChange?.(e);
     };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      validation.handleBlur();
      controlledOnBlur?.(e);
    };

    // 获取安全指示器
    const getSecurityIndicator = () => {
      if (!showSecurityIndicator || !validation.touched) return null;

      const { riskLevel, isValid, detectedThreats } = validation;
      
      let icon = <Shield className="w-4 h-4" />;
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
      let text = t('components.messages.安全');

      switch (riskLevel) {
        case 'critical':
          icon = <XCircle className="w-4 h-4" />;
          variant = 'destructive';
          text = t('components.messages.高危');
          break;
        case 'high':
          icon = <AlertTriangle className="w-4 h-4" />;
          variant = 'destructive';
          text = t('components.messages.危险');
          break;
        case 'medium':
          icon = <AlertTriangle className="w-4 h-4" />;
          variant = 'secondary';
          text = t('components.messages.警告');
          break;
        case 'low':
          icon = isValid ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
          variant = isValid ? 'default' : 'secondary';
          text = isValid ? t('components.messages.安全') : t('components.messages.注意');
          break;
      }

      return (
        <div className="flex items-center space-x-2">
          <Badge variant={variant} className="flex items-center space-x-1">
            {icon}
            <span>{text}</span>
          </Badge>
          {detectedThreats.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {detectedThreats.length} 个威胁
            </Badge>
          )}
        </div>
      );
    };

    // 获取威胁详情
    const getThreatDetails = () => {
      if (!showThreatDetails || validation.detectedThreats.length === 0) return null;

      return (
        <Alert variant={validation.riskLevel === 'critical' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">检测到安全威胁:</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                {validation.detectedThreats.map((threat, index) => (
                  <li key={index}>{threat}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      );
    };

    // 获取错误和警告显示
    const getValidationMessages = () => {
      const hasErrors = validation.displayErrors.length > 0;
      const hasWarnings = validation.displayWarnings.length > 0;

      if (!hasErrors && !hasWarnings) return null;

      return (
        <div className="space-y-2">
          {hasErrors && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="text-sm space-y-1">
                  {validation.displayErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {hasWarnings && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="text-sm space-y-1">
                  {validation.displayWarnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    };

    // 输入框样式
    const getInputClassName = () => {
      let baseClass = className || '';
      
      if (validation.shouldShowError) {
        baseClass += ' border-destructive focus:border-destructive focus:ring-red-500';
      } else if (validation.shouldShowWarning) {
        baseClass += ' border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500';
      } else if (validation.isValid && validation.touched) {
        baseClass += ' border-green-500 focus:border-green-500 focus:ring-green-500';
      }

      return baseClass;
    };

    const inputProps = {
      ...props,
      className: cn(getInputClassName(), validation.riskLevelClass),
      value: controlledValue !== undefined ? controlledValue : validation.value,
      onChange: handleChange,
      onBlur: handleBlur,
      type: isPasswordType && showPassword ? 'text' : props.type,
    };

    return (
      <div className="space-y-2">
        {/* 标签和描述 */}
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
            {getSecurityIndicator()}
          </div>
        )}
        
        {description && (
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            {description}
          </p>
        )}

        {/* 输入框 */}
        <div className="relative">
          {variant === 'textarea' ? (
            <Textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              {...inputProps}
            />
          ) : (
            <Input
              ref={ref as React.Ref<HTMLInputElement>}
              {...inputProps}
            />
          )}

          {/* 密码显示切换 */}
          {isPasswordType && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-muted-foreground dark:hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* 验证中指示器 */}
        {validation.isValidating && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
            <span>验证中...</span>
          </div>
        )}

        {/* 威胁详情 */}
        {getThreatDetails()}

        {/* 验证消息 */}
        {getValidationMessages()}

        {/* 字符统计 */}
        {(variant === 'textarea' || props.maxLength) && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {validation.value.length}
              {props.maxLength && `/${props.maxLength}`} 字符
            </span>
            {validation.detectedThreats.length > 0 && (
              <span className="text-orange-600">
                已检测并过滤 {validation.detectedThreats.length} 个潜在威胁
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

SecureInput.displayName = 'SecureInput';

export default SecureInput;