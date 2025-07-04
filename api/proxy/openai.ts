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
    const { messages, model = 'gpt-4o', temperature = 0.7 } = req.body || {};
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing or invalid messages in request body' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ 
        success: false,
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in your environment variables'
      });
    }

    // 模拟响应
    return res.status(200).json({ 
      success: true, 
      data: {
        choices: [{
          message: {
            content: `[Simulated OpenAI response for model: ${model}] This is a simulated response. Please configure your API key to get real responses.`
          }
        }]
      },
      message: 'OpenAI proxy is working (simulated)'
    });
  } catch (error) {
    return res.status(200).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'OpenAI proxy encountered an error'
    });
  }
} 