const { Creem } = require("creem");
const QRCode = require("qrcode");

/**
 * Netlify Creem 支付接口
 * @param {Object} event - Netlify 事件对象
 * @param {Object} context - Netlify 上下文对象
 * @returns {Promise<{statusCode: number, body: string}>}
 */
exports.handler = async function(event) {
  // 设置CORS头
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };

  // 处理预检请求（OPTIONS）
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  // 只允许POST请求
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const priceId = body.priceId;
    const productId = body.productId || body.priceId;
    const customerEmail = body.customerEmail;

    // 验证必需参数
    if (!priceId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "缺少必需的参数: priceId" })
      };
    }

    // 调试环境变量
    console.log('CREEM_API_KEY:', process.env.CREEM_API_KEY ? '已配置' : '未配置');

    // 获取API Key
    const creemApiKey = process.env.CREEM_API_KEY;
    if (!creemApiKey) {
      console.error('CREEM_API_KEY 未配置');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: '支付服务配置错误，请联系管理员' })
      };
    }

    console.log('开始创建支付检查点:', { priceId, productId, customerEmail });

    const creem = new Creem();
    
    // 调用Creem API创建支付检查点
    const checkout = await creem.createCheckout({
      createCheckoutRequest: {
        priceId: priceId,
        productId: productId,
        customerEmail: customerEmail || undefined
      },
      xApiKey: creemApiKey
    });
    
    console.log('Creem checkout 响应:', {
      id: checkout.id,
      status: checkout.status,
      amount: checkout.amount
    });
    
    // 尝试获取支付宝二维码URL
    let alipayQrCodeUrl = null;
    
    // 检查多种可能的支付宝二维码字段
    if (checkout.alipayQrCodeUrl) {
      alipayQrCodeUrl = checkout.alipayQrCodeUrl;
    } else if (checkout.alipay_qr_code_url) {
      alipayQrCodeUrl = checkout.alipay_qr_code_url;
    } else if (checkout.qrCodes && checkout.qrCodes.alipay) {
      alipayQrCodeUrl = checkout.qrCodes.alipay;
    } else if (checkout.checkoutUrl) {
      // 如果没有直接的支付宝二维码，使用支付页面URL生成二维码
      alipayQrCodeUrl = checkout.checkoutUrl;
    }
    
    // 生成二维码图片
    let qrCodeDataURL = null;
    if (alipayQrCodeUrl) {
      try {
        qrCodeDataURL = await QRCode.toDataURL(alipayQrCodeUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        });
        console.log('二维码生成成功');
      } catch (qrError) {
        console.error('生成二维码失败:', qrError);
        // 二维码生成失败不影响支付流程
      }
    }
    
    // 计算价格
    let price = null;
    if (checkout.amount) {
      if (typeof checkout.amount === 'number') {
        price = checkout.amount / 100;
      } else if (typeof checkout.amount === 'string') {
        price = parseFloat(checkout.amount) / 100;
      }
    }
    
    // 确保返回的数据结构符合前端期望
    const responseData = {
      success: true,
      url: checkout.checkoutUrl || checkout.url, // 保留原始支付链接
      qrCodeUrl: alipayQrCodeUrl, // 支付宝二维码URL
      qrCodeDataURL: qrCodeDataURL, // 二维码图片的DataURL
      price: price, // 价格
      checkout: checkout // 完整的checkout对象
    };
    
    console.log('支付检查点创建成功:', {
      id: checkout.id,
      price: price,
      hasQrCode: !!qrCodeDataURL,
      hasAlipayUrl: !!alipayQrCodeUrl
    });
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error('Creem createCheckout 调用失败:', error);
    
    // 提供更友好的错误信息
    let errorMessage = '支付服务暂时不可用，请稍后重试';
    if (error.message) {
      if (error.message.includes('API key')) {
        errorMessage = '支付服务配置错误，请联系管理员';
      } else if (error.message.includes('network')) {
        errorMessage = '网络连接失败，请检查网络设置';
      } else if (error.message.includes('price')) {
        errorMessage = '商品信息错误，请重新选择';
      }
    }
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};