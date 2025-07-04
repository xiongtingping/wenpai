/**
 * 健康检查API
 * 返回简单的状态信息
 */
export default function handler(req: any, res: any) {
  try {
    res.status(200).json({
      status: 'ok',
      message: 'API服务正常运行',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
      timestamp: new Date().toISOString()
    });
  }
} 