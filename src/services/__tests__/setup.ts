/**
 * Jest 测试环境 Setup - Node环境
 * 用于数据管理器集成测试
 */

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

global.localStorage = localStorageMock as any;

// Mock console methods to avoid noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock logger to avoid import.meta issues
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock Supabase service
jest.mock('@/services/supabaseDataService', () => ({
  createDataService: jest.fn(() => ({
    findMany: jest.fn().mockResolvedValue({ data: [], error: null }),
    create: jest.fn().mockResolvedValue({ data: {}, error: null }),
    update: jest.fn().mockResolvedValue({ data: {}, error: null }),
    delete: jest.fn().mockResolvedValue({ data: {}, error: null })
  })),
  TABLE_NAMES: {
    USER_BRAND_CORPUS: 'user_brand_corpus'
  }
}));

// Mock Zustand store
jest.mock('@/stores/unified-state-store', () => ({
  useUnifiedStore: {
    getState: jest.fn(() => ({
      user: null,
      setUser: jest.fn(),
      updateUserSubscription: jest.fn()
    }))
  }
}));

// Mock userStateSyncCoordinator
jest.mock('@/services/userStateSyncCoordinator', () => ({
  userStateSyncCoordinator: {
    syncOnLogin: jest.fn().mockResolvedValue({
      success: true,
      syncedLayers: ['Context', 'Store', 'SecureService']
    }),
    diagnoseInconsistency: jest.fn().mockResolvedValue({
      contextUser: null,
      storeUser: null,
      secureUser: null,
      isConsistent: true,
      differences: []
    })
  }
}));
