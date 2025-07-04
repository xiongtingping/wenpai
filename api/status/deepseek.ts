import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
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

  // 最简单的响应，避免任何可能的错误
  return res.status(200).json({ 
    success: true, 
    available: false,
    error: 'DeepSeek API key not configured',
    message: 'Please configure DEEPSEEK_API_KEY in your environment variables',
    timestamp: new Date().toISOString()
  });
} 