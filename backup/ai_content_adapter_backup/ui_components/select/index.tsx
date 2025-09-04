/**
 * 自定义Select组件 - 解决Portal问题
 * 完全兼容React严格模式，无Portal相关异常
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ========================================================================================
// 类型定义
// ========================================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options: SelectOption[];
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  children?: React.ReactNode;
}

export interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
}

export interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

export interface SelectValueProps {
  className?: string;
  placeholder?: string;
}

// ========================================================================================
// Context
// ========================================================================================

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
}

// ========================================================================================
// 主要组件
// ========================================================================================

export function Select({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  }, [value, onValueChange]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // ESC键关闭
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const contextValue: SelectContextValue = {
    value: currentValue,
    onValueChange: handleValueChange,
    open,
    setOpen: disabled ? () => {} : setOpen,
    triggerRef,
    contentRef,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// ========================================================================================
// SelectTrigger组件
// ========================================================================================

export function SelectTrigger({
  className,
  children,
  disabled = false,
  size = 'md',
  variant = 'outline',
  ...props
}: SelectTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useSelectContext();

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-between rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'h-4 w-4 opacity-50 transition-transform',
          open && 'rotate-180'
        )}
      />
    </button>
  );
}

// ========================================================================================
// SelectValue组件
// ========================================================================================

export function SelectValue({
  className,
  placeholder = '请选择...',
}: SelectValueProps) {
  const { value } = useSelectContext();

  return (
    <span className={cn('block truncate', className)}>
      {value || placeholder}
    </span>
  );
}

// ========================================================================================
// SelectContent组件
// ========================================================================================

export function SelectContent({
  className,
  children,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
}: SelectContentProps) {
  const { open, contentRef, triggerRef } = useSelectContext();
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // 计算位置
  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = triggerRect.bottom + sideOffset;
      let left = triggerRect.left + alignOffset;
      const width = triggerRect.width;

      // 处理不同的side
      if (side === 'top') {
        top = triggerRect.top - sideOffset;
      } else if (side === 'left') {
        top = triggerRect.top;
        left = triggerRect.left - sideOffset;
      } else if (side === 'right') {
        top = triggerRect.top;
        left = triggerRect.right + sideOffset;
      }

      // 处理不同的align
      if (align === 'center') {
        left = triggerRect.left + triggerRect.width / 2 - width / 2;
      } else if (align === 'end') {
        left = triggerRect.right - width;
      }

      // 边界检查
      if (left + width > viewportWidth) {
        left = viewportWidth - width - 8;
      }
      if (left < 8) {
        left = 8;
      }

      if (top + 200 > viewportHeight && side === 'bottom') {
        top = triggerRect.top - sideOffset - 200;
      }

      setPosition({ top, left, width });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, side, align, sideOffset, alignOffset]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="listbox"
      className={cn(
        'fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
      style={{
        top: position.top,
        left: position.left,
        minWidth: position.width,
      }}
    >
      {children}
    </div>
  );
}

// ========================================================================================
// SelectItem组件
// ========================================================================================

export function SelectItem({
  value,
  className,
  children,
  disabled = false,
  onSelect,
}: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelectContext();
  const isSelected = selectedValue === value;

  const handleSelect = () => {
    if (disabled) return;
    onSelect?.(value);
    onValueChange?.(value);
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        disabled && 'pointer-events-none opacity-50',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
      onClick={handleSelect}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
}

// ========================================================================================
// 便捷组件
// ========================================================================================

export function SimpleSelect({
  value,
  defaultValue,
  placeholder = '请选择...',
  options,
  onValueChange,
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  itemClassName,
  size = 'md',
  variant = 'outline',
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
}: SelectProps) {
  const selectedOption = options.find(option => option.value === (value || defaultValue));

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(className, triggerClassName)}
        size={size}
        variant={variant}
        disabled={disabled}
      >
        <SelectValue
          placeholder={placeholder}
        />
      </SelectTrigger>
      <SelectContent
        className={contentClassName}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={itemClassName}
          >
            <div>
              <div>{option.label}</div>
              {option.description && (
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// 导出所有组件
export {
  Select as SelectRoot,
  SimpleSelect as default,
};
