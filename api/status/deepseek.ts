import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 仅允许 GET 方法
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ 
      status: 'error', 
      message: 'DeepSeek API key not configured',
      available: false 
    });
  }

  try {
    // 简单的API测试请求
    const response = await fetch('https://api.deepseek.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return res.status(200).json({ 
        status: 'success', 
        message: 'DeepSeek API is working',
        available: true 
      });
    } else {
      return res.status(200).json({ 
        status: 'error', 
        message: 'DeepSeek API test failed',
        available: false 
      });
    }
  } catch (error) {
    return res.status(200).json({ 
      status: 'error', 
      message: 'DeepSeek API connection failed',
      available: false 
    });
  }
} 