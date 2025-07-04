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
    const { text, targetLang = 'en', sourceLang = 'zh' } = req.body || {};

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // 简单的模拟翻译
    const translatedText = `[Translated] ${text}`;
    
    return res.status(200).json({
      translatedText,
      sourceLang,
      targetLang,
      success: true,
      message: 'Translation API is working (simulated)'
    });

  } catch (error) {
    return res.status(200).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Translation API encountered an error'
    });
  }
} 