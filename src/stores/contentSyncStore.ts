/**
 * 内容同步状态管理
 * 用于在不同页面间同步用户选择的内容（标题、版本、标签等）
 */

import i18n from '@/i18n';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 内容同步状态接口
export interface ContentSyncState {
  // 当前选择的内容
  selectedTitle: string;
  selectedVersion: 'A' | 'B' | null;
  selectedContent: string;
  selectedTags: string[];
  originalContent: string;
  platformId: string;
  
  // 版本内容
  versionA: {
    content: string;
    charCount: number;
    validation?: any;
  } | null;
  versionB: {
    content: string;
    charCount: number;
    validation?: any;
  } | null;
  
  // 标签操作历史
  tagHistory: {
    original: string[];
    modified: string[];
    added: string[];
    removed: string[];
  };
  
  // 同步状态
  lastUpdated: number;
  isContentReady: boolean;
}

// 内容同步操作接口
export interface ContentSyncActions {
  // 设置选择的标题
  setSelectedTitle: (title: string) => void;
  
  // 设置选择的版本
  setSelectedVersion: (version: 'A' | 'B' | null) => void;
  
  // 设置版本内容
  setVersionContent: (version: 'A' | 'B', content: string, charCount: number, validation?: any) => void;
  
  // 设置标签
  setTags: (tags: string[]) => void;
  
  // 添加标签
  addTag: (tag: string) => void;
  
  // 移除标签
  removeTag: (tag: string) => void;
  
  // 设置原始内容
  setOriginalContent: (content: string) => void;
  
  // 设置平台ID
  setPlatformId: (platformId: string) => void;
  
  // 获取当前选择的内容（用于批量转发）
  getCurrentContent: () => {
    title: string;
    content: string;
    tags: string[];
    platformId: string;
  };
  
  // 重置所有状态
  reset: () => void;
  
  // 标记内容已准备就绪
  markContentReady: () => void;
}

// 初始状态
const initialState: ContentSyncState = {
  selectedTitle: '',
  selectedVersion: null,
  selectedContent: '',
  selectedTags: [],
  originalContent: '',
  platformId: '',
  versionA: null,
  versionB: null,
  tagHistory: {
    original: [],
    modified: [],
    added: [],
    removed: []
  },
  lastUpdated: 0,
  isContentReady: false
};

// 创建内容同步store
export const useContentSyncStore = create<ContentSyncState & ContentSyncActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSelectedTitle: (title: string) => {
        set({
          selectedTitle: title,
          lastUpdated: Date.now()
        });
      },
      
      setSelectedVersion: (version: 'A' | 'B' | null) => {
        const state = get();
        let selectedContent = '';
        
        if (version === 'A' && state.versionA) {
          selectedContent = state.versionA.content;
        } else if (version === 'B' && state.versionB) {
          selectedContent = state.versionB.content;
        }
        
        set({
          selectedVersion: version,
          selectedContent,
          lastUpdated: Date.now()
        });
      },
      
      setVersionContent: (version: 'A' | 'B', content: string, charCount: number, validation?: any) => {
        const state = get();
        const versionData = { content, charCount, validation };
        
        if (version === 'A') {
          set({
            versionA: versionData,
            selectedContent: state.selectedVersion === 'A' ? content : state.selectedContent,
            lastUpdated: Date.now()
          });
        } else {
          set({
            versionB: versionData,
            selectedContent: state.selectedVersion === 'B' ? content : state.selectedContent,
            lastUpdated: Date.now()
          });
        }
      },
      
      setTags: (tags: string[]) => {
        const state = get();
        const added = tags.filter(tag => !state.tagHistory.original.includes(tag));
        const removed = state.tagHistory.original.filter(tag => !tags.includes(tag));
        
        set({
          selectedTags: tags,
          tagHistory: {
            ...state.tagHistory,
            modified: tags,
            added: [...state.tagHistory.added, ...added].filter((tag, index, arr) => arr.indexOf(tag) === index),
            removed: [...state.tagHistory.removed, ...removed].filter((tag, index, arr) => arr.indexOf(tag) === index)
          },
          lastUpdated: Date.now()
        });
      },
      
      addTag: (tag: string) => {
        const state = get();
        if (!state.selectedTags.includes(tag)) {
          const newTags = [...state.selectedTags, tag];
          get().setTags(newTags);
        }
      },
      
      removeTag: (tag: string) => {
        const state = get();
        const newTags = state.selectedTags.filter(t => t !== tag);
        get().setTags(newTags);
      },
      
      setOriginalContent: (content: string) => {
        set({
          originalContent: content,
          lastUpdated: Date.now()
        });
      },
      
      setPlatformId: (platformId: string) => {
        set({
          platformId,
          lastUpdated: Date.now()
        });
      },
      
      getCurrentContent: () => {
        const state = get();
        return {
          title: state.selectedTitle,
          content: state.selectedContent,
          tags: state.selectedTags,
          platformId: state.platformId
        };
      },
      
      markContentReady: () => {
        set({
          isContentReady: true,
          lastUpdated: Date.now()
        });
      },
      
      reset: () => {
        set({
          ...initialState,
          lastUpdated: Date.now()
        });
      }
    }),
    {
      name: 'content-sync-storage',
      // 只持久化必要的状态，避免存储过多数据
      partialize: (state) => ({
        selectedTitle: state.selectedTitle,
        selectedVersion: state.selectedVersion,
        selectedContent: state.selectedContent,
        selectedTags: state.selectedTags,
        originalContent: state.originalContent,
        platformId: state.platformId,
        versionA: state.versionA,
        versionB: state.versionB,
        tagHistory: state.tagHistory,
        lastUpdated: state.lastUpdated,
        isContentReady: state.isContentReady
      })
    }
  )
);

// 内容同步工具函数
export const contentSyncUtils = {
  /**
   * 检查内容是否已准备就绪
   */
  isContentReady: (state: ContentSyncState): boolean => {
    return !!(
      state.selectedTitle &&
      state.selectedContent &&
      state.selectedVersion &&
      state.isContentReady
    );
  },
  
  /**
   * 获取内容摘要
   */
  getContentSummary: (state: ContentSyncState): string => {
    const { selectedTitle, selectedContent, selectedTags } = state;
    const contentPreview = selectedContent.length > 50 
      ? selectedContent.substring(0, 50) + '...' 
      : selectedContent;
    
    return `标题: ${selectedTitle}\n内容: ${contentPreview}\n标签: ${selectedTags.join(', ')}`;
  },
  
  /**
   * 验证内容完整性
   */
  validateContent: (state: ContentSyncState): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!state.selectedTitle) {
      errors.push(i18n.t('common.errors.未选择标题'));
    }
    
    if (!state.selectedContent) {
      errors.push(i18n.t('common.errors.未选择内容版本'));
    }
    
    if (!state.selectedVersion) {
      errors.push(i18n.t('common.errors.未指定版本'));
    }
    
    if (state.selectedTags.length === 0) {
      errors.push(i18n.t('common.errors.未设置标签'));
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
