// 简单的测试函数 - CommonJS格式
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: '测试函数正常工作',
      timestamp: new Date().toISOString(),
      method: event.httpMethod
    })
  };
}; 