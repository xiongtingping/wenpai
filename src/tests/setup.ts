/**
 * Jest测试环境设置
 */

// 设置全局fetch mock
global.fetch = jest.fn();

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.BUFPAY_APP_SECRET = 'test-secret';

// Mock console.warn to reduce test noise
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  // Suppress specific warnings in tests
  if (typeof args[0] === 'string' && args[0].includes('客户端不应')) {
    return;
  }
  originalWarn(...args);
};

// Mock window object for browser APIs
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://www.wenpai.xyz',
    origin: 'https://www.wenpai.xyz'
  },
  writable: true
});

// Setup cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});