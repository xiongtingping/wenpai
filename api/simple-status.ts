/**
 * 简单状态检查API
 * 返回所有AI提供商的状态
 */
export default function handler(req, res) {
  try {
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

    const status = {
      success: true,
      providers: {
        openai: {
          available: false,
          error: 'API key not configured',
          message: 'Please configure OPENAI_API_KEY'
        },
        deepseek: {
          available: false,
          error: 'API key not configured', 
          message: 'Please configure DEEPSEEK_API_KEY'
        },
        gemini: {
          available: false,
          error: 'API key not configured',
          message: 'Please configure GEMINI_API_KEY'
        }
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 