// api/proxy/listModels.ts

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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ 
        success: false,
        error: 'Gemini API key not configured',
        message: 'Please configure GEMINI_API_KEY in your environment variables'
      });
    }

    // 模拟模型列表
    return res.status(200).json({
      success: true,
      data: {
        models: [
          { name: 'gemini-pro' },
          { name: 'gemini-pro-vision' }
        ]
      },
      message: 'Models list API is working (simulated)'
    });
  } catch (error) {
    return res.status(200).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Models list API encountered an error'
    });
  }
}