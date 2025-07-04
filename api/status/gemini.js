/**
 * Gemini状态检查API - 纯JavaScript版本
 */
module.exports = function handler(req, res) {
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

    const response = {
      success: true,
      available: false,
      error: 'Gemini API key not configured',
      message: 'Please configure GEMINI_API_KEY in your environment variables',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}; 