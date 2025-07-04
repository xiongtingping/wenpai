import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    return res.status(200).json({
      success: true,
      message: 'Hello from Vercel Function!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: Object.keys(req.headers),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_REGION: process.env.VERCEL_REGION
      }
    });
  } catch (error) {
    console.error('Hello API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Hello API failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 