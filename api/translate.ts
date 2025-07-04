import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 翻译API端点
 * 支持多种翻译服务，优先使用OpenAI，备用其他服务
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLang = 'en', sourceLang = 'zh' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // 优先使用OpenAI翻译
    const translatedText = await translateWithOpenAI(text, targetLang, sourceLang);
    
    return res.status(200).json({
      translatedText,
      sourceLang,
      targetLang,
      success: true
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      error: 'Translation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * 使用OpenAI进行翻译
 */
async function translateWithOpenAI(text: string, targetLang: string, sourceLang: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `请将以下${sourceLang === 'zh' ? '中文' : '英文'}文本翻译成${targetLang === 'en' ? '英文' : '中文'}，保持原文的语气和风格：

原文：${text}

翻译：`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的翻译助手，请准确翻译用户提供的内容。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const translatedText = data.choices?.[0]?.message?.content?.trim();
  
  if (!translatedText) {
    throw new Error('No translation received from OpenAI');
  }

  return translatedText;
}

// 备用翻译服务（Google Translate API）- 暂时未使用
// async function translateWithGoogle(text: string, targetLang: string, sourceLang: string): Promise<string> {
//   const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
//   
//   if (!googleApiKey) {
//     throw new Error('Google Translate API key not configured');
//   }

//   const url = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;
//   
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       q: text,
//       target: targetLang,
//       source: sourceLang
//     })
//   });

//   if (!response.ok) {
//     throw new Error('Google Translate API failed');
//   }

//   const data = await response.json();
//   return data.data?.translations?.[0]?.translatedText || text;
// } 