const { Creem } = require("creem");
const QRCode = require("qrcode");

/**
 * Netlify Creem 支付接口
 * @param {Object} event - Netlify 事件对象
 * @param {Object} context - Netlify 上下文对象
 * @returns {Promise<{statusCode: number, body: string}>}
 */
exports.handler = async function(event) {
  // 处理预检请求（OPTIONS）
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = JSON.parse(event.body || "{}");
  const priceId = body.priceId;
  const productId = body.productId || body.priceId;
  const customerEmail = body.customerEmail;

  // 调试环境变量
  console.log('CREEM_API_KEY:', process.env.CREEM_API_KEY);

  // 临时硬编码 API Key 用于测试
  const creemApiKey = process.env.CREEM_API_KEY || 'creem_EGDvCS72OYrsU8ho7aJ1C';
  console.log('使用的 CREEM_API_KEY:', creemApiKey);

  // 检查 API Key 是否存在
  if (!creemApiKey) {
    console.error('CREEM_API_KEY 未配置');
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: 'CREEM_API_KEY 未配置' })
    };
  }

  const creem = new Creem();
  try {
    // 根据错误信息，Creem SDK 期望的参数结构是：
    // 第一个参数：包含 createCheckoutRequest 和 xApiKey 的对象
    const checkout = await creem.createCheckout({
      createCheckoutRequest: {
        priceId: priceId,
        productId: productId,
        customerEmail: customerEmail || undefined
      },
      xApiKey: creemApiKey
    });
    
    console.log('Creem checkout 响应:', checkout);
    
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
      } catch (qrError) {
        console.error('生成二维码失败:', qrError);
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
      hasQrCode: !!qrCodeDataURL
    });
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error('Creem createCheckout 调用失败:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: error.message || "创建支付失败", 
        details: error, 
        stack: error.stack || String(error)
      })
    };
  }
};