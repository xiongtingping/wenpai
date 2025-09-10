/**
 * 快速引用选择器组件
 * 基于视窗居中的弹窗实现，完全绕过外部库干扰
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AtSign } from "lucide-react";
import { quickReferenceDataService, QuickReferenceItem } from '@/services/quickReferenceDataService';

export type TabType = 'brand' | 'library' | 'radar';

interface QuickReferenceSelectorProps {
  onSelect: (content: string) => void;
  className?: string;
  multiSelect?: boolean;
}

/**
 * 快速引用选择器组件
 */
export function QuickReferenceSelector({
  onSelect,
  className,
  multiSelect = false
}: QuickReferenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('brand');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<QuickReferenceItem[]>([]);

  // 重置状态
  const resetState = () => {
    setSearchQuery('');
    setSelectedItems([]);
  };

  // 🚨 超强硬独立弹窗 - 手动创建DOM元素
  const IndependentModal = () => {
    useEffect(() => {
      if (!isOpen) return;

      console.log('🚀 开始创建快速引用弹窗...');

      // 🚨 强制获取当前实时的视窗信息
      const getViewportInfo = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        
        // 计算可见区域的绝对位置
        const visibleTop = scrollY;
        const visibleLeft = scrollX;
        const visibleBottom = scrollY + viewportHeight;
        const visibleRight = scrollX + viewportWidth;
        
        return {
          viewportWidth,
          viewportHeight,
          scrollX,
          scrollY,
          visibleTop,
          visibleLeft,
          visibleBottom,
          visibleRight,
          centerX: scrollX + viewportWidth / 2,
          centerY: scrollY + viewportHeight / 2
        };
      };

      let viewportInfo = getViewportInfo();
      console.log('🔍 当前视窗信息：', viewportInfo);

      // 创建遮罩层 - 覆盖整个可见视窗区域
      const overlay = document.createElement('div');
      overlay.id = 'quick-ref-overlay';
      overlay.style.cssText = `
        position: absolute !important;
        top: ${viewportInfo.visibleTop}px !important;
        left: ${viewportInfo.visibleLeft}px !important;
        width: ${viewportInfo.viewportWidth}px !important;
        height: ${viewportInfo.viewportHeight}px !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(4px) !important;
        z-index: 2147483647 !important;
        margin: 0 !important;
        padding: 0 !important;
      `;

      // 创建弹窗内容 - 基于当前可见区域的绝对中心
      const modal = document.createElement('div');
      modal.id = 'quick-ref-content';
      modal.style.cssText = `
        position: absolute !important;
        top: ${viewportInfo.centerY}px !important;
        left: ${viewportInfo.centerX}px !important;
        transform: translate(-50%, -50%) !important;
        background-color: white !important;
        border-radius: 12px !important;
        padding: 32px !important;
        width: 600px !important;
        max-width: 90vw !important;
        max-height: 80vh !important;
        z-index: 2147483648 !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        overflow: hidden !important;
      `;

      console.log('📐 弹窗定位：', {
        遮罩顶部: viewportInfo.visibleTop,
        遮罩左侧: viewportInfo.visibleLeft,
        弹窗中心X: viewportInfo.centerX,
        弹窗中心Y: viewportInfo.centerY
      });

      modal.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; max-height: 70vh;">
          <!-- 头部 -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="font-size: 24px; font-weight: bold; margin: 0; display: flex; align-items: center; gap: 12px; color: #1f2937;">
              🔗 快速引用
            </h2>
            <div style="display: flex; gap: 8px;">
              <button id="refresh-data" style="padding: 8px; border: none; border-radius: 6px; background-color: #f3f4f6; cursor: pointer;" title="刷新数据">
                🔄
              </button>
              <button id="modal-close" style="padding: 8px; border: none; border-radius: 6px; background-color: #fee2e2; color: #dc2626; cursor: pointer; font-size: 16px;">
                ✕
              </button>
            </div>
          </div>

          <!-- 搜索栏 -->
          <div style="position: relative; margin-bottom: 24px;">
            <input
              id="search-input"
              type="text"
              placeholder="搜索内容、标题或标签..."
              style="width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none;"
            />
            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;">🔍</span>
          </div>

          <!-- 标签页 -->
          <div id="tabs-container" style="margin-bottom: 24px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; background-color: #f9fafb; border-radius: 8px; padding: 4px;">
              <button id="tab-brand" class="tab-button active" data-tab="brand" style="padding: 12px; border: none; border-radius: 6px; background-color: white; cursor: pointer; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                📦 品牌库
              </button>
              <button id="tab-library" class="tab-button" data-tab="library" style="padding: 12px; border: none; border-radius: 6px; background-color: transparent; cursor: pointer; color: #6b7280;">
                📚 我的资料库
              </button>
              <button id="tab-radar" class="tab-button" data-tab="radar" style="padding: 12px; border: none; border-radius: 6px; background-color: transparent; cursor: pointer; color: #6b7280;">
                📡 全网雷达
              </button>
            </div>
          </div>

          <!-- 内容区域 -->
          <div id="content-area" style="flex: 1; min-height: 0; overflow-y: auto; margin-bottom: 24px;">
            <div id="loading-indicator" style="display: flex; align-items: center; justify-content: center; height: 200px;">
              <div style="display: flex; align-items: center; gap: 12px; color: #6b7280;">
                <div style="width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top: 2px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <span>加载中...</span>
              </div>
            </div>
            <div id="items-container" style="display: none; gap: 12px; flex-direction: column;"></div>
            <div id="empty-state" style="display: none; text-align: center; padding: 40px; color: #6b7280;">
              <p>暂无数据</p>
            </div>
          </div>

          <!-- 底部操作栏 -->
          <div id="multi-select-footer" style="display: none; padding-top: 16px; border-top: 1px solid #e5e7eb; justify-content: space-between; align-items: center;">
            <span id="selection-count" style="color: #6b7280; font-size: 14px;">已选择 0 项</span>
            <div style="display: flex; gap: 12px;">
              <button id="clear-selection" style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background-color: white; color: #6b7280; cursor: pointer; font-size: 14px;">
                清空选择
              </button>
              <button id="confirm-selection" style="padding: 8px 16px; border: none; border-radius: 6px; background-color: #3b82f6; color: white; cursor: pointer; font-size: 14px; font-weight: 500;">
                确认选择
              </button>
            </div>
          </div>
        </div>

        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .tab-button.active {
            background-color: white !important;
            color: #1f2937 !important;
            font-weight: 500 !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          }
        </style>
      `;

      // 添加到 body
      document.body.appendChild(overlay);
      document.body.appendChild(modal);

      console.log('✅ 快速引用弹窗已创建并添加到body');

      // 🚨 实时监听滚动，确保弹窗始终在可见区域中心
      const updatePosition = () => {
        const newViewportInfo = getViewportInfo();
        
        // 更新遮罩层位置
        overlay.style.top = `${newViewportInfo.visibleTop}px`;
        overlay.style.left = `${newViewportInfo.visibleLeft}px`;
        overlay.style.width = `${newViewportInfo.viewportWidth}px`;
        overlay.style.height = `${newViewportInfo.viewportHeight}px`;
        
        // 更新弹窗位置
        modal.style.top = `${newViewportInfo.centerY}px`;
        modal.style.left = `${newViewportInfo.centerX}px`;
      };

      // 监听滚动事件
      const scrollHandler = () => {
        requestAnimationFrame(updatePosition);
      };
      
      window.addEventListener('scroll', scrollHandler, { passive: true });
      window.addEventListener('resize', scrollHandler, { passive: true });

      // 数据管理状态
      let currentTabType: TabType = activeTab;
      let currentSearchQuery = '';
      let currentItems: QuickReferenceItem[] = [];
      let currentSelectedItems: QuickReferenceItem[] = [];

      // UI 元素引用
      const loadingIndicator = modal.querySelector('#loading-indicator') as HTMLElement;
      const itemsContainer = modal.querySelector('#items-container') as HTMLElement;
      const emptyState = modal.querySelector('#empty-state') as HTMLElement;
      const searchInput = modal.querySelector('#search-input') as HTMLInputElement;
      const tabButtons = modal.querySelectorAll('.tab-button');
      const multiSelectFooter = modal.querySelector('#multi-select-footer') as HTMLElement;
      const selectionCount = modal.querySelector('#selection-count') as HTMLElement;

      // 显示加载状态
      const showLoading = () => {
        loadingIndicator.style.display = 'flex';
        itemsContainer.style.display = 'none';
        emptyState.style.display = 'none';
      };

      // 显示内容
      const showContent = (items: QuickReferenceItem[]) => {
        loadingIndicator.style.display = 'none';
        if (items.length > 0) {
          itemsContainer.style.display = 'flex';
          emptyState.style.display = 'none';
          renderItems(items);
        } else {
          itemsContainer.style.display = 'none';
          emptyState.style.display = 'block';
        }
      };

      // 渲染项目列表
      const renderItems = (items: QuickReferenceItem[]) => {
        itemsContainer.innerHTML = '';
        items.forEach((item) => {
          const itemElement = document.createElement('div');
          itemElement.className = 'quick-ref-item';
          itemElement.style.cssText = `
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
          `;
          
          const isSelected = currentSelectedItems.some(s => s.id === item.id);
          if (isSelected) {
            itemElement.style.borderColor = '#3b82f6';
            itemElement.style.backgroundColor = '#eff6ff';
          }

          const typeColor = item.type === 'brand' ? '#3b82f6' : item.type === 'library' ? '#10b981' : '#8b5cf6';
          const typeLabel = item.type === 'brand' ? '品牌库' : item.type === 'library' ? '资料库' : '雷达收藏';
          const formatIcon = item.format === 'link' ? '🔗' : item.format === 'image' ? '🖼️' : '📄';

          itemElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                ${multiSelect ? `<input type="checkbox" ${isSelected ? 'checked' : ''} style="margin: 0;">` : ''}
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${formatIcon}</span>
                  <h4 style="margin: 0; font-size: 14px; font-weight: 500; color: #1f2937;">${item.title}</h4>
                </div>
              </div>
              <span style="background: ${typeColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                ${typeLabel}
              </span>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.4;">
              ${item.summary || item.content.substring(0, 100) + '...'}
            </p>
            <div style="display: flex; justify-content: between; align-items: center; gap: 8px;">
              <div style="display: flex; flex-wrap: gap: 4px; flex: 1;">
                ${item.tags.slice(0, 3).map(tag => 
                  `<span style="background: #f3f4f6; color: #4b5563; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
                    ${tag}
                  </span>`
                ).join('')}
                ${item.tags.length > 3 ? `<span style="color: #9ca3af; font-size: 11px;">+${item.tags.length - 3}</span>` : ''}
              </div>
              <span style="color: #9ca3af; font-size: 11px;">
                ${new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          `;

          itemElement.addEventListener('click', () => handleItemClick(item));
          itemElement.addEventListener('mouseenter', () => {
            if (!isSelected) {
              itemElement.style.backgroundColor = '#f9fafb';
              itemElement.style.borderColor = '#d1d5db';
            }
          });
          itemElement.addEventListener('mouseleave', () => {
            if (!isSelected) {
              itemElement.style.backgroundColor = 'white';
              itemElement.style.borderColor = '#e5e7eb';
            }
          });

          itemsContainer.appendChild(itemElement);
        });
      };

      // 处理项目点击
      const handleItemClick = (item: QuickReferenceItem) => {
        if (multiSelect) {
          const existingIndex = currentSelectedItems.findIndex(s => s.id === item.id);
          if (existingIndex >= 0) {
            currentSelectedItems.splice(existingIndex, 1);
          } else {
            currentSelectedItems.push(item);
          }
          updateMultiSelectUI();
          renderItems(currentItems); // 重新渲染以更新选中状态
        } else {
          onSelect(item.content);
          handleClose();
        }
      };

      // 更新多选UI
      const updateMultiSelectUI = () => {
        if (multiSelect) {
          if (currentSelectedItems.length > 0) {
            multiSelectFooter.style.display = 'flex';
            selectionCount.textContent = `已选择 ${currentSelectedItems.length} 项`;
          } else {
            multiSelectFooter.style.display = 'none';
          }
        }
      };

      // 加载数据函数
      const loadTabData = async (tabType: TabType) => {
        showLoading();
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
          
          currentItems = data;
          showContent(data);
        } catch (error) {
          console.error(`加载${tabType}数据失败:`, error);
          showContent([]);
        }
      };

      // 搜索功能
      const performSearch = async (query: string) => {
        if (!query.trim()) {
          showContent(currentItems);
          return;
        }

        try {
          const results = await quickReferenceDataService.searchItems(query);
          showContent(results);
        } catch (error) {
          console.error('搜索失败:', error);
          showContent([]);
        }
      };

      // 事件处理
      const handleClose = () => {
        try {
          window.removeEventListener('scroll', scrollHandler);
          window.removeEventListener('resize', scrollHandler);
          
          if (document.body.contains(overlay)) document.body.removeChild(overlay);
          if (document.body.contains(modal)) document.body.removeChild(modal);
          setIsOpen(false);
          resetState();
          console.log('✅ 快速引用弹窗已关闭');
        } catch (e) {
          console.warn('关闭弹窗时出错:', e);
        }
      };

      // 多选确认
      const handleMultiSelectConfirm = () => {
        if (currentSelectedItems.length > 0) {
          const combinedContent = currentSelectedItems
            .map(item => `[${item.title}]\n${item.content}`)
            .join('\n\n');
          onSelect(combinedContent);
          handleClose();
        }
      };

      // 绑定事件
      overlay.addEventListener('click', handleClose);
      modal.querySelector('#modal-close')?.addEventListener('click', handleClose);
      modal.querySelector('#refresh-data')?.addEventListener('click', () => {
        quickReferenceDataService.clearCache();
        loadTabData(currentTabType);
      });

      // 标签页切换
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabType = button.getAttribute('data-tab') as TabType;
          if (tabType && tabType !== currentTabType) {
            // 更新标签页UI
            tabButtons.forEach(b => {
              b.classList.remove('active');
              b.style.backgroundColor = 'transparent';
              b.style.color = '#6b7280';
            });
            button.classList.add('active');
            
            currentTabType = tabType;
            setActiveTab(tabType);
            loadTabData(tabType);
          }
        });
      });

      // 搜索功能
      searchInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        currentSearchQuery = target.value;
        setSearchQuery(currentSearchQuery);
        
        // 防抖搜索
        clearTimeout((searchInput as any).searchTimeout);
        (searchInput as any).searchTimeout = setTimeout(() => {
          if (currentSearchQuery.trim()) {
            performSearch(currentSearchQuery);
          } else {
            showContent(currentItems);
          }
        }, 300);
      });

      // 多选功能
      if (multiSelect) {
        modal.querySelector('#clear-selection')?.addEventListener('click', () => {
          currentSelectedItems = [];
          setSelectedItems([]);
          updateMultiSelectUI();
          renderItems(currentItems);
        });

        modal.querySelector('#confirm-selection')?.addEventListener('click', handleMultiSelectConfirm);
      } else {
        multiSelectFooter.style.display = 'none';
      }

      // 初始加载
      loadTabData(currentTabType);

      // 清理函数
      return () => {
        try {
          window.removeEventListener('scroll', scrollHandler);
          window.removeEventListener('resize', scrollHandler);
          
          if (document.body.contains(overlay)) document.body.removeChild(overlay);
          if (document.body.contains(modal)) document.body.removeChild(modal);
          console.log('🧹 快速引用弹窗已清理，事件监听器已移除');
        } catch (e) {
          console.warn('清理弹窗元素时出错:', e);
        }
      };
    }, [isOpen]);

    return null; // 直接返回null，因为我们用useEffect手动创建DOM
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className={`${className} bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm`}
        onClick={() => setIsOpen(true)}
      >
        <AtSign className="h-4 w-4 mr-2" />
        快速引用
      </Button>
      
      {/* 独立弹窗 - 完全绕过外部干扰 */}
      <IndependentModal />
    </div>
  );
}

export default QuickReferenceSelector;