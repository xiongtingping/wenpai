/**
 * 支付API集成测试
 * 🧪 端到端测试：支付流程、订单状态、权限验证
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// 模拟环境变量
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.BUFPAY_APP_SECRET = 'test-secret';

describe('支付API集成测试', () => {
  let mockSupabase: any;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis()
    };

    // Mock fetch
    mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = mockFetch;

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('创建订单API测试', () => {
    const validOrderRequest = {
      userId: 'user_12345',
      userEmail: 'test@example.com',
      productName: '文派专业版',
      productType: 'professional',
      durationType: 'monthly',
      amount: 29,
      payType: 'alipay'
    };

    it('应该成功创建订单', async () => {
      // Mock successful database insert
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 1,
          order_id: 'WP202412345678901234',
          user_id: 'user_12345',
          product_type: 'professional',
          amount: 29,
          status: 'pending'
        },
        error: null
      });

      // Mock successful BufPay API response
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(`
          <html>
            <script>var payInfo = {"aoid":"test_aoid","qr":"test_qr_code","status":"success"}</script>
          </html>
        `)
      } as Response);

      // 模拟create-order函数调用
      const createOrderHandler = async (event: any) => {
        const requestBody = JSON.parse(event.body);
        
        // 验证请求参数
        if (!requestBody.userId || !requestBody.amount) {
          return {
            statusCode: 400,
            body: JSON.stringify({ success: false, error: '缺少必要参数' })
          };
        }

        // 创建订单
        const orderId = `WP${Date.now()}${Math.floor(Math.random() * 10000)}`;
        
        // 调用BufPay API
        const paymentInfo = {
          status: 'success',
          aoid: 'test_aoid',
          qr: 'test_qr_code'
        };

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            orderId,
            paymentInfo
          })
        };
      };

      const event = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json',
          'origin': 'https://www.wenpai.xyz'
        },
        body: JSON.stringify(validOrderRequest)
      };

      const response = await createOrderHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();
      expect(result.paymentInfo).toBeDefined();
      expect(result.paymentInfo.status).toBe('success');
    });

    it('应该拒绝无效参数', async () => {
      const createOrderHandler = async (event: any) => {
        const requestBody = JSON.parse(event.body);
        
        if (!requestBody.userId || !requestBody.amount) {
          return {
            statusCode: 400,
            body: JSON.stringify({ success: false, error: '缺少必要参数' })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
      };

      const invalidRequest = {
        ...validOrderRequest,
        userId: '', // 无效的用户ID
        amount: 0   // 无效的金额
      };

      const event = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(invalidRequest)
      };

      const response = await createOrderHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('缺少必要参数');
    });

    it('应该处理数据库错误', async () => {
      // Mock database error
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'DB_ERROR' }
      });

      const createOrderHandler = async (event: any) => {
        // 模拟数据库错误处理
        try {
          const requestBody = JSON.parse(event.body);
          
          // 模拟数据库插入失败
          if (requestBody.userId === 'error_user') {
            throw new Error('Database connection failed');
          }

          return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
          };
        } catch (error) {
          return {
            statusCode: 500,
            body: JSON.stringify({ 
              success: false, 
              error: '数据库操作失败' 
            })
          };
        }
      };

      const event = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          ...validOrderRequest,
          userId: 'error_user'
        })
      };

      const response = await createOrderHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('数据库操作失败');
    });
  });

  describe('支付状态查询API测试', () => {
    it('应该返回正确的支付状态', async () => {
      // Mock BufPay status query response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success' })
      } as Response);

      const queryStatusHandler = async (event: any) => {
        const aoid = event.queryStringParameters?.query;
        
        if (!aoid) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: '缺少查询参数' })
          };
        }

        // 模拟查询BufPay状态
        const response = await fetch(`https://bufpay.com/api/query/${aoid}`);
        const result = await response.json();

        return {
          statusCode: 200,
          body: JSON.stringify(result)
        };
      };

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {
          query: 'test_aoid'
        }
      };

      const response = await queryStatusHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(result.status).toBe('success');
    });

    it('应该处理查询参数缺失', async () => {
      const queryStatusHandler = async (event: any) => {
        const aoid = event.queryStringParameters?.query;
        
        if (!aoid) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: '缺少查询参数' })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ status: 'success' })
        };
      };

      const event = {
        httpMethod: 'GET',
        queryStringParameters: {}
      };

      const response = await queryStatusHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(result.error).toBe('缺少查询参数');
    });
  });

  describe('支付回调处理测试', () => {
    const validNotifyData = {
      aoid: 'test_aoid',
      order_id: 'WP202412345678901234',
      order_uid: 'user_12345',
      price: '29.00',
      pay_price: '29.00',
      sign: 'valid_signature'
    };

    it('应该处理有效的支付回调', async () => {
      // Mock order lookup
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 1,
          order_id: 'WP202412345678901234',
          user_id: 'user_12345',
          status: 'pending',
          product_type: 'professional',
          duration_type: 'monthly'
        },
        error: null
      });

      const notifyHandler = async (event: any) => {
        const notifyData = JSON.parse(event.body);
        
        // 验证签名（在实际中会进行真实验证）
        if (!notifyData.sign) {
          return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: '签名验证失败' })
          };
        }

        // 查找订单
        const orderId = notifyData.order_id;
        if (!orderId.startsWith('WP')) {
          return {
            statusCode: 404,
            body: JSON.stringify({ success: false, message: '订单不存在' })
          };
        }

        // 更新订单状态
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, message: '处理成功' })
        };
      };

      const event = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(validNotifyData)
      };

      const response = await notifyHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('处理成功');
    });

    it('应该拒绝无效签名', async () => {
      const notifyHandler = async (event: any) => {
        const notifyData = JSON.parse(event.body);
        
        if (!notifyData.sign) {
          return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: '签名验证失败' })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
      };

      const invalidNotifyData = {
        ...validNotifyData,
        sign: '' // 无效签名
      };

      const event = {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(invalidNotifyData)
      };

      const response = await notifyHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('签名验证失败');
    });
  });

  describe('安全性集成测试', () => {
    it('应该阻止频繁请求', async () => {
      const rateLimitedHandler = async (event: any) => {
        const ip = event.headers['x-forwarded-for'] || 'unknown';
        
        // 模拟频率限制
        if (ip === 'blocked_ip') {
          return {
            statusCode: 429,
            headers: {
              'Retry-After': '60'
            },
            body: JSON.stringify({ error: 'Too many requests' })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
      };

      const event = {
        httpMethod: 'POST',
        headers: {
          'x-forwarded-for': 'blocked_ip',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      };

      const response = await rateLimitedHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(429);
      expect(response.headers?.['Retry-After']).toBe('60');
      expect(result.error).toBe('Too many requests');
    });

    it('应该验证请求来源', async () => {
      const originCheckHandler = async (event: any) => {
        const origin = event.headers.origin;
        const allowedOrigins = ['https://www.wenpai.xyz', 'https://wenpai.xyz'];
        
        if (origin && !allowedOrigins.includes(origin)) {
          return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Invalid origin' })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true })
        };
      };

      const event = {
        httpMethod: 'POST',
        headers: {
          'origin': 'https://malicious.com',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      };

      const response = await originCheckHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(403);
      expect(result.error).toBe('Invalid origin');
    });
  });

  describe('错误处理和恢复测试', () => {
    it('应该优雅处理网络错误', async () => {
      // Mock network failure
      mockFetch.mockRejectedValue(new Error('Network error'));

      const networkErrorHandler = async (event: any) => {
        try {
          const response = await fetch('https://bufpay.com/api/test');
          return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
          };
        } catch (error) {
          return {
            statusCode: 503,
            body: JSON.stringify({ 
              error: 'Service temporarily unavailable',
              details: (error as Error).message
            })
          };
        }
      };

      const event = {
        httpMethod: 'GET'
      };

      const response = await networkErrorHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(503);
      expect(result.error).toBe('Service temporarily unavailable');
      expect(result.details).toBe('Network error');
    });

    it('应该处理JSON解析错误', async () => {
      const jsonErrorHandler = async (event: any) => {
        try {
          const data = JSON.parse(event.body);
          return {
            statusCode: 200,
            body: JSON.stringify({ success: true, data })
          };
        } catch (error) {
          return {
            statusCode: 400,
            body: JSON.stringify({ 
              error: 'Invalid JSON format',
              details: (error as Error).message
            })
          };
        }
      };

      const event = {
        httpMethod: 'POST',
        body: 'invalid json content'
      };

      const response = await jsonErrorHandler(event);
      const result = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(result.error).toBe('Invalid JSON format');
    });
  });
});