/**
 * 基本API - 纯JavaScript版本
 * 避免任何TypeScript相关问题
 */
module.exports = function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    const response = {
      success: true,
      message: 'Basic API is working',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
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