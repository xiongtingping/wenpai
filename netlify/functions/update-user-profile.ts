import { Handler } from '@netlify/functions';

/**
 * 🔧 根本修复：通过Netlify Functions使用Management API更新用户资料
 * 解决客户端"普通用户不能直接修改字段"的权限问题
 */
export const handler: Handler = async (event, context) => {
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 获取用户token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: '未提供有效的认证token' })
      };
    }

    const userToken = authHeader.replace('Bearer ', '');
    
    // 解析请求体
    const updateData = JSON.parse(event.body || '{}');
    
    // 验证必要字段
    if (!updateData || typeof updateData !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '无效的请求数据' })
      };
    }

    // 🔧 更简单的解决方案：直接调用Authing REST API
    // 使用用户的token调用Authing的用户资料更新端点

    // 转换字段名：avatar -> photo (Authing使用photo字段)
    const authingUpdates = {
      nickname: updateData.nickname,
      email: updateData.email,
      phone: updateData.phone,
      photo: updateData.avatar || updateData.photo
    };

    // 移除空值
    Object.keys(authingUpdates).forEach(key => {
      if (authingUpdates[key] === undefined || authingUpdates[key] === null) {
        delete authingUpdates[key];
      }
    });

    // 直接调用Authing REST API更新用户资料
    const authingApiUrl = `${process.env.VITE_AUTHING_HOST}/api/v2/users/profile`;

    const response = await fetch(authingApiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'x-authing-userpool-id': process.env.VITE_AUTHING_APP_ID
      },
      body: JSON.stringify(authingUpdates)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const updatedUser = await response.json();

    console.log('✅ Management API更新用户资料成功:', {
      userId: currentUser.id,
      updates: authingUpdates,
      result: updatedUser
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        user: updatedUser
      })
    };

  } catch (error) {
    console.error('❌ 更新用户资料失败:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误'
      })
    };
  }
};
