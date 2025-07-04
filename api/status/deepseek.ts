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

  return res.status(200).json({ 
    success: true, 
    available: false,
    error: 'DeepSeek API key not configured',
    message: 'Please configure DEEPSEEK_API_KEY in your environment variables',
    timestamp: new Date().toISOString()
  });
} 