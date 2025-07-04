import type { VercelRequest, VercelResponse } from '@vercel/node';

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== OpenAI Proxy Debug Start ===');
  console.log('req.method:', req.method);
  console.log('req.headers:', JSON.stringify(req.headers, null, 2));
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 仅允许 POST 方法
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model = 'gpt-4o-mini', temperature = 0.7 } = req.body || {};
    
    console.log('Parsed request body:', { messages, model, temperature });
    
    if (!messages || !Array.isArray(messages)) {
      console.error('Missing or invalid messages in request body', req.body);
      return res.status(400).json({ error: 'Missing or invalid messages in request body' });
    }

    // 验证模型权限
    const userPlan = req.headers['x-user-plan'] || 'free'; // 从请求头获取用户计划
    const allowedModels = {
      free: ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
      pro: ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-4.5']
    };
    
    const userAllowedModels = allowedModels[userPlan as keyof typeof allowedModels] || allowedModels.free;
    if (!userAllowedModels.includes(model)) {
      return res.status(403).json({ 
        error: 'Model not allowed for your plan', 
        detail: `Free users can only use: ${allowedModels.free.join(', ')}. Pro users can use: ${allowedModels.pro.join(', ')}` 
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    console.log('OPENAI_API_KEY exists:', !!apiKey);
    if (!apiKey) {
      console.error('Missing OpenAI API key in environment variables');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured', 
        detail: 'Please configure OPENAI_API_KEY in your environment variables' 
      });
    }

    console.log('Making request to OpenAI API...');
    
    const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens: 2048
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('OpenAI API response status:', response.status);
    console.log('OpenAI API response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      
      let errorData;
      try {
        errorData = isJson ? await response.json() : await response.text();
      } catch (parseError) {
        errorData = `Failed to parse error response: ${parseError}`;
      }
      
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ error: 'OpenAI API error', detail: errorData });
    }

    const data = await response.json();
    console.log('OpenAI API success response received');
    return res.status(200).json({ success: true, data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Server error in OpenAI proxy:', errorMessage);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    return res.status(500).json({ 
      error: 'Server error', 
      detail: errorMessage,
      message: 'A server error has occurred. Please try again later.'
    });
  }
} 