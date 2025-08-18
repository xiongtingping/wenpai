/**
 * Netlify Function: 获取完整的Authing用户信息
 * 用于补全不完整的用户信息
 */

exports.handler = async (event, context) => {
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { access_token } = JSON.parse(event.body || '{}');
    
    if (!access_token) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing access_token' })
      };
    }

    // Authing配置
    const host = 'https://rzcswqs4sq0f.authing.cn';
    
    console.log('🔍 获取完整用户信息:', { hasAccessToken: !!access_token });
    
    // 调用Authing的用户信息接口
    const meUrl = `${host}/oidc/me`;
    const meResp = await fetch(meUrl, { 
      headers: { Authorization: `Bearer ${access_token}` } 
    });
    
    if (!meResp.ok) {
      console.error('❌ 用户信息获取失败:', {
        status: meResp.status,
        statusText: meResp.statusText,
        url: meUrl
      });
      
      return {
        statusCode: meResp.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Failed to fetch user info',
          status: meResp.status 
        })
      };
    }
    
    const userInfo = await meResp.json();
    
    console.log('✅ 完整用户信息获取成功:', {
      hasUserInfo: !!userInfo,
      availableFields: userInfo ? Object.keys(userInfo) : [],
      nickname: userInfo?.nickname,
      name: userInfo?.name,
      username: userInfo?.username,
      email: userInfo?.email,
      sub: userInfo?.sub
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        userInfo
      })
    };

  } catch (error) {
    console.error('❌ 获取用户信息异常:', error.message);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
