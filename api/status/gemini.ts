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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing Gemini API key in environment variables');
    return res.status(500).json({ 
      success: false, 
      available: false,
      error: 'Missing Gemini API key in environment variables' 
    });
  }

  const startTime = Date.now();
  
  try {
    console.log('Checking Gemini API availability');
    
    // Make a simple request to Gemini API to check availability
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      console.log('Gemini API is available');
      return res.status(200).json({ 
        success: true, 
        available: true,
        responseTime
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ 
        success: false, 
        available: false,
        error: errorData.error?.message || `API error: ${response.status}`,
        responseTime
      });
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Error checking Gemini API status:', error);
    return res.status(500).json({ 
      success: false, 
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error checking API availability',
      responseTime
    });
  }
} 