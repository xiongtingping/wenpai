/**
 * AI内容适配器 - 状态管理Provider
 * 统一管理页面状态，消除prop drilling
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  AdaptPageState, 
  AdaptPageEvents, 
  AdaptPageProviderProps,
  GenerationRequest,
  ForwardingOptions,
  PlatformSettings,
  GeneratedContent,
  BatchForwardingProgress
} from './types';

// ========================================================================================
// 初始状态
// ========================================================================================

const initialState: AdaptPageState = {
  // 输入状态
  inputContent: '',
  selectedPlatforms: [],
  selectedContentForm: 'auto',
  selectedContentScheme: 'auto',
  selectedAIModel: 'gpt-4',
  customPrompt: '',
  brandLibraryEnabled: false,
  
  // 平台设置
  platformSettings: {},
  
  // 生成状态
  isGenerating: false,
  generationProgress: 0,
  results: [],
  
  // 转发状态
  forwardingOptions: {
    mode: 'manual',
    platforms: [],
    batchMode: false,
    confirmEach: true,
    delayBetween: 1000,
  },
  forwardingProgress: {
    total: 0,
    completed: 0,
    status: 'idle',
    results: [],
  },
  isForwarding: false,
  
  // UI状态
  expandedPlatforms: new Set(),
  showAdvancedSettings: false,
  activeTab: 'content',
  
  // 历史记录
  shareHistory: [],
};

// ========================================================================================
// Action类型
// ========================================================================================

type AdaptPageAction =
  | { type: 'SET_INPUT_CONTENT'; payload: string }
  | { type: 'TOGGLE_PLATFORM'; payload: { platformId: string; enabled: boolean } }
  | { type: 'SET_PLATFORM_SETTINGS'; payload: { platformId: string; settings: PlatformSettings } }
  | { type: 'SET_CONTENT_FORM'; payload: string }
  | { type: 'SET_CONTENT_SCHEME'; payload: string }
  | { type: 'SET_AI_MODEL'; payload: string }
  | { type: 'SET_CUSTOM_PROMPT'; payload: string }
  | { type: 'TOGGLE_BRAND_LIBRARY'; payload: boolean }
  | { type: 'SET_GENERATION_STATE'; payload: { isGenerating: boolean; progress?: number } }
  | { type: 'SET_RESULTS'; payload: GeneratedContent[] }
  | { type: 'ADD_RESULT'; payload: GeneratedContent }
  | { type: 'UPDATE_RESULT'; payload: { platformId: string; content: Partial<GeneratedContent> } }
  | { type: 'SET_FORWARDING_OPTIONS'; payload: ForwardingOptions }
  | { type: 'SET_FORWARDING_PROGRESS'; payload: BatchForwardingProgress }
  | { type: 'SET_FORWARDING_STATE'; payload: boolean }
  | { type: 'TOGGLE_PLATFORM_EXPANSION'; payload: string }
  | { type: 'SET_ADVANCED_SETTINGS'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'ADD_SHARE_HISTORY'; payload: any }
  | { type: 'LOAD_SHARE_HISTORY'; payload: any[] }
  | { type: 'RESET_STATE' };

// ========================================================================================
// Reducer
// ========================================================================================

function adaptPageReducer(state: AdaptPageState, action: AdaptPageAction): AdaptPageState {
  switch (action.type) {
    case 'SET_INPUT_CONTENT':
      return { ...state, inputContent: action.payload };
      
    case 'TOGGLE_PLATFORM':
      const { platformId, enabled } = action.payload;
      const selectedPlatforms = enabled
        ? [...state.selectedPlatforms, platformId]
        : state.selectedPlatforms.filter(id => id !== platformId);
      return { ...state, selectedPlatforms };
      
    case 'SET_PLATFORM_SETTINGS':
      return {
        ...state,
        platformSettings: {
          ...state.platformSettings,
          [action.payload.platformId]: action.payload.settings,
        },
      };
      
    case 'SET_CONTENT_FORM':
      return { ...state, selectedContentForm: action.payload };
      
    case 'SET_CONTENT_SCHEME':
      return { ...state, selectedContentScheme: action.payload };
      
    case 'SET_AI_MODEL':
      return { ...state, selectedAIModel: action.payload };
      
    case 'SET_CUSTOM_PROMPT':
      return { ...state, customPrompt: action.payload };
      
    case 'TOGGLE_BRAND_LIBRARY':
      return { ...state, brandLibraryEnabled: action.payload };
      
    case 'SET_GENERATION_STATE':
      return {
        ...state,
        isGenerating: action.payload.isGenerating,
        generationProgress: action.payload.progress ?? state.generationProgress,
      };
      
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
      
    case 'ADD_RESULT':
      return { ...state, results: [...state.results, action.payload] };
      
    case 'UPDATE_RESULT':
      return {
        ...state,
        results: state.results.map(result =>
          result.platformId === action.payload.platformId
            ? { ...result, ...action.payload.content }
            : result
        ),
      };
      
    case 'SET_FORWARDING_OPTIONS':
      return { ...state, forwardingOptions: action.payload };
      
    case 'SET_FORWARDING_PROGRESS':
      return { ...state, forwardingProgress: action.payload };
      
    case 'SET_FORWARDING_STATE':
      return { ...state, isForwarding: action.payload };
      
    case 'TOGGLE_PLATFORM_EXPANSION':
      const expandedPlatforms = new Set(state.expandedPlatforms);
      if (expandedPlatforms.has(action.payload)) {
        expandedPlatforms.delete(action.payload);
      } else {
        expandedPlatforms.add(action.payload);
      }
      return { ...state, expandedPlatforms };
      
    case 'SET_ADVANCED_SETTINGS':
      return { ...state, showAdvancedSettings: action.payload };
      
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
      
    case 'ADD_SHARE_HISTORY':
      return {
        ...state,
        shareHistory: [action.payload, ...state.shareHistory.slice(0, 99)], // 保留最近100条
      };
      
    case 'LOAD_SHARE_HISTORY':
      return { ...state, shareHistory: action.payload };
      
    case 'RESET_STATE':
      return { ...initialState, shareHistory: state.shareHistory };
      
    default:
      return state;
  }
}

// ========================================================================================
// Context
// ========================================================================================

interface AdaptPageContextValue {
  state: AdaptPageState;
  events: AdaptPageEvents;
}

const AdaptPageContext = createContext<AdaptPageContextValue | null>(null);

// ========================================================================================
// Provider组件
// ========================================================================================

export function AdaptPageProvider({ children, initialState: customInitialState }: AdaptPageProviderProps) {
  const [state, dispatch] = useReducer(adaptPageReducer, {
    ...initialState,
    ...customInitialState,
  });

  // ========================================================================================
  // 事件处理函数
  // ========================================================================================

  const events: AdaptPageEvents = {
    onContentChange: useCallback((content: string) => {
      dispatch({ type: 'SET_INPUT_CONTENT', payload: content });
    }, []),

    onPlatformToggle: useCallback((platformId: string, enabled: boolean) => {
      dispatch({ type: 'TOGGLE_PLATFORM', payload: { platformId, enabled } });
    }, []),

    onPlatformSettingsChange: useCallback((platformId: string, settings: PlatformSettings) => {
      dispatch({ type: 'SET_PLATFORM_SETTINGS', payload: { platformId, settings } });
    }, []),

    onContentFormChange: useCallback((formId: string) => {
      dispatch({ type: 'SET_CONTENT_FORM', payload: formId });
    }, []),

    onContentSchemeChange: useCallback((schemeId: string) => {
      dispatch({ type: 'SET_CONTENT_SCHEME', payload: schemeId });
    }, []),

    onAIModelChange: useCallback((modelId: string) => {
      dispatch({ type: 'SET_AI_MODEL', payload: modelId });
    }, []),

    onCustomPromptChange: useCallback((prompt: string) => {
      dispatch({ type: 'SET_CUSTOM_PROMPT', payload: prompt });
    }, []),

    onBrandLibraryToggle: useCallback((enabled: boolean) => {
      dispatch({ type: 'TOGGLE_BRAND_LIBRARY', payload: enabled });
    }, []),

    onGenerate: useCallback(async (request: GenerationRequest) => {
      // 这里将实现生成逻辑
      console.log('Generate request:', request);
    }, []),

    onRegenerate: useCallback(async (platformId: string) => {
      // 这里将实现重新生成逻辑
      console.log('Regenerate for platform:', platformId);
    }, []),

    onForward: useCallback(async (platformId: string, options?: ForwardingOptions) => {
      // 这里将实现单个转发逻辑
      console.log('Forward to platform:', platformId, options);
    }, []),

    onBatchForward: useCallback(async (platforms: string[], options?: ForwardingOptions) => {
      // 这里将实现批量转发逻辑
      console.log('Batch forward to platforms:', platforms, options);
    }, []),

    onForwardingCancel: useCallback(() => {
      dispatch({ type: 'SET_FORWARDING_STATE', payload: false });
      dispatch({
        type: 'SET_FORWARDING_PROGRESS',
        payload: { ...state.forwardingProgress, status: 'cancelled' },
      });
    }, [state.forwardingProgress]),
  };

  // ========================================================================================
  // 副作用
  // ========================================================================================

  // 加载历史记录
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('shareHistory');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        dispatch({ type: 'LOAD_SHARE_HISTORY', payload: history });
      }
    } catch (error) {
      console.error('Failed to load share history:', error);
    }
  }, []);

  // 保存历史记录
  useEffect(() => {
    if (state.shareHistory.length > 0) {
      try {
        localStorage.setItem('shareHistory', JSON.stringify(state.shareHistory));
      } catch (error) {
        console.error('Failed to save share history:', error);
      }
    }
  }, [state.shareHistory]);

  return (
    <AdaptPageContext.Provider value={{ state, events }}>
      {children}
    </AdaptPageContext.Provider>
  );
}

// ========================================================================================
// Hook
// ========================================================================================

export function useAdaptPage() {
  const context = useContext(AdaptPageContext);
  if (!context) {
    throw new Error('useAdaptPage must be used within AdaptPageProvider');
  }
  return context;
}

export default AdaptPageProvider;
