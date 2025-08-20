/**
 * 🔧 根本修复：通过Netlify Functions使用REST API更新用户资料
 * 解决客户端"普通用户不能直接修改字段"的权限问题
 */
exports.handler = async (event, context) => {
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

    // 🔧 真正的Authing API调用
    console.log('🔧 开始处理用户资料更新请求');
    console.log('🔧 请求数据:', updateData);

    // Authing配置
    const AUTHING_APP_ID = '68823897631e1ef8ff3720b2';
    const AUTHING_HOST = 'https://rzcswqs4sq0f.authing.cn';

    // 首先验证用户token并获取用户ID
    let userId = null;
    try {
      const verifyResponse = await fetch(`${AUTHING_HOST}/api/v2/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!verifyResponse.ok) {
        throw new Error(`Token验证失败: ${verifyResponse.status}`);
      }

      const userInfo = await verifyResponse.json();
      userId = userInfo.id;
      console.log('✅ 用户token验证成功:', userId);
    } catch (error) {
      console.error('❌ 用户token验证失败:', error);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: '用户认证失败' })
      };
    }

    // 调用Authing API更新用户资料
    try {
      const updateResponse = await fetch(`${AUTHING_HOST}/api/v2/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname: updateData.nickname,
          email: updateData.email,
          phone: updateData.phone,
          photo: updateData.avatar
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.text();
        throw new Error(`Authing API更新失败: ${updateResponse.status} - ${errorData}`);
      }

      const updatedUser = await updateResponse.json();
      console.log('✅ Authing API更新用户资料成功:', updatedUser);

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
      console.error('❌ Authing API调用失败:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: `Authing API调用失败: ${error.message}`
        })
      };
    }

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
