/**
 * 快速引用对话框组件 - 完全复制历史记录弹窗结构
 * 使用现代化的React组件架构，支持主题适配和响应式设计
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuickReferenceDialogPositioning, useDialogScrollLock } from '@/hooks/useDialogPositioning';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Copy,
  Trash2,
  Filter,
  Download,
  Clock,
  Tag,
  X,
  AtSign,
  RefreshCw,
  Database,
  Bookmark,
  Radar,
  Check,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { quickReferenceDataService, QuickReferenceItem } from '@/services/quickReferenceDataService';

export type TabType = 'brand' | 'library' | 'radar';

interface AnchorPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface QuickReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (content: string) => void;
  multiSelect?: boolean;
  className?: string;
  anchor?: AnchorPosition; // 触发按钮的屏幕坐标（相对视口），用于贴近定位
}

export function QuickReferenceDialog({
  open,
  onOpenChange,
  onSelect,
  multiSelect = false,
  className,
  anchor
}: QuickReferenceDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  // 🚨 组件渲染日志
  console.log('🔍 QuickReferenceDialog 渲染，open:', open);

  // 状态管理 - 完全复制历史记录弹窗的状态结构
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('brand');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Record<TabType, boolean>>({
    brand: false,
    library: false,
    radar: false
  });
  const [items, setItems] = useState<Record<TabType, QuickReferenceItem[]>>({
    brand: [],
    library: [],
    radar: []
  });
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // 🚨 终极JavaScript修复器 - 配合CSS终极修复，避免冲突循环
  useEffect(() => {
    if (!open) return;
  if (anchor) return; // 锚点模式下由 Floating UI 完全接管，终止旧修复器

    console.log('🎯 启动终极Dialog修复器 v3.0');

    const ultimateDialogFix = () => {
      // 多选择器查找Dialog元素
      const dialogElement = (
        document.querySelector('[role="dialog"][class*="enhanced-quick-reference-dialog"]') ||
        document.querySelector('.enhanced-quick-reference-dialog') ||
        document.querySelector('[role="dialog"][class*="quick-reference-dialog"]') ||
        document.querySelector('.quick-reference-dialog') ||
        document.querySelector('[role="dialog"]')
      ) as HTMLElement;

      if (dialogElement) {
        // 🎯 记录当前状态
        const rect = dialogElement.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(dialogElement);

        console.log('📊 Dialog当前状态:', {
          position: computedStyle.position,
          top: computedStyle.top,
          left: computedStyle.left,
          transform: computedStyle.transform,
          width: computedStyle.width,
          height: computedStyle.height,
          zIndex: computedStyle.zIndex,
          rect: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }
        });

        // 🎯 检查是否需要修复（位置不正确或尺寸异常）
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const dialogCenterX = rect.left + rect.width / 2;
        const dialogCenterY = rect.top + rect.height / 2;

        const offsetX = Math.abs(dialogCenterX - viewportCenterX);
        const offsetY = Math.abs(dialogCenterY - viewportCenterY);

        const needsFix = (
          offsetX > 10 || offsetY > 10 || // 位置偏差超过10px
          rect.width < 500 || rect.height < 400 || // 尺寸异常
          rect.x < 0 || rect.y < 0 || // 位置在视窗外
          computedStyle.position !== 'fixed' // 定位方式不正确
        );

        if (needsFix) {
          console.log('🔧 检测到需要修复，应用终极修复方案');

          // 🚨 只做必要的强制修复，避免与CSS冲突
          dialogElement.style.setProperty('position', 'fixed', 'important');
          dialogElement.style.setProperty('top', '50vh', 'important');
          dialogElement.style.setProperty('left', '50vw', 'important');
          dialogElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
          dialogElement.style.setProperty('z-index', '1000000', 'important');

          // 🎯 添加调试标识
          dialogElement.classList.add('ultimate-dialog-debug');

          // 🎯 验证修复效果
          setTimeout(() => {
            const newRect = dialogElement.getBoundingClientRect();
            const newCenterX = newRect.left + newRect.width / 2;
            const newCenterY = newRect.top + newRect.height / 2;
            const newOffsetX = Math.abs(newCenterX - viewportCenterX);
            const newOffsetY = Math.abs(newCenterY - viewportCenterY);

            console.log('✅ 终极修复验证结果:', {
              beforeOffset: { x: offsetX, y: offsetY },
              afterOffset: { x: newOffsetX, y: newOffsetY },
              isCentered: newOffsetX < 5 && newOffsetY < 5,
              newRect: {
                x: Math.round(newRect.x),
                y: Math.round(newRect.y),
                width: Math.round(newRect.width),
                height: Math.round(newRect.height)
              }
            });
          }, 100);
        } else {
          console.log('✅ Dialog位置正确，无需修复');
        }

        // 🎯 确保背景遮罩正确
        const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;
        if (overlay) {
          const overlayRect = overlay.getBoundingClientRect();
          if (overlayRect.width !== window.innerWidth || overlayRect.height !== window.innerHeight) {
            console.log('🔧 修复背景遮罩尺寸');
            overlay.style.setProperty('position', 'fixed', 'important');
            overlay.style.setProperty('top', '0', 'important');
            overlay.style.setProperty('left', '0', 'important');
            overlay.style.setProperty('width', '100vw', 'important');
            overlay.style.setProperty('height', '100vh', 'important');
            overlay.style.setProperty('z-index', '999999', 'important');
          }
        }
      } else {
        console.warn('⚠️ 终极修复器 - 未找到Dialog元素');
      }
    };

    // 执行修复 - 减少频率，避免过度干扰
    ultimateDialogFix();
    const timeouts = [100, 300];
    timeouts.forEach(delay => {
      setTimeout(ultimateDialogFix, delay);
    });

    // 监听窗口变化
    const handleResize = () => {
      setTimeout(ultimateDialogFix, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);
  // 📌 居中模式：当未提供 anchor 时，强制以视窗为参照精确居中并清除残留定位
  useEffect(() => {
    if (!open || anchor) return;
    const el = document.querySelector('.enhanced-quick-reference-dialog') as HTMLElement | null;
    if (!el) return;

    const applyCenter = () => {
      // 移除可能遗留的定位痕迹（包含此前的 !important）
      el.style.setProperty('inset', 'unset', 'important');
      el.style.setProperty('inset-inline', 'unset', 'important');
      el.style.setProperty('inset-block', 'unset', 'important');
      el.style.setProperty('inset-inline-start', 'unset', 'important');
      el.style.setProperty('inset-inline-end', 'unset', 'important');
      el.style.setProperty('inset-block-start', 'unset', 'important');
      el.style.setProperty('inset-block-end', 'unset', 'important');
      el.style.setProperty('right', 'auto', 'important');
      el.style.setProperty('bottom', 'auto', 'important');
      // 先设置基线：固定定位、移除transform并放在(0,0)测量基准偏移
      el.style.setProperty('position', 'fixed', 'important');
      el.style.setProperty('left', `0px`, 'important');
      el.style.setProperty('top', `0px`, 'important');
      el.style.setProperty('transform', 'none', 'important');
      el.style.setProperty('translate', 'none', 'important');
      el.style.setProperty('scale', 'none', 'important');
      el.style.setProperty('rotate', 'none', 'important');
      el.style.setProperty('margin', '0', 'important');
      el.style.setProperty('z-index', '1000001', 'important');

      // 读取当前矩形（此时包含所有祖先位移的最终偏差）
      const r = el.getBoundingClientRect();
      const ew = r.width;
      const eh = r.height;
      const centerX = Math.round(window.innerWidth / 2);
      const centerY = Math.round(window.innerHeight / 2);
      const min = 8;
      const leftPx = Math.max(min, Math.round(centerX - ew / 2 - r.left));
      const topPx = Math.max(min, Math.round(centerY - eh / 2 - r.top));

      // 写入像素级补偿后的目标位置
      el.style.setProperty('left', `${leftPx}px`, 'important');
      el.style.setProperty('top', `${topPx}px`, 'important');
    };

    applyCenter();
    const obs = new MutationObserver(() => applyCenter());
    obs.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
    const t0 = setTimeout(applyCenter, 50);
    const t1 = setTimeout(applyCenter, 150);
    const t2 = requestAnimationFrame(applyCenter);

    // 运行时保持：滚动/缩放/尺寸变化/轻量定时 刷新居中
    const onScroll = () => applyCenter();
    const onResize = () => applyCenter();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(() => applyCenter());
    try { ro.observe(el); } catch {}
    const interval = setInterval(applyCenter, 250);

    return () => {
      obs.disconnect();
      clearTimeout(t0); clearTimeout(t1); cancelAnimationFrame(t2);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      try { ro.disconnect(); } catch {}
      clearInterval(interval);
    };
  }, [open, anchor]);


  // 🎯 使用统一的滚动锁定Hook
  useDialogScrollLock(open);

  // 🎯 Floating UI：锚点定位（仅在存在 anchor 时生效）
  const { refs, x, y, strategy, update } = useFloating({
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
    placement: 'bottom',
    middleware: [offset(12), flip(), shift()],
  });

  // 🎯 虚拟参考：基于 anchor 的矩形
  useEffect(() => {
    if (!anchor) return;
    const rect = {
      x: anchor.x,
      y: anchor.y,
      width: anchor.width ?? 0,
      height: anchor.height ?? 0,
      top: anchor.y,
      left: anchor.x,
      right: anchor.x + (anchor.width ?? 0),
      bottom: anchor.y + (anchor.height ?? 0),
    };
    const virtualEl = { getBoundingClientRect: () => rect as DOMRect };
    // @ts-ignore - 虚拟参考允许简化类型
    refs.setReference(virtualEl);
    update?.();
  }, [anchor, refs, update]);
  // 🛡️ Anchored 模式最小强化：用 !important 清除冲突并应用 Floating UI 结果
  useEffect(() => {
    if (!open || !anchor) return;
    const el = document.querySelector('.enhanced-quick-reference-dialog') as HTMLElement | null;
    if (!el) return;

    // 彻底清除一切会干扰 transform 定位的属性（有的全局样式带有 !important）
    el.style.setProperty('top', 'unset', 'important');
    el.style.setProperty('left', 'unset', 'important');
    el.style.setProperty('right', 'unset', 'important');
    el.style.setProperty('bottom', 'unset', 'important');
    el.style.setProperty('inset', 'unset', 'important');
    el.style.setProperty('inset-block', 'unset', 'important');
    el.style.setProperty('inset-inline', 'unset', 'important');
    el.style.setProperty('inset-block-start', 'unset', 'important');
    el.style.setProperty('inset-block-end', 'unset', 'important');
    el.style.setProperty('inset-inline-start', 'unset', 'important');
    el.style.setProperty('inset-inline-end', 'unset', 'important');
    el.style.setProperty('position', 'fixed', 'important');

    // 应用 Floating UI 计算的绝对像素偏移（强制覆盖任何动画/居中 transform）
    const rawX = Math.round((x ?? (anchor?.x ?? 0)));
    const rawY = Math.round((y ?? (anchor ? (anchor.y + (anchor.height ?? 0) + 12) : 0)));
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ew = el.offsetWidth || 0;
    const eh = el.offsetHeight || 0;
    const minMargin = 8;
    const cx = Math.max(minMargin, Math.min(rawX, Math.max(minMargin, vw - ew - minMargin)));
    const cy = Math.max(minMargin, Math.min(rawY, Math.max(minMargin, vh - eh - minMargin)));
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('left', `${cx}px`, 'important');
    el.style.setProperty('top', `${cy}px`, 'important');

    el.style.setProperty('margin', '0', 'important');
    //       
    //   MutationObserver   top/left/inset/transform 
    const reapplyAnchoredStyle = () => {
      const tx = Math.round((x ?? (anchor?.x ?? 0)));
      const ty = Math.round((y ?? (anchor ? (anchor.y + (anchor.height ?? 0) + 12) : 0)));
      el.style.setProperty('position', 'fixed', 'important');
      el.style.setProperty('transform', 'none', 'important');
      el.style.setProperty('translate', 'none', 'important');
      el.style.setProperty('scale', 'none', 'important');
      el.style.setProperty('rotate', 'none', 'important');
      //  inset 
      el.style.setProperty('inset', 'unset', 'important');
      el.style.setProperty('inset-block', 'unset', 'important');
      // 视口夹紧，避免负坐标或越界
      const vw2 = window.innerWidth;
      const vh2 = window.innerHeight;
      const ew2 = el.offsetWidth || 0;
      const eh2 = el.offsetHeight || 0;
      const min2 = 8;
      const cx = Math.max(min2, Math.min(tx, Math.max(min2, vw2 - ew2 - min2)));
      const cy = Math.max(min2, Math.min(ty, Math.max(min2, vh2 - eh2 - min2)));

      el.style.setProperty('inset-inline', 'unset', 'important');
      el.style.setProperty('inset-block-start', 'unset', 'important');
      el.style.setProperty('inset-block-end', 'unset', 'important');
      el.style.setProperty('inset-inline-start', 'unset', 'important');
      el.style.setProperty('inset-inline-end', 'unset', 'important');
      //  left/top 
      el.style.setProperty('left', `${cx}px`, 'important');
      el.style.setProperty('top', `${cy}px`, 'important');
      //  inset 
      el.style.setProperty('right', 'auto', 'important');
      el.style.setProperty('bottom', 'auto', 'important');
      el.style.setProperty('inset-inline-start', `${cx}px`, 'important');
      el.style.setProperty('inset-block-start', `${cy}px`, 'important');
      // 二次校正：以 viewport 为基准用实际 rect 校正偏移，确保 r.top/left ≥ min2
      const r2 = el.getBoundingClientRect();
      let adjustX = 0;
      let adjustY = 0;
      if (r2.left < min2) adjustX = min2 - r2.left;
      else if (r2.right > vw2 - min2) adjustX = (vw2 - min2) - r2.right;
      if (r2.top < min2) adjustY = min2 - r2.top;
      else if (r2.bottom > vh2 - min2) adjustY = (vh2 - min2) - r2.bottom;
      if (adjustX || adjustY) {
        const curLeft = parseFloat(el.style.left || '0');
        const curTop = parseFloat(el.style.top || '0');
        const newLeft = Math.max(min2, Math.min(curLeft + adjustX, Math.max(min2, vw2 - ew2 - min2)));
        const newTop = Math.max(min2, Math.min(curTop + adjustY, Math.max(min2, vh2 - eh2 - min2)));
        el.style.setProperty('left', `${Math.round(newLeft)}px`, 'important');
        el.style.setProperty('top', `${Math.round(newTop)}px`, 'important');
        el.style.setProperty('inset-inline-start', `${Math.round(newLeft)}px`, 'important');
        el.style.setProperty('inset-block-start', `${Math.round(newTop)}px`, 'important');
      }

    };

    reapplyAnchoredStyle();

    const obs = new MutationObserver(() => {
      reapplyAnchoredStyle();
    });
    obs.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });

    return () => {
      obs.disconnect();
    };

  }, [open, anchor, x, y]);
  // 🧼 容器净化器：移除会让 position: fixed 失去“相对视口”的祖先属性（仅在弹窗打开期间）
  useEffect(() => {
    if (!open || !anchor) return;
    const el = document.querySelector('.enhanced-quick-reference-dialog') as HTMLElement | null;
    if (!el) return;

    const patched: Array<{ node: HTMLElement; prop: string; prev: string | null }> = [];
    const maybePatch = (node: HTMLElement, prop: string, target: string) => {
      const prev = node.style.getPropertyValue(prop);
      // 仅当计算值与目标不同且会影响 fixed 参照系时才处理
      const computed = getComputedStyle(node).getPropertyValue(prop);
      if (computed && computed.trim() !== target) {
        node.style.setProperty(prop, target, 'important');
        patched.push({ node, prop, prev: prev || null });
      }
    };

    // 目标节点：Portal 容器（Radix 或自定义）及其上溯祖先，限制深度
    const candidates: HTMLElement[] = [];
    let p: HTMLElement | null = el.parentElement as HTMLElement | null;
    let hops = 0;
    while (p && hops < 12) { // 稍增深度，但保持有限
      candidates.push(p);
      if (p.matches('div[data-radix-portal]') || p.id === 'dialog-portal-root' || p.id === 'root') {
        // 命中关键容器也纳入处理
      }
      p = p.parentElement as HTMLElement | null;
      hops += 1;
    }

    // 纳入 body/html 并在候选祖先上移除会创建包含块/包含上下文的属性
    const docEl = document.documentElement as HTMLElement;
    const body = document.body as HTMLElement;
    if (body) candidates.push(body);
    if (docEl) candidates.push(docEl);

    for (const node of candidates) {
      maybePatch(node as HTMLElement, 'transform', 'none');
      maybePatch(node as HTMLElement, 'filter', 'none');
      maybePatch(node as HTMLElement, 'backdrop-filter', 'none');
      maybePatch(node as HTMLElement, 'contain', 'none');
      maybePatch(node as HTMLElement, 'perspective', 'none');
      // 个别浏览器实现了独立的转换属性
      maybePatch(node as HTMLElement, 'translate', 'none');
      maybePatch(node as HTMLElement, 'scale', 'none');
      maybePatch(node as HTMLElement, 'rotate', 'none');
      // 处理缩放与优化提示
      maybePatch(node as HTMLElement, 'zoom', '1');
      maybePatch(node as HTMLElement, 'will-change', 'auto');
    }

    // 额外兜底：直接注入样式，确保 html 的 perspective 被强制清零（仅在弹窗生命周期内）
    let injectedStyle: HTMLStyleElement | null = null;
    try {
      injectedStyle = document.createElement('style');
      injectedStyle.id = 'qr-dialog-html-perspective-reset';
      injectedStyle.textContent = `html{perspective:none !important;} #dialog-portal-root{top:0 !important;left:0 !important;transform:none !important;}`;
      document.head.appendChild(injectedStyle);
    } catch {}

    // 多时机重复校正（本地闭包版），覆盖晚到样式与异步布局
    const multiRectFix = () => {
      const vw2 = window.innerWidth, vh2 = window.innerHeight;
      const ew2 = el.offsetWidth || 0, eh2 = el.offsetHeight || 0;
      const min2 = 8;
      const r2 = el.getBoundingClientRect();
      let adjustX = 0, adjustY = 0;
      if (r2.left < min2) adjustX = min2 - r2.left;
      else if (r2.right > vw2 - min2) adjustX = (vw2 - min2) - r2.right;
      if (r2.top < min2) adjustY = min2 - r2.top;
      else if (r2.bottom > vh2 - min2) adjustY = (vh2 - min2) - r2.bottom;
      if (adjustX || adjustY) {
        const curLeft = parseFloat(getComputedStyle(el).left || '0');
        const curTop = parseFloat(getComputedStyle(el).top || '0');
        const newLeft = Math.max(min2, Math.min(curLeft + adjustX, Math.max(min2, vw2 - ew2 - min2)));
        const newTop = Math.max(min2, Math.min(curTop + adjustY, Math.max(min2, vh2 - eh2 - min2)));
        el.style.setProperty('left', `${Math.round(newLeft)}px`, 'important');
        el.style.setProperty('top', `${Math.round(newTop)}px`, 'important');
      }
    };
    setTimeout(multiRectFix, 0);
    requestAnimationFrame(multiRectFix);
    setTimeout(multiRectFix, 80);
    setTimeout(multiRectFix, 160);

    return () => {
      // 关闭弹窗时恢复原值
      for (const { node, prop, prev } of patched) {
        if (prev) node.style.setProperty(prop, prev);
        else node.style.removeProperty(prop);
      }
      if (injectedStyle && injectedStyle.parentNode) {
        injectedStyle.parentNode.removeChild(injectedStyle);
      }
    };
  }, [open, anchor]);




  // 标签页配置
  const tabs = useMemo(() => [
    {
      value: 'brand' as TabType,
      label: t('components.labels.品牌库'),
      icon: <Database className="h-4 w-4" />,
      description: '品牌资产和语料库内容',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      value: 'library' as TabType,
      label: t('components.labels.我的资料库'),
      icon: <Bookmark className="h-4 w-4" />,
      description: '个人收藏的资料内容',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      value: 'radar' as TabType,
      label: t('components.labels.全网雷达'),
      icon: <Radar className="h-4 w-4" />,
      description: '热点话题和雷达收藏',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ], [t]);

  // 加载数据
  const loadTabData = useCallback(async (tabType: TabType) => {
    setLoading(prev => ({ ...prev, [tabType]: true }));
    setError(null);

    try {
      let data: QuickReferenceItem[] = [];

      switch (tabType) {
        case 'brand':
          data = await quickReferenceDataService.getBrandItems();
          break;
        case 'library':
          data = await quickReferenceDataService.getLibraryItems();
          break;
        case 'radar':
          data = await quickReferenceDataService.getRadarItems();
          break;
      }

      setItems(prev => ({ ...prev, [tabType]: data }));
    } catch (err) {
      const errorMessage = `加载${tabs.find(t => t.value === tabType)?.label}数据失败`;
      setError(errorMessage);
      toast({
        title: t('components.labels.加载失败'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [tabType]: false }));
    }
  }, [tabs, toast, t]);

  // 搜索功能
  const filteredItems = useMemo(() => {
    const currentItems = items[activeTab];
    if (!searchQuery.trim()) return currentItems;

    const query = searchQuery.toLowerCase();
    return currentItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (item.summary && item.summary.toLowerCase().includes(query))
    );
  }, [items, activeTab, searchQuery]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    quickReferenceDataService.clearCache();
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  // 选择项目
  const handleItemSelect = useCallback((item: QuickReferenceItem) => {
    if (multiSelect) {
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else {
      onSelect(item.content);
      onOpenChange(false);
    }
  }, [multiSelect, onSelect, onOpenChange]);

  // 多选确认
  const handleMultiSelectConfirm = useCallback(() => {
    const selectedContents = Array.from(selectedItems)
      .map(id => items[activeTab].find(item => item.id === id)?.content)
      .filter(Boolean)
      .join('\n\n');

    if (selectedContents) {
      onSelect(selectedContents);
      onOpenChange(false);
    }
  }, [selectedItems, items, activeTab, onSelect, onOpenChange]);

  // 复制内容
  const handleCopyContent = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: t('components.labels.复制成功'),
        description: "内容已复制到剪贴板"
      });
    } catch (err) {
      toast({
        title: t('components.labels.复制失败'),
        description: "无法复制到剪贴板",
        variant: "destructive"
      });
    }
  }, [toast, t]);

  // 重置状态
  const resetState = useCallback(() => {
    setSearchQuery('');
    setSelectedItems(new Set());
    setError(null);
  }, []);

  // 初始化和标签页切换时加载数据
  useEffect(() => {
    if (open) {
      loadTabData(activeTab);
    }
  }, [open, activeTab, loadTabData]);

  // 对话框关闭时重置状态
  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  // 重置筛选（复制历史记录弹窗的函数）
  const resetFilters = () => {
    setSearchQuery('');
    setActiveTab('brand');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={(node) => { if (node) { /* @ts-ignore */ refs.setFloating(node); } }}
        data-anchored={!!anchor}
        className={cn(
          // 🎯 仅在存在锚点时启用“锚点定位”标识类，避免无锚点时回退到左上角
          !!anchor && "anchored-dialog custom-positioned",
          // BEM与增强类
          "dialog dialog__content dialog__content--quick-reference",
          "enhanced-quick-reference-dialog flex flex-col overflow-hidden",
          "backdrop-blur-xl bg-gradient-to-br from-background via-background/98 to-background/95",
          "border-2 border-border/60 shadow-[0_20px_40px_-8px_rgba(0,0,0,0.25)]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_-1px_0_0_rgba(0,0,0,0.1)]",
          "rounded-[24px] ring-1 ring-primary/10 ring-offset-1 ring-offset-background/80",
          "relative overflow-hidden"
        )}
        style={anchor ? { position: strategy as any, left: Math.round((x ?? (anchor?.x ?? 0))), top: Math.round((y ?? (anchor ? (anchor.y + (anchor.height ?? 0) + 12) : 0))), transform: 'none' } : undefined}
      >
        {/* 🎯 标题区 - 完全复制历史记录弹窗的结构 */}
        <DialogHeader style={{
          position: 'relative',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '24px',
          paddingTop: '32px',
          paddingLeft: '32px',
          paddingRight: '32px',
          backgroundColor: '#ffffff'
        }}>
          {/* 右上角关闭按钮 - 完全复制 */}
          <button
            onClick={() => onOpenChange(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <span style={{
              fontSize: '16px',
              color: '#64748b',
              fontWeight: '500'
            }}>×</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            {/* 左侧标题区域 */}
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground mb-3">
                <span className="text-foreground">🎯 快速引用</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-base leading-relaxed">
                <span className="text-muted-foreground">从品牌库、资料库、雷达收藏快速导入内容</span>
              </DialogDescription>
            </div>

            {/* 右侧搜索框 - 完全复制 */}
            <div className="w-full lg:w-80 xl:w-96 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                <Input
                  placeholder="🔍 搜索标题、内容或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={(e) => {
                    // 🚨 防止focus触发滚动 - 解决用户分析的15%概率根因
                    e.target.focus({ preventScroll: true });
                  }}
                  className={cn(
                    "pl-10 pr-4 h-10 text-sm",
                    "bg-background/60 backdrop-blur-sm",
                    "border border-border/40 hover:border-border/60",
                    "focus:border-primary/50 focus:bg-background/80",
                    "rounded-lg shadow-sm hover:shadow-md",
                    "transition-all duration-300",
                    "placeholder:text-muted-foreground/60"
                  )}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 🎯 内容区 - 完全复制历史记录弹窗的操作栏结构 */}
        <div style={{
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#fbfcfd',
          padding: '12px 32px'
        }}>
          {/* 所有操作按钮 - 完全复制布局结构 */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* 标签页选择器组 */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {/* 标签页 */}
              {tabs.map((tab, index) => (
                <div
                  key={tab.value}
                  style={{
                    height: '36px',
                    backgroundColor: activeTab === tab.value ? '#3b82f6' : '#f8fafc',
                    border: `1px solid ${activeTab === tab.value ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    color: activeTab === tab.value ? 'white' : '#1e293b',
                    fontSize: '12px',
                    fontWeight: '500',
                    minWidth: '100px',
                    maxWidth: '140px'
                  }}
                  onClick={() => setActiveTab(tab.value)}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.value) {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.value) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  <span style={{marginRight: '6px', fontSize: '12px'}}>{tab.icon}</span>
                  <span style={{
                    color: activeTab === tab.value ? 'white' : '#1e293b',
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {tab.label}
                  </span>
                </div>
              ))}

              {/* 刷新按钮 */}
              <div
                style={{
                  height: '36px',
                  backgroundColor: '#10b981',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: loading[activeTab] ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  opacity: loading[activeTab] ? 0.6 : 1
                }}
                onClick={handleRefresh}
                onMouseEnter={(e) => {
                  if (!loading[activeTab]) {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading[activeTab]) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <RefreshCw className={cn("h-3 w-3 mr-1", loading[activeTab] && "animate-spin")} style={{color: 'white'}} />
                <span style={{color: 'white', fontSize: '12px', fontWeight: '600'}}>刷新</span>
              </div>
            </div>

            {/* 统计信息和重置按钮组 - 完全复制 */}
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                height: '36px',
                display: 'flex',
                alignItems: 'center'
              }}>
                📊 共 {items[activeTab].length} 条
              </div>
              {filteredItems.length !== items[activeTab].length && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '6px 8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  🔍 筛选后 {filteredItems.length} 条
                </div>
              )}
              <button
                onClick={resetFilters}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <span style={{marginRight: '4px', fontSize: '12px'}}>↻</span>
                <span style={{color: '#374151', fontSize: '12px', fontWeight: '500'}}>重置</span>
              </button>
            </div>
          </div>
        </div>

        {/* 主内容列表 - 完全复制历史记录弹窗的结构 */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            backgroundColor: '#fafbfc',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px 32px',
              color: '#64748b',
              minHeight: '280px'
            }}>
              {/* 完全复制历史记录弹窗的空状态 */}
              <div style={{
                marginBottom: '24px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '72px',
                  marginBottom: '12px',
                  opacity: '0.8',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                }}>📝</div>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  opacity: '0.1',
                  zIndex: '-1'
                }}></div>
              </div>

              <div style={{
                maxWidth: '400px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {items[activeTab].length === 0 ? '🎯 暂无引用内容' : '🔍 没有符合条件的内容'}
                </div>
                <div style={{
                  fontSize: '15px',
                  color: '#64748b',
                  lineHeight: '1.6',
                  marginBottom: '6px'
                }}>
                  {items[activeTab].length === 0
                    ? `开始收集${tabs.find(t => t.value === activeTab)?.label}后，内容将在这里显示！`
                    : '请尝试调整搜索关键词来查看更多内容'}
                </div>
                {items[activeTab].length === 0 && (
                  <div style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    marginTop: '8px'
                  }}>
                    您的内容收藏从这里开始 ✨
                  </div>
                )}
              </div>

              {/* 装饰性元素 - 完全复制 */}
              <div style={{
                display: 'flex',
                gap: '6px',
                opacity: '0.3'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6'
                }}></div>
              </div>
            </div>
          ) : (
            <div style={{
              flex: 1,
              padding: '24px 32px',
              display: 'grid',
              gap: '16px'
            }}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => handleItemSelect(item)}
                >
                  {/* 记录头部信息 - 完全复制历史记录弹窗的结构 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        {/* 类型标签 */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#dbeafe',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe'
                        }}>
                          <span>🏷️</span>
                          {tabs.find(t => t.value === activeTab)?.label || activeTab}
                        </div>

                        {/* 来源标签 */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#374151',
                          border: '1px solid #d1d5db'
                        }}>
                          <span>📂</span>
                          {item.source || '未知来源'}
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 - 完全复制 */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      {multiSelect && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: '2px solid #e2e8f0',
                          backgroundColor: selectedItems.has(item.id) ? '#3b82f6' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {selectedItems.has(item.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyContent(item.content);
                        }}
                        style={{
                          height: '36px',
                          padding: '0 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(59, 130, 246, 0.3)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span>📋</span>
                        复制
                      </button>
                    </div>
                  </div>

                  {/* 内容标题 */}
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {item.title}
                  </div>

                  {/* 标签区域 */}
                  {item.tags && item.tags.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginBottom: '12px'
                    }}>
                      {item.tags.slice(0, 5).map((tag, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '2px 8px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#64748b',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          #{tag}
                        </div>
                      ))}
                      {item.tags.length > 5 && (
                        <div style={{
                          padding: '2px 8px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#64748b',
                          border: '1px solid #e2e8f0'
                        }}>
                          +{item.tags.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 记录内容预览 - 完全复制 */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    marginTop: '16px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#334155',
                      lineHeight: '1.6',
                      wordBreak: 'break-word'
                    }}>
                      {item.content.length > 200 ? (
                        <>
                          {item.content.slice(0, 200)}...
                          <div style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            backgroundColor: '#eff6ff',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe'
                          }}>
                            💡 点击复制按钮获取完整内容
                          </div>
                        </>
                      ) : (
                        item.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 多选模式的底部操作栏 - 完全复制历史记录弹窗的结构 */}
        {multiSelect && selectedItems.size > 0 && (
          <div style={{
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#64748b'
            }}>
              已选择 {selectedItems.size} 项
            </span>
            <div style={{display: 'flex', gap: '8px'}}>
              <button
                onClick={() => setSelectedItems(new Set())}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  backgroundColor: '#f8fafc',
                  color: '#374151',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                清除选择
              </button>
              <button
                onClick={handleMultiSelectConfirm}
                disabled={selectedItems.size === 0}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check className="h-4 w-4" />
                添加选中项
              </button>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}