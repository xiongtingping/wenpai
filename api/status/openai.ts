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

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OpenAI API key in environment variables');
      return res.status(200).json({ 
        success: false, 
        available: false,
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in your environment variables'
      });
    }

    const startTime = Date.now();
    
    console.log('Checking OpenAI API availability');
    
    // Make a simple request to OpenAI API to check availability
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      console.log('OpenAI API is available');
      return res.status(200).json({ 
        success: true, 
        available: true,
        responseTime
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return res.status(200).json({ 
        success: false, 
        available: false,
        error: errorData.error?.message || `API error: ${response.status}`,
        responseTime
      });
    }
  } catch (error) {
    const responseTime = Date.now() - (Date.now() - 1000); // 估算响应时间
    console.error('Error checking OpenAI API status:', error);
    return res.status(200).json({ 
      success: false, 
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error checking API availability',
      responseTime
    });
  }
} 