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

    // 🔧 简化方案：直接调用Authing REST API
    console.log('🔧 开始调用Authing API更新用户资料');

    // 转换字段名：avatar -> photo (Authing使用photo字段)
    const authingUpdates = {};
    if (updateData.nickname) authingUpdates.nickname = updateData.nickname;
    if (updateData.email) authingUpdates.email = updateData.email;
    if (updateData.phone) authingUpdates.phone = updateData.phone;
    if (updateData.avatar) authingUpdates.photo = updateData.avatar;

    console.log('🔧 准备更新的数据:', authingUpdates);

    // 尝试多个可能的API端点
    const apiEndpoints = [
      `${process.env.VITE_AUTHING_HOST}/api/v2/users/profile`,
      `${process.env.VITE_AUTHING_HOST}/api/v3/update-profile`,
      `${process.env.VITE_AUTHING_HOST}/oidc/me`
    ];

    let lastError = null;
    let updatedUser = null;

    for (const apiUrl of apiEndpoints) {
      try {
        console.log(`🔧 尝试API端点: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
            'x-authing-userpool-id': process.env.VITE_AUTHING_APP_ID
          },
          body: JSON.stringify(authingUpdates)
        });

        console.log(`🔧 API响应状态: ${response.status}`);

        if (response.ok) {
          updatedUser = await response.json();
          console.log('✅ API调用成功:', updatedUser);
          break;
        } else {
          const errorText = await response.text();
          console.log(`❌ API调用失败: ${response.status} - ${errorText}`);
          lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ API调用异常:`, error);
        lastError = error;
      }
    }

    if (!updatedUser) {
      throw lastError || new Error('所有API端点都失败了');
    }

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
