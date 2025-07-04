export default function handler(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'Minimal test API is working',
    timestamp: new Date().toISOString()
  });
} 