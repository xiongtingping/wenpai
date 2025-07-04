export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    
    const debugInfo = {
      success: true,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        openai: {
          configured: !!openaiKey,
          keyLength: openaiKey ? openaiKey.length : 0
        },
        deepseek: {
          configured: !!deepseekKey,
          keyLength: deepseekKey ? deepseekKey.length : 0
        },
        gemini: {
          configured: !!geminiKey,
          keyLength: geminiKey ? geminiKey.length : 0
        }
      },
      message: 'Debug API is working correctly'
    };
    
    return res.status(200).json(debugInfo);
  } catch (error) {
    return res.status(200).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 