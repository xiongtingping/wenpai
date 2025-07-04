module.exports = async function handler(req, res) {
  console.log('=== Minimal Test API ===');
  
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    return res.status(200).json({
      success: true,
      message: 'Minimal test API is working',
      timestamp: new Date().toISOString(),
      method: req.method,
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Error in minimal test:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 