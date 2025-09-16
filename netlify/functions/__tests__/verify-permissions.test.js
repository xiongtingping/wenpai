/**
 * 后端权限验证端点测试用例
 * 🔒 安全修复：测试服务器端权限验证功能
 * 
 * 测试覆盖：
 * 1. JWT Token验证机制
 * 2. 用户权限检查逻辑
 * 3. 数据库查询和用户状态验证
 * 4. 错误处理和安全防护
 * 5. API请求和响应格式
 */

const { handler } = require('../verify-permissions');

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
};

// Mock createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_ISSUER = 'test-issuer';
process.env.JWT_AUDIENCE = 'test-audience';

describe('verify-permissions API 权限验证端点测试', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  describe('🌐 HTTP方法和CORS处理', () => {
    it('应该正确处理OPTIONS请求', async () => {
      const event = {
        httpMethod: 'OPTIONS',
        headers: {},
        body: ''
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(200);
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
      expect(result.headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization');
      expect(result.body).toBe('');
    });

    it('应该拒绝非POST请求', async () => {
      const event = {
        httpMethod: 'GET',
        headers: {},
        body: ''
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(405);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Method not allowed'
      });
    });
  });

  describe('🔐 JWT Token验证', () => {
    it('应该拒绝缺少Authorization头的请求', async () => {
      const event = {
        httpMethod: 'POST',
        headers: {},
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    });

    it('应该拒绝无效格式的Authorization头', async () => {
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: 'Invalid token'
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    });

    it('应该拒绝无效的JWT Token', async () => {
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: 'Bearer invalid.token.format'
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    });

    it('应该拒绝过期的JWT Token', async () => {
      // 创建一个过期的JWT token (简化版本，仅用于测试)
      const expiredPayload = {
        sub: 'test-user-123',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1小时前过期
        iss: 'test-issuer',
        aud: 'test-audience'
      };
      const encodedPayload = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');
      const expiredToken = `header.${encodedPayload}.signature`;

      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${expiredToken}`
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    });

    it('应该拒绝issuer不匹配的JWT Token', async () => {
      const wrongIssuerPayload = {
        sub: 'test-user-123',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
        iss: 'wrong-issuer',
        aud: 'test-audience'
      };
      const encodedPayload = Buffer.from(JSON.stringify(wrongIssuerPayload)).toString('base64');
      const wrongIssuerToken = `header.${encodedPayload}.signature`;

      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${wrongIssuerToken}`
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    });
  });

  describe('👤 用户数据库查询', () => {
    const createValidJWT = (payload = {}) => {
      const defaultPayload = {
        sub: 'test-user-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'test-issuer',
        aud: 'test-audience',
        ...payload
      };
      const encodedPayload = Buffer.from(JSON.stringify(defaultPayload)).toString('base64');
      return `header.${encodedPayload}.signature`;
    };

    it('应该成功查询存在的用户', async () => {
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        subscription_tier: 'pro',
        permissions: ['feature:creative-studio'],
        roles: ['user'],
        is_vip: false,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
      };

      // Mock Supabase query
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUser,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(200);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('id, email, subscription_tier, permissions, roles, is_vip, status, created_at');
      expect(mockEq).toHaveBeenCalledWith('id', 'test-user-123');

      const responseBody = JSON.parse(result.body);
      expect(responseBody.userId).toBe('test-user-123');
      expect(responseBody.userTier).toBe('pro');
    });

    it('应该拒绝不存在的用户', async () => {
      // Mock Supabase query returning no user
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Unauthorized',
        message: 'User not found'
      });
    });

    it('应该拒绝被暂停的用户', async () => {
      const suspendedUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        subscription_tier: 'pro',
        permissions: [],
        roles: ['user'],
        is_vip: false,
        status: 'suspended',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: suspendedUser,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Unauthorized',
        message: 'User account is suspended'
      });
    });

    it('应该处理数据库查询错误', async () => {
      // Mock Supabase query error
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Unauthorized',
        message: 'Database query failed'
      });
    });
  });

  describe('🛡️ 权限检查逻辑', () => {
    const setupMockUser = (tier = 'pro', isVip = false) => {
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        subscription_tier: tier,
        permissions: [],
        roles: ['user'],
        is_vip: isVip,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUser,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      return mockUser;
    };

    it('应该正确验证专业版用户权限', async () => {
      setupMockUser('pro');

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          permissions: ['tier:trial', 'tier:pro', 'feature:creative-studio'] 
        })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(200);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.allPermissionsGranted).toBe(true);
      expect(responseBody.results).toHaveLength(3);
      
      // 检查每个权限结果
      const results = responseBody.results;
      expect(results.find(r => r.permission === 'tier:trial').hasPermission).toBe(true);
      expect(results.find(r => r.permission === 'tier:pro').hasPermission).toBe(true);
      expect(results.find(r => r.permission === 'feature:creative-studio').hasPermission).toBe(true);
    });

    it('应该拒绝体验版用户访问专业版功能', async () => {
      setupMockUser('trial');

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          permissions: ['tier:pro', 'feature:creative-studio'] 
        })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(200);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.allPermissionsGranted).toBe(false);
      
      const proResult = responseBody.results.find(r => r.permission === 'tier:pro');
      expect(proResult.hasPermission).toBe(false);
      expect(proResult.reason).toContain('需要 pro 版本权限');
    });

    it('应该正确处理VIP用户', async () => {
      setupMockUser(null, true); // 无subscription_tier但是VIP

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          permissions: ['tier:pro', 'feature:creative-studio'] 
        })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(200);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.userTier).toBe('pro'); // VIP应该被识别为pro
      expect(responseBody.allPermissionsGranted).toBe(true);
    });

    it('应该拒绝未知的权限类型', async () => {
      setupMockUser('premium');

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          permissions: ['unknown:permission'] 
        })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(200);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.allPermissionsGranted).toBe(false);
      
      const unknownResult = responseBody.results.find(r => r.permission === 'unknown:permission');
      expect(unknownResult.hasPermission).toBe(false);
      expect(unknownResult.reason).toContain('未知的权限类型');
    });
  });

  describe('📝 请求体验证', () => {
    const setupMockUser = () => {
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        subscription_tier: 'pro',
        permissions: [],
        roles: ['user'],
        is_vip: false,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUser,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      return mockUser;
    };

    it('应该拒绝无效的JSON', async () => {
      setupMockUser();

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: 'invalid json'
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Invalid JSON in request body'
      });
    });

    it('应该拒绝缺少permissions数组的请求', async () => {
      setupMockUser();

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ other: 'data' })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Missing or invalid permissions array',
        message: 'Request body must contain a permissions array'
      });
    });

    it('应该拒绝permissions不是数组的请求', async () => {
      setupMockUser();

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: 'not-an-array' })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Missing or invalid permissions array',
        message: 'Request body must contain a permissions array'
      });
    });
  });

  describe('🚨 错误处理', () => {
    it('应该处理意外的服务器错误', async () => {
      // Mock一个会抛出异常的情况
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Unexpected server error');
      });

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Internal server error',
        message: 'Unexpected server error'
      });
    });

    it('应该记录安全审计日志', async () => {
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        subscription_tier: 'pro',
        permissions: [],
        roles: ['user'],
        is_vip: false,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUser,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      await handler(event, {});

      // 验证安全审计日志
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '✅ 用户验证成功:',
        expect.objectContaining({
          userId: 'test-user-123',
          email: 'test@example.com',
          tier: 'pro',
          timestamp: expect.any(String)
        })
      );

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '🔍 权限验证请求:',
        expect.objectContaining({
          userId: 'test-user-123',
          permissions: ['tier:pro'],
          userTier: 'pro'
        })
      );
    });
  });

  describe('🔒 安全性测试', () => {
    it('应该防止JWT注入攻击', async () => {
      const maliciousPayload = {
        sub: 'test-user-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'test-issuer',
        aud: 'test-audience',
        // 尝试注入恶意代码
        roles: ['admin", "super-admin'],
        permissions: ['*', 'all']
      };
      const encodedPayload = Buffer.from(JSON.stringify(maliciousPayload)).toString('base64');
      const maliciousToken = `header.${encodedPayload}.signature`;

      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        subscription_tier: 'trial',
        permissions: [],
        roles: ['user'],
        is_vip: false,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUser,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${maliciousToken}`
        },
        body: JSON.stringify({ permissions: ['tier:premium'] })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(200);
      const responseBody = JSON.parse(result.body);
      
      // 权限应该基于数据库中的真实用户数据，而不是JWT中的声明
      expect(responseBody.userTier).toBe('trial');
      expect(responseBody.allPermissionsGranted).toBe(false);
    });

    it('应该防止SQL注入攻击', async () => {
      const maliciousUserId = "'; DROP TABLE users; --";
      const maliciousPayload = {
        sub: maliciousUserId,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'test-issuer',
        aud: 'test-audience'
      };
      const encodedPayload = Buffer.from(JSON.stringify(maliciousPayload)).toString('base64');
      const maliciousToken = `header.${encodedPayload}.signature`;

      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${maliciousToken}`
        },
        body: JSON.stringify({ permissions: ['tier:pro'] })
      };

      const result = await handler(event, {});

      // 应该安全地处理恶意输入，Supabase客户端会自动防止SQL注入
      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Unauthorized',
        message: 'User not found'
      });
    });
  });

  describe('📊 响应格式验证', () => {
    it('应该返回正确的成功响应格式', async () => {
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        subscription_tier: 'premium',
        permissions: [],
        roles: ['user'],
        is_vip: false,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z'
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUser,
        error: null
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const token = createValidJWT();
      const event = {
        httpMethod: 'POST',
        headers: {
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          permissions: ['tier:trial', 'tier:pro', 'tier:premium'] 
        })
      };

      const result = await handler(event, {});

      expect(result.statusCode).toBe(200);
      expect(result.headers['Content-Type']).toBe('application/json');
      
      const responseBody = JSON.parse(result.body);
      expect(responseBody).toHaveProperty('userId', 'test-user-123');
      expect(responseBody).toHaveProperty('userTier', 'premium');
      expect(responseBody).toHaveProperty('allPermissionsGranted', true);
      expect(responseBody).toHaveProperty('results');
      expect(responseBody).toHaveProperty('verifiedAt');
      expect(Array.isArray(responseBody.results)).toBe(true);
      expect(responseBody.results).toHaveLength(3);

      // 验证每个权限结果的格式
      responseBody.results.forEach(result => {
        expect(result).toHaveProperty('permission');
        expect(result).toHaveProperty('hasPermission');
        expect(result).toHaveProperty('userTier');
        expect(result).toHaveProperty('requiredTier');
        expect(result).toHaveProperty('description');
      });
    });
  });

  const createValidJWT = (payload = {}) => {
    const defaultPayload = {
      sub: 'test-user-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'test-issuer',
      aud: 'test-audience',
      ...payload
    };
    const encodedPayload = Buffer.from(JSON.stringify(defaultPayload)).toString('base64');
    return `header.${encodedPayload}.signature`;
  };
});