/**
 * 🔒 输入验证React Hook
 * 
 * 功能：
 * - 实时输入验证
 * - 表单字段验证
 * - 安全过滤集成
 * - 错误状态管理
 * - 自动清理和重置
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { InputValidation, ValidationRule, ValidationResult } from '@/utils/inputValidator';

export interface UseInputValidationOptions {
  rules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  autoSanitize?: boolean;
  showRealTimeErrors?: boolean;
}

export interface InputValidationState {
  value: string;
  sanitizedValue: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedThreats: string[];
  isValidating: boolean;
  touched: boolean;
  dirty: boolean;
}

const DEFAULT_OPTIONS: UseInputValidationOptions = {
  validateOnChange: true,
  validateOnBlur: true,
  debounceMs: 300,
  autoSanitize: true,
  showRealTimeErrors: false,
};

export function useInputValidation(
  initialValue: string = '',
  options: UseInputValidationOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [state, setState] = useState<InputValidationState>({
    value: initialValue,
    sanitizedValue: initialValue,
    isValid: true,
    errors: [],
    warnings: [],
    riskLevel: 'low',
    detectedThreats: [],
    isValidating: false,
    touched: false,
    dirty: false,
  });

  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const initialValueRef = useRef(initialValue);

  // 执行验证
  const performValidation = useCallback((value: string): ValidationResult => {
    const result = InputValidation.validate(value, config.rules);
    
    setState(prev => ({
      ...prev,
      sanitizedValue: config.autoSanitize ? result.sanitizedValue : value,
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      riskLevel: result.riskLevel,
      detectedThreats: result.detectedThreats,
      isValidating: false,
    }));

    return result;
  }, [config.rules, config.autoSanitize]);

  // 防抖验证
  const debouncedValidate = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setState(prev => ({ ...prev, isValidating: true }));

    debounceTimerRef.current = setTimeout(() => {
      performValidation(value);
    }, config.debounceMs);
  }, [performValidation, config.debounceMs]);

  // 立即验证
  const validateImmediately = useCallback((value: string): ValidationResult => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setState(prev => ({ ...prev, isValidating: true }));
    return performValidation(value);
  }, [performValidation]);

  // 值变更处理
  const handleChange = useCallback((newValue: string) => {
    setState(prev => ({
      ...prev,
      value: newValue,
      dirty: newValue !== initialValueRef.current,
      touched: true,
    }));

    if (config.validateOnChange) {
      if (config.showRealTimeErrors) {
        validateImmediately(newValue);
      } else {
        debouncedValidate(newValue);
      }
    }
  }, [config.validateOnChange, config.showRealTimeErrors, validateImmediately, debouncedValidate]);

  // 失焦处理
  const handleBlur = useCallback(() => {
    setState(prev => ({ ...prev, touched: true }));

    if (config.validateOnBlur) {
      validateImmediately(state.value);
    }
  }, [config.validateOnBlur, validateImmediately, state.value]);

  // 重置
  const reset = useCallback((newInitialValue?: string) => {
    const resetValue = newInitialValue ?? initialValueRef.current;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setState({
      value: resetValue,
      sanitizedValue: resetValue,
      isValid: true,
      errors: [],
      warnings: [],
      riskLevel: 'low',
      detectedThreats: [],
      isValidating: false,
      touched: false,
      dirty: false,
    });

    if (newInitialValue !== undefined) {
      initialValueRef.current = newInitialValue;
    }
  }, []);

  // 清除错误
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: [],
      warnings: [],
      detectedThreats: [],
      riskLevel: 'low',
    }));
  }, []);

  // 手动验证
  const validate = useCallback((): ValidationResult => {
    return validateImmediately(state.value);
  }, [validateImmediately, state.value]);

  // 设置值（不触发验证）
  const setValue = useCallback((newValue: string) => {
    setState(prev => ({
      ...prev,
      value: newValue,
      sanitizedValue: config.autoSanitize ? InputValidation.sanitizeHTML(newValue) : newValue,
      dirty: newValue !== initialValueRef.current,
    }));
  }, [config.autoSanitize]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 获取显示的错误消息
  const getDisplayErrors = useCallback(() => {
    if (!state.touched && !config.showRealTimeErrors) {
      return [];
    }
    return state.errors;
  }, [state.errors, state.touched, config.showRealTimeErrors]);

  // 获取显示的警告消息
  const getDisplayWarnings = useCallback(() => {
    if (!state.touched && !config.showRealTimeErrors) {
      return [];
    }
    return state.warnings;
  }, [state.warnings, state.touched, config.showRealTimeErrors]);

  // 是否应该显示错误状态
  const shouldShowError = state.touched && !state.isValid && state.errors.length > 0;

  // 是否应该显示警告状态
  const shouldShowWarning = state.touched && state.warnings.length > 0;

  // 风险等级样式类
  const getRiskLevelClass = () => {
    switch (state.riskLevel) {
      case 'critical':
        return 'border-red-500 bg-red-50 text-red-900';
      case 'high':
        return 'border-orange-500 bg-orange-50 text-orange-900';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 text-yellow-900';
      case 'low':
      default:
        return shouldShowError ? 'border-red-300 bg-red-50' : 
               shouldShowWarning ? 'border-yellow-300 bg-yellow-50' : 
               state.isValid && state.touched ? 'border-green-300 bg-green-50' : '';
    }
  };

  return {
    // 状态
    ...state,
    
    // 计算属性
    displayErrors: getDisplayErrors(),
    displayWarnings: getDisplayWarnings(),
    shouldShowError,
    shouldShowWarning,
    riskLevelClass: getRiskLevelClass(),
    
    // 方法
    handleChange,
    handleBlur,
    reset,
    clearErrors,
    validate,
    setValue,
    
    // 表单集成属性
    inputProps: {
      value: state.value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleChange(e.target.value),
      onBlur: handleBlur,
      className: getRiskLevelClass(),
    },
  };
}

// 表单验证Hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule[]>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string[]>>({} as any);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as any);
  const [isValidating, setIsValidating] = useState(false);

  // 验证单个字段
  const validateField = useCallback((name: keyof T, value: any): string[] => {
    const rules = validationRules[name] || [];
    const result = InputValidation.validate(String(value), rules);
    return result.errors;
  }, [validationRules]);

  // 验证所有字段
  const validateAllFields = useCallback((): boolean => {
    setIsValidating(true);
    const newErrors: Record<keyof T, string[]> = {} as any;
    let hasErrors = false;

    Object.keys(values).forEach(key => {
      const fieldName = key as keyof T;
      const fieldErrors = validateField(fieldName, values[fieldName]);
      newErrors[fieldName] = fieldErrors;
      if (fieldErrors.length > 0) {
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setIsValidating(false);
    return !hasErrors;
  }, [values, validateField]);

  // 处理字段变更
  const handleFieldChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 如果字段已被触摸，立即验证
    if (touched[name]) {
      const fieldErrors = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldErrors }));
    }
  }, [touched, validateField]);

  // 处理字段失焦
  const handleFieldBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: fieldErrors }));
  }, [validateField, values]);

  // 重置表单
  const resetForm = useCallback((newInitialValues?: T) => {
    const resetValues = newInitialValues || initialValues;
    setValues(resetValues);
    setErrors({} as any);
    setTouched({} as any);
    setIsValidating(false);
  }, [initialValues]);

  // 获取字段属性
  const getFieldProps = useCallback((name: keyof T) => ({
    value: values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleFieldChange(name, e.target.value),
    onBlur: () => handleFieldBlur(name),
    error: touched[name] ? errors[name] : undefined,
  }), [values, errors, touched, handleFieldChange, handleFieldBlur]);

  // 表单是否有效
  const isValid = Object.values(errors).every((fieldErrors: string[]) => fieldErrors.length === 0);

  // 表单是否已被修改
  const isDirty = Object.keys(values).some(key => 
    values[key as keyof T] !== initialValues[key as keyof T]
  );

  return {
    values,
    errors,
    touched,
    isValidating,
    isValid,
    isDirty,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    resetForm,
    getFieldProps,
  };
}

export default useInputValidation;