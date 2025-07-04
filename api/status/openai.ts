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

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    return res.status(200).json({ 
      success: true, 
      available: !!apiKey,
      error: apiKey ? null : 'OpenAI API key not configured',
      message: apiKey ? 'OpenAI API key is configured' : 'Please configure OPENAI_API_KEY in your environment variables',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in OpenAI status check:', error);
    return res.status(200).json({ 
      success: false, 
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 