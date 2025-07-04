import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // 检查环境变量
    const envCheck = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      DEEPSEEK_API_KEY: !!process.env.DEEPSEEK_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    };

    return res.status(200).json({
      success: true,
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      method: req.method,
      headers: req.headers
    });
  } catch (error) {
    console.error('Test API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Test API failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 