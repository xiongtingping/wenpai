/**
 * Netlify Function: 配置API
 * 提供应用配置信息
 */

exports.handler = async (event, context) => {
  // 处理CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { env } = event.queryStringParameters || {};
    
    // 基础配置
    const config = {
      environment: env || 'production',
      supabase: {
        url: process.env.VITE_SUPABASE_URL || 'https://weizkydylskcwgnaieqy.supabase.co',
        anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NjI0NzQsImV4cCI6MjA1MDUzODQ3NH0.Qs8-Ej-Ej-Ej-Ej-Ej-Ej-Ej-Ej-Ej-Ej-Ej-Ej-Ej'
      },
      authing: {
        appId: '68823897631e1ef8ff3720b2',
        host: 'https://rzcswqs4sq0f.authing.cn',
        redirectUri: 'https://www.wenpai.xyz/callback'
      },
      features: {
        enhancedPermissions: true,
        subscriptionCheck: true,
        usageLimits: true
      }
    };

    console.log('📋 配置请求:', { env, timestamp: new Date().toISOString() });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        config,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ 配置获取失败:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
