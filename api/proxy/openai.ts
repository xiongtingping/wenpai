import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const { messages, model = 'gpt-3.5-turbo-0125', temperature = 0.7 } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages in request body' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Missing OpenAI API key in environment variables');
    return res.status(500).json({ error: 'Missing OpenAI API key in environment variables' });
  }

  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  const requestBody = {
    model,
    messages,
    temperature,
    max_tokens: 2048
  };

  try {
    console.log('Making request to OpenAI API');
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('OpenAI API response status:', response.status);

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      const errData = isJson ? await response.json() : await response.text();
      console.error('OpenAI API error:', errData);
      return res.status(500).json({ error: 'OpenAI API error', detail: errData });
    }

    const data = await response.json();
    console.log('OpenAI API success response');
    return res.status(200).json({ success: true, data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Server error in OpenAI proxy:', errorMessage);
    return res.status(500).json({ error: 'Server error', detail: errorMessage });
  }
} 