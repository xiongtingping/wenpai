export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body || {};
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ 
        success: false,
        error: 'Gemini API key not configured',
        message: 'Please configure GEMINI_API_KEY in your environment variables'
      });
    }

    // 模拟响应
    return res.status(200).json({ 
      success: true, 
      data: {
        candidates: [{
          content: {
            parts: [{
              text: `[Simulated Gemini response] This is a simulated response. Please configure your API key to get real responses.`
            }]
          }
        }]
      },
      message: 'Gemini proxy is working (simulated)'
    });
  } catch (error) {
    return res.status(200).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Gemini proxy encountered an error'
    });
  }
}