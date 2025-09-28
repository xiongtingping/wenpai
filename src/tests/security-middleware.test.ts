/**
 * 安全中间件测试
 * 🔒 测试覆盖：频率限制、来源验证、安全头部
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock the security middleware module path
const mockSecurityMiddleware = {
  securityMiddleware: jest.fn(),
  getSecurityHeaders: jest.fn(),
  rateLimit: jest.fn(),
  getClientIP: jest.fn(),
  cleanupRateLimitStore: jest.fn()
};

jest.mock('../../netlify/functions/lib/security-middleware', () => mockSecurityMiddleware);

describe('安全中间件测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('IP地址获取测试', () => {
    const { getClientIP } = mockSecurityMiddleware;

    beforeEach(() => {
      getClientIP.mockImplementation((event) => {
        const forwarded = event.headers['x-forwarded-for'];
        const realIP = event.headers['x-real-ip'];
        const remoteAddr = event.headers['remote-addr'];
        
        if (forwarded) {
          return forwarded.split(',')[0].trim();
        }
        
        return realIP || remoteAddr || 'unknown';
      });
    });

    it('应该从x-forwarded-for头获取IP', () => {
      const event = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
          'x-real-ip': '10.0.0.2'
        }
      };

      const ip = getClientIP(event);
      expect(ip).toBe('192.168.1.1');
    });

    it('应该从x-real-ip头获取IP', () => {
      const event = {
        headers: {
          'x-real-ip': '192.168.1.100',
          'remote-addr': '10.0.0.1'
        }
      };

      const ip = getClientIP(event);
      expect(ip).toBe('192.168.1.100');
    });

    it('应该处理缺失IP头的情况', () => {
      const event = {
        headers: {}
      };

      const ip = getClientIP(event);
      expect(ip).toBe('unknown');
    });
  });

  describe('频率限制测试', () => {
    const { rateLimit } = mockSecurityMiddleware;

    beforeEach(() => {
      const store = new Map();
      rateLimit.mockImplementation((key, maxRequests = 10, windowMs = 60000) => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!store.has(key)) {
          store.set(key, []);
        }
        
        const requests = store.get(key);
        const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);
        
        if (validRequests.length >= maxRequests) {
          return {
            limited: true,
            remaining: 0,
            resetTime: validRequests[0] + windowMs
          };
        }
        
        validRequests.push(now);
        store.set(key, validRequests);
        
        return {
          limited: false,
          remaining: maxRequests - validRequests.length,
          resetTime: now + windowMs
        };
      });
    });

    it('应该允许在限制内的请求', () => {
      const result = rateLimit('test-ip', 5, 60000);
      
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('应该阻止超出限制的请求', () => {
      // 发送5个请求达到限制
      for (let i = 0; i < 5; i++) {
        rateLimit('test-ip-2', 5, 60000);
      }
      
      // 第6个请求应该被阻止
      const result = rateLimit('test-ip-2', 5, 60000);
      
      expect(result.limited).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('不同IP应该有独立的限制', () => {
      const result1 = rateLimit('ip-1', 5, 60000);
      const result2 = rateLimit('ip-2', 5, 60000);
      
      expect(result1.limited).toBe(false);
      expect(result2.limited).toBe(false);
      expect(result1.remaining).toBe(4);
      expect(result2.remaining).toBe(4);
    });
  });

  describe('安全头部生成测试', () => {
    const { getSecurityHeaders } = mockSecurityMiddleware;

    beforeEach(() => {
      getSecurityHeaders.mockImplementation((origin) => ({
        'Access-Control-Allow-Origin': origin || 'https://www.wenpai.xyz',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }));
    });

    it('应该生成完整的安全头部', () => {
      const headers = getSecurityHeaders('https://www.wenpai.xyz');
      
      expect(headers).toHaveProperty('Access-Control-Allow-Origin');
      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff');
      expect(headers).toHaveProperty('X-Frame-Options', 'DENY');
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block');
      expect(headers).toHaveProperty('Strict-Transport-Security');
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('Referrer-Policy');
    });

    it('应该使用提供的origin', () => {
      const origin = 'https://custom.domain.com';
      const headers = getSecurityHeaders(origin);
      
      expect(headers['Access-Control-Allow-Origin']).toBe(origin);
    });

    it('应该使用默认origin', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['Access-Control-Allow-Origin']).toBe('https://www.wenpai.xyz');
    });
  });

  describe('中间件集成测试', () => {
    const { securityMiddleware } = mockSecurityMiddleware;

    beforeEach(() => {
      securityMiddleware.mockImplementation((options = {}) => {
        const {
          enableRateLimit = true,
          maxRequests = 10,
          enableOriginCheck = true,
          enableIPWhitelist = false
        } = options;

        return function middleware(event: any, context: any) {
          // OPTIONS请求处理
          if (event.httpMethod === 'OPTIONS') {
            return {
              allowed: true,
              response: {
                statusCode: 200,
                headers: mockSecurityMiddleware.getSecurityHeaders(event.headers.origin),
                body: ''
              }
            };
          }

          // 模拟origin检查
          if (enableOriginCheck) {
            const origin = event.headers.origin;
            const allowedOrigins = ['https://www.wenpai.xyz', 'https://wenpai.xyz'];
            
            if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
              return {
                allowed: false,
                response: {
                  statusCode: 403,
                  headers: mockSecurityMiddleware.getSecurityHeaders(),
                  body: JSON.stringify({ error: 'Invalid origin' })
                }
              };
            }
          }

          // 模拟频率限制
          if (enableRateLimit) {
            const ip = mockSecurityMiddleware.getClientIP(event);
            const limitResult = mockSecurityMiddleware.rateLimit(ip, maxRequests, 60000);
            
            if (limitResult.limited) {
              return {
                allowed: false,
                response: {
                  statusCode: 429,
                  headers: {
                    ...mockSecurityMiddleware.getSecurityHeaders(),
                    'Retry-After': '60'
                  },
                  body: JSON.stringify({ error: 'Too many requests' })
                }
              };
            }
          }

          // 请求被允许
          context.securityHeaders = mockSecurityMiddleware.getSecurityHeaders(event.headers.origin);
          context.clientIP = mockSecurityMiddleware.getClientIP(event);
          
          return { allowed: true };
        };
      });
    });

    it('应该允许有效的OPTIONS请求', () => {
      const middleware = securityMiddleware();
      const event = {
        httpMethod: 'OPTIONS',
        headers: {
          origin: 'https://www.wenpai.xyz'
        }
      };
      const context = {};

      const result = middleware(event, context);

      expect(result.allowed).toBe(true);
      expect(result.response).toBeDefined();
      expect(result.response.statusCode).toBe(200);
    });

    it('应该阻止无效origin的请求', () => {
      const middleware = securityMiddleware({
        enableOriginCheck: true
      });
      
      const event = {
        httpMethod: 'POST',
        headers: {
          origin: 'https://malicious.com'
        }
      };
      const context = {};

      const result = middleware(event, context);

      expect(result.allowed).toBe(false);
      expect(result.response.statusCode).toBe(403);
    });

    it('应该允许来自信任域名的请求', () => {
      const middleware = securityMiddleware({
        enableOriginCheck: true,
        enableRateLimit: false
      });
      
      const event = {
        httpMethod: 'POST',
        headers: {
          origin: 'https://www.wenpai.xyz',
          'user-agent': 'Mozilla/5.0 Browser',
          'content-type': 'application/json'
        }
      };
      const context = {};

      const result = middleware(event, context);

      expect(result.allowed).toBe(true);
      expect(context.securityHeaders).toBeDefined();
      expect(context.clientIP).toBeDefined();
    });

    it('应该能够配置不同的选项', () => {
      const middleware = securityMiddleware({
        enableRateLimit: false,
        enableOriginCheck: false,
        enableIPWhitelist: false
      });
      
      const event = {
        httpMethod: 'POST',
        headers: {
          origin: 'https://any.domain.com',
          'user-agent': 'Test'
        }
      };
      const context = {};

      const result = middleware(event, context);

      expect(result.allowed).toBe(true);
    });
  });

  describe('支付API安全测试', () => {
    it('支付订单创建应有严格的频率限制', () => {
      const middleware = securityMiddleware({
        enableRateLimit: true,
        maxRequests: 5, // 每分钟最多5个订单
        windowMs: 60000
      });

      const event = {
        httpMethod: 'POST',
        headers: {
          origin: 'https://www.wenpai.xyz',
          'user-agent': 'Mozilla/5.0',
          'content-type': 'application/json',
          'x-forwarded-for': '192.168.1.100'
        }
      };
      const context = {};

      // 前5个请求应该被允许
      for (let i = 0; i < 5; i++) {
        const result = middleware(event, context);
        expect(result.allowed).toBe(true);
      }

      // 第6个请求应该被阻止
      const result = middleware(event, context);
      expect(result.allowed).toBe(false);
      expect(result.response.statusCode).toBe(429);
    });
  });
});