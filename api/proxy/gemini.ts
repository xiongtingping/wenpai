// File: api/proxy/gemini.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt in request body' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Gemini API key in environment variables' });
  }

  try {
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const contentType = geminiResponse.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!geminiResponse.ok) {
      const errData = isJson ? await geminiResponse.json() : await geminiResponse.text();
      return res.status(500).json({
        error: 'Gemini API error',
        detail: errData
      });
    }

    const data = await geminiResponse.json();
    return res.status(200).json({ result: data });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Server error',
      detail: err?.message || String(err)
    });
  }
}