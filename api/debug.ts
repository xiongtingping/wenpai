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
    // 检查环境变量
    const openaiKey = process.env.OPENAI_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    
    const debugInfo = {
      success: true,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(Object.entries(req.headers).filter(([key]) => 
        !key.toLowerCase().includes('authorization') && 
        !key.toLowerCase().includes('cookie')
      )),
      body: req.body ? 'Body present' : 'No body',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        openai: {
          configured: !!openaiKey,
          keyLength: openaiKey ? openaiKey.length : 0,
          keyPrefix: openaiKey ? openaiKey.substring(0, 10) + '...' : 'N/A'
        },
        deepseek: {
          configured: !!deepseekKey,
          keyLength: deepseekKey ? deepseekKey.length : 0,
          keyPrefix: deepseekKey ? deepseekKey.substring(0, 10) + '...' : 'N/A'
        },
        gemini: {
          configured: !!geminiKey,
          keyLength: geminiKey ? geminiKey.length : 0,
          keyPrefix: geminiKey ? geminiKey.substring(0, 10) + '...' : 'N/A'
        }
      },
      message: 'Debug API is working correctly'
    };
    
    return res.status(200).json(debugInfo);
  } catch (error) {
    console.error('Error in debug API:', error);
    return res.status(200).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      message: 'Debug API encountered an error'
    });
  }
} 