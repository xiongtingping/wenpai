export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    
    return res.status(200).json({ 
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
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
      message: 'Status check API is working correctly'
    });
  } catch (error) {
    return res.status(200).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 